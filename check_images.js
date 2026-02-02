const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function checkImages() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query("SELECT title, image FROM destinations WHERE title IN ('Hong Kong', 'Los Angeles, USA', 'Las Vegas, USA', 'Phuket, Thailand')");
        console.table(result.recordset);
    } catch (err) {
        console.error(err);
    }
}

checkImages();
