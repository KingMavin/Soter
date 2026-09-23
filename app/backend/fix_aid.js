const fs = require('fs');
let c = fs.readFileSync('src/onchain/aid-escrow.controller.ts', 'utf8');
c = c.replace(
  "throw new BadRequestException('Recipient address is required');",
  "throw new AppException(ERROR_CODES.BAD_REQUEST, 400, 'Recipient address is required');"
);
fs.writeFileSync('src/onchain/aid-escrow.controller.ts', c);
console.log("aid-escrow fixed");
