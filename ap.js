// Import required modules
const express = require('express');
const axios = require('axios');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse incoming JSON and form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the main HTML page
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YouTube Video Downloader</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #121212; color: #fff; }
            input { padding: 10px; width: 80%; margin: 10px 0; border-radius: 5px; border: 1px solid #333; }
            button { padding: 10px 20px; background-color: #28a745; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background-color: #218838; }
            #loading { display: none; color: #ffc107; margin-top: 10px; }
            #download-section { display: none; margin-top: 20px; }
            a { color: #28a745; text-decoration: none; margin: 10px 0; display: block; }
            footer { margin-top: 40px; font-size: 14px; color: #aaa; }
            footer a { color: #28a745; text-decoration: none; }
            footer a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>YouTube Video Downloader</h1>
        <form id="download-form">
            <input type="text" id="url" placeholder="Paste YouTube URL here..." required>
            <button type="submit">Get Download Links</button>
        </form>
        <div id="loading">Processing...</div>
        <div id="download-section">
            <h3>Available Download Options:</h3>
            <div id="download-links"></div>
        </div>
        <footer>
            Developed by <strong>@Hassan</strong><br>
            For contact, reach me on <a href="https://wa.me/393511289823" target="_blank">WhatsApp</a>
        </footer>
        <script>
            document.getElementById('download-form').addEventListener('submit', function (event) {
                event.preventDefault();
                const url = document.getElementById('url').value;
                const loading = document.getElementById('loading');
                const downloadSection = document.getElementById('download-section');
                const downloadLinks = document.getElementById('download-links');

                loading.style.display = 'block';
                downloadSection.style.display = 'none';
                downloadLinks.innerHTML = '';

                fetch('/get_video_formats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                })
                .then(response => response.json())
                .then(data => {
                    loading.style.display = 'none';

                    if (data.error) {
                        alert('Error: ' + data.error);
                        return;
                    }

                    downloadSection.style.display = 'block';
                    data.formats.forEach(format => {
                        const a = document.createElement('a');
                        a.href = format.url;
                        a.textContent = `${format.resolution || 'Audio'} - ${format.ext}`;
                        downloadLinks.appendChild(a);
                    });
                })
                .catch(error => {
                    loading.style.display = 'none';
                    alert('An error occurred. Please try again!');
                    console.error(error);
                });
            });
        </script>
    </body>
    </html>
    `);
});

// Route to fetch video formats
app.post('/get_video_formats', async (req, res) => {
    const youtubeUrl = req.body.url;

    if (!youtubeUrl) {
        return res.status(400).json({ error: 'No URL provided' });
    }

    try {
        // Hardcoded API key and host
        const RAPIDAPI_KEY = '38d94251c1mshb9e06a6431e3256p133708jsne945caa69';
        const RAPIDAPI_HOST = 'youtube-downloader2.p.rapidapi.com';

        const options = {
            method: 'GET',
            url: 'https://youtube-downloader2.p.rapidapi.com/video/details',
            params: { url: youtubeUrl },
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);
        const formats = response.data.formats.map(format => ({
            resolution: format.height ? `${format.height}p` : 'Audio',
            ext: format.ext,
            url: format.url
        }));

        res.json({ formats });
    } catch (error) {
        console.error('Error fetching video formats:', error.message);
        res.status(500).json({ error: 'Failed to fetch video details' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
