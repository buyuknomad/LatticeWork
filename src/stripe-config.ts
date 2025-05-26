export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const products: Product[] = [
  {
    id: 'prod_SNvXWgcWRkkqvA',
    priceId: 'price_1RT9gVFLqLlCLjMStBtLZNEw',
    name: 'Test Sub',
    description: 'Test subscription for development',
    mode: 'subscription',
  },
];