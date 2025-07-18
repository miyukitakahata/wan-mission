module.exports = {
  loadStripe: jest.fn(() =>
    Promise.resolve({
      redirectToCheckout: jest.fn(() => Promise.resolve({ error: null })),
    })
  ),
};
// This mock simulates the Stripe.js library for testing purposes.
