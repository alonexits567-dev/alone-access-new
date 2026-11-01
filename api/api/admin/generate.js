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

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/generate_access_key`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: "Could not generate an access key."
      });
    }

    const generatedKey =
      typeof result === "string"
        ? result
        : result?.key_code || result?.key || result?.[0]?.key_code;

    if (!generatedKey) {
      return res.status(500).json({
        success: false,
        message: "The server did not return a key."
      });
    }

    return res.status(200).json({
      success: true,
      key: generatedKey,
      message: "Access key generated successfully."
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to generate a key. Please try again."
    });
  }
          }
