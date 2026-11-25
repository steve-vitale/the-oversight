# sim-muster-b — prereg (frozen 2026-11-24 ~21:45 CST, BEFORE any judged sim)

## Question
Can any village assemble 10 allied blades — the titan muster — WHEN the
call is sounded? (Tracker winnability-chain blank #2; the verdict of
sim-titanmuster-b names this arm explicitly: "a call-sounding instrument
(a policy that sounds the call, or a staged probe that builds a muster
and reads the count) — NOT another corpus re-read. Reachability of 10
under a sounding policy is still unmeasured.")

## Background (why this is a sounding-policy measurement, not a re-read)
- sim-titanmuster-b (evidence/2026-11-24/sim-titanmuster-b.md, DIAG-GO):
  on the tbrefuse band (16 seeds 109310–109325, 150d, competent verbatim)
  the call is NEVER sounded (0 soundings), muster count is structurally 0
  (have=0 on all 76 titan refusals, need 10), villages had 5–10 living
  people on refusal days. The zero is "no call, no muster, no count".
- The sounding stack already exists as policy-only prototypes, each
  proven on other bands — this arm COMPOSES them, it does not invent
  them:
  - titanroute (march to the heard lair tile + sound the call once,
    `Game.soundTitanCall('herald')`) — sim-titanroute-a.
  - musterclose (deepen one own link pre-call toward trusted-and-current,
    trust >= 70 / opinion >= 10 / arrears 0, so it answers at quota 6
    instead of 2) — sim-musterclose-a.
  - mustergap (one two-tap commit-own episode after the call,
    `Game.titanCommitOwn('herald')` twice in one daily) — sim-mustergap-b.
  - commitrefresh (re-commit Haven blades after a drop below last-seen,
    while the gate is unmet) — sim-closedecay-a.
  - sim-closedecay-a measured the full stack (closecommit/refresh) on
    seeds 97330/97338: call-day gates 11 and 9 (8 allied + 3 Haven;
    6 allied + 3 Haven). The stack CAN close the gate on some seeds.
    What is unmeasured is the muster-count DISTRIBUTION on a matched
    band against a never-sounding control — which is this arm.
- Mechanism (read in code, src/js/titans.js): `soundTitanCall` (~862)
  creates the muster record; allied links answer by trust/opinion/
  arrears (refuse < 25 trust, < -10 opinion, or arrears > 0; quota 6
  when trusted >= 70 trust / >= 10 opinion, else 2 — cfg defaults
  ~928); the call does NOT auto-commit Haven (2026-10-13).
  `titanCommitOwn` (~1029) is a two-tap player verb, up to 3 Haven
  blades, costly (leave the workforce, 1000 kcal/day each, can die).
  `titanMusterBladeCount` (~1517) counts unique living allies +
  committed Haven blades; `titanMusterReady` (~1525) is count >=
  `def.minAllies` (10 for heralds).
- NO NARROWING (stated up front, per the brief): `titanCommitOwn` IS
  reachable from policy — mustergap and closedecay already call it
  from policy (two taps in one daily, exactly as the button offers).
  This arm therefore judges the FULL 10 (allied + Haven), never the
  allied leg only. If the commit verb had proved unreachable, the arm
  would have become a staged-probe DIAG with its own bars, recorded
  here BEFORE judging — it did not; the sounding policy builds.

## Policy (new composition, POLICY ONLY — zero src/js changes)
`scripts/policies/muster-sound-b.js` — `competent` wrapped, in order:
`titanroute` → `musterclose` → `mustergap` → `commitrefresh`
(id `muster-sound-b`). Each leg keeps its own perception-law guardrails
(heard lair line only; own links only; own muster record only; no
monster/allied rosters read by any leg). No RNG is consumed by the legs,
so arm/control trajectories differ ONLY through the sounding actions
and their consequences. The control leg is the EXISTING tbrefuse corpus
(competent verbatim, same seeds, same 150d) — no control re-run; the
before/after is paired per seed.

## Corpus / seeds / horizon
- Control (already recorded, not re-run): `evidence/2026-11-24/
  perseed-tbrefuse-b/tbrefuse-b-s10931{0..9,20..25}-tbrefuse-b-v2.json`
  (16 -v2 files only), 150d, competent verbatim. Control wall numbers
  computed from the corpus 2026-11-24: wins 0/16, national 0/16
  (regional 15, village 1), median gameDays 151, village-lost 5/16,
  maxWave w5 6/16 / w4 9 / w3 1, starvation deaths 10 total, total
  deaths 1310. Herald-meeting seeds (titanmuster): 109317, 109318,
  109319, 109320, 109321, 109325 (76 titan refusals).
- Sounding leg (this arm): same 16 seeds, same 150d, death-aware
  (runDays ends early on village loss; dead villages stop simulating).
  Horizon 150d because it is IDENTICAL to the control (paired design)
  and the control's herald meetings/refusals all fall inside it; the
  call→contact window on closedecay was ~13 days after a call day
  ~97–113, inside 150d.
- Pilot (8 seeds, judged before ANY confirm spend): the 6 herald
  seeds + 109310 + 109311 (non-herald seeds carry the cost bars).
  Confirm (8 seeds): 109312–109316, 109322–109324.
- Seed freshness (checked 2026-11-24 before freezing): grep over
  scripts/*muster* scripts/*closedecay* scripts/*titanroute* and dated
  evidence filenames finds NO prior sounding-policy run on
  109310–109325 (titanmuster was a corpus re-read; closedecay ran
  97330/97338). The tbrefuse band is the natural control and is unused
  by any sounding arm — no fresh band is needed.

## Primary metric
Per-seed MAX JUDGED GATE: max over the run of (living-unique allied
blades + valid Haven blades) under the engine's own rule
(`titanMusterReady`'s rule, replicated driver-side AND read from the
engine flag alongside, so any replication drift is visible — the
closedecay gateDecomposition pattern). Herald-gate reachability =
seeds with max gate >= 10, out of the 6 herald-meeting seeds and out
of all 16. Secondary per-meeting read: gate at each herald attempt /
titan refusal after sounding (reported only where contact occurred
in-window; the primary metric needs no contact).

## Frozen bars (GO requires all five)
- B1 — instrument complete: per-seed files for 16/16 seeds with call
  record, daily gate trace after the call, attempt/refusal gate
  snapshots, and wall numbers; >= 14/16 seeds with zero blocking
  instrument errors (errors that prevent gate classification).
- B2 — the call sounds: sounded on >= 3 of the 6 herald-meeting seeds.
  PILOT GATE (before confirm spend): sounded on >= 2 of the pilot's
  herald seeds (pilot holds all 6). If the pilot gate fails, STOP,
  diagnose why the march/call never fires, and do NOT confirm.
- B3 — reachability answered with numbers: the max-gate distribution
  is reported per seed (allied-at-max + Haven-at-max + day of max),
  the >= 10 fraction is stated, AND the binding constraint is named
  with numbers for the short seeds (allied ceiling vs Haven ceiling
  vs call never sounded vs decay after sounding). The DIRECTION of the
  answer does not flip GO/NO-GO: a complete 0/6 reachability with the
  constraint named is GO (the measurement answered); NO-GO is an
  instrument failure, never a disappointing count.
- B4 — cost bars (sounding leg vs control on identical seeds):
  median gameDays >= 120d (control 151) AND village-lost <= 7/16
  (control 5/16, allow +2) AND starvation deaths <= 20 total
  (control 10, allow +10 for the muster upkeep + march). A breach
  means the sounding policy kills villages and the reachability read
  is not a fair one — NO-GO.
- B5 — panel (§15): before/after through `scripts/balance-panel.js`
  `compare` on pseudo-panels built from the two per-seed corpora
  (scripts/build-muster-b-panels.js, aidleave-b builder pattern;
  pseudo-policy `muster-b`, case identity = seed, paired design).
  Contract metrics mappable from both corpora: won, national,
  survival30/60, communityLost, villageDeaths. The panel is the
  instrument; the frozen bars above are the judge. The compare .md
  is attached to the evidence file.

## Verdict rule
GO if B1–B5 pass (reachability stated with numbers either way).
NO-GO if B2 or B4 fails (the call does not sound, or the sounding
policy kills villages) or B1/B5 cannot be produced (incomplete
instrument). DIAG-GO/DIAG-NO-GO do not apply: this is a measurement
arm with a sounding policy, not a corpus DIAG.

## Sense-test (SENSE-TESTING LAW)
Read the transcripts: the call line, the per-link answer/refusal
lines, the commit lines. Judge meaning and coherence: does the
village see the call go out and people answer by name, or does the
muster read as a number? Quote the call-day lines for at least one
seed in the evidence file.

## Metric review (to be filled in the evidence file, NOT re-scored here)
- Whether max-gate-over-run is the right reachability read, or
  whether gate-at-contact is the honest one (a gate of 11 that decays
  to 8 before contact, closedecay-style, is a different fact).
- Whether the pilot's herald-seed selection (all 6 in the pilot)
  biases the pilot gate, and whether the confirm seeds add anything
  beyond cost-bar coverage.
- Whether the pseudo-panel contract metrics (no playerDeaths, no
  gear metrics) understate the sounding policy's cost.

## Next step (for the round record, not this arm)
If 10 is reachable under the sounding policy, the next question is
gate-at-contact (does the muster SURVIVE to the fight — the
closedecay decay question on this band). If 10 is unreachable, the
next question is the binding ceiling (allied quota vs Haven cap vs
link trust) and which lever moves it.
