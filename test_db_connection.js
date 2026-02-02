const sql = require('mssql/msnodesqlv8');

const config = {
    // Connection String is more reliable for specifying drivers
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function connect() {
    try {
        console.log('Attempting to connect to SQL Server on localhost...');
        let pool = await sql.connect(config);
        console.log('✅ Connection Successful!');
        console.log('Server version:', (await pool.request().query('SELECT @@VERSION')).recordset[0]);
        pool.close();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        console.log('\nPossible reasons:\n1. SQL Server is not installed or running.\n2. TCP/IP is not enabled in SQL Configuration.\n3. Integrated Security (Windows Auth) needs setup.');
    }
}

connect();
