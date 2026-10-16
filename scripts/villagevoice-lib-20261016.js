// scripts/villagevoice-lib-20261016.js — villagevoice (2026-10-16) shared
// classifier: villager-speaker beats from Game.say capture → sense
// categories. INSTRUMENT ONLY — no game code touched, no policy touched.
//
// Categories (in classification order):
//   template-fingerprint  exact normalized duplicate of an earlier beat in
//                         the run (2nd+ occurrence; the filed #355/#368/
//                         #371/#373 class, tracked as a category here)
//   system-voice          System/Herald/alien-broadcast beats (not villagers)
//   dialogue-with-stakes  quoted villager speech with a roster name, or an
//                         NPC ask/favor beat with a named speaker
//   event-reaction        death/funeral/raid/contest/table/feast/grief/fear
//                         beats naming a villager or the village collective
//   goal-driven           named villager states a want/plan/promise/intent
//   routine-honest        named villager doing routine work (tends, mends,
//                         rounds, patrol, cooking, hauls...)
//   scholar-action        second-person scholar narration ("You ...")
//   other-narration       fallback — documented; attributed=true when a
//                         roster name or the village collective appears
//
// A beat is a "villager beat" when its category is one of the five sense
// categories, OR it names a roster villager / the village collective.
// Zero-attributed invariant: classify() NEVER returns null/undefined.
'use strict';

const SENSE_CATS = [
  'dialogue-with-stakes',
  'goal-driven',
  'event-reaction',
  'routine-honest',
  'template-fingerprint',
];

const RE_SYSTEM = /◈|(📺|🖥️?|🛰️?)\s*(SYSTEM|THE HERALD)\b|THE HERALD\b|The System (says|declares|notes|announces|informs|replies|whispers)\b|^System:\s/;
const RE_QUOTE = /[""«»''][^""«»'']{6,}[""«»'']/;
const RE_SAYTAG = /\b(says?|asks?|replies?|whispers?|shouts?|murmurs?|snaps?|breathes?|laughs?|cries?)\b\s*:?\s*[""«]/;
const RE_ASK = /\basks?\s+(you|the scholar)\b|\bwants?\s+you\s+to\b|\bneeds?\s+you\s+to\b|\b(asking|begging|please|spare us|help us|we need)\b/i;
const RE_EVENT = /\b(died|death|dead|funeral|eulog|mourn\w*|grief|grieving|raid|contests?|the table|feast|vigil|afraid|fear|fears?ful|slaughtered?|killed|massacre|burial|achy|sick|sickens?|ill\b|fever|coughing?|plague|disease|infected|delirious)\b/i;
const RE_GOAL = /\b(wants? to|needs? to|plans? to|intends? to|promised?|going to|will\b|must\b|hopes?|dreams? of|swore|vowed|aims? to|determined to|my plan|her plan|his plan)\b/i;
const RE_ROUTINE = /\b(tends?|mends?|rounds?|patrols?|keeping watch|on watch|cooking|cooks?|hauls?|gathering|gathered|forages?|repairs?|scouts?|fishing|fished|chores|sweeps?|sharpens?|mends the|weaving|weaves?|kneads?|stirs?|tills?|milks?|feeds? the|tends? the|checks? the (snares|traps|lines)|walk(s|ed)? (the )?(rounds|perimeter))\b/i;
const RE_SCHOLAR = /^\s*[Yy]ou\b|^\s*[Yy]our\b/;
const RE_COLLECTIVE = /\bthe village\b|\beveryone\b|\bthe haven\b|\bthe watch\b|\bthe council\b|\bthe moot\b/i;

function stripHtml(s) {
  return String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractText(msg) {
  try {
    const t = (msg && (msg.text || msg.msg || msg.message)) || msg;
    return stripHtml(typeof t === 'string' ? t : String(t)).slice(0, 500);
  } catch (e) { return ''; }
}

// nameRE(names): matches any roster first name as a whole word.
// names: array of strings. Longest-first to avoid prefix shadowing.
function nameRE(names) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = (names || [])
    .map((n) => String(n || '').trim())
    .filter((n) => n.length >= 2)
    .sort((a, b) => b.length - a.length)
    .map(esc);
  if (!parts.length) return null;
  return new RegExp('\\b(' + parts.join('|') + ')\\b');
}

// classify(text, ctx) -> { cat, villagerBeat, base }
// ctx: { names: string[], seen: Map<string, number> (normalized text -> count),
//        deathDay: {name: day} — villagers who died; a beat naming the
//        recently dead (death day < beat day <= death day + 14) is an
//        event-reaction even without grief words,
//        beatDay: number — the beat's day (for the grief window) }
function classify(text, ctx) {
  ctx = ctx || {};
  const names = ctx.names || [];
  const seen = ctx.seen || new Map();
  const deathDay = ctx.deathDay || {};
  const beatDay = ctx.beatDay || 0;
  const GRIEF_WINDOW = 14;
  const t = String(text || '');
  const norm = t.toLowerCase();
  const nm = nameRE(names);
  const hasName = nm ? nm.test(t) : false;
  const collective = RE_COLLECTIVE.test(t);
  const attributed = hasName || collective;
  const escN = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // namesDead: the beat names someone who died on an EARLIER day (strictly
  // after death — the funeral triptych fires on death day via RE_EVENT;
  // applying the window on death day itself sweeps same-day routine beats
  // into event-reaction, a false positive class caught 2026-10-16)
  const deadDayOf = (ctx.deathDay || {});
  const namesDead = hasName && names.some((n) => {
    const dd = deadDayOf[n];
    return n && dd != null && dd < (ctx.beatDay || 0) && new RegExp('\\b' + escN(n) + '\\b').test(t);
  });

  let core;
  if (RE_SYSTEM.test(t)) core = 'system-voice';
  else if ((RE_QUOTE.test(t) || RE_SAYTAG.test(t) || RE_ASK.test(t)) && attributed) core = 'dialogue-with-stakes';
  else if (RE_QUOTE.test(t) && RE_ASK.test(t)) core = 'dialogue-with-stakes'; // quoted stranger request (tribute-beggar, trader) — dialogue with stakes, foreign speaker
  else if (namesDead) core = 'event-reaction';
  else if (RE_EVENT.test(t) && attributed) core = 'event-reaction';
  else if (RE_GOAL.test(t) && hasName) core = 'goal-driven';
  else if (RE_ROUTINE.test(t) && hasName) core = 'routine-honest';
  else if (RE_SCHOLAR.test(t)) core = 'scholar-action';
  else core = 'other-narration';

  const prior = seen.get(norm) || 0;
  seen.set(norm, prior + 1);
  if (prior > 0) {
    return { cat: 'template-fingerprint', base: core, villagerBeat: attributed || SENSE_CATS.includes(core) };
  }
  return { cat: core, base: null, villagerBeat: SENSE_CATS.includes(core) || attributed };
}

// KNOWN-ANSWER fixtures for the unit test. Each: { t, names, want, why }.
const FIXTURES = [
  { t: '📺 SYSTEM: "FIELD EQUIPMENT ISSUED." A pamphlet flutters down.', names: [], want: 'system-voice', why: 'System beat' },
  { t: 'THE HERALD does not notice you the way prey notices a hunter.', names: ['Mira'], want: 'system-voice', why: 'Herald beat (filed #371 class)' },
  { t: '"I need to check the snares before dusk," Mira says.', names: ['Mira'], want: 'dialogue-with-stakes', why: 'quoted villager speech' },
  { t: 'Mira asks you to sit with her while she mends the nets.', names: ['Mira'], want: 'dialogue-with-stakes', why: 'NPC ask with name' },
  { t: 'The village mourns Okafor. The watch is doubled tonight.', names: ['Okafor'], want: 'event-reaction', why: 'collective grief with dead name' },
  { t: 'Joren keeps glancing at the empty chair where Amara sat.', names: ['Joren', 'Amara'], deathDay: { Amara: 3 }, beatDay: 5, want: 'event-reaction', why: 'grief without the word grief (death-context)' },
  { t: 'Mira wants to prove she can track the highbeam deer alone.', names: ['Mira'], want: 'goal-driven', why: 'named want' },
  { t: 'Okafor promised the moot he would mend the gate by first light.', names: ['Okafor'], want: 'goal-driven', why: 'promise beat' },
  { t: 'Joren tends the drying racks, quiet and steady as ever.', names: ['Joren'], want: 'routine-honest', why: 'routine narration' },
  { t: 'Amara hauls water from the creek, humming under her breath.', names: ['Amara'], want: 'routine-honest', why: 'chore beat' },
  { t: 'You stalk for hours and come home empty-handed — but you LEARN.', names: [], want: 'scholar-action', why: 'second-person narration' },
  { t: 'A mist settles over the treeline, thick as wool.', names: ['Mira'], want: 'other-narration', why: 'world narration, no villager' },
  { t: 'Something moves out there — a shape at the treeline.', names: ['Mira'], want: 'other-narration', why: 'ambient beat, villager false only' },
  { t: 'Mira watches the clouds gather.', names: ['Mira'], want: 'other-narration', limit: true, why: 'names a villager but no sense verb (honest limit — excluded from GO share)' },
  { t: '◈ ARC II — THE SHOW. The sky tore open a week ago.', names: [], want: 'system-voice', why: '◈ show beat is System voice' },
  { t: '🤒 Ines is achy and wrung out, barely eating. Rest and clean water.', names: ['Ines'], want: 'event-reaction', why: 'disease beat names a villager' },
  { t: '🥣 Ellis of Ashford stands at your fire. "Ashford is eating bark. We\'re asking — 1,218 kcal, whatever you can spare."', names: [], want: 'dialogue-with-stakes', why: 'quoted stranger request (foreign beggar)' },
  { t: '💧 Si returns with 19L of creek water. Risky until the hearth boils it.', names: ['Si'], deathDay: { Si: 38 }, beatDay: 38, want: 'other-narration', why: 'death-day boundary: routine beat on death day is NOT event-reaction' },
];

module.exports = {
  SENSE_CATS, extractText, classify, nameRE, stripHtml, FIXTURES,
};
