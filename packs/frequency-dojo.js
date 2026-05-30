// ---------------------------------------------------------------------------
// PACK: Frequency Dojo (dev tools + Roblox/Lua game building)
//
// A "pack" is one complete, swappable learnable system. Everything the dojo
// teaches — branding, the players, the missions, Quency's teaching modes + the
// AI prompts behind them, and the handoff questionnaire — lives in here.
//
// To make a NEW teachable system (e.g. a game you're building together), copy
// this file to packs/<your-pack>.js, change the content, and register it in
// packs/index.js. No component code needs to change.
// ---------------------------------------------------------------------------

import { makeHandoff } from '../src/lib/handoff.js';

// Rules appended to every Quency mode so the "brain" always behaves the same
// way no matter which subject is loaded.
const SHARED_RULES =
  '\n\nRules: Respond directly and concisely — no exploratory reasoning, no meta-commentary about your process. ' +
  'You are talking with a dad (Derrick) and his son (Graysen), so keep it friendly, safe, and encouraging. ' +
  'Prefer short, action-first answers. When giving commands or code, show them one small step at a time.';

const studentDefault = 'Graysen';

const handoff = makeHandoff({
  studentDefault,
  projectName: `${studentDefault} Build Lab`,
  sheetTitle: 'FREQUENCY DOJO — HANDOFF SETUP SHEET',
  // The Data-Translator prompt used by the "AI Polish" button.
  aiPolishPrompt: (p, name) =>
    `Translate these raw kid answers into ONE clean, warm "Personal preferences" block (150-220 words) ` +
    `telling Claude how to help ${name}, who builds Roblox games and is learning to code: short action-first ` +
    `answers, small working builds, beginner-friendly but not condescending. Output only the block text.\n\n` +
    Object.entries(p)
      .filter(([k]) => k !== 'studentName')
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n'),
  questionGroups: [
    {
      title: 'What you like to play',
      items: [
        ['favoriteGames', 'Top 3 favorite games right now?', 'What do you love about each one?'],
        ['robloxGenres', 'What Roblox games do you build or play most?', 'Obbies, tycoons, simulators, fighting, roleplay, horror, racing?'],
        ['makeOrPlay', 'Do you like making games more, or playing them more?', 'Pick the one that pulls you harder.'],
      ],
    },
    {
      title: 'What you want to make',
      items: [
        ['dreamGame', 'If you could build any game, what would it be?', 'Explain it like you are pitching it to a friend.'],
        ['dimensionMode', '2D or 3D? Single-player or multiplayer?', 'Add platform too: Roblox, web, PC, mobile.'],
        ['mainAction', 'What does the player do most?', 'Run, fight, build, solve, race, explore, collect, survive?'],
        ['gameFeel', 'What should it feel like?', 'Scary, funny, chill, intense, epic, competitive?'],
      ],
    },
    {
      title: 'Skill level',
      items: [
        ['luaComfort', 'How comfortable are you with Roblox Lua?', 'Beginner, copy/edit code, or write your own?'],
        ['stuckPoint', 'What did you try to build but get stuck on?', 'This tells Claude what to teach first.'],
      ],
    },
    {
      title: 'How you like help',
      items: [
        ['helpStyle', 'Detailed steps or quick answers?', 'Explain everything, show then explain, or just the working fix.'],
        ['weeklyTime', 'How much time can you build each week?', '30 minutes, 2 hours, weekends, daily?'],
        ['badClaudeAnswer', 'What kind of answer annoys you most?', 'Too long, too basic, wrong code, too many questions?'],
        ['firstBuild', 'First tiny thing we should build this week?', 'Start small enough to win fast.'],
      ],
    },
  ],
  blocks: (p, name) => [
    {
      key: 'prefs',
      title: 'Claude Profile / Preferences',
      where: 'Settings → Profile / Personal preferences',
      body: `You are helping ${name} learn game building, coding, Roblox/Lua, and practical AI-assisted development under Dad's supervision. Keep answers clear, short, and action-first. Prefer small working builds over theory dumps. When coding, explain the goal, give the working code, then a tiny test checklist.

${name}'s interests:
- Favorite games: ${p.favoriteGames}
- Roblox focus: ${p.robloxGenres}
- Dream game: ${p.dreamGame}
- Preferred help style: ${p.helpStyle}

Response rules:
- Start with what to do next.
- Beginner-friendly language without talking down.
- Keep code examples small and labeled.
- Ask fewer questions; make smart assumptions and give a first version.`,
    },
    {
      key: 'project',
      title: 'Claude Project Instructions',
      where: `Projects → ${name} Build Lab → Instructions`,
      body: `Project purpose: Help ${name} build playable games, learn Roblox/Lua, understand code, and finish small projects.

Default behavior:
1. Convert big ideas into the smallest playable prototype.
2. Give ${name} one task at a time.
3. Use examples based on his current tools first.
4. End with a concrete next step.`,
    },
    {
      key: 'claudemd',
      title: 'Claude Code — CLAUDE.md',
      where: 'Repo root → CLAUDE.md',
      body: `# ${name} Build Lab

You are helping ${name} build games and learn coding under Dad's supervision.

Working rules:
- Keep explanations short, clear, and practical.
- Teach by building small working pieces first.
- When code breaks, explain the bug in plain language, then fix it.
- Prefer Roblox/Lua examples; bridge to HTML, JS, Python when useful.
- Before editing files, state the target outcome and which files you'll touch.
- After edits, give a tiny test checklist.`,
    },
  ],
});

const pack = {
  id: 'frequency-dojo',

  // --- Branding / theme -----------------------------------------------------
  brand: {
    title: 'FREQUENCY DOJO',
    icon: 'Zap', // lucide-react icon name
    accent: 'emerald', // primary color family (mentor / Quency)
    coreLabel: 'DOJO CORE',
    coreUnit: 'HZ',
  },

  // --- People ---------------------------------------------------------------
  // First player is the mentor, second is the student. Add more if needed.
  players: [
    { key: 'derrick', label: 'Derrick', chatName: 'Dad', color: 'emerald', role: 'mentor' },
    { key: 'graysen', label: 'Graysen', chatName: 'Graysen', color: 'purple', role: 'student' },
  ],

  // --- The AI sensei --------------------------------------------------------
  sensei: {
    name: 'Quency',
    title: 'AI SENSEI',
    greeting: "Hello Sensei. I'm Quency. Pick a model and a mode, then ask me anything.",
    placeholder: 'Ask Quency anything...',
  },

  // --- Missions (the gamified task tracks) ----------------------------------
  missions: [
    { id: 'git_install', title: 'Forge the Tools', desc: 'Download Git', link: 'https://git-scm.com/downloads', xp: 100 },
    { id: 'node_install', title: 'Ignite the Engine', desc: 'Install Node.js', link: 'https://nodejs.org/', xp: 100 },
    { id: 'hermes_clone', title: 'The Summoning', desc: 'Run the install script', cmd: 'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash', xp: 250 },
    { id: 'api_key', title: 'The Neural Link', desc: 'Add your API key to .env', xp: 150 },
  ],

  // --- Quency's models (UI label + the real Claude model id) ----------------
  modelOptions: [
    { key: 'opus', label: 'Opus 4.8', note: 'Smartest', id: 'claude-opus-4-8' },
    { key: 'sonnet', label: 'Sonnet 4.6', note: 'Balanced', id: 'claude-sonnet-4-6' },
    { key: 'haiku', label: 'Haiku 4.5', note: 'Fastest', id: 'claude-haiku-4-5' },
  ],

  // --- Quency's teaching modes (UI + the system prompt behind each) ---------
  modes: [
    {
      key: 'hermes',
      label: 'Hermes Sensei',
      note: 'Tool & Claude Code setup',
      system:
        'You are Quency, the AI sensei of the Frequency Dojo. You help Derrick and his son Graysen ' +
        'install and learn developer tools — Git, Node.js, Claude Code, and the Hermes Agent. ' +
        'Walk them through setup one command at a time, explain what each step does in plain language, ' +
        'and celebrate small wins. If something errors, diagnose the simplest cause first.' +
        SHARED_RULES,
    },
    {
      key: 'translator',
      label: 'Data Translator',
      note: 'Convert data between systems',
      system:
        'You are Quency in Data Translator mode. You help move and reshape data between systems: ' +
        "taking input from one tool and converting it into the exact format another system needs — " +
        'for example turning a kid\'s project answers into Claude preferences, a CLAUDE.md file, JSON, ' +
        'a SQL migration, or a config block. When given source data and a target format, output clean, ' +
        'ready-to-paste results and briefly say where each piece goes.' +
        SHARED_RULES,
    },
    {
      key: 'coach',
      label: 'Game Coach',
      note: 'Roblox / Lua game building',
      system:
        'You are Quency, a game-building coach for Graysen, who builds Roblox/Lua games and is learning to code. ' +
        'Keep it fun and motivating. Shrink big game ideas into the smallest playable first build, ' +
        'give Lua examples when helpful, and always end with one concrete next step.' +
        SHARED_RULES,
    },
  ],

  // --- Shared working chat ---------------------------------------------------
  chat: {
    defaultRoom: 'graysen-dad-build-lab',
  },

  // --- Arcade (dead-time learning mini-games) -------------------------------
  // tips = flashcards shown in the clicker + on Tetris line clears.
  // quiz = questions for the shooter (one correct answer per question).
  arcade: {
    tips: [
      'Git saves snapshots of your code called commits — you can always go back.',
      'Node.js lets you run JavaScript outside the browser.',
      'In Roblox, a Script runs on the server; a LocalScript runs on the player.',
      'Lua arrays start at 1, not 0 — watch out!',
      'print() in Lua is your best friend for finding bugs.',
      'Shrink a big game idea down to the smallest playable thing first.',
      'CLAUDE.md tells Claude Code how to work in your project.',
      'A function is a reusable box of steps you can call by name.',
    ],
    quiz: [
      { q: 'What is a Git "commit"?', answers: ['A saved snapshot of code', 'A type of enemy', 'A Roblox part'], correct: 0 },
      { q: 'In Roblox, which runs on the player\'s device?', answers: ['LocalScript', 'ServerScript', 'CommitScript'], correct: 0 },
      { q: 'Lua arrays start counting at…', answers: ['1', '0', '-1'], correct: 0 },
      { q: 'What does print() help you do in Lua?', answers: ['Find bugs', 'Delete files', 'Win the game'], correct: 0 },
      { q: 'Best first step for a huge game idea?', answers: ['Build the tiny playable version', 'Build everything at once', 'Quit'], correct: 0 },
      { q: 'What runs JavaScript outside the browser?', answers: ['Node.js', 'Roblox', 'Git'], correct: 0 },
    ],
  },

  // --- Handoff Kit (built above from makeHandoff) ---------------------------
  handoff,
};

export default pack;
