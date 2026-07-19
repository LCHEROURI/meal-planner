const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.addEventListener('error', (event) => {
  console.error('JSDOM Error:', event.error);
});

setTimeout(() => {
  const rootContent = dom.window.document.getElementById('root').innerHTML;
  if (rootContent) {
    console.log('SUCCESS: Content rendered:', rootContent.substring(0, 100));
  } else {
    console.log('FAILED: Root is empty');
  }
  process.exit(0);
}, 2000);
