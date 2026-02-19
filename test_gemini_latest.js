
const apiKey = 'AIzaSyBwMP0hWOOvbpdLTIgiwZEVkvH6I_zViso';

async function testGeminiFlashLatestCheck() {
    console.log('Testing gemini-flash-latest...');
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: 'Hi' }] }
                    ]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.log('Error:', data.error.message);
        } else {
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log('Success! Response:', text);
        }
    } catch (err) {
        console.error('Network Error:', err.message);
    }
}

testGeminiFlashLatestCheck();
