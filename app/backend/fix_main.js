const fs = require('fs');
let content = fs.readFileSync('src/main.ts', 'utf8');
content = content.replace('req["rawBody"] = buf;', 'req.rawBody = buf;');
content = content.replace("req['rawBody'] = buf;", 'req.rawBody = buf;');
fs.writeFileSync('src/main.ts', content);
console.log("main.ts fixed");
