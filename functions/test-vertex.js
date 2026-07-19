const { vertexAI } = require('@genkit-ai/google-genai');
const { genkit } = require('genkit');

async function test() {
  const ai = genkit({
    plugins: [vertexAI({ location: 'us-central1' })],
  });

  const modelsToTest = ['gemini-3.5-flash', 'gemini-1.5-flash-001', 'gemini-1.5-flash-002', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  
  for (const model of modelsToTest) {
    try {
      console.log(`Testing ${model}...`);
      await ai.generate({
        model: vertexAI.model(model),
        prompt: 'hello'
      });
      console.log(`SUCCESS: ${model}`);
      return; 
    } catch (e) {
      console.log(`FAILED: ${model} - ${e.message}`);
    }
  }
}
test();
