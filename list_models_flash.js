
const apiKey = 'AIzaSyBwMP0hWOOvbpdLTIgiwZEVkvH6I_zViso';

async function listModels() {
    console.log('Listing models...');
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error.message);
        } else {
            const flashModels = data.models.filter(m => m.name.includes('flash')).map(m => m.name);
            console.log('Flash Models:', flashModels);
        }
    } catch (err) {
        console.error('Network Error:', err.message);
    }
}

listModels();
