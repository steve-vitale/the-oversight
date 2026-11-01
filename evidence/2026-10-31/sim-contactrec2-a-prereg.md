# sim-contactrec2-a — PRE-REGISTRATION (written BEFORE any judged sims)

Run: fleshout-loop-a-20261101T0125Z, arm sim-contactrec2-a.
Axis: scale-onramp (converging, NOT converged). Arm type: DIAG /
instrument ONLY — ZERO files under src/ change in this branch
(sibling arm sim-contactfinish-a owns game-code changes to
src/js/fieldFights.js this run; this arm stays independent of
it). It does NOT touch sibling Loop B's food-economy work or
any other worktree. Main tree at ~/workspace/the-scattering
untouched. Worktree: ~/workspace/worktrees/sim-contactrec2-a
(branch sim-contactrec2-a).

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (wave 3: 9 monsters, HP
240-420 in data; break line 15% for wave >= 2), evidence/
2026-10-31/sim-contactbreak-a.md (esp. "Unclassified rows" +
"Metric review"), sim-contactrec-a.md + sim-contactrec-a-prereg.md,
sim-spikecontact-a.md + sim-spikecontact-a-prereg.md (esp. the
HP-capture preference order: pre-call entity HP, then
rec.mHpStart/rec.mMaxHp emission, then evade-only exact fill;
and the rule that mHpStart is NEVER derived/invented for
fought rows).

## The inherited gap (numbers, not re-litigated)

Contactbreak corpus: baseline 15 unclassified rows, all
missing mHpStart/mMaxHp, 9 of them contact-shaped on visible
fields (outcome evade, rounds 0, mDealt 0); lever 7
unclassified, 4 contact-shaped. So the judged contact share
was a FLOOR, not a point estimate (baseline 27-36/104, lever
0-4/71). Spikecontact's prereg states the contact-finish
BUILD must not silently inherit a floor. This arm closes that
gap for the next BUILD judgement.

## Code reading done BEFORE this prereg (no sims run yet)

In current fieldFights.js (this branch's base):

- Members construction (~lines 638-642): for pi == 0 with a
  world entity m, php = m.hp and pmax = m.maxHp; for ephemeral
  (m null), php = lroll(hpDef) inside [lo, hi] and
  pmax = max(php, hpDef[1]) = hpDef[1] exactly.
- Emission (~lines 643-644): rec.mHpStart = members[0].hp,
  rec.mMaxHp = members[0].maxHp, placed immediately after
  members construction and BEFORE every return path below it
  (no `return rec` inside fieldFight precedes it).
- Awareness evade return (~lines 833-838): outcome 'evade',
  rec.mHpLeft = members[0].hp, then return. It follows the
  emission, and no damage has landed before it (it precedes
  ambush, volley, and all rounds). Therefore, for an evade
  row, opening HP = rec.mHpLeft EXACTLY, and for an ephemeral
  evade, max HP = mdef.hp[1] EXACTLY — both provable from
  engine order, not estimated.

Consequence, stated before any sims so it cannot be re-read
as a post-hoc excuse: the evade-row gap is closable
POLICY-SIDE, with no game-code change. The candidate
recorder below therefore deliberately does NOT read the
src emission at all: it proves the evade gap closes without
depending on the sibling-owned src/js/fieldFights.js file.
If the candidate leg nevertheless fails to capture >= 90%
of fresh-pilot evade rows, the fallback is outcome (b)
below — an exact game-code spec, never a game change made
in this branch.

## Two-outcome plan (binding)

- Outcome (a) POLICY-SIDE FIX LANDS: the candidate recorder
  (scripts/policies/contactrec2-diag.js, my own copy-named
  file — no spikecontact/contactrec/contactfinish recorder
  or analyzer file is edited) captures evade-row HP
  policy-side via: (1) pre-call world-entity HP when m is
  non-null; (2) evade-only exact fill mHpStart = rec.mHpLeft
  and, when m is null, mMaxHp = mdef.hp[1]. The emission is
  never read. Rule (2) NEVER fills a fought row's mHpStart
  (unrecoverable post-hoc); the m-null band-top max is an
  equality from members construction, not a derivation, and
  is the same proof contactrec-a used.
- Outcome (b) EXACT GAME-CODE SPEC: if (a) fails, deliver a
  BUILD-ready spec naming file, function, line region, which
  value is available at that point, what the emission must
  capture, and why the policy side cannot see it — with the
  gap quantified on the fresh pilot (evade rows total,
  HP-missing share, contact-shaped share). A precise spec is
  a DIAG-GO outcome here, not a failure; a vague spec is
  not. Under NO outcome does this branch edit src/.

## Instruments (all new copy-named files; nothing existing edited)

- scripts/policies/contactrec2-diag.js — copy of
  spikecontact-diag.js with env CONTACTREC2, store/function
  names swapped, captureHp changed ONLY by deleting the two
  emission-fallback lines, plus captureHp exported for the
  proof test. All other captured fields identical
  (instrument fields, parsed strikes, wave >= 3 logs slice
  200), so the candidate leg is directly comparable to the
  baseline leg and the BUILD-universe sensitivity (D4) is
  computable on both legs with the same analyzer logic.
- scripts/contactrec2-sweep-20261031.js,
  scripts/contactrec2-split-20261031.js — copies of the
  spikecontact sweep/splitter, recorder module + env name
  swapped, same stdout-only I/O discipline.
- scripts/contactrec2-contact-20261031.js — copy of the
  spikecontact contact analyzer (requires the contactbreak
  classifyRow unchanged), reporting CONTACT/FOUGHT/
  UNCLASSIFIED, evade-row HP capture, instrument split,
  BUILD universe, lie rate, and the spear-inclusive
  sensitivity (spear rows: ranged slot holding a hunting
  spear, engine isRangedWeapon range > 1 — counted as
  no-instrument in the primary, spear-inclusive in the
  sensitivity, exactly as spikecontact did).
- scripts/contactrec2-det-20261031.sh +
  scripts/contactrec2-det-compare-20261031.js — det-gate
  (recorder ON vs OFF, candidate recorder) on 2 pilot seeds.
- scripts/test-contactrec2-20261031.js — proof test: real
  captureHp cases (evade m-null, evade m-present, fought
  m-null with emission present in rec proving the emission
  is ignored, fought rows never filled), file-content
  assertions (candidate file contains no emission read),
  classifier cases, and corpus reconciliation on both
  judged legs once the analyses exist.

## Seed plan (fixed now; no band-shopping)

- CONTROL-DRIVER STEP (before judging): run the prior
  instrument verbatim — scripts/spikecontact-sweep-20261031.js
  with SPIKECONTACT=1 — on 2 pilot seeds (87104, 87127) on
  this base, to a worktree scratch dir deleted before
  commit, and compare dayHash arrays + end fields
  (gameDays/won/national/table/maxWave/endScaleRank)
  against the spikecontact judged pilot corpus
  (evidence/2026-10-31/perseed-spikecontact-fresh-pilot/)
  for the same seeds. Report match/divergence; seeded
  trajectories are base-pinned (see sim-findings), so a
  match licenses citing the spikecontact pilot numbers as
  same-trajectory evidence at that scope, and a divergence
  is reported as base movement, never averaged away.
- BASELINE LEG: the spikecontact recorder used verbatim
  (scripts/spikecontact-sweep-20261031.js, SPIKECONTACT=1),
  8 seeds, judged corpus evidence/2026-10-31/
  contactrec2-baseline.jsonl + perseed-contactrec2-baseline/.
- CANDIDATE LEG: the contactrec2 recorder
  (scripts/contactrec2-sweep-20261031.js, CONTACTREC2=1),
  same 8 seeds, judged corpus evidence/2026-10-31/
  contactrec2-candidate.jsonl + perseed-contactrec2-candidate/.
- FRESH PILOT seeds (8 = twoblow/spikecontact pilot set):
  87104, 87109, 87119, 87124, 87140, 87115, 87123, 87127.
- No confirm leg is pre-planned: the pilot band is the
  judged band for a DIAG arm; if the pilot yields zero
  evade rows, D2 is vacuous and that is reported as such,
  not padded with extra seeds after seeing the result.

## Policy stack (identical for both legs except the recorder)

withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1, plus SPIKECONTACT=1 (baseline) or
CONTACTREC2=1 (candidate). NO game lever, NO policy edit
beyond the recorder wrap. The recorder wraps OUTSIDE
fullseat-diag, as spikecontact did.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to spikecontact/twoblow:
wave-3 doors opened late and villages lived with wave 3 for
tens of days on prior bases, so a shorter cap would censor
the meeting tail; the death-aware stop keeps cost at the
survival distribution.

## GO thresholds (DIAG — all must hold; a miss is DIAG-NO-GO)

- D1: 100% of fresh-pilot wave-3 rows classified CONTACT
  vs FOUGHT or explicitly UNCLASSIFIED with reason, counts
  reconciling to corpus totals, on BOTH legs.
- D2 (fix-or-spec): EITHER (a) the candidate leg
  classifies >= 90% of fresh-pilot evade rows (HP fields
  captured, contact-shaped evades resolved to CONTACT or
  FOUGHT by the unchanged classifier, no invented HP —
  state the capture point and prove no derivation), OR
  (b) an exact game-code spec as defined above, naming
  file/function/line region + the value available there +
  why the policy side cannot capture it, with the gap
  quantified (evade rows total, HP-missing share,
  contact-shaped share on the fresh pilot).
- D3 (det-gate / instrument purity): recorder ON vs OFF
  byte-identical dayHash arrays + end fields on 2 pilot
  seeds, and one judged pilot seed re-run byte-identical
  to its judged JSON.
- D4 (BUILD-universe sensitivity): restate the spikecontact
  BUILD universe on your fresh pilot band with evade rows
  resolved — evade CONTACT meetings are avoidances,
  excluded from the drive-off BUILD universe; report
  whether the finishable mFlee count (and the
  spear-inclusive sensitivity) moves vs spikecontact's
  14/17/20, and say plainly whether the BUILD prereg
  numbers need restating.

## Sense-testing (SENSE-TESTING LAW)

Read at least 4 evade/contact transcripts in full from the
fresh pilot — do the newly captured HP values match what
the narration implies (a beast narrated as broken should
read broken in HP)? Report any mismatch as a finding, not
a rounding.

## Wall numbers (on the judged band, per leg, never pooled)

National / table / wins, wave-4, wave-5, full seat, median
+ max survival. Arc reach, four-realm formation, trap
acquisition, counter discovery, young-link succession are
NOT in this corpus — reported as unmeasured, never as zero.

## If DIAG-NO-GO

The instrument files are retained as measurement tooling
(they contain no game-code change); the evidence states
which bar missed and what the next arm must fix before the
numbers are citable. No src/js file is touched in any
outcome.

## If DIAG-GO: landing

Message WITHOUT [needs-eyes] (instrument-only, no feel
change). Report 'ready to merge, pending coordinator
(--ff-only merge; the batch ship job owns pushes)' with
branch tip, evidence path, pilot numbers, and GO/NO-GO
verdict. Do NOT push, do NOT bump versions, do NOT verify
live. Do NOT merge to master yourself. If master moved
under this branch via sibling landings, report the branch
tip and that a rebase onto current master + proof re-run
is needed at landing.

## Metric review (to be filled at evidence time)

- Did the candidate recorder close the evade gap without
  the emission, and did trajectories stay put (det-gates)?
  Did fought ephemeral rows remain unclassified on the
  candidate leg, and what does that remainder mean for a
  BUILD judgement (which recorder should the BUILD use)?
- Did the fresh-pilot BUILD universe move vs spikecontact's
  14/17/20, and does the BUILD prereg need restating?
- Did any newly captured evade HP contradict its narration?
- Did the control-driver step match or diverge, and what
  does that say about citing spikecontact's pilot corpus
  on this base?
