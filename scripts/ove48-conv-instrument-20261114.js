// ove48-conv-instrument-20261114.js — conversation-open recorder for the
// OVE-48 mechanism arm (sim-ove48-conv-a, Loop A fleshout-20261114T2315Z).
//
// Wraps Game.convoSelectWant / convoDawnPriorities / talkTo / endConvo /
// Game.say and records every conversation open: which want was selected,
// by which source class, what dawn had committed that villager to, and
// how the sitting opened and closed.
//
// PURE OBSERVER: every wrap calls the original and returns its value
// unchanged. The wraps draw no Math.random, write no game state, and
// call only pure reads (vbrainCommit, vgoalState, vgoalWeights — the
// same reads convoDawnPriorities itself makes, in the same order). The
// stage-2 proof asserts field-for-field survival identity against the
// band-3 corpora, which is the check that this observer changed
// nothing.
//
// Bounds: opens capped at 3000/seed, convo lines at 6 per conversation
// and 1500 per seed (overflow counted, never silently dropped).
// Usage:
//   const REC = require('./ove48-conv-instrument-20261114');
//   const rec = REC.install(Game);
//   ... run ...
//   const out = rec.finish(); // { opens, lines, totals, errors }
//   rec.uninstall();
'use strict';

const MAX_OPENS = 3000;
const MAX_LINES_PER_CONVO = 6;
const MAX_LINES = 1500;

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Independent dawn-state read, mirroring convoDawnPriorities' read order
// exactly (commit.vgoal first, then vgoalState.top, then a weights
// argmax). Pure reads only; every step try/caught.
function readDawnState(Game, vid) {
  let kind = null, drive = null, source = 'none';
  try {
    let commit = null;
    try { commit = (typeof Game.vbrainCommit === 'function') ? Game.vbrainCommit(vid) : null; } catch (e) { commit = null; }
    const day = gday(Game);
    if (commit && commit.day != null && commit.day !== day) commit = null;
    kind = (commit && commit.kind) ? commit.kind : null;
    drive = (commit && commit.vgoal) ? commit.vgoal : null;
    if (kind || drive) source = 'commit';
    if (!drive) {
      try {
        const st = (typeof Game.vgoalState === 'function') ? Game.vgoalState(vid) : null;
        if (st && st.top) { drive = st.top; if (source === 'none') source = 'vgoalState'; }
      } catch (e) {}
    }
    if (!drive) {
      try {
        const w = (typeof Game.vgoalWeights === 'function') ? Game.vgoalWeights(vid) : null;
        if (w) {
          let top = null, topW = -1;
          for (const id of Object.keys(w)) { if (w[id] > topW) { topW = w[id]; top = id; } }
          if (top && topW > 0) { drive = top; if (source === 'none') source = 'vgoalWeights'; }
        }
      } catch (e) {}
    }
  } catch (e) { /* dawn read failed; kind/drive stay null, error recorded by caller */ }
  return { kind: kind, drive: drive, source: source };
}

function classifySource(out) {
  if (!out) return 'error-null';
  if (out.fromSeed) return 'seed';
  if (out.id === 'pocketed') return 'pocketed-preemptor';
  if (out.id === 'repay') return 'repay-preemptor';
  return 'weighted-pick';
}

function install(Game) {
  const rec = {
    opens: [],
    lines: [],
    totals: {
      selectWantCalls: 0, dawnPriorityReads: 0, talkToCalls: 0,
      endConvoCalls: 0, opensOverflow: 0, linesOverflow: 0,
      linesCappedPerConvo: 0,
    },
    errors: [],
  };
  const orig = {};
  let inConvo = null; // { vid, openIdx, lineCount } while a sitting is open
  let sayDepth = 0;

  function err(where, e) {
    rec.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  }

  // --- convoSelectWant: the want selection itself. ---
  if (typeof Game.convoSelectWant === 'function') {
    orig.convoSelectWant = Game.convoSelectWant;
    Game.convoSelectWant = function (vid) {
      rec.totals.selectWantCalls++;
      let dawnState = null, dawnErr = null;
      try { dawnState = readDawnState(Game, vid); } catch (e) { dawnErr = e; dawnState = { kind: null, drive: null, source: 'error' }; }
      let out = null;
      try { out = orig.convoSelectWant.apply(this, arguments); }
      catch (e) { err('convoSelectWant-throw', e); throw e; }
      try {
        if (rec.opens.length < MAX_OPENS) {
          const entry = {
            day: gday(Game), vid: String(vid),
            want: (out && out.id) || null,
            source: classifySource(out),
            fromSeed: !!(out && out.fromSeed),
            seedFavorId: (out && out.seedFavorId) || null,
            dawnKind: dawnState ? dawnState.kind : null,
            dawnDrive: dawnState ? dawnState.drive : null,
            dawnSource: dawnState ? dawnState.source : 'error',
            dawnReadError: dawnErr ? String(dawnErr.message || dawnErr).slice(0, 80) : null,
            pickDawn: null, // the pick's own record, subject leg only
            openerThread: null, openerLine: null, openerProduced: null,
            stageAtClose: null, closeResolution: null, closeHow: null,
            convoLines: 0,
          };
          if (out && out.dawn) {
            entry.pickDawn = {
              kind: out.dawn.kind || null,
              drive: out.dawn.drive || null,
              preferred: Array.isArray(out.dawn.preferred) ? out.dawn.preferred.slice() : null,
              aligned: !!out.dawn.aligned,
            };
          }
          rec.opens.push(entry);
          // Link the in-progress talkTo to this open (talkTo calls
          // convoSelectWant synchronously inside itself).
          if (inConvo) inConvo.openIdx = rec.opens.length - 1;
        } else { rec.totals.opensOverflow++; }
      } catch (e) { err('convoSelectWant-record', e); }
      return out;
    };
  } else { rec.errors.push('install: Game.convoSelectWant missing'); }

  // --- convoDawnPriorities: the pick's code path (subject only). ---
  if (typeof Game.convoDawnPriorities === 'function') {
    orig.convoDawnPriorities = Game.convoDawnPriorities;
    Game.convoDawnPriorities = function (vid) {
      rec.totals.dawnPriorityReads++;
      let out = null;
      try { out = orig.convoDawnPriorities.apply(this, arguments); }
      catch (e) { err('convoDawnPriorities-throw', e); throw e; }
      return out;
    };
  }
  // Baseline leg: no such function — dawnPriorityReads stays 0 by
  // construction. That 0 is a control read, not a gap.

  // --- talkTo: the open. Records the opener line + thread. ---
  if (typeof Game.talkTo === 'function') {
    orig.talkTo = Game.talkTo;
    Game.talkTo = function (vid) {
      rec.totals.talkToCalls++;
      const prevInConvo = inConvo;
      inConvo = { vid: String(vid), openIdx: -1, lineCount: 0 };
      let ret = null;
      try { ret = orig.talkTo.apply(this, arguments); }
      catch (e) { inConvo = prevInConvo; err('talkTo-throw', e); throw e; }
      try {
        // Opener line: talkTo returns the opening line (or null).
        const line = (typeof ret === 'string') ? ret : null;
        let thread = null, stage = null;
        try {
          const c = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
          if (c) {
            thread = c.thread || null;
            stage = (c.want && typeof c.want.stage === 'number') ? c.want.stage : null;
          }
        } catch (e) {}
        if (inConvo.openIdx >= 0 && rec.opens[inConvo.openIdx]) {
          const o = rec.opens[inConvo.openIdx];
          o.openerLine = line ? String(line).slice(0, 300) : null;
          o.openerProduced = line != null && String(line).length > 0;
          o.openerThread = thread;
          o.stageAtOpen = stage;
          o.convoLines = inConvo.lineCount;
        }
      } catch (e) { err('talkTo-record', e); }
      // NOTE: inConvo is NOT restored here — the sitting stays open
      // until endConvo clears it, so say-lines from turns and the
      // goodbye are captured too (walk-out policy: none; held
      // conversations: the turns). endConvo clears it below.
      return ret;
    };
  } else { rec.errors.push('install: Game.talkTo missing'); }

  // --- endConvo: the close. Records stage + resolution at close. ---
  if (typeof Game.endConvo === 'function') {
    orig.endConvo = Game.endConvo;
    Game.endConvo = function (vid, how) {
      rec.totals.endConvoCalls++;
      let stageBefore = null, resBefore = null;
      try {
        const c = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
        if (c && c.want) { stageBefore = (typeof c.want.stage === 'number') ? c.want.stage : null; resBefore = c.want.resolution || null; }
      } catch (e) {}
      let ret = null;
      try { ret = orig.endConvo.apply(this, arguments); }
      catch (e) { err('endConvo-throw', e); throw e; }
      try {
        if (inConvo && inConvo.vid === String(vid)) inConvo = null;
        // The close belongs to the most recent open for this vid that
        // has no close yet (opens are synchronous: one sitting at a
        // time in sims, so scan back for the latest unclosed match).
        for (let i = rec.opens.length - 1; i >= 0; i--) {
          const o = rec.opens[i];
          if (o.vid === String(vid) && o.closeHow == null) {
            o.stageAtClose = stageBefore;
            o.closeResolution = resBefore;
            o.closeHow = (how == null) ? null : String(how);
            break;
          }
        }
      } catch (e) { err('endConvo-record', e); }
      return ret;
    };
  } else { rec.errors.push('install: Game.endConvo missing'); }

  // --- Game.say: lines spoken while a conversation is open. ---
  // Chained AFTER any existing wrap (the driver's vetSays wrap):
  // install order in the driver is say-wrap first, recorder second,
  // so this wrapper's `orig` is the driver's wrapped say.
  if (typeof Game.say === 'function') {
    orig.say = Game.say;
    Game.say = function () {
      const arg = arguments.length ? arguments[0] : null;
      try {
        if (inConvo && typeof arg === 'string') {
          if (inConvo.lineCount < MAX_LINES_PER_CONVO) {
            if (rec.lines.length < MAX_LINES) {
              rec.lines.push({ day: gday(Game), vid: inConvo.vid, line: String(arg).slice(0, 400) });
              inConvo.lineCount++;
            } else { rec.totals.linesOverflow++; }
          } else { rec.totals.linesCappedPerConvo++; }
        }
      } catch (e) { /* never break say for a recording failure */ }
      sayDepth++;
      try { return orig.say.apply(this, arguments); }
      finally { sayDepth--; }
    };
  }

  rec.uninstall = function () {
    if (orig.convoSelectWant) Game.convoSelectWant = orig.convoSelectWant;
    if (orig.convoDawnPriorities) Game.convoDawnPriorities = orig.convoDawnPriorities;
    if (orig.talkTo) Game.talkTo = orig.talkTo;
    if (orig.endConvo) Game.endConvo = orig.endConvo;
    if (orig.say) Game.say = orig.say;
  };
  rec.finish = function () {
    return { opens: rec.opens, lines: rec.lines, totals: rec.totals, errors: rec.errors };
  };
  return rec;
}

module.exports = { install: install, readDawnState: readDawnState, classifySource: classifySource, MAX_OPENS: MAX_OPENS, MAX_LINES: MAX_LINES };
