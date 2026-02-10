const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/mcap') {
        const token = parsedUrl.query.token;
        if (!token) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Token address required' }));
            return;
        }
        const targetUrl = `https://frontend-api-v3.pump.fun/coins/${token}`;

        https.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        }, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error('Error fetching data:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to fetch data' }));
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
