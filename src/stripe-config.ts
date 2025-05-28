// src/stripe-config.ts
export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const products: Product[] = [
  {
    id: 'prod_SOHqFRisndNSaH',
    priceId: 'price_1RTVGvFLqLlCLjMSFNTJu33f',
    name: 'Premium',
    description: 'Full access to all premium features including unlimited queries, advanced mental models, and cognitive bias analysis.',
    mode: 'subscription'
  }
];