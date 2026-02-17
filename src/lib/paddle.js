// Paddle Configuration for Pearl-Sonic
// Using Paddle for global payments (works in Argentina without issues)

export const PADDLE_CONFIG = {
  // Get from environment variables
  token: process.env.PADDLE_TOKEN || '',
  priceIds: {
    // One-time purchases (increased prices)
    starter: process.env.PADDLE_PRICE_STARTER || '',
    pro: process.env.PADDLE_PRICE_PRO || '',
    creator: process.env.PADDLE_PRICE_CREATOR || '',
    studio: process.env.PADDLE_PRICE_STUDIO || '',
    // Monthly subscriptions (attractive pricing)
    starter_monthly: process.env.PADDLE_PRICE_STARTER_MONTHLY || '',
    pro_monthly: process.env.PADDLE_PRICE_PRO_MONTHLY || '',
    creator_monthly: process.env.PADDLE_PRICE_CREATOR_MONTHLY || '',
    studio_monthly: process.env.PADDLE_PRICE_STUDIO_MONTHLY || '',
  },
};

// One-time purchase plans (USD) - INCREASED for comparison
export const PADDLE_PRICES_ONETIME = [
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER || 'pri_01hj...', // Replace with actual Paddle Price ID
    name: 'Starter',
    credits: 1,
    price: 9.99,
    currency: 'USD',
    billing: 'one-time',
    description: '1 song (2 minutes of music)',
    features: ['2 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO || 'pri_02k...', // Replace with actual Paddle Price ID
    name: 'Pro',
    credits: 3,
    price: 14.99,
    currency: 'USD',
    billing: 'one-time',
    description: '3 songs (6 minutes of music)',
    features: ['6 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_CREATOR || 'pri_03l...', // Replace with actual Paddle Price ID
    name: 'Creator',
    credits: 5,
    price: 24.99,
    currency: 'USD',
    billing: 'one-time',
    description: '5 songs (10 minutes of music)',
    features: ['10 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO || 'pri_04m...', // Replace with actual Paddle Price ID
    name: 'Studio',
    credits: 10,
    price: 59.99,
    currency: 'USD',
    billing: 'one-time',
    description: '10 songs (20 minutes of music)',
    features: ['20 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
];

// Monthly subscription plans (USD) - ATTRACTIVE PRICING
export const PADDLE_PRICES_MONTHLY = [
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY || 'pri_05n...', // Replace with actual Paddle Price ID
    name: 'Starter',
    credits: 1,
    price: 1.99,    // $1.99/month (60% savings vs one-time)
    currency: 'USD',
    billing: 'monthly',
    description: '1 song/month (2 minutes)',
    features: ['2 minutes of music', 'Full commercial rights', 'Cancel anytime'],
    savings: 60,
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || 'pri_06o...', // Replace with actual Paddle Price ID
    name: 'Pro',
    credits: 3,
    price: 4.99,    // $14.99/month (67% savings vs one-time)
    currency: 'USD',
    billing: 'monthly',
    description: '3 songs/month (6 minutes)',
    features: ['6 minutes of music', 'Full commercial rights', 'Cancel anytime'],
    savings: 67,
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_CREATOR_MONTHLY || 'pri_07p...', // Replace with actual Paddle Price ID
    name: 'Creator',
    credits: 5,
    price: 7.99,    // $23.99/month (68% savings vs one-time)
    currency: 'USD',
    billing: 'monthly',
    description: '5 songs/month (10 minutes)',
    features: ['10 minutes of music', 'Full commercial rights', 'Cancel anytime'],
    savings: 68,
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO_MONTHLY || 'pri_08q...', // Replace with actual Paddle Price ID
    name: 'Studio',
    credits: 10,
    price: 16.99,   // $59.99/month (66% savings vs one-time)
    currency: 'USD',
    billing: 'monthly',
    description: '10 songs/month (20 minutes)',
    features: ['20 minutes of music', 'Full commercial rights', 'Cancel anytime'],
    savings: 66,
  },
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
  return Math.floor(price / 10); // $10 = 1 credit
};

// Format price for display
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
};

// Get one-time plan for comparison
export const getOneTimePlan = (planName) => {
  return PADDLE_PRICES_ONETIME.find(p => p.name === planName);
};
