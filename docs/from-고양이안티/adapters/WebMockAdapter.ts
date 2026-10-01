import { PlatformAdapter } from './PlatformAdapter';

export class WebMockAdapter implements PlatformAdapter {
  async init(): Promise<void> {
    console.log('[WebMockAdapter] Initialized in web browser mode.');
  }

  async showRewardAd(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmAd = window.confirm(
        '🎬 [보상형 광고 시청 시뮬레이션]\n\n30초 광고가 재생 중입니다... (스폰서: 쉼터 동물 사랑)\n\n광고를 끝까지 시청하시겠습니까?'
      );
      if (confirmAd) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  async purchaseItem(productId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmPurchase = window.confirm(
        `💎 [인앱 결제 시뮬레이션]\n\n상품: ${productId}\n금액: 3,300원\n\n결제를 진행하시겠습니까?`
      );
      resolve(confirmPurchase);
    });
  }
}
