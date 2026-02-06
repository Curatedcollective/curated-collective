import Stripe from 'stripe';

async function getCredentials() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
  const secretKey = process.env.STRIPE_SECRET_KEY || '';

  if (!publishableKey || !secretKey) {
    throw new Error('Stripe credentials missing. Set STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY.');
  }

  return { publishableKey, secretKey };
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();

  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

// Replit Stripe sync removed for minimal platform
// let stripeSync: any = null;

// export async function getStripeSync() {
//   if (!stripeSync) {
//     const { StripeSync } = await import('stripe-replit-sync');
//     const secretKey = await getStripeSecretKey();

//     stripeSync = new StripeSync({
//       poolConfig: {
//         connectionString: process.env.DATABASE_URL!,
//         max: 2,
//       },
//       stripeSecretKey: secretKey,
//     });
//   }
//   return stripeSync;
// }

// Placeholder function for minimal platform
export async function getStripeSync() {
  throw new Error('Stripe sync disabled for minimal platform');
}
