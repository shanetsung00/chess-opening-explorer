// scripts/split-openings.js
const fs   = require('fs');
const path = require('path');

const SRC_FILE   = path.join(__dirname, '..', 'public', 'openings.json');
const OUT_DIR    = path.join(__dirname, '..', 'public', 'openings');

// 1. Load the original huge JSON -------------------------------------------
if (!fs.existsSync(SRC_FILE)) {
  console.error('❌ openings.json not found at', SRC_FILE);
  process.exit(1);
}
const all = JSON.parse(fs.readFileSync(SRC_FILE, 'utf8'));

// 2. Bucket openings by the first ECO letter (A-E, else OTHER) -------------
const buckets = { A: [], B: [], C: [], D: [], E: [], OTHER: [] };

all.forEach(op => {
  const key = /^[A-E]/i.test(op.eco) ? op.eco[0].toUpperCase() : 'OTHER';
  buckets[key].push(op);
});

// 3. Make sure the output folder exists ------------------------------------
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// 4. Write each bucket and collect its size --------------------------------
const sizes = {};
Object.entries(buckets).forEach(([key, list]) => {
  if (!list.length) return;                 // skip empty buckets
  const outFile = path.join(OUT_DIR, `openings-${key}.json`);
  fs.writeFileSync(outFile, JSON.stringify(list, null, 2), 'utf8');
  sizes[key] = list.length;
  console.log(`✅ wrote ${outFile}  (${list.length})`);
});

// 5. Write band-sizes.json --------------------------------------------------
const sizesFile = path.join(OUT_DIR, 'band-sizes.json');
fs.writeFileSync(sizesFile, JSON.stringify(sizes, null, 2), 'utf8');
console.log(`✅ wrote ${sizesFile}`);

console.log('🎉  All done!');
