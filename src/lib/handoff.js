// Intake questions + setup-sheet generator, ported from the Graysen Handoff Hub
// HTML. Turns a kid's plain answers into Claude-ready config blocks — the
// "translate data between systems" engine.

export const QUESTION_GROUPS = [
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
];

export const ALL_QUESTIONS = QUESTION_GROUPS.flatMap((g) => g.items);

const clean = (v, fallback = 'Not answered yet') => {
  const s = String(v || '').trim();
  return s ? s : fallback;
};

export function buildBlocks(p) {
  const name = clean(p.studentName, 'Graysen');
  return [
    {
      key: 'prefs',
      title: 'Claude Profile / Preferences',
      where: 'Settings → Profile / Personal preferences',
      body: `You are helping ${name} learn game building, coding, Roblox/Lua, and practical AI-assisted development under Dad's supervision. Keep answers clear, short, and action-first. Prefer small working builds over theory dumps. When coding, explain the goal, give the working code, then a tiny test checklist.

${name}'s interests:
- Favorite games: ${clean(p.favoriteGames)}
- Roblox focus: ${clean(p.robloxGenres)}
- Dream game: ${clean(p.dreamGame)}
- Preferred help style: ${clean(p.helpStyle)}

Response rules:
- Start with what to do next.
- Beginner-friendly language without talking down.
- Keep code examples small and labeled.
- Ask fewer questions; make smart assumptions and give a first version.`,
    },
    {
      key: 'project',
      title: 'Claude Project Instructions',
      where: 'Projects → Graysen Build Lab → Instructions',
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
  ];
}

export function generateSheet(p) {
  const name = clean(p.studentName, 'Graysen');
  const blocks = buildBlocks(p);
  const answers = ALL_QUESTIONS.map(([id, label]) => `${label} ${clean(p[id])}`).join('\n');

  return `FREQUENCY DOJO — HANDOFF SETUP SHEET
Generated: ${new Date().toLocaleString()}
Recipient: ${name}

============================================================
1. CLAUDE PROFILE / PREFERENCES
   (Settings → Profile / Personal preferences)
============================================================
${blocks[0].body}

============================================================
2. CLAUDE PROJECT INSTRUCTIONS
   (create a project: ${name} Build Lab)
============================================================
${blocks[1].body}

============================================================
3. CLAUDE CODE — CLAUDE.md STARTER
============================================================
${blocks[2].body}

============================================================
4. ${name.toUpperCase()}'S FULL ANSWERS
============================================================
${answers}
`;
}
