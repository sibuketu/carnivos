/**
 * Primal Logic - Shop Screen
 *
 * ショップ画面: ドット絵UIやその他のカスタマイズアイテムを購入
 */

import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../utils/i18n';
import { logError } from '../utils/errorHandler';
import './ShopScreen.css';

interface ShopScreenProps {
  onBack: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'ui' | 'theme' | 'other';
  isPurchased: boolean;
  isDebugFree: boolean; // デバッグモードで無料
}

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const { t } = useTranslation();
  const { debugMode } = useSettings();
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: 'dot-ui',
      name: t('shop.pixelArtUI'),
      description: t('shop.pixelArtUIDescription'),
      price: 980,
      icon: '🎨',
      category: 'ui',
      isPurchased: false,
      isDebugFree: true,
    },
    // 将来的に他のアイテムを追加可能
  ]);
  const [isDotUIEnabled, setIsDotUIEnabled] = useState(() => {
    return localStorage.getItem('primal_logic_dot_ui_enabled') === 'true';
  });

  // 購入状態を読み込み
  useEffect(() => {
    const purchasedItems = JSON.parse(localStorage.getItem('primal_logic_shop_purchased') || '[]');
    setShopItems((items) =>
      items.map((item) => ({
        ...item,
        isPurchased: purchasedItems.includes(item.id),
      }))
    );
  }, []);

  // ドット絵UI変更イベントをリッスン
  useEffect(() => {
    const handleDotUIChange = () => {
      const enabled = localStorage.getItem('primal_logic_dot_ui_enabled') === 'true';
      setIsDotUIEnabled(enabled);
    };
    window.addEventListener('dotUIChanged', handleDotUIChange);
    return () => {
      window.removeEventListener('dotUIChanged', handleDotUIChange);
    };
  }, []);

  const handlePurchase = async (item: ShopItem) => {
    // デバッグモードで無料アイテムの場合
    if (debugMode && item.isDebugFree) {
      const purchasedItems = JSON.parse(
        localStorage.getItem('primal_logic_shop_purchased') || '[]'
      );
      if (!purchasedItems.includes(item.id)) {
        purchasedItems.push(item.id);
        localStorage.setItem('primal_logic_shop_purchased', JSON.stringify(purchasedItems));
        setShopItems((items) =>
          items.map((i) => (i.id === item.id ? { ...i, isPurchased: true } : i))
        );
        alert(t('shop.purchaseSuccess', { name: item.name }));
      }
      return;
    }

    // Stripe決済処理（環境変数が設定されている場合のみ実行）
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (stripeKey && typeof window !== 'undefined' && (window as any).Stripe) {
      try {
        // Stripe Checkout Sessionを作成
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: item.price,
            currency: 'jpy',
            metadata: {
              itemId: item.id,
              itemName: item.name,
            },
          }),
        });

        if (response.ok) {
          const { sessionId } = await response.json();
          const stripe = (window as any).Stripe(stripeKey);
          await stripe.redirectToCheckout({ sessionId });
          return; // リダイレクトされるため、ここで終了
        }
      } catch (error) {
        logError(error, { action: 'handlePurchase', itemId: item.id });
        // Stripe決済に失敗した場合は、モック処理にフォールバック
      }
    }

    // Stripe決済が利用できない場合、または失敗した場合はモック処理
    if (import.meta.env.DEV) {
      // デバッグモードでは無料で購入可能
      const purchasedItems = JSON.parse(
        localStorage.getItem('primal_logic_shop_purchased') || '[]'
      );
      if (!purchasedItems.includes(item.id)) {
        purchasedItems.push(item.id);
        localStorage.setItem('primal_logic_shop_purchased', JSON.stringify(purchasedItems));
      }
      setShopItems((items) =>
        items.map((i) => (i.id === item.id ? { ...i, isPurchased: true } : i))
      );
      alert(t('shop.purchaseSuccessDebug').replace('{name}', item.name));
    } else {
      alert(t('shop.paymentPending'));
    }
  };

  const handleUse = (item: ShopItem) => {
    if (item.id === 'dot-ui') {
      // ドット絵UIを有効化
      localStorage.setItem('primal_logic_dot_ui_enabled', 'true');
      setIsDotUIEnabled(true);
      window.dispatchEvent(new CustomEvent('dotUIChanged'));
      alert(t('shop.enablePixelArtUISuccess'));
      window.location.reload();
    }
  };

  const handleDisable = (item: ShopItem) => {
    if (item.id === 'dot-ui') {
      // ドット絵UIを無効化
      localStorage.removeItem('primal_logic_dot_ui_enabled');
      setIsDotUIEnabled(false);
      window.dispatchEvent(new CustomEvent('dotUIChanged'));
      alert(t('shop.disablePixelArtUISuccess'));
      window.location.reload();
    }
  };

  return (
    <div className="shop-screen-container">
      <div className="shop-screen-content">
        <div className="screen-header">
          <button className="back-button" onClick={onBack} aria-label={t('common.backAriaLabel')}>
            ←
          </button>
          <h1 className="screen-header-title">🛍️ {t('shop.title')}</h1>
        </div>

        {debugMode && (
          <div className="shop-debug-notice">
            <p>⚠️ {t('shop.debugMode')}</p>
          </div>
        )}

        <div className="shop-items-section">
          <h2 className="shop-section-title">{t('shop.uiCustomization')}</h2>
          <div className="shop-items-list">
            {shopItems
              .filter((item) => item.category === 'ui')
              .map((item) => (
                <div key={item.id} className="shop-item-card">
                  <div className="shop-item-header">
                    <span className="shop-item-icon">{item.icon}</span>
                    <div className="shop-item-info">
                      <h3 className="shop-item-name">{item.name}</h3>
                      <p className="shop-item-description">{item.description}</p>
                    </div>
                  </div>
                  <div className="shop-item-footer">
                    {item.isPurchased ? (
                      <div className="shop-item-actions">
                        {item.id === 'dot-ui' && (
                          <>
                            {isDotUIEnabled ? (
                              <button
                                className="shop-item-disable-button"
                                onClick={() => handleDisable(item)}
                              >
                                {t('shop.disablePixelArtUI')}
                              </button>
                            ) : (
                              <button
                                className="shop-item-use-button"
                                onClick={() => handleUse(item)}
                              >
                                {t('shop.enablePixelArtUI')}
                              </button>
                            )}
                          </>
                        )}
                        <span className="shop-item-purchased-badge">✓ {t('shop.purchased')}</span>
                      </div>
                    ) : (
                      <div className="shop-item-purchase">
                        <span className="shop-item-price">
                          {debugMode && item.isDebugFree ? (
                            <span className="shop-item-price-free">{t('shop.freeDebugMode')}</span>
                          ) : (
                            `${t('gift.currency')}${item.price.toLocaleString()}`
                          )}
                        </span>
                        <button
                          className="shop-item-purchase-button"
                          onClick={() => handlePurchase(item)}
                        >
                          {t('shop.purchase')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
