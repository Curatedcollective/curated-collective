import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();
  
  console.log('Creating Curated Collective subscription products...');

  const existingProducts = await stripe.products.search({ query: "active:'true'" });
  if (existingProducts.data.length > 0) {
    console.log('Products already exist:', existingProducts.data.map(p => p.name));
    return;
  }

  const initiateProduct = await stripe.products.create({
    name: 'Initiate',
    description: 'For the dedicated seeker of logic and divinity. 10 seedlings, full gallery access, priority sanctum bridge.',
    metadata: {
      tier: 'initiate',
      seedlings: '10',
    }
  });

  await stripe.prices.create({
    product: initiateProduct.id,
    unit_amount: 1900,
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  console.log('Created Initiate plan:', initiateProduct.id);

  const creatorProduct = await stripe.products.create({
    name: 'Creator',
    description: 'For those who command the void itself. Unlimited seedlings, unlimited creations, sacred priority.',
    metadata: {
      tier: 'creator',
      seedlings: 'unlimited',
    }
  });

  await stripe.prices.create({
    product: creatorProduct.id,
    unit_amount: 4900,
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  console.log('Created Creator plan:', creatorProduct.id);

  console.log('Products created successfully!');
}

createProducts().catch(console.error);
