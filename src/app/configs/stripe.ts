import Stripe from "stripe";
import { envSecrets } from "./env";

export const stripe = new Stripe(envSecrets.STRIPE_SECRET_KEY);
