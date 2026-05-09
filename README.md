# Dojoroc

Gamified interactive class skin.

## Systems Architecture Summary

- **No External Friction:** Uses Supabase for persistence, so data stays alive across devices.
- **Quency Chatbot:** Powered by **Gemini 2.5 Flash** as a technical co-pilot for curriculum terminal commands (Git/Node/Hermes).
- **The "Unhermit" Onboarding:** Task list focused on core Hermes setup hurdles:
  - **Forge the Tools:** Direct links to Git and Node.
  - **The Summoning:** Exact `curl` command to pull Hermes core.
  - **The Neural Link:** API key setup.
- **Co-op State:** Switch between **Derrick** and **Graysen** tracks; shared sessions show shared logs and processing power.

## Actionable Next Step

Deploy to **Vercel** or **Netlify**. Once you have your Supabase project values, set:

- `SUPABASE_URL`
- `SUPABASE_KEY`

in your deployment environment variables (Vercel/Netlify dashboard) or local `.env` file, then read them at the top of your app's config/bootstrap code to enable real-time syncing.

Ready to have Graysen start clicking to generate that first bit of processing power?
