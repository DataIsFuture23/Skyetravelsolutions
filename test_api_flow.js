const sql = require('mssql/msnodesqlv8');
const http = require('http');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

function getRequest(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body })); // Return body as string
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function runTest() {
    try {
        // 1. Create a dummy user
        const email = `test_admin_${Date.now()}@test.com`;
        const password = 'password123';
        const registerData = JSON.stringify({ name: 'Test Admin', email, password });

        console.log(`1. Registering ${email}...`);
        const regRes = await postRequest('/api/register', registerData);
        if (regRes.status !== 200) throw new Error('Registration failed');

        // 2. Promote to Admin via DB
        console.log('2. Promoting user to admin in DB...');
        await sql.connect(config);
        await sql.query(`UPDATE users SET isAdmin = 1 WHERE email = '${email}'`);
        await sql.close();

        // 3. Login
        console.log('3. Logging in...');
        const loginData = JSON.stringify({ email, password });
        const loginRes = await postRequest('/api/login', loginData);

        if (loginRes.status !== 200) throw new Error('Login failed');
        const token = loginRes.body.token;
        console.log('   Token received.');

        // 4. Fetch Leads
        console.log('4. Fetching Leads...');
        const leadsRes = await getRequest('/api/admin/leads', token);
        console.log(`   Status: ${leadsRes.status}`);
        console.log(`   Body: ${leadsRes.body}`);

        try {
            const leads = JSON.parse(leadsRes.body);
            if (Array.isArray(leads)) {
                console.log('   SUCCESS: Received an array of leads.');
                console.log(`   Count: ${leads.length}`);
            } else {
                console.log('   FAILURE: Did not receive an array.');
            }
        } catch (e) {
            console.log('   FAILURE: Response is not JSON.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

runTest();
