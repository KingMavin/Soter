const fs = require('fs');
const ciPath = '../../.github/workflows/backend-ci.yml';
let ci = fs.readFileSync(ciPath, 'utf8');
ci = ci.replace('run: pnpm --filter backend run test -- --runInBand', 'run: pnpm --filter backend exec jest --runInBand');
fs.writeFileSync(ciPath, ci);
console.log("CI fixed");
