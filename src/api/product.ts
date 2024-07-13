import { MV4UserPermissionLevel, MV4UserProductType } from '@/api/user';

export interface MV4Product {
  productId: string;
  name: string;
  desc: string;
  categoryId: string;
  price: number;
  discount: number;
  canUseBalance: boolean;
  canUseFBCoins: boolean;
}

export interface MV4ProductFull {
  productId: string;
  name: string;
  desc: string;
  categoryId: string;
  price: number;
  discount: number;
  canBuy: boolean;
  needPlan: MV4UserProductType;
  showForAnotherPlans: boolean;
  needPermission: MV4UserPermissionLevel;
  canUseBalance: boolean;
  canUseFBCoins: boolean;
  itemId: string;
  itemAmount: number;
}

export interface MV4ProductCategory {
  categoryId: string;
  name: string;
}

export interface MV4ProductCategoryFull {
  categoryId: string;
  name: string;
  needPlan: MV4UserProductType;
  needPermission: MV4UserPermissionLevel;
}
