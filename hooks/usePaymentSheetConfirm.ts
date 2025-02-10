import { Alert } from "react-native";
import { useCallback, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { paymentSchema } from "@/app/api/payment-custom+api";
import { z } from "zod";

type PaymentSheetDataParams = z.infer<typeof paymentSchema>;

const fetchPaymentSheetData = async ({
  amount,
  paymentMethodId,
}: PaymentSheetDataParams) => {
  const response = await fetch(`/api/payment-custom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, paymentMethodId }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw error;
  }

  return response.json();
};

type Props = { amount: number };

const usePaymentSheetConfirm = ({ amount }: Props) => {
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [loading, setLoading] = useState(false);

  const handleError = (title: string, message?: string) => {
    Alert.alert(title, message || "Something went wrong");
  };

  const onCheckout = useCallback(async () => {
    setLoading(true);
    try {
      const { paymentMethod, error: paymentMethodError } =
        await createPaymentMethod({
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {
              name: "Jane Doe",
              email: "jenny.rosen@example.com",
              phone: "888-888-8888",
            },
          },
        });

      const { clientSecret } = await fetchPaymentSheetData({
        amount,
        paymentMethodId: paymentMethod?.id,
      });
      if (!clientSecret) {
        throw new Error("Failed to get clientSecret");
      }

      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });
      if (error) {
        handleError("Payment error", error.message);
      } else if (paymentIntent?.status === "Succeeded") {
        Alert.alert("Success", "Your payment has been processed!");
      } else {
        handleError(
          "Payment not completed",
          `Status: ${paymentIntent?.status}`
        );
      }
    } catch (err: any) {
      handleError("Payment error", err.message);
    } finally {
      setLoading(false);
    }
  }, [amount, confirmPayment]);

  return { onCheckout, loading };
};

export default usePaymentSheetConfirm;
