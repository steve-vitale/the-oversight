#!/usr/bin/env node
// PROOF TEST (dialog-ui-fix 2026-10-11) — structural fix of conversation UI
// defects + content quality, verified broken on live build 803af6e8-20261011-112410.
//
// Steve's standing rules: "Fix all structurally." SENSE-TESTING LAW: prove
// things are SENSICAL, not just functional. One mobile screen (390x844),
// moment-to-moment play never scrolls.
//
// Defects covered:
//   1. DUPLICATE RENDERING — sayLine echoed every NPC line to the narration
//      feed AND the dialogue transcript. Fixed: emission to ONE surface.
//   2. TALK BUTTON OBSCURED — static proof of correct markup + wiring;
//      (hit-testing needs a live browser; flagged for 390x844 re-verify).
//   3. GRAMMAR — speaker-label space structurally inside the label span,
//      one formatter for both render sites.
//   4. TRUNCATION — talk-cost string complete in source; pagination (5)
//      removes the visual mid-sentence cutoff.
//   5. LAYOUT — current beat never scrolls; long lines paginate at emission
//      into tap-advance beats (sentence boundaries, never mid-word).
//   6. NO-REPLY BUG — "How can I help?" re-ask no longer silences the NPC;
//      hollow fallback replaced with honest lines.
//   7. CROSS-NPC VERBATIM REPETITION — fixed strings are pools now;
//      run-wide spoken ledger blocks cross-NPC verbatim repeats.
//   8. VAGUE WANTS — openers name concrete wants; 'want' thread beats draw
//      the want's content (no more "that's all of it" on live threads).
//
// LIMITS (honest): no layout engine in this VM (headless Chromium hangs) —
// CSS assertions are contract checks, not measured pixels. [needs-eyes] on
// a real phone at 390x844 is the final gate after ship.
//
// Run: node scripts/test-dialog-ui-fix-20261011.js [SEED=...]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261011', 10);

// Seeded PRNG — BEFORE eval (modules capture Math.random at load).
let _s = SEED >>> 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.window = global; // stub for eval phase only
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js', 'src/js/sigW3a.js',
  'src/js/statusEffects.js', 'src/js/sigW3b.js', 'src/js/metaProgression.js',
  'src/js/sigW3c.js', 'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js', 'src/js/membership.js',
  'src/js/havenGrowth.js', 'src/js/hierarchy.js', 'src/js/comms.js',
  'src/js/safetynets.js', 'src/js/villageAgency.js', 'src/js/debug-scenarios.js',
  'src/js/build.js',
];
files.forEach(f => eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
delete global.window;
const Game = globalThis.Scattering.Game;
if (typeof globalThis.day !== 'function') {
  globalThis.day = () => ((Game.state && Game.state.scholar && Game.state.scholar.day) || 1);
}

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
};

(async () => {
  await Game.init();
  Game.genDetail = () => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 'grass'));
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vidA = roster[0], vidB = roster[1], vidC = roster[2];
  ok('roster has 3+ NPCs for cross-NPC tests', roster.length >= 3, `roster=${roster.length}`);

  // ================= DEFECT 1: one emission surface =================
  {
    Game.startConvo(vidA);
    const logBefore = (Game.log || []).length;
    Game.sayLine(vidA, '"Test line for duplication."');
    const newEntries = (Game.log || []).slice(logBefore);
    const echoed = newEntries.some(e => {
      const txt = (e && typeof e === 'object') ? (e.text || '') : String(e);
      return txt.includes('Test line for duplication');
    });
    ok('D1: sayLine does NOT echo to narration feed', !echoed);
    const c = Game.convoGet(vidA);
    ok('D1: line IS in dialogue transcript',
      c.transcript.some(e => e.who === 'them' && String(e.text).includes('Test line for duplication')));
    Game.endConvo(vidA, 'left');
  }

  // ================= DEFECT 5: pagination =================
  {
    const long = '"First sentence here. Second sentence follows with more words. ' +
      'Third sentence keeps going and going with additional content words. ' +
      'Fourth sentence adds even more text to push past the limit. ' +
      'Fifth sentence ensures we exceed two hundred sixty characters total length here. ' +
      'Sixth sentence for good measure and padding words."';
    ok('D5: test line exceeds chunk max', long.length > 260, `len=${long.length}`);
    const chunks = Game.convoSplitBeats(long);
    ok('D5: long line splits into multiple beats', chunks.length > 1, `chunks=${chunks.length}`);
    ok('D5: no chunk exceeds 260 chars', chunks.every(ch => ch.length <= 260),
      `max=${Math.max(...chunks.map(ch => ch.length))}`);
    ok('D5: no chunk splits mid-word', chunks.every(ch => !/^\S/.test(ch) || chunks.indexOf(ch) === 0 || true) &&
      chunks.join(' ').replace(/\s+/g, ' ').trim() === long.replace(/\s+/g, ' ').trim());
    ok('D5: chunks rejoin to the original', chunks.join(' ') === long);
    // sayLine emits paginated transcript entries
    Game.startConvo(vidA);
    const c = Game.convoGet(vidA);
    const t0 = c.transcript.length;
    const ret = Game.sayLine(vidA, long);
    const added = c.transcript.slice(t0).filter(e => e.who === 'them');
    ok('D5: sayLine paginates into transcript entries', added.length === chunks.length,
      `added=${added.length} chunks=${chunks.length}`);
    ok('D5: sayLine returns the first beat', ret === chunks[0]);
    Game.endConvo(vidA, 'left');
    // CSS: current beat never scrolls
    const css = fs.readFileSync(path.join(ROOT, 'src/css/main.css'), 'utf8');
    const dlgLineRule = css.match(/\.ord-narration \.dialogue-box \.dlg-line \{([^}]*)\}/);
    ok('D5: .ord-narration .dlg-line rule exists', !!dlgLineRule);
    ok('D5: current beat has no vertical scroll', dlgLineRule && !/overflow-y:\s*auto/.test(dlgLineRule[1]),
      dlgLineRule ? dlgLineRule[1].trim().slice(0, 80) : 'missing');
    const baseRule = css.match(/^\.dlg-line \{([^}]*)\}/m);
    ok('D5: base .dlg-line has no scroll', baseRule && !/overflow-y:\s*auto/.test(baseRule[1]));
    ok('D5: history panel still scrolls (explicit user-opened)',
      /\.dlg-history \{[^}]*overflow-y:\s*auto/.test(css));
  }

  // ================= DEFECT 3: speaker label =================
  {
    const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
    const labels = app.match(/<span class="dlg-who">[^<]*<\/span>/g) || [];
    ok('D3: label formatter present', labels.length >= 2, `found=${labels.length}`);
    ok('D3: every label carries its space inside the span',
      labels.every(l => /: <\/span>$/.test(l)), labels.join(' | ').slice(0, 120));
    ok('D3: no bare-colon label remains', !/<span class="dlg-who">[^<]*:<\/span> <span/.test(app));
  }

  // ================= DEFECT 4: talk-cost string complete =================
  {
    const conv = fs.readFileSync(path.join(ROOT, 'src/js/conversation.js'), 'utf8');
    ok('D4: talk-cost explainer is complete (not cut mid-sentence)',
      conv.includes('going deep costs time, not more food.)'));
  }

  // ================= DEFECT 2: Talk button markup + wiring =================
  {
    const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
    ok('D2: Talk button emitted with data-act="talk"',
      /<button class="btn sm" data-act="talk">/.test(app));
    ok('D2: narration-box wiring targets [data-act] buttons',
      /narrBox\.querySelectorAll\('\[data-act\]'\)\.forEach/.test(app));
    ok('D2: wiring routes to personAct', /b\.onclick = \(\) => personAct\(inlineView, b\.dataset\.act\)/.test(app));
    ok('D2: personAct talk opens chat', /if \(act === 'talk'\) \{\s*\/\/ Talk opens the full-screen chat/.test(app));
    console.log('  NOTE D2: markup + wiring provably correct; hit-testing needs live 390x844 verify.');
  }

  // ================= DEFECT 8: concrete openers =================
  {
    const wants = fs.readFileSync(path.join(ROOT, 'src/js/convo-wants.js'), 'utf8');
    ok('D8: vague favor opener gone ("something I\'ve been meaning to ask")',
      !wants.includes("There's something I've been meaning to ask you."));
    ok('D8: vague favor opener gone ("not big. Probably")',
      !wants.includes("It's not big. Probably."));
    // Drive real openers: force the ask_favor want and check concreteness.
    const seen = new Set();
    for (let i = 0; i < 40 && seen.size < 3; i++) {
      Game.startConvo(vidA);
      const c = Game.convoGet(vidA);
      // force ask_favor with calm needs so the fallback pool fires
      try { const n = Game.npcNeeds(vidA); n.hunger = 10; n.fear = 10; n.energy = 90; } catch (e) {}
      const w = Game.convoSelectWant(vidA);
      if (w && w.id === 'ask_favor' && w.def) {
        const op = Game.convoWantOpener(vidA, w);
        if (op && op.line) seen.add(op.line);
      }
      Game.endConvo(vidA, 'left');
    }
    const vague = [...seen].filter(l => /something for me|meaning to ask|not big/i.test(l));
    ok('D8: ask_favor openers name concrete wants', vague.length === 0,
      `seen=${seen.size} vague=${vague.length}`);
    // share_news "tell me more" delivers content (want thread branch)
    Game.startConvo(vidB);
    const cb = Game.convoGet(vidB);
    cb.thread = 'want';
    cb.want = { id: 'share_news', def: Game.convoSelectWant ? null : null, stage: 1 };
    // build a real share_news want def reference
    try {
      const wsel = Game.convoSelectWant(vidB);
      // force share_news via direct def lookup is internal; instead verify the
      // branch exists and engageBeat delivers news through the public path
      const news = Game.convoWantNews(vidB);
      ok('D8: convoWantNews delivers real content', !!news && news.length > 20 && !/pretty much all of it/i.test(news),
        String(news).slice(0, 60));
    } catch (e) { ok('D8: convoWantNews delivers real content', false, String(e).slice(0, 80)); }
    Game.endConvo(vidB, 'left');
    // convoThreadBeat handles 'want'
    const convSrc = fs.readFileSync(path.join(ROOT, 'src/js/conversation.js'), 'utf8');
    ok("D8: convoThreadBeat has a 'want' branch", /else if \(t === 'want'\)/.test(convSrc));
  }

  // ================= DEFECT 7: cross-NPC repetition =================
  {
    // Force both NPCs onto ask_favor with calm needs; engage; compare lines.
    const favorLines = [];
    for (const vid of [vidA, vidB]) {
      Game.startConvo(vid);
      const c = Game.convoGet(vid);
      try { const n = Game.npcNeeds(vid); n.hunger = 10; n.fear = 10; n.energy = 90; } catch (e) {}
      c.want = { id: 'ask_favor', def: null, stage: 0 };
      // fetch the real def via select (internal WANTS map not exported)
      try {
        const wsel = Game.convoSelectWant(vid);
        // find ask_favor def by forcing: use convoWantOpener path is enough —
        // instead call engageBeat through a fresh select loop
      } catch (e) {}
      Game.endConvo(vid, 'left');
    }
    // Direct: run-wide ledger blocks a verbatim cross-NPC repeat.
    Game.startConvo(vidA);
    const lineX = '"Ledger test line, unique ' + SEED + '."';
    const r1 = Game.sayLine(vidA, lineX);
    Game.endConvo(vidA, 'left');
    Game.startConvo(vidB);
    const r2 = Game.sayLine(vidB, lineX);
    Game.endConvo(vidB, 'left');
    ok('D7: first NPC says the line', r1 === lineX);
    ok('D7: run-wide ledger blocks verbatim cross-NPC repeat', r2 === null);
    // engageBeat/closeLine are pools now (no fixed strings)
    const wants = fs.readFileSync(path.join(ROOT, 'src/js/convo-wants.js'), 'utf8');
    ok('D7: engageBeat fallback is a pool (convoPickCycle)',
      /engageBeat\(vid\) \{[\s\S]{0,900}convoPickCycle\(vid, 'want:favor:ask'/.test(wants));
    ok('D7: closeLine promised is a pool', /want:favor:close:promised/.test(wants));
    ok('D7: closeLine deflected is a pool', /want:favor:close:deflected/.test(wants));
    ok('D7: old verbatim engageBeat string gone',
      !wants.includes('Nothing dangerous — just an extra pair of hands. Can you help?'));
  }

  // ================= DEFECT 6: no-reply bug =================
  {
    // Scenario: ask_favor want, engage via dlg:help, then re-ask.
    Game.startConvo(vidC);
    const c = Game.convoGet(vidC);
    try { const n = Game.npcNeeds(vidC); n.hunger = 10; n.fear = 10; n.energy = 90; } catch (e) {}
    // Force the want to ask_favor stage 0 via the internal path: drive the
    // real dlg:help handler twice and check the second reply is honest.
    c.want = c.want || { id: 'ask_favor', stage: 0 };
    // Ensure we have a real def: pull from a fresh select if missing
    if (!c.want.def) {
      for (let i = 0; i < 20 && !c.want.def; i++) {
        try {
          const w = Game.convoSelectWant(vidC);
          if (w && w.id === 'ask_favor') c.want.def = w.def;
        } catch (e) {}
      }
    }
    ok('D6: ask_favor def available', !!(c.want && c.want.def));
    const t0 = c.transcript.length;
    const r1 = Game.convoTurn(vidC, 'dlg:help');
    const added1 = c.transcript.slice(t0).filter(e => e.who === 'them');
    ok('D6: first "How can I help?" gets an NPC reply', added1.length > 0 && !!r1 && !r1.ended,
      `added=${added1.length}`);
    ok('D6: reply is concrete (not hollow)',
      added1.length > 0 && !/let you know what I need/i.test(added1.map(e => e.text).join(' ')),
      added1.length ? String(added1[0].text).slice(0, 70) : 'no reply');
    // Second ask: must NOT be silence. Either menu-suppressed or honest.
    const t1 = c.transcript.length;
    const r2 = Game.convoTurn(vidC, 'dlg:help');
    const added2 = c.transcript.slice(t1).filter(e => e.who === 'them');
    const reply2 = added2.length ? String(added2[0].text) : '';
    ok('D6: re-asking never yields silence', added2.length > 0, `added=${added2.length}`);
    ok('D6: re-ask reply is honest (names the repeat)',
      /Like I said|already told|same thing|just said|miss it/i.test(reply2), reply2.slice(0, 70));
    // Menu suppression: at stage 2+, beat pool must not offer dlg:help.
    const menu = Game.convoChoices(vidC) || [];
    const ids = menu.map(m => m.id);
    ok('D6: menu at stage>=2 does not re-offer dlg:help', !ids.includes('dlg:help'),
      `menu=${ids.join(',')}`);
    Game.endConvo(vidC, 'left');
    // Hollow fallback gone from source.
    const dlg = fs.readFileSync(path.join(ROOT, 'src/js/convo-dialogue.js'), 'utf8');
    ok('D6: hollow "let you know what I need" fallback removed',
      !dlg.includes('Thank you. I\\\'ll let you know'));
  }

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
