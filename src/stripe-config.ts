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
    id: 'prod_SODSxh4RxRHz8Y',
    priceId: 'price_1RTR1wFLqLlCLjMSUORD8hkS',
    name: 'Premium Test Sub',
    description: 'Full access to all premium features including unlimited queries, advanced mental models, and cognitive bias analysis.',
    mode: 'subscription'
  }
];