# Run summary — flesh-out loop run fleshout-20261017T1223Z (2026-10-17)

**Axis:** scale-onramp (blocking; STANDING DIRECTIVE active — directive lift remains a Steve call).
**Arms (3, planned up front, one shared axis, pre-registered GO thresholds):**
1. **sim-pyrrhic** — attrcensus a2 named fix: extend tbEnd's per-kill ledger to `'lost'` (waveKillLog + trickSummaryFor + codex `'slain'` + villageSlain; loot/carcass stay forfeit; NO scoreLedgerKill — deed half is Steve's steve-call, out of scope). `src/js/game.js` only.
2. **sim-vetshape** — VETSHAPE=1 default-OFF instrument: waveCombatReadiness veteran bar counts veteran kills (living-or-dead, from the kill ledger) instead of 2 living veterans. `src/js/standing.js` only. Instrument for Steve's #427 call — game default unchanged.
3. **sim-takeseat** — TAKESEAT=1 default-OFF policy layer: drive the real `Game.tableTakeSeat()` when the invitation is staged+announced on base courtship (feastblow no-driver gate). `scripts/policies/` only, zero `src/js`.

**Sibling loop B** live all run on food-economy (fleshout-b-2026-10-17T11-06-35Z): cookwin-b KILLED/reverted, flowdrain-b KILLED (CONCEPT-DEAD), feastvoice-b landed, nothingedible-b landed (37fb259e/18ed80bb), cookdrive2-b KILLED at pilot, bankxp-b KILLED at pilot. Zero file overlap with my arms; their trees never touched.

## Results

**sim-pyrrhic — PRIMARY GO (LANDED 94f78198).** 8-run re-sweep (seeds 1809–1812 × {leadfeast,belongfeast}, tribfloor pre-seat, 180d): 3/3 known pyrrhic cases now fully attributed (waveKillLog+trick, codex 'slain', villageSlain≥1); 0 unattributed pyrrhic kills (pristine same-base control: 3). Proof 13/13 RED→GREEN. Guardrail: det-gate 7/8 byte-identical; 1/8 diverged (leadfeast-s1809, 45d→96d) — bisected to the designed villageSlain→counterTeachable→beasttricks teaching channel (Steve's "village learns together" firing as intended), wall metrics identical both sides, no new death mode. Subsidiary steve-call raised: is villageSlain-fed beasttricks teaching from a pyrrhic kill the intended generosity? Evidence: evidence/2026-10-17/sim-pyrrhic.md.

**sim-vetshape — PRIMARY GO (LANDED 9d7ce521).** 32 runs (8 fresh seeds × {leadfeast,belongfeast} × {control,VETSHAPE=1}, pre-seat, 180d): wave-4 unlocks armed 4/16 vs control 1/16 = +3 (threshold met exactly). The 3 new unlocks were pure shape change (armor stayed short). Guardrails: starvation 12=12, median survival 182d=182d, no new death mode. 1/4 armed unlocks died d155 in the wave-4 meatgrinder after unlocking d89 — "opened a war it couldn't staff," reported as the instrument's surfaced consequence. Village assessment: 10/10 wave-3 killers across the 3 new unlocks were DEAD at end (all scholar TB fights; zero companion-agency w3 kills) — the hold fiction now counts the dead, a real consequence for Steve's #427 ruling. Proof 16/16 RED-pinned, det-gate byte-identical. Evidence: evidence/2026-10-17/sim-vetshape.md.

**sim-takeseat — PRIMARY GO (LANDED 74acf178).** 32 runs (fresh seeds 9701–9708 × {leadfeast,belongfeast} × {armed,control}, FEASTSCALE_R13=1, SEATDRIVE=0, 180d): tableDone armed **13/16 vs control 0/16** (threshold ≥+3). Every announced armed run sat the same dawn it was announced (13/13); engine refusals (pre-day-90 floor, never-announced, early death) honored, never forced. Control replicated the feastblow substrate (staged 14/16, tableDone 0/16). Secondary: wins 0/16 both arms — the modal opens and nothing on this road answers it (named next gate, not a miss); seat-earned median d106. Guardrails: median survival d182 vs d165; national 11/16 vs 10/16; no new death mode. Sense-reads: arrival chain coherent (set → Inefficiency → announced → scene → audit, honest numbers); villagers DO react (r11 once-per opener fired 8/10 on the probe; verbatim lines in evidence). Blank filed: the 3-line waiting pool repeats verbatim. Evidence: evidence/2026-10-17/sim-takeseat.md.

## Wall numbers this run

- Pre-seat substrates (pyrrhic/vetshape): national ~3/8–11/16, table ~6/8, wins 0 (pre-seat by design), wave-4 unlocks 5/32 on the vetshape substrate (4 armed + 1 control), median survival ~145–182d.
- Feastscale substrate (takeseat, SEATDRIVE=0): national 21/32, **tableDone 13/32 (13 armed + 0 control)**, wins 0/32 — the national→table chain now runs to the door on base courtship; the next binding question is the modal driver (what answers the opened modal).
- **scale-onramp stays converging.** Three genuine wall movements: (a) the take-seat brick completes the base-courtship chain to the table door; (b) the veteran-bar shape is measured as the bind with a default-OFF instrument feeding #427; (c) the pyrrhic ledger blank is closed (attribution half). Directive lift remains a Steve call.

## Metric review

All three primaries were pre-registered with honest GO thresholds and honored: pyrrhic 100% attribution (met), vetshape +3 unlocks (met exactly — not re-scored), takeseat +3 tables (exceeded, 13). No metric proved wrong mid-run. The takeseat secondary (wins) stayed 0/16 both arms — recorded as the named next gate (modal driver), not a re-scored miss. The vetshape "opened a war it couldn't staff" death is reported as consequence, not trip.

## Telemetry deviation check

`telemetry-check.js` vs scale-wall baseline fired 3 LOUD per glob (national 12→0, table 16→0, wins 16→0) on the takeseat and vetshape globs — ALL EXPLAINED as instrument-schema artifacts: the check expects keys national/table/wins/exiled; takeseat JSONs carry nationalDay/nationalRank/tableWaiting/tableDone; vetshape JSONs carry no wall keys. Investigated same-run; baseline NOT rolled. Real wall numbers are in the evidence files above. Filed to sim-findings as a method gap (canonicalize wall keys or give the check a key mapping).

## Village assessment (plain words)

The village that feasts together now reaches the table's door: on the feastscale road, invitations that used to hang in the air unanswered for 90+ days are now sat the same dawn they're announced, and the villagers remark on the arrival like people (mara_vasquez: "Did you see their faces? Too many angles. I keep wondering what they want from us."). The readiness gate's veteran demand is confirmed as the shape of the wave-4 bind — and the uncomfortable truth it surfaces is that the "veterans" who blood the bar are almost always already dead, killed in the scholar's fights; the village counts its fallen to open a war it then has to staff. The pyrrhic fix means a mutual kill finally teaches the village something — the d21 Clarence Wang vs Highbeam Deer fight reads as one breath: the deer falls, the beam fires from death-throes, you go down, and the feast that watched learns the trick.

## Infrastructure

Mid-run master movement ×2 (loop B nothingedible-b 37fb259e/18ed80bb; playtest journey-establishment 7a573e1b): rebase-then-merge inside each worker tree + proof re-run green on the new base + unpiped MERGE_EXIT --ff-only merges; no conflicts. All three trees released (merged), removed, branches deleted. Main tree clean. Claim + lock deleted at run end. No push/bump — pending ship.
