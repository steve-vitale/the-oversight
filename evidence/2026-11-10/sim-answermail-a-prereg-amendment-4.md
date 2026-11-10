# sim-answermail-a — prereg amendment 4 (confirm instrument fix + re-run)

Committed BEFORE the confirm is judged. The first confirm
computation (both legs run, analyzer run) returned **INVALID
(fidelity gate failed)**: primary PASS (seasoned 13/15, bar
>= 10), cost PASS (starvation 4 vs cap 7, arm-only 1 vs cap 2,
median 136.5 vs bar 86.4), but **6 unattributed downs** on the
armed leg. That INVALID is an INSTRUMENT artifact, not a lever
verdict — the root cause is diagnosed below, the instrument is
fixed, and the confirm legs will be RE-RUN with the fixed
instrument and re-judged. The first computation is discarded.

## Root cause: cap-phantom gains (instrument v2 gap)

All 6 residue days share one shape: a tribute-weekly +1 wrap
event in an interval whose snapshot delta is exactly 1 less
than the event sum. Code-grounded cause:

- `Game._trustGain` (hierarchy.js ~1777) does
  `link.trust = Math.min(100, link.trust + n); return n;` — it
  returns the REQUESTED amount even when the 100-cap absorbs
  part or all of it, despite its comment saying it returns "the
  gain actually applied". When trust sits at 100, a +1 "applies"
  nothing but reports 1.
- The instrument's setter skips no-op writes (100 -> 100 logs
  nothing), correctly — nothing changed.
- The v2 _trustGain wrap logged the RETURN value as `applied`,
  so it recorded a phantom +1 with no setter twin. The analyzer
  then saw event-sum = snapshot-delta + 1 and flagged
  "unattributed-down:1". All 6 cases are this mechanism
  (120102 d128, 120104 d29 + d78, 120107 d64, 120110 d85,
  120112 d85 — each a tribute-weekly +1 landing on a capped
  link). No game behavior is wrong here; the trust cap at 100
  is real and the gains above it are correctly absorbed.

## What changes

- **Instrument v3** (`scripts/trustgrowth-instrument-20261109.js`):
  the wrap now records the ACTUAL move (trust after − trust
  before) as `applied`, and keeps the return value as
  `returned` for audit. A cap-absorbed gain logs applied 0 and
  the analyzer already drops applied-0 wraps (blockedGains)
  instead of counting a phantom event. Proof:
  `scripts/test-trustgain-cap-phantom.js` — trust 100 + 1 ->
  applied 0, no setter event; trust 97 + 8 -> applied 3,
  setter +3; trust 50 + 8 -> applied 8, setter +8; unified log
  exactly [3, 8]. Wired into `scripts/test-answermail-a.js`
  (16/16 pass).
- **Analyzer polities-count fix** (`scripts/answermail-analyze-20261110.js`):
  the filter counted any polity string that wasn't
  'never-seasoned' or 'seasoned-but-no-polity' — so seed
  120116's reason 'no-links' (died day 31, never formed a
  link) was counted as a polity on BOTH legs (polities=1).
  No polity formed on either confirm leg. The count now
  matches only a real polity string (shape + ' d' + day).
- **Re-run:** both confirm legs (base + armed, band
  120101–120116) re-run with the v3 instrument, then the
  trustgrowth + verdict analyzers re-run and the confirm
  re-judged against the SAME bars (primary >= 10/16, cost
  bar, fidelity gates as amended). The driver is
  deterministic, so the re-run should reproduce the first
  run's trajectories (days, standings, wave unlocks); any
  divergence is reported, not hidden.

## Related finding (game code, NOT fixed by this arm)

`_trustGain`'s return value lies at the cap, and the say lines
quote it (e.g. a tend on a capped link says "(Trust +8.)"
while trust moves +4 or +0 — the two +4 capped tends on the
pilot band, 99102 d51 and 99106 d78, said +8). Its logic
callers use the return as a mourning probe (`< gain` means
"grieving", because mourning returns 0), so the lie does not
corrupt the grieving-fire counts — but the say-line honesty
bug is real and is filed to sim-findings for a later arm.
This arm stays zero src/js.
