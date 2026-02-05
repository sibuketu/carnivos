/**
 * Primal Logic - App Context (Web版)
 *
 * グローバル状態管理（日次ログ、栄養素計算結果など）
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { DailyLog, FoodItem, DailyStatus, RecoveryProtocol, UserProfile } from '../types';
import { calculateAllMetrics } from '../utils/nutrientCalculator';
import { generateRecoveryProtocol, detectViolationType } from '../utils/recoveryAlgorithm';
import { generateRecoveryProtocolWithAI } from '../utils/openaiApi';
import {
  saveDailyLog,
  getTodayLog,
  getUserProfile,
  syncLocalStorageToSupabase as syncStorage,
} from '../utils/storage';
import { defaultUserProfile } from '../types';
import { logError } from '../utils/errorHandler';
import { checkTrialStatus, type TrialStatus } from '../utils/trialManager';

interface AppContextType {
  dailyLog: DailyLog | null;
  userProfile: UserProfile | null;
  trialStatus: TrialStatus | null;
  isLoading: boolean;
  error: string | null;
  addFood: (food: FoodItem) => void;
  removeFood: (index: number) => void;
  updateFood: (index: number, food: FoodItem) => void;
  updateStatus: (status: DailyStatus) => void;
  updateDiary: (diary: string) => void;
  updateWeight: (weight: number | undefined, bodyFatPercentage?: number | undefined) => void;
  updateWaterIntake: (addMl: number) => void;
  setRecoveryProtocol: (protocol: RecoveryProtocol) => void;
  clearDailyLog: () => void;
  loadTodayLog: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  syncLocalStorageToSupabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Susam',
    gender: 'male',
    age: 30, // Estimated
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    dietType: 'lion',
    ...defaultUserProfile
  });
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // userProfileが変更された時にcalculatedMetricsを再計算（無限ループを防ぐため、prevUserProfileRefで比較）
  const prevUserProfileRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    // userProfileが変更された場合のみ、既存のdailyLogのcalculatedMetricsを再計算
    if (!userProfile || !dailyLog || !dailyLog.fuel || dailyLog.fuel.length === 0) {
      prevUserProfileRef.current = userProfile;
      return;
    }

    // userProfileが変更された場合のみ再計算
    if (userProfile !== prevUserProfileRef.current) {
      const recalculatedMetrics = calculateAllMetrics(dailyLog.fuel, userProfile);
      const recalculatedMetricsStr = JSON.stringify(recalculatedMetrics);
      const currentMetricsStr = JSON.stringify(dailyLog.calculatedMetrics || {});

      // 実際に値が変わった場合のみ更新（無限ループ防止）
      if (recalculatedMetricsStr !== currentMetricsStr) {
        setDailyLog((prev) => {
          if (!prev || prev.date !== dailyLog.date) return prev;
          return {
            ...prev,
            calculatedMetrics: recalculatedMetrics,
          };
        });
      }
      prevUserProfileRef.current = userProfile;
    }
  }, [userProfile, dailyLog?.date]); // userProfileとdateのみを監視（fuelは監視しない - 無限ループ防止）

  // Load user profile first
  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile(profile);
        // トライアルステータスをチェック
        const trial = checkTrialStatus(profile);
        setTrialStatus(trial);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'プロファイルの読み込みに失敗しました';
      setError(errorMessage);
      logError(err, { component: 'AppContext', action: 'loadUserProfile' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load today's log
  const loadTodayLog = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const log = await getTodayLog();
      if (log) {
        // calculatedMetricsが既にあればそのまま、なければ計算する
        if (!log.calculatedMetrics && log.fuel && log.fuel.length > 0 && userProfile) {
          log.calculatedMetrics = calculateAllMetrics(log.fuel, userProfile);
        }
        setDailyLog(log);
      } else {
        // ログがない場合でも、空のログを作成しない（PFRatioGaugeが0%を表示するのは正常）
        setDailyLog(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '日次ログの読み込みに失敗しました';
      setError(errorMessage);
      logError(err, { component: 'AppContext', action: 'loadTodayLog' });
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]); // userProfileが変更された時に再計算するため

  // Sync localStorage to Supabase
  const syncLocalStorageToSupabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await syncStorage();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの同期に失敗しました';
      setError(errorMessage);
      logError(err, { component: 'AppContext', action: 'syncLocalStorageToSupabase' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user profile on mount (初回のみ実行)
  const hasLoadedUserProfileRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedUserProfileRef.current) {
      hasLoadedUserProfileRef.current = true;
      loadUserProfile();
    }
  }, []); // loadUserProfileは依存配列から除外（初回のみ実行）

  // プロフィール更新イベントを監視（オンボーディング完了時など）
  useEffect(() => {
    const handleProfileUpdated = () => {
      loadUserProfile();
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdated);
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdated);
    };
  }, [loadUserProfile]);

  // Load today's log after user profile is loaded (初回のみ実行、無限ループ防止)
  const hasLoadedTodayLogRef = useRef(false);
  useEffect(() => {
    // userProfileが設定され、かつ前回と異なる場合のみ実行
    if (userProfile && userProfile !== prevUserProfileRef.current) {
      const wasFirstLoad = !hasLoadedTodayLogRef.current;
      prevUserProfileRef.current = userProfile;
      if (wasFirstLoad) {
        hasLoadedTodayLogRef.current = true;
        // 初回のみ実行（無限ループ防止）
        loadTodayLog().catch((err) => {
          logError(err, { component: 'AppContext', action: 'loadTodayLog-init' });
        });
      }
    }
  }, [userProfile]); // userProfileのみを監視（loadTodayLogは除外）

  // Auto-save daily log when it changes (無限ループ防止: 保存中フラグとデバウンスで制御)
  const isSavingRef = useRef(false);
  const prevDailyLogDateRef = useRef<string | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // 初回レンダリング時はスキップ（無限ループ防止）
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (dailyLog) {
        prevDailyLogDateRef.current = dailyLog.date;
      }
      return;
    }

    if (dailyLog && !isSavingRef.current) {
      // 日付が変更された場合のみ保存（同じ日付の更新はスキップ）
      const dateChanged = dailyLog.date !== prevDailyLogDateRef.current;
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      // 500ms以内の連続保存を防ぐ（デバウンス）
      if (dateChanged && timeSinceLastSave > 500) {
        // 既存のタイムアウトをクリア
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        isSavingRef.current = true;
        prevDailyLogDateRef.current = dailyLog.date;

        // デバウンス: 500ms待ってから保存
        saveTimeoutRef.current = setTimeout(() => {
          saveDailyLog(dailyLog)
            .then(() => {
              lastSaveTimeRef.current = Date.now();
              // イベント発火は完全に停止（無限ループ防止）
              // 必要に応じて、明示的にリロードが必要な画面のみイベントを発火
              isSavingRef.current = false;
            })
            .catch((error) => {
              logError(error, { component: 'AppContext', action: 'saveDailyLog' });
              isSavingRef.current = false;
            });
        }, 500);
      }
    } else if (!dailyLog) {
      prevDailyLogDateRef.current = null;
      isSavingRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [dailyLog?.date]); // 日付のみを監視（食品数の変更は別のイベントで処理）

  // ❌ このuseEffectは削除しました。これが無限ループの原因でした。
  // State更新の連鎖を止めるため、useMemoで計算する方式に変更します。
  /*
  useEffect(() => {
    // userProfileが変更された場合のみ、既存のdailyLogのcalculatedMetricsを再計算
    if (!userProfile || !dailyLog) {
      return;
    }
    
    // 初回レンダリング時はスキップ（loadTodayLogで処理される）
    if (!hasInitializedMetricsRef.current) {
      hasInitializedMetricsRef.current = true;
      // calculatedMetricsがない場合は計算する（loadTodayLogで設定されなかった場合）
      if (!dailyLog.calculatedMetrics && dailyLog.fuel) {
        const calculatedMetrics = calculateAllMetrics(dailyLog.fuel, userProfile);
        setDailyLog((prev) => {
          if (!prev || prev.date !== dailyLog.date) {
            return prev;
          }
          return {
            ...prev,
            calculatedMetrics,
          };
        });
      }
      prevUserProfileRef.current = userProfile;
      return;
    }
    
    // userProfileが変更された場合のみ再計算
    if (userProfile !== prevUserProfileRef.current && dailyLog) {
      const recalculatedMetrics = calculateAllMetrics(dailyLog.fuel, userProfile);
      const recalculatedMetricsStr = JSON.stringify(recalculatedMetrics);
      const currentMetricsStr = JSON.stringify(dailyLog.calculatedMetrics || {});
      const metricsChanged = currentMetricsStr !== recalculatedMetricsStr;
      
      if (metricsChanged) {
        prevUserProfileRef.current = userProfile;
        setDailyLog((prev) => {
          if (!prev || prev.date !== dailyLog.date) {
            return prev;
          }
          return {
            ...prev,
            calculatedMetrics: recalculatedMetrics,
          };
        });
      } else {
        prevUserProfileRef.current = userProfile;
      }
    }
  }, [userProfile]); // userProfileのみを監視（dailyLogは監視しない - 無限ループ防止）
  */

  // 食品追加後に今日のログを再読み込み（デバッグモードでも反映されるように）
  useEffect(() => {
    const handleFoodAdded = () => {
      // 少し遅延させてから再読み込み（保存が完了してから）
      setTimeout(async () => {
        try {
          setIsLoading(true);
          const log = await getTodayLog();
          if (log) {
            setDailyLog(log);
            // ✅ calculatedMetricsはuseMemoで計算されるため、Stateに保存しない
          } else {
            setDailyLog(null);
          }
        } catch (err) {
          logError(err, { component: 'AppContext', action: 'loadTodayLog-foodAdded' });
        } finally {
          setIsLoading(false);
        }
      }, 100);
    };
    window.addEventListener('foodAdded', handleFoodAdded);
    return () => {
      window.removeEventListener('foodAdded', handleFoodAdded);
    };
  }, [userProfile]); // userProfileのみを監視（loadTodayLogを直接呼ばず、内部で処理）

  const addFood = useCallback(
    (food: FoodItem) => {
      setDailyLog((prev) => {
        const today = new Date().toISOString().split('T')[0];

        if (!prev || prev.date !== today) {
          // Create new daily log for today
          const newLog: DailyLog = {
            date: today,
            status: {
              sleepScore: 80,
              sunMinutes: 30,
              activityLevel: 'moderate',
            },
            fuel: [food],
            calculatedMetrics: calculateAllMetrics([food], userProfile),
          };

          // Check for violations and generate recovery protocol if needed
          const violationType = detectViolationType(food.item);
          if (violationType) {
            // Try AI API first, fallback to static algorithm
            generateRecoveryProtocolWithAI({
              violationType,
              userProfile: userProfile
                ? {
                  gender: userProfile.gender,
                  goal: userProfile.goal,
                  metabolicStatus: userProfile.metabolicStatus,
                }
                : undefined,
              foodItem: food.item,
            })
              .then((aiProtocol) => {
                if (aiProtocol) {
                  setDailyLog((prev) => {
                    if (!prev || prev.date !== newLog.date) return prev;
                    return {
                      ...prev,
                      recoveryProtocol: {
                        violationType,
                        isActive: true,
                        fastingTargetHours: aiProtocol.protocol.fastingTargetHours,
                        activities: aiProtocol.protocol.activities,
                        dietRecommendations: aiProtocol.protocol.dietRecommendations,
                        supplements: aiProtocol.protocol.supplements,
                        warnings: aiProtocol.protocol.warnings,
                        protocolId: `ai_${violationType}_${Date.now()}`,
                      },
                    };
                  });
                } else {
                  // Fallback to static algorithm
                  setDailyLog((prev) => {
                    if (!prev || prev.date !== newLog.date) return prev;
                    return {
                      ...prev,
                      recoveryProtocol: generateRecoveryProtocol(violationType),
                    };
                  });
                }
              })
              .catch(() => {
                // On error, use static algorithm
                setDailyLog((prev) => {
                  if (!prev || prev.date !== newLog.date) return prev;
                  return {
                    ...prev,
                    recoveryProtocol: generateRecoveryProtocol(violationType),
                  };
                });
              });

            // Set initial protocol (will be updated by AI if available)
            newLog.recoveryProtocol = generateRecoveryProtocol(violationType);
          }

          // 新規ログ作成時もイベントを発火（saveDailyLogのuseEffectで発火されるが、念のため）
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('foodAdded'));
          }, 0);

          return newLog;
        }

        // Add to existing log
        const updatedFuel = [...prev.fuel, food];
        const updatedMetrics = calculateAllMetrics(updatedFuel, userProfile);

        // 食品追加イベントを発火（他のコンポーネントに通知）
        // dailyLogUpdatedはsaveDailyLogのuseEffectで発火される
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('foodAdded'));
        }, 0);

        // Check for violations
        const violationType = detectViolationType(food.item);
        let recoveryProtocol = prev.recoveryProtocol;

        if (violationType) {
          // Try AI API first, fallback to static algorithm
          generateRecoveryProtocolWithAI({
            violationType,
            userProfile: userProfile
              ? {
                gender: userProfile.gender,
                goal: userProfile.goal,
                metabolicStatus: userProfile.metabolicStatus,
              }
              : undefined,
            foodItem: food.item,
          })
            .then((aiProtocol) => {
              if (aiProtocol) {
                setDailyLog((current) => {
                  if (!current || current.date !== prev.date) return current;
                  return {
                    ...current,
                    recoveryProtocol: {
                      violationType,
                      isActive: true,
                      fastingTargetHours: aiProtocol.protocol.fastingTargetHours,
                      activities: aiProtocol.protocol.activities,
                      dietRecommendations: aiProtocol.protocol.dietRecommendations,
                      supplements: aiProtocol.protocol.supplements,
                      warnings: aiProtocol.protocol.warnings,
                      protocolId: `ai_${violationType}_${Date.now()}`,
                    },
                  };
                });
              } else {
                // Fallback to static algorithm
                setDailyLog((current) => {
                  if (!current || current.date !== prev.date) return current;
                  return {
                    ...current,
                    recoveryProtocol: generateRecoveryProtocol(violationType),
                  };
                });
              }
            })
            .catch(() => {
              // On error, use static algorithm
              setDailyLog((current) => {
                if (!current || current.date !== prev.date) return current;
                return {
                  ...current,
                  recoveryProtocol: generateRecoveryProtocol(violationType),
                };
              });
            });

          // Set initial protocol (will be updated by AI if available)
          recoveryProtocol = generateRecoveryProtocol(violationType);
        }

        return {
          ...prev,
          fuel: updatedFuel,
          calculatedMetrics: updatedMetrics,
          recoveryProtocol,
        };
      });
    },
    [userProfile]
  );

  const updateStatus = useCallback(
    (status: DailyStatus) => {
      setDailyLog((prev) => {
        if (!prev) {
          const today = new Date().toISOString().split('T')[0];
          return {
            date: today,
            status,
            fuel: [],
            calculatedMetrics: calculateAllMetrics([], userProfile),
          };
        }
        return {
          ...prev,
          status,
          // ✅ calculatedMetricsはuseMemoで計算されるため、Stateに保存しない
        };
      });
    },
    [userProfile]
  );

  const updateDiary = useCallback(
    (diary: string) => {
      setDailyLog((prev) => {
        if (!prev) {
          const today = new Date().toISOString().split('T')[0];
          return {
            date: today,
            status: {
              sleepScore: 80,
              sunMinutes: 30,
              activityLevel: 'moderate',
            },
            fuel: [],
            calculatedMetrics: calculateAllMetrics([], userProfile),
            diary,
          };
        }
        return {
          ...prev,
          diary,
        };
      });
    },
    [userProfile]
  );

  const updateWeight = useCallback(
    (weight: number | undefined, bodyFatPercentage?: number | undefined) => {
      setDailyLog((prev) => {
        if (!prev) {
          const today = new Date().toISOString().split('T')[0];
          return {
            date: today,
            status: {
              sleepScore: 80,
              sunMinutes: 30,
              activityLevel: 'moderate',
            },
            fuel: [],
            calculatedMetrics: calculateAllMetrics([], userProfile),
            weight,
            bodyFatPercentage,
          };
        }
        return {
          ...prev,
          weight,
          bodyFatPercentage,
        };
      });
      // データ更新を通知
      window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
    },
    [userProfile]
  );

  const updateWaterIntake = useCallback((addMl: number) => {
    setDailyLog((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const current = prev?.waterIntake ?? 0;
      const next = Math.max(0, current + addMl);
      if (!prev) {
        return {
          date: today,
          status: {
            sleepScore: 80,
            sunMinutes: 30,
            activityLevel: 'moderate',
          },
          fuel: [],
          calculatedMetrics: calculateAllMetrics([], userProfile),
          waterIntake: next,
        };
      }
      return { ...prev, waterIntake: next };
    });
    window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
  }, []);

  const setRecoveryProtocol = useCallback(
    (protocol: RecoveryProtocol) => {
      setDailyLog((prev) => {
        if (!prev) {
          const today = new Date().toISOString().split('T')[0];
          return {
            date: today,
            status: {
              sleepScore: 80,
              sunMinutes: 30,
              activityLevel: 'moderate',
            },
            fuel: [],
            calculatedMetrics: calculateAllMetrics([], userProfile),
            recoveryProtocol: protocol,
          };
        }
        return {
          ...prev,
          recoveryProtocol: protocol,
        };
      });
    },
    [userProfile]
  );

  const clearDailyLog = useCallback(() => {
    setDailyLog(null);
  }, []);

  const removeFood = useCallback(
    (index: number) => {
      setDailyLog((prev) => {
        if (!prev) return null;
        const updatedFuel = prev.fuel.filter((_, i) => i !== index);
        const updatedMetrics = calculateAllMetrics(updatedFuel, userProfile);
        return {
          ...prev,
          fuel: updatedFuel,
          calculatedMetrics: updatedMetrics,
        };
      });
      // データ更新を通知
      window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
    },
    [userProfile]
  );

  const updateFood = useCallback(
    (index: number, updatedFood: FoodItem) => {
      setDailyLog((prev) => {
        if (!prev) return null;
        const updatedFuel = prev.fuel.map((food, i) => (i === index ? updatedFood : food));
        const updatedMetrics = calculateAllMetrics(updatedFuel, userProfile);
        return {
          ...prev,
          fuel: updatedFuel,
          calculatedMetrics: updatedMetrics,
        };
      });
      // データ更新を通知
      window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
    },
    [userProfile]
  );

  return (
    <AppContext.Provider
      value={{
        dailyLog,
        userProfile,
        trialStatus,
        isLoading,
        error,
        addFood,
        removeFood,
        updateFood,
        updateStatus,
        updateDiary,
        updateWeight,
        updateWaterIntake,
        setRecoveryProtocol,
        clearDailyLog,
        loadTodayLog,
        loadUserProfile,
        setError,
        clearError,
        syncLocalStorageToSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
