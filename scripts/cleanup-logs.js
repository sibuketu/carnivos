import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function clean(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                if (file !== 'node_modules' && file !== '.git') clean(fullPath);
            } else if (/\.tsx?$/.test(file)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                // Simple regex to remove console.log statements
                const original = content;
                content = content.replace(/^\s*console\.log\(.*?\);?\s*$/gm, '');

                if (content !== original) {
                    fs.writeFileSync(fullPath, content);
                    console.log('Cleaned:', fullPath);
                }
            }
        } catch (e) {
            console.error('Error processing', fullPath, e);
        }
    }
}
console.log('Starting cleanup...');
clean(path.resolve(__dirname, '../src'));
console.log('Cleanup complete.');
