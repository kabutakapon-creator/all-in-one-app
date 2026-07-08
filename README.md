# All In One - iOSネイティブ機能お試しアプリ

カメラ・位置情報・通知・振動(ハプティクス)をタブで切り替えて試せる練習用アプリです。

## 含まれる機能
- 📷 カメラ撮影(前面/背面切り替え)
- 📍 現在地の緯度・経度取得
- 🔔 5秒後に届くプッシュ通知
- 📳 5種類の振動フィードバック

## セットアップ手順

### 1. GitHubにアップロード
このフォルダ一式をGitHubの新しいリポジトリにアップロードしてください。
(GitHub上で "Add file" → "Upload files" でドラッグ&ドロップでもOK)

### 2. app.json を自分用に書き換える
`app.json` の以下の部分を、自分のオリジナルの値に変更してください:
```
"bundleIdentifier": "com.yourname.allinone"  ← ここを自分のドメイン風の名前に
"package": "com.yourname.allinone"           ← Android用も同様に
```
例: `com.taro123.allinone` のように、他人と被らない名前にします。

### 3. EAS CLIをインストール(PC/ブラウザ端末で)
```
npm install -g eas-cli
```

### 4. Expoにログイン
```
eas login
```
先ほど作成したExpoアカウントでログインします。

### 5. プロジェクト初期化
```
eas build:configure
```

### 6. iOS向けにビルド(実機テスト用)
```
eas build --platform ios --profile development
```
- 初回はApple IDでのログインを求められます(Apple Developer登録が必要になるのはこのタイミングです)
- ビルドが終わるとダッシュボード(expo.dev)にQRコードが出るので、iPhoneのカメラで読み取ってインストールできます

## GitHub Actionsで自動化したい場合
`.github/workflows/build.yml` を用意すれば、GitHubのブラウザ画面から
「Run workflow」ボタン一つでビルドを実行できます(iPhoneのブラウザからでも操作可能)。
必要であれば、このワークフローファイルも作成します。

## 注意
- 通知機能はiOSシミュレーターでは動かないことがあります。実機で確認してください
- 無料のExpo/EASプランは月15回までのiOSビルド制限があります
