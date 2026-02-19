
const apiKey = 'AIzaSyBwMP0hWOOvbpdLTIgiwZEVkvH6I_zViso';

async function listAllModels() {
    console.log('Listing all models...');
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error.message);
        } else {
            console.log('All Models:', data.models.map(m => m.name));
        }
    } catch (err) {
        console.error('Network Error:', err.message);
    }
}

listAllModels();
