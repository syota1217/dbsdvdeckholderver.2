# 🐉 DBSDV Deck Builder

**Dragon Ball Super Divers** デッキ管理・大会記録 PWA

---

## 機能

- 🃏 **デッキ管理** — アバター（バトルタイプ・スキル×3）＋カード登録
- 🏆 **大会モード** — 8人／16人トーナメント表、開催日・開催地記録
- 📱 **iPhone対応** — ホーム画面に追加してアプリとして使用可能
- 💾 **オフライン対応** — Service Worker によるキャッシュ

---

## GitHub Pages へのデプロイ手順

1. このリポジトリを GitHub に push する
2. リポジトリの **Settings → Pages** を開く
3. Source を **Deploy from a branch** → branch: `main` / folder: `/ (root)` に設定
4. 数分後に `https://<username>.github.io/<repo>/` で公開される

---

## iPhoneへのインストール方法

1. Safari でページを開く
2. 画面下の「共有」ボタン（四角＋矢印）をタップ
3. 「ホーム画面に追加」をタップ
4. 「追加」をタップ → ホーム画面にアイコンが追加される

---

## ファイル構成

```
├── index.html      # エントリーポイント（PWA タグ込み）
├── App.jsx         # Reactアプリ本体
├── manifest.json   # PWA マニフェスト
├── sw.js           # Service Worker（オフライン対応）
├── icons/
│   ├── icon-32.png
│   ├── icon-152.png
│   ├── icon-167.png
│   ├── icon-180.png   ← Apple Touch Icon
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

---

## データについて

データはブラウザの `localStorage` に保存されます。
アプリを削除するとデータも消えるのでご注意ください。
