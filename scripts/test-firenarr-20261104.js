#!/usr/bin/env node
// test-firenarr-20261104.js — proof for sim-firenarr-b (DESIGN ONLY).
// SYNTHETIC ONLY: loads no game code, needs no node harness, runs no
// judged seeds, touches no real corpus seed. It proves TEMPLATE
// SELECTION for the firing-evening narration spec in
// evidence/2026-11-03/sim-firenarr-b.md §3(b)-(c): given a synthetic
// firing kind + occasion, the right template is selected; given a
// non-firing evening, nothing is selected.
//
// The selector below IS the spec's reference table (copied verbatim
// from the spec), not game code and not a deploy. The deploy arm
// lifts the table from the spec, not this file. If the spec table
// changes, this proof must change with it — a mismatch between the
// two is the loud failure, never a silent drift.
'use strict';

const TEMPLATES = {
  first: {
    E1: '⚠ The store has fallen from its recent high — the shelves are thinning.',
    E2: '⚠ The store has fallen far from its recent high — the shelves are nearly bare.',
    F: '⚠ The store keeps slipping from its recent high — evening after evening, lower.',
  },
  again: {
    E1: '⚠ The store has fallen from its recent high again — the shelves are thinning.',
    E2: '⚠ The store has fallen far from its recent high again — the shelves are nearly bare.',
    F: '⚠ The store keeps slipping from its recent high again — evening after evening, lower.',
  },
  escalation: '⚠ The store has fallen further still from its recent high.',
};

// occasion: 'first' | 'again' | 'repeat-quiet' | 'repeat-escalation' | 'none'
// clause: 'E1' | 'E2' | 'F' | null
// Returns a template string, or null for silence.
function selectTemplate(ev) {
  const clause = ev && ev.clause;
  const occasion = ev && ev.occasion;
  if (occasion === 'none' || clause == null) return null;
  if (occasion === 'first') return TEMPLATES.first[clause] || null;
  if (occasion === 'again') return TEMPLATES.again[clause] || null;
  if (occasion === 'repeat-quiet') return null;
  if (occasion === 'repeat-escalation') {
    // Escalation exists only when the first firing was NOT already the
    // cliff: after an E2 first firing there is no deeper band, so repeats
    // are always silent.
    if (clause === 'E2') return null;
    return TEMPLATES.escalation;
  }
  return null;
}

// Mirrors fireVariant's tie rule: earliest day wins; a tie goes to (e**).
// eDay/fDay are the (e**) and (F) firing days in the stretch (or null).
function resolveClause(eDay, fDay, eClause) {
  if (eDay == null) return fDay == null ? null : 'F';
  if (fDay == null) return eClause || 'E1';
  if (fDay < eDay) return 'F';
  return eClause || 'E1'; // tie (fDay === eDay) goes to (e**)
}

let pass = 0;
let fail = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) pass++;
  else { fail++; console.log(`FAIL ${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`); }
}

// --- first firings: each kind selects its own template ---
check('first E1', selectTemplate({ clause: 'E1', occasion: 'first' }), TEMPLATES.first.E1);
check('first E2', selectTemplate({ clause: 'E2', occasion: 'first' }), TEMPLATES.first.E2);
check('first F', selectTemplate({ clause: 'F', occasion: 'first' }), TEMPLATES.first.F);

// --- again firings (new stretch): the again variant, per kind ---
check('again E1', selectTemplate({ clause: 'E1', occasion: 'again' }), TEMPLATES.again.E1);
check('again E2', selectTemplate({ clause: 'E2', occasion: 'again' }), TEMPLATES.again.E2);
check('again F', selectTemplate({ clause: 'F', occasion: 'again' }), TEMPLATES.again.F);

// --- repeat-quiet: silence for every kind ---
for (const clause of ['E1', 'E2', 'F']) {
  check(`repeat-quiet ${clause} silent`, selectTemplate({ clause, occasion: 'repeat-quiet' }), null);
}

// --- repeat-escalation: once after E1/F first firing, never after E2 ---
check('escalation after E1', selectTemplate({ clause: 'E1', occasion: 'repeat-escalation' }), TEMPLATES.escalation);
check('escalation after F', selectTemplate({ clause: 'F', occasion: 'repeat-escalation' }), TEMPLATES.escalation);
check('escalation after E2 silent', selectTemplate({ clause: 'E2', occasion: 'repeat-escalation' }), null);

// --- non-firing evenings: nothing selected, whatever the clause field says ---
check('non-firing, no clause', selectTemplate({ clause: null, occasion: 'none' }), null);
check('non-firing, clause present but no firing', selectTemplate({ clause: 'E1', occasion: 'none' }), null);
check('non-firing, clause F but no firing', selectTemplate({ clause: 'F', occasion: 'none' }), null);
check('non-firing, empty input', selectTemplate({}), null);
check('non-firing, null input', selectTemplate(null), null);

// --- tie rule: (e**) wins ties; earlier day wins otherwise ---
check('tie 18/18 -> E1', resolveClause(18, 18, 'E1'), 'E1');
check('tie 15/15 -> E1 (survivor shape)', resolveClause(15, 15, 'E1'), 'E1');
check('tie 14/14 -> E2', resolveClause(14, 14, 'E2'), 'E2');
check('e earlier -> E1', resolveClause(20, 21, 'E1'), 'E1');
check('f earlier -> F', resolveClause(22, 21, 'E1'), 'F');
check('e only -> E2', resolveClause(13, null, 'E2'), 'E2');
check('f only -> F', resolveClause(null, 21, 'E1'), 'F');
check('neither -> null', resolveClause(null, null, 'E1'), null);

// --- templates are distinct per kind (E1 vs E2 vs F must not collapse) ---
check('E1 != E2 first', TEMPLATES.first.E1 !== TEMPLATES.first.E2, true);
check('E1 != F first', TEMPLATES.first.E1 !== TEMPLATES.first.F, true);
check('E2 != F first', TEMPLATES.first.E2 !== TEMPLATES.first.F, true);
check('again != first E1', TEMPLATES.again.E1 !== TEMPLATES.first.E1, true);
check('escalation distinct', TEMPLATES.escalation !== TEMPLATES.first.E1
  && TEMPLATES.escalation !== TEMPLATES.first.E2
  && TEMPLATES.escalation !== TEMPLATES.first.F, true);

// --- spec constraints on every template ---
const ALL = [...Object.values(TEMPLATES.first), ...Object.values(TEMPLATES.again), TEMPLATES.escalation];
const FORBIDDEN = [/\d/, /%/, /\bdays\b/i, /hungr/i, /starv/i, /belly/i, /stand/i, /gate/i, /throttle/i];
for (const t of ALL) {
  check(`template <=100 chars: ${t.slice(0, 30)}…`, t.length <= 100, true);
  check(`template says store + recent high: ${t.slice(0, 30)}…`, t.includes('store') && t.includes('recent high'), true);
  for (const rx of FORBIDDEN) {
    check(`template forbids ${rx}: ${t.slice(0, 30)}…`, rx.test(t), false);
  }
}

console.log(`test-firenarr-20261104: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
