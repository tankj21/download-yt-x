# StreamVault - スマホ完結型 YouTube & X 動画ダウンローダー

Hugging Face Spacesを活用して、スマートフォンだけでYouTubeやX (Twitter)の動画を最高画質でダウンロードできる完全無料・設定不要のWebシステムです。

トークンの発行やIssue作成といった面倒な設定・ステップは**一切不要**です。ユーザーはただ動画URLをコピーし、貼り付けてダウンロードボタンを押すだけで動作します。

---

## 仕組み

1. **GitHub Pages (Web UI)**: フロントエンド。Hugging FaceでホストされるWebアプリを `iframe` で安全に埋め込み表示します。
2. **Hugging Face Spaces (無料サーバー)**: バックエンド ＋ Gradio Web UI。時間制限なし・**16GB RAM** のハイスペック環境を無料で利用でき、`yt-dlp` と `ffmpeg` による高画質な動画のダウンロードおよび結合処理を安全・快適に処理します。

---

## 初期設定手順（開発者・リポジトリ所有者向け）

本システムをご自身で公開・使用するための手順です。10分程度で完了します。

### 1. Hugging Face Spaces へのデプロイ

1. [Hugging Face](https://huggingface.co/) で無料アカウントを作成し、ログインします。
2. 右上のプロフィールアイコンをクリックし、**「New Space」**を選択します。
3. 以下の設定を入力してSpaceを作成します：
   - **Space name**: 任意の名前（例: `streamvault`）
   - **SDK**: **Gradio** を選択
   - **Space hardware**: **CPU basic** (無料版) を選択
   - **Visibility**: **Public** (公開) または **Private** (非公開でも動作しますが、埋め込み時にログインが必要になります)
4. Spaceが作成されたら、**Files** タブを開き、**「Add file」** > **「Upload files」** から、本プロジェクトの `huggingface/` フォルダ内にある以下の2つのファイルをドラッグ＆ドロップしてアップロード（Commit）します：
   - `app.py`
   - `requirements.txt`
5. 自動的にビルドが始まり、数分で「Running」状態になれば完了です。作成したSpaceのURL（例: `https://huggingface.co/spaces/ユーザー名/スペース名`）をコピーしておきます。

### 2. GitHub Pages の公開

1. GitHub上に新しいパブリックリポジトリ（例: `download-yt-x`）を作成します。
2. 本プロジェクトの全ファイルをプッシュします。
   ```bash
   git add .
   git commit -m "Configure Hugging Face Space layout"
   git branch -M main
   git remote add origin <あなたのリポジトリURL>
   git push -u origin main
   ```
3. リポジトリの **Settings** (設定) > **Pages** を開きます。
4. **Build and deployment** セクションの **Branch** を以下のように設定します：
   - ブランチ: `main` (または `master`)
   - フォルダ: `/docs`
5. **Save** をクリックします。数分後に `https://<あなたのユーザー名>.github.io/<リポジトリ名>/` で公開されます。

### 3. Web UI でのサーバー連携

1. 公開された GitHub Pages のURLにスマホまたはPCでアクセスします。
2. 画面右上の **「サーバー設定」** ボタンをクリックします。
3. **1** でコピーした Hugging Face Space のURL（例: `https://huggingface.co/spaces/ユーザー名/スペース名`）を入力し、**「設定を保存して接続」** をクリックします。
4. 設定はブラウザの `localStorage` に安全に保存され、次回からはURLを入力するだけの画面が直接表示されます。

---

## 使い方 (スマホ・PC共通)

1. 公開されたWeb UIにアクセスします。
2. ダウンロードしたいYouTubeまたはXの動画URLをコピーし、入力欄に貼り付けます。
3. **「ダウンロード開始」** ボタンをタップします。
4. 処理が完了すると、画面上に動画のプレビューとダウンロードボタン（ファイル名）が自動で表示されます。
5. ボタンをタップして、スマホまたはPCのローカルライブラリに保存します。
