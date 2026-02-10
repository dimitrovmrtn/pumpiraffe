//const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjFjZTZlMDU0LTY3YTItNDg3YS1iZDkxLWNhZGVjMTE3OWM0MCIsIm9yZ0lkIjoiNDcxMDM5IiwidXNlcklkIjoiNDg0NTY4IiwidHlwZSI6IlBST0pFQ1QiLCJ0eXBlSWQiOiJhMzc3MTY3ZC0wNGVlLTRlMTQtYWViNS0xZjhmZTViNGM2YzkiLCJpYXQiOjE3NTk1MTQyOTYsImV4cCI6NDkxNTI3NDI5Nn0.6C4ruIVWUbKVEnRGZBPAPuZPG4NO5l0s67Cu5MzknAA";
// Single source of truth for Token Address
const TOKEN_ADDRESS = "CQUbLQyinGrNfnZ7tpVQCHtVyLAoX8KVEiJu1qa4pump";

const MIN_MCAP = 2400;
const MAX_MCAP = 100000;
const MIN_NECK_H = 50; // px
const MAX_NECK_H = 3000; // px - EXTREME growth!

const marketCapEl = document.getElementById('market-cap');
const neckHeightEl = document.getElementById('neck-height');
const neckDiv = document.getElementById('giraffe-neck');
const giraffeContainer = document.querySelector('.giraffe-container');

// Scroll to bottom on page load (savannah level)
window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
});

async function fetchMarketCap() {
    try {
        // Use local proxy to fetch from pump.fun frontend API (avoids CORS)
        // Pass token address dynamically to the proxy with cache busting
        const response = await fetch(`https://pumpiraffe.onrender.com/mcap?token=${TOKEN_ADDRESS}&t=${Date.now()}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Debug logging for the API response
        console.log("---------- API RESPONSE ----------");
        console.log("usd_market_cap:", data.usd_market_cap);
        console.log("----------------------------------");

        let mcap = data.usd_market_cap || data.market_cap;

        // Fallback calculation
        if (!mcap && data.usd_price) {
            const supply = 1000000000;
            mcap = data.usd_price * supply;
        }

        console.log(`Market Cap: $${mcap}`);

        if (mcap) {
            updateUI(mcap);
            document.querySelector('.title').style.color = 'white'; // Reset color if connected
        }

        // Update token info
        const tokenSymbol = data.symbol || "Token";
        document.querySelector('.title').innerText = `${tokenSymbol} Neck`;

    } catch (error) {
        console.error("Error fetching market cap:", error);
        // Visual indicator of error
        const titleEl = document.querySelector('.title');
        titleEl.innerText = "⚠️ API DISCONNECTED";
        titleEl.style.color = '#ff4444';

        // Add helper message if not exists
        if (!document.getElementById('api-help')) {
            const help = document.createElement('div');
            help.id = 'api-help';
            help.style.position = 'fixed';
            help.style.top = '10px';
            help.style.left = '50%';
            help.style.transform = 'translateX(-50%)';
            help.style.background = 'rgba(0,0,0,0.8)';
            help.style.color = '#ff4444';
            help.style.padding = '10px';
            help.style.borderRadius = '5px';
            help.style.zIndex = '1000';
            help.innerText = "Please run 'node proxy.js' in terminal!";
            document.body.appendChild(help);
        }
    }
}

function updateUI(mcap) {
    marketCapEl.innerText = `$${Math.floor(mcap).toLocaleString()}`;

    // Ensure mcap is between MIN and MAX
    const effectiveMcap = Math.min(Math.max(mcap, MIN_MCAP), MAX_MCAP);

    // Calculate progress (0 to 1)
    const progress = (effectiveMcap - MIN_MCAP) / (MAX_MCAP - MIN_MCAP);

    // Calculate neck height
    const neckHeight = MIN_NECK_H + (progress * (MAX_NECK_H - MIN_NECK_H));

    // Set variable for CSS on root so Head can access it too
    document.documentElement.style.setProperty('--neck-h', `${neckHeight}px`);

    // Update UI text (10px = 1m for display)
    const heightInMeters = (neckHeight / 10).toFixed(1);
    neckHeightEl.innerText = `${heightInMeters}m`;

    // Reset any scaling if applied
    if (giraffeContainer) {
        giraffeContainer.style.transform = `translateX(-50%) scale(1)`;
    }

    // Auto-scroll to keep the head visible when neck grows
    setTimeout(() => {
        const head = document.querySelector('.head');
        if (head) {
            head.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// Initial fetch
fetchMarketCap();

// Live update every 0.5 seconds (500ms)
setInterval(fetchMarketCap, 500);

// Music Player Logic
const musicBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('background-music');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        musicBtn.innerText = '🔊 Play Music';
        musicBtn.classList.remove('playing');
        isPlaying = false;
    } else {
        bgMusic.play();
        musicBtn.innerText = '🔇 Pause Music';
        musicBtn.classList.add('playing');
        isPlaying = true;
    }
});

// Token Address Copy Logic
const tokenAddressEl = document.getElementById('token-address');
// Display the configured address
tokenAddressEl.querySelector('code').innerText = TOKEN_ADDRESS;

tokenAddressEl.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(TOKEN_ADDRESS);
        const originalHTML = tokenAddressEl.innerHTML;
        tokenAddressEl.innerHTML = '<code>✓ Copied to clipboard!</code>';
        setTimeout(() => {
            tokenAddressEl.innerHTML = originalHTML;
            // Re-render the address after feedback
            tokenAddressEl.querySelector('code').innerText = TOKEN_ADDRESS;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});
