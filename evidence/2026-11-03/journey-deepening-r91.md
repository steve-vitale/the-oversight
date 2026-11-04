# journey-deepening r91 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-03T1845CST (lock 2026-11-04T01:06:26Z,
aligned to registry run_id 2026-11-04T01:07:08Z at 01:26Z — see flap note).
Base master@dbfeb63eb at worktree creation; worktree
`journey-deepening`. Rotation read 2 → deepening; 2→3 written at closeout
and verified by read-back. Prereg:
evidence/2026-11-03/journey-deepening-r91-prereg.md (committed with this
run; written BEFORE any seed ran). Seeds fresh 93401–93404, competent
policy (r90 driver lineage) + r91 transcript choice rotation, DAYCAP=100,
death-aware stop. Smoke seed 93400 × DAYCAP=45 proved the harness
(survived day 45, wave 3, meat chain fired, 0 mislabels; Liam's favor
arc coherent) and was deleted per the prereg. Main panel ran ~57s for
4 seeds.

**Infrastructure note (loud, not blocking):** a container-wide
intermittent EPERM write flap hit mid-run (~01:17–01:35Z, ~18 min).
Symptoms: smoke seed JSON + transcript left 0 bytes; registry heartbeat
writes denied (heartbeat frozen 01:10:24Z → 01:35:04Z, 25 min stale —
past the 15-min liveness threshold while this run was alive, disclosed
here so no successor misreads it as death); small probes failed
intermittently while other paths succeeded. Recovery, per the
local_write_flap_response playbook: probed before rewriting, waited
instead of hammering, deleted the 0-byte outputs, re-ran the
deterministic smoke (clean pass) once writes proved stable. One probe
misstep, disclosed: the playbook's `git update-ref refs/heads/probe`
probe was attempted in the worktree, which resolves refs into the MAIN
tree's .git — it FAILED (no ref created, main tree verified clean), and
was not repeated; worktree-local probes were used instead. The flap
also explains the slow registry/heartbeat behavior; no registry file
was force-edited, and the atomic-write discipline kept REGISTRY.json
intact throughout. Lock line 1 was aligned to the registry run_id so a
successor's lookup finds this run's tree.

## Panel verdicts (pre-registered, no re-scoring)

- **K-LESSON: 128/141 ok lessons** (93401 24/31, 93402 18/24 in just
  24 days, 93403 33/33, 93404 53/53). Teaching fires abundantly, even
  in a village that dies on day 24. Beast-trick teaching is the thin
  edge: asked 13/0/8/13, taught only 1/0/1/2 — villagers ask about
  beast tricks constantly and are taught rarely.
- **K-MARKERS:** experiment 2/3/8/2, traderDeep 2/0/0/0, moot
  40/10/15/18. Moots fire often; deep-knowledge lines are rare
  (only 93401, 2 lines) even though traderDeepN reaches 44 there.
- **K-LINKS: every late seed formed exactly one link and kept it
  active** (propose linked 1/0/1/1; 93402 died day 24, before the
  regional window — canon says regional before ~day 25 is
  impossible, so its zero is expected, not a failure). Standing at
  the last-living snapshot: 150 (93401), 199 (93403), 125 (93404) —
  all three past the wave-4 gate of 100. Scale regional on all three.
- **K-CODEX:** codexL2 3/6/2, sharedKnowN 58/33/23, traderDeepN
  44/22/0 at last-living snapshots. Villager plant knowledge is
  wildly uneven: mean 62.6 on 93401 but 1.7 on 93403 — the surviving
  93403 household (mechanic, wild-food forager, pharmacist) knows
  almost no plants each, while the village shared store holds 33.
  Knowledge lives in the shared store, not evenly in villagers'
  heads; reported as observed variance, not a defect claim.
- **Readiness (pre-collapse rule):** 93401 fully met (7 armored,
  8 armed, 25 tricks, 4 veterans, ready=true). 93403 unmet
  (armor/weapons/veterans short) despite standing 199; 93404 short
  armor/weapons. Standing and readiness do not move together.
- **W3-BASE (comparison only):** 93401 3/3 kills; 93403 1 kill /
  2 died / 2 fled with fought damage median 0.949 (damage close even
  in losses); 93404 1/1 kill; 93402 no wave-3 fights (died day 24).
- **W4 (descriptive only — NOT re-judged; r90 judged it today):**
  93401 1 fight / 1 kill; 93403 8 fights / 1 kill; 93404 0 fights;
  93402 0 fights. Not a verdict, recorded so the panel hides nothing.
- **M4 people: 9 transcripts sense-read, 0 senseless.** The
  pre-registered COUNT bar (>=10) is NOT met: 93402 died day 24 and
  produced no sittings (days 45/60/80 never arrived). Quality on the
  9 that exist is clean — see below. The count miss is a panel
  composition fact, not a conversation failure, and is not rounded up.
- **M5 winnable (descriptive, by endReason): 2/4 survived**
  (93401, 93403); 93402 lost day 24, 93404 lost day 86. Census-alive
  counts are NOT used as the survival proxy (r90 lesson: a lost
  village can still show roster alive).
- **STAY-GREEN: 0 mislabels** on all seeds.
- **Rotation held live:** max consecutive dlg:more/dlg:details
  picks is 2 in every transcript (proof-test bound + live
  confirmation). Luis day 80 and Amy day 45 both show the
  more,more,react,more,more shape — the picker rotates instead of
  spamming.

## Village assessment, in plain words

Two villages made it through the window and two did not — but all
three that lived past the first month climbed to regional standing,
formed a lasting link, and passed the standing bar for the fourth
wave. The knowledge economy moves: teaching never stops, moots
convene, links form and hold.

- **93401 (survived, day 101, wave 4, regional):** 8 alive —
  Simone the zookeeper, Regina the midwife, Fatima and Daniyar the
  paramedics, Amina the midwife, Mateo the barber, Ingrid the
  therapy aide, Elif the housekeeper. Readiness fully met, standing
  150, one seasoned link, shared knowledge 58, deep-trader
  knowledge 44. The model village of this panel: it did everything
  right and was still standing at day 101.
- **93402 (lost, day 24, village scale, wave 2):** nobody's
  deepening story — the village collapsed in the establishment
  window, before regional links are even possible. What it proves
  anyway: teaching starts immediately (18 good lessons in 24 days)
  and moots already convene (10). An early death, not a deepening
  failure.
- **93403 (survived, day 100, wave 4, regional):** 3 alive —
  Tanaporn the mechanic, Sara the wild-food forager, Maha the
  pharmacist. Standing 199, the highest in the panel, link active,
  but readiness unmet and villager plant knowledge near zero
  (mean 1.7). A village that climbed on standing and shared
  knowledge while its people individually knew almost nothing.
- **93404 (lost, day 86, wave 4, regional):** 1 left at the end —
  Ursula the tattoo artist. At its last living snapshot (day 85)
  it still had 3 people, standing 125, and an active link, and it
  taught 53 lessons without a single failure across the whole run.
  Amy the comic-shop owner is this village's human face: her
  research obsession, her question about the taken, and her
  returning food need across three sittings read like one person
  across three months, not three strangers.

What they knew: every village that lived past day 25 reached
regional scale with an active link and standing past 100. What was
missing: not teaching, not links, not standing — beast-trick
teaching (asked 34 times, taught 4) and, on 93403, readiness and
villager-held plant knowledge despite top standing.

## People check (all 9 transcripts read)

- Regina (93401, midwife): favor — clean a cut — commit → promised.
  Short, complete.
- Katarina (93401, journalist): favor → promised, then field
  teaching (a spring that runs clear, a map place) and a trap-line
  walk invite. A favor that opens into the world.
- Regina day 80 (hungry): opens "What do you make of this?" →
  food need stated plainly ("days since a real meal") → walk
  invite → stated. Hunger matches her mood; the want surfaces
  and is stated, not dodged.
- Jayden (93403, glazier): "Are you going to stay? With us. For
  real." → answered yes → eased shoulders → a line about
  Columbus, Ohio being "a direction, not a plan" → walk invite →
  engaged. Characterful, not filler.
- Rayan (93403, mushroom grower, grieving): comfort → "Is there
  someone here you don't trust?" → a perfect-Saturday memory
  ("Just — people") → "fun was whatever I could steal between
  shifts. Now fun is watching the fire and not being afraid."
  The strongest sitting in the panel.
- Luis (93403, mason, grieving): comfort deflects into gossip
  (a Hardened Duel win "on the cameras", Theo on the snares,
  Fawzy's brush with death) — the grief want never gets directly
  comforted, but the sitting is coherent gossip between grieving
  people, not a loop; final engaged. Noted, not flagged.
- Amy (93404, comic-shop owner, three sittings): day 45 research
  obsession ("I collect facts like other people collect food");
  day 60 the taken ("Have you heard anything? ... Even asking is
  more than the silence") → promised to ask the System; day 80
  the food need returns ("still on my mind") → promised. One
  person across three months — the continuity the sense bar asks
  for.
- No verbatim repeats anywhere (maxRepeat 1 on all 9); no
  fabricated shared history; every sitting ends promised, stated,
  or engaged.

## The blanks this run fills

1. **Transcript choice rotation (r90 blank 1) — FILLED.** The
   driver now blocks dlg:more/dlg:details after 2 consecutive
   picks in a sitting (proof 45/45 incl. the rotation cases;
   live transcripts confirm max streak 2). The r90 more-spam
   reel cannot recur by construction; the strict 0-senseless bar
   was kept, not softened.
2. **Telemetry baseline shape (r90 blank 2) — FILLED.** deepening.json
   reseeded from r90's own 4-seed panel sums (w3fights 18,
   engaged.w3 23, fightsTotal 60, fightsByWave.3 18) with an
   explicit _meta {n: 4, panel: "r90 93301-93304"} label; old file
   kept as deepening.json.20261103-pre-n.bak. This run's check is
   therefore a true 4v4 comparison (see below). Future panels with
   a different n must not compare against it without re-labeling.
3. **No game change.** The wave-4 kill gap, readiness-vs-standing
   split, and beast-trick teaching thinness are design calls for
   Steve / the winnability arms, not silent balance edits — this
   run documents them with per-seed numbers and leaves the levers
   alone (gates untouched, as ordered).

## Telemetry deviation check

`node scripts/telemetry-check.js` against the reseeded
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = r91 4-seed panel:
**QUIET (4 files, 4 metrics, no large deviations).** R91 sums:
w3fights 9 (baseline 18, -50%, under the 0.6 LOUD threshold),
engaged.w3 16 (23), fightsTotal 38 (60), fightsByWave.3 9 (18).
The lower totals are panel composition — 93402 lived 24 days
(1 fight) and 93404 fought only 3 times — not a disappearance
(no metric hit zero). Baseline NOT rolled forward: a quiet panel
with a 24-day seed is not a cleaner baseline than r90's
all-full-window panel, and rolling after every quiet panel would
churn the reference.

## Metric review

- **M4 count bar vs early death:** ">=10 transcripts" assumes every
  seed reaches day 45. A seed lost day 24 yields zero sittings
  through no conversation defect. Next run: keep the count bar
  but judge it over sittings the panel actually produced, with
  early-death seeds reported as producing none — or pre-register
  a replacement sitting (e.g. an extra day-45 sitting on a
  surviving seed) instead of silently counting a dead seed's
  absence as a conversation failure. Quality bar (0 senseless)
  unchanged: 9/9 clean.
- **plantsMeanAlive needs a definition note:** 93403's 1.7 vs
  93401's 62.6 may reflect census timing (final census on 3
  survivors) more than knowledge spread; next run should report
  the per-villager distribution, not just the mean, before
  claiming a knowledge-concentration finding.
- **Beast-trick teaching thinness (asked 34 / taught 4)** is a
  candidate next question, not a verdict: the 1+ counterTeachable
  lever may gate teaching on slain-and-unknown, which the panel
  did not decompose.
- No pre-registered metric was re-scored mid-run. K-LESSON,
  K-MARKERS, K-LINKS, K-CODEX, W3-BASE, M4, M5, STAY-GREEN are
  reported exactly as pre-registered.

## Harness

scripts/journey-deepening-r91-20261103.js (r90 lineage + choice
rotation; zero game-code change). Analyzer:
scripts/analyze-journey-deepening-r91-20261103.js (K-summary +
pre-collapse snapshot rule: last deedLog with pop > 0, last
readiness with armored+armed > 0). Proof:
scripts/test-journey-deepening-r91-instruments-20261103.js — 45/45
(classifier six classes + multi-monster partials, rotation
more/details/shared-budget cases, analyzer K fixture incl.
pre-collapse skips, medians, transcript scan). Per-seed JSONs and
9 transcripts: goal hidden_files evidence 2026-11-03
(journey-deepening-r91-seed9340*.json,
journey-deepening-r91-transcript-*.txt).

## Regression gate

`node scripts/check.js --quick` (with
--cacheDirectory=/tmp/jest-cache-playtest) produced no output in
~10 minutes (process alive, near-zero CPU — apparently waiting on
a shared lock/subprocess under concurrent-agent load, the same
signature as r90's hung gate) and was terminated rather than left
hung. This run changes zero game code (three new scripts files,
prereg + run note in evidence), and its relevant verification is
green: the r91 proof test 45/45 (twice — before and after the
header edit), driver/analyzer syntax checks, and five live seeds
run clean through the new instruments (smoke + panel). The full
quick gate is owed a re-run on a quieter tree, not a silent skip:
it is recorded here, not claimed.

## Verdicts

- **Reachable: yes.** Regional links, standing past 100,
  readiness met, wave-4 fights, moots, and deep-trader lines all
  occur under ordinary competent play without steering (links
  3/3 late seeds; standing 125–199; traderDeep lines on 93401).
- **Fun: yes, with a sharp edge carried from r90.** Villages feel
  alive — favors kept, grief spoken, gossip with continuity,
  one person's arc across three months — and teaching never
  stops. The edge is unchanged from r90 and is not re-judged
  here: fourth-wave fights remain the wall (descriptive 2 kills
  in 9 wild W4 fights this panel).
- **Winnable: progressing through this window, not through it.**
  The deepening window delivers everything upstream of the kill
  step — links, standing, readiness (on 93401), knowledge — but
  the wave-4 kill step itself is r90's open problem, confirmed
  in passing here, not solved here.
