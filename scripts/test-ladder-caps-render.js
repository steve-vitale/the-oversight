'use strict';
// test-ladder-caps-render.js — proof for scripts/ladder-caps-render.js
// (r197 blank: the ladder-file caps column collapsed a global state into
// per-kind state). Cases use synthetic daily rows shaped exactly like the
// ladder instrument's snapshot rows ({capstones: {kind: {ready, reason}},
// delivered: kind|null}).
const { renderCaps } = require('./ladder-caps-render');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
// (1) The r196 shape: military_tribute delivered d140; the engine's
// ladderCapstoneReady returns reason 'delivered' for ALL three kinds, so
// the old rendering printed all three as delivered on the same line whose
// delivered= field named one. The renderer must print seat-open for the
// other two.
{
  const row = {
    delivered: 'military_tribute',
    capstones: {
      trade_charter: { ready: false, reason: 'delivered', charteredLinks: null },
      feast_embassy: { ready: false, reason: 'delivered', bundle: null },
      military_tribute: { ready: false, reason: 'delivered', veterans: null },
    },
  };
  const out = renderCaps(row);
  ok('(1) r196 d140 shape renders seat-open for the undelivered kinds',
    out === 'trade_charter=seat-open,feast_embassy=seat-open,military_tribute=delivered', out);
  ok('(1) no kind but the delivered one reads delivered',
    (out.match(/=delivered/g) || []).length === 1, out);
}
// (2) Before any delivery, a ready kind reads ready and the others read
// their own reasons (r197 135301 d138 shape: tribute ready, others short).
{
  const row = {
    delivered: null,
    capstones: {
      trade_charter: { ready: false, reason: 'no-sealed-charter', charteredLinks: 0 },
      feast_embassy: { ready: false, reason: 'no-bundle-feast', bundle: false },
      military_tribute: { ready: true, reason: 'ready', veterans: 2 },
    },
  };
  ok('(2) ready kind reads ready, others read their reasons',
    renderCaps(row) === 'trade_charter=no-sealed-charter,feast_embassy=no-bundle-feast,military_tribute=ready',
    renderCaps(row));
}
// (3) No delivery yet and nothing ready: reasons verbatim (veterans-short).
{
  const row = {
    delivered: null,
    capstones: {
      trade_charter: { ready: false, reason: 'no-sealed-charter' },
      feast_embassy: { ready: false, reason: 'no-bundle-feast' },
      military_tribute: { ready: false, reason: 'veterans-short', veterans: 1 },
    },
  };
  ok('(3) all-short reasons verbatim',
    renderCaps(row) === 'trade_charter=no-sealed-charter,feast_embassy=no-bundle-feast,military_tribute=veterans-short',
    renderCaps(row));
}
// (4) No capstones snapshot at all (instrument read failed): caps=-.
ok('(4) missing capstones renders caps=-', renderCaps({ delivered: null, capstones: null }) === 'caps=-');
ok('(4b) missing row renders caps=-', renderCaps(null) === 'caps=-');
// (5) A kind missing from the snapshot renders '?', not a crash.
{
  const row = {
    delivered: null,
    capstones: { trade_charter: { ready: false, reason: 'scale-short' } },
  };
  ok('(5) missing kind renders ?',
    renderCaps(row) === 'trade_charter=scale-short,feast_embassy=?,military_tribute=?', renderCaps(row));
}
// (6) A different kind delivered (trade_charter): the seat-open side
// flips to it.
{
  const row = {
    delivered: 'trade_charter',
    capstones: {
      trade_charter: { ready: false, reason: 'delivered' },
      feast_embassy: { ready: false, reason: 'delivered' },
      military_tribute: { ready: false, reason: 'delivered' },
    },
  };
  ok('(6) trade_charter delivered flips the seat-open side',
    renderCaps(row) === 'trade_charter=delivered,feast_embassy=seat-open,military_tribute=seat-open',
    renderCaps(row));
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
