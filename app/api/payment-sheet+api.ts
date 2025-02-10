import { CURRENCY } from "@/utils/config";
import { stripe } from "@/utils/stripe-server";
import { validateRequest } from "@/utils/validateRequest";
import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.number().positive().min(1),
});

export async function POST(req: Request) {
  const { error, data } = await validateRequest(req, paymentSchema);
  if (error) {
    return Response.json({ error }, { status: error.status });
  }

  if (data) {
    const { amount } = data;
    try {
      // Use an existing Customer ID if this is a returning customer.
      const customer = await stripe.customers.create();
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2025-01-27.acacia" }
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: CURRENCY,
        customer: customer.id,
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter
        // is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return Response.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      });
    } catch (error: any) {
      return Response.json(
        {
          error: {
            status: 500,
            message: error.message,
          },
        },
        { status: 500 }
      );
    }
  }
}
