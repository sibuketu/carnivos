# Geminiに送るファイル一覧

以下のファイルをGeminiに送信してください：

## 📄 送信するファイル

### メインファイル（必須）
**ファイルパス**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\GEMINI_CAMERA_PROMPT_COMPLETE.md`

- 完全版の要件定義プロンプト
- プロジェクト概要、技術スタック、デザイン原則、既存の決定事項、整合性チェックと推論を含む

### 参考ファイル（オプション）

必要に応じて、以下のファイルも送信できます：

1. **機能の意図と目的**
   - ファイルパス: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\FEATURE_INTENTS.md`

2. **プロジェクト概要**
   - ファイルパス: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\README.md`

3. **現在の実装（HomeScreen.tsx）**
   - ファイルパス: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\src\screens\HomeScreen.tsx`
   - 該当箇所: 917-1008行目（カメラ機能の実装）

4. **バーコード読み取りコンポーネント**
   - ファイルパス: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\src\components\BarcodeScannerModal.tsx`

5. **写真解析コンポーネント**
   - ファイルパス: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\src\components\PhotoAnalysisModal.tsx`

6. **バーコード読み取りユーティリティ**
   - ファイルパス: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\src\utils\barcodeScanner.ts`

7. **AIサービス（写真解析）**
   - ファイルパス: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\src\services\aiService.ts`

---

## 💬 Geminiへの送信メッセージ例

```
以下のファイルを送信します。カメラ機能統合の要件定義をお願いします。

送信ファイル：
- GEMINI_CAMERA_PROMPT_COMPLETE.md
  （ファイルパス: C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\GEMINI_CAMERA_PROMPT_COMPLETE.md）

このファイルには、プロジェクト概要、技術スタック、デザイン原則、既存の決定事項、整合性チェックと推論が含まれています。

よろしくお願いします。
```

---

## 📝 注意事項

- ファイルを送信する際は、実際のファイルシステムのパス（フルパス）を記載してください
- Geminiにファイルを送る場合は、ファイルを直接アップロードするか、ファイルパスを記載してください
- 必要に応じて、参考ファイルも一緒に送信することで、より詳細な分析が可能になります
