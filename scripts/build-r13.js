// Build scripts/journey-scale-r13-20261019.js from journey-scale-r10-20261019.js:
// same table-audit instrument, belong road policy (belongseek/belongfeast),
// plus the Binding beat-text stamp and belong-mechanics wraps from r12.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname);
let src = fs.readFileSync(path.join(ROOT, 'journey-scale-r10-20261019.js'), 'utf8');

// ---- 1. header comment (lines 1..45 up to "Usage:") ----
const headerEnd = src.indexOf('// Usage: SEEDS=9801,9802 node scripts/journey-scale-r10-20261019.js');
const newHeader = `// scripts/journey-scale-r13-20261019.js — journey leg SCALE (days 80–140) R13:
// the BELONG road + the TABLE APPROACH on the current tip.
//
// Road coverage on this tip: r9 REFUSE (pilot), r10 table approach (lead:
// 0/4 pilot -> 4/4 A/B with the feast layer; the binding gate was the
// POLICY's feast accounting, not the game), r11 conquest/mercy grace, r12
// covenant. The belong road was last measured r4 (2026-10-17: 7/8 staged,
// all GO). This run answers r10's question on the belong road: does the
// table ever approach a competent belong-road village in days 80–140 — and
// which lesser-seat sub-gate binds?
//
// PRE-REGISTER (2026-10-19, MEASUREMENT.md sections 9-12, 14):
//   Leg question: on the current tip, does the table approach a competent
//   belong-road village (valued subordinate: trust >=50, arrears 0, link
//   age >=14d to a foreign 4-realm) in days 80–140 — and which lesser-seat
//   sub-gate binds (waves 4/4/3 distinct, contests>=2, crises>=2,
//   regional+, stage>=2, sentimentTaught + feastSurgeUsed)?
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 approach — count of seeds with tableWaiting/tableAnnounced by d140.
//       Pilot-gated A/B like r10: pilot 2 seeds belongseek + 2 seeds
//       belongfeast; the full 8-seed run uses the winner (or belongseek if
//       neither approaches, with the autopsy as the finding). GO >=1/8;
//       0/8 with all gates named = the documented finding, not silence.
//     M2 autopsy — every seed names the unmet lesser-seat sub-gates from
//       tableSeat().detail (instrumented daily + checkpoints d90/100/120/
//       140; first-day each sub-gate flips). NO-GO if the instrument fails
//       to report on any seed.
//     M3 people — >=8 transcripts sense-read (The Binding beat +
//       conversations), 0 senseless flags.
//     M4 survival — >=2/8 reach d100 (death-aware; dead/scattered stops).
//     M5 announcement honesty — any earned seat announces aloud; if 0/8,
//       near-miss shortfalls must be readable in beat text, not silent.
//   Interesting-finding bar: the first approach on the belong road; the
//   binding sub-gate ranking (the belong scholar's wave-3 deed bar; the
//   tribute-out road's food-thesis deeds); The Binding's full beat text on
//   the current tip; tribute weeks (real food out); a demand refused aloud
//   with real consequences (policy honors demands — likely unexercised,
//   documented if so); a consolidator switch or its exile-aware hold;
//   overtime if a seat sits untaken.
//   Horizon: DAYCAP=185 loop-days targeting ~140 game-days, death-aware stop
//   (+10d tail max). Seeds: 13001–13008 (fresh; pilot 13001–13004).
//   Policy: belongseek + BELONG_V3=1 (exile-aware switch + opinion-building
//   climb + score-gated break; v3 >= v2 proven 2026-10-12; the r4 whole-run
//   policy) for the unlayered arm; belongfeast (belongseek + the r13 feast
//   layer, FEASTSCALE_R13=1) for the layered arm — the r10 A/B structure:
//   identical seeds, policy switch. Harness answers pendingNational with
//   'swear' at The Binding.
//   Telemetry: compare against the belong-shaped baseline
//   (telemetry-baselines/scale-belong.json), NOT the lead scale.json.
`;
src = newHeader + src.slice(headerEnd);

// ---- 2. usage line ----
src = src.replace(
  '// Usage: SEEDS=9801,9802 node scripts/journey-scale-r10-20261019.js',
  '// Usage: SEEDS=13001,13002 node scripts/journey-scale-r13-20261019.js\n//   R13_FEAST=1 belongs to the layered arm (default: unlayered belongseek).'
);

// ---- 3. policy requires: set BELONG_V3 before require (read at require time) ----
src = src.replace(
  "const { leadcourt } = require('./policies/leadcourt');\nconst { leadfeast } = require('./policies/feastscale');",
  "// BELONG_V3 is read at require time in belongseek.js (2026-10-12 v3:\n// exile-aware switch + score-gated break; the r4 whole-run policy).\nprocess.env.BELONG_V3 = '1';\nconst { belongseek } = require('./policies/belongseek');\nconst { belongfeast } = require('./policies/feastscale');"
);
src = src.replace(
  "// R10 follow-up switch: R10_FEASTSCALE=1 uses the r13 feast layer\n//       (tribute/tend count as feast contribution — see blank #2)\nconst POLICY = process.env.R10_FEASTSCALE === '1' ? 'leadfeast' : 'leadcourt';\nconst BASE = process.env.R10_FEASTSCALE === '1' ? leadfeast : leadcourt;",
  "// R13 pilot A/B switch (r10 template): R13_FEAST=1 uses the feast layer\n//       (tribute/tend count as feast contribution). Same seeds, policy switch.\nconst POLICY = process.env.R13_FEAST === '1' ? 'belongfeast' : 'belongseek';\nconst BASE = process.env.R13_FEAST === '1' ? belongfeast : belongseek;"
);

// ---- 4. defaults ----
src = src.replace(
  "const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9801, 9802, 9803, 9804, 9805, 9806, 9807, 9808]);",
  "const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [13001, 13002, 13003, 13004]);"
);

// ---- 5. names: r10 -> r13, lead -> belong ----
src = src.split('journey-scale-r10-lead').join('journey-scale-r13-belong');
src = src.split('journey-scale-r10-').join('journey-scale-r13-');
src = src.split('journey-scale-r10').join('journey-scale-r13');
src = src.split('r10-cap-').join('r13-cap-');
src = src.replace("policy.id = 'journey-scale-r13-' + POLICY;", "policy.id = 'journey-scale-r13-' + POLICY;");
src = src.replace(
  "const fp = path.join(EVIDIR, `journey-scale-r13-transcript-${_currentSeed}-day${day}.txt`);",
  "// R10 appendix lesson: namespace transcripts by policy (A/B filename collisions).\n  const fp = path.join(EVIDIR, `journey-scale-r13-${POLICY}-transcript-${_currentSeed}-day${day}.txt`);"
);

// ---- 6. graft: the Binding stamp + belong-mechanics wraps (from r12's policy.setup) ----
const graftAnchor = "    _wrapCov('raidVillage'); _wrapCov('answerRaid');\n    _wrapCov('tendLink'); _wrapCov('answerNationalChoice');";
const graft = `    _wrapCov('raidVillage'); _wrapCov('answerRaid');
    _wrapCov('tendLink'); _wrapCov('answerNationalChoice');
    // R13: BELONG-road mechanics wraps (pure logs; zero gameplay effect) —
    // The Binding beat text (staging copy + answer copy), tribute weeks
    // (real food out, honest arrears), demands answered, consolidator
    // switches, the Watchers beat.
    ctx.belongLog = [];       // {day, verb, link, how, res, note}
    ctx.bindingDay = null; ctx.bindingBeatText = []; ctx.bindingAnswer = null;
    ctx.watchersDay = null; ctx.watchersBeatText = [];
    const _wrapBelong = (name, note) => {
      try {
        const _f = G[name];
        if (typeof _f !== 'function') return;
        G[name] = function () {
          const r = _f.apply(this, arguments);
          try {
            const rec = { day: gday(), verb: name,
              link: String(arguments[0] || '').slice(-8), how: String(arguments[1] || ''),
              res: r == null ? String(r) : (typeof r === 'object' ? JSON.stringify(r).slice(0, 200) : String(r)) };
            if (name === 'payTribute' && typeof r === 'number') rec.kcalPaid = r;
            if (note) rec.note = note;
            ctx.belongLog.push(rec);
          } catch (e2) {}
          return r;
        };
      } catch (e) {}
    };
    _wrapBelong('payTribute'); _wrapBelong('answerDemand');
    _wrapBelong('breakLink'); _wrapBelong('proposeLink', 'belongseek courtship verb');
    // The Binding beat: stamp the day + capture the beat's own spoken text.
    try {
      const _anc = G.answerNationalChoice;
      if (typeof _anc === 'function') {
        G.answerNationalChoice = function (how) {
          let shape = 'unknown';
          try { shape = (G.state.pendingNational && G.state.pendingNational.shape) || 'unknown'; } catch (e2) {}
          const r = _anc.apply(this, arguments);
          try {
            if (shape === 'belong') {
              ctx.bindingDay = gday();
              ctx.bindingAnswer = String(how);
              const tail = capture.slice(-160).filter(x => /the binding|swear the oath|oath|sealed with|kneels|their court/i.test(String(x)));
              ctx.bindingBeatText = tail.map(String).slice(-16);
            }
          } catch (e3) {}
          return r;
        };
      }
    } catch (e) {}
    // The Watchers beat: stamp + spoken text (r12).
    try {
      const _ag = G.answerGlobalChoice;
      if (typeof _ag === 'function') {
        G.answerGlobalChoice = function (how) {
          const r = _ag.apply(this, arguments);
          try {
            if (ctx.watchersDay == null) {
              ctx.watchersDay = gday();
              const tail = capture.slice(-60).filter(x => /watcher|broadcast|champion|theater|decline|planetary/i.test(String(x)));
              ctx.watchersBeatText = tail.map(String).slice(-10);
            }
          } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}`;
if (!src.includes(graftAnchor)) { console.error('GRAFT ANCHOR NOT FOUND'); process.exit(1); }
src = src.replace(graftAnchor, graft);

// ---- 7. final out: belong fields ----
const outAnchor = "    scaleBeatText,";
if (!src.includes(outAnchor)) { console.error('OUT ANCHOR NOT FOUND'); process.exit(1); }
src = src.replace(outAnchor,
`    scaleBeatText,
    bindingDay: ctx.bindingDay == null ? null : ctx.bindingDay,
    bindingAnswer: ctx.bindingAnswer || null,
    bindingBeatText: ctx.bindingBeatText || [],
    watchersDay: ctx.watchersDay == null ? null : ctx.watchersDay,
    watchersBeatText: ctx.watchersBeatText || [],
    belongLog: ctx.belongLog || [],
    ctxSwitches: ctx._switched || null,
    fsFeasts: ctx.fsFeasts || 0,`);
const doneLog = 'SEED ${seed} DONE:';
src = src.replace(doneLog, 'SEED ${seed} [${POLICY}] DONE:');

// ---- 8. summary trailer policy tag ----
const trailerOld = '########## ALL SEEDS COMPLETE ##########';
src = src.replace(trailerOld, '########## ALL SEEDS COMPLETE (POLICY=' + "' + POLICY + '" + ') ##########');

const out = path.join(ROOT, 'journey-scale-r13-20261019.js');
fs.writeFileSync(out, src);
console.log('wrote', out, src.length, 'chars');
