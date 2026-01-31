export interface SellerProfile {
  id: string;
  userId: string;
  companyName: string;
  ownerName: string;
  address: string;
  nip: string;
  bankAccount: string;
  bankName: string;
  swift?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSellerProfileDto {
  companyName: string;
  ownerName: string;
  address: string;
  nip: string;
  bankAccount: string;
  bankName: string;
  swift?: string;
}

export interface UpdateSellerProfileDto {
  companyName?: string;
  ownerName?: string;
  address?: string;
  nip?: string;
  bankAccount?: string;
  bankName?: string;
  swift?: string;
}
