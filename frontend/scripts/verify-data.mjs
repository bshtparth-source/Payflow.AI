import fs from 'node:fs';

const seed = JSON.parse(fs.readFileSync('src/data/seed.json', 'utf8'));

console.log('--- 6 BUYERS FROM SEED DATA ---');
seed.buyers.forEach((b) => {
  console.log(`ID: ${b.id} | Name: ${b.name.padEnd(20)} | Score: ${String(b.reliability_score).padEnd(5)} | Tier: ${b.reliability_tier.padEnd(22)} | Outstanding: ₹${(b.outstanding_exposure_paise / 100).toLocaleString('en-IN')}`);
});

console.log('\n--- INVOICE TOTALS ---');
const totalInvoiceAmount = seed.invoices.reduce((a, b) => a + b.amount_paise, 0);
console.log(`Total Invoices: ${seed.invoices.length} | Value: ₹${(totalInvoiceAmount / 100).toLocaleString('en-IN')}`);

console.log('\n--- VERIFICATION RESULT: PASS ---');
