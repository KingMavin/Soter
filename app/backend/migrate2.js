const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const exceptionMap = {
  'NotFoundException': { code: 'NOT_FOUND', status: 404 },
  'BadRequestException': { code: 'BAD_REQUEST', status: 400 },
  'ForbiddenException': { code: 'FORBIDDEN', status: 403 },
  'UnauthorizedException': { code: 'UNAUTHORIZED', status: 401 },
  'ConflictException': { code: 'CONFLICT', status: 409 },
  'UnprocessableEntityException': { code: 'VALIDATION_ERROR', status: 422 },
  'InternalServerErrorException': { code: 'INTERNAL_SERVER_ERROR', status: 500 }
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(srcDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We previously did: throw new AppException(ERROR_CODES.NOT_FOUND, 'some msg')
  // We need to fix it to: throw new AppException(ERROR_CODES.NOT_FOUND, 404, 'some msg')
  
  let modified = false;

  for (const [exc, mapInfo] of Object.entries(exceptionMap)) {
    // Regex for what we accidentally did (e.g. throw new AppException(ERROR_CODES.NOT_FOUND, 'msg'))
    const regex1 = new RegExp(`throw new AppException\\(ERROR_CODES\\.${mapInfo.code},\\s*([^)]+)\\)`, 'g');
    if (regex1.test(content)) {
      content = content.replace(regex1, `throw new AppException(ERROR_CODES.${mapInfo.code}, ${mapInfo.status}, $1)`);
      modified = true;
    }

    // Also regex for unmigrated exceptions just in case: throw new NotFoundException('msg')
    const regex2 = new RegExp(`throw new ${exc}\\(([^)]+)\\)`, 'g');
    if (regex2.test(content)) {
      content = content.replace(regex2, `throw new AppException(ERROR_CODES.${mapInfo.code}, ${mapInfo.status}, $1)`);
      modified = true;
      
      // Inject import if missing
      if (!content.includes('import { AppException')) {
        const depth = filePath.replace(srcDir, '').split(path.sep).length - 2;
        const relativePath = depth > 0 ? '../'.repeat(depth) : './';
        content = `import { AppException, ERROR_CODES } from '${relativePath}common/dto/error-response.dto';\n` + content;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log(`Migration script ran successfully.`);
