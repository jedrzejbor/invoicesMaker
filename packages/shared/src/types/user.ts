export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithProfile extends User {
  sellerProfile?: SellerProfile | null;
}

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
