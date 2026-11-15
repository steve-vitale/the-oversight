# sim-gorgeprice2-b — CONFIRM GO (second judgment, corrected bar)

Loop B run `fleshout-loop-b-20261115T1330Z`, axis winnability chain, arm
sim-gorgeprice2-b (cascade gorge-pricing follow-up). Branch
`sim-gorgeprice2c-b` (adoption branch; the dead 1130Z run's branch
`sim-gorgeprice2-b` is untouched — the reaper owns it). Base: master
`a9d85e32c` (H1 transplant 7redef landing). Binding prereg:
`evidence/2026-11-15/sim-gorgeprice2-b-prereg.md` — bars FROZEN there,
judged here without alteration.

## Adoption + dead-run recovery (header record)

- The 1130Z run died mid-confirm (worker cancelled 14:02:20Z, no
  process alive, old tree unwritten since). The coordinator verified
  and copied its corpora into this tree as untracked files: confirm
  control 16/16 (seeds 100521–100536) and confirm armed 2/16 (seeds
  100521, 100522). This run re-validated all 18 files (parse + seed +
  policy) and validated the control corpus behaviorally: 37
  same-instance pairs and 36 gap-0 followers — the lever-OFF
  signature (pilot control: 34 pairs / 8 seeds; cascade confirm
  control: 41 pairs / 16 seeds). The control is genuine lever-off
  despite its anchor being a branch tip (the dead run's worker ran
  the control leg with the guard reverted, as the pilot did — anchor
  records HEAD, not worktree state).
- Rebase: the adopted branch (5 kept commits) rebased cleanly onto
  `a9d85e32c` (new hashes `229583083`–`583a462ce`). First rebase
  attempt failed on a transient git lock ("could not detach HEAD",
  no lock file on disk — a sibling git operation held it
  momentarily); retry succeeded immediately. Before judging, the
  control corpus was re-verified against the new tip:
  `git diff --stat 1ca2c257d..a9d85e32c -- src/js` = 0 changed files
  (the 7redef landing added evidence/corporas only), so the control
  stands — no control re-run. The lever static re-verified on the
  rebased tip: `src/js/game.js` diff vs master is ONLY the guard
  hunk (+16 lines), `scripts/test-gorgeprice2-b.js` static green.
- Proof tests re-run on the rebased branch, all green before any
  sweep: `test-gorgeprice2-b.js` 4/4, `test-gorgeprice-b.js` 4/4,
  `test-cascade-b.js` 4/4.
- Deviation from the adoption brief, recorded: the brief said
  `OUTDIR=perseed-gorgeprice2-b-on`, but that is the COMMITTED pilot
  armed dir (seeds 100501–100508) — writing confirm seeds there
  would have mixed pilot and confirm bands in one analyzer read and
  polluted a committed corpus. The dead run's worker had already
  used `perseed-gorgeprice2-b-confirm-on` (where the coordinator put
  the copied 100521/100522 files), so this run wrote the confirm
  armed leg there. The first sweep was started with the brief's
  OUTDIR, killed after 4 seeds (100523–100526, all valid, anchor
  `583a462ce`), the 4 files moved into the confirm dir, and the
  remaining 10 seeds (100527–100536) run with the corrected OUTDIR.
  No seed was run twice; the confirm armed corpus is 16/16 in one
  dir. The pilot armed dir is back to its committed state (verified
  `git status` clean there).
- No write flap in this run. No `git status` dirt at any point
  except the intended new files.

## The lever (unchanged from sim-cascade-b)

**LINGERER HOLDS THE TREELINE** (`src/js/game.js`, `monsterTurn()`):
when the player-tile monster is a lingering raider, `monsterTurn()`
returns early — it does not step onto the scholar and does not start
turn-based combat on contact. The scholar may still walk up and
press Fight (`startCombat` untouched), the sortie still fights it
(`fieldFight`), the nightly gorge and the ~6-night drift valve are
untouched, non-lingering intruders still breach as before. Nothing
despawns. Policies byte-identical.

## Verdict: CONFIRM GO

Judged by `scripts/analyze-gorgeprice-b.js` `computeBars(control,
armed, { rateFloor: 0.5 })` — the FROZEN corrected bar. Confirm band
100521–100536, 150d, policy `competent-answercourt-b`, 16 paired
seeds. **GO: P1 passes, all three cost legs pass.** The verdict
also holds under the OLD unfloored bar form (starvation rate ratio
0.992 ≤ 1.25) — this confirm is not an artifact of the floor.

**The 1055Z NO-GO under the old bar and the 0930Z NO-GO under the
pooled-count bar STAND as judgments under their own bars.** This is
a new judgment under the corrected bar form on fresh seeds, never a
re-score. Under the corrected bar the lever is a LANDING CANDIDATE;
the coordinator lands it.

## Confirm numbers (16 seeds, 100521–100536)

| Metric | Control | Armed | Bar / read |
|---|---:|---:|---|
| P1 (pooled scholar `the wild` deaths / national-days-live) | 0.1216 (95 deaths / 781 nat-days) | 0.0565 (66 / 1168) | ratio **0.465 ≤ 0.6 — PASS** |
| Starvation pooled | 5 | 6 | tripwire 6 ≤ 5+2 — **PASS** |
| Starvation rate / 100 lived-days | 0.261 | 0.259 | floored ratio 0.518 ≤ 1.25 — **PASS** (unfloored 0.992 — also pass) |
| Median survival (days) | 127.5 | 150 (horizon cap) | ratio 1.176 ≥ 0.8 — **PASS** |
| Same-instance repeat-killer pairs | 36 | 0 | mechanism fires |
| Gap-0 followers (scholar death next day after a scholar death) | 36 | 14 | mechanism fires |
| Scholar wild deaths (all) | 141 | 92 | −35% |
| Villager combat deaths / 100 lived-days (§14c, descriptive) | 58.62 | 49.27 | down; absolute 483 → 559 only because villages lived 20% longer (1919 → 2314 lived-days) |
| Median national held-days (P2, reported not a gate) | 54.5 | 84 | up; P2 does not gate this arm |
| National ever | 15/16 | 15/16 | flat count, longer holds |
| National at end | 14/16 | 15/16 | up |
| Wave-4 unlock | 16/16 | 16/16 | — |
| Wave-5 unlock | 4/16 | 10/16 | up (see below) |
| Wave-5 kills (total) | 14 | 11 | flat/down — the lever gets villages TO wave 5, it does not make them kill there |
| Wins / table | 0 / 0 | 0 / 0 | none expected on this pre-seat substrate |
| Survived the full 150d | 5/16 | 10/16 | doubled |

## Gorge price (the explanation of the cost)

| Gorge metric | Control | Armed | Read |
|---|---:|---:|---|
| Voiced gorge nights / 100 lived-days | 31.21 | 43.43 | +39% — the price is volume |
| Voiced gorge kcal / 100 lived-days | 34,771 | 48,296 | +39% |
| Mean kcal per voiced gorge night | 1,113.9 | 1,112.0 | FLAT — price-per-night unchanged; the lever buys more siege nights, not hungrier nights |
| Voiced gorge nights (total) | 599 | 1,005 | — |
| Voiced gorge kcal (total) | 667,256 | 1,117,570 | total up partly because armed villages lived 395 more days |
| Zero-kcal circle nights (siege on empty stores) | 12 | 51 | the siege keeps coming when the pantry is empty |

The prereg's prediction held exactly: the price is volume, not
price-per-night. A village pays ~39% more gorge per 100 days lived
for the cascade deaths it no longer suffers — and the starvation
rate is flat (0.261 → 0.259), so the extra gorge is NOT converting
into starvation. The cost bar passes because the pantry absorbs it.

## Pilot numbers (8 seeds, 100501–100508 — for the record)

P1 0.1869 → 0.0917 (ratio 0.491), pairs 34 → 0, gap-0 34 → 9,
starvation 1 → 0, starvation rate 0.114 → 0.0, median survival
104 → 150, gorge nights/100d 26.08 → 47.17, kcal/100d 28,367 →
53,507, mean kcal/night 1,087.6 → 1,134.4, wave-5 unlock 1/8 → 4/8,
national held 40 → 70 days, survived 1/8 → 5/8. Pilot GO under the
corrected bar (computeBars GO), consistent with the confirm in
every direction and every order of magnitude.

## Wall numbers (scale wall — Steve 2026-10-12)

Confirm band, 150d: national 15/16 both legs (held 54.5 → 84 days
median), table 0/16 both, wins 0/16 both, wave-4 16/16 both, wave-5
4/16 → 10/16, median survival 127.5 → 150 days. The wall is
unmoved at the top (no table, no wins on this substrate) but the
lever pushes twice as many villages through the wave-5 door — the
winnability chain's binding link is now wave-5 KILLS (11 total
across 16 armed villages), not wave-5 access. The next arm on this
chain should attack wave-5 killing, not wave-5 unlocking.

## Village assessment (plain words)

What the villages looked like: with the lever off, a village that
reached national usually lost its scholar to the same lingering
raider again the next day — 36 same-beast repeat kills in 16
villages, and the worst villages (100526 dead day 74, 100528 dead
day 76, 100521 dead day 85) never got going at all. With the lever
on, the beast still comes every night and eats — more nights, in
fact, because the village lives longer — but it stops murdering the
scholar in the hall. Ten of sixteen villages lived the whole 150
days; fifteen of sixteen reached national and held it a median 84
days.

Who thrived: the long-lived villages. Seed 100529 armed: national
held 90 days, zero scholar wild deaths while national, survived.
Seed 100534: 89 national days, one wild death, survived. The
pattern is consistent — the lever converts early cascade deaths
into long national holds.

Who died and why: six armed villages still died, all
`village-lost`. The death causes barely moved in shape: villager
combat deaths still dominate (559 of 1,264 armed deaths), then
plain combat (275), expeditions (198), the wild (92). The lever
fixes one specific way to die — the same beast killing the scholar
twice running — and leaves the rest of the killing floor untouched.
That is the right size for this lever: it is a tourniquet on one
artery, not a cure for dying.

Paired regressions, named: seed 100524 is the one village the
lever hurt — control survived 150 days, national, 3 wave-5 kills;
armed died day 142, regional, no wave-5 kills, 45 gorge nights.
One seed in sixteen, against a pooled verdict that passes every
leg with room. Seed 100532 armed carries 4 of the armed leg's 6
starvation deaths — all four on day 66, a single bad day, with 16
empty-pantry circle nights against 8 gorge nights. The starvation
cluster is one event in one village, not a gorge-driven trend; the
pooled tripwire still passes 6 ≤ 7.

## Sense-testing (read the lines)

The gorge IS a siege with a price the village can see — every
night it says so, in so many words: "🌙 Night. The lingering Big
Loud gorges at the treeline — 1,000 kcal gone from the stores.
Endure it (they drift off within ~6 nights — the gorge is the
price), or send a sortie: fighters, rations, real risk." The
endure-or-sortie choice is legible and honest about the cost.

But it says the same sentence every night. Seed 100521 armed has
60 voiced gorge nights and exactly ONE distinct template (only the
monster's name and the kcal number change). Sixty nights of the
identical line is robotic — the price is visible, the voice is a
stuck record. That is a blank to fill, not a verdict item: the
gorge line needs 3–4 variants (escalating hunger, pantry
thinning, villagers' remarks) before this reads as a siege rather
than a meter. Logged as a finding below; no arm is opened here.

The circle nights read correctly too: when the pantry is empty
the beast "circles the treeline, sniffing at empty stores" — the
siege continues, the price is zero, the village feels it as
dread rather than loss. That line earns its keep.

## §15 balanced panel (confirm)

`evidence/2026-11-15/gorgeprice2-b-confirm-panel.md` (16 paired
cases): decision `review_required` — the panel's own read; the
frozen prereg bars are the judge (GO above). National scale access
0.875 → 0.9375 (no material signal), first-bearer survival through
day 30/60 flat at 1.0, village deaths per run 80.44 → 79.0 (no
material signal), village deaths per 100 days 68.61 → 54.48
(exploratory interval −19.5 to −8.6), community loss 0.6875 →
0.375, table win rate 0 → 0. No win movement, no regression
signal; the panel agrees with the bars.

## Telemetry deviation check

`telemetry-check.js` REFUSED the corpora by design, as the brief
anticipated: "refusing recorder-corpus input: all 16 --current rows
carry top-level anchorCommit, so they are sweep recorder rows, not
runs." (Both confirm dirs, same refusal.) The §15 panel above is
the deviation read instead: no LOUD line, no win movement, no
regression. The scale-wall baseline's winseat regime is a known
invalid comparison for this pre-seat substrate (successorcaution
§telemetry), so no baseline deviation is claimed either way.

## Metric review (§14)

- The floored rate leg worked as designed and was never the binding
  leg on this band: control rate 0.261 is below the floor, so the
  floored allowance was 0.625 and the armed rate 0.259 passed at
  0.518× — but the UNFLOORED form also passed (0.992 ≤ 1.25),
  because the control band happened to starve 5. The floor's value
  here is insurance, not outcome: on this band the two forms agree,
  which strengthens the verdict rather than weakening it.
- The tripwire (6 ≤ 7) was the closest leg — one more pooled
  starvation and it fails. It caught what it was built to catch:
  the 100532 day-66 cluster (4 deaths, one event) is two-thirds of
  the armed total. A future band where starvation clusters this way
  could fail the tripwire while the rate leg passes; that is the two
  legs disagreeing by design, and the tripwire is the right judge
  for it. No bar change is proposed: the two-leg design held.
- P1 at 0.465 has comfortable margin under 0.6 on 16 seeds, and
  the pilot (0.491) and confirm agree — the effect is real, not a
  band artifact.
- Per-siege gorge pricing stays dropped (prereg): sieges fragment
  to ~1.0–1.1 nights each, confirmed again on the confirm band
  (armed 1,005 nights / 950 sieges — the
  per-siege number adds nothing over per-night).
- P2 (median national held-days) rose 54.5 → 84 and is reported,
  not a gate, per the frozen prereg. It does not change the
  verdict; it corroborates it.
- If the corrected bar fails on a future band, the prereg's
  standing note holds: the next step is a gorge answer (design
  call), not another re-bar — two bar forms have now been tried and
  this one passed.

## Findings backlog (appended to sim-findings.md)

- Gorge line is a single template repeated verbatim up to 60 times
  in one run (seed 100521 armed) — needs 3–4 variants before the
  siege reads as a siege rather than a meter. (This run.)
- Wave-5 kills are the next binding link: armed villages unlock
  wave 5 at 10/16 but make only 11 wave-5 kills total. The chain's
  next arm should attack wave-5 killing, not wave-5 unlocking.
  (This run.)

## Convergence state

Axis winnability chain: this arm CONVERGES — cascade gorge-pricing
second judgment, confirm GO on 16 fresh seeds under the frozen
corrected bar, pilot and confirm agreeing. The lever is a landing
candidate; the 1055Z and 0930Z NO-GOs stand under their own bars.
No new measurement arm on this lever: the question is answered.
Next on the chain is wave-5 killing (see findings above).

## Reproduction

- Analyzer: `node scripts/analyze-gorgeprice-b.js
  evidence/2026-11-15/perseed-gorgeprice2-b-confirm-control` and
  `...-confirm-on`; bars via `computeBars(control, armed,
  { rateFloor: 0.5 })`.
- Panel: `node scripts/build-gorgeprice2-panels-20261115.js --before
  evidence/2026-11-15/perseed-gorgeprice2-b-confirm-control --after
  evidence/2026-11-15/perseed-gorgeprice2-b-confirm-on --seeds
  100521,...,100536 --out
  evidence/2026-11-15/gorgeprice2-b-confirm-panel`.
- Corpora: `evidence/2026-11-15/perseed-gorgeprice2-b-confirm-{control,on}/`
  (16+16 files, seeds 100521–100536, policy
  `competent-answercourt-b`, 150d). Control anchor `1f711b8db`
  (pre-rebase tip; src/js identical to the rebased tip — 0 changed
  files 1ca2c257d..a9d85e32c). Armed 100521/100522 anchor
  `1f711b8db`; armed 100523–100536 anchor `583a462ce` (rebased tip).
