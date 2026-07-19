const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

test('meal-plan generation uses the supported Gemini 2.5 Flash Vertex model', () => {
  const source = readFileSync(join(__dirname, 'src/ai/genkit.ts'), 'utf8');

  assert.match(source, /vertexAI\.model\('gemini-2\.5-flash'\)/);
});
