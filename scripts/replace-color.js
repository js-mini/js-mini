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

// Target color: #D4AF37 (Metallic Gold) - RGB: 212, 175, 55
// Hover color: #B5952F (Darker Gold)
const replacements = [
    { search: /#f3b820/g, replace: '#D4AF37' },
    { search: /#F3B820/g, replace: '#D4AF37' },
    { search: /#d9a21b/g, replace: '#B5952F' },
    { search: /rgba\(243,184,32/g, replace: 'rgba(212,175,55' }
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
