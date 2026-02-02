const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'destinations.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    let destinations = JSON.parse(rawData);

    // Update each destination
    destinations = destinations.map(dest => {
        // Ensure Gallery
        if (!dest.gallery || dest.gallery.length === 0) {
            dest.gallery = [
                dest.image, // Use the main image
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop", // Generic Travel 1
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"  // Generic Travel 2
            ];
        }

        // Ensure Nearby
        if (!dest.nearby || dest.nearby.length === 0) {
            dest.nearby = [
                {
                    name: "City Center",
                    image: dest.image
                },
                {
                    name: "Cultural Heritage Site",
                    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1887&auto=format&fit=crop"
                }
            ];
        }
        return dest;
    });

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(destinations, null, 2), 'utf8');
    console.log(`✅ Successfully updated ${destinations.length} destinations with default content.`);

} catch (err) {
    console.error('Error updating destinations:', err);
}
