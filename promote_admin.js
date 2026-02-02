
const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function promoteAll() {
    try {
        const pool = await sql.connect(config);
        await pool.request().query('USE SkyeTravelDB');

        // Update all users to Admin
        const result = await pool.request().query("UPDATE users SET isAdmin = 1");

        console.log(`✅ Success! Promoted ${result.rowsAffected[0]} users to Admin.`);

        // List them
        const users = await pool.request().query("SELECT name, email, isAdmin FROM users");
        console.table(users.recordset);

    } catch (err) {
        console.error('Error:', err);
    }
}

promoteAll();
