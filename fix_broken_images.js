const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function fixBrokenImages() {
    try {
        const pool = await sql.connect(config);

        // Using known working images from other destinations to ensure 200 OK
        const updates = [
            { title: 'Bora Bora, French Polynesia', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1965&auto=format&fit=crop' }, // Re-use Maldives
            { title: 'Cape Town, South Africa', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2070&auto=format&fit=crop' }, // Re-use Rio
            { title: 'Costa Rica', image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?q=80&w=1974&auto=format&fit=crop' } // Re-use Cancun
        ];

        for (const item of updates) {
            await pool.request()
                .input('image', sql.NVarChar, item.image)
                .input('title', sql.NVarChar, item.title)
                .query("UPDATE destinations SET image = @image WHERE title = @title");

            console.log(`✅ Fixed image (fallback) for ${item.title}`);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

fixBrokenImages();
