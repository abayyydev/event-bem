const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('.');

files.forEach(f => {
  if (f.includes('axios') || f.includes('api.ts')) return; // Skip api config files

  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('http://localhost:5000')) {
    console.log('Fixing file:', f);

    // Replace the URL
    content = content.replace(/http:\/\/localhost:5000/g, '${getBackendBaseUrl()}');

    // Add import if not present
    if (!content.includes('getBackendBaseUrl')) {
        console.log('  Adding import to:', f);
        // Find the last import
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIndex = i;
            }
        }
        
        const importStmt = `import { getBackendBaseUrl } from "@/lib/axios";\n`;
        if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, importStmt);
        } else {
            lines.unshift(importStmt);
        }
        content = lines.join('\n');
    } else {
        // It contains getBackendBaseUrl but does it import it?
        if (!content.includes('import { getBackendBaseUrl }')) {
             const lines = content.split('\n');
             lines.splice(0, 0, `import { getBackendBaseUrl } from "@/lib/axios";\n`);
             content = lines.join('\n');
        }
    }

    fs.writeFileSync(f, content, 'utf8');
  }
});
console.log('Done replacing URLs');
