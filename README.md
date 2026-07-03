# StreamVault - 静的GitHub Pages完結型 YouTube & X 動画ダウンローダー

GitHub Pages（HTML/CSS/JS）だけで100%完結し、スマートフォンからYouTubeやX (Twitter)の動画を最高画質でダウンロードできるWebツールです。

Hugging FaceやGitHub Actionsの設定、あるいはAPIトークンの設定などは**一切不要**です。リポジトリを公開してGitHub Pagesを設定するだけで、即座に使用可能になります。

---

## 仕組み

通常、ブラウザからYouTube等の動画を直接ダウンロードしようとすると、CORS制限（ブラウザのセキュリティ制限）によってブロックされます。
本ツールでは、オープンソースの強力なパブリック動画ダウンロードAPI（**Cobalt API**）を利用し、CORS制限をバイパスして直接ブラウザ経由でスマホのローカルへ高画質動画（映像と音声がマージされたmp4）をストリームダウンロードします。

---

## デプロイ手順（開発者向け）

1. **GitHub上にリポジトリを作成**し、本プロジェクトの全ファイルをプッシュします。
   ```bash
   git add .
   git commit -m "Configure pure GitHub Pages solution"
   git branch -M main
   git remote add origin <あなたのリポジトリURL>
   git push -u origin main
   ```
2. リポジトリの **Settings** (設定) > **Pages** を開きます。
3. **Build and deployment** セクションの **Branch** を以下のように設定します：
   - ブランチ: `main` (または `master`)
   - フォルダ: `/docs`
4. **Save** をクリックします。数分後に `https://<あなたのユーザー名>.github.io/<リポジトリ名>/` でWeb UIが公開されます。

---

## 使い方 (スマホ・PC共通)

1. 公開された GitHub Pages のURLにスマホでアクセスします。
2. ダウンロードしたいYouTubeまたはXの動画URLを貼り付けます。
3. **「ダウンロード開始」** ボタンをタップします。
4. 解析が開始し、完了すると自動的に動画ファイルのダウンロードが始まります（「スマホに保存する」ボタンをタップして手動でダウンロードすることも可能です）。

---

## カスタムCobalt APIの設定 (オプション)

デフォルトでは、公式のパブリックCobalt API (`api.cobalt.tools`) を使用して動画を解析します。しかし、パブリックAPIはアクセスが集中するとYouTube等のダウンロードに一時的なアクセス制限（レートリミット）がかかる場合があります。

より安定して利用したい場合は、ご自身で独自のCobalt APIサーバーを立ち上げて設定することができます。

### 独自のCobalt APIのデプロイ方法

[Cobalt](https://github.com/imputnet/cobalt) はDockerイメージが公開されているため、無料のPaaS（例: **Koyeb**）等に数クリックでデプロイ可能です。

1. **Koyeb** にログイン/登録します。
2. **「Create Service」** をクリックします。
3. デプロイ方法で **「Docker」** を選択します。
4. イメージ名に `ghcr.io/imputnet/cobalt:latest` と入力します。
5. 環境変数（Environment Variables）に以下を設定します（任意）：
   - `COBALT_URL`: 生成されるKoyebのアプリドメイン名（例: `https://your-app.koyeb.app`）
   - `COBALT_USE_PROXY`: `true` (プロキシ経由でYouTubeのIPブロックを回避する場合)
6. サービスを公開後、発行されたURLを本ツールの右上にある ⚙️ (API設定) から設定することで、自分専用のプライベートAPIとして稼働させることができます。
