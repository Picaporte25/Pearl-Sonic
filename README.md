# Pearl-Sonic 🎵

AI-Powered music generation platform - Create unique music for your projects.

## 🌟 Features

- **AI Music Generation**: Create original music using ElevenLabs API
- **Flexible Duration**: Choose from 30 seconds to 10 minutes with decimal precision
- **Smart Credit System**: 0.5 credits/minute pricing model
- **Commercial Rights**: Full royalty-free usage for all projects
- **User Dashboard**: Track your history, manage credits, view transactions

## 🎨 Tech Stack

- **Frontend**: Next.js 16.1.6 with React
- **Styling**: Tailwind CSS with custom dark theme
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Payments**: PayPal + Paddle (international support)
- **AI Provider**: ElevenLabs (fal.ai)

## 📋 Pricing

**Pay-as-you-go:**
- 0.5 minutes = 0.5 credits ($2.50)
- 1 minute = 1 credit ($5.00)
- 2 minutes = 2 credits ($10.00)
- 3 minutes = 3 credits ($15.00)
- etc.

**Subscription Plans (Paddle):**
- Starter: $4.99/month - 1 credit (2 min)
- Pro: $14.99/month - 3 credits (6 min)
- Creator: $23.99/month - 5 credits (10 min)
- Studio: $47.99/month - 10 credits (20 min)

## 🚀 Getting Started

### Prerequisites

```bash
node -v 18+  # Node.js 18 or higher
npm -v 9+       # npm 9 or higher
```

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# ElevenLabs (fal.ai)
FAL_API_KEY=your-fal-ai-key

# JWT Secret for authentication
JWT_SECRET=your-jwt-secret

# Paddle (recommended for international payments)
PADDLE_TOKEN=your-paddle-api-token
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret
NEXT_PUBLIC_PADDLE_TOKEN=your-public-paddle-client-token
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox

# Paddle Price IDs (get these from Paddle Dashboard)
# One-time purchases
NEXT_PUBLIC_PADDLE_PRICE_STARTER=pri_01hj...your-starter-price-id
NEXT_PUBLIC_PADDLE_PRICE_PRO=pri_02k...your-pro-price-id
NEXT_PUBLIC_PADDLE_PRICE_CREATOR=pri_03l...your-creator-price-id
NEXT_PUBLIC_PADDLE_PRICE_STUDIO=pri_04m...your-studio-price-id
# Monthly subscriptions
NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY=pri_05n...your-starter-monthly-price-id
NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY=pri_06o...your-pro-monthly-price-id
NEXT_PUBLIC_PADDLE_PRICE_CREATOR_MONTHLY=pri_07p...your-creator-monthly-price-id
NEXT_PUBLIC_PADDLE_PRICE_STUDIO_MONTHLY=pri_08q...your-studio-monthly-price-id
```

### Database Setup

Run the SQL setup script in Supabase:

```bash
# Choose one:
- supabase-setup.sql          # Complete setup with RLS
- supabase-setup-safe.sql      # Minimal setup (if you prefer)

# Copy the SQL from the file and run in Supabase Dashboard
# In: Supabase Dashboard → SQL Editor → New Query → Paste SQL → Run
```

### Development

```bash
# Start development server
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
pearl-sonic/
├── public/
│   ├── favicon.svg
│   └── music/           # Music files for examples
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── MusicGenerator.jsx
│   ├── lib/
│   │   ├── auth.js
│   │   ├── db.js
│   │   ├── fal.js
│   │   ├── paddle.js
│   │   ├── webhook-verify.js
│   │   └── rate-limit.js
│   └── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register.js
│   │   │   │   └── login.js
│   │   │   └── payment/
│   │   │       ├── create-checkout.js
│   │   │       ├── paypal-create-order.js
│   │   │       └── paypal-webhook.js
│   │   │   └── paddle-create-checkout.js
│   │   │       └── paddle-webhook.js
│   │   └── subscription/
│   │   │       └── cancel.js
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js
│   │   ├── generate.js
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── profile.js
│   │   ├── history.js
│   │   ├── checkout.js
│   │   ├── checkout-paddle.js
│   │   ├── checkout-paddle/
│   │   │   └── success.js
│   │   ├── refund-policy.js
│   │   └── terms.js
│   └── styles/
│       └── globals.css
├── package.json
└── README.md
```

## 🎨 Customization

### Updating Brand Colors

To change the gradient colors:

1. Open `src/styles/globals.css`
2. Update the color variables:

```css
:root {
  /* Primary Gradient */
  --color-purple: #YOUR_PURPLE_HEX;
  --color-pink: #YOUR_PINK_HEX;
  --color-cyan: #YOUR_CYAN_HEX;

  /* macOS Window Buttons */
  --macos-purple: #YOUR_MACOS_PURPLE_HEX;
  --macos-pink: #YOUR_MACOS_PINK_HEX;
  --macos-cyan: #YOUR_MACOS_CYAN_HEX;
}
```

3. The changes will apply across all components

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm start

# Lint code
npm run lint
```

### API Routes

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

**Music Generation:**
- `POST /api/music/generate` - Create new music
- `GET /api/music/status` - Check generation status
- `POST /api/music/download` - Download generated audio

**Payments:**
- `POST /api/payment/create-checkout` - Stripe checkout
- `POST /api/payment/paypal-create-order` - PayPal order
- `POST /api/payment/paypal-webhook` - PayPal notifications
- `POST /api/payment/paddle-create-checkout` - Paddle checkout
- `POST /api/payment/paddle-webhook` - Paddle notifications
- `GET /api/payment/webhook-status` - Webhook verification

**User Management:**
- `GET /api/user/credits` - Get user credits
- `GET /api/user/history` - Get music history
- `GET /api/user/transactions` - Get payment history
- `GET /api/user/profile` - Get user profile
- `POST /api/subscription/cancel` - Cancel subscription

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Add all variables from .env.local above
```

### Environment Variables in Vercel

Add all variables from `.env.local` section above to your Vercel project settings.

## 📊 Database Schema (Supabase)

### Tables

**users:**
- Stores user accounts and credit balance
- Includes subscription tracking for Paddle

**tracks:**
- Stores generated music tracks
- Links to user who created them

**credit_transactions:**
- Records all credit purchases and usage
- Tracks payment method and type

**subscriptions:**
- (Optional) Paddle subscription tracking
- For managing active subscriptions

## 🧪 Testing

### Running Tests

```bash
npm run test
```

### Test Accounts

Create test accounts:
- Regular user for standard flow testing
- Admin account for payment testing

## 📄 License

This project is proprietary. All rights reserved.

## 🙏 Acknowledgments

- **ElevenLabs**: AI music generation API
- **Next.js**: React framework
- **Tailwind CSS**: Styling
- **Supabase**: Database and auth
- **Paddle**: Payment platform (recommended for Argentina)
- **PayPal**: Alternative payment method
- **Vercel**: Deployment platform

---

**Built with ❤️ by the Pearl-Sonic Team**
