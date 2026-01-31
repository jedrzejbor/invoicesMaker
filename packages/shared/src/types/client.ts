export interface Client {
  id: string;
  userId: string;
  name: string;
  address: string;
  country: string;
  nip: string;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDto {
  name: string;
  address: string;
  country: string;
  nip: string;
  email?: string;
}

export interface UpdateClientDto {
  name?: string;
  address?: string;
  country?: string;
  nip?: string;
  email?: string;
}
