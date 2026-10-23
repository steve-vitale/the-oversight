# sim-overcourt-restage — LINKFORM=2 overcourt confirm (run fleshout-20261023T2015Z, axis scale-onramp)

Worker tree sim-overcourt-restage. Namespaces: overcourtrestage-* (scripts/evidence/policy).
ZERO src/js. Do NOT touch scripts/policies/linkform.js (on master, env-gated
default-off) — this arm is a confirm; the layer stays env-gated default-off
regardless of outcome. Do NOT touch feastdisc-*, vetformation/vetstack/
formthick/vetrestage files, or the linksdiag pilot files (read-only).

Canon read first: docs/CANON.md + docs/SCALE.md (the scale ladder: six
national roads, the polity bars, the Regional Dawn; links form at trust 30,
season at 30d+trust 40).

Context (read first):
- evidence/2026-10-23/sim-links-diag.md — the pilot: linkform-cadence
  LINKFORM=1 NO-GO KILLED as the wrong lever (more dissolutions, more
  starvation); linkform-overcourt LINKFORM=2 NO-GO on the pre-registered
  reach bar but MECHANISM PROVEN: mean end dip 131.8 vs 76.5, 0 dissolutions
  vs 1/4, 4–5 links held vs flat 3.
- evidence/2026-10-23/sim-linkdissolve.md — dissolution attribution DIAG-GO;
  dominant channel SUCCESSION 6/7 (the −8 funeral haircut knocking a 41–46
  trust link below the 40 seasoned bar; the polity step-function dissolves
  the realm the same day). Its named next IS this re-stage (redundancy is
  the direct counter to funeral-hour single-link snaps).
- evidence/2026-10-23/sim-defer4gate.md — stand-raw wave-5 binding = dip+links
  zero 6/6; the diplomatic layer never engaged on the bound configs.

## PRE-REGISTRATION (§14 binding — set before any analysis or sims)

- **BINDING QUESTION:** does the mechanism-proven LINKFORM=2 overcourt lever
  (court to 5 subordinate links, tend all weekly) raise mean end dip by at
  least one full link on fresh seeds, under both the leadfeast and the
  belongfeast substrates?
- **Substrate pinned BOTH arms:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 (the pilot's
  census-armed base). Control = LINKFORM unset; armed = LINKFORM=2.
  ONE DELTA ONLY.
- **Seeds:** 68901–68912 (12 seeds; VERIFIED filename-fresh across evidence/
  + scripts/ before sweeping — 68401–68408 were the pilot block,
  68501–68508 are taken by loop-B arms; only float-noise/timestamp
  collisions found, no prior sim ran these seeds) × {leadfeast, belongfeast}
  × {control, armed} = 48 configs, 180d death-aware (dead villages stop,
  +10d tail max; never a fixed 200d).
- **PRIMARY (binding):** mean end dip per config — GO = armed ≥ baseline + 34
  (one full link), paired identical seeds/policies. A miss is NO-GO, never
  re-scored.
- **SECONDARY:** post-formation dissolution events (dip −102 steps after a
  formation event, the pilot's dip-step classifier on windowstay
  trajectories; carry the metric-review caveat about +34 single-link steps)
  — GO = armed < baseline.
- **GUARDRAILS:** median survival paired diff ≥ −15d; starvation ≤
  control+2; no new death kinds (≥2-event rule); wall block
  (national/table/wins, wave4/5, median survival) both arms.
- **§15:** panel judged inapplicable for policy-layer zero-src/js arms per
  the doorcensus/links-diag precedent — the paired identical-seed sweep is
  the instrument, the pre-registered bars the judge; the paired-comparison
  summary is attached below.
- **Sense:** on the highest-dip armed config, read the link/dip beats for
  meaning (SENSE-TESTING LAW) — never just counts.

## Results

(proof: scripts/test-overcourtrestage.js — 23/24... no: 23/23 GREEN before the
sweep, 23/23 GREEN after the classifier revision; anchor recorded per-seed.
Instrument: windowstay + w5gates-lib, UNMODIFIED. 12 identical seeds × 2
policies × 2 arms, 180d death-aware. Per-seed JSONs at
evidence/2026-10-23/perseed-overcourtrestage/<arm>-<policy>/ with
hash-after-write readback, 48/48 written, 0 errors, 0 instrument errors.)

### PRIMARY (binding): mean end dip per config — NO-GO

armed mean − control mean = **+18.4** dip points. GO bar: ≥ +34 (one full
link). **NO-GO** — honored as stated (§14, no re-scoring).

Per-policy split (analysis, not re-scoring):
- leadfeast (the pilot's exact pair): armed − control = **−11.3**. The
  control leg replicated the pilot EXACTLY (mean 76.5 both); the armed leg
  collapsed (pilot 131.8 → 65.2 here). The +55 effect did not replicate.
- belongfeast: armed − control = **+48.2**. Caveat: the two armed legs are
  near-identical policies (at LINKFORM=2 both = competent.daily +
  linkformCourtship — the road courtship is REPLACED; s68904 produced
  byte-identical dip trajectories on both legs), so the belong diff measures
  "lead-style overcourt courtship vs belongseek," not the lever against its
  own control. On the lever's home turf the effect reversed.

### SECONDARY: post-formation dissolution events — NO-GO

control **3** vs armed **6**. GO bar: armed < baseline. **NO-GO**.

Honesty note (metric undercount): the pre-registered −102 classifier missed
three armed full-polity collapses of −136 (s68904 both legs d111, s68906
leadfeast d138) — a 4-link polity losing all four links' points in one day.
True dissolution gap: control 3 vs armed **9**. The bar was NO-GO either way;
the revision ("any single-day dip drop ≥102 after formation") goes to metric
review for the next run.

### Guardrails

- median survival paired diff: **+13.5d** (bar ≥ −15d) — PASS.
- starvation deaths: control 8 vs armed 8 (bar ≤ control+2) — PASS.
- new death kinds (≥2-event rule): FLAGGED then CLEARED — "The Loud Beast",
  "The Mountain Lord", "Glasswing Darter" each had 2 events on armed, 0 on
  control, but each pair is 1+1 on the two armed legs of the SAME seed
  (s68903, s68910, s68911). The two armed legs are near-identical policies,
  so one rare-monster encounter per seed double-counts. Single-seed
  coincidence, not a lever effect — PASS with the caveat documented.
- wall block — control: national 11/24, table 19/24, wins 0/24, wave4 0/24,
  wave5 0/24, median 111d. armed: national 10/24, table 22/24, wins 0/24,
  wave4 0/24, wave5 0/24, median 132.5d. No lever moves the wall; the wave-5
  door stays shut on both arms (the veterans/armor coincidence trap is
  untouched by diplomacy, as the pilot found).

### Kill-discipline root cause — the lever is CONFIRMED WRONG for the channel

The lever's theory: redundancy — with 5 subordinate links, one link dipping
below the trust-40 seasoned bar no longer dissolves the polity (dip drops
34, not 102). The theory assumes INDEPENDENT single-link failures.

The sim-linkdissolve DIAG named the dominant dissolution channel:
SUCCESSION 6/7 — a funeral applies −8 to EVERY shaken link the same day.
The funeralcheck re-runs (scripts/overcourtrestage-funeralcheck.js) on the 5
dissolved armed configs reproduced the dissolution days exactly and
attributed ALL FIVE to succession:
- s68902 d80 (−102): funeral d79, all five links −8 the same day
  (55→47, 39→31, 42→34, 44→36, 32→24).
- s68904 d111 (−136): funeral d111, four links −8 (63→55, 55→47, 47→39,
  47→39) — two crossed below 40, the 4-link polity dissolved whole.
- s68906 d138 (−136): funeral d137, drops 46→38, 43→35, 45→37 (+95→87).
- s68909 d77 (−102): funeral d77, 53→45, 43→35, 43→35, 41→33 — the polity
  dissolved ONE day after forming.
- s68901 d139 (−102): a link sitting at EXACTLY the 40 bar took the funeral
  haircut to 35; the 3-link polity (already 4→3 after a d114 −34 seasoning
  loss) dissolved.

Because weekly tending (+8) holds every link in the 40–48 band, a single
funeral routinely knocks 2–4 links below 40 SIMULTANEOUSLY. Redundancy to 5
raises the single-day failure threshold from 1 link to 3 — but the correlated
shock delivers exactly that. The pilot's 0-dissolution result was an 8-seed
luck-of-the-funeral-draw. **The lever does not counter the actual channel;
confirmed wrong, not noise.** Per the task, the layer stays on master
env-gated default-off regardless — no code change, no kill to land.

The lever that WOULD counter this channel is trust-buffer (tend links into a
band ABOVE the funeral haircut, e.g. 50+, so −8 never crosses 40) or
succession grace for shaken links — not more links in the same fragile band.
Documented as a backlog item, not built (out of this arm's scope).

### Sense verdict — EARNED, and it names the real blank

Full beat transcript: evidence/2026-10-23/overcourtrestage-sense-s68912.txt
(193 beats; the weekly tended/tribute-waiver lines repeat honestly in the
background).

The highest-dip config reads like people, not counters. Four subordinate
links form in nine days (d25–34), each greeted with the accord gift and
unprompted aid ("Gave Stonebridge 1,548 kcal aid. Credit stands."). A funeral
strikes ten days in (d35: "Young link: grief delays the verdict — a
renegotiation is staged"), and the realm answers it aloud (d42: "Seven days
of silence answered for Haven"). The First Court sits at d77 over a real
5,048-kcal shared granary feast. The fifth link — Emberhold, the redundancy
the lever was built for — joins at d83.

Then the control case for the entire run: at d176 a funeral hits and ALL FIVE
links "pressed tribute down in Haven's chaos" — the exact same correlated
shock that dissolved the young realms. This realm survives it (end dip 170,
180 days). Why is legible in the numbers: by d176 these links have been
tended weekly for 100+ days and sit at 60–95 trust; the −8 haircut never
threatens the 40 bar. The young realms died because their links sat at
40–48 — one funeral's reach.

The fiction is honest about all of it: the beats say when the realm is
fragile ("grief delays the verdict") and when it is deep ("pressed tribute
down" — they leveraged the chaos, the bonds held). No #734-class
mislabeling. The sense read CONFIRMS the kill-discipline conclusion and
sharpens it: the blank is not "more links" but "deeper links before the
funeral comes" — trust buffer above the haircut, i.e. the backlog's
trust-buffer/succession-grace lever. A 5-link realm of 40-trust links is five
ways to die at once; a 3-link realm of 70-trust links is a realm.

## Metric review

1. **PRIMARY bar (+34):** the right instrument — it caught the non-replication
   cleanly. The control leg's exact replication (76.5 = pilot) proves the
   substrate was stable; the miss is the lever's, not the setup's. No revision.
2. **SECONDARY bar (−102 steps):** UNDERCOUNTS — three armed −136
   full-polity collapses missed. Proposed revision for the NEXT run:
   post-formation dissolution = any single-day dip drop ≥102 after a
   formation event. (Would not have changed this verdict: 3 vs 9.)
3. **+34 seasoning caveat (carried from sim-links-diag):** HELD — the
   classifier's formation-only window behaved; the E6d/E6e RED→GREEN fixtures
   pin it. s68904/s68906's +34 seasonings (d71) correctly did not open the
   window; their −136s were counted as collapses only via the honesty note.
4. **war-composite class:** WORKED — +45/+50/+70 raw-trajectory steps named
   per the DIAG's rule; zero unattributed steps across 48 configs.
5. **§15:** panel judged inapplicable (policy-layer, zero src/js) per the
   doorcensus/links-diag precedent. The paired identical-seed sweep was the
   instrument; the pre-registered bars the judge. Paired-comparison summary
   attached at evidence/2026-10-23/perseed-overcourtrestage/paired-comparison.md.

## Blanks filled / documented

- FILLED (measured): LINKFORM=2 does NOT replicate — NO-GO on both binding
  bars on 12 fresh seeds (primary +18.4 < +34; secondary armed 6 > control 3).
- FILLED (measured, root cause): all 5 armed-leg dissolutions attribute to
  the succession channel (correlated multi-link funeral shock); the lever's
  independence assumption is wrong for the actual channel. Kill-discipline
  satisfied: the lever is confirmed wrong, not merely unlucky.
- FILLED (measured): the two armed legs (leadfeast/belongfeast bases) are
  near-identical policies at LINKFORM=2 — the road courtship is replaced,
  not augmented. Future two-road confirms must account for this.
- DOCUMENTED (backlog): the counter-lever for the succession channel is
  trust-buffer or succession grace, not link count. The −102→≥102
  dissolution-classifier revision. Break-channel wild data (still zero
  breakLink dissolutions anywhere).
- CORRECTED: the pilot's "0 dissolutions" was funeral-draw luck, not lever
  strength — the control replication (76.5 exactly) rules out substrate drift.

## Village assessment (plain words)

Haven courts hard under the overcourt policy — four subordinate links formed
in nine days on the best seed (Stonebridge, The Hungry Road, Thornfield, The
Red Table II, d25–34), each greeted with a 2,000-kcal accord gift and weekly
grain. The beats read like people: aid given "credit stands," tribute waved
home when "our shelves are full past tomorrow," a young link's grief
staging a renegotiation, the First Court sitting down to a 5,048-kcal shared
granary feast. But the realm is built on a knife's edge nobody can see: every
link is tended to the same 40–48 trust band, and when a speaker dies, grief
takes −8 from every link at once. Twice in twelve runs the realm dissolved a
day after it formed — the third link had barely seasoned before the funeral
came. The villages that survived to 180 days are the ones whose funerals
happened to miss the courtship season. Nobody starved more than baseline;
nobody found a new way to die. The wall didn't move: 21 of 48 configs reached
national at some point, the table waited on most, nobody won, wave 5 stayed
shut. Diplomacy is a fair-weather engine — it works until grief arrives, and
grief always arrives.
