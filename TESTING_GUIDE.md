# Pabbly Forms - Testing Guide

This guide will help you test all features of the Pabbly Forms application.

## Prerequisites

Before testing, ensure:
1. PostgreSQL database is running
2. Backend server is running on http://localhost:5000
3. Frontend is running on http://localhost:5173
4. Database migrations have been applied

## Quick Start Testing

### 1. Test Authentication Flow

**Sign Up:**
1. Navigate to http://localhost:5173/signup
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
   - Company: Test Company
3. Click "Sign Up"
4. You should be redirected to the dashboard
5. Check localStorage for `token` - it should be set

**Log Out:**
1. Click "Logout" in the sidebar
2. You should be redirected to home page
3. localStorage should be cleared

**Log In:**
1. Navigate to http://localhost:5173/login
2. Enter:
   - Email: test@example.com
   - Password: Test123!
3. Click "Login"
4. You should be redirected to dashboard

### 2. Test Dashboard

**View Dashboard:**
1. After login, you should see the Dashboard page
2. Verify the following sections appear:
   - Welcome message with your name
   - Stats cards (Forms, Submissions, Views)
   - Quick Actions section
   - Current Plan card

**Navigate Sidebar:**
1. Test all sidebar links:
   - Dashboard
   - My Forms
   - Submissions
   - Analytics
   - Share
   - Settings
   - Integration
   - API Keys
   - Webhooks
   - Pricing

### 3. Test Form Builder

**Create a New Form:**
1. Go to "My Forms"
2. Click "Create Form"
3. You should see the form builder interface

**Add Fields:**
1. Click on each field type in the left sidebar:
   - Text
   - Email
   - Textarea
   - Number
   - Phone
   - Dropdown
   - Checkbox
   - Radio
   - Date
   - File
2. Each field should appear in the center canvas
3. Verify you can remove fields by clicking the ✕ button

**Save Form:**
1. Enter a form title (e.g., "Contact Form")
2. Enter a description (e.g., "Get in touch with us")
3. Click "Save"
4. Check for success message
5. The URL should update with the form ID

**Publish Form:**
1. Click "Publish" button
2. Check for success message
3. Form status should change to PUBLISHED

### 4. Test My Forms Page

**View Forms List:**
1. Go to "My Forms"
2. You should see your created form(s)
3. Each form card should show:
   - Title
   - Status (Draft/Published)
   - Submission count
   - View count
   - Created date

**Edit Form:**
1. Click "Edit" on a form
2. You should navigate to the form builder
3. Form data should be loaded

**Delete Form:**
1. Click "Delete" on a form
2. Confirm deletion
3. Form should be removed from the list

### 5. Test Submissions

**View Submissions Page:**
1. Go to "Submissions"
2. Select a form from the dropdown
3. If no submissions, you'll see "No submissions yet"

**Submit a Form (Manual Test):**
Since we don't have a public form page yet, you can test submissions via API:

```bash
curl -X POST http://localhost:5000/api/submissions/YOUR_FORM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Test submission"
    }
  }'
```

**View Submission Details:**
1. Click "View" on a submission
2. Modal should open showing all field data
3. Verify submitted date and status

**Update Submission Status:**
1. In submissions table, click the status dropdown
2. Change status (NEW → ON_HOLD → RESOLVED)
3. Status should update without page reload

**Export Submissions:**
1. If you have submissions, click "Export to CSV"
2. A CSV file should download
3. Open the file and verify data

**Delete Submission:**
1. Click "Delete" on a submission
2. Confirm deletion
3. Submission should be removed

### 6. Test Analytics

**View Analytics:**
1. Create a form and publish it
2. Go to "Analytics"
3. Select your form
4. Verify the stats cards show:
   - Total Views
   - Total Submissions
   - Conversion Rate

**Recent Submissions Table:**
1. If you have submissions, they should appear in the table
2. Verify each row shows:
   - Date
   - Status
   - Number of fields

### 7. Test Share Page

**Access Share Page:**
1. Create and publish a form
2. Go to "Share"
3. Select your form

**Copy Direct Link:**
1. The form URL should be displayed
2. Click "Copy" button
3. The link should be copied to clipboard
4. You should see "Copied!" confirmation

**Copy Embed Code:**
1. Verify embed code is displayed in a code block
2. Click "Copy Embed Code"
3. Code should be copied to clipboard

**Social Media Sharing:**
1. Click on Twitter, Facebook, or LinkedIn buttons
2. A new tab should open with the share dialog
3. The form URL should be included

### 8. Test Settings

**Update Profile:**
1. Go to "Settings"
2. Update your name and company
3. Click "Save Changes"
4. Check for success message

**Change Password:**
1. Enter current password
2. Enter new password
3. Confirm new password
4. Click "Change Password"
5. Check for success message

**View Account Info:**
1. Verify the following information is displayed:
   - Account Status
   - Current Plan
   - Member Since
   - Account Type

### 9. Test Integration Page

**View Integrations:**
1. Go to "Integration"
2. Verify 12 integration cards are displayed
3. Each should have:
   - Icon
   - Name
   - Description
   - Connect/Manage button

**Navigate to Webhooks:**
1. Click "Connect" on Webhooks integration
2. Should navigate to Webhooks page

**Navigate to API Keys:**
1. Click "View API Keys" in the custom integration section
2. Should navigate to API Keys page

### 10. Test API Keys

**View API Key:**
1. Go to "API Keys"
2. Your API key should be displayed
3. It should start with "pbk_"

**Copy API Key:**
1. Click "Copy" button
2. API key should be copied to clipboard
3. You should see "Copied!" confirmation

**Regenerate API Key:**
1. Click "Regenerate"
2. Confirm the action
3. A new API key should be generated
4. The old key should be replaced

**View API Documentation:**
1. Scroll down to see available endpoints
2. Verify examples are shown for:
   - GET /api/forms
   - GET /api/forms/:id
   - POST /api/forms
   - GET /api/submissions
   - GET /api/webhooks

**View Rate Limits:**
1. Check that rate limits are displayed
2. Should show different limits based on plan

### 11. Test Webhooks

**Create Webhook:**
1. Go to "Webhooks"
2. Click "Create Webhook"
3. Enter webhook URL (e.g., https://webhook.site/unique-url)
4. Select events (e.g., form.submitted)
5. Click "Create Webhook"
6. Verify webhook appears in the list

**View Webhook Details:**
1. Verify each webhook shows:
   - URL
   - Active/Inactive status
   - Events
   - Created date
   - Secret (first 20 characters)

**Disable/Enable Webhook:**
1. Click "Disable" on an active webhook
2. Status should change to Inactive
3. Click "Enable" to reactivate
4. Status should change to Active

**Delete Webhook:**
1. Click "Delete" on a webhook
2. Confirm deletion
3. Webhook should be removed

### 12. Test Pricing Page

**View Pricing Plans:**
1. Go to "Pricing" (via URL or from Integration page)
2. Verify 3 pricing cards are displayed:
   - Free ($0/month)
   - Pro ($29/month) - highlighted
   - Business ($99/month)

**Plan Features:**
1. Each plan should list its features
2. Check that features are accurate

**Call to Action:**
1. If not logged in, "Get Started" and "Start Free Trial" should redirect to signup
2. If logged in, should show upgrade options

### 13. Test AI Chatbot

**Open Chatbot:**
1. Look for blue chat icon in bottom-right corner
2. Click to open chatbot
3. Chat window should open with welcome message

**Ask About Pricing:**
1. Type: "What are your pricing plans?"
2. Send message
3. Chatbot should respond with plan details

**Ask About Features:**
1. Type: "What features do you have?"
2. Chatbot should list features

**Ask About Webhooks:**
1. Type: "How do I create a webhook?"
2. Chatbot should provide step-by-step guide

**Ask About Integrations:**
1. Type: "What integrations are available?"
2. Chatbot should list integrations

**Test Other Queries:**
- "How to create a form?"
- "How do I upgrade my plan?"
- "What is the API?"
- "Tell me about analytics"

**Close Chatbot:**
1. Click X button or click outside
2. Chatbot should close
3. Icon should reappear

### 14. Test Mobile Responsiveness

**Desktop (1920x1080):**
1. Test all pages at full width
2. Verify layouts are not broken

**Tablet (768px):**
1. Resize browser to tablet width
2. Test navigation
3. Verify forms are responsive

**Mobile (375px):**
1. Resize browser to mobile width
2. Verify sidebar becomes mobile-friendly
3. Test forms and buttons are clickable

## API Testing

### Test with cURL

**Get All Forms:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/forms
```

**Create Form:**
```bash
curl -X POST http://localhost:5000/api/forms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Form",
    "description": "Created via API",
    "fields": [
      {
        "id": "1",
        "type": "text",
        "label": "Name",
        "required": true
      }
    ]
  }'
```

**Get Form by ID:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/forms/FORM_ID
```

**Submit Form:**
```bash
curl -X POST http://localhost:5000/api/submissions/FORM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Test User"
    }
  }'
```

## Common Issues & Fixes

### Issue: "Cannot connect to database"
**Fix:** Ensure PostgreSQL is running and DATABASE_URL in server/.env is correct

### Issue: "401 Unauthorized"
**Fix:** Check that JWT token is valid and not expired. Try logging in again.

### Issue: "CORS error"
**Fix:** Ensure backend CORS is configured to allow frontend origin

### Issue: Forms not loading
**Fix:** Check browser console for errors. Verify API is running.

### Issue: Submissions not appearing
**Fix:** Verify form ID is correct in the submission request

## Test Checklist

- [ ] Sign up new account
- [ ] Log in with credentials
- [ ] View dashboard with stats
- [ ] Create a new form
- [ ] Add 5+ different field types
- [ ] Save form
- [ ] Publish form
- [ ] View forms list
- [ ] Edit existing form
- [ ] Delete form
- [ ] Submit form via API
- [ ] View submissions
- [ ] Update submission status
- [ ] Export submissions to CSV
- [ ] View analytics
- [ ] Copy share link
- [ ] Copy embed code
- [ ] Update profile settings
- [ ] Change password
- [ ] View integrations
- [ ] View API key
- [ ] Copy API key
- [ ] Regenerate API key
- [ ] Create webhook
- [ ] Disable/enable webhook
- [ ] Delete webhook
- [ ] View pricing plans
- [ ] Open AI chatbot
- [ ] Ask 5 different questions
- [ ] Test on mobile/tablet
- [ ] Test API with cURL

## Performance Testing

1. **Load Time:** All pages should load within 2 seconds
2. **Form Builder:** Should handle 50+ fields without lag
3. **Submissions:** Should load 1000+ submissions smoothly
4. **API Response:** Should respond within 500ms

## Security Testing

1. **Authentication:** Cannot access dashboard without login
2. **Authorization:** Cannot access other users' forms
3. **SQL Injection:** Try entering SQL in form fields
4. **XSS:** Try entering `<script>alert('XSS')</script>` in form fields
5. **API Keys:** Old keys should not work after regeneration

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Report Issues

If you find any bugs during testing, note:
1. What you were doing
2. What you expected to happen
3. What actually happened
4. Steps to reproduce
5. Browser and OS

Happy Testing!
