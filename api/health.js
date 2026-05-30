// Diagnostic endpoint — reports whether environment variables are reaching the
// serverless runtime, WITHOUT exposing any secret values. Safe to keep or remove.
export default function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY || '';
  res.status(200).json({
    ok: true,
    anthropicKeyPresent: !!key,
    anthropicKeyLength: key.length,
    anthropicKeyPrefix: key ? key.slice(0, 7) : null, // "sk-ant-" is not secret
    supabaseUrlPresent: !!process.env.VITE_SUPABASE_URL,
    node: process.version,
    time: new Date().toISOString(),
  });
}
