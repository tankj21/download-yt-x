import os
import re
import uuid
import shutil
import gradio as gr
import yt_dlp

def clean_filename(title):
    # Remove characters that are invalid for filenames
    return re.sub(r'[\\/*?:"<>|]', "", title).strip()

def download_video(url):
    if not url:
        return None, "URLを入力してください。"

    # Ensure downloads directory exists
    output_dir = "downloads"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate unique temporary template to avoid collision
    temp_id = str(uuid.uuid4())
    temp_outtmpl = os.path.join(output_dir, f"{temp_id}.%(ext)s")
    
    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'outtmpl': temp_outtmpl,
        'merge_output_format': 'mp4',
        'nocheckcertificate': True,
        'ignoreerrors': False,
        'logtostderr': False,
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # 1. Fetch info and download
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'video')
            ext = info.get('ext', 'mp4')
            
            # Find the actual merged/downloaded file
            expected_temp_file = os.path.join(output_dir, f"{temp_id}.{ext}")
            
            if not os.path.exists(expected_temp_file):
                # Search if extension differed
                for f in os.listdir(output_dir):
                    if f.startswith(temp_id):
                        expected_temp_file = os.path.join(output_dir, f)
                        ext = f.split('.')[-1]
                        break
            
            if not os.path.exists(expected_temp_file):
                return None, "動画ファイルのダウンロードまたは結合に失敗しました。"
                
            # 2. Rename to matching title
            safe_title = clean_filename(title)
            final_filename = f"{safe_title}.{ext}"
            final_path = os.path.join(output_dir, final_filename)
            
            if os.path.exists(final_path):
                final_path = os.path.join(output_dir, f"{safe_title}_{str(uuid.uuid4())[:4]}.{ext}")
                
            shutil.move(expected_temp_file, final_path)
            
            return final_path, f"ダウンロード成功しました！: {title}"
            
    except Exception as e:
        return None, f"エラーが発生しました: {str(e)}"

# Custom Gradio UI Theme to match StreamVault guidelines
theme = gr.themes.Soft(
    primary_hue="purple",
    secondary_hue="pink",
    neutral_hue="slate",
).set(
    body_background_fill="#080c14",
    body_text_color="#f8fafc",
    block_background_fill="rgba(255, 255, 255, 0.03)",
    block_border_width="1px",
    block_label_text_color="#94a3b8",
    input_background_fill="rgba(255, 255, 255, 0.02)",
    input_border_color="rgba(255, 255, 255, 0.1)",
    button_primary_background_fill="linear-gradient(135deg, #8b5cf6, #ec4899)",
    button_primary_text_color="white",
)

with gr.Blocks(theme=theme, title="StreamVault - Video Downloader") as demo:
    gr.Markdown(
        """
        # 🎬 StreamVault
        ### YouTube & X (Twitter) 高画質動画ダウンローダー
        URLを入力して「ダウンロード開始」を押すと、自動的に最高画質でダウンロードして結合します。
        ダウンロード完了後、ファイル欄から直接スマホに保存できます。
        """
    )
    
    with gr.Column():
        url_input = gr.Textbox(
            label="動画URL", 
            placeholder="https://www.youtube.com/watch?v=... または https://x.com/...",
            lines=1
        )
        download_btn = gr.Button("ダウンロード開始", variant="primary")
        
        with gr.Row():
            status_output = gr.Textbox(label="ステータス", interactive=False)
        
        with gr.Row():
            output_file = gr.File(label="ダウンロード完了したファイル (タップして保存)")
            
    download_btn.click(
        fn=download_video,
        inputs=[url_input],
        outputs=[output_file, status_output],
        api_name="download"
    )

if __name__ == "__main__":
    demo.launch(server_name="127.0.0.1")
