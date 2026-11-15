// talktranscript-instrument-20261114.js — conversation-open recorder for
// the OVE-48 spoken-drive judged transcript run (arm
// sim-talktranscript-a, Loop A fleshout-20261115T0427Z). The
// ove48-mech instrument with ONE change: the capture channel.
// Spoken dialogue does NOT go through Game.say — sayLine
// (conversation.js:910) pushes spoken beats directly to c.transcript
// ({who:'them', text}), and the "ONE TEXT STREAM" rule (dialog-ui-fix
// 2026-10-11) keeps NPC speech out of the narration feed entirely.
// The mech instrument therefore judged narration, not speech. This
// instrument captures NOTHING from Game.say (it does not even wrap
// it — install leaves Game.say untouched, asserted by the proof
// test) and instead snapshots c.transcript at endConvo, after the
// original runs: the transcript is reset only at open (talkTo,
// conversation.js:5764) and never cleared by endConvo, and endConvo
// itself speaks the goodbye + want-closing beats via sayLine, so the
// post-close snapshot is the sitting's complete spoken record.
//
// Per open, same bookkeeping as the mech instrument (openIdx join
// key, exchangesAtClose, turnLines, held) plus transcriptBeatCount /
// themBeatCount. Lines are the 'them' beats only ('you'/'narr'
// entries are the player's words and stage directions, not spoken
// dialogue); seq is the 0-based index within the sitting's them-beats,
// so seq 0 is the opener beat and seq >= 1 are the turn lines — the
// same positional non-opener rule as the mech instrument. Caps:
// 200 beats per sitting (the engine's own transcript cap), 20000
// lines per seed (held sittings run ~5 them-beats each). Same pure
// observer discipline (no RNG draws, no state writes).
// Usage:
//   const REC = require('./talktranscript-instrument-20261114');
//   const rec = REC.install(Game);
//   ... run ...
//   const out = rec.finish(); // { opens, lines, totals, errors }
//   rec.uninstall();
'use strict';

const MAX_OPENS = 3000;
const MAX_LINES_PER_CONVO = 200;
const MAX_LINES = 20000;

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Independent dawn-state read, mirroring convoDawnPriorities' read order
// exactly (commit.vgoal first, then vgoalState.top, then a weights
// argmax). Pure reads only; every step try/caught. (Verbatim from the
// mech instrument — the dawn read is not the thing under test here.)
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
      linesCappedPerConvo: 0, endConvoNoop: 0,
      transcriptBeats: 0, themBeats: 0, nonThemBeats: 0,
      sittingsCaptured: 0, sittingsNoTranscript: 0, sittingsUnjoined: 0,
      sittingsNonverbal: 0,
    },
    errors: [],
  };
  const orig = {};
  let inConvo = null; // { vid, openIdx, lineCount } while a sitting is open

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
            convoLines: 0, exchangesAtClose: null, turnLines: 0, held: false,
            transcriptBeats: 0, themBeats: 0,
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
      // until endConvo clears it.
      return ret;
    };
  } else { rec.errors.push('install: Game.talkTo missing'); }

  // --- endConvo: the close. Snapshots c.transcript AFTER the original
  // runs (the goodbye + want-closing beats are spoken by sayLine
  // inside endConvo itself) and attaches the 'them' beats to the
  // latest unclosed open for this vid. The transcript is NOT cleared
  // by endConvo — it is reset only at the next open — so the
  // post-close read is this sitting's complete spoken record.
  // Game.say is deliberately NOT wrapped: spoken dialogue never
  // passes through it.
  // Nonverbal sittings (no shared language) return from nvOpen before
  // convoSelectWant, so they never produce an open record — their
  // endConvo closes are counted separately (sittingsNonverbal), not
  // as unjoined misses. A verbal close with no open IS a miss
  // (sittingsUnjoined) and must be 0.
  if (typeof Game.endConvo === 'function') {
    orig.endConvo = Game.endConvo;
    Game.endConvo = function (vid, how) {
      rec.totals.endConvoCalls++;
      let stageBefore = null, resBefore = null, exchBefore = null, wasNVBefore = false;
      try {
        const c = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
        if (c && c.want) { stageBefore = (typeof c.want.stage === 'number') ? c.want.stage : null; resBefore = c.want.resolution || null; }
        if (c) exchBefore = (typeof c.exchanges === 'number') ? c.exchanges : null;
        // Read BEFORE the original runs: endConvo clears c.thread.
        if (c) wasNVBefore = !!(c.wasNonverbal || c.thread === 'nonverbal');
      } catch (e) {}
      let ret = null;
      try { ret = orig.endConvo.apply(this, arguments); }
      catch (e) { err('endConvo-throw', e); throw e; }
      try {
        // A noop close (winddown auto-end followed by the UI's second
        // closeChat call, or any repeat call on a dead conversation)
        // closes nothing: it must not consume — or fail to find — an
        // open. Count it separately, clear any stale in-progress
        // marker for this vid, and return before the scan-back.
        if (ret && ret.noop) {
          rec.totals.endConvoNoop = (rec.totals.endConvoNoop || 0) + 1;
          if (inConvo && inConvo.vid === String(vid)) inConvo = null;
          return ret;
        }
        if (inConvo && inConvo.vid === String(vid)) inConvo = null;
        // Snapshot the transcript now — synchronously, before any
        // other code can open a new sitting for this vid.
        let beats = null;
        try {
          const c = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
          if (c && Array.isArray(c.transcript)) beats = c.transcript.slice();
        } catch (e) { err('endConvo-transcript-read', e); }
        // The close belongs to the most recent open for this vid that
        // has no close yet (opens are synchronous: one sitting at a
        // time in sims, so scan back for the latest unclosed match).
        let openIdx = -1;
        for (let i = rec.opens.length - 1; i >= 0; i--) {
          const o = rec.opens[i];
          if (o.vid === String(vid) && o.closeHow == null) { openIdx = i; break; }
        }
        if (openIdx < 0) {
          // No want-selected open to join: a NONVERBAL sitting (no
          // shared language — nvOpen returns before convoSelectWant,
          // so no open is ever recorded) closes here too. Count it
          // separately; only a verbal close with no open is a miss.
          if (wasNVBefore) rec.totals.sittingsNonverbal = (rec.totals.sittingsNonverbal || 0) + 1;
          else rec.totals.sittingsUnjoined++;
          if (beats) {
            rec.totals.transcriptBeats += beats.length;
            for (const b of beats) { if (b && b.who === 'them') rec.totals.themBeats++; else rec.totals.nonThemBeats++; }
          }
          return ret;
        }
        const o = rec.opens[openIdx];
        o.stageAtClose = stageBefore;
        o.closeResolution = resBefore;
        o.closeHow = (how == null) ? null : String(how);
        o.exchangesAtClose = exchBefore;
        o.held = (exchBefore != null && exchBefore >= 1);
        if (!beats || beats.length === 0) {
          rec.totals.sittingsNoTranscript++;
          o.transcriptBeats = 0;
          o.themBeats = 0;
          o.turnLines = 0;
          o.convoLines = 0;
          return ret;
        }
        rec.totals.sittingsCaptured++;
        rec.totals.transcriptBeats += beats.length;
        let them = 0, turn = 0;
        for (const b of beats) {
          if (!b) continue;
          if (b.who !== 'them') { rec.totals.nonThemBeats++; continue; }
          const text = (typeof b.text === 'string') ? b.text : '';
          if (them < MAX_LINES_PER_CONVO) {
            if (rec.lines.length < MAX_LINES) {
              rec.lines.push({
                day: gday(Game), vid: String(vid),
                line: String(text).slice(0, 400),
                openIdx: openIdx, seq: them,
                beat: (b.beat != null) ? String(b.beat).slice(0, 60) : null,
                topic: (b.topic != null) ? String(b.topic).slice(0, 60) : null,
              });
              if (them >= 1) turn++;
            } else { rec.totals.linesOverflow++; }
          } else { rec.totals.linesCappedPerConvo++; }
          them++;
        }
        rec.totals.themBeats += them;
        o.transcriptBeats = beats.length;
        o.themBeats = them;
        o.turnLines = turn;
        o.convoLines = them;
      } catch (e) { err('endConvo-record', e); }
      return ret;
    };
  } else { rec.errors.push('install: Game.endConvo missing'); }

  rec.uninstall = function () {
    if (orig.convoSelectWant) Game.convoSelectWant = orig.convoSelectWant;
    if (orig.convoDawnPriorities) Game.convoDawnPriorities = orig.convoDawnPriorities;
    if (orig.talkTo) Game.talkTo = orig.talkTo;
    if (orig.endConvo) Game.endConvo = orig.endConvo;
    // Game.say is never wrapped by this instrument: nothing to restore.
  };
  rec.finish = function () {
    return { opens: rec.opens, lines: rec.lines, totals: rec.totals, errors: rec.errors };
  };
  return rec;
}

module.exports = { install: install, readDawnState: readDawnState, classifySource: classifySource, MAX_OPENS: MAX_OPENS, MAX_LINES: MAX_LINES };
