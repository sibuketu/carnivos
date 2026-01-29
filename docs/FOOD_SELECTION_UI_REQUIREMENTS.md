# Food Selection UI Requirements (食品選択UI要件定義)

**Target**: North American Biohackers (北米バイオハッカー)
**Last Updated**: 2026-01-27

---

## 1. カテゴリ構成（5大カテゴリー）

UX重視で「動物の種類」ではなく「食べる目的・シーン」で分ける。
内臓（Organs）を独立させるのがポイント。

| Icon | カテゴリ名 | 内容 |
|------|-----------|------|
| 🥩 | **Ruminant Meat** | 牛・羊・鹿・ヤギ（反芻動物） |
| 🥓 | **Pork & Poultry** | 豚・鶏・その他（⚠️ High Omega-6 注釈あり） |
| 🐟 | **Seafood** | 魚介類（オメガ3供給源） |
| 🥚 | **Eggs & Fats** | 卵・脂（Dairyは下位に配置） |
| 🫀 | **Organs** | 内臓全般（動物種でフォルダ分けしない） |

**UI配置**: 🥩を一番大きく、またはデフォルトで開いておく

---

## 2. 各カテゴリの食品リスト（UX順）

### 🥩 Ruminant Meat

| UX順 | Display Name | 備考 |
|------|--------------|------|
| Top | Ribeye Steak | King of Steaks、脂質バランス最強 |
| Top | Ground Beef | 最安価、日常食（80/20 or 73/27） |
| Top | NY Strip / Sirloin | リブアイに次ぐ人気 |
| Mid | Beef Roast / Chuck | 塊肉・スロークッカー用 |
| Mid | Lamb Chops | Costcoで人気、アレルギー対策 |
| Mid | Short Ribs | 骨付きカルビ、脂質多い |
| Bot | Bison / Venison | ジビエ系、ワイルド志向 |

### 🥓 Pork & Poultry
⚠️ High Omega-6 注釈を小さく表示

| UX順 | Display Name | 備考 |
|------|--------------|------|
| Top | Bacon (Sugar-Free) | 朝食定番、"No Sugar Added"必須 |
| Top | Chicken Thighs | 皮付き・骨付きが基本 |
| Top | Chicken Wings | パーティーフード兼脂質源 |
| Mid | Pork Belly | Costcoで塊購入 |
| Mid | Pork Chops | 一般的な晩御飯 |
| Bot | Sausage (Clean) | Salt & Spiceのみ |
| Bot | Pork Rinds | Chicharrones、スナック |

### 🐟 Seafood

| UX順 | Display Name | 備考 |
|------|--------------|------|
| Top | Salmon | 北米の魚の代名詞、天然物推奨 |
| Top | Sardines (Canned) | Wild Planet等、水煮一択 |
| Top | Shrimp | 手軽なタンパク源 |
| Mid | Oysters | 亜鉛補給、生で人気 |
| Mid | Scallops | バター焼きで人気 |
| Mid | Canned Tuna | 便利だが水銀リスク |
| Bot | Cod / White Fish | 脂質低い、バター追加前提 |
| Bot | Salmon Roe | 栄養価高いが入手難 |

### 🥚 Eggs & Fats
（厳格派はDairyを嫌うのでFatsをメインに）

| UX順 | Display Name | 備考 |
|------|--------------|------|
| Top | Whole Eggs | 基本 |
| Top | Butter (Salted) | Kerrygold等グラスフェッド |
| Top | Ghee | カゼインフリー |
| Top | Beef Tallow | Epic等の瓶詰め |
| Mid | Heavy Cream | コーヒー用、飲みすぎ注意 |
| Mid | Hard Cheese | Cheddar, Parmesan, Gouda |
| Bot | Bacon Grease | 再利用脂 |
| Bot | Cream Cheese | 脂質追加用 |
| Bot | Duck Eggs | 濃厚、アレルギー出にくい |

### 🫀 Organs
動物種でフォルダ分けせず、フラットに並べる

| UX順 | Display Name | 備考 |
|------|--------------|------|
| Top | Beef Liver | 圧倒的No.1、栄養爆弾 |
| Top | Chicken Liver | 牛より食べやすい |
| Mid | Beef Heart | 安価 |
| Mid | Cod Liver (Canned) | タラ肝油、バイオハッカーに人気 |
| Mid | Bone Marrow | スープやロースト用 |
| Bot | Chicken Hearts | |
| Bot | Tongue | 下処理必要でニッチ |
| Bot | Suet / Tallow | 調理用、そのまま食べる人も |

---

## 3. 例外的に含める加工食品

「Clean Label（原材料がシンプル）」であれば許容。
各カテゴリのBottom付近、または検索でヒット。

| 食品 | 原材料 | 備考 |
|------|--------|------|
| Pork Rinds / Chicharrones | 豚皮、塩 | カーニボアのポテチ代わり |
| Beef Jerky / Biltong | 牛肉、塩、酢、スパイス | 砂糖不使用が絶対条件 |
| Pemmican | 牛肉、牛脂、塩 | 究極の保存食 |
| Bone Broth | - | Drinks or Beef/ChickenのBottom |
| Canned Cod Liver | タラの肝油漬け | オメガ3の塊 |

---

## 4. 除外するもの（CustomFoodScreenで検索）

- 野菜、果物、穀物
- 添加物入り加工食品
- 非動物性食品

---

## 5. UX原則

### ラベルは使わない
「上級者向け」「初心者向け」などのラベルは認知負荷になる。
**配置順序だけで優先度を表現**する。

- **Top**: よく食べる、入手しやすい、初心者OK
- **Middle**: 一般的だが頻度低い
- **Bottom**: ニッチ、内臓系、レア部位（スクロールで到達）

### 無意識の使いやすさ
ユーザーが自然に欲しいものを見つけられる配置。
ラベルを読まなくても操作できる。

---

## 6. Strict仕様の調整ポイント

| 項目 | Strict仕様 |
|------|-----------|
| カテゴリ名 | 「Beef」→「Ruminant」（わかってる感） |
| Pork & Poultry | ⚠️ High Omega-6 注釈 |
| Dairy | カテゴリ名から削除、Fatsをメインに |
| Cheese/Cream | 下位に「Exceptions」として配置 |

---

## 7. 画面遷移

```
ホーム → ＋ボタン → 【5つのアイコン】
                    ↓
              [ 🥩 Ruminant ] ← デフォルトで開く or 最大表示
              [ 🥓 Pork/Poul ]
              [ 🐟 Seafood ]
              [ 🥚 Eggs/Fats ]
              [ 🫀 Organs ]
                    ↓
              【食品リスト（UX順）】
                    ↓
              タップで追加
```

---

**Source**: Gemini Research (2026-01-27)
