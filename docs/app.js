// API Configuration
const DEFAULT_API_URL = 'https://api.cobalt.tools';

// DOM Elements
const downloadForm = document.getElementById('downloadForm');
const urlInput = document.getElementById('url');
const downloadBtn = document.getElementById('downloadBtn');

const statusArea = document.getElementById('statusArea');
const loadingState = document.getElementById('loadingState');
const successState = document.getElementById('successState');
const errorState = document.getElementById('errorState');

const statusText = document.getElementById('statusText');
const videoTitle = document.getElementById('videoTitle');
const saveLink = document.getElementById('saveLink');
const errorMsg = document.getElementById('errorMsg');

// Settings DOM Elements
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const settingsForm = document.getElementById('settingsForm');
const apiUrlInput = document.getElementById('apiUrl');
const resetApiBtn = document.getElementById('resetApiBtn');
const connectionBadge = document.getElementById('connectionBadge');
const statusTextBadge = connectionBadge.querySelector('.status-text');

// Get active API URL (and normalize it to end with /api/json)
function getApiUrl() {
    const savedUrl = localStorage.getItem('sv_cobalt_api_url');
    const baseUrl = savedUrl ? savedUrl.trim() : DEFAULT_API_URL;
    
    // Normalize url
    let normalized = baseUrl;
    // Remove trailing slash if present
    if (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    // Append /api/json if not present
    if (!normalized.endsWith('/api/json')) {
        normalized += '/api/json';
    }
    return normalized;
}

// Update UI badge for connection status
function updateConnectionBadge() {
    const savedUrl = localStorage.getItem('sv_cobalt_api_url');
    if (savedUrl && savedUrl.trim() !== '') {
        connectionBadge.className = 'connection-badge badge custom-api';
        statusTextBadge.textContent = 'カスタムAPI';
    } else {
        connectionBadge.className = 'connection-badge badge connected';
        statusTextBadge.textContent = 'パブリックAPI';
    }
}

// Initialize Settings UI
function initSettings() {
    const savedUrl = localStorage.getItem('sv_cobalt_api_url');
    apiUrlInput.value = savedUrl || '';
    updateConnectionBadge();
}

// Settings Panel toggle
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
    // Smooth scroll to settings if shown
    if (!settingsPanel.classList.contains('hidden')) {
        settingsPanel.scrollIntoView({ behavior: 'smooth' });
    }
});

closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
});

// Save Settings
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const urlValue = apiUrlInput.value.trim();
    if (urlValue) {
        localStorage.setItem('sv_cobalt_api_url', urlValue);
    } else {
        localStorage.removeItem('sv_cobalt_api_url');
    }
    updateConnectionBadge();
    settingsPanel.classList.add('hidden');
    alert('API設定を保存しました。');
});

// Reset Settings
resetApiBtn.addEventListener('click', () => {
    apiUrlInput.value = '';
    localStorage.removeItem('sv_cobalt_api_url');
    updateConnectionBadge();
    alert('デフォルト設定（パブリックAPI）に戻しました。');
});

// Form submission handler (Download video)
downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const videoUrl = urlInput.value.trim();
    if (!videoUrl) return;

    // Reset and show status area
    showState('loading');
    statusText.textContent = '動画を解析中...';
    downloadBtn.disabled = true;

    const apiUrl = getApiUrl();

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl,
                videoQuality: '1080', // Fetch 1080p if available
                filenamePattern: 'basic',
                disableMetadata: false
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.code || `HTTP Error ${response.status}`);
        }

        const data = await response.json();

        // Handle Cobalt API responses
        if (data.status === 'error') {
            throw new Error(data.error?.code || 'ダウンロードリンクの取得に失敗しました。');
        }

        if (data.status === 'stream' || data.status === 'redirect') {
            // Success! Stream/download URL is ready
            videoTitle.textContent = data.filename || '動画ファイルの取得が成功しました';
            saveLink.href = data.url;
            showState('success');
            
            // Auto open download link in a new tab for seamless mobile UX
            window.open(data.url, '_blank');
        } else if (data.status === 'picker') {
            // Multiple items (e.g. twitter threads, gallery)
            if (data.picker && data.picker.length > 0) {
                // Default to first item
                videoTitle.textContent = 'マルチアイテム動画の最初のファイル';
                saveLink.href = data.picker[0].url;
                showState('success');
                window.open(data.picker[0].url, '_blank');
            } else {
                throw new Error('動画ファイルが見つかりませんでした。');
            }
        } else {
            throw new Error('予期しないレスポンスステータスです。');
        }

    } catch (error) {
        console.error('Download error:', error);
        errorMsg.innerHTML = translateErrorCode(error.message);
        showState('error');
    } finally {
        downloadBtn.disabled = false;
    }
});

// UI State Switcher
function showState(state) {
    statusArea.classList.remove('hidden');
    
    loadingState.classList.add('hidden');
    successState.classList.add('hidden');
    errorState.classList.add('hidden');

    if (state === 'loading') {
        loadingState.classList.remove('hidden');
    } else if (state === 'success') {
        successState.classList.remove('hidden');
    } else if (state === 'error') {
        errorState.classList.remove('hidden');
    }
}

// Map Cobalt error codes to user-friendly Japanese messages
function translateErrorCode(errMsg) {
    let baseMsg = '';
    // Check if network error (typical CORS or server offline)
    if (errMsg.includes('Failed to fetch') || errMsg.includes('TypeError') || errMsg.includes('HTTP Error')) {
        baseMsg = 'APIサーバーへの接続に失敗しました。CORS制限が発生しているか、サーバーが一時的にダウンしている可能性があります。';
    } else {
        switch (errMsg) {
            case 'error.api.youtube.rate_limit':
                baseMsg = 'YouTube側で一時的なアクセス制限（レートリミット）が発生しています。しばらく待ってから再度お試しください。';
                break;
            case 'error.api.youtube.unsupported':
                baseMsg = 'サポートされていないYouTube URLか、地域・年齢制限がかかっています。';
                break;
            case 'error.api.x.unsupported':
                baseMsg = 'X (Twitter) のURLが正しく解析できません。ログイン限定動画の可能性があります。';
                break;
            case 'error.api.url_invalid':
                baseMsg = '無効なURL形式です。YouTubeまたはXの動画ページURLを入力してください。';
                break;
            default:
                baseMsg = `ダウンロードに失敗しました: ${errMsg}`;
        }
    }

    // Add recommendation to use a custom API if currently using default public API
    const savedUrl = localStorage.getItem('sv_cobalt_api_url');
    if (!savedUrl) {
        baseMsg += '<br><span style="font-size: 0.8rem; display: block; margin-top: 0.6rem; color: #a5b4fc; line-height: 1.4;">💡 パブリックAPIはアクセス制限がかかりやすいため、右上の ⚙️ ボタンからご自身のカスタムAPIを設定することをお勧めします。</span>';
    }
    return baseMsg;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initSettings();
});
