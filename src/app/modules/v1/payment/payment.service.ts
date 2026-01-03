import { ParticipantStatus, PaymentStatus } from "@prisma/client";
import { stripe } from "../../../configs/stripe";
import { prisma } from "../../../db/prisma";
import { CustomError } from "../../../utils/error";
import { sendMail } from "../../../utils/sendMail";

// 1. Create Payment Intent (User intends to pay)
const createPaymentIntent = async (
  userId: string,
  event: any,
  amount: number
) => {
  // Convert amount to cents for Stripe
  const amountInCents = Math.round(amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: event.currency.toLowerCase(),
    metadata: {
      userId,
      eventId: event.id,
    },
    automatic_payment_methods: { enabled: true },
  });

  // Create local Payment Record
  const payment = await prisma.payment.create({
    data: {
      userId,
      eventId: event.id,
      amount: amount,
      currency: event.currency,
      stripe_payment_intent_id: paymentIntent.id,
      status: PaymentStatus.REQUIRES_PAYMENT_METHOD,
    },
  });

  // Create PENDING participant
  await prisma.eventParticipant.create({
    data: {
      userId,
      eventId: event.id,
      status: ParticipantStatus.PENDING_PAYMENT,
      paymentId: payment.id,
    },
  });

  return { client_secret: paymentIntent.client_secret, paymentId: payment.id };
};

// 2. Confirm Payment (Called usually by Webhook, but simulating endpoint for prompt)
const confirmPaymentSuccess = async (paymentIntentId: string) => {
  const payment = await prisma.payment.findFirst({
    where: { stripe_payment_intent_id: paymentIntentId },
    include: {
      user: { include: { user: true } },
      event: { include: { host: { include: { user: true } } } },
    },
  });

  if (!payment)
    throw CustomError.notFound({ message: "Payment record not found" });

  // Update DB
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCEEDED },
    }),
    prisma.eventParticipant.update({
      where: { paymentId: payment.id }, // Assuming unique relation in schema
      data: { status: ParticipantStatus.CONFIRMED },
    }),
    prisma.event.update({
      where: { id: payment.eventId },
      data: { currentParticipants: { increment: 1 } },
    }),
  ]);

  // Emails

  const userEmail = {
    to: payment.user.user.email,
    subject: "Payment Successful & Joined",
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
};

// 3. Cancel Payment / Refund
const cancelPayment = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw CustomError.notFound({ message: "Payment not found" });
  if (payment.userId !== userId)
    throw CustomError.unauthorized({ message: "Unauthorized" });

  // Refund in Stripe
  if (
    payment.status === PaymentStatus.SUCCEEDED &&
    payment.stripe_payment_intent_id
  ) {
    await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
    });
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.CANCELLED },
  });

  await prisma.eventParticipant.update({
    where: { paymentId: paymentId },
    data: { status: ParticipantStatus.CANCELLED },
  });

  const userEmail = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (userEmail)
    await sendMail({
      to: userEmail.email,
      subject: "Payment/Event Cancelled",
      text: `Your payment of ${payment.amount} has been cancelled and a refund has been initiated.`,
      html: `<p>Your payment of <strong>${payment.amount}</strong> has been cancelled and a refund has been initiated.</p>`,
    });

  return { message: "Payment cancelled and refund initiated" };
};

export const paymentService = {
  createPaymentIntent,
  confirmPaymentSuccess,
  cancelPayment,
};
