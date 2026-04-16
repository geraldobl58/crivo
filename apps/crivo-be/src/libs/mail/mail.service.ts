import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  welcomeTemplate,
  paymentSucceededTemplate,
  paymentFailedTemplate,
  subscriptionCanceledTemplate,
  trialExpiringTemplate,
} from './templates';

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

export interface WelcomeMailInput {
  to: string;
  companyName: string;
  planType: string;
  frontendUrl: string;
}

export interface PaymentSucceededMailInput {
  to: string;
  companyName: string;
  amountPaid: number;
  currency: string;
  invoiceId: string;
}

export interface PaymentFailedMailInput {
  to: string;
  companyName: string;
  amountDue: number;
  currency: string;
  portalUrl?: string;
}

export interface SubscriptionCanceledMailInput {
  to: string;
  companyName: string;
}

export interface TrialExpiringMailInput {
  to: string;
  companyName: string;
  daysLeft: number;
  frontendUrl: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter!: Transporter;

  private readonly from: string = 'Crivo <noreply@crivo.app>';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('MAILTRAP_HOST'),
      port: Number(this.config.getOrThrow<string>('MAILTRAP_PORT')),
      auth: {
        user: this.config.getOrThrow<string>('MAILTRAP_USER'),
        pass: this.config.getOrThrow<string>('MAILTRAP_PASSWORD'),
      },
    });

    this.logger.log('Mail transporter initialized (Mailtrap)');
  }

  async send(input: SendMailInput): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });

      this.logger.log(`Email sent to ${input.to}: "${input.subject}"`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${input.to}`, error);
      // Não lança exceção — email é best-effort, não deve bloquear o fluxo principal
    }
  }

  async sendWelcome(input: WelcomeMailInput): Promise<void> {
    await this.send({
      to: input.to,
      subject: 'Bem-vindo ao Crivo! 🎉',
      html: welcomeTemplate(input),
    });
  }

  async sendPaymentSucceeded(input: PaymentSucceededMailInput): Promise<void> {
    const formattedAmount = this.formatCurrency(
      input.amountPaid,
      input.currency,
    );

    await this.send({
      to: input.to,
      subject: `Pagamento confirmado — ${formattedAmount}`,
      html: paymentSucceededTemplate({ ...input, formattedAmount }),
    });
  }

  async sendPaymentFailed(input: PaymentFailedMailInput): Promise<void> {
    const formattedAmount = this.formatCurrency(
      input.amountDue,
      input.currency,
    );

    await this.send({
      to: input.to,
      subject: 'Problema com seu pagamento — ação necessária',
      html: paymentFailedTemplate({ ...input, formattedAmount }),
    });
  }

  async sendSubscriptionCanceled(
    input: SubscriptionCanceledMailInput,
  ): Promise<void> {
    await this.send({
      to: input.to,
      subject: 'Sua assinatura foi cancelada',
      html: subscriptionCanceledTemplate(input),
    });
  }

  async sendTrialExpiring(input: TrialExpiringMailInput): Promise<void> {
    await this.send({
      to: input.to,
      subject: `Seu trial expira em ${input.daysLeft} dia${input.daysLeft > 1 ? 's' : ''}`,
      html: trialExpiringTemplate(input),
    });
  }

  private formatCurrency(amountInCents: number, currency: string): string {
    const amount = amountInCents / 100;
    const locale = currency === 'brl' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }
}
