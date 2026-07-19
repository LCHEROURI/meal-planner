const { JSDOM } = require('jsdom');
JSDOM.fromURL("http://localhost:4173/", {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
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
});
