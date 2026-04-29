import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (f.startsWith('.') || f === 'node_modules' || f === 'public') return;
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const dirPath = path.resolve('.');

walkDir(dirPath, (filePath) => {
  const ext = path.extname(filePath);
  if (['.ts', '.tsx', '.json'].includes(ext)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;
    
    if (content.includes('201036264095')) {
      content = content.replace(/201036264095/g, '201036264095');
      changed = true;
    }
    
    if (content.includes('+20 10 36264095')) {
      content = content.replace(/\+20 10 36264095/g, '+20 10 36264095');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});

console.log('Done.');
