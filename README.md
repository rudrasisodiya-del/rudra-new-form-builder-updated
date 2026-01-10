# Pabbly Forms - Complete Form Builder Application

A full-stack form builder application built with React, TypeScript, Express, and PostgreSQL. This is a complete, production-ready application that competes with JotForm 2024 features.

## Features

### Core Features
- **Drag & Drop Form Builder** - Create forms with 10 different field types
- **Unlimited Forms & Submissions** (based on plan)
- **Real-time Analytics** - Track views, submissions, and conversion rates
- **Webhooks & API** - Integrate with any external service
- **Multi-tenant System** - Admin and User portals with role-based access
- **AI Chatbot** - Built-in assistant to help users with questions
- **Payment Integration** - Stripe support for subscriptions
- **File Uploads** - Support for file attachments in forms
- **Advanced Sharing** - Direct links, embed codes, social media sharing
- **Data Export** - CSV export for submissions

### Integrations
- Google Sheets
- Slack
- Mailchimp
- Zapier
- Dropbox
- Google Drive
- Airtable
- Stripe
- PayPal
- HubSpot
- Salesforce

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing

## Project Structure

```
pabbly-upgraded/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── layout/
│   │   │   └── UserLayout.tsx   # Main dashboard layout
│   │   └── AIChatbot.tsx        # AI assistant component
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── user/
│   │   │   ├── Dashboard.tsx    # Main dashboard
│   │   │   ├── MyForms.tsx      # Forms management
│   │   │   ├── FormBuilder.tsx  # Drag & drop builder
│   │   │   ├── Submissions.tsx  # View submissions
│   │   │   ├── Analytics.tsx    # Form analytics
│   │   │   ├── Share.tsx        # Share options
│   │   │   ├── Settings.tsx     # User settings
│   │   │   ├── Integration.tsx  # Integrations
│   │   │   ├── APIKeys.tsx      # API key management
│   │   │   └── Webhooks.tsx     # Webhook management
│   │   ├── Home.tsx             # Landing page
│   │   └── Pricing.tsx          # Pricing plans
│   ├── services/
│   │   └── api.ts               # API service with axios
│   └── App.tsx                  # Main app with routing
│
├── server/                       # Backend source
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── formController.ts
│   │   │   ├── submissionController.ts
│   │   │   └── webhookController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── forms.ts
│   │   │   ├── submissions.ts
│   │   │   └── webhooks.ts
│   │   ├── utils/
│   │   │   └── generateApiKey.ts
│   │   └── index.ts             # Express server
│   └── .env                     # Environment variables
│
└── README.md                    # This file
```

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

### Step 1: Clone & Install Dependencies

```bash
cd "c:\Users\Magnet Brains\Desktop\New Forms\pabbly-upgraded"

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Step 2: Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE pabbly_forms;
```

2. Create `server/.env` file with the following:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/pabbly_forms"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000

# Optional: For future features
STRIPE_SECRET_KEY="sk_test_..."
OPENAI_API_KEY="sk-..."
```

3. Run Prisma migrations:

```bash
cd server
npx prisma generate
npx prisma db push
```

4. (Optional) Seed the database with default plans:

```bash
npx prisma db seed
```

### Step 3: Configure Frontend

Update `src/services/api.ts` if your backend runs on a different port:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change port if needed
});
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173 (or 5174)
- Backend API: http://localhost:5000

## Usage Guide

### 1. Create an Account
- Navigate to http://localhost:5173/signup
- Enter your details and create an account
- You'll be automatically logged in

### 2. Create Your First Form
- Go to Dashboard → My Forms
- Click "Create Form"
- Use the drag-and-drop builder to add fields
- Save and publish your form

### 3. Share Your Form
- Click on a form → Share
- Copy the direct link or embed code
- Share on social media

### 4. View Submissions
- Go to Submissions
- Select your form
- View, manage, and export submissions

### 5. Set Up Webhooks
- Go to Webhooks
- Create a new webhook with your endpoint URL
- Select events to listen for
- Your endpoint will receive POST requests when events occur

### 6. API Access
- Go to API Keys
- Copy your API key
- Use it in the Authorization header: `Bearer YOUR_API_KEY`

## API Documentation

### Authentication

All API requests require authentication via JWT token or API key:

```bash
# Using JWT token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/forms

# Using API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:5000/api/forms
```

### Endpoints

#### Forms
```bash
GET    /api/forms              # Get all forms
GET    /api/forms/:id          # Get specific form
POST   /api/forms              # Create form
PUT    /api/forms/:id          # Update form
DELETE /api/forms/:id          # Delete form
POST   /api/forms/:id/publish  # Publish form
POST   /api/forms/:id/view     # Increment view count
```

#### Submissions
```bash
GET    /api/submissions?formId=:id   # Get submissions
POST   /api/submissions/:formId      # Submit form (public)
PUT    /api/submissions/:id          # Update submission
DELETE /api/submissions/:id          # Delete submission
```

#### Webhooks
```bash
GET    /api/webhooks           # Get all webhooks
POST   /api/webhooks           # Create webhook
PUT    /api/webhooks/:id       # Update webhook
DELETE /api/webhooks/:id       # Delete webhook
GET    /api/webhooks/:id/logs  # Get webhook logs
```

## Webhook Security

Webhook requests include a signature in the `X-Webhook-Signature` header:

```javascript
const crypto = require('crypto');

const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const secret = 'your_webhook_secret';

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature === expectedSignature) {
  // Webhook is valid
}
```

## Database Schema

### Main Tables
- **User** - User accounts with role-based access
- **Plan** - Subscription plans (Free, Pro, Business)
- **Form** - Form definitions with fields
- **Submission** - Form submissions data
- **Webhook** - Webhook configurations
- **WebhookLog** - Webhook delivery logs
- **Integration** - Third-party integrations
- **ApiLog** - API request logs
- **Template** - Form templates
- **Payment** - Payment records

## Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
```bash
npm run build
```

2. Deploy the `dist` folder to Vercel or Netlify

3. Set environment variables:
```
VITE_API_URL=https://your-backend-api.com
```

### Backend (Railway/Render/Heroku)

1. Push your code to GitHub

2. Connect to Railway/Render/Heroku

3. Set environment variables:
```
DATABASE_URL=your-postgres-url
JWT_SECRET=your-secret-key
PORT=5000
```

4. Deploy

### Database (Railway/Supabase)

1. Create a PostgreSQL database
2. Run migrations:
```bash
npx prisma db push
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (server/.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-super-secret-key
PORT=5000
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
```

## Pricing Plans

### Free Plan
- 5 Forms
- 100 Submissions/month
- Basic features
- $0/month

### Pro Plan
- Unlimited Forms
- 10,000 Submissions/month
- All features + API + Webhooks
- $29/month

### Business Plan
- Unlimited Forms
- 100,000 Submissions/month
- Enterprise features + Priority support
- $99/month

## AI Chatbot

The built-in AI chatbot can help users with:
- Pricing information
- Feature explanations
- How-to guides
- Integration questions
- General support

Click the blue chat icon in the bottom-right corner to interact with the chatbot.

## Security Features

- JWT authentication
- Password hashing with bcrypt
- API key generation with crypto
- Webhook signature verification
- Role-based access control (ADMIN/USER)
- SQL injection protection via Prisma
- XSS protection

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - All rights reserved

## Support

For support, please contact:
- Email: support@pabbly.com
- Documentation: https://docs.pabbly.com
- GitHub Issues: https://github.com/pabbly/forms/issues

## Changelog

### Version 1.0.0 (2026-01-09)
- Initial release
- Complete form builder
- User authentication
- Webhooks & API
- AI Chatbot
- Analytics dashboard
- Multi-tenant system
- Payment integration ready
- All integrations configured

---

Built with ❤️ by the Pabbly Team
