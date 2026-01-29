export const HUNTER_PATH_CONSTANTS = {
    // Phase Definitions
    PHASES: {
        1: {
            name: 'The Purge',
            durationDays: 7,
            carbLimit: 50,
            fastingWindow: 0,
            description: '解毒フェーズ。植物油、砂糖、小麦粉を捨てよ。',
            allowedFoods: ['beef', 'pork', 'chicken', 'eggs', 'fish', 'butter', 'avocado', 'berries'],
        },
        2: {
            name: 'The Switch',
            durationDays: 7,
            carbLimit: 20,
            fastingWindow: 12,
            description: '燃料転換フェーズ。植物性食品を完全排除せよ。',
            allowedFoods: ['beef', 'pork', 'chicken', 'eggs', 'fish', 'animal_fat'],
        },
        3: {
            name: 'Adaptation',
            durationDays: 7,
            carbLimit: 0,
            fastingWindow: 14,
            description: '適応フェーズ。F:P比率を意識せよ。',
            allowedFoods: ['beef', 'organs', 'salt', 'water'],
        },
        4: {
            name: 'The Hunter',
            durationDays: 9, // Up to 30 days total
            carbLimit: 0,
            fastingWindow: 16,
            description: '覚醒フェーズ。1日2食へ移行せよ。',
            allowedFoods: ['beef', 'organs', 'salt', 'water'],
        },
    },

    // Keto Flu Solutions (Neo's Prescriptions)
    KETO_FLU: {
        HEADACHE: {
            symptom: '頭痛・ふらつき',
            cause: '脱水（ナトリウム不足）',
            action: '水200mlに天然塩3g（小さじ半分）を溶かして一気に飲め。',
            icon: '🧂',
        },
        CRAMPS: {
            symptom: '足のつり',
            cause: 'マグネシウム不足',
            action: '肉に普段の2倍の塩を振れ。エプソムソルト入浴をせよ。',
            icon: '⚡',
        },
        DIARRHEA: {
            symptom: '下痢',
            cause: '脂質の摂りすぎ（胆汁不足）',
            action: '食事中の水を控えろ。追加のバターを減らせ。',
            icon: '🚽',
        },
        SUGAR_CRAVING: {
            symptom: '砂糖への渇望',
            cause: '悪玉菌の断末魔',
            action: '冷たいバター10gを噛め。ベーコンを焼け。脂質で脳を黙らせろ。',
            icon: '🥓',
        },
    },

    // Onboarding Scripts
    ONBOARDING: {
        AWAKENING_1: '君はずっと違和感を感じていただろう？\nカロリーを計算し、野菜を食べ、油を控えているのに…\nなぜ疲れが取れない？ なぜ太る？ なぜ病む？',
        AWAKENING_2: 'それは君が悪いのではない。\n教えられた『ルール』が間違っていたのだ。\n人類は250万年、狩人（Hunter）だった。\n農耕を始めたのはたった1万年前だ。',
        CHOICE_BLUE: {
            label: 'Standard Mode',
            desc: '今のまま、少し健康になる',
            neo_comment: '従来のロジックで管理する。悪くはないが、真実ではない。',
        },
        CHOICE_RED: {
            label: "Hunter's Path",
            desc: '本来の野生を取り戻す（30日間の変革）',
            neo_comment: '植物毒を排除し、動物性食品だけで体を再構築する。\n最初の1週間は地獄かもしれない。\nだが、その先には見たことのない景色が待っている。',
        },
        WELCOME: '賢明な判断だ。\nようこそ、現実の世界へ。\nまずは冷蔵庫の中身を空にすることから始めよう。',
    },
};
