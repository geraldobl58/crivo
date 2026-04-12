export class CompanyEntity {
  readonly id: string;
  readonly name: string;
  readonly taxId: string;
  readonly stripeCustomerId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    taxId: string;
    stripeCustomerId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.taxId = props.taxId;
    this.stripeCustomerId = props.stripeCustomerId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
