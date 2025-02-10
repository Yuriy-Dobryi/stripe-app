import { CURRENCY } from "@/utils/config";
import { stripe } from "@/utils/stripe-server";
import { validateRequest } from "@/utils/validateRequest";
import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.number().positive().min(1),
  paymentMethodId: z.string().optional(),
});

export async function POST(req: Request) {
  const { error, data } = await validateRequest(req, paymentSchema);
  if (error) {
    return new Response(JSON.stringify({ error }), {
      headers: { "Content-Type": "application/json" },
      status: error.status,
    });
  }

  if (data) {
    const { amount, paymentMethodId } = data;
    try {
      const customer = await stripe.customers.create();

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2025-01-27.acacia" }
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: CURRENCY,
        customer: customer.id,
        payment_method: paymentMethodId,
        automatic_payment_methods: { enabled: true },
      });

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customer: customer.id,
          publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (error: any) {
      console.error("Payment error:", error);
      return new Response(
        JSON.stringify({
          error: {
            status: 500,
            message: error.message || "Payment error",
          },
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  }
}
