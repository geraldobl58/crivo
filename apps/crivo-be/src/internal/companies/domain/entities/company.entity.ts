export interface CompanySubscriptionInfo {
  planName: string;
  planType: string;
  status: string;
  currentPeriodEnd: Date;
}

export class CompanyEntity {
  private _id: string;
  private _name: string;
  private _taxId: string | null;
  private _stripeCustomerId: string | null;
  private _parentCompanyId: string | null;
  private _subscription: CompanySubscriptionInfo | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    taxId: string | null;
    stripeCustomerId: string | null;
    parentCompanyId: string | null;
    subscription?: CompanySubscriptionInfo | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._taxId = props.taxId;
    this._stripeCustomerId = props.stripeCustomerId;
    this._parentCompanyId = props.parentCompanyId;
    this._subscription = props.subscription ?? null;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get taxId(): string | null {
    return this._taxId;
  }

  get stripeCustomerId(): string | null {
    return this._stripeCustomerId;
  }

  set stripeCustomerId(value: string | null) {
    this._stripeCustomerId = value;
  }

  get parentCompanyId(): string | null {
    return this._parentCompanyId;
  }

  get subscription(): CompanySubscriptionInfo | null {
    return this._subscription;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  set updatedAt(value: Date) {
    this._updatedAt = value;
  }
}
