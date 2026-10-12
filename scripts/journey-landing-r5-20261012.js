#!/usr/bin/env node
// Journey leg: LANDING (days 1-14) R5 — competent-player playthrough on the
// CURRENT tree (1e1afc81; r4 ran on ab71fe80).
//
// Changes vs r4:
//   - script list extracted DYNAMICALLY from index.html (r4 hardcoded a list
//     that missed sigW4.js/sigW5.js/finale-campaign.js — silent module loss)
//   - daily: answer aid offers/begs (longsim food r4 aid pipes), loot corpses
//     (loot-as-action; never human meat)
//   - new sense metrics: comma-closer stutter scan (succession ab655181 fix),
//     spoken-lure coverage (r4's own fix — verify it holds on this tree),
//     aid telemetry, beasttrick-none honesty, disease-death naming
//
// Usage: node scripts/journey-landing-r5-20261012.js   (seeds 111, 222, 333)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [111, 222, 333]);

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global; // stub for eval phase only

// ---- DYNAMIC script list: index.html order, minus DOM-only ----
const EXCLUDE = new Set(['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js']);
const files = [];
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const seen = new Set();
  for (const m of html.matchAll(/src="([^"]+)"/g)) {
    let f = m[1].split('?')[0]; // strip ?v= cache-buster
    if (!f.endsWith('.js')) continue;
    const base = path.basename(f);
    if (EXCLUDE.has(base)) continue;
    if (seen.has(f)) continue;
    seen.add(f);
    files.push(f);
  }
}
console.log('script files: ' + files.length + ' (excluded: ' + [...EXCLUDE].join(', ') + ')');
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

// ---- text-stream capture ----
let capture = [];
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}
(function wrapStream() {
  const _emit = Game.emit, _say = Game.say;
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  if (typeof _say === 'function') {
    Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  }
})();

// ---- helpers ----
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }

// ---- R5 sense metrics ----
const MET = {
  sittings: 0, reofferFlags: 0,
  npcQuestions: 0,
  wants: {},
  justSaid: 0,
  maras: 0,
  commaStutter: 0,      // succession fix: "...different. , friend." pattern
  punctStutter: 0,      // doubled terminal punctuation or "word. Word," echoes
  lureOffered: 0,       // sittings where betrayal:accept menu appeared
  lureSpoken: 0,        //   of those, where the NPC spoke the invitation
  lureSilent: 0,        //   of those, where the menu floated unsaid
  aidOfferAccepted: 0,
  aidGivenKcal: 0,
  aidRefused: 0,
  corpseItemsTaken: 0,
  diseaseDeaths: 0,
  diseaseDeathsNamed: 0, // disease id named when village knows it
  beastTrickLines: 0,
};
function bump(obj, k) { obj[k] = (obj[k] || 0) + 1; }

// comma-closer stutter: terminal punctuation followed by a comma-led closer
const COMMA_STUTTER_RE = /[.!?]["\u201d]?\s*,/;
// doubled terminal punctuation — but NOT the literary ellipsis ("..."),
// which the voice system uses deliberately. Only ?!, mixed repeats, or 4+
const PUNCT_STUTTER_RE = /([!?])\1|\.{4,}/;
// invite phrasing: the spoken lure words
const LURE_RE = /trap line|extra hands|get air|come with me|walk with me|help me (with|move)|keep me company|check my|visit my/i;

function senseCheckThem(line) {
  const s = String(line || '');
  if (/I just said/i.test(s)) { MET.justSaid++; return '!! FALLBACK "I just said" fired'; }
  if (/Mara/.test(s)) { MET.maras++; return '!! PHANTOM "Mara"'; }
  if (COMMA_STUTTER_RE.test(s)) { MET.commaStutter++; return '!! COMMA-CLOSER STUTTER: ' + s.slice(0, 120); }
  if (PUNCT_STUTTER_RE.test(s) && !/^\.*$/.test(s)) { MET.punctStutter++; return '!! PUNCT STUTTER: ' + s.slice(0, 120); }
  return null;
}

const DEEPEN = ['dlg:help', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of DEEPEN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  const yn = list.find(x => x && (x.id === 'gq:yn:yes' || x.id === 'gq:open:take'));
  if (yn) return yn;
  // ENGAGE THEIR WANT (r5): alive:want:* surfaces the NPC's actual want
  // (favor asks etc.) — engaging it is what a competent villager does.
  const wantEngage = list.find(x => x && x.id && x.id.indexOf('alive:want:') === 0);
  if (wantEngage) return wantEngage;
  const agree = list.find(x => x && x.id === 'agree');
  if (agree && turn < 7) return agree;
  const cant = list.find(x => x && x.id === 'dlg:cant');
  if (cant) return cant;
  const bdecl = list.find(x => x && x.id === 'betrayal:decline');
  if (bdecl) return bdecl;
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}

function pantryKcal() {
  try {
    const p = (Game.state.village && Game.state.village.pantry) || [];
    return Math.round(p.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
  } catch (e) { return null; }
}
function deathsSoFar() {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function popAlive() {
  try {
    return (Game.state.village.roster || []).filter(id => { const p = person(id); return !p.dead; }).length;
  } catch (e) { return null; }
}

// answer aid offers/begs like a competent player (longsim food r4 pipes)
function answerAid() {
  const st = Game.state || {};
  try {
    if (st.pendingAidOffer && Game.answerAidOffer) {
      Game.answerAidOffer('accept');
      MET.aidOfferAccepted++;
    }
  } catch (e) {}
  try {
    const beg = st.pendingAidBeg;
    if (beg && Game.answerAidBeg) {
      const ask = beg.amount || 1500;
      let pk = 0;
      try { pk = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) {}
      let creditor = false;
      try {
        const led = Game.aidLedger ? Game.aidLedger(beg.villageId) : null;
        creditor = led && (led.receivedKcal || 0) > (led.givenKcal || 0);
      } catch (e) {}
      const give = pk > ask * (creditor ? 1.5 : 3);
      const r = Game.answerAidBeg(give ? 'give' : 'refuse');
      if (r === 'gave') MET.aidGivenKcal += ask;
      else MET.aidRefused++;
    }
  } catch (e) {}
}

// loot the dead, never human meat (competent-player habit)
function lootCorpses() {
  try {
    if (!Game.corpses) return;
    let took = 0;
    for (const c of Game.corpses()) {
      if (!c || c.looted || c.buried) continue;
      const items = c.items || [];
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
        if (it.plantId === 'meat_human') continue;
        try {
          if (Game.corpseTakeItem(c.id, i)) { took++; MET.corpseItemsTaken++; }
        } catch (e) {}
      }
      if (took >= 12) break;
    }
  } catch (e) {}
}

function runConversation(seed, day, vid) {
  const fp = `/tmp/journey-landing-r5-transcript-${seed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  let sawBetrayalMenu = false;
  const themLines = [];
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    MET.sittings++;
    bump(MET.wants, want.id || 'none');
    const seenIds = new Set();
    const seenAtTurn = new Map();
    const noteMenu = (choices, turn) => {
      for (const ch of (choices || [])) {
        if (!ch || !ch.id) continue;
        if (ch.id.indexOf('ans:') === 0) MET.npcQuestions++;
        if (/^betrayal:(accept|decline)/.test(ch.id)) sawBetrayalMenu = true;
        if (seenIds.has(ch.id)) {
          MET.reofferFlags++;
          log(`!! RE-OFFER: [${ch.id}] re-offered at turn ${turn} (first at turn ${seenAtTurn.get(ch.id)})`);
        } else { seenIds.add(ch.id); seenAtTurn.set(ch.id, turn); }
      }
    };
    log(`=== seed ${seed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.occupation || '?'} temperament=${p.temperament || '?'} trust=${((Game.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log(''); noteMenu(r0.choices || [], 0);
    log(`opening menu (${(r0.choices || []).length} choices):`);
    for (const ch of (r0.choices || [])) log(`  [${ch.id}] ${String(ch.label || '').slice(0, 120)}`);
    log('');
    const sayThem = (line) => {
      if (!line) { log('THEM: (no line)'); return; }
      const s = String(line);
      themLines.push(s);
      log(`THEM: ${s}`);
      const flag = senseCheckThem(s);
      if (flag) log(flag);
    };
    sayThem(r0.line);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      log('');
      noteMenu(choices, turn + 1);
      log(`menu (${(choices || []).length}): ` + (choices || []).map(ch => `[${ch && ch.id}] ${String((ch && ch.label) || '').slice(0, 60)}`).join(' | '));
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = Game.convoTurn(vid, pick.id);
      sayThem(r.line);
      const w = (Game.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    log('');
    log('--- END ---');
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = Game.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    log(`transcript entries: ${t.length}`);
    const themT = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themT.filter((x, i) => themT.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
    const allText = themT.join('\n') + '\n' + themLines.join('\n');
    if (/\(last time\)/i.test(allText)) log('!! leaked "(last time)" internal note');
    // spoken-lure check: menu offered a betrayal invite — did the NPC speak it?
    if (sawBetrayalMenu) {
      MET.lureOffered++;
      if (LURE_RE.test(allText)) { MET.lureSpoken++; log('lure: SPOKEN ✓'); }
      else { MET.lureSilent++; log('!! lure: menu offered a betrayal invite but the NPC never spoke it'); }
    }
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

function buildCensus() {
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const trust = (Game.state.village && Game.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (Game.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = Game.agencyOf ? Game.agencyOf(id) : null; } catch (e) {}
    let mood = p.mood || null;
    return {
      id, name: vname(id),
      alive: !p.dead,
      occupation: p.occupation || null,
      temperament: p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood,
      plantsKnown: plants,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
}

async function runSeed(seed) {
  _s = seed >>> 0;
  capture = [];
  console.log(`\n########## SEED ${seed} ##########`);
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const pid = Game.villagerId;
  const pp = person(pid);
  const spawn = {
    seed,
    day: gday(),
    scholarName: vname(pid),
    scholarId: pid,
    occupation: pp.occupation || null,
    temperament: pp.temperament || null,
    hp: (Game.state.scholar && Game.state.scholar.health) || null,
    fullness: (Game.state.scholar && Game.state.scholar.kcal) || null,
    rosterCount: (Game.state.village.roster || []).length,
  };
  console.log('SPAWN: ' + JSON.stringify(spawn));
  console.log('--- first 40 emitted lines (what the new player sees) ---');
  console.log(capture.slice(0, 40).join('\n'));
  console.log('--- end of spawn stream ---');

  const talked = new Set();
  let sysWas = !!(Game.state && Game.state.systemArrived);
  let systemDay = sysWas ? gday() : null;
  let systemFile = null;
  const series = [];
  const transcriptFiles = [];
  let overAt = null;

  for (let day = 1; day <= 14; day++) {
    const gd = gday();
    console.log(`\n--- seed ${seed} game-day ${gd} ---`);
    let vid = null;
    try {
      const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && !talked.has(id));
      for (const id of roster) {
        try {
          const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
          if (comm.level === 'none') continue;
        } catch (e) {}
        let cnt = -1;
        try { const c0 = Game.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
        if (cnt === 0) { vid = id; break; }
      }
      if (!vid && roster.length) vid = roster[0];
    } catch (e) { console.log('villager-pick ERROR: ' + (e && e.message)); }
    if (vid) {
      try {
        const fp = runConversation(seed, gd, vid);
        transcriptFiles.push(fp);
        console.log(`convo with ${vname(vid)} -> ${fp}`);
      } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
      talked.add(vid);
    } else {
      console.log('no fresh conversational villager today');
    }
    // daily competent-player routine: aid pipes, loot, time passes, eat/drink/sleep
    try { answerAid(); } catch (e) { console.log('answerAid ERROR: ' + (e && e.message)); }
    try { lootCorpses(); } catch (e) { console.log('lootCorpses ERROR: ' + (e && e.message)); }
    try { Game.tickAction(256); } catch (e) { console.log('tickAction ERROR: ' + (e && e.message)); }
    try { Game.eat(); } catch (e) { console.log('eat() note: ' + (e && e.message)); }
    try { Game.fillWater(); } catch (e) { console.log('fillWater() note: ' + (e && e.message)); }
    try { Game.drinkWater(); } catch (e) { console.log('drinkWater() note: ' + (e && e.message)); }
    try { Game.sleep(); } catch (e) { console.log('sleep ERROR: ' + (e && e.message)); }

    const sysNow = !!(Game.state && Game.state.systemArrived);
    if (!sysWas && sysNow) {
      systemDay = gday();
      systemFile = `/tmp/journey-landing-r5-system-${seed}.txt`;
      fs.writeFileSync(systemFile,
        `=== seed ${seed}: System contact fired on game-day ${systemDay} ===\n\n` +
        capture.slice(-30).join('\n'));
      console.log(`*** SYSTEM CONTACT on day ${systemDay} -> ${systemFile}`);
    }
    sysWas = sysNow;

    series.push({
      day: gday(), pantryKcal: pantryKcal(), pop: popAlive(),
      deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause })),
      scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
      scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
      scholarAlive: !!(Game.state.scholar) && !Game.over,
    });
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }
  }

  const census = buildCensus();
  // disease-death naming audit (crisis r3: sick deaths name the disease id when known)
  for (const d of deathsSoFar()) {
    const cause = String((d && d.cause) || '');
    if (/sick|sickness|disease|fever|poison/i.test(cause)) {
      MET.diseaseDeaths++;
      if (d.causeId || /[a-z]+_[a-z]+/.test(cause)) MET.diseaseDeathsNamed++;
    }
  }
  const censusPath = `/tmp/journey-landing-r5-census-${seed}.json`;
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, spawn, systemDay, systemFile, transcriptFiles, series, census, overAt,
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | systemDay=${systemDay} | over=${overAt || 'no'} | transcripts=${transcriptFiles.length}`);
  return { seed, spawn, systemDay, censusPath, transcriptFiles, series, overAt };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  console.log('SENSE METRICS: ' + JSON.stringify(MET, null, 1));
  for (const r of results) {
    console.log(`seed ${r.seed}: spawn=${r.spawn && r.spawn.scholarName} | systemDay=${r.systemDay} | over=${r.overAt || 'no'} | census=${r.censusPath}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
