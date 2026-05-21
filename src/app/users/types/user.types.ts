export interface UserGeo {
  lat: string;
  lng: string;
}

export interface UserAddress {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: UserGeo;
}

export interface UserCompany {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: UserAddress;
  phone: string;
  website: string;
  company: UserCompany;
}

export interface UserListParams {
  _limit?: number;
  _start?: number;
  _page?: number;
  name_like?: string;
  email_like?: string;
}

export interface UserListResult {
  users: User[];
  totalCount: number;
}

export type CreateUserPayload = Omit<User, 'id'>;

export type UpdateUserPayload = Omit<User, 'id'>;
