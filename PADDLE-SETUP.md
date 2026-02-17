# Paddle Integration Guide for Sonic-Wave

## Overview
Paddle is a global payment platform that works perfectly in Argentina and other international markets. Unlike PayPal, it has no geographical restrictions.

## Prerequisites

1. **Create Paddle Account**
   - Go to [https://www.paddle.com](https://www.paddle.com)
   - Sign up and verify your email

2. **Get Your API Token**
   - Go to Dashboard → Developer → Authentication
   - Create an API token (copy it for later use)

3. **Create Products/Prices**
   - Go to Products → Product catalog
   - Create 3 products with these settings:
     - **Pro Plan**: $9.99/month
     - **Creator Plan**: $19.99/month
     - **Studio Plan**: $39.99/month
   - Set currency to **USD** for all products
   - Make each product a subscription (recurring payment)
   - Copy the Price IDs (they look like `pri_01hj...`)

## Configuration Steps

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Paddle Configuration
PADDLE_TOKEN=your-paddle-api-token-here
PADDLE_PRICE_PRO=pri_01hj...your-pro-price-id
PADDLE_PRICE_CREATOR=pri_02k...your-creator-price-id
PADDLE_PRICE_STUDIO=pri_03l...your-studio-price-id
```

### 2. Install Paddle.js

Run this command in your project root:

```bash
npm install @paddle/paddle-js
```

### 3. Initialize Paddle in your app

Create or update `src/lib/paddle.js` with your actual Price IDs:

```javascript
export const PADDLE_CONFIG = {
  token: process.env.PADDLE_TOKEN,
  priceIds: {
    pro: 'pri_01hj...',     // Replace with your actual Pro Price ID
    creator: 'pri_02k...', // Replace with your actual Creator Price ID
    studio: 'pri_03l...',   // Replace with your actual Studio Price ID
  },
};
```

## Paddle vs PayPal Comparison

| Feature | PayPal | Paddle |
|---------|--------|---------|
| Works in Argentina | ❌ Limited | ✅ Perfect |
| Geographic restrictions | ❌ Yes | ✅ None |
| Recurring payments | ❌ Complex | ✅ Easy |
| Subscription management | ❌ Manual | ✅ Built-in |
| Customer portal | ❌ No | ✅ Yes |
| Webhooks | ⚠️ Complex | ✅ Reliable |
| Taxes (VAT/GST) | ❌ Manual | ✅ Auto |

## Implementation Steps

### Step 1: Basic Checkout (Quick Start)

This implementation uses Paddle's checkout link which is the simplest method:

1. User clicks "Subscribe" on a plan
2. Redirect to Paddle checkout
3. User completes payment on Paddle
4. Paddle sends webhook to your server
5. Your server credits user's account

### Step 2: Advanced Integration (For Production)

For production, you'll want to use Paddle.js SDK:

**Install:**
```bash
npm install @paddle/paddle-js
```

**Initialize in `_app.js` or `pages/_app.js`:**
```javascript
import { Paddle } from '@paddle/paddle-js';

export default function App({ Component, pageProps }) {
  // Initialize Paddle
  const paddle = Paddle.initialize({
    token: process.env.PADDLE_TOKEN,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  });

  return <Paddle.Provider paddle={paddle}>
    <Component {...pageProps} />
  </Paddle.Provider>
);
}
```

**Create Checkout Component:**
```javascript
// Example checkout component
import { usePaddle } from '@paddle/paddle-js';

export function Checkout({ priceId, userId }) {
  const { prices } = usePaddle();
  const price = prices.items.find(p => p.id === priceId);

  const handleCheckout = async () => {
    try {
      // Create or update customer
      await paddle.Checkout({
        items: [{ priceId: price.id, quantity: 1 }],
        customer: {
          email: user.email,
        },
        customData: {
          userId: userId,
          planType: 'subscription',
        },
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          successUrl: 'https://sonicwave.com/checkout/success',
        },
      });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <button onClick={handleCheckout}>
      Subscribe
    </button>
  );
}
```

### Step 3: Webhook Integration (Crucial)

Create webhook endpoint: `src/pages/api/paddle-webhook.js`

```javascript
export default async function handler(req, res) {
  const signature = req.headers['paddle-signature'];

  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  // Verify webhook is from Paddle
  // Paddle signs all webhooks with a shared secret

  const body = await req.json();
  const { event_name, data } = body;

  if (event_name === 'subscription.activated') {
    // User subscribed successfully
    const { user_id, price_id } = data.custom_data;

    // Calculate credits to add
    const creditsToAdd = getCreditsFromPriceId(price_id);

    // Update user credits
    await supabaseAdmin
      .from('users')
      .update({ credits: sql`credits + ${creditsToAdd}` })
      .eq('id', user_id);

    // Record transaction
    await supabaseAdmin
      .from('credit_transactions')
      .insert([{
        user_id: user_id,
        amount: creditsToAdd,
        type: 'subscription',
        description: `Paddle subscription: ${planName}`,
      }]);

    res.status(200).json({ received: true });
  }

  if (event_name === 'subscription.cancelled') {
    // User cancelled subscription
    const { user_id } = data.custom_data;

    // Don't automatically remove credits (let user keep them)
    // Just log the cancellation

    await supabaseAdmin
      .from('credit_transactions')
      .insert([{
        user_id: user_id,
        amount: 0,
        type: 'subscription_cancelled',
        description: `Subscription cancelled`,
      }]);

    res.status(200).json({ received: true });
  }

  if (event_name === 'subscription.updated') {
    // User changed plan
    // Adjust credits accordingly
    const { user_id, price_id, previous_price_id } = data.custom_data;

    const previousCredits = getCreditsFromPriceId(previous_price_id);
    const newCredits = getCreditsFromPriceId(price_id);
    const creditsDifference = newCredits - previousCredits;

    if (creditsDifference > 0) {
      // Upgrade - add more credits
      await supabaseAdmin
        .from('users')
        .update({ credits: sql`credits + ${creditsDifference}` })
        .eq('id', user_id);
    } else if (creditsDifference < 0) {
      // Downgrade - don't remove credits (let user keep them)
      // Just log the change
    }

    res.status(200).json({ received: true });
  }

  res.status(200).json({ received: true });
}
```

## Pricing Strategy

### Recommended Prices for Your Business

| Plan | Price | Credits | Cost/Minute | Your Profit | Margin |
|-------|-------|---------|--------------|------------|--------|
| Pro | $9.99 | 15 | $0.67 | $3.59 | 36% |
| Creator | $19.99 | 45 | $0.44 | $7.59 | 38% |
| Studio | $39.99 | 100 | $0.40 | $15.59 | 39% |

**Note:** Your profit margin is calculated based on:
- Each credit = 2 minutes of music
- ElevenLabs cost = $0.80/minute = $1.60 per credit
- Paddle takes ~2.9% fee from each transaction

### Alternative: Higher Margin Pricing

| Plan | Price | Credits | Your Profit | Margin |
|-------|-------|---------|------------|--------|
| Pro | $14.99 | 15 | $8.79 | 59% |
| Creator | $29.99 | 45 | $17.99 | 60% |
| Studio | $49.99 | 100 | $31.99 | 64% |

## Security Notes

1. **Webhook Signature Verification**
   - Always verify Paddle webhooks using signature
   - Never trust unverified webhooks
   - Check signature against your shared secret

2. **Environment Variables**
   - Never commit `.env.local` files
   - Use environment variables for sensitive data
   - Use different tokens for sandbox vs production

3. **Error Handling**
   - Handle failed payments gracefully
   - Log all errors for debugging
   - Provide clear error messages to users

## Testing

### Sandbox Testing

1. Create a test customer account
2. Use test credit cards provided by Paddle
3. Test all subscription flows (create, update, cancel)
4. Verify webhook events are received correctly

### Production Checklist

- [ ] All test subscriptions work
- [ ] Webhooks are verified
- [ ] Error handling is comprehensive
- [ ] User can cancel subscriptions from profile
- [ ] Email notifications work (if implemented)
- [ ] Analytics are set up
- [ ] Pricing is competitive

## Customer Management

Users can manage their subscription from profile:
- View current plan
- Upgrade to higher tier
- Downgrade or cancel
- View billing history
- Update payment methods

## Migration Strategy

### Phase 1: Keep Both (Current)
- Keep PayPal checkout as an option
- Add Paddle as an alternative
- Let users choose their preferred method
- Duration: 2-4 weeks

### Phase 2: Transition (Recommended)
- Promote Paddle as preferred method
- Add discount for Paddle subscriptions
- Gradually reduce PayPal emphasis
- Duration: 1-2 months

### Phase 3: Paddle Only (Final)
- Remove PayPal checkout
- Only use Paddle
- Update all documentation
- Duration: After phase 2

## Support Resources

- [Paddle Documentation](https://developer.paddle.com/)
- [Paddle Support](https://paddle.com/support)
- [Paddle Community](https://community.paddle.com/)
- [Webhook Testing Tool](https://webhook.site/)

## Next Steps

1. ✅ Create Paddle account
2. ✅ Create products and prices
3. ✅ Get API token
4. ⬜ Add to `.env.local`
5. ⬜ Update `src/lib/paddle.js` with Price IDs
6. ⬜ Install @paddle/paddle-js
7. ⬜ Implement advanced checkout (optional)
8. ⬜ Create webhook endpoint
9. ⬜ Test in sandbox
10. ⬜ Deploy to production

## Troubleshooting

### Common Issues

**Webhook not firing:**
- Check Paddle dashboard for webhook URL
- Verify webhook is accessible from internet
- Check firewall settings

**Credits not adding:**
- Verify webhook signature
- Check database connection
- Check Supabase logs

**Checkout not working:**
- Verify API token is correct
- Check price IDs match
- Check Paddle console for errors

**Payment failing:**
- Test with different browsers
- Check payment method support
- Verify Paddle account status

---

## Quick Reference

**Paddle Dashboard:** https://vendors.paddle.com/
**Documentation:** https://developer.paddle.com/
**Support Email:** vendors@paddle.com
**Status Page:** https://status.paddle.com/

For questions, refer to this guide or contact Paddle support.
