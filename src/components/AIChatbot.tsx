import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your Pabbly Forms assistant. I can help you with questions about our features, pricing, integrations, and more. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const knowledgeBase = {
    pricing: {
      free: 'Free plan includes 5 forms, 100 submissions/month, basic form fields, email notifications, CSV export, and community support.',
      pro: 'Pro plan costs $29/month and includes unlimited forms, 10,000 submissions/month, webhooks & API, custom branding, file uploads (100MB), advanced analytics, integrations, and priority support.',
      business: 'Business plan costs $99/month and includes unlimited forms, 100,000 submissions/month, file uploads (1GB), advanced workflows, custom domain, SSO authentication, dedicated account manager, and SLA guarantee.'
    },
    features: {
      formBuilder: 'Our drag-and-drop form builder supports 10 field types: text, email, textarea, number, phone, dropdown, checkbox, radio, date, and file upload.',
      webhooks: 'Webhooks allow you to send form submissions to any endpoint in real-time. Each webhook includes a secret for verification.',
      api: 'Our REST API allows programmatic access to forms, submissions, and webhooks. All API requests require an API key in the Authorization header.',
      integrations: 'We support integrations with Google Sheets, Slack, Mailchimp, Zapier, Dropbox, Google Drive, Airtable, Stripe, PayPal, HubSpot, and Salesforce.',
      analytics: 'Track form views, submission counts, conversion rates, and detailed submission analytics for each form.',
      sharing: 'Share forms via direct link, embed code for websites, or social media platforms like Twitter, Facebook, and LinkedIn.'
    },
    howTo: {
      createForm: 'To create a form: 1) Go to Dashboard, 2) Click "Create Form", 3) Use the drag-and-drop builder to add fields, 4) Save and publish your form.',
      addWebhook: 'To add a webhook: 1) Go to Webhooks page, 2) Click "Create Webhook", 3) Enter your endpoint URL, 4) Select events to listen for, 5) Save.',
      viewSubmissions: 'To view submissions: Go to Submissions page, select your form from the dropdown, and view/export all submissions.',
      shareForm: 'To share a form: 1) Publish the form, 2) Go to Share page, 3) Copy the direct link or embed code, or share on social media.',
      upgradeplan: 'To upgrade your plan: Go to Pricing page, select your desired plan, and complete the checkout process. You can also upgrade from Settings.'
    }
  };

  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Pricing queries
    if (lowerMessage.includes('price') || lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
      if (lowerMessage.includes('free')) {
        return `**Free Plan:**\n${knowledgeBase.pricing.free}\n\nWould you like to know about our other plans?`;
      } else if (lowerMessage.includes('pro')) {
        return `**Pro Plan:**\n${knowledgeBase.pricing.pro}\n\nThis is our most popular plan for growing businesses.`;
      } else if (lowerMessage.includes('business') || lowerMessage.includes('enterprise')) {
        return `**Business Plan:**\n${knowledgeBase.pricing.business}\n\nPerfect for large organizations with advanced needs.`;
      }
      return `We offer three plans:\n\n**Free** - $0/month: ${knowledgeBase.pricing.free}\n\n**Pro** - $29/month: ${knowledgeBase.pricing.pro}\n\n**Business** - $99/month: ${knowledgeBase.pricing.business}\n\nWhich plan interests you?`;
    }

    // Feature queries
    if (lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('capabilities')) {
      return `Pabbly Forms offers:\n\n• **Form Builder**: ${knowledgeBase.features.formBuilder}\n• **Webhooks**: ${knowledgeBase.features.webhooks}\n• **API Access**: ${knowledgeBase.features.api}\n• **Integrations**: ${knowledgeBase.features.integrations}\n• **Analytics**: ${knowledgeBase.features.analytics}\n• **Sharing**: ${knowledgeBase.features.sharing}\n\nWhat would you like to know more about?`;
    }

    // Webhook queries
    if (lowerMessage.includes('webhook')) {
      if (lowerMessage.includes('how') || lowerMessage.includes('create') || lowerMessage.includes('setup')) {
        return `**Setting up Webhooks:**\n${knowledgeBase.howTo.addWebhook}\n\n${knowledgeBase.features.webhooks}\n\nNeed help with webhook security?`;
      }
      return knowledgeBase.features.webhooks;
    }

    // API queries
    if (lowerMessage.includes('api')) {
      return `**API Access:**\n${knowledgeBase.features.api}\n\nYou can find your API key in the API Keys page. Available endpoints include:\n• GET /api/forms - Get all forms\n• GET /api/forms/:id - Get specific form\n• POST /api/forms - Create form\n• GET /api/submissions - Get submissions\n\nWould you like to know about rate limits?`;
    }

    // Integration queries
    if (lowerMessage.includes('integration') || lowerMessage.includes('integrate') || lowerMessage.includes('connect')) {
      return `**Integrations:**\n${knowledgeBase.features.integrations}\n\nYou can manage integrations from the Integration page. Popular integrations include Google Sheets for automatic data sync and Slack for real-time notifications.\n\nWhich integration are you interested in?`;
    }

    // How-to queries
    if (lowerMessage.includes('how to create') || lowerMessage.includes('how do i create')) {
      return `**Creating a Form:**\n${knowledgeBase.howTo.createForm}\n\nOur drag-and-drop builder makes it easy to create professional forms in minutes!`;
    }

    if (lowerMessage.includes('submission') && (lowerMessage.includes('view') || lowerMessage.includes('see'))) {
      return `**Viewing Submissions:**\n${knowledgeBase.howTo.viewSubmissions}\n\nYou can also export submissions to CSV for analysis.`;
    }

    if (lowerMessage.includes('share') && (lowerMessage.includes('how') || lowerMessage.includes('embed'))) {
      return `**Sharing Forms:**\n${knowledgeBase.howTo.shareForm}\n\nYou can share via direct link, embed on your website, or share on social media platforms.`;
    }

    if (lowerMessage.includes('upgrade')) {
      return `**Upgrading Your Plan:**\n${knowledgeBase.howTo.upgradeplan}\n\nUpgrading gives you access to more forms, submissions, and advanced features. Would you like to see our pricing?`;
    }

    // Form builder queries
    if (lowerMessage.includes('form builder') || lowerMessage.includes('field type')) {
      return `**Form Builder:**\n${knowledgeBase.features.formBuilder}\n\nYou can customize each field with labels, placeholders, and validation rules. Try our drag-and-drop builder now!`;
    }

    // Analytics queries
    if (lowerMessage.includes('analytics') || lowerMessage.includes('track') || lowerMessage.includes('stat')) {
      return `**Analytics & Tracking:**\n${knowledgeBase.features.analytics}\n\nView real-time analytics for each form including views, submissions, and conversion rates.`;
    }

    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! How can I assist you with Pabbly Forms today? I can help with pricing, features, integrations, or any questions you have!';
    }

    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'You\'re welcome! Feel free to ask if you have any other questions about Pabbly Forms.';
    }

    // Default response
    return `I can help you with:\n\n• **Pricing** - Learn about our Free, Pro, and Business plans\n• **Features** - Form builder, webhooks, API, integrations, analytics\n• **How-to guides** - Creating forms, viewing submissions, setting up webhooks\n• **Integrations** - Connecting with Google, Slack, Stripe, and more\n\nWhat would you like to know?`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const response = getResponse(input);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all z-50"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Pabbly Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Pabbly AI
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
