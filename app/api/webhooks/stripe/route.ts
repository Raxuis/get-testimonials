import { env } from "@/env";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (req: NextRequest) => {
  const body = await req.text();

  const stripeSignature = req.headers.get('stripe-signature');

  if (!stripeSignature) {
    return NextResponse.json({ error: "No stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = Stripe.webhooks.constructEvent(
      body,
      stripeSignature,
      env.STRIPE_WEBHOOK_SECRET
    );
  }
  catch (err) {
    return NextResponse.json({ error: "Invalid stripe signature" }, { status: 400 });
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;

      const user = await prisma.user.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
      })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "PREMIUM",
        },
      })

      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const user = await prisma.user.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
      })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "PREMIUM",
        },
      })

      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await prisma.user.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
      })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "FREE",
        },
      })
      break;
    }
    default: {
      console.log("Unhandled event", event);
    }
  }
  return NextResponse.json({ received: true });
}