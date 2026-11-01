export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  }

  const adminSecret = process.env.ALONE_ADMIN_SECRET;

  if (!adminSecret) {
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
      message: "Invalid admin password."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Admin access granted."
  });
}
