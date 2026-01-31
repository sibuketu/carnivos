import fs from 'fs';
import path from 'path';

function removeConsoleLogs(dir: string) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                removeConsoleLogs(filePath);
            }
        } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;

            // Simple regex for single line console.log
            // This caches console.log('...'); (including trailing semicolon or not)
            // and removes the whole line if it's just a console.log, or just the statement

            // Remove lines that contain only console.log (with optional indentation)
            content = content.replace(/^\s*console\.log\(.*\);?\s*$/gm, '');

            // Remove inline console.log (less aggressive to avoid breaking code)
            // content = content.replace(/console\.log\(.*?\);?/g, ''); 

            // We will stick to line-based removal for cleaner code, capturing multiline calls is risky with regex
            // but let's try to catch common patterns.

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Cleaned: ${filePath}`);
            }
        }
    });
}

const targetDir = path.resolve(__dirname, '../src');
console.log(`Cleaning console.log from: ${targetDir}`);
removeConsoleLogs(targetDir);
