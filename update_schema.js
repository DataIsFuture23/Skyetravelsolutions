const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function updateSchema() {
    try {
        const pool = await sql.connect(config);

        console.log("Adding columns to bookings table...");

        // Check if column exists before adding to avoid errors
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_status')
                BEGIN
                    ALTER TABLE bookings ADD payment_status NVARCHAR(50) DEFAULT 'Pending';
                    ALTER TABLE bookings ADD amount NVARCHAR(50) DEFAULT '0';
                    ALTER TABLE bookings ADD transaction_id NVARCHAR(100);
                END
            `);
            console.log("✅ Schema Updated: Added payment_status, amount, and transaction_id.");
        } catch (e) {
            console.log("⚠️ Columns might already exist or error: " + e.message);
        }

    } catch (err) {
        console.error('Connection Error:', err);
    }
}

updateSchema();
