import type { PlanType } from '@prisma/client';

export class PlanEntity {
  private _id: string;
  private _type: PlanType;
  private _name: string;
  private _description: string | null;
  private _priceMonthly: number;
  private _stripePriceId: string | null;
  private _trialDays: number;
  private _maxUsers: number;
  private _maxCompany: number;
  private _maxTransactions: number;
  private _maxContacts: number;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    type: PlanType;
    name: string;
    description: string | null;
    priceMonthly: number;
    stripePriceId: string | null;
    trialDays: number;
    maxUsers: number;
    maxCompany: number;
    maxTransactions: number;
    maxContacts: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._type = props.type;
    this._name = props.name;
    this._description = props.description;
    this._priceMonthly = props.priceMonthly;
    this._stripePriceId = props.stripePriceId;
    this._trialDays = props.trialDays;
    this._maxUsers = props.maxUsers;
    this._maxCompany = props.maxCompany;
    this._maxTransactions = props.maxTransactions;
    this._maxContacts = props.maxContacts;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get type(): PlanType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get description(): string | null {
    return this._description;
  }

  set description(value: string | null) {
    this._description = value;
  }

  get priceMonthly(): number {
    return this._priceMonthly;
  }

  set priceMonthly(value: number) {
    this._priceMonthly = value;
  }

  get stripePriceId(): string | null {
    return this._stripePriceId;
  }

  set stripePriceId(value: string | null) {
    this._stripePriceId = value;
  }

  get trialDays(): number {
    return this._trialDays;
  }

  set trialDays(value: number) {
    this._trialDays = value;
  }

  get maxUsers(): number {
    return this._maxUsers;
  }

  get maxCompany(): number {
    return this._maxCompany;
  }

  get maxTransactions(): number {
    return this._maxTransactions;
  }

  get maxContacts(): number {
    return this._maxContacts;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
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
      type: this._type,
      name: this._name,
      description: this._description,
      priceMonthly: this._priceMonthly,
      stripePriceId: this._stripePriceId,
      trialDays: this._trialDays,
      maxUsers: this._maxUsers,
      maxCompany: this._maxCompany,
      maxTransactions: this._maxTransactions,
      maxContacts: this._maxContacts,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
