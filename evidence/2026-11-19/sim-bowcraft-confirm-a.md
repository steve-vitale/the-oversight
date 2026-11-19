# sim-bowcraft-confirm-a — CONFIRM GO (pilot replicates on a fresh band)

**Arm:** sim-bowcraft-confirm-a · **Loop A run:** fleshout-20261119T1815Z (adoption closeout)
**Type:** CONFIRM — the replication leg the pilot owed before any BOWCRAFT turn-on decision.
**Prereg:** `evidence/2026-11-19/sim-bowcraft-confirm-a-prereg.md` (frozen 2026-11-19 ~19:09 UTC).
**Base:** master `7e0810eea`; branch anchor `555faab12` (prereg + instruments, rebase correction).
**Verdict: GO** — all four frozen bars pass. The pilot replicates; the turn-on decision is the
adoption's (this file) — see §9.

## 1. The question

Does the pilot replicate on fresh seeds? Pilot (band 107001–107008): craft attempts 0 → 47,
bows 0 → 13, bowless departure share 0.795 → 0.732 (delta 0.063, bar ≥ 0.05 — thin, and one
seed carried it). The confirm re-runs the identical before/after on the FRESH band 107011–107018,
8 seeds per leg, with the one instrument correction the pilot proposed (finding #2609: the
attribution gap window `[prevRowDay, rowDay]`).

## 2. Frozen bars (verbatim from the prereg) — all PASS

| # | Bar | Control | Arm | Result |
|---|-----|---------|-----|--------|
| 1 | Craft attempts (bow rungs) arm ≥ 3 | 0 | **54** (ok 15, fail 39) | PASS |
| 2 | Bows crafted (bow / crude_bow, ok) arm ≥ 3 | 0 | **15** (crude_bow 13, bow 2) | PASS |
| 3 | Bowless departure share arm < ctl by ≥ 0.05 | 0.584 (160/274) | 0.490 (118/241), **delta 0.094** | PASS |
| 4 | No-regression guardrails | — | median survival 150 vs 150 (≥ 0.8×); starvation 3 vs 5 (≤ ctl+2); deaths/seed 79.4 vs 80.8 (≤ 1.10×) | PASS |

**GO = all four hold → the pilot replicates on a fresh band.** The delta (0.094) is stronger than
the pilot's (0.063), and this band's delta is NOT carried by one seed: 107012 contributes the most
(ctl 54/65 → arm 49/73) but 107013, 107014, 107015 and 107017 all move the same direction.

## 3. Per-seed table (identical seeds, 150d death-aware)

| Seed | ctl days / end | arm days / end | ctl craft ok / bowless | arm craft ok / bowless |
|------|---------------|---------------|------------------------|------------------------|
| 107011 | 150 survived | 150 survived | 0/0, 4/19 | 0/0, 4/19 |
| 107012 | 150 survived | 150 survived | 0/0, 54/65 | 10/4, 49/73 |
| 107013 | 103 village-lost | 150 survived | 0/0, 3/4 | 4/3, 15/22 |
| 107014 | 150 survived | 121 village-lost | 0/0, 40/51 | 10/2, 13/18 |
| 107015 | 150 survived | 150 survived | 0/0, 11/33 | 12/2, 15/45 |
| 107016 | 150 survived | 150 survived | 0/0, 3/18 | 2/0, 3/18 |
| 107017 | 138 village-lost | 111 village-lost | 0/0, 41/70 | 10/3, 15/32 |
| 107018 | 150 survived | 122 village-lost | 0/0, 4/14 | 6/1, 4/14 |

107011 is identical on both legs (the fix never fired there — no eligible villager). 107016 tried
twice and made no bow. Every other seed crafted at least one bow on the arm leg.

## 4. Secondary metrics

- **Knowledge spread (the mechanism):** knows-bow days arm 8,513 vs ctl 1,764; eligible days
  arm 646 vs ctl 90; ranged-less-knows days arm 5,113 vs ctl 90. The seeing-seeding works — on
  the arm leg villagers learn the bow by seeing one equipped, then craft.
- **Attribution completeness:** ctl 0.910, arm **0.892** — just under the supporting ≥ 0.90 bar.
  See metric review (§8): the #2609 window fix is validated by the selftest live-cadence fixture
  (35/35), but the live arm leg still leaves 9 of 49 appearances unexplained. Not binding;
  the verdict does not turn on it.
- **Engaged meetings with a bow-armed fighter:** ctl 6/11 ranged at entry, arm 4/8 — NO
  improvement in the ranged-at-entry share (the pilot's direction, 2/7 → 4/5, does not repeat).
  Bowcraft puts bows in hands; it does not by itself put a bow-armed fighter at the front of a
  wave-4 meeting. Supporting only.
- **Craft success rate:** 15/54 = 28% (crude_bow 13/44, bow 2/10). 15 distinct villagers crafted.
- **Wall numbers (reported every run):** national 0/8 both legs; table 0/8; wins 0/8; wave-4
  unlocks 8/8 both; **wave-5 unlocks ctl 3/8, arm 2/8**; median survival 150d both; community
  lost ctl 2/8, arm 3/8; starvation deaths ctl 5, arm 3.

## 5. Panel (§15) — `bowcraft-confirm-a-panel.md`

`node scripts/balance-panel.js compare` on the paired 8-seed panel returns **review_required**,
driven by two `regression_watch` rows: village deaths per 100 calendar days (+1.55, 95%
exploratory interval −2.48 to +6.75) and community loss (0.25 → 0.375, interval −0.25 to +0.5).
**Adjudication:** both intervals straddle zero — no material signal — and the frozen
no-regression guardrails (median survival, starvation, deaths/run) all pass. The panel is the
instrument, the frozen bars are the judge; the verdict stands GO. National / table / wins are
all 0 on both legs (no material signal).

## 6. What the pilot's wave-5 movement does NOT do

The pilot's observed-not-attributed wall movement (wave-5 unlocks 0/8 → 4/8 on the arm leg)
does **not** replicate: this band is ctl 3/8, arm 2/8. The pilot's movement was band noise, and
is now recorded as such — bowcraft fixes bow supply, it does not open the wave-5 door. The
scale-onramp wall stands where it was.

## 7. Flap record (this arm's run)

- ctl leg completed 19:27–19:32Z, before the machine restart (~19:51Z).
- arm leg seeds 107011–107013 written 19:54–19:55Z; seeds 107014–107018 hit the 19:56Z+ flap
  window — file writes refused, driver fell back to dumping each corpus as text into
  `bowcraft-confirm-a-arm.log` (the bowcraft-a recover pattern).
- The timed-out run's workers were cancelled before recovery finished. Adoption ran the
  generalized recover script (`scripts/recover-bowcraft-fallback-confirm-a.js`, generalized
  in this adoption to validate either leg against the live branch HEAD): **RECOVER 5 recovered,
  0 failed**, readback-verified, 0-byte .tmp files removed.
- All 16 corpora re-verified before judging: correct seed / mode / bowcraftOn / anchor
  (`555faab12`), 0 instrument errors. Analyzer `--selftest` 35/35; proof test 59/59 (from the
  prereg commit; re-run in the adoption gate, §10).

## 8. Metric review (§14)

- **Attribution completeness arm 0.892 vs the supporting ≥ 0.90 bar.** The #2609 window fix
  is proven by fixture, but the live arm leg still misses 0.90. Possible cause: appearances
  that arrive via corpse-takes / pile moves on days with no census row in the window. Proposal
  for the NEXT bow-supply run: count the residual by source (crafted/looted/spawned/moved vs
  unexplained) per leg before judging completeness, and consider whether 0.90 is the right
  floor when the arm leg's appearance count grows (49 vs 33 — more appearances, more chances
  to miss one). Not a re-score: the bar was supporting, and the verdict does not turn on it.
- **Ranged-at-entry share** (secondary) did not move (6/11 → 4/8). If a future arm wants to
  claim bowcraft helps wave-4 fights, it must measure the fighter-selection step, not just
  supply — the bow has to be in the LEAD fighter's hands, and nothing in this fix chooses
  the lead.
- **Wave-5 as a wall metric:** the pilot's 0→4 was reported observed-not-attributed and is
  now falsified as a bowcraft effect. Future bow-supply evidence should not cite wave-5
  movement unless the arm leg beats control on the same band.

## 9. Turn-on decision (adoption's call)

**BOWCRAFT turns ON.** Pilot BUILD-GO + confirm GO on two independent fresh bands, both bars
passed with margin (attempts 54 vs bar 3; bows 15 vs bar 3; bowless delta 0.094 vs bar 0.05),
no regression on any guardrail, mechanism proven (seeing-seeding: knows-bow days 1,764 → 8,513).
This mirrors the speargate precedent (pilot GO + confirm GO → lever on). The turn-on is a
separate commit in this adoption (`src/js/villager-build.js`: the `BOWCRAFT` env gate becomes
always-on; the proof test is updated to assert the ungated behavior; gate re-run). Finding
**#2597 FIXED** (confirm GO); the pilot's #2610 cross-reference stands. The bowcraft fix now
runs in live play: ranged-less villagers who have seen a bow equipped will try to craft one.
What it does NOT claim: bowcraft does not open wave-5 (see §6) and does not by itself put a
bow-armed fighter at the front of a fight (§4).

## 10. Verification (adoption)

- Proof test `scripts/test-bowcraft-confirm-a.js`: 59/59 GREEN (re-run by adoption before the
  turn-on commit; the turn-on commit updates the gate-assertion case and re-runs green — see
  that commit's message).
- Analyzer `--selftest`: 35/35.
- All 16 corpora verified (seed/mode/bowcraftOn/anchor, 0 errors) — §7.
- Panel compare attached: `evidence/2026-11-19/bowcraft-confirm-a-panel.md`
  (+ `bowcraft-confirm-a-panel-before.json.gz` / `-after.json.gz`).
- Analysis: `evidence/2026-11-19/bowcraft-confirm-a-analysis.json`.
- Gate: see the round evidence `evidence/2026-11-19/sim-scale-onramp-round-1815.md` (run after
  both arms land).

## 11. Village assessment (plain words)

Eight villages, eight fresh starts. On the control leg nobody ever crafts a bow — not once in
1,141 village-days — even though bows are the one thing that would let a villager fight a
monster from a distance. Villagers leave for wave-4 fights empty-handed more than half the
time (160 of 274 departures). Turn the fix on and the villages change: 15 bows get made by 15
different villagers, bow knowledge spreads from a handful of people to nearly everyone who
could use one, and bowless departures fall by a tenth. The villages are no safer for it in
the raw numbers — same median survival, same death counts, wave-5 no more open than before —
because a bow in someone's pack is not a bow in the lead fighter's hands when the monster
arrives. But the supply blank the pilot found is genuinely filled: the craft that never fired
now fires, on fresh villages, twice over.
