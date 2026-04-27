// api/claude.js — TIPO Brain serverless function
// Vercel server-side: API sleutels nooit in browser

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action } = req.body || {};

  // ── Storage acties ──────────────────────────────────────────────────────────
  if (action === "load" || action === "save") {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { key, value } = req.body;

    if (action === "load") {
      try {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/storage?key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
          { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
        );
        const data = await r.json();
        if (data?.[0]) return res.status(200).json({ value: data[0].value });
        return res.status(200).json({ value: null });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    if (action === "save") {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/storage`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
          },
          body: JSON.stringify({ key, value }),
        });
        return res.status(200).json({ ok: true });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  // ── Claude API ──────────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Anthropic API key not configured" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Claude API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
