import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { useCallback, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";

type FetchPaymentSheetData = (params: { amount: number }) => Promise<{
  clientSecret: string;
  ephemeralKey: string;
  customerId: string;
}>;

const fetchPaymentSheetData: FetchPaymentSheetData = async ({ amount }) => {
  const response = await fetch(`/api/payment-create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw error;
  }
  return response.json();
};

type Props = { amount: number };

const usePaymentSheet = ({ amount }: Props) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const handleError = (title: string, message?: string) => {
    Alert.alert(title, message || "Something went wrong");
  };

  const initializePaymentSheet = useCallback(async () => {
    setLoading(true);
    try {
      const { clientSecret, ephemeralKey, customerId } =
        await fetchPaymentSheetData({ amount });

      // Use Mock payment data: https://docs.stripe.com/payments/accept-a-payment?platform=react-native&ui=payment-sheet#react-native-test
      const { error: stripeError } = await initPaymentSheet({
        merchantDisplayName: "Stripe-app",
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
        // methods that complete payment after a delay, like SEPA Debit and Sofort.
        // allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: "Jane Doe",
          email: "jenny.rosen@example.com",
          phone: "888-888-8888",
        },
        returnURL: Linking.createURL("stripe-redirect"),
        // Enable Apple Pay:
        // https://docs.stripe.com/payments/accept-a-payment?platform=react-native&ui=payment-sheet#add-apple-pay
        // applePay: {
        //   merchantCountryCode: "US",
        // },
        appearance,
      });

      if (stripeError) {
        handleError(
          `Error init code: ${stripeError.code}`,
          stripeError.message
        );
        return { isReady: false };
      }

      return { isReady: true };
    } catch (err: any) {
      handleError("Failed to fetch payment data", err.message);
      return { isReady: false };
    } finally {
      setLoading(false);
    }
  }, [amount]);

  const openPaymentSheet = useCallback(async () => {
    const { isReady } = await initializePaymentSheet();

    if (isReady) {
      const { error } = await presentPaymentSheet();
      if (error) {
        handleError(`Error code: ${error.code}`, error.message);
      } else {
        Alert.alert("Success", "Your order is confirmed!");
      }
    }
  }, [initializePaymentSheet, presentPaymentSheet]);

  // If the amount is static, initializePaymentSheet can be called once before presentPaymentSheet instead of each time
  // useEffect(() => {
  //   initializePaymentSheet();
  // }, []);

  return { openPaymentSheet, loading };
};

export default usePaymentSheet;

const appearance = {
  colors: {
    primary: "#00E5FF",
    secondaryText: "#B3D8D1",
    background: "#121212",
    componentBackground: "#1E1E1E",
    componentBorder: "#333333",
    componentDivider: "#444444",
    componentText: "#E0E6ED",
    placeholderText: "#8899A6",
    icon: "#00E5FF",
    error: "#FF1744",
  },
  shapes: {
    borderRadius: 8,
    borderWidth: 1.5,
    shadow: {
      color: "#00E5FF",
      opacity: 0.3,
      blurRadius: 4,
      offset: { x: 0, y: 0 },
    },
  },
  primaryButton: {
    colors: {
      background: "#00E5FF",
      border: "#0097A7",
      text: "#121212",
    },
    shapes: {
      borderRadius: 6,
    },
  },
};
