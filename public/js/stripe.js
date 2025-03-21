/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51R55UmCfdduzqtH4wa0LXk7U60syYGXDJSJX3HEty1ju5C9PAFWbbfRFSugvVkpLNqWIBhNYUBItzOEFZIrV2ph100b8quUEai',
);

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
