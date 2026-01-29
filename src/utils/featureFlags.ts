// Feature Flags Configuration
// Control which features are visible in the app

export interface FeatureFlags {
    // Labs Features
    aiTips: boolean; // AI機能のTips
    otherTips: boolean; // その他のTips  
    streakTracker: boolean; // Streak Tracker
    giftFeature: boolean; // Gift機能
    community: boolean; // Community画面
    ansScreen: boolean; // ANS画面
    stats: boolean; // Stats画面
    shop: boolean; // Shop画面

    // Future features
    bioTuner: boolean; // バイオチューナー
    recoveryProtocol: boolean; // リカバリープロトコル
}

// Default feature flags
// Set to false to hide features for initial release
const DEFAULT_FLAGS: FeatureFlags = {
    // Initially visible features
    streakTracker: true,
    giftFeature: true,
    stats: true,
    shop: true,

    // Hidden for initial release (update features)
    aiTips: false,
    otherTips: false,
    community: false,
    ansScreen: false,

    // Future features
    bioTuner: false,
    recoveryProtocol: false,
};

// Get feature flags from localStorage (for admin override)
export function getFeatureFlags(): FeatureFlags {
    try {
        const stored = localStorage.getItem('primal_logic_feature_flags');
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULT_FLAGS, ...parsed };
        }
    } catch (error) {
        console.error('Failed to load feature flags:', error);
    }
    return DEFAULT_FLAGS;
}

// Enable/disable a specific feature (admin only)
export function setFeatureFlag(feature: keyof FeatureFlags, enabled: boolean): void {
    try {
        const current = getFeatureFlags();
        const updated = { ...current, [feature]: enabled };
        localStorage.setItem('primal_logic_feature_flags', JSON.stringify(updated));

        // Trigger update event for components
        window.dispatchEvent(new CustomEvent('featureFlagsUpdated'));
    } catch (error) {
        console.error('Failed to set feature flag:', error);
    }
}

// Check if a feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    const flags = getFeatureFlags();
    return flags[feature] ?? false;
}

// Admin: Enable all features (for testing)
export function enableAllFeatures(): void {
    const allEnabled: FeatureFlags = Object.keys(DEFAULT_FLAGS).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as FeatureFlags
    );
    localStorage.setItem('primal_logic_feature_flags', JSON.stringify(allEnabled));
    window.dispatchEvent(new CustomEvent('featureFlagsUpdated'));
}

// Admin: Reset to default
export function resetFeatureFlags(): void {
    localStorage.removeItem('primal_logic_feature_flags');
    window.dispatchEvent(new CustomEvent('featureFlagsUpdated'));
}
