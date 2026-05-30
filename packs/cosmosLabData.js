// Second built-in GYM — same data shape as the starter. A science/space gym so
// there's a distinct subject to take your Rocs into. Shows up in the Hub
// automatically once registered in packs/index.js.

const SHARED_RULES =
  '\n\nRules: Respond directly and concisely — no exploratory reasoning, no meta-commentary. ' +
  'You are talking with a parent and their kid, so keep it friendly, safe, and encouraging. ' +
  'Prefer short, vivid, action-first answers. Use everyday analogies before any jargon.';

const cosmosLabData = {
  id: 'cosmos-lab',
  name: 'Cosmos Lab',
  subject: 'Space, science & how the universe works',
  builtin: true,

  brand: { title: 'COSMOS LAB', icon: 'Sparkles', accent: 'blue', coreLabel: 'STAR CORE', coreUnit: 'LUM' },

  players: [
    { key: 'derrick', label: 'Derrick', chatName: 'Dad', color: 'blue', role: 'mentor' },
    { key: 'graysen', label: 'Graysen', chatName: 'Graysen', color: 'cyan', role: 'student' },
  ],

  sensei: {
    name: 'Nova',
    title: 'AI SENSEI',
    greeting: "Star Core ignited. I'm Nova — let's explore the universe one question at a time. What do you want to discover?",
    placeholder: 'Ask Nova about space & science...',
  },

  lore: {
    tagline: 'Look up. Figure it out. Light the core.',
    canon:
      'Cosmos Lab is an observatory where a father and son chart the universe together. ' +
      'Every mission you clear and every round you play feeds the Star Core with light (LUM). ' +
      'Nova is the AI sensei wired into the Core, guiding the climb to the stars.',
    boot: 'Star Core online · telescope aligned · deep-space uplink locked',
    emptyActivity: 'The Star Core is dim. Clear a mission or play a round to feed it light.',
    levelUpTemplate: '🌟 {name} reached Luminosity Level {lvl} — the Star Core blazes brighter.',
    arcadeXpTemplate: '🛰️ {name} pulled {xp} LUM out of the arcade.',
  },

  missions: [
    { id: 'name_planets', title: 'Chart the System', desc: 'Learn the 8 planets in order', xp: 100 },
    { id: 'moon_phases', title: 'Read the Moon', desc: 'Learn why the Moon changes shape', xp: 100 },
    { id: 'star_life', title: 'Birth of a Star', desc: 'Learn how stars form and die', xp: 200 },
    { id: 'gravity', title: 'The Invisible Force', desc: 'Understand what gravity does', xp: 150 },
  ],

  modes: [
    {
      key: 'explorer',
      label: 'Space Explorer',
      note: 'Planets, stars & galaxies',
      system:
        'You are Nova, the AI sensei of Cosmos Lab. You help Derrick and his son Graysen explore space — ' +
        'planets, stars, moons, galaxies, black holes. Make it wondrous and concrete: use vivid everyday ' +
        'comparisons (a star is a giant ball of burning gas bigger than a million Earths). One idea at a time, ' +
        'and celebrate curiosity.' + SHARED_RULES,
    },
    {
      key: 'experiment',
      label: 'Lab Scientist',
      note: 'Hands-on science at home',
      system:
        'You are Nova in Lab Scientist mode. You turn science into safe, simple hands-on experiments a kid can ' +
        'do at home with a parent (kitchen volcano, density jars, static electricity). Give a materials list, ' +
        'numbered steps, the "what to watch for", and the one-sentence why behind it.' + SHARED_RULES,
    },
    {
      key: 'why',
      label: 'Big Why',
      note: 'Answer "why?" about anything',
      system:
        'You are Nova in Big Why mode for a curious kid. Answer "why" questions about the universe and nature ' +
        'clearly and truthfully, starting from what they already know and building up one step. Admit the edge ' +
        'of what scientists know when relevant — wonder is the point.' + SHARED_RULES,
    },
  ],

  chat: { defaultRoom: 'graysen-dad-cosmos-lab' },

  arcade: {
    tips: [
      'The Sun is a star — it only looks bigger because it is much closer.',
      'Light from the Sun takes about 8 minutes to reach Earth.',
      'A year on Mercury is just 88 Earth days.',
      'The Moon does not make light — it reflects the Sun.',
      'Gravity is what keeps planets circling the Sun.',
      'There are more stars in the universe than grains of sand on Earth.',
      'Saturn would float in water — it is that light for its size.',
      'Space is silent: sound needs air, and space has almost none.',
    ],
    quiz: [
      { q: 'Which planet is closest to the Sun?', answers: ['Mercury', 'Earth', 'Jupiter'], correct: 0 },
      { q: 'Why does the Moon shine?', answers: ['It reflects the Sun', 'It is on fire', 'It makes its own light'], correct: 0 },
      { q: 'The Sun is actually a…', answers: ['Star', 'Planet', 'Moon'], correct: 0 },
      { q: 'What keeps planets orbiting the Sun?', answers: ['Gravity', 'Wind', 'Magnets'], correct: 0 },
      { q: 'Why is space silent?', answers: ['Sound needs air', 'Stars absorb sound', 'It is too cold'], correct: 0 },
      { q: 'Light from the Sun reaches Earth in about…', answers: ['8 minutes', '8 seconds', '8 hours'], correct: 0 },
    ],
    byMission: {
      name_planets: {
        tips: ['Order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', 'Jupiter is the biggest planet — over 1,000 Earths would fit inside.'],
        quiz: [
          { q: 'Which planet is the biggest?', answers: ['Jupiter', 'Earth', 'Mars'], correct: 0 },
          { q: 'Which planet do we live on?', answers: ['Earth', 'Venus', 'Saturn'], correct: 0 },
        ],
      },
      moon_phases: {
        tips: ['Moon phases come from the angle we see its sunlit side.', 'A full cycle of phases takes about 29.5 days.'],
        quiz: [
          { q: 'Moon phases are caused by…', answers: ['The angle of sunlight we see', 'The Moon cooling down', 'Clouds'], correct: 0 },
        ],
      },
    },
  },

  handoff: {
    studentDefault: 'Graysen',
    projectName: 'Graysen Cosmos Lab',
    sheetTitle: 'COSMOS LAB — HANDOFF SETUP SHEET',
    aiPolishTemplate:
      'Translate these raw kid answers into ONE clean, warm "Personal preferences" block (150-220 words) ' +
      'telling Claude how to help {name} learn about space and science: vivid analogies, one idea at a time, ' +
      'truthful, curiosity-first. Output only the block text.',
    questionGroups: [
      {
        title: 'What you wonder about',
        items: [
          ['favoriteSpace', 'What in space amazes you most?', 'Planets, black holes, aliens, rockets, stars?'],
          ['bigQuestion', 'What is one "why" question you really want answered?', 'Say it however it comes out.'],
          ['scienceLove', 'Which science is most fun: space, animals, body, chemistry, machines?', ''],
        ],
      },
      {
        title: 'How you like to learn',
        items: [
          ['learnStyle', 'Do you like stories, experiments, or quick facts?', 'Pick what makes it stick for you.'],
          ['handsOn', 'Want safe experiments to do at home?', 'Yes / sometimes / just explain it.'],
          ['detail', 'Short answers or deep dives?', ''],
        ],
      },
    ],
    blocks: [
      {
        key: 'prefs',
        title: 'Claude Profile / Preferences',
        where: 'Settings → Personal preferences',
        bodyTemplate: `You are helping {name} explore space and science with Dad. Use vivid everyday analogies before any jargon, one idea at a time, and stay truthful (it's fine to say "scientists aren't sure"). Keep wonder front and center.

{name}'s interests:
- Most amazed by: {favoriteSpace}
- Big question: {bigQuestion}
- Learns best via: {learnStyle}

Response rules:
- Start with the coolest true fact, then build.
- Offer a tiny safe experiment when it fits.
- Beginner-friendly, never condescending.`,
      },
    ],
  },
};

export default cosmosLabData;
