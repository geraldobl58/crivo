import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import StripeLib from 'stripe';

type StripeInstance = InstanceType<typeof StripeLib>;

@Injectable()
export class StripeService implements OnModuleInit {
  private stripeClient!: StripeInstance;
  private webhookSecret!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const secretKey = this.config.getOrThrow<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    this.stripeClient = new StripeLib(secretKey, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async createCustomer(params: {
    email: string;
    metadata: Record<string, string>;
  }): Promise<any> {
    return this.stripeClient.customers.create({
      email: params.email,
      metadata: params.metadata,
    });
  }

  /**
   * Resolves a Stripe identifier to a price ID.
   * If the value is a product ID (prod_*), fetches its default/active price.
   */
  async resolvePriceId(stripePriceOrProductId: string): Promise<string> {
    if (stripePriceOrProductId.startsWith('price_')) {
      return stripePriceOrProductId;
    }

    if (stripePriceOrProductId.startsWith('prod_')) {
      const prices = await this.stripeClient.prices.list({
        product: stripePriceOrProductId,
        active: true,
        limit: 1,
      });

      if (prices.data.length === 0) {
        throw new Error(
          `No active price found for product ${stripePriceOrProductId}`,
        );
      }

      return prices.data[0].id;
    }

    throw new Error(
      `Invalid Stripe identifier: ${stripePriceOrProductId}. Expected price_* or prod_*`,
    );
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  }): Promise<any> {
    const resolvedPriceId = await this.resolvePriceId(params.priceId);

    return this.stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });
  }

  async retrieveSubscription(subscriptionId: string): Promise<any> {
    return this.stripeClient.subscriptions.retrieve(subscriptionId);
  }

  async deleteCustomer(customerId: string): Promise<any> {
    return this.stripeClient.customers.del(customerId);
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): any {
    return this.stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );
  }
}
