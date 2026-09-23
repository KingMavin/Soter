const fs = require('fs');
const path = require('path');

const exceptions = [
  'NotFoundException', 'BadRequestException', 'ForbiddenException',
  'UnauthorizedException', 'ConflictException', 'UnprocessableEntityException',
  'InternalServerErrorException'
];

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  exceptions.forEach(exc => {
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@nestjs\/common['"]/g;
    content = content.replace(importRegex, (match, p1) => {
      let inner = p1;
      const excRegex = new RegExp(`\\b${exc}\\b\\s*,?`, 'g');
      inner = inner.replace(excRegex, '');
      
      // Cleanup stray commas
      inner = inner.replace(/,\s*,/g, ',');
      inner = inner.replace(/^\s*,\s*/, '');
      inner = inner.replace(/,\s*$/, '');
      
      return `import { ${inner} } from '@nestjs/common'`;
    });
  });

  if (content !== original) {
    // cleanup empty imports
    content = content.replace(/import\s*{\s*}\s*from\s*['"]@nestjs\/common['"];?/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath);
    else if (dirPath.endsWith('.ts')) cleanFile(dirPath);
  });
}

walkDir(path.join(__dirname, 'src'));
console.log("Cleanup complete!");
