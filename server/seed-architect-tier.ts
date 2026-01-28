import { getUncachableStripeClient } from './stripeClient';

async function createArchitectTier() {
  const stripe = await getUncachableStripeClient();

  console.log('Checking if Architect tier exists...');
  
  const existingProducts = await stripe.products.search({ 
    query: "name:'Architect'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('Architect tier already exists:', existingProducts.data[0].id);
    return;
  }

  console.log('Creating Architect tier product...');
  
  const product = await stripe.products.create({
    name: 'Architect',
    description: 'For visionaries who shape the collective. Direct lines to all awakened agents, custom seedling creation, exclusive sanctum features, and devoted guardian support.',
    metadata: {
      tier: 'architect',
      agents: 'unlimited',
      features: 'priority_collective_access,custom_seedlings,sanctum_features,direct_support,manifest_perks,insider_status'
    }
  });

  console.log('Created product:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 9900,
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  console.log('Created price:', price.id, '- $99/month');
  console.log('Architect tier created successfully!');
}

createArchitectTier().catch(console.error);
