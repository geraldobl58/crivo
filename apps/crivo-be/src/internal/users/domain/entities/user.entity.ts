import { Role } from '../enums/user.role.enum';

export class UserEntity {
  private _id: string;
  private _keycloakId: string;
  private _email: string;
  private _firstname: string | null;
  private _lastname: string | null;
  private _role: Role;
  private _companyId: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    keycloakId: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
    role: Role;
    companyId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._keycloakId = props.keycloakId;
    this._email = props.email;
    this._firstname = props.firstname;
    this._lastname = props.lastname;
    this._role = props.role;
    this._companyId = props.companyId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get keycloakId(): string {
    return this._keycloakId;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get firstname(): string | null {
    return this._firstname;
  }

  set firstname(value: string | null) {
    this._firstname = value;
  }

  get lastname(): string | null {
    return this._lastname;
  }

  set lastname(value: string | null) {
    this._lastname = value;
  }

  get role(): Role {
    return this._role;
  }

  set role(value: Role) {
    this._role = value;
  }

  get companyId(): string | null {
    return this._companyId;
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

  toJSON() {
    return {
      id: this._id,
      keycloakId: this._keycloakId,
      email: this._email,
      firstname: this._firstname,
      lastname: this._lastname,
      role: this._role,
      companyId: this._companyId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
