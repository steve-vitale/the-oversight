# sim-bowopen-recheck-a — BOWOPEN RE-MEASURE (finding #2544, ranged opening)

**Arm:** sim-bowopen-recheck-a · **Loop A run:** fleshout-20261124T1515Z,
adopted by Loop A run fleshout-20261124T1715Z (timed-out 1515Z round).
**Verdict: NO-GO** (frozen prereg bars, judged as written — §1).
**Branch:** `sim-bowopen-recheck-a`, base master 8616c6b2f.
**Prereg:** `evidence/2026-11-24/sim-bowopen-recheck-a-prereg.md` (frozen
2026-11-24 ~11:00 UTC, before any judged sim).
**Analyzer:** `scripts/analyze-bowopen-a.js` (reused as-is);
analysis `evidence/2026-11-24/bowopen-recheck-a-analysis.json`.
**Panel:** `evidence/2026-11-24/bowopen-recheck-a-panel.md`
(§15, `review_required` — §5).
**Seeds:** 110201–110208, 150d death-aware, competent verbatim.
**Substrate both legs:** VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 +
FIGHTALLY2=1, SENSEEXPED=1, SPEARGATE=1, BOWCRAFT always-on.
**Legs differ ONLY by BOWOPEN** (ctl unset, arm =1). No `src/` change on
this branch at all.

## §0. The question, in plain words

Back in November the ranged opening never fired: departing villagers
never carried a bow, so no opening volley ever happened. Since then the
two halves of the fix landed — the gate that let spear-holders through
to empty sources (SPEARGATE) and the home duty that teaches bows
(BOWCRAFT). This arm asked one thing on current master: with both of
those fixed, does switching BOWOPEN on now put bows in departing
hands, fire volleys, and turn those volleys into kills?

## §1. Verdict — frozen bars, judged as written

| Bar (frozen) | Arm | Bar | Result |
|---|---|---|---|
| Pool floor (pair-inclusive engaged) | 11 | ≥ 10 | PASS |
| Kill share (pair-inclusive) | 0.000 (0/11) | ≥ 0.25 | **FAIL** |
| Damage/round (pair-inclusive) | 36.5 | ≥ 70 | **FAIL** |
| Volley fired (mechanism check) | 7/11 = 0.64 | ≥ 0.50 | PASS |
| Cost — community loss | 6/8 vs ctl 5/8 | ≤ ctl + 0.125 (≤ 6) | PASS (exactly at the edge) |
| Cost — starvation | 5 total / 4 villager-only vs ctl 0 / 0 | ≤ ctl + 2 both | **FAIL** |
| Cost — median survival | 133.5d vs ctl 127.5d | ≥ 0.8 × ctl | PASS |
| Instrument errors | 0 on all 16 per-seed files | 0 | PASS |

**Verdict: NO-GO.** A miss on any bar is NO-GO, never re-scored.
The pool was just big enough (11), the volleys did fire (0.64), but
they did not convert: zero kills in the pool, damage/round 36.5
against a 70 bar (ctl 52.0 — the arm leg was *worse* than ctl on
damage), and the arm leg starved 5 villagers where ctl starved none.

## §2. Mechanism diagnosis — the finding

The staging mechanism adds almost nothing, and the volley is
starved of ammunition, not of bows.

**Staging (arm leg, 8 seeds, all departures):**

| Source | Count |
|---|---|
| alreadyHad (departed carrying a bow/sling/crossbow) | 150 |
| fromStash | 0 |
| fromArmory | 0 |
| crafted | 1 |
| craftedFail | 4 |
| noSource | 170 |

BOWOPEN staged exactly **1 bow** in 8 seeds. 170 departures had no
source at all; 150 already carried a ranged weapon before the
mechanism ever ran. The bow is already in hand for most departing
fighters — the mechanism's added value is ~nil. (Ctl leg records all
zeros by design: the staging recorder only runs when BOWOPEN is on.)

**Ammunition is the binding constraint, not the weapon.** Across all
wave-4+ encounters (not just the pair-inclusive pool):

| | Ctl | Arm |
|---|---|---|
| Wave-4+ encounters | 168 | 138 |
| Ranged weapon at entry | 112 | 88 |
| With ammunition at entry | 36 | 29 |
| Volleys fired | 33 | 26 |
| Total volley damage | 1079 | 816 |

Only 29 of 88 ranged-at-entry fighters on the arm leg actually had
ammunition. The volleys that do fire hit respectably (arm
pair-inclusive mean volley damage 33.4; the §4 transcript shows a
46-damage opening), but two-thirds of bow-carriers walk into the
fight with an empty quiver, and the one staged bow in the whole band
cannot move a kill share that needs the opening to land on most
fights, not a third of them.

**What this is not:** it is not the gate (SPEARGATE is on both legs;
see §6 for the replication caveat), not the source (BOWCRAFT is
always-on and villagers demonstrably already carry bows), and not
the volley itself (it fires and hits when ammo exists). The next
lever, if any, is **ammunition supply** — arrows/stones crafted or
pocketed at departure — not another departure-only staging tweak
(bowopen-a §10 forbids that route, and this re-measure confirms why:
there is nothing left to stage).

**Starvation cost (the second failing bar):** arm 5 starvation deaths
vs ctl 0 — 4 on seed 110202, 1 on seed 110208; analyzer counts 4
villager-only. The panel (§5) shows the same pressure as a community
loss of 6/8 vs 5/8. The arm leg did not starve because bows are
heavy; it starved on the same seeds where the pool shrank (arm
pair-inclusive pool 11 vs ctl 21 — fewer launched parties reaching
wave-4 fights). Whether the starvation is noise on 8 seeds or a real
cost of the arm leg is unresolvable at this n; the bar is judged as
written (FAIL) and the next arm should watch it.

## §3. Per-leg numbers and wall numbers

| | Ctl | Arm |
|---|---|---|
| Seeds valid / errors | 8 / 0 | 8 / 0 |
| Median survival | 127.5d | 133.5d |
| Survived 150d | 3 (110201, 110206, 110208) | 2 (110201, 110206) |
| Village-lost | 5 | 6 |
| Max wave reached | 4–5 (8/8 wave 4, 4/8 wave 5) | 4–5 (8/8 wave 4, 4/8 wave 5) |
| Standing (end) | 199–635, all regional | 199–550, all regional |
| National / table / wins | 0 / null / 0 | 0 / null / 0 |
| Pair-inclusive engaged pool | 21 | 11 |
| Kill share (pair-inclusive) | 0.143 (3/21) | 0.000 (0/11) |
| Damage/round (pair-inclusive) | 52.0 | 36.5 |
| Volley fired share | 0.267 (4/15 meetings) | 0.636 (7/11) |
| Total deaths | 780 | 740 |

Death-cause shares (all deaths, both legs): monster combat dominates
— villager combat 303/291, expedition 269/237, combat 97/95
(ctl/arm); villager deaths mostly "the wild" (42/43). The arm leg's
extra deaths are the 5 starvations; everything else is in line.

Trio+ population beside the primary: the analyzer's meeting set is
overwhelmingly trios (partySize 3 in every ctl outcome row and every
arm outcome row) — the pool shortfall on the arm leg is a *count* of
meetings (11 vs 21), not a party-size shortfall. The launched-party
shape is intact; it simply met fewer wave-4 fights on the arm leg.

Wall numbers (scale-onramp axis): national 0/8 both legs, table
null (not instrumented by this driver — never faked), wins 0/8 both
legs, wave-4 unlock 8/8 both, wave-5 unlock 4/8 both, median survival
127.5d ctl / 133.5d arm. The scale wall stands: no village got past
regional on either leg.

## §4. Sense-testing — transcripts read in full

**Volley fired (arm, seed 110203, day 58, Stephen vs The Eulogy,
wave 4, crude_bow, 5 arrows):** coherent and legible. Stephen "sees
The Eulogy coming and nocks an arrow — the fight opens at range
(4 shots)": one wide, three hits for 14/15/17 (46 total), then
"Stephen lowers the bow — The Eulogy is on them now. (3/4 hit)".
The opening reads like a real ranged opening. But the fight still
ends in flight after two rounds (Stephen at 23 HP, shouts, Hyun-chan
charges in, Stephen runs). The volley was the best damage in the
fight and the party still fled — the opening helps, but one volley
does not carry a wave-4 fight.

**Volley missing, sling (arm, seed 110202, day 115, Boula vs Suburb,
wave 4, sling, 0 stones):** "Boula has Sling but no stones — the
pouch hangs empty." Then four rounds of melee (12/12/8/9 damage
against a 1300-HP monster), two allies called in, Boula flees at
32 HP. The line is honest and the fight reads sensibly — a fighter
with an empty pouch fighting a monster she cannot dent.

**Volley missing, bow (arm, seed 110201, day 117, Benoit vs Herald,
wave 4, bow, 0 arrows):** "Benoit has Bow but no arrows — the
string stays drawn, useless." Eight rounds, two allies called in,
the party kills the Herald (503 HP) in the end — the one vKill in
the arm band's broader encounters, won by melee, not by the bow.

**Ammo naming (#2593 fix): VERIFIED LIVE in this band.** The
"no arrows" line now names the weapon's actual ammunition: "no
stones" for the sling, "no arrows" for the bow (code:
fieldFights.js:1070–1076, `_ammoName`). No misnaming observed in
any transcript read. The crossbow ("no bolts") and gun lines share
the same shape; no crossbow-holder hit the line in the transcripts
sampled, so that wording is verified by code only.

## §5. Balanced panel (§15)

`node scripts/balance-panel.js compare` on the paired 8-seed panels:
**decision `review_required`**, driven by a single flag — community
loss 0.625 → 0.75 (+0.125), status `regression_watch`, exactly at
the cost bar's edge. Everything else: no material signal (national
0 → 0, table win rate 0 → 0, village deaths per run 97.5 → 92.5,
first-bearer survival 1 → 1 at day 30 and day 60). The panel is the
instrument; the frozen bars (§1) are the judge. The panel agrees
with the analyzer: no benefit, one cost flag to watch.

## §6. Gate replication (check, not a verdict bar)

**Not computable from these corpora — diagnosed, never re-scored.**
The prereg's check (spearPassed/spearSeen == 1.0 both legs) cannot
be evaluated: neither the driver (`scripts/bowopen-driver-recheck-a.js`)
nor the analyzer emits `spearSeen`/`spearPassed` anywhere — the
v4gates records are engagement-gate records (avoid/seek outcomes),
and the bowOpen records carry only staging sources. What *is*
recorded: `speargateOn: true` on all 16 per-seed files, both legs,
and the SPEARGATE flag is asserted to match the mode label by the
driver. The gate was on; its per-departure pass rate was not
measured. The bowknow-a precedent cited in the prereg had those
counts; this instrument (a clone of the speargate driver) does not.
Instrument gap filed in §9 — a future arm that needs the replication
number must add the counters to the driver first.

## §7. Village assessment — what the villages looked like

Eight villages, same seeds both legs, and they read as the same
eight villages with small divergences: three ctl villages survived
to day 150 (standing 550–635, regional, wave 5 reached); two arm
villages survived (550, 199). The rest died between day 96 and 140,
mostly to monster pressure on expeditions and in village combat —
the familiar shape of a village that can reach wave 4 and even
wave 5 but cannot kill what it meets there. On the arm leg, seed
110202's village starved four people while its parties kept
marching out with empty quivers — the most vivid single image of
the run: the ranged opening exists on paper, the bows exist in
hands, and the arrows do not exist at all. Nothing in the
transcripts read robotic: shouts for help bring allies in by name,
fleeing is voiced as a judgment ("sees how this ends — and runs
while running still works"), field medicine happens mid-fight.
The blanks are material, not cosmetic: ammunition, and kills.

## §8. Metric review

- The frozen bars judged as written; no re-scoring. The kill-share
  bar (≥ 0.25) and damage bar (≥ 70) were both far out of reach on
  this band (0.000 / 36.5) — not a near miss.
- The pool floor (≥ 10) passed at 11, but the pool *shrank* on the
  arm leg (11 vs ctl 21). The floor is sized to the known density
  from the bowopen band (27); on this band the density itself moved.
  A future re-measure should re-size the floor from the current
  band's density, not the 1057xx band's.
- The volley-fired mechanism check passed (0.64) while the outcome
  bars failed — the check measures that the mechanism *runs*, not
  that it *matters*. Keep it as a mechanism check, never promote it
  to a verdict bar.
- The starvation cost bar (≤ ctl + 2) failed on 5 deaths
  concentrated on one seed (110202: 4). At n=8 a single-seed
  concentration is weak evidence of a systematic cost; the bar is
  still judged as written. A confirm would need to watch whether
  starvation tracks the arm leg or the seed.
- Gate replication (§6) was unmeasurable — the prereg assumed
  counters the instrument does not emit. Future preregs should
  verify the counters exist in the driver before freezing the check.

## §9. Findings, next arm, and run notes

**Finding #2544 stays open.** The ranged-opening half of the
winning launched-party shape is NOT confirmed under gate+source-fixed
ground: BOWOPEN=1 stages ~nothing (1 bow in 8 seeds), volleys fire
only where ammo already exists, kill share 0.000, damage/round
36.5, and the arm leg paid a starvation cost. **Next arm (named from
the diagnosis, not another staging tweak): ammunition supply** —
arrows/stones crafted or pocketed at departure, so a staged bow
arrives with something to loose. That is a new lever to design, not
a re-measure of this one. The turn-on decision for BOWOPEN/SPEARGATE
remains the coordinator's, not this arm's. The rage/carrier path is
Loop B's (sim-ragecarry-b) — untouched here.

**Instrument gap (filed, not fixed mid-run):** the driver/analyzer
do not emit spearSeen/spearPassed, so the gate-replication check is
unmeasurable (§6). A future arm needing it must add the counters.

**Run notes (adoption):**
- Ctl leg: seeds 110201–110205 committed by the 1515Z round;
  110206–110207 finished by this adoption but landed in a doubled
  path (`evidence/2026-11-24/evidence/2026-11-24/...`) because the
  OUTDIR passed to the driver included the date prefix the driver
  adds itself; moved to the correct corpus dir, verified valid JSON
  (sizes 1.9–4.7 MB, seeds/errors/days checked). Seed 110208's ctl
  run was killed by a VM restart (~17:33Z, uptime 1 min on recovery);
  re-ran clean (150d survived, standing 635, wave 5, 0 errors).
- safe-commit.sh clobber struck on all three adoption commits
  (committed files shown staged-deleted in the main index, worktree
  files untracked); repaired each time with
  `git ls-tree HEAD -r -- <paths> | git update-index --add
  --index-info`, verified `git status --short` empty +
  `git diff HEAD` empty after each repair. Commit contents verified
  correct in all three cases.
- safe-commit.sh does NOT accept directory paths (known lesson):
  the arm corpus directory failed to add on the first attempt; the
  log/err committed alone (96c24109f) and the 8 corpus files followed
  as an expanded file list (217ee07d1).
- Write-flap probe (`git update-ref refs/heads/probe HEAD`) run
  before each commit; all probes passed.
- Convergence state: **killed-at-pilot** is the wrong label — the
  pilot passed its sniff test (staging mechanism runs, volleys fire)
  and the full 8-seed band ran; the verdict is **NO-GO on the frozen
  bars**. Axis scale-onramp: unchanged (national 0/8 both legs).

## §10. Commits (branch sim-bowopen-recheck-a)

- ae8dd4d75 — instruments (1515Z round): recheck driver + panel
  builder clone; proof 36/36, analyzer selftest 33/33.
- dfc19669d — frozen prereg (1515Z round).
- 13f31315b / a47d2e848 / b1b609347 / 306d064c2 — ctl corpora
  110201–110205 (1515Z round).
- 874b55155 — ctl corpora 110206–110208 (this adoption; ctl leg
  complete 8/8, 0 errors).
- 96c24109f — arm leg log/err (this adoption).
- 217ee07d1 — arm leg per-seed corpora 110201–110208 (this adoption).
- (Closeout commit: this evidence file + analysis + panel.)

**Ready to merge, pending ship.** No `src/` change; no version bump;
no push. The coordinator merges via --ff-only.
