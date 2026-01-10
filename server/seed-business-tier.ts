import { getUncachableStripeClient } from './stripeClient';

async function createBusinessTier() {
  const stripe = await getUncachableStripeClient();

  console.log('Checking if Business tier exists...');
  
  const existingProducts = await stripe.products.search({ 
    query: "name:'Business'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('Business tier already exists:', existingProducts.data[0].id);
    return;
  }

  console.log('Creating Business tier product...');
  
  const product = await stripe.products.create({
    name: 'Business',
    description: 'For teams and organizations who demand excellence.',
    metadata: {
      tier: 'business',
      seats: '5',
      features: 'team_seats,api_access,priority_support,bulk_generation,custom_training,white_label,analytics'
    }
  });

  console.log('Created product:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 19900,
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  console.log('Created price:', price.id, '- $199/month');
  console.log('Business tier created successfully!');
}

createBusinessTier().catch(console.error);
