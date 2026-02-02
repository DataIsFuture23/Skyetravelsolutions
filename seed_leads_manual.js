const sql = require('mssql/msnodesqlv8');
const initialLeads = require('./data/leads.json');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function seedLeads() {
    try {
        console.log('Connecting to database...');
        const pool = await sql.connect(config);

        const result = await pool.request().query("SELECT COUNT(*) as count FROM leads");
        if (result.recordset[0].count === 0) {
            console.log("Seeding leads...");
            for (const lead of initialLeads) {
                await pool.request()
                    .input('name', sql.NVarChar, lead.name)
                    .input('vibe', sql.NVarChar, lead.vibe)
                    .input('budget', sql.NVarChar, lead.budget)
                    .input('whatsapp_url', sql.NVarChar, lead.whatsapp_url)
                    .query(`INSERT INTO leads (name, vibe, budget, whatsapp_url) VALUES (@name, @vibe, @budget, @whatsapp_url)`);
            }
            console.log("Leads seeded successfully!");
        } else {
            console.log("Leads table already has data. Skipping seed.");
        }
    } catch (err) {
        console.error("Error seeding leads:", err);
    } finally {
        await sql.close();
    }
}

seedLeads();
