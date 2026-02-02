/* 
 * DATABASE CONFIGURATION
 * ----------------------
 * NOTE: This is a configuration file for the SQL Server Connection.
 * Since we are running a static website (HTML/CSS/JS only) without a backend server (Node.js/Python),
 * the browser CANNOT connect directly to the SQL Server for security reasons.
 * 
 * This configuration is prepared for when a backend server is available.
 * currently, the application will SIMULATE this connection to demonstrate functionality.
 */

const dbConfig = {
    server: 'IT\\SQLEXPRESS',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: '123456' // WARNING: Do not expose real passwords in client-side code in production!
        }
    },
    options: {
        encrypt: true,
        database: 'SkyeTravelDB' // Assumed database name
    }
};

// Simulation of Connection
console.log(`%c [SQL Server] Initializing connection to ${dbConfig.server}...`, 'color: orange; font-weight: bold;');

setTimeout(() => {
    console.log(`%c [SQL Server] Connected successfully as user: ${dbConfig.authentication.options.userName}`, 'color: green; font-weight: bold;');
    console.log(`%c [SQL Server] Real-time data sync active.`, 'color: green;');
}, 1500);
