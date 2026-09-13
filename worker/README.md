# 健康カメラ API (Cloudflare Worker)

写真から食べ物を判定するAIアシスタント機能のバックエンドです。フロントエンド(GitHub Pages)は静的サイトなのでAnthropic APIキーを直接埋め込めません。このWorkerがAPIキーをサーバー側(環境変数)に保持し、Claude APIの呼び出しを代行します。

なぜCloudflare Workersか: 無料枠が大きい(1日10万リクエスト)、セットアップがシンプル(サーバー管理不要)、デプロイが数分で終わるためです。Vercel FunctionsやSupabase Edge Functionsでも同様の構成は可能です。

## セットアップ手順

### 1. Cloudflareアカウントを用意する

https://dash.cloudflare.com/sign-up で無料アカウントを作成(クレジットカード不要)。

### 2. 依存関係をインストール

```bash
cd worker
npm install
```

### 3. Cloudflareにログイン

```bash
npx wrangler login
```

ブラウザが開くので、Cloudflareアカウントでログインして許可します。

### 4. Anthropic APIキーをシークレットとして登録

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

プロンプトが表示されたら、Anthropic Console(https://console.anthropic.com/settings/keys )で発行したAPIキー(`sk-ant-...`)を貼り付けてEnter。

このキーはCloudflare側に暗号化保存され、コードやリポジトリには一切含まれません。

### 5. デプロイ

```bash
npm run deploy
```

成功すると `https://food-health-camera-api.<あなたのサブドメイン>.workers.dev` のようなURLが表示されます。このURLをメモしてください。

### 6. フロントエンドにURLを設定する

リポジトリ直下の `.env.production` を編集し、上記URLに `/analyze` を付けて設定します:

```
VITE_ANALYZE_API_URL=https://food-health-camera-api.<あなたのサブドメイン>.workers.dev/analyze
```

変更をコミット・pushすると、GitHub Actionsが自動的にビルド・再デプロイし、AI自動判定が有効になります。

## 動作確認

```bash
curl -X POST https://food-health-camera-api.<あなたのサブドメイン>.workers.dev/analyze \
  -H "Content-Type: application/json" \
  -d '{"image":"<base64文字列>","mediaType":"image/jpeg"}'
```

## ローカル開発

```bash
npm run dev
```

`http://localhost:8787` で起動します(ローカル実行時はシークレットの代わりに `worker/.dev.vars` に `ANTHROPIC_API_KEY=sk-ant-...` を書いて使えます。このファイルはgit管理外です)。

## 許可オリジンの変更

`wrangler.toml` の `ALLOWED_ORIGIN` を変更すると、CORSで許可するフロントエンドのオリジンを変更できます(既定値: `https://toshinz777-source.github.io`)。
