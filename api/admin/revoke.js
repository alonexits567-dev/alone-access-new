export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  }

  const adminSecret = process.env.ALONE_ADMIN_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!adminSecret || !supabaseUrl || !serviceKey) {
    return res.status(500).json({
      success: false,
      message: "Server configuration is incomplete."
    });
  }

  const suppliedSecret = req.headers["x-admin-secret"];

  if (
    typeof suppliedSecret !== "string" ||
    suppliedSecret.length !== adminSecret.length ||
    suppliedSecret !== adminSecret
  ) {
    return res.status(401).json({
      success: false,
      message: "Admin access denied."
    });
  }

  const key = req.body?.key;

  if (typeof key !== "string" || !key.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide an access key."
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/revoke_access_key`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ p_key: key.trim() })
      }
    );

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: "Could not revoke this key."
      });
    }

    const result = await response.json();
    const data = Array.isArray(result) ? result[0] : result;

    return res.status(200).json({
      success: Boolean(data?.success ?? data?.revoked ?? result === true),
      message: data?.message || "Revoke request completed."
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to revoke the key. Please try again."
    });
  }
      }
