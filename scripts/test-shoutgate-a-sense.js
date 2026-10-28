#!/usr/bin/env node
// scripts/test-shoutgate-a-sense.js — sim-shoutgate-a sense transcript
// (NON-MEASURED replay only; writes nothing to any corpus, feeds no
// verdict). Replays seed 75106 on the ARMED code with the same
// substrate (tableseat-nowait + outdoorcrew policy + fieldparty
// recorder) plus a read-only fieldFight log tap, and prints the full
// log of one formed wave-4 field meeting (preferring the band's d109
// audit meeting) so the shout can be judged as fiction, not counts.
// The tap draws no RNG and mutates nothing, so the replay walks the
// band's trajectory; if it diverges, the script prints the first
// formed wave-4 log it finds instead and says so.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { outdoorcrew } = require('./policies/outdoorcrew');
const {
  newStore: newFieldpartyStore, installFieldpartyDiag, withFieldpartyDiag,
} = require('./policies/fieldparty-form-diag');
async function main() {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.OUTDOORCREW = '1';
  process.env.FIELDPARTY = '1';
  const fpStore = newFieldpartyStore();
  const base = withFieldpartyDiag(outdoorcrew, 'fieldparty-diag', 'outdoorcrew + field-party formation census', fpStore);
  const { Game } = await loadGame({ seed: 75106, mode: 'shoutgate-a-sense', fullTelemetry: false });
  await setupGame(Game);
  try { installFieldpartyDiag(Game, fpStore); } catch (e) {}
  const captured = [];
  const origFF = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    let day = 0;
    try { day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
    const rec = origFF.apply(this, arguments);
    try {
      if (mdef && (mdef.wave | 0) === 4) {
        captured.push({ day, vid, mid: mdef.id, outcome: rec.outcome, rounds: rec.rounds,
          calledHelp: !!rec.calledHelp, allyVid: rec.allyVid || null, allyDealt: rec.allyDealt | 0,
          log: (rec.log || []).slice() });
      }
    } catch (e) {}
    return rec;
  };
  await runDays(Game, base, { days: 180, manifest: undefined, sampleEvery: 10 });
  Game.fieldFight = origFF;
  const formed = captured.filter(c => c.calledHelp);
  const prefer = formed.find(c => c.day === 109 && c.mid === 'audit') || formed[0];
  if (!prefer) { console.log('SENSE: no formed wave-4 fight captured in replay'); return; }
  console.log(`SENSE: seed 75106 replay, formed wave-4 meeting d${prefer.day} leader=${prefer.vid} monster=${prefer.mid} outcome=${prefer.outcome} rounds=${prefer.rounds} ally=${prefer.allyVid} allyDealt=${prefer.allyDealt} (captured=${captured.length} wave-4 fights, formed=${formed.length})`);
  console.log('--- full fight log ---');
  for (const line of prefer.log) console.log(line);
}
main().catch(e => { console.error(e); process.exit(1); });
