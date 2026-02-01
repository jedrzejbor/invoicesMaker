import type { SellerProfile } from './seller-profile.js';

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithProfile extends User {
  sellerProfile?: SellerProfile | null;
}
