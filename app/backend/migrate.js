const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const exceptionMap = {
  'NotFoundException': 'NOT_FOUND',
  'BadRequestException': 'BAD_REQUEST',
  'ForbiddenException': 'FORBIDDEN',
  'UnauthorizedException': 'UNAUTHORIZED',
  'ConflictException': 'CONFLICT',
  'UnprocessableEntityException': 'VALIDATION_ERROR', // Mapping to VALIDATION_ERROR based on nestjs usage
  'InternalServerErrorException': 'INTERNAL_SERVER_ERROR'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const errorResponseDtoPath = 'src/common/dto/error-response.dto';
let migratedCount = 0;

walkDir(srcDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  let needsImport = false;

  for (const [exc, errCode] of Object.entries(exceptionMap)) {
    const regex = new RegExp(`throw new ${exc}\\(([^)]+)\\)`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `throw new AppException(ERROR_CODES.${errCode}, $1)`);
      needsImport = true;
    }
  }

  if (needsImport) {
    if (!content.includes('import { AppException')) {
      // Very naive import injection
      const depth = filePath.replace(srcDir, '').split(path.sep).length - 2;
      const relativePath = depth > 0 ? '../'.repeat(depth) : './';
      content = `import { AppException, ERROR_CODES } from '${relativePath}common/dto/error-response.dto';\n` + content;
    }
    
    // clean up unused nest exceptions if we replaced them all - not necessary for a rough pass
    
    fs.writeFileSync(filePath, content, 'utf8');
    migratedCount++;
  }
});

console.log(`Migrated exceptions in ${migratedCount} files.`);
