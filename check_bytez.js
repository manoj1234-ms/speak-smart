
const endpoints = [
    'https://api.bytez.com/v1/chat/completions',
    'https://api.bytez.com/chat/completions',
    'https://api.bytez.com/models/v2/openai/gpt-4o-mini', // From search result
    'https://bytez.com/api/v1/chat/completions'
];

async function checkEndpoints() {
    for (const url of endpoints) {
        try {
            console.log(`Checking ${url}...`);
            const res = await fetch(url, { method: 'POST' });
            console.log(`${url} -> ${res.status} ${res.statusText}`);
        } catch (err) {
            console.log(`${url} -> Error: ${err.message}`);
        }
    }
}

checkEndpoints();
