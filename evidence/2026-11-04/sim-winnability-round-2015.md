# Winnability round 2015Z — Loop B coordinator evidence (run fleshout-loop-b-20261104T2015Z, axis scale-onramp / winnability chain)

Loop A live on food-economy throughout (1933Z exphurt-land) — NOT touched.
No gate/price/deed change in either arm. Zero src/js in both arms.
Re-point queue check at run start: (1) toggle run DONE (togglepin-b);
(2) flee-repair build DONE (landed + confirmed GO 0820Z); (3) standing
accumulation DONE by the 1830Z run (standaccum DIAG-GO). This run takes
the 1830Z run's named next blanks (1) link-seeking probe and (2)
veterans-production, on the shared gearbar band 99101–99108, competent
verbatim, 150d death-aware.

Arm 1 sim-linkseek-b (DIAG-GO, judged strictly against its prereg):
the zero-link outcome on the gearbar band is a policy-design zero at
S4 — zero offer points on EVERY channel, on all 8 seeds (0 propose
verbs of any kind, 0 raids mustered or answered, 0 counters/accords/
raid/national/global ever pending, 0 primacy bids, 785 talkTo/endConvo
pairs with 0 convoTurn calls, 0 aid offers or begs presented). Villages
ARE met: every seed knows 3–6 other villages by day 4, opinions move
(to 10+ on 6/8, best 26), "Word will travel" lines fire both valences
on 7/8, scholars cross other villages' tiles mid-day on 4 seeds (10
landings) with no offer following. Refusal is DEAD as an explanation
(refusal requires an offer) and never-met is DEAD too; the engine is
exonerated twice over (askplus proved the road works when asked, 23/23
proposals ending in a link; this arm proves the baseline never steps
onto it). Competent's talkRound opens with talkTo and immediately
endConvo('left') — zero exchanges; held talk is env-gated off by
default; competent.js contains ZERO references to any propose/tend/
study/answer link verb. Wall (this corpus, baseline observations):
wins 0/8, national/table 0/8, wave-4 unlocks 6/8, wave-4 faced 4/8
(99101, 99103, 99104, 99105 — matching standaccum exactly), wave-5
0/8, readiness-5-ready days 0/8, median run-days 94 (linkseek notes
standaccum reported 116 on the SAME eight day-counts — a
median-convention difference, not trajectory drift; every seed's days
and final capped standing reproduce standaccum exactly). Deaths 515
total, 307/515 combat-shaped (60%) — villages die fighting, not
starving, on this band. Commits post-merge: aaa9f2762 (prereg),
00d67458b (instruments + proof 33/33), f6ee419ec (pilot + evidence).
Worker evidence cites pre-rebase hashes 0db9c5068 / 2200bd886 /
8a893360c; content identical, hashes rebased (see Infrastructure).
Corpus perseed-linkseek-b/ (8 files).

Arm 2 sim-vetprod-b (DIAG-NO-CANDIDATE, judged strictly against its
prereg): all 8 seeds classified, none forced, none OTHER — 4
NEVER-FACED-WAVE4, 3 KILLED-DEAD-KILLER, 1 KILLED-LIVING-SHORT, 0
FACED-NO-KILL. NO dominant class and NO pre-named split reaches the
5/8 bar: dominant class 4/8, split S1 ("kills don't stick") 4/8,
split S2 ("no kill opportunity") 4/8 — an exact 4/4 tie, and the
refusal to crown a single lever IS the finding. The shortfall is two
equal problems: half the villages never meet wave 4 at all (99102,
99106 unlocked-but-unmet — door open, zero wave-4 fights in 116/59
days; 99107, 99108 never unlocked, peak standing 50/20), and the other
half meet it, kill it, and lose the killers within days (8 wave-4
kills across 42 fights on the four facing seeds; kill-to-death spans
5, 0, 2, 7, 14, 0 days, median 3.5 days; zero killers alive at end on
the three killed-dead seeds; maximum simultaneous living wave-4
killers 1 on every seed). No seed faced wave 4 without killing, so
the binding failure on this band is AFTER the kill, not in the fight
— but the fight-interior verdict (finishing binds) is not
contradicted, only bounded: kills happen; they don't stick. Peak and
kill never coincide (99101 peaks day 98, first wave-4 kill day 101;
99104's peak day 121 is the day its two-kill veteran dies in the
wilds). This run reproduces standaccum's band EXACTLY on every shared
number (days, end reasons, peak gated/raw standing, faced seeds, vet
maxima) — the recorder did not perturb what it measured. Commits
post-merge: 9406c0139 (prereg), abd78181c (instruments + proof
13/13), 2da20323c (pilot + evidence). Worker evidence cites
pre-rebase hashes b35e915fc / e98b7121e / 633cfa9a4; content
identical, hashes rebased. Corpus perseed-vetprod-b/ (8 files).

Telemetry deviation check on both corpora: REFUSED by the tool
(recorder-corpus shape, same as the 1830Z run); baseline NOT rolled,
no LOUD lines, no investigation item.

Infrastructure: master moved twice under the run (96ee2136a
journey-endgame r130 closeout; 26f359fe1 journey-deepening r100) —
the first linkseek --ff-only merge correctly refused on the moved
master; both branches rebased clean (zero file overlap between the
arms and between arms and sibling commits), proofs green after every
rebase (linkseek 33/33, vetprod 13/13) and on merged master.
Safe-commit index clobber hit the worker commits (both workers
reported it, repaired via HEAD-blob cacheinfo, commits verified
correct). Coordinator note, disclosed: the linkseek worker's final
report text never arrived as a handoff (its delivered final turn was
only a heartbeat check-in reply); its committed evidence file is
complete and is the authoritative record — verdict, numbers, commits
and proofs above were verified from the branch, not from the missing
handoff. Both trees released done-merged, branches deleted, final
reap run, main tree clean. No push, no bump, no live verification
(ship loop owns deploys).

scale-onramp stays converging (NOT converged): diplomacy-absent is
now EXPLAINED (S4 policy-design zero, not refusal, not engine stall,
not failed courtship), and the veterans shortfall is now SPLIT into
two equal problems rather than one lever — but the full seat is still
unwon, wave-5 kills still 0, readiness-5-ready days still 0/8. Next
blanks, in order: (1) two-track veterans work — track A, encounter
opportunity for unlocked-but-unmet seeds 99102/99106 (why nothing
comes through an open door; spawn/encounter routing, NOT demand
numbers); track B, killer survivorship / simultaneity for the
killed-dead seeds (median 3.5 days; the bar needs two alive AT ONCE
and current survivorship never supplies that window; the existing
default-OFF VETSHAPE instrument, living-OR-DEAD killers count, is
the named probe for track B's shape question, NOT a default flip) —
do NOT move readyDemand numbers on this evidence (the never-faced
half has no kill for any demand shape to count, and the killed-dead
half's problem is the living-only window, not the number 2); a next
arm wanting a GO must carry a two-track design or re-band to a
population where one half dominates — it must not lower the bar to
4/8 after seeing the tie; (2) veteran-word collision naming pass
(the game calls hardened monsters AND blooded villagers "veterans"
on screen — a design eye, not a sim, not a mechanics change);
(3) STEVE-CALL — who should ask (baseline competent is scale-free
by design, so asking-in-competent vs a climb policy vs villager
agency is a design ruling, not a measurement); (4) HOLDING, not
asking (sibling polity work owns in part — do not duplicate; any
new arm here judges holding, not end-state diplomacy and not
asking); (5) standing accumulation, part 2 (re-measure release once
a village both meets wave 4 and keeps two killers alive); (6)
carried from 1830Z: tend band-count rule (two of three bands), LIVE-
SIM fallback firing, approach guardrail 12-seed re-test on
99601–99612, BELONG clear on a belongseek substrate, 99101 hold-beat
re-finding per anchor, wave5faced label rename. NO gate/price/deed
arm follows. food-economy untouched (sibling Loop A). Claim deleted;
lock deleted.
