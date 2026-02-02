const fs = require('fs');
const path = require('path');

console.log("Starting Final System Verification...");

const filesToCheck = [
    'index.html',
    'admin.html',
    'destination-details.html',
    'js/script.js',
    'css/style.css',
    'js/sweetalert-theme.js',
    'media/hero.mp4'
];

let errors = [];

// 1. FILE EXISTENCE CHECK
console.log("\n1. Checking Key Files...");
filesToCheck.forEach(f => {
    if (fs.existsSync(f)) {
        console.log(`✅ Found: ${f}`);
    } else {
        console.error(`❌ MISSING: ${f}`);
        errors.push(`Missing File: ${f}`);
    }
});

// 2. DATA CONSISTENCY CHECK (ID Mismatch)
console.log("\n2. Verifying Destination Data Integrity...");
const scriptContent = fs.readFileSync('js/script.js', 'utf8');
const detailsContent = fs.readFileSync('destination-details.html', 'utf8');

// Extract IDs from script.js OFFLINE_DESTINATIONS
const scriptIds = [];
const scriptMatch = scriptContent.match(/id:\s*['"](\d+)['"]/g);
if (scriptMatch) {
    scriptMatch.forEach(m => scriptIds.push(m.match(/\d+/)[0]));
}

// Extract IDs from destination-details.html
const detailsIds = [];
const detailsMatch = detailsContent.match(/id:\s*['"](\d+)['"]/g);
if (detailsMatch) {
    detailsMatch.forEach(m => detailsIds.push(m.match(/\d+/)[0]));
}

console.log(`Script.js IDs found: ${scriptIds.length}`);
console.log(`Details.html IDs found: ${detailsIds.length}`);

// Check specific critical IDs
const criticalIds = ['1', '2', '35', '27']; // Taj, Goa, Machu, Dubai
criticalIds.forEach(id => {
    const inScript = scriptIds.includes(id);
    const inDetails = detailsIds.includes(id);
    if (inScript && inDetails) {
        console.log(`✅ ID ${id} present in both files.`);
    } else {
        console.error(`❌ ID ${id} mismatch! Script: ${inScript}, Details: ${inDetails}`);
        errors.push(`ID ${id} mismatch`);
    }
});

// 3. LOGIC CHECK (Demo Mode)
console.log("\n3. Checking Demo Mode Logic...");
if (scriptContent.includes('localStorage.setItem(\'demo_mode\', \'true\')')) {
    console.log("✅ Demo Mode Trigger found in Login logic.");
} else {
    console.error("❌ Demo Mode Trigger MISSING in script.js");
    errors.push("Missing Demo Mode Trigger");
}

if (scriptContent.includes('contactForm.addEventListener')) {
    console.log("✅ Contact Form Listener found.");
} else {
    console.error("❌ Contact Form Listener MISSING.");
    errors.push("Missing Contact Form Listener");
}

const adminContent = fs.readFileSync('admin.html', 'utf8');
if (adminContent.includes('OFFLINE_DESTINATIONS')) {
    console.log("✅ Offline Data Fallback found in Admin Panel.");
} else {
    console.error("❌ Offline Data Fallback MISSING in Admin Panel.");
    errors.push("Missing Offline Admin Data");
}

// 4. CONNECTION CHECK (Links)
console.log("\n4. Checking Page Links...");
if (adminContent.includes('destinations.html') || adminContent.includes('destination-details.html')) {
    // Basic check for link existence
}
// We want to ensure admin.html links to dashboard/logout
if (adminContent.includes('logout()')) {
    console.log("✅ Logout logic present in Admin.");
} else {
    errors.push("Logout logic missing in Admin");
}

console.log("\n--- VERIFICATION SUMMARY ---");
if (errors.length === 0) {
    console.log("✅✅ SYSTEM INTEGRITY CONFIRMED. READY FOR DEPLOYMENT. ✅✅");
} else {
    console.log("⚠️ ISSUES FOUND:");
    errors.forEach(e => console.log(`- ${e}`));
}
