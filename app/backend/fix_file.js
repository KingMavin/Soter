const fs = require('fs');
let c = fs.readFileSync('src/evidence/file-validation.spec.ts', 'utf8');

// fix imports
c = c.replace(
  "import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';\r\nimport { AppException } from '../common/dto/error-response.dto';\r\nimport { PayloadTooLargeException } from '@nestjs/common';",
  "import { PayloadTooLargeException } from '@nestjs/common';\nimport { AppException } from '../common/dto/error-response.dto';"
);
// just in case \n
c = c.replace(
  "import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';\nimport { AppException } from '../common/dto/error-response.dto';\nimport { PayloadTooLargeException } from '@nestjs/common';",
  "import { PayloadTooLargeException } from '@nestjs/common';\nimport { AppException } from '../common/dto/error-response.dto';"
);

// fix assertions
c = c.replace(/expect\(err\)\.toBeInstanceOf\(BadRequestException\);/g, "expect(err).toBeInstanceOf(AppException);");

fs.writeFileSync('src/evidence/file-validation.spec.ts', c);
console.log("file-validation.spec fixed");
