
const apiKey = 'AIzaSyBwMP0hWOOvbpdLTIgiwZEVkvH6I_zViso';

async function testGemini2() {
    console.log('Testing Gemini API key with gemini-2.0-flash...');
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

testGemini2();
