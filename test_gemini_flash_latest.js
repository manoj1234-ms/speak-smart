
const apiKey = 'AIzaSyBwMP0hWOOvbpdLTIgiwZEVkvH6I_zViso';

async function testGeminiFlashLatest() {
    console.log('Testing Gemini API key with gemini-flash-latest...');
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
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
            console.log('Error with gemini-2.0-flash-lite:', data.error.message);

            // Try verify with list again if everything fails
        } else {
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log('Success with gemini-2.0-flash-lite! Response:', text);
        }
    } catch (err) {
        console.error('Network/Request Error:', err.message);
    }
}

testGeminiFlashLatest();
