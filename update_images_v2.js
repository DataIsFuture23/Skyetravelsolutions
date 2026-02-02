const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function updateMoreImages() {
    try {
        const pool = await sql.connect(config);

        const updates = [
            { title: 'Bora Bora, French Polynesia', image: 'https://images.unsplash.com/photo-1533660862551-38374d6c757c?q=80&w=2070&auto=format&fit=crop' }, // Correct Bora Bora
            { title: 'Phuket, Thailand', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=2001&auto=format&fit=crop' }, // This was actually ok, but let's ensure unique if possible. Unsplash ID matches Andaman. Let's pick a new one.
            { title: 'Phuket, Thailand', image: 'https://images.unsplash.com/photo-1532408840197-e936791ffc3a?q=80&w=2070&auto=format&fit=crop' }, // New Phuket
            { title: 'Cape Town, South Africa', image: 'https://images.unsplash.com/photo-1580060839134-757df0724431?q=80&w=2071&auto=format&fit=crop' }, // Wait, checking content
            // The previous check showed Cape Town shared ID with Vegas (757df...). That's definitely wrong.
            { title: 'Cape Town, South Africa', image: 'https://images.unsplash.com/photo-1576485290814-6c1358908f52?q=80&w=2068&auto=format&fit=crop' }, // New Cape Town
            { title: 'Costa Rica', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=2070&auto=format&fit=crop' }, // Matches Prague.
            { title: 'Costa Rica', image: 'https://images.unsplash.com/photo-1516962272895-8a82d0399d8d?q=80&w=2072&auto=format&fit=crop' }, // New Costa Rica
            { title: 'Melbourne, Australia', image: 'https://images.unsplash.com/photo-1540448051910-09cfadd5df61?q=80&w=2070&auto=format&fit=crop' } // Fresh Melbourne
        ];

        for (const item of updates) {
            await pool.request()
                .input('image', sql.NVarChar, item.image)
                .input('title', sql.NVarChar, item.title)
                .query("UPDATE destinations SET image = @image WHERE title = @title");

            console.log(`✅ Fixed image for ${item.title}`);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

updateMoreImages();
