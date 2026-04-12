import { Role } from '../enums/user.role.enum';

export class UserEntity {
  readonly id: string;
  readonly keycloakId: string;
  readonly email: string;
  readonly firstname: string | null;
  readonly lastname: string | null;
  readonly role: Role;
  readonly companyId: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    keycloakId: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
    role: Role;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.keycloakId = props.keycloakId;
    this.email = props.email;
    this.firstname = props.firstname;
    this.lastname = props.lastname;
    this.role = props.role;
    this.companyId = props.companyId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
