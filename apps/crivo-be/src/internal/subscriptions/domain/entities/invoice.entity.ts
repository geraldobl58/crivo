import type { InvoiceStatus } from '@prisma/client';

export class InvoiceEntity {
  private _id: string;
  private _subscriptionId: string;
  private _stripeInvoiceId: string | null;
  private _stripePaymentIntentId: string | null;
  private _status: InvoiceStatus;
  private _amountDue: number;
  private _amountPaid: number;
  private _currency: string;
  private _invoiceUrl: string | null;
  private _invoicePdf: string | null;
  private _periodStart: Date | null;
  private _periodEnd: Date | null;
  private _paidAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    subscriptionId: string;
    stripeInvoiceId: string | null;
    stripePaymentIntentId: string | null;
    status: InvoiceStatus;
    amountDue: number;
    amountPaid: number;
    currency: string;
    invoiceUrl: string | null;
    invoicePdf: string | null;
    periodStart: Date | null;
    periodEnd: Date | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._subscriptionId = props.subscriptionId;
    this._stripeInvoiceId = props.stripeInvoiceId;
    this._stripePaymentIntentId = props.stripePaymentIntentId;
    this._status = props.status;
    this._amountDue = props.amountDue;
    this._amountPaid = props.amountPaid;
    this._currency = props.currency;
    this._invoiceUrl = props.invoiceUrl;
    this._invoicePdf = props.invoicePdf;
    this._periodStart = props.periodStart;
    this._periodEnd = props.periodEnd;
    this._paidAt = props.paidAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get subscriptionId(): string {
    return this._subscriptionId;
  }

  get stripeInvoiceId(): string | null {
    return this._stripeInvoiceId;
  }

  get stripePaymentIntentId(): string | null {
    return this._stripePaymentIntentId;
  }

  get status(): InvoiceStatus {
    return this._status;
  }

  get amountDue(): number {
    return this._amountDue;
  }

  get amountPaid(): number {
    return this._amountPaid;
  }

  get currency(): string {
    return this._currency;
  }

  get invoiceUrl(): string | null {
    return this._invoiceUrl;
  }

  get invoicePdf(): string | null {
    return this._invoicePdf;
  }

  get periodStart(): Date | null {
    return this._periodStart;
  }

  get periodEnd(): Date | null {
    return this._periodEnd;
  }

  get paidAt(): Date | null {
    return this._paidAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON() {
    return {
      id: this._id,
      subscriptionId: this._subscriptionId,
      stripeInvoiceId: this._stripeInvoiceId,
      stripePaymentIntentId: this._stripePaymentIntentId,
      status: this._status,
      amountDue: this._amountDue,
      amountPaid: this._amountPaid,
      currency: this._currency,
      invoiceUrl: this._invoiceUrl,
      invoicePdf: this._invoicePdf,
      periodStart: this._periodStart,
      periodEnd: this._periodEnd,
      paidAt: this._paidAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
