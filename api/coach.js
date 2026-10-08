// Optional: set ANTHROPIC_API_KEY in Vercel to enable the "Get a coach read" button.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ text: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(200).json({ text: 'Coach read is not set up (missing ANTHROPIC_API_KEY).' });
  const prompt = String((req.body && req.body.prompt) || '').slice(0, 4000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.COACH_MODEL || 'claude-sonnet-5-5', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
    });
    const j = await r.json();
    res.status(200).json({ text: (j.content && j.content[0] && j.content[0].text) || 'No read available.' });
  } catch (e) { res.status(200).json({ text: 'Coach read failed.' }); }
};
