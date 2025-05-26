import { products } from '../stripe-config';

export async function createCheckoutSession(priceId: string, mode: 'subscription' | 'payment') {
  const product = products.find(p => p.priceId === priceId);
  if (!product) {
    throw new Error('Invalid price ID');
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      price_id: priceId,
      mode,
      success_url: `${window.location.origin}/checkout/success`,
      cancel_url: `${window.location.origin}/checkout/cancel`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  const { url } = await response.json();
  return url;
}

export async function redirectToCheckout(priceId: string) {
  const product = products.find(p => p.priceId === priceId);
  if (!product) {
    throw new Error('Invalid price ID');
  }

  try {
    const url = await createCheckoutSession(priceId, product.mode);
    window.location.href = url;
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
}