# Journey leg: DEEPENING (days 40–80) R109 — "CONTROL ON THE POST-FIZZLE BASE, RE-ASK ADOPTED, FIZZLE-WATCH" — 2026-11-06

## Pre-registration (written BEFORE any seed runs; no game-code fix pre-registered)

Rotation read 2 (deepening) at run start; r109 plays deepening, writes 2->3
at closeout WITH verified write + retry (r106/r107/r108 rotation note:
verified-by-read-back writes stick; silent ones intermittently don't).
Closeout re-verifies the lock is still this run's and the rotation still
reads 2 before touching either (2026-11-06 AGENTS.md lesson: a later run
may already have moved them). Base: master 1e8db620d at worktree creation.
Policy: competent (r105 driver lineage, VERBATIM — see below).
Seeds: fresh 92905–92908. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 92909 (outside the main band) x DAYCAP=45 proves the r109
driver before the main run; smoke outputs deleted after the check.

Freshness check for 92905–92908 + smoke 92909 (full check per the
2026-11-05 AGENTS.md lesson + local_seed_band_freshness skill — ALL dated
preregs + all dated .md + evidence filenames + forbidden-band lists, not
just today's files): COMPLETED before the panel ran. Word-boundary .md
mentions of 92905–92910 across evidence/ + docs/: 0. Filename hits for
9290*: none. Boundary-aware seed-context patterns (`"seed": 9290x` /
`seed=9290x` / `SEEDS=…9290x` / `s9290x` across evidence/ + scripts/ +
docs/): 0 hits. Only prereg naming 9290x at all is r108's (92901–92904 +
smoke 92900). Band 928xx REJECTED (named in
evidence/2026-10-23/sim-storageshed-b6.md, used 92801–92816) — a used
band is not fresh even with no corpus behind it in this leg. 929xx is
absent from the tendbelow forbidden list (99001–99008, 99009–99024,
99041–99052, 99101, 99201–99216, 99217–99232, 99401–99412, 99601–99612,
99701–99708, 99801–99808, 98701–98716, 89701–89707, 83601–83800,
16101–16116, 99901–99912). Band 92905–92908 + smoke 92909 verified fresh.

## The question (SURV-CONTROL-3, primary — the control on the POST-FIZZLE base)

r108 closed at 3/4 survived on base cc4345e1e (funnel unchanged vs r107's
2/4 — variance, no claim). Since then master has gained game-code
landings: the FIZZLE-FIX (journey-succession r146: favor asks name the
live need instead of drying — convo-wants.js / convo-dialogue.js /
conversation.js), the sticky table offer (sim-tableoffer-b: offered seats
hold on a dipped bar, re-fire on recovery — table.js), the trial-moot
gate (sim-mootgate-a: moot convening gated on scholar at Haven —
betrayal.js), and narration-only gorge lines (sim-gorgeharness-a, no
mechanics change). None is expected to move survival in the deepening
window, but the flee-order fix taught this lane that a conversation
change can move fight-adjacent outcomes — so the funnel needs the same
driver control on the new base before any claim is made about it. This
run IS that control: the r105 driver VERBATIM (CONVO_DAYS [45, 60, 80],
DAYCAP=100, competent policy) on the current base with fresh seeds.

- **Verdict**: >=2/4 survive → funnel unchanged; the new landings did
  not move it. 0/4 survive → base moved; the next job is bisecting
  what changed since r108's base (no claim about which change until a
  bisect runs). 1/4 → ambiguous, no claim either way.
- **INTERESTING** if 0/4 (real drift — a regression to hunt) OR if
  >=2/4 with a different cause split than r108 (e.g. fight deaths down
  after the moot gate — descriptive, not a verdict on the gate, which
  is a sim-mootgate item, not this run's).
- The control is descriptive about WHY villages die (fight-heavy vs
  starvation, pantry at death, wave reached) exactly as r105/r106/r107/
  r108 reported it — a cause split, not a winnability verdict (fresh
  seeds, small panel).

## Secondary (RE-ASK — adopts r108's metric-review proposal)

r108's metric review proposed a RE-ASK class: a later sitting whose
opener re-states the same favor's need (the favor short re-appears in a
THEM line while the favor is still open), reported as thread continuity
alongside NAMED/SILENT. This run ADOPTS it. The re-ask opener vocabulary
is verified in src/js/convo-wants.js:1966 (the single re-ask opener:
`"About ${favor.short} — the need hasn't gone anywhere. I'm still
asking."`). Implementation in the r109 analyzer (classifyPromiseThreads):
a later sitting (same villager, later day) counts as a RE-ASK of the
thread when a THEM line matches the re-ask opener AND the extracted
favor short appears in the thread-opening sitting's THEM lines (the
short re-appears — Chloe r108: "the food I needed" in the day-45 opener,
re-asked day 60). Classification order: NAMED > NAMED-STRUCTURAL >
RE-ASK > SILENT. The old want-only rule is still computed as structOld
for continuity; the revised P-KEEP rule stands.

- **INTERESTING** if >=1 genuine RE-ASK thread on fresh seeds (the
  Chloe class confirmed live, not a one-off), or if a re-ask opener
  names a short that appears in NO earlier sitting with that villager
  (a re-ask without a thread — a different defect shape, reported
  separately as RE-ASK-ORPHAN).
- Chloe's r108 thread is NOT re-scored: r108 stands as SILENT.

## Secondary (FIZZLE-WATCH — does the FIZZLE-FIX hold in the wild?)

The FIZZLE-FIX (r146) claims favor asks name the live need instead of
drying into `"...Sorry, lost my train of thought."` This panel scans
every transcript for that dry line (classifyDryLines in the r109
analyzer), tagged by the sitting's want id. Verdict: 0 dry lines in
ask_favor sittings → the fix HOLDS in the wild on fresh seeds. >=1 dry
line in an ask_favor sitting → investigate WHICH line slot dried
(opener / why / goodbye / deflection) before any claim — a dry line in
a deflection slot is not the fizzle the fix targeted. Dry lines in
non-ask_favor sittings are reported as context only (the dry pool is a
legitimate ledger fallback elsewhere). Descriptive, no fix pre-registered:
a fix follows ONLY if a fizzle reproduces AND it is a clear ledger
defect with a proof test, disclosed as post-panel, not pre-registered.

## Carried context (reported, not re-judged)

- P-KEEP-REVISED (r108 adopted, now the standing rule): NAMED +
  NAMED-STRUCTURAL-revised; old-regex and structOld still reported.
- D-THING (r107 closed as a blank; carried as continuity): same scan,
  testable denominator (testable only when a later sitting with the
  same villager exists).
- RAJ-PHOTO watch: same scan as r108 (curious-plant abandonment).
  Two panels, two plants, both last-sitting cases — still no testable
  case; the watch question stays open.
- V-INIT-BOND (r103 primary, now carried): same scan, same
  definitions. Expectation 0 — nothing in this run touches bonds.
  build-bond-initiate is still NOT merged (branch exists, no merge
  commit); this run does not build it and does not touch it.
- G-SENSE: all transcripts read in full; senseless sittings counted
  (expectation from r108: 0). Any senseless sitting is read and named,
  not just counted.
- B-SIT / B-FOLLOW / B-LEAD (carried): betrayal sittings, follow-ups,
  and betrayal lead-ins, same scans as r108. The mootgate landing may
  move B-LEAD counts slightly — descriptive only.
- S-TRACE (carried): standing-trace verdict, same scan as r108.
- G-ASSIGN/G-STEER/G-STICK goalSnaps are collected by the driver for
  continuity but NOT scored: the goal question is closed for this
  window.
- Survival/descriptive: endReason, maxGameDay, wave reached, pop at
  end, per seed — the control's cause split (see above).
- STANDING CONTEXT (Steve 2026-11-06 11:48 CST, REWARD ALL PATHS, NOT
  JUST KILLING): the self-improvement drive must reward every path, not
  only killing; roles differentiate by personality; measure the drive by
  role formation across ALL five tracks (combat, field, social, craft,
  strange), not by kill counts alone. This run adds NO new metric for
  it — the village assessment carries a descriptive all-tracks read
  (G-LINES goal-top distribution per seed, mapped to tracks) and the
  run note records what it shows. A five-track role-formation
  instrument is a follow-up job, proposed in metric review, not built
  here.

## What this run does NOT do

- Does not build the NPC bond-proposer system (V-INIT-BOND). That is
  a builder brief, not a tweak; build-bond-initiate owns it in
  another worktree.
- Does not change succession release, seed priority, or the
  question-first-openings design question (Steve's call, not a tweak).
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.
- Does not touch win prices, deed gates, or any balance number.

## Metric review (required section in the run note)

No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
