export interface PlatformAdapter {
  init(): Promise<void>;
  showRewardAd(): Promise<boolean>;
  purchaseItem(productId: string): Promise<boolean>;
}
