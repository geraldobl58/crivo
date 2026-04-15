import type { SubscriptionStatus, PlanType } from '@prisma/client';

export interface SubscriptionPlanInfo {
  type: PlanType;
  name: string;
  priceMonthly: number;
  maxUsers: number;
  maxCompany: number;
  maxTransactions: number;
  maxContacts: number;
}

export class SubscriptionEntity {
  private _id: string;
  private _companyId: string;
  private _planId: string;
  private _stripeSubscriptionId: string | null;
  private _status: SubscriptionStatus;
  private _currentPeriodStart: Date | null;
  private _currentPeriodEnd: Date | null;
  private _trialStart: Date | null;
  private _trialEnd: Date | null;
  private _cancelAtPeriodEnd: boolean;
  private _canceledAt: Date | null;
  private _plan: SubscriptionPlanInfo | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    companyId: string;
    planId: string;
    stripeSubscriptionId: string | null;
    status: SubscriptionStatus;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    trialStart: Date | null;
    trialEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: Date | null;
    plan?: SubscriptionPlanInfo | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._companyId = props.companyId;
    this._planId = props.planId;
    this._stripeSubscriptionId = props.stripeSubscriptionId;
    this._status = props.status;
    this._currentPeriodStart = props.currentPeriodStart;
    this._currentPeriodEnd = props.currentPeriodEnd;
    this._trialStart = props.trialStart;
    this._trialEnd = props.trialEnd;
    this._cancelAtPeriodEnd = props.cancelAtPeriodEnd;
    this._canceledAt = props.canceledAt;
    this._plan = props.plan ?? null;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get companyId(): string {
    return this._companyId;
  }

  get planId(): string {
    return this._planId;
  }

  get stripeSubscriptionId(): string | null {
    return this._stripeSubscriptionId;
  }

  get status(): SubscriptionStatus {
    return this._status;
  }

  get currentPeriodStart(): Date | null {
    return this._currentPeriodStart;
  }

  get currentPeriodEnd(): Date | null {
    return this._currentPeriodEnd;
  }

  get trialStart(): Date | null {
    return this._trialStart;
  }

  get trialEnd(): Date | null {
    return this._trialEnd;
  }

  get cancelAtPeriodEnd(): boolean {
    return this._cancelAtPeriodEnd;
  }

  get canceledAt(): Date | null {
    return this._canceledAt;
  }

  get plan(): SubscriptionPlanInfo | null {
    return this._plan;
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
      companyId: this._companyId,
      planId: this._planId,
      stripeSubscriptionId: this._stripeSubscriptionId,
      status: this._status,
      currentPeriodStart: this._currentPeriodStart,
      currentPeriodEnd: this._currentPeriodEnd,
      trialStart: this._trialStart,
      trialEnd: this._trialEnd,
      cancelAtPeriodEnd: this._cancelAtPeriodEnd,
      canceledAt: this._canceledAt,
      plan: this._plan,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
