export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action } = req.body || {};

  // Supabase acties
  if (action === "loadItems" || action === "saveItems") {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

    if (action === "loadItems") {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/items?order=id.asc`, {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      });
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (action === "saveItems") {
      const { items } = req.body;
      // Verwijder alle items en zet nieuwe terug
      await fetch(`${SUPABASE_URL}/rest/v1/items?id=gte.0`, {
        method: "DELETE",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (items.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/items`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(items.map(i => ({
            id: i.id,
            text: i.text,
            done: i.done,
            list: i.list,
            cat: i.cat,
            owner: i.owner,
            notes: i.notes,
            milestones: i.milestones,
            ai_content: i.aiContent || null,
          }))),
        });
      }
      return res.status(200).json({ ok: true });
    }
  }

  // Claude API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

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
    return res.status(500).json({ error: "Internal server error" });
  }
}
