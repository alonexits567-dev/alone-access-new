export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      success: false,
      message: "Server configuration is incomplete."
    });
  }

  const key = req.body?.key;

  if (typeof key !== "string" || !key.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter an access key."
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/activate_access_key`,
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

    const result = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: result.message || "Key verification failed."
      });
    }

    const data = Array.isArray(result) ? result[0] : result;

    return res.status(200).json({
      success: Boolean(data?.success ?? data?.valid ?? data?.activated),
      message: data?.message || "Verification completed."
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to verify the key. Please try again."
    });
  }
      }
