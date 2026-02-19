
const apiKey = 'AIzaSyBwMP0hWOOvbpdLTIgiwZEVkvH6I_zViso';

async function testGemini() {
    console.log('Testing Gemini API key...');
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: 'Hello, are you working?' }] }
                    ]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error.message);
        } else {
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log('Success! Response:', text);
        }
    } catch (err) {
        console.error('Network/Request Error:', err.message);
    }
}

testGemini();
