const fs = require('fs');
async function test() {
  const GROQ_API_KEY = "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";
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
  });
  const data = await res.json();
  fs.writeFileSync('out.json', JSON.stringify(data.data.map(m => m.id), null, 2));
}
test();
