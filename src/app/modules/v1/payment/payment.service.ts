import { Event, ParticipantStatus, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";
import { stripe } from "../../../configs/stripe";
import { prisma } from "../../../db/prisma";
import { CustomError } from "../../../utils/error";
import { sendMail } from "../../../utils/sendMail";

const createPaymentIntent = async (
  userId: string,
  userEmail: string,
  event: Event,
  amount: number
) => {
  const amountInCents = amount * 100;

  const paymentIntent = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: event.currency.toLowerCase(),
          product_data: {
            name: event.title,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://web.programming-hero.com/home",
    cancel_url: "https://phitron.io/",
    metadata: {
      userId: userId,
      userEmail: userEmail,
      hostId: event.hostId,
      eventId: event.id,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        userId,
        eventId: event.id,
        amount: amount,
        currency: event.currency,
        transactionId: paymentIntent.id,
        status: PaymentStatus.UNPAID,
      },
    });

    await tx.eventParticipant.create({
      data: {
        userId,
        eventId: event.id,
        status: ParticipantStatus.PENDING_PAYMENT,
        paymentId: payment.id,
      },
    });

    return payment;
  });

  return { paymentIntentUrl: paymentIntent.url, payment: result };
};

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  await prisma.$transaction(async (tx) => {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        console.log(session.id);
        const updatedPayment = await tx.payment.update({
          where: { transactionId: session.id },
          data: {
            status: PaymentStatus.UNCONFIRMED,
          },
        });

        if (updatedPayment) {
          await tx.eventParticipant.update({
            where: { paymentId: updatedPayment.id },
            data: { status: ParticipantStatus.WAITLISTED },
          });
        }
        break;
      }

      case "payment_intent.canceled": {
        const session = event.data.object as any;
        const updatedPayment = await tx.payment.update({
          where: { transactionId: session.id },
          data: {
            status: PaymentStatus.CANCELLED,
          },
        });

        if (updatedPayment) {
          await tx.eventParticipant.update({
            where: { paymentId: updatedPayment.id },
            data: { status: ParticipantStatus.CANCELLED },
          });
        }
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
        return;
      }
    }
  });
};

const confirmPaymentSuccess = async (paymentId: string) => {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId },
    include: {
      user: { select: { user: { select: { email: true } } } },
      event: {
        select: {
          title: true,
          host: { select: { user: { select: { email: true } } } },
        },
      },
    },
  });

  if (!payment || payment.status !== PaymentStatus.UNCONFIRMED) {
    const error = CustomError.badRequest({
      message: "Invalid payment or already confirmed",
      errors: ["Payment not found or status invalid"],
      hints: "Check the payment ID and status",
    });
    throw error;
  }

  const eventParticipant = await prisma.eventParticipant.findFirst({
    where: {
      paymentId: payment.id,
      eventId: payment.eventId,
      userId: payment.userId,
    },
  });

  if (
    !eventParticipant ||
    eventParticipant.status !== ParticipantStatus.WAITLISTED
  ) {
    const error = CustomError.badRequest({
      message: "Invalid event participant status",
      errors: ["Event participant not found or status invalid"],
      hints: "Check the event participant record",
    });
    throw error;
  }

  const response = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCEEDED },
    });
    await tx.eventParticipant.update({
      where: { paymentId: payment.id },
      data: { status: ParticipantStatus.PAID },
    });
    await tx.event.update({
      where: { id: payment.eventId },
      data: { currentParticipants: { increment: 1 } },
    });
    return updatedPayment;
  });

  // Emails

  const userEmail = {
    to: payment.user.user.email,
    subject: "Payment Confirmed & Joined",
    text: `You have successfully paid ${payment.amount} and joined the event ${payment.event.title}.`,
    html: `<p>You have successfully paid <strong>${payment.amount}</strong> and joined the event <strong>${payment.event.title}</strong>.</p>`,
  };

  await sendMail(userEmail);

  const hostEmail = {
    to: payment.event.host.user.email,
    subject: "New Paid Participant",
    text: `A new participant has joined your event ${payment.event.title}.`,
    html: `<p>A new participant has joined your event <strong>${payment.event.title}</strong>.</p>`,
  };

  await sendMail(hostEmail);

  return response;
};


export const paymentService = {
  createPaymentIntent,
  confirmPaymentSuccess,
  handleStripeWebhookEvent,
};
