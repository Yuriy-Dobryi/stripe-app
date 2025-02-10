import React, { ReactNode, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import "./styles.css";

const stripePromise = loadStripe(
  "pk_test_51QmzT9JMmzXmYWzyERxSQjWVLN2E5bArhOw8Jw2rfK8bVh5a6Vy5BnIQjtL3sZLPjziE1aVlAlcPwDTfURydR0Rt00bfBm0ZCV"
);

const StripeProvider = ({ children }: { children: ReactNode }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardNumberElement)!,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/payment-custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 5000, paymentMethodId: paymentMethod.id }),
    });

    const data = await response.json();
    if (!data.clientSecret) {
      alert("Error while retrieving clientSecret");
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmCardPayment(
      data.clientSecret
    );
    setLoading(false);

    if (confirmError) {
      alert(confirmError.message);
    } else {
      alert("Payment successful!");
    }
  };

  return (
    <StripeProvider>
      <form id='payment-form' onSubmit={handleSubmit}>
        <div className='card-item'>
          <label htmlFor='card-number'>Card Number</label>
          <CardNumberElement className='stripe-input' />
        </div>
        <div className='card-row'>
          <div className='card-item'>
            <label htmlFor='card-expiry'>Expiration Date</label>
            <CardExpiryElement className='stripe-input' />
          </div>
          <div className='card-item'>
            <label htmlFor='card-cvc'>CVV</label>
            <CardCvcElement className='stripe-input' />
          </div>
        </div>

        <button id='pay-button' type='submit' disabled={loading}>
          {loading ? "Processing..." : "Pay"}
        </button>
        {loading && <div className='spinner'></div>}
      </form>
    </StripeProvider>
  );
};

export default CheckoutForm;
