# Android 署名キーストア控え（Play AAB 用）

## キーストアの場所（絶対パス）

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web\android\release.keystore
```

## エイリアス

```
key0
```

## パスワード

**ファイルには書かない。** パスワードマネージャーまたは自分だけが分かる安全な場所に保管すること。  
Android Studio で「Remember passwords」にチェックを入れておくと、次回から入力不要になる。

## 次回ビルドの手順メモ

1. Android Studio で `android` フォルダを開く（上記の親フォルダ）。
2. **Build** → **Generate Signed Bundle / App Bundle** → **Android App Bundle** → **Next**。
3. **Choose existing...** で上記キーストアを指定。Key store password / Key password を入力（Remember passwords を推奨）。
4. **Next** → **release** → **Create**。AAB の出力先:
   ```
   C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web\android\app\build\outputs\bundle\release\app-release.aab
   ```
