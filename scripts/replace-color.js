const fs = require('fs');
const path = require('path');

const files = [
    'src/app/page.tsx',
    'src/components/layout/install-prompt.tsx',
    'src/app/globals.css',
    'src/app/layout.tsx',
    'src/components/landing/showcase-images.tsx',
    'src/components/landing/hero-section.tsx',
    'src/components/ui/button.tsx',
    'scripts/generate-icons.js',
    'public/manifest.json'
];

// Target color to restore: #f3b820 (Original Yellow) - RGB: 243, 184, 32
// Hover color: #d9a21b 
const replacements = [
    { search: /#D4AF37/g, replace: '#f3b820' },
    { search: /#B5952F/g, replace: '#d9a21b' },
    { search: /rgba\(212,175,55/g, replace: 'rgba(243,184,32' }
];

files.forEach(relativePath => {
    const fullPath = path.join(__dirname, '..', relativePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        replacements.forEach(({ search, replace }) => {
            content = content.replace(search, replace);
        });
        fs.writeFileSync(fullPath, content, 'utf8');
    }
});
console.log('Colors replaced successfully.');
