// Paddle Configuration for Pearl-Sonic
// Using Paddle for global payments (works in Argentina without issues)

export const PADDLE_CONFIG = {
  // Get from environment variables
  token: process.env.PADDLE_TOKEN || '',
  priceIds: {
    // One-time purchases
    starter: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER || '',
    pro: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO || '',
    creator: process.env.NEXT_PUBLIC_PADDLE_PRICE_CREATOR || '',
    studio: process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO || '',
  },
};

// One-time purchase plans (USD) - 1 credit = 1 second of audio
export const PADDLE_PRICES_ONETIME = [
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER || 'pri_01hj...',
    name: 'Starter',
    credits: 120,
    price: 5,
    currency: 'USD',
    billing: 'one-time',
    description: '2 minutes of music',
    features: ['2 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO || 'pri_02k...',
    name: 'Pro',
    credits: 360,
    price: 15,
    currency: 'USD',
    billing: 'one-time',
    description: '6 minutes of music',
    features: ['6 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_CREATOR || 'pri_03l...',
    name: 'Creator',
    credits: 600,
    price: 25,
    currency: 'USD',
    billing: 'one-time',
    description: '10 minutes of music',
    features: ['10 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
  {
    id: process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO || 'pri_04m...',
    name: 'Studio',
    credits: 1200,
    price: 50,
    currency: 'USD',
    billing: 'one-time',
    description: '20 minutes of music',
    features: ['20 minutes of music', 'Full commercial rights', 'High quality audio'],
  },
];

// Get credits from price ID
export const getCreditsFromPriceId = (priceId) => {
  const plan = PADDLE_PRICES_ONETIME.find(p => p.id === priceId);
  return plan ? plan.credits : 0;
};

// Get plan from price ID
export const getPlanFromPriceId = (priceId) => {
  return PADDLE_PRICES_ONETIME.find(p => p.id === priceId);
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

// Calculate estimated tracks from credits (15-second blocks)
export const getEstimatedTracks = (credits) => {
  const minTracks = Math.floor(credits / 30); // Longer tracks (30 credits each)
  const maxTracks = Math.floor(credits / 15); // Shorter tracks (15 credits each)
  return `~${minTracks}-${maxTracks} tracks`;
};
