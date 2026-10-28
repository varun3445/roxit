// Daily ping so the free Supabase project never auto-pauses. Called by the cron in vercel.json.
module.exports = async (req, res) => {
  const url = process.env.SUPABASE_URL || 'https://lhnjqauudgpsdvddczwn.supabase.co';
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XHtCxSh7f4gNJEvszgM0aA_wT6TLWme';
  try {
    const r = await fetch(url + '/rest/v1/tracker_state?select=user_id&limit=1', { headers: { apikey: key } });
    res.status(200).json({ ok: r.ok, status: r.status });
  } catch (e) { res.status(200).json({ ok: false }); }
};
