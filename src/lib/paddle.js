// Paddle Configuration for Sonic-Wave
// Using Paddle for global payments (works in Argentina without issues)

export const PADDLE_CONFIG = {
  // Get from environment variables
  token: process.env.PADDLE_TOKEN || '',
  priceIds: {
    // One-time purchases
    starter: process.env.PADDLE_PRICE_STARTER || '',
    pro: process.env.PADDLE_PRICE_PRO || '',
    creator: process.env.PADDLE_PRICE_CREATOR || '',
    studio: process.env.PADDLE_PRICE_STUDIO || '',
    // Monthly subscriptions
    starter_monthly: process.env.PADDLE_PRICE_STARTER_MONTHLY || '',
    pro_monthly: process.env.PADDLE_PRICE_PRO_MONTHLY || '',
    creator_monthly: process.env.PADDLE_PRICE_CREATOR_MONTHLY || '',
    studio_monthly: process.env.PADDLE_PRICE_STUDIO_MONTHLY || '',
  },
};

// One-time purchase plans (USD)
export const PADDLE_PRICES_ONETIME = [
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER || 'pri_01hj...',
    name: 'Starter',
    credits: 1,
    price: 5.00,
    currency: 'USD',
    billing: 'one-time',
    description: '1 song (2 minutes of music)',
    features: ['2 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO || 'pri_02k...',
    name: 'Pro',
    credits: 3,
    price: 15.00,
    currency: 'USD',
    billing: 'one-time',
    description: '3 songs (6 minutes of music)',
    features: ['6 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_CREATOR || 'pri_03l...',
    name: 'Creator',
    credits: 5,
    price: 24.00,
    currency: 'USD',
    billing: 'one-time',
    description: '5 songs (10 minutes of music)',
    features: ['10 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO || 'pri_04m...',
    name: 'Studio',
    credits: 10,
    price: 48.00,
    currency: 'USD',
    billing: 'one-time',
    description: '10 songs (20 minutes of music)',
    features: ['20 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
];

// Monthly subscription plans (USD)
export const PADDLE_PRICES_MONTHLY = [
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY || 'pri_05n...',
    name: 'Starter',
    credits: 1,
    price: 4.99,
    currency: 'USD',
    billing: 'monthly',
    description: '1 song/month (2 minutes)',
    features: ['1 song every month', 'Full commercial rights', 'High quality audio', 'Cancel anytime'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || 'pri_06o...',
    name: 'Pro',
    credits: 3,
    price: 14.99,
    currency: 'USD',
    billing: 'monthly',
    description: '3 songs/month (6 minutes)',
    features: ['3 songs every month', 'Full commercial rights', 'High quality audio', 'Cancel anytime'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_CREATOR_MONTHLY || 'pri_07p...',
    name: 'Creator',
    credits: 5,
    price: 23.99,
    currency: 'USD',
    billing: 'monthly',
    description: '5 songs/month (10 minutes)',
    features: ['5 songs every month', 'Full commercial rights', 'High quality audio', 'Cancel anytime'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO_MONTHLY || 'pri_08q...',
    name: 'Studio',
    credits: 10,
    price: 47.99,
    currency: 'USD',
    billing: 'monthly',
    description: '10 songs/month (20 minutes)',
    features: ['10 songs every month', 'Full commercial rights', 'High quality audio', 'Cancel anytime'],
  },
];

// Combined prices for easy access
export const PADDLE_PRICES = [
  ...PADDLE_PRICES_ONETIME,
  ...PADDLE_PRICES_MONTHLY,
];

// Subscription types
export const SUBSCRIPTION_TYPES = {
  ONE_TIME: 'one-time',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

// Get credits from price ID
export const getCreditsFromPriceId = (priceId) => {
  const plan = PADDLE_PRICES.find(p => p.id === priceId);
  return plan ? plan.credits : 0;
};

// Get plan from price ID
export const getPlanFromPriceId = (priceId) => {
  return PADDLE_PRICES.find(p => p.id === priceId);
};

// Calculate credits from price
export const calculateCreditsFromPrice = (price) => {
  return Math.floor(price / 5); // 1 credit = $5
};

// Format price for display
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
};
