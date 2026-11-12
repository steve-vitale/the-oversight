# Journey endgame r185 — RUN NOTE (Lane B, leg 4)

Adopted dead 23:00 CST run (stale-lock recovery). Lock run_id
2026-11-12T04:55:29Z, journey2-endgame heartbeat 2026-11-12T05:46:13Z —
69 min stale at the 06:55Z check, no live worker, no writes under 15 min.
Lock deleted, own lock written 2026-11-12T06:56:40Z. Adopted the dead
run's prereg + probe/analyzer/dark-probe (verified r182-verbatim except
the prereg revisions; dark probe diff empty), committed 429542a80, then
rebased onto master ef836057c (6604c4187). Substrate amendment: prereg
said a0039d484; master had since taken the ship bump 25d9a7c85 plus
sim-mcconfirm/sim-bisect evidence/scripts/test-only commits — the only
src/js change in the range is the build.js stamp. Game code identical
for measurement purposes. Index clobber struck after the safe-commit
(4 files staged-as-deleted, worktree byte-identical to HEAD); repaired
with the documented `git ls-tree HEAD -- <files> | git update-index
--add --index-info` pipe; status clean before rebase. Host write flap
was clear at adoption (git probes 5/5 OK). Heartbeat loop
journey2-endgame-hbloop-r185.sh running every 10 min.

## Pre-registration (summary — full text in journey-endgame-r185-prereg.md)

Leg 4 endgame, first measurement on the post-reconcile master. Pilot
seeds 89701–89705 (matched reuse), three passes (A: no legs; B:
CAPSTONE=1 BUYOUT=1; C: +BUYOUT_EARLY=1) + C-wide on fresh seeds
89706–89713 + full dark probe. Questions: (1) pass A vs r182 modulo
deltas (a)–(j); (2) SURVIVAL-TO-WINDOW FIRST — does the
survivalcontrol-b collapse (6/8 → 1/8 survive) show on this panel;
(3) phantom-veteran readiness shape; (4) does the 89702 full seat
reproduce; (5) early buy-out firing + starvation price; (6) M24b
honest-refusal exercised; (7) dark re-verify (v3 names Amelia Moon);
(8) finales read as people + finalvoice (b) suppression; (9) deltas
move wave-4 conversion / survivability / competence; (10) diag-layer
staleness blank carried; (11) fast-branch diedInFight gap watch;
(12) M2b carried GREEN.

## Pass A (matched re-run) — lesser 5/5, full 0/5

| seed | sat | alive | ladder | w5 | deedGate | uw | peakVets |
|---|---|---|---|---|---|---|---|
| 89701 waves | d91 | 7 | 3/3/65 | 1 | never ok | 5 FACED | 2@d71 |
| 89702 waves | d90 | 7 | 3/3/75 | 4 | first ok d81 | 5 FACED | 2@d73 |
| 89703 waves | d132 | 6 | 3/3/65 | 0 | never ok | 4 | 0 |
| 89704 forcedrift | d90 | 9 | 3/3/81 | 1 | never ok | 5 FACED | 2 |
| 89705 wavesnw | d91 | 8 | 3/3/65 | 0 | never ok | 5 | 2@d87 |

r182 pass A for comparison: sat 104/97/118/92/98, alive 9/8/5/3/10,
ladder 81/78/56/52/74, deedGate 89702 ok d62 w5:7, peakVets 2/2/0/2/1.
M1 GO 5/5 (all announced d90). M21 GO 5/5 under the revised rule.
M3 NO-GO (standing tally: armB 3 vs armA 5; r182 was 1 vs 6).
PRIMARY-BINDINGS GO; ALL NO-GO on M3 only. M2b GO (3 causal deaths
named: Ananya Santoro, Chris Thompson, Alex Schmitz — the r171
diedInFight gap did NOT recur).

Q2 ANSWER — NO survival collapse on the matched panel: 5/5 villages
reached d90 alive. The reconcile deltas (dawn scorer, DUTY-at-dawn,
OVE wires) did not kill villages before the window here. The
survivalcontrol-b collapse does not reproduce on this panel.
Headline deltas vs r182, attributed: 89704 much healthier (alive 9
vs 3, ladder 81 vs 52 — pantry 72437 at end); 89702's deed gate
later (d81 vs d62) with fewer wave-5 faces (4 vs 7) — the dawn
scorer reshaped the days, and (k) competent.js fight fallback moved
fight anatomy; 89701 now has w5:1 (was 0) and sat 13 days earlier;
89703 sat 14 days later (d132 vs d118). All within "same seeds,
different days" — no single delta claims a mechanism beyond (a)+(k).

## Pass B (CAPSTONE=1 BUYOUT=1) — lesser 4/5, full 1/5

89702 FULL SEAT: military_tribute delivered d81 (Ines + Meera),
priced FULL d82, sat full d93. M23 GO under the revised rule
(delivered 1/1, none-ready 0, refused-despite-ready 0, priced FULL).
M24 GO (paid exactly need=2). M24b VACUOUS (no scholar+1 seed).
M21 GO with FULL-EXEMPT (satWaves 16/12/7 +5/3 meets the 5/5/4/3/2
deed bars). The other four seeds are pass-A identical (no delivery
eligible). M3 NO-GO again (3 vs 5).

Q4 ANSWER — the 89702 full seat REPRODUCES, but by a different road
and later: r182 pass B was feast_embassy d65, priced d66; r185 pass B
is military_tribute d81, priced d82. The feast bundle never completed
this run (no bundle feast), so the tribute was the first ready kind.
Cost note: the tribute consumed both living veterans — 89702 ends
pass B with vetLiving=0 and 2 causal deaths. The full seat cost the
village its two wave-4 killers.

## Pass C (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — lesser 4/5, full 1/5

M25c GO: 5/5 bought early (89701 d55, 89702 d27, 89703 d41, 89704
d32, 89705 d28), 0 skipped, 12 attempts, every attempt recorded
with ok/why/spent. Spent ~8000 each; pantry-after 9503 / 8910 /
3771 / 3600 / 3000. 89702 FULL via feast_embassy d77, priced FULL
d78, sat full d90 — the early buy-out flipped the embassy to ready
(r182 pass C: d78/d79, one day later). M23 GO (1/1 delivered,
priced FULL). M24/M24b VACUOUS (no tribute delivery — the embassy
delivered instead). 89701's early buy changed its trajectory: uw
dropped to 4 (was 5 in pass A), w5max 0.

STARVATION (Q5): one starvation death on the full-seat seed —
Daniel Zhu d86 on 89702. NOT buy-caused: the buy was d27 with
pantry-after 8910, the seat was priced full d78, and the pantry
recovered to 20379 by d90; the death came 59 days after the buy,
after pricing, before the sit. The Joja price this run is one late
life on the full-seat seed, not a gutted pantry. No buy-out starved
a village before its seat on any pass (threshold-edge buys:
89703 after 3771, 89704 after 3600, 89705 after 3000 — none at 0,
unlike r182's 89705-after-0).

## Pass C-wide (fresh 89706–89713) — lesser 7/8, full 0/8, lost 1/8

M25c GO (wide-gated): 8/8 bought, 0 skipped, 83 attempts. Buys
d39/d77/d41/d41/d53/d34/d37/d49; pantry-after 1500/9201/10000/4100/
5703/3285/11619/2911. 89713 refused twice first (pantry 8345, 8881
— "The pantry holds about 4,284 kcal — buying the bundle costs
8,000. Not today." — the snapshot counts ~2000 more than the
spendable figure; the refusal names the shortfall honestly, so this
is verified-honest, not a defect), then bought d49 at 11268.
Starvation deaths on 89706 (Owen Smith d35, before its d39 buy)
and 89707 (Kenneth Krawczyk d10, before its d77 buy) — both pre-buy,
not buy-caused. 89711 sat lesser d145 (late sit).

89708 VILLAGE-LOST (scattering d81, pantry 0, 1 alive — Wei Chen
the beekeeper): five "a stranger" deaths d31–47, a contest death
d49, sickness d12, then three hungry days and people walking in
different directions. The d41 buy (after 10000) did not gut the
pantry; the loss is a death spiral + hunger, voiced honestly
("Haven couldn't hold. ... The scattering, again."). r182's 89708
survived unseated; r185's 89708 scatters — same seed number, new
substrate. One wide-panel loss pre-window is NOT the
survivalcontrol-b collapse (matched panel 5/5, wide 7/8 reached the
window), but it is the panel's one headline difference and the
"a stranger" death cluster (5 in 17 days) is worth a look on a
future crisis-leg run, not a fix here.

## Dark probe — 7 variants, 1 known failure

Only failure: v1a-loss:D2-twist-fired — bit-identical to
r171/r178/r182 (standing, not a regression). v1b 23/23, v1c 24/24,
v2 18/18, v3 25/25, v4 20/20, v5 17/17. v3 walk-out names Amelia
Moon, not Bill Palmer (Q7 confirmed). D1–D4/D6 hold.

## People check (full transcripts read)

- Pass A 89702 (lesser, missed full by capstone only): finale
  coherent — audit names waves fought (18/12/6 +7w4 +4w5), ladder
  breakdown, gap named ("no capstone deed delivered"). The war-path
  body-count line reads clean. The relic formula ("Your gifts are
  not mastered — but they are lived-in...") repeats 4× across the
  finale's relic reveals — a deliberate template, noted as polish,
  not a defect.
- Pass B 89702 (FULL via tribute, feared path): reads earned and
  distinct — mercy choice, terror pledged as a shield. "Even now
  the wave-5 bar reads" ABSENT on the full-seat audit: finalvoice
  fix (b) holds live. Caveat, same as finalvoice-b band 2: this
  seat's wave-5 bar was ready at release (rd5 ready, 2/2 veterans),
  so the suppression branch itself was not exercised — absence is
  consistent with both the fix and a ready bar. The line DOES fire
  correctly on lesser 89703 (unready bars): "Even now the wave-4
  bar reads: blood your fighters (0 of 1 veterans). Even now the
  wave-5 bar reads: blood your fighters (0 of 2 veterans)."
- Pass C 89702 (FULL via bought bundle, indispensable path): reads
  earned and different again — "Teach them freely." The audit
  carries "(+4 feast-bundle bonus)" — the r158 blank is closed:
  the bundle +4 DOES land in the counted points in the wild.
  Human beats land: "Wanjiru speaks only Swahili. No shared words
  at all — just eyes, hands, and patience." / "They're burying
  their speaker — grain can wait a week; grief can't."
- No fabricated shared history, no filler loops, no static menus
  in any finale read. No bond proposal from a roster seen. No
  refusal line repeating verbatim within a branch. No pellet lock,
  no rads death without voicing, no silent cure. No offered seat
  withdrew. V-WAITVARIETY: 89703 holds 5, one of each variant, 0
  adjacent repeats — no stuck record. One sit-day death: 89703
  d132, app_mgpspi68115:alien (a villager died of an alien cause on
  the sitting day; deaths happen, noted not fixed).

## Village assessment (plain words)

Five villages walked the same road to the same table and came home
with five different stories. Every one of them reached the window
alive — nobody starved before day 90, nobody scattered early — but
only one, 89702, had both the fighters and the deeds to take the
full seat, and it took the full seat twice by two different roads:
by sending its two wave-4 killers away as tribute, and by buying
its way in with a feast the whole village paid for. The other four
sat in the lesser seat with the same gap named every time: not
enough wave-5 blood (0 or 1 of the 2 needed) and no capstone deed
delivered. 89703 is the hard-luck village — no living veterans at
all, sat latest at day 132, its war-path still reading the unready
bars out loud. 89704 is the healthy one — nine people alive at the
sit, the biggest pantry, the fullest ladder — but even it never
faced a second wave-5 beast. The wide panel adds the cautionary
tale: 89708 lost five people to strangers in a fortnight and then
scattered hungry at day 81, one beekeeper left alone. The game is
winnable — the full seat is reachable and the finales read as
earned — but the wave-5 deed bar is the binding constraint on
three of five matched villages, and the win stays rare (1/5
matched, 0/8 wide).

## Verdicts

- REACHABLE: yes — full seat reached on the matched seed two ways
  (tribute d81, bought bundle d77); lesser 5/5 pass A.
- FUN: yes — three distinct finales (lesser, tribute-full,
  bundle-full) each read as people, with different paths, voices,
  and final choices; no senseless passages in the transcripts read.
- WINNABLE: yes, rarely — full 1/5 matched, 0/8 wide; the wave-5
  deed bar (2 distinct wave-5 kills) binds 3/5 matched seeds.
  No toughness/gear/ability tuning is owed from this leg (the
  combat-play gate still holds elsewhere); the constraint is
  wave-5 facing, not the table's price.

## Telemetry deviation check

`telemetry-check.js` vs endgame.json: one LOUD line —
veterans.unlockedWave swung 60% (baseline 15 → current 24, n=5).
EXPLAINED, not a bug: the baseline is a 4-seed r121 pilot SUM
(uw 15 over 4 seeds); the current is a 5-seed matched-panel sum
(uw 24 = 5+5+4+5+5), and the per-seed pattern is IDENTICAL to r182
(also 24). Baseline NOT rolled forward: sums scale with seed
count, and the baseline's own note forbids comparing across
regimes. Proposed: re-seed the endgame baseline as per-seed MEANS
with the regime recorded (see metric review).

## Metric review (§14 — revisions for the NEXT run, never re-scored here)

- M21 (full-seat exemption) HELD: 5/5 on all three matched passes,
  FULL-EXEMPT firing correctly on both full seats.
- M23 (refusals-despite-ready only) HELD: GO on pass B and pass C
  under the revised rule; the r182 substance-pass is now a printed GO.
- M25 DROPPED: stayed dropped; nothing in this run revives it.
- --wide gating WORKED: wide judged on M25c + starvation only
  (WIDE-VERDICT GO); the full analyzer's exit 1 on out-of-scope M3
  was correctly ignored per the prereg.
- M3-conversion: NO-GO on all three matched passes and the wide
  (armB 3 vs armA 5/7) — the standing tally fails every r18x run.
  PROPOSAL for the next prereg: define what armA/armB are and
  whether armB>armA is even the right bar after the reconcile dawn
  scorer changed fight anatomy, or retire M3 as a binding and keep
  it as a descriptive tally. Do not re-score this run.
- M24b: VACUOUS a third straight run (no scholar+1 seed). Keep —
  the scholar+1 shape is the live agreement question until a seed
  exercises it.
- M2b: GREEN, carried, no re-sweep.
- Endgame telemetry baseline: re-seed as per-seed means with regime
  recorded (see telemetry section); sums across different seed
  counts are not comparable.

## Blanks filled / documented

1. Finalvoice (b) verified LIVE on a full seat (with the ready-bar
   caveat recorded above) — the r182 polish item is now answered
   with evidence, not a fixture.
2. Bundle +4 verified landing in the wild (pass C 89702 audit) —
   the r158 blank is closed.
3. Buy-out refusal arithmetic verified honest (89713: snapshot
   8881 vs "holds about 4,284" = a 2000 reserve; the refusal names
   the shortfall) — documented, not a defect.
4. Relic-voice formula repetition (4× per finale) — documented
   polish item for a content call, not fixed in a measurement run.
5. 89708 "a stranger" death cluster (5 in 17 days) + pre-window
   scattering — documented for a future crisis-leg look, not a fix
   here.
6. Diag-layer staleness blank (r158, carried): fullseat-diag.js
   still decomposes the full seat with the pre-ladder gate — still
   owed to the ladder coordinator / leg 4, not changed here.

## Landing

- Prereg + instruments: 429542a80 (worktree), rebased to 6604c4187
  on master ef836057c.
- Evidence: evidence/2026-11-12/perseed-endgame-r185{-,-b,-c,-cwide,-dark}/
  + pass-a/b/c/cwide/dark logs + analyzers + this note.
- check.js --quick: 335 passed, 5 failed in 652s (exit 1). All 5
  PRE-EXISTING on master ef836057c, none caused by this run (zero
  src/js changed; none of the five tests references any r185 file):
  test-measurement-proof-update.js ("Proof source inputs are not
  current" — balance proof manifest stale vs the sim-mcconfirm
  commits on master), test-measurement-workflow.js (retained
  neutrality proof), test-phone-frame-proof.js (phone receipts stale
  vs current index.html/src/data), test-one-person-army-deed-
  attainment.js + test-living-garden-deed-attainment.js (120s
  timeouts on a loaded box; r127's gate had the same 2 slow-test
  timeouts). No regressions from this run; the five are other
  work, not a landing blocker for an evidence/scripts-only run.
- Landing: evidence + run note committed as 9081eba98 (worktree);
  prereg + instruments as 6604c4187. Merged to master (ff-only);
  rotation-b written 5 (social life) after the verified merge; lock
  deleted. Merged locally, pending ship.
