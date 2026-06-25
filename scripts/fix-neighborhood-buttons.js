const fs = require('fs');

const files = ['neighborhoods.html', 'neighborhoods/westchester.html'];

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replaceAll('class="btn btn-primary"', 'class="btn btn-blue"');
  fs.writeFileSync(file, html);
}

console.log('Neighborhood buttons aligned to site button classes.');
