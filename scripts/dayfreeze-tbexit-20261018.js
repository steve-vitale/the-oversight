#!/usr/bin/env node
// dayfreeze-tbexit-20261018.js — pin the EXACT intra-tbAdvance exit path for
// the 7 startCombat strands, WITHOUT copying tbAdvance's loop (the LOOP
// probe's copy diverged under instrumentation).
//
// Method: wrap tbAdvance for entry/exit logging only; wrap tbEndCheck for
// (fightId, returnValue); wrap startCombat for nesting. On a strand
// (startCombat exits with a live non-player turn), dump the full call
// sequence and classify the opening tbAdvance's exit:
//   - endcheck-true  (tbEndCheck logged true during it)
//   - player-arrival (post-state is player turn — not a strand)
//   - fight-changed  (post fight !== entry fight)
//   - guard-60/other (none of the above; loop exhausted or entry-nofight)
// Bail after the first strand dump (fast iteration).
'use strict';
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const SEED = parseInt(process.env.SEED || '59104', 10);
const POLICY = process.env.ONLY || 'belongfeast';
const BAIL = process.env.BAIL !== '0';

(async () => {
  const base = SW.policyFor(POLICY);
  const policy = Object.assign({}, base, { id: base.id + '-tbexit', desc: base.desc + ' [TBEXIT]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const seq = [];
  let depth = 0, scDepth = 0, strandFound = false;
  const fid = (f) => (f ? f.id : 'null');
  const cur = () => { try { const c = Game.tbCurrent(); return c ? c.kind : 'null'; } catch (e) { return '?'; } };

  const oAdv = Game.tbAdvance.bind(Game);
  Game.tbAdvance = function () {
    const f0 = this.tbfight, id0 = fid(f0);
    const ti0 = f0 ? f0.turnIdx : -1, r0 = f0 ? f0.round : -1;
    const d = depth++;
    let endcheckTrue = false;
    const markEC = () => { endcheckTrue = true; };
    this.__tbexitMark = markEC;
    let r, err = null;
    try { r = oAdv.apply(this, arguments); }
    catch (e) { err = e; }
    finally { depth--; if (this.__tbexitMark === markEC) this.__tbexitMark = null; }
    const f1 = this.tbfight, id1 = fid(f1);
    const ti1 = f1 ? f1.turnIdx : -1, r1 = f1 ? f1.round : -1;
    let exit;
    if (err) exit = 'THREW:' + (err && err.message);
    else if (!f0 || f0.over) exit = 'entry-nofight';
    else if (endcheckTrue) exit = 'endcheck-true';
    else if (id1 !== id0) exit = 'fight-changed';
    else if (f1 && !f1.over && Game.tbIsPlayerTurn()) exit = 'player-arrival';
    else exit = 'guard-60/other';
    seq.push(`tbAdvance d=${d} sc=${scDepth} in=${id0}[i${ti0} r${r0}] out=${id1}[i${ti1} r${r1}] cur=${cur()} exit=${exit}`);
    if (err) throw err;
    return r;
  };

  const oEC = Game.tbEndCheck.bind(Game);
  Game.tbEndCheck = function () {
    const f = Game.tbfight;
    const r = oEC.apply(this, arguments);
    if (scDepth > 0) {
      seq.push(`  tbEndCheck sc=${scDepth} fid=${fid(f)} over=${f ? f.over : 'nf'} cur=${cur()} => ${r}`);
      if (r === true && this.__tbexitMark) { try { this.__tbexitMark(); } catch (e) {} }
    }
    return r;
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    const outerId = fid(Game.tbfight);
    scDepth++;
    seq.push(`startCombat ENTER sc=${scDepth} mid=${a[0]} outer=${outerId}`);
    // capture the created fight: the first tbAdvance entry inside sees it
    let r;
    try { r = oStart.apply(this, a); }
    finally { scDepth--; }
    try {
      const f = Game.tbfight;
      seq.push(`startCombat EXIT sc=${scDepth + 1} mid=${a[0]} fight=${fid(f)} over=${f ? f.over : 'nf'} turn=${cur()} idx=${f ? f.turnIdx : -1} round=${f ? f.round : -1}`);
      if (f && !f.over) {
        const c = Game.tbCurrent();
        if (!c || c.kind !== 'player') {
          strandFound = true;
          const tail = seq.slice(-60);
          process.stderr.write(`\n=== TBEXIT-STRAND mid=${a[0]} outer=${outerId} ===\n`);
          process.stderr.write(tail.join('\n') + '\n=== END (last 60 of ' + seq.length + ') ===\n');
          if (BAIL) process.exit(0);
        }
      }
    } catch (e) { if (BAIL) process.exit(0); }
    if (seq.length > 400) seq.splice(0, seq.length - 400);
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays} strandFound=${strandFound}`);
})().catch(e => { console.error('TBEXIT CRASH:', e); process.exit(2); });
