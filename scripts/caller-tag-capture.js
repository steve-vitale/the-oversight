#!/usr/bin/env node
// caller-tag-capture.js — caller-tagged pantry-deposit recorder (DIAG only,
// sim-callertag-b). Installed AFTER loadGame, BEFORE setupGame, alongside
// scripts/inflow-capture.js and scripts/garden-capture.js (it wraps the
// same depositPantryPieces door a third time and records what those two
// instruments do NOT: the caller, the destination village, and the FULL
// gardenShares object instead of the boolean).
//
// Every wrapper delegates with identical arguments, `this`, and return
// value, and writes ONLY to the caller's array. No Game.state write, no
// RNG consumption, no say/log write. Day reads are try/catch isolated
// via the same branchDay helper the other captures use.
//
// Records per depositPantryPieces call:
//   day, door 'deposit', name, kcal (kcalEach * units, as the other
//   captures compute it), destVillage (v.name, or null), gardenShares
//   (a deep copy of src.gardenShares when present, else null — NOT the
//   boolean), callerTag, callerFrame (raw first non-wrapper stack frame).
//
// Caller-tag rule (stack-derived, no game-code change): the tag is the
// first stack frame outside this wrapper. Named callers map exactly:
//   donateToPantry -> 'donateToPantry'
//   returnToVillage -> 'returnToVillage'
//   returnToOldVillage -> 'returnToOldVillage'
// Anything else maps to 'other:<fnName or file:line>'. The tribute
// caller (hierarchy.js linkTick's anonymous IIFE, ~line 1173) has NO
// function name, so it lands as other:<location> — identifiable by its
// frame location, not by a name. That is honest, not a gap in the
// prototype: tribute's src literal carries no gardenShares at all, so a
// garden-attributed record can never be tribute regardless of tag.
//
// This is the exact capture the gardendeposit caveat needs. If it is ever
// ported inward, the fields to record are callerTag + gardenShares (full
// object) + destVillage, set in the inflow/garden capture layer where v,
// src, and the call stack are all available without touching src/js.
'use strict';

const { branchDay } = require('./plainvoice-capture');

const KNOWN_CALLERS = {
  donateToPantry: 'donateToPantry',
  returnToVillage: 'returnToVillage',
  returnToOldVillage: 'returnToOldVillage',
};

// Parse one V8 stack frame line into {fn, file, line}. Handles:
//   '    at donateToPantry (/path/file.js:1:2)'
//   '    at Object.donateToPantry (/path/file.js:1:2)'
//   '    at /path/file.js:1:2' (anonymous)
function parseFrame(line) {
  const m = (line || '').trim().match(/^at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
  if (!m) return { fn: null, file: null, line: null, raw: line || '' };
  let fn = m[1] || null;
  if (fn) {
    // V8 property-inferred names: 'wrappedDeposit [as depositPantryPieces]'
    // -> the declared name 'wrappedDeposit'.
    fn = fn.replace(/\s+\[as .*\]$/, '');
    // 'Object.donateToPantry' -> 'donateToPantry'; 'Game.donateToPantry' likewise.
    const parts = fn.split('.');
    fn = parts[parts.length - 1];
    if (fn === '<anonymous>' || fn === 'anonymous') fn = null;
  }
  return { fn, file: m[2], line: Number(m[3]), raw: (line || '').trim() };
}

// First stack frame that is not this wrapper's own frame and not the
// Error constructor line. `skipNames` holds wrapper-internal function
// names to step past (the wrapper itself, plus this helper's caller).
function callerFrame(skipNames) {
  const stack = (new Error('caller-tag').stack || '').split('\n').slice(1);
  for (const line of stack) {
    const f = parseFrame(line);
    if (f.fn === 'callerFrame') continue; // this helper's own frame
    if (f.fn && skipNames.indexOf(f.fn) !== -1) continue;
    if (!f.fn && (line.indexOf('caller-tag-capture') !== -1)) continue;
    return f;
  }
  return { fn: null, file: null, line: null, raw: '' };
}

function tagFor(frame) {
  if (frame.fn && KNOWN_CALLERS[frame.fn]) return KNOWN_CALLERS[frame.fn];
  if (frame.fn) return 'other:' + frame.fn;
  if (frame.file) return 'other:' + frame.file + ':' + (frame.line || '?');
  return 'other:unknown';
}

function installCallerTagCapture(Game, opts) {
  opts = opts || {};
  const records = [];
  function dayOf() { try { return branchDay(Game); } catch (e) { return 1; } }
  const orig = Game.depositPantryPieces;
  if (typeof orig !== 'function') throw new Error('caller-tag-capture: Game.depositPantryPieces is not a function');
  if (orig.__callerTagInstalled) throw new Error('caller-tag-capture: Game.depositPantryPieces already caller-tag-wrapped');
  function wrappedDeposit(v, src, pieceKcal) {
    const frame = callerFrame(['wrappedDeposit', 'installCallerTagCapture']);
    const ret = orig.apply(this, arguments);
    try {
      const s = src || {};
      let gs = null;
      if (s.gardenShares != null) {
        try { gs = JSON.parse(JSON.stringify(s.gardenShares)); }
        catch (e) { gs = s.gardenShares; }
      }
      records.push({
        day: dayOf(),
        door: 'deposit',
        name: s.name == null ? null : String(s.name),
        kcal: Math.round((s.kcalEach || 0) * (s.units || 0)),
        destVillage: (v && v.name != null) ? String(v.name) : null,
        gardenShares: gs,
        callerTag: tagFor(frame),
        callerFrame: frame.raw,
      });
    } catch (e) {}
    return ret;
  }
  wrappedDeposit.__callerTagInstalled = true;
  Game.depositPantryPieces = wrappedDeposit;
  return {
    records,
    uninstall() {
      if (Game.depositPantryPieces === wrappedDeposit) Game.depositPantryPieces = orig;
    },
  };
}

module.exports = { installCallerTagCapture, parseFrame, tagFor, callerFrame };
