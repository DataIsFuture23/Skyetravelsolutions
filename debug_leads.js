const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function checkLeads() {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT * FROM leads');
        console.log('Leads count:', result.recordset.length);
        console.log('Leads data:', result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.close();
    }
}

checkLeads();
