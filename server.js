const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MediaForge Downloader</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
body { background: #0f172a; color: #f8fafc; display: flex; justify-content: center; padding: 20px 10px; min-height: 100vh; align-items: center; }
.container { background: #1e293b; border-radius: 16px; padding: 25px; width: 100%; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
h1 { font-size: 1.5rem; text-align: center; margin-bottom: 20px; color: #38bdf8; }
input, select { width: 100%; padding: 12px; margin-bottom: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff; outline: none; font-size: 1rem; }
.main-btn { width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; }
#result { margin-top: 15px; }
.dl-btn { display: block; margin-top: 10px; padding: 14px; text-align: center; background: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1rem; word-break: break-all; }
</style>
</head>
<body>
<div class="container">
<h1>MediaForge Downloader</h1>
<input type="text" id="url" placeholder="Paste Insta, FB or YT link...">
<select id="format">
<option value="mp4">Video MP4</option>
<option value="mp3">Audio MP3</option>
</select>
<button class="main-btn" onclick="startDownload()">Get Direct Link</button>
<div id="result"></div>
</div>

<script>
function startDownload() {
    var url = document.getElementById('url').value.trim();
    var format = document.getElementById('format').value;
    var resDiv = document.getElementById('result');
    if(!url) { alert('Pehle URL paste karein!'); return; }

    resDiv.innerHTML = '<span style="color:#38bdf8;">⚡ Fetching direct Link...</span>';

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/download', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if(data.url) {
                    resDiv.innerHTML = '<a class="dl-btn" href="' + data.url + '" target="_blank">Click Here to Download ' + format.toUpperCase() + '</a>';
                } else {
                    resDiv.innerHTML = '<span style="color:#ef4444;">Link extract nahi ho paya! URL check karein.</span>';
                }
            } else {
                resDiv.innerHTML = '<span style="color:#ef4444;">Server Connection Error!</span>';
            }
        }
    };
    xhr.send(JSON.stringify({ url: url, format: format }));
}
</script>
</body>
</html>`);
});

app.post('/download', (req, res) => {
    let rawUrl = req.body.url ? req.body.url.trim() : '';
    let format = req.body.format || 'mp4';

    if (!rawUrl) return res.json({ url: null });

    let cleanUrl = rawUrl.split('?')[0];

    const fmt = format === 'mp3' ? 'ba/best' : 'b[ext=mp4]/best';
    const pythonCmd = `python -c "import yt_dlp; ydl = yt_dlp.YoutubeDL({'format': '${fmt}', 'quiet': True, 'no_warnings': True, 'extractor_args': {'youtube': {'player_client': ['android', 'web']}}}); info = ydl.extract_info('${cleanUrl}', download=False); print(info.get('url', ''))"`;

    exec(pythonCmd, { timeout: 15000 }, (error, stdout) => {
        if (!error && stdout.trim() && stdout.trim().startsWith('http')) {
            return res.json({ url: stdout.trim() });
        }
        return res.json({ url: null });
    });
});

app.listen(3000, () => console.log('Downloader running on port 3000!'));

