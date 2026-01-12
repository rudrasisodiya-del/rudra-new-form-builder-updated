import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: {
    formId: string;
    formTitle: string;
    submissionId: string;
    submissionData: any;
  };
}

// Generate HMAC signature for webhook payload
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Dispatch webhooks for a form submission
export async function dispatchWebhooks(
  formId: string,
  formTitle: string,
  submissionId: string,
  submissionData: any
): Promise<void> {
  try {
    // Find all active webhooks for this form or global webhooks (formId is null)
    const webhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
        OR: [
          { formId: formId },
          { formId: null }
        ],
        events: {
          has: 'form.submitted'
        }
      }
    });

    if (webhooks.length === 0) {
      console.log(`No webhooks configured for form ${formId}`);
      return;
    }

    const payload: WebhookPayload = {
      event: 'form.submitted',
      timestamp: new Date().toISOString(),
      data: {
        formId,
        formTitle,
        submissionId,
        submissionData
      }
    };

    const payloadString = JSON.stringify(payload);

    // Dispatch to each webhook
    for (const webhook of webhooks) {
      dispatchSingleWebhook(webhook, payloadString, payload).catch(err => {
        console.error(`Failed to dispatch webhook ${webhook.id}:`, err);
      });
    }
  } catch (error) {
    console.error('Error dispatching webhooks:', error);
  }
}

// Dispatch a single webhook with retry logic
async function dispatchSingleWebhook(
  webhook: any,
  payloadString: string,
  payload: WebhookPayload,
  retryCount: number = 0
): Promise<void> {
  const maxRetries = 3;
  const startTime = Date.now();

  try {
    // Generate signature if secret exists
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': payload.event,
      'X-Webhook-Timestamp': payload.timestamp,
      'X-Webhook-Id': webhook.id,
    };

    if (webhook.secret) {
      headers['X-Webhook-Signature'] = generateSignature(payloadString, webhook.secret);
    }

    // Make HTTP request
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const responseBody = await response.text();
    let responseJson;
    try {
      responseJson = JSON.parse(responseBody);
    } catch {
      responseJson = { raw: responseBody };
    }

    const success = response.ok;

    // Log the webhook dispatch
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: payload.event,
        payload: payload as any,
        response: responseJson,
        statusCode: response.status,
        success,
        error: success ? null : `HTTP ${response.status}: ${response.statusText}`,
      }
    });

    // Update webhook last triggered
    await prisma.webhook.update({
      where: { id: webhook.id },
      data: { lastTriggered: new Date() }
    });

    if (success) {
      console.log(`Webhook ${webhook.id} dispatched successfully to ${webhook.url}`);
    } else if (retryCount < maxRetries) {
      // Retry with exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Webhook ${webhook.id} failed, retrying in ${delay}ms...`);
      setTimeout(() => {
        dispatchSingleWebhook(webhook, payloadString, payload, retryCount + 1);
      }, delay);
    } else {
      console.error(`Webhook ${webhook.id} failed after ${maxRetries} retries`);
    }
  } catch (error: any) {
    // Log the error
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: payload.event,
        payload: payload as any,
        response: {},
        statusCode: 0,
        success: false,
        error: error.message || 'Unknown error',
      }
    });

    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Webhook ${webhook.id} error, retrying in ${delay}ms...`);
      setTimeout(() => {
        dispatchSingleWebhook(webhook, payloadString, payload, retryCount + 1);
      }, delay);
    } else {
      console.error(`Webhook ${webhook.id} failed after ${maxRetries} retries:`, error.message);
    }
  }
}

// Test webhook endpoint
export async function testWebhook(webhookId: string): Promise<{ success: boolean; message: string; statusCode?: number }> {
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId }
    });

    if (!webhook) {
      return { success: false, message: 'Webhook not found' };
    }

    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        formId: 'test-form-id',
        formTitle: 'Test Form',
        submissionId: 'test-submission-id',
        submissionData: {
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test webhook payload'
        }
      }
    };

    const payloadString = JSON.stringify(testPayload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': 'webhook.test',
      'X-Webhook-Timestamp': testPayload.timestamp,
      'X-Webhook-Id': webhook.id,
    };

    if (webhook.secret) {
      headers['X-Webhook-Signature'] = generateSignature(payloadString, webhook.secret);
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout for test
    });

    const responseBody = await response.text();
    let responseJson;
    try {
      responseJson = JSON.parse(responseBody);
    } catch {
      responseJson = { raw: responseBody };
    }

    // Log the test
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: 'webhook.test',
        payload: testPayload as any,
        response: responseJson,
        statusCode: response.status,
        success: response.ok,
        error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
      }
    });

    if (response.ok) {
      return { success: true, message: 'Webhook test successful', statusCode: response.status };
    } else {
      return { success: false, message: `Webhook returned ${response.status}: ${response.statusText}`, statusCode: response.status };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to send test webhook' };
  }
}
