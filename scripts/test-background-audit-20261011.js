// Background generator audit (Worker B, 2026-10-11).
// Generates N villagers (seeded, reproducible) across >=4 origins via
// Game.genRoster, then runs automated checks over EVERY background/
// personality/voice field:
//   E1 unresolved {slot} placeholders in any final text
//   E2 duplicate sentences shared across villagers (unique-person law)
//   E3 grammar heuristics (articles, doubled words, spacing, caps)
//   E4 contradiction heuristics (pronoun vs text, occupation vs backstory,
//      maritime landlocked, System-era, kin references)
//   E5 voice/personality mismatches (temperament with no voice profile,
//      synthPrototype fallbacks, gendered-pronoun Know text)
// Usage: node scripts/test-background-audit-20261011.js [SEED] [N]
//   SEED env or argv[2] overrides the default seed. N defaults to 30.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ---- seeded RNG installed BEFORE eval (modules capture Math.random at load)
let _s = parseInt(process.env.SEED || process.argv[2] || '20261011', 10) || 20261011;
function mulberry() {
  _s |= 0; _s = _s + 0x6D2B79F5 | 0;
  let t = Math.imul(_s ^ _s >>> 15, 1 | _s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
mulberry.reset = (s) => { _s = s; };
Math.random = mulberry;

global.window = global; // stub for the eval phase only (equipment.js needs window at load)
const FILES = ['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js', 'src/js/convo-mood.js',
  'src/js/convo-wants.js', 'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js', 'src/js/party.js', 'src/js/party-formal.js',
  'src/js/truth.js', 'src/js/contests.js', 'src/js/broadcast.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js', 'src/js/betrayal.js', 'src/js/corpses.js',
  'src/js/corruption.js', 'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/ledger.js',
  'src/js/villager-agency.js', 'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/hierarchy.js', 'src/js/comms.js', 'src/js/safetynets.js',
  'src/js/debug-scenarios.js', 'src/js/build.js'];
for (const f of FILES) {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL', f, e.message); process.exit(1); }
}
delete global.window; // runtime checks take the sync path from here on
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const Game = globalThis.Scattering.Game;

const N = parseInt(process.argv[3], 10) || 30;
const ORIGINS = ['Columbus, Ohio', 'Bath, Maine', 'Lagos, Nigeria', 'Phoenix, Arizona', 'Seattle, Washington',
  'New Orleans, Louisiana', 'Duluth, Minnesota', 'Miami, Florida'];
const MARITIME_IDS = ['sailor', 'fisher', 'fisherman', 'deckhand', 'longshoreman', 'marine_biologist', 'naval_officer'];

const errors = [];
const err = (cls, who, msg) => errors.push({ cls, who, msg });
const cg = () => Game.data.characterGen || {};

// split into sentences, keep punctuation
const sentences = (t) => String(t || '').split(/(?<=[.!?…])\s+/).map(s => s.trim()).filter(s => s.length > 12);

function collectVillagerTexts(v) {
  const T = {};
  T.backstory = v.backstory || '';
  T.systemAssessment = v.systemAssessment || '';
  T.talk = (v.talk || []).join(' ¶ ');
  T.quest = (v.quest || []).join(' ¶ ');
  const p = v.personality || {};
  T.quirk = p.quirk || ''; T.habit = p.habit || ''; T.hope = p.hope || ''; T.secretFear = v.secretFear || '';
  T.goal = v.goal || '';
  const ls = v.lifeseed || {};
  T.ls_event = ls.event || ''; T.ls_wound = ls.wound || ''; T.ls_want = ls.want || '';
  T.ls_hometown = ls.hometown || ''; T.ls_regionLand = ls.regionLand || '';
  T.ls_people = (ls.people || []).map(x => `${x.relation}:${x.name}:${x.fate}`).join(' ¶ ');
  T.ls_places = (ls.places || []).map(x => `${x.kind}:${x.name}`).join(' ¶ ');
  T.ls_skillOrigins = Object.entries(ls.skillOrigins || {}).map(([k, x]) => `${k}:${x}`).join(' ¶ ');
  // resolved keepsake memories for their items
  const sent = (v.items || []).map(id => (Game.data.items || []).find(i => i.id === id)).filter(d => d && d.class === 'sentimental');
  T.keepsakes = sent.map(d => { try { return Game.resolveKeepsakeText(v, d, d.memory || ''); } catch (e) { return ''; } }).join(' ¶ ');
  // synthPrototype outputs
  try {
    const proto = Game.synthPrototype(v);
    T.proto = [proto.want, proto.know, proto.feel, proto.secret].join(' ¶ ');
  } catch (e) { T.proto = ''; }
  // voice profile lookup result — every temperament must have its own
  // voice profile and assessment pool (falling back to steady = mismatch)
  const V = cg().voice || {};
  const ALL_TEMPS = ['steady','bold','cautious','warm','prickly','restless','dry','gentle','intense','withdrawn','anxious','sardonic','earnest','fidgety','stoic','mischievous'];
  T.tempHasVoice = !!((V.profiles || {})[String(p.temperament || '').toLowerCase()]);
  T.tempHasAssess = ALL_TEMPS.includes(String(p.temperament || '').toLowerCase()) &&
    (function () {
      // the assessment pools live in code (game.js), not data — probe via a
      // generated assessment: monkey-check not possible here, so verify the
      // temperament is one of the 16 the code now covers (else branch falls
      // back to steady). This is a data/code parity check.
      return true;
    })();
  // direct code check: game.js _assessPool must define this temperament
  // (entries are template literals — backtick distinguishes them from the
  // tempSec string arrays, which don't count as assessment coverage)
  try {
    const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'src/js/game.js'), 'utf8');
    const t = String(p.temperament || '').toLowerCase();
    T.tempHasAssess = new RegExp(`^\\s*${t}:\\s*\\[\``, 'm').test(src);
  } catch (e) { /* keep data-side value */ }
  return T;
}

function checkGrammar(who, label, text) {
  const t = String(text || '');
  if (!t) return;
  const slotRe = /\{[a-zA-Z][a-zA-Z_]*\}/;
  if (slotRe.test(t)) err('E1-slot', who, `${label}: unresolved slot in "${t.slice(0, 90)}"`);
  if (/  /.test(t)) err('E3-space', who, `${label}: double space in "${t.slice(0, 80)}"`);
  // space before punctuation — but not before an ellipsis ("...Do they?")
  const tNoEll = t.replace(/\s*\.\.\./g, '…');
  if (/\s[.,;:!?]/.test(tNoEll) && !/\d,\d/.test(tNoEll)) err('E3-punct', who, `${label}: space before punctuation in "${t.slice(0, 80)}"`);
  if (/\b(a)\s+[aeiouAEIOU]\w/.test(t)) err('E3-article', who, `${label}: "a" before vowel in "${t.slice(0, 80)}"`);
  // "an" before consonant — exempt silent-h words (an hour, an honest...) and
  // letter-names pronounced with a vowel onset (an HVAC tech)
  const anBad = [...t.matchAll(/\b(an)\s+([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]\w*)/g)]
    .filter(m => !/^(hour|hours|honest|honor|honors|heir|heirs|hvac)\b/i.test(m[2]));
  if (anBad.length) err('E3-article', who, `${label}: "an" before consonant in "${t.slice(0, 80)}"`);
  const dup = t.toLowerCase().match(/\b(the|a|an|and|to|of|in|she|he|they|it|was|is|their|his|her)\s+\1\b/);
  if (dup) err('E3-dupword', who, `${label}: doubled word "${dup[0]}" in "${t.slice(0, 80)}"`);
  // learn/learn echo: "learned {skill} learning ..." — the skill-how frame
  // colliding with a "learning"-initial how (generator recasts these; flag
  // survivors from future data additions)
  const echo = t.match(/\blearned\s+[^.]{1,40}?\slearning\s/i);
  if (echo) err('E3-dupword', who, `${label}: learn/learn echo "${echo[0].slice(0, 60)}"`);
  // lowercase letter starting a sentence after ". " — exempt ellipsis lead-ins
  for (const m of tNoEll.matchAll(/\.\s+([a-z])/g)) {
    if (!/i\.e|e\.g|vs\./.test(tNoEll.slice(Math.max(0, m.index - 6), m.index + 4))) {
      const ctx = tNoEll.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\n/g, ' ');
      err('E3-caps', who, `${label}: lowercase sentence start — "...${ctx}..."`);
    }
  }
  const opens = (t.match(/"/g) || []).length;
  if (opens % 2) err('E3-quotes', who, `${label}: unbalanced quotes in "${t.slice(0, 80)}"`);
}

// Occupation-distinctive words, computed from the data itself: a word counts
// as distinctive for an occupation if it appears in that occupation's
// backstory pool and in at most 4 occupations' pools total. A backstory that
// shares no distinctive word with its occupation's pool never mentions the
// trade (the locksmith test).
let _distWords = null;
function distinctiveWords() {
  if (_distWords) return _distWords;
  const stop = new Set('first they their them with from that this have what when were there about into than then been every never under while after before being does doing made make just like know knew years year old over back down could would should more most only also between through still always away around because well much many such each other some then than'.split(' '));
  const occs = (cg().occupations || []);
  const wordsOf = (t) => (String(t).toLowerCase().match(/[a-z]{4,}/g) || []).filter(w => !stop.has(w) && !w.includes('{'));
  const poolWords = occs.map(o => {
    const s = new Set();
    for (const b of (o.backstories || [])) for (const w of wordsOf(b)) s.add(w);
    return s;
  });
  const df = {};
  for (const s of poolWords) for (const w of s) df[w] = (df[w] || 0) + 1;
  _distWords = {};
  occs.forEach((o, i) => {
    _distWords[o.id || o.name] = new Set([...poolWords[i]].filter(w => df[w] <= 4));
  });
  return _distWords;
}

function checkContradictions(v, T) {
  const who = `${v.name} (${v.formerOccupation})`;
  const pro = v.pro || 'they';
  const low = (T.backstory + ' ' + T.ls_wound + ' ' + T.ls_event).toLowerCase();
  // C1: reflexive "themself" used for a he/she villager
  if ((pro === 'he' || pro === 'she') && /themself/.test(low))
    err('E4-pronoun', who, `themself used for pro=${pro}`);
  // C2: third-person masculine/feminine pronoun contradicting pro
  if (pro === 'she' && /\b(he|him|his)\b/.test(low) && !/\bhe\b.*\b(she|her)\b/.test(low)) {
    // heuristic: kin sentences may name other people; only flag backstory-first-sentence patterns
  }
  // C3: maritime occupation from landlocked origin without the drift line
  const tags = (v.originTags || []).map(String);
  if (MARITIME_IDS.includes(v.occupationId) && !tags.includes('coast') &&
      !/left .* young to work the water/.test(T.backstory))
    err('E4-maritime', who, `maritime occ from landlocked origin, no drift line`);
  // C4: the trade never mentioned — the backstory shares no distinctive word
  // with its occupation's own backstory pool (data-derived, no hand map).
  const dw = (distinctiveWords()[v.occupationId] || new Set());
  const bwords = new Set((T.backstory.toLowerCase().match(/[a-z]{4,}/g) || []));
  const hit = [...dw].some(w => bwords.has(w));
  if (!hit && dw.size) err('E4-occ', who, `backstory never mentions the trade "${v.formerOccupation}"`);
  // C5: hope names a sister/brother the lifeseed never had
  const hope = String(T.hope).toLowerCase();
  const rels = (v.lifeseed && v.lifeseed.people || []).map(p => String(p.relation || '').toLowerCase());
  if (/sister/.test(hope) && !rels.some(r => r.includes('sister'))) err('E4-kin', who, `hope "to find their sister" but seed has no sister`);
  if (/brother/.test(hope) && !rels.some(r => r.includes('brother'))) err('E4-kin', who, `hope names a brother but seed has none`);
  // C6: duplicate place names within a roster — two villagers' childhood
  // places with the identical name reads as one template (the old "5th"
  // street bug generalized: {street} now varies, but any shared place
  // name across villagers is the same duplication class).
  // (checked in the main loop, which has roster scope)

  // C7: kin name gender must match gendered relations ("Larry the niece").
  // Uses the game's own guessNameGender (curated map; null = unguessable,
  // exempt — only flag definite mismatches).
  try {
    const people = ((v.lifeseed || {}).people) || [];
    const femR = ['mother', 'sister', 'daughter', 'grandmother', 'aunt', 'niece', 'older sister', 'younger sister'];
    const mascR = ['father', 'brother', 'son', 'grandfather', 'uncle', 'nephew', 'older brother', 'younger brother'];
    for (const p of people) {
      const rel = String(p.relation || '');
      const want = femR.includes(rel) ? 'f' : mascR.includes(rel) ? 'm' : null;
      if (!want || !Game.guessNameGender) continue;
      const gg = Game.guessNameGender(String(p.name || '').split(' ')[0], null);
      if (gg && gg !== want)
        err('E4-kinname', who, `kin "${p.name}" (${rel}) reads ${gg === 'f' ? 'female' : 'male'}`);
    }
  } catch (e) { /* game lacks guessNameGender — skip */ }
  // C7: synthPrototype Know text uses a gendered pronoun contradicting vp.pro
  if (/she can|he can|she knows|he hears/.test(T.proto)) {
    const m = T.proto.match(/(she can|he can|she knows|he hears)/);
    const need = pro === 'she' ? 'she' : pro === 'he' ? 'he' : null;
    if (need && m && !m[1].startsWith(need)) err('E4-pronoun', who, `synthPrototype Know says "${m[1]}" but villager is ${pro}`);
  }
  // C8: want-line leftover — the exact sentence Steve called out as repetitive
  if (/What .* wants now is simple:/.test(T.backstory)) err('E2-repet', who, `contains the "What X wants now is simple" template Steve flagged`);
  // C9: lifeseed text references a region town not from their region.
  // Exempt: kin first names that collide with town names (Jasper the niece
  // vs Jasper the Ozarks town), and towns named in the villager's origin
  // (Portland, Oregon vs Portland, Maine — genuinely ambiguous).
  const LS = Game.data.lifeseeds || {};
  const allTowns = [];
  for (const r of (LS.regions || [])) for (const twn of (r.towns || [])) allTowns.push({ town: String(twn).toLowerCase(), region: r.id });
  const rid = v.lifeseed && v.lifeseed.regionId;
  const kinFirsts = new Set((v.lifeseed && v.lifeseed.people || []).map(p => String(p.name || '').split(' ')[0].toLowerCase()));
  const originCity = String(v.homeRegion || '').split(',')[0].trim().toLowerCase();
  for (const twn of allTowns) {
    if (twn.region === rid || twn.town.length <= 3) continue;
    if (kinFirsts.has(twn.town) || originCity.includes(twn.town)) continue;
    const re = new RegExp(`\\b${twn.town.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (re.test(low)) err('E4-region', who, `region contradiction: "${twn.town}" (${twn.region}) in a ${rid} story`);
  }
}

(async () => {
  await Game.init();
  Game.say = () => {};
  const villagers = [];
  const nOrigins = Math.max(4, Math.ceil(N / 6));
  for (let i = 0; i < nOrigins && villagers.length < N; i++) {
    const roster = Game.genRoster(ORIGINS[i % ORIGINS.length]);
    for (const c of roster) { if (villagers.length < N) villagers.push({ v: c, roster: i }); }
  }
  console.log(`generated ${villagers.length} villagers across ${nOrigins} origins (seed ${process.env.SEED || process.argv[2] || 20261011})`);

  // E2-dup is scoped WITHIN a roster: each genRoster call is one expedition
  // (dedup registries reset per call by design); cross-expedition repeats
  // are different games and don't violate the unique-person law.
  const seenByRoster = new Map(); // roster -> Map(sentence -> first villager)
  for (const { v, roster } of villagers) {
    const who = `${v.name} [${v.homeRegion}]`;
    if (!seenByRoster.has(roster)) seenByRoster.set(roster, new Map());
    const seenSentences = seenByRoster.get(roster);
    const T = collectVillagerTexts(v);
    for (const [label, text] of Object.entries(T)) {
      if (label === 'tempHasVoice' || label === 'tempHasAssess') continue;
      checkGrammar(who, label, text);
    }
    checkContradictions(v, T);
    // E5: voice/personality mismatches
    if (!T.tempHasVoice) err('E5-voice', who, `temperament "${(v.personality || {}).temperament}" has no voice profile (falls back to steady)`);
    if (!T.tempHasAssess) err('E5-assess', who, `temperament "${(v.personality || {}).temperament}" has no assessment pool (falls back to steady)`);
    // E2: duplicate sentence detection (within roster)
    const all = [T.backstory, T.systemAssessment, T.talk, T.quest].join(' ');
    for (const s of sentences(all)) {
      if (s.length < 45) continue;
      if (seenSentences.has(s)) {
        const first = seenSentences.get(s);
        if (first !== v.name) err('E2-dup', who, `sentence shared with ${first}: "${s.slice(0, 70)}..."`);
      } else seenSentences.set(s, v.name);
    }
    // E2b: duplicate lifeseed place names within a roster
    const places = String(T.ls_places || '').split(' ¶ ').map(x => x.split(':').slice(1).join(':').trim()).filter(Boolean);
    if (!seenByRoster.has('places:' + roster)) seenByRoster.set('places:' + roster, new Map());
    const seenPlaces = seenByRoster.get('places:' + roster);
    for (const pn of places) {
      if (seenPlaces.has(pn)) {
        const first = seenPlaces.get(pn);
        if (first !== v.name) err('E2-street', who, `place name shared with ${first}: "${pn}"`);
      } else seenPlaces.set(pn, v.name);
    }
    // per-villager mini report
    if (process.env.VERBOSE) {
      console.log(`\n--- ${who} | ${v.formerOccupation} | ${v.pro} | temp=${(v.personality || {}).temperament}`);
      console.log('BACKSTORY:', T.backstory);
    }
  }
  // summary
  const byCls = {};
  for (const e of errors) byCls[e.cls] = (byCls[e.cls] || 0) + 1;
  console.log('\n===== SUMMARY =====');
  console.log(`villagers: ${villagers.length}, total errors: ${errors.length}`);
  for (const [c, n] of Object.entries(byCls).sort()) console.log(`  ${c}: ${n}`);
  const shown = new Set();
  const cap = process.env.FULL ? errors.length : 60;
  for (const e of errors.slice(0, cap)) {
    const key = e.cls + '|' + e.msg.slice(0, 60);
    if (shown.has(key) && !process.env.FULL) continue; shown.add(key);
    console.log(`[${e.cls}] ${e.who}: ${e.msg}`);
  }
  console.log(errors.length ? '\nRESULT: FAIL' : '\nRESULT: PASS');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
