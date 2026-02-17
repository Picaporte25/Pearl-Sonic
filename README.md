# Sonic-Wave 🎵

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
- **Deployment**: Vercel (recommended)

## 📋 Pricing

**Pay-as-you-go:**
- 0.5 minutes = 0.5 credits ($2.50)
- 1 minute = 1 credit ($5.00)
- 2 minutes = 2 credits ($10.00)
- 3 minutes = 3 credits ($15.00)
- etc.

**Subscription Plans (Paddle):**
- Pro: $9.99/month - 15 songs (30 min)
- Creator: $19.99/month - 45 songs (90 min)
- Studio: $39.99/month - 100 songs (200 min)

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

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ElevenLabs (fal.ai)
FAL_KEY=your-fal-ai-key

# PayPal (optional - for legacy checkout)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_ID=your-paypal-client-id

# Paddle (recommended for international payments)
PADDLE_TOKEN=your-paddle-api-token
PADDLE_PRICE_PRO=pri_01hj...your-pro-price-id
PADDLE_PRICE_CREATOR=pri_02k...your-creator-price-id
PADDLE_PRICE_STUDIO=pri_03l...your-studio-price-id
```

## 📁 Project Structure

```
sound-weaver/
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
│   │   └── paddle.js
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── payment/
│   │   │   │   ├── create-checkout.js
│   │   │   │   ├── paypal-create-order.js
│   │   │   │   └── paypal-webhook.js
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
│   │   └── checkout/success.js
│   └── styles/
│       └── globals.css
└── package.json
```

## 🎨 Customization

### Colors (CSS Variables)

```css
:root {
  /* Primary Gradient */
  --color-purple: #8B5CF6;
  --color-pink: #EC4899;
  --color-cyan: #06B6D4;

  /* macOS Window Buttons */
  --macos-purple: #8B5CF6;
  --macos-pink: #EC4899;
  --macos-cyan: #06B6D4;

  /* Backgrounds */
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-card: #111111;

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #E5E5E5;
  --text-muted: #999999;

  /* Borders */
  --border-color: #333333;
}
```

### Updating Brand Colors

To change the gradient colors:
1. Open `src/styles/globals.css`
2. Update the color variables
3. The changes will apply across all components

## 🎯 Key Features Explained

### Music Generation

**Duration Slider:**
- Range: 0.5 to 10 minutes
- Step: 0.01 minute (decimal precision)
- Rounded up for credit calculation

**Credit System:**
- 0.5-1.00 minutes = 0.5 credits
- 1.01-2.00 minutes = 1 credit
- Formula: `Math.floor(minutes) * 0.5`
- Always rounded up to match ElevenLabs billing

**Price Calculation:**
- $5 USD per credit
- Total: `creditsNeeded * 5`
- Profit: `(creditsNeeded * 5) - (creditsNeeded * 1.60)`

### Payment Integration

**PayPal (Legacy):**
- One-time purchases
- Basic checkout flow
- Webhook-based credit updates

**Paddle (Recommended for Argentina):**
- Subscription-based (monthly)
- Automatic renewals
- Customer portal for management
- Built-in tax handling
- No geographic restrictions

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### API Routes

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification

**Music Generation:**
- `POST /api/music/generate` - Create new music
- `GET /api/music/status` - Check generation status
- `POST /api/music/download` - Download generated audio

**Payments:**
- `POST /api/payment/create-checkout` - Stripe checkout
- `POST /api/payment/paypal-create-order` - PayPal order
- `POST /api/payment/paypal-webhook` - PayPal notifications
- `GET /api/payment/webhook-status` - Webhook verification

**User Management:**
- `GET /api/user/credits` - Get user credits
- `GET /api/user/history` - Get music history
- `GET /api/user/transactions` - Get payment history
- `GET /api/user/profile` - Get user profile

## 📊 Database Schema (Supabase)

**Tables:**

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**tracks**
```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fal_request_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  duration INTEGER, -- in milliseconds
  status VARCHAR(50), -- 'generating', 'completed', 'failed'
  audio_url TEXT,
  cover_url TEXT,
  credits_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**credit_transactions**
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER, -- positive for purchases, negative for usage
  type VARCHAR(50), -- 'purchase', 'usage', 'subscription', 'subscription_cancelled'
  description TEXT,
  track_id UUID REFERENCES tracks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**subscriptions** (for Paddle)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  paddle_subscription_id VARCHAR(255),
  plan_type VARCHAR(50), -- 'pro', 'creator', 'studio'
  status VARCHAR(50), -- 'active', 'cancelled', 'paused'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

### Environment Variables in Vercel

Add all variables from `.env.local` section above

## 🧪 Testing

### Running Tests

```bash
npm run test
```

### Test Accounts

Create test accounts:
- Regular user for standard flow testing
- Admin account for payment testing

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 👥 Support

For issues or questions:
- Check [PADDLE-SETUP.md](./PADDLE-SETUP.md) for Paddle integration
- Review the codebase documentation
- Check ElevenLabs API docs

## 🙏 Acknowledgments

- **ElevenLabs**: AI music generation API
- **Next.js**: React framework
- **Tailwind CSS**: Styling
- **Supabase**: Database and auth
- **Paddle**: Payment platform (recommended for Argentina)
- **PayPal**: Alternative payment method
- **Vercel**: Deployment platform

---

**Built with ❤️ by the Sonic-Wave Team**
