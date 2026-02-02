const sql = require('mssql/msnodesqlv8');
const bcrypt = require('bcrypt');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function resetPassword() {
    try {
        const pool = await sql.connect(config);
        const email = 'skyetravelsolution@gmail.com';
        const newPass = 'admin123';
        const hashedSwitch = await bcrypt.hash(newPass, 10);

        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedSwitch)
            .query("UPDATE users SET password = @password WHERE email = @email");

        console.log(`Password for ${email} reset to '${newPass}'`);

    } catch (err) {
        console.error(err);
    }
}

resetPassword();
