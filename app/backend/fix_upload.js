const fs = require('fs');
let c = fs.readFileSync('src/evidence/upload-session.service.ts', 'utf8');
c = c.replace(
  "if (session.ownerId !== ownerId) throw new ForbiddenException();",
  `if (session.ownerId !== ownerId) {
      throw new AppException(
        ERROR_CODES.FORBIDDEN,
        403,
        'You do not have access to this upload session',
      );
    }`
);
c = c.replace("import { ForbiddenException, Injectable, Logger } from '@nestjs/common';", "import { Injectable, Logger } from '@nestjs/common';");
fs.writeFileSync('src/evidence/upload-session.service.ts', c);
console.log("upload-session fixed");
