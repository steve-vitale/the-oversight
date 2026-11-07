# Journey crisis r154 — RUN NOTE (Lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7 (succession
next) at closeout. Run r154 follows r153 (social life, landed 2026-11-07).
Base at closeout: master a2e005cbe (r112) + the r154 fix below. The run
TIMED OUT at 14:57 CST with the fix proven but the panel unrun; the main
session finished it (proof re-run + panel + analysis + this note + merge).
Prereg: goal hidden_files/evidence/2026-11-07/journey-crisis-r154-prereg.md
(seeds 13501–13505, fresh band, verified). Policy oracleV2, 120d death-aware
+10d tail, sequential. Determinism proof: re-run of 13501 byte-identical JSON
+ all 5 transcripts identical. Telemetry check: quiet (no LOUD lines).

## HEADLINE — the betrayal softlock is root-caused, fixed, and proven

r150 seed 13402 froze on day 18 (Wren betrays, player flees across a
barrier, 270,599 "No path there." + 270,599 Wren stall lines, gameDay frozen).
The r154 repro run diverged before any betrayal fired, so the run STAGED the
trigger (probe scripts/probe-betrayal-stall-r154.js, seed 13611: travel 3
tiles out, betrayal fight at low HP so oracleV2 flees every round) and found
TWO defects, both required:

1. party.js: the hostile-fight advance loop inlined the ROUND announcement
   and NEVER called tbRoundWrap — so in any fight with a living hostile
   human (betrayal, uprising, justice) the whiff-forever guard, the order
   re-sort, the belltoad chorus and the eviction-wall expiry never ran.
   (game.js:37922 even notes "re-sort never ran there either.")
2. game.js: the whiff guard only counted MONSTERS as foes (liveMon), so a
   pure betrayal fight (hostile human, no monster) could never fire it even
   if tbRoundWrap ran.

Fix (commit d6b3c6d0b, [needs-eyes]): the party.js loop calls tbRoundWrap at
the wrap point, exactly like the sync tbAdvance, and stops if the guard ended
the fight inside the wrap; the guard counts monsters OR hostiles as foes and
marks hostiles fled, so the betrayal tbEndCheck resolves the fight as
'betrayal_routed' with the honest line "It comes apart — neither side can
reach the other. The fight breaks off; they back away into the dark."

Proof (scripts/test-crisis-betrayal-whiffguard-r154.js, 10/10, re-run green
on the rebased tip): Case A seed 13611 guard-ON resolves betrayal_routed,
guard fired, failed moves bounded (was 25,999), clock advanced. Case B RED
control WHIFFGUARD=0 stalls again (the test measures the fix). Case C seed
13602 damaging fight resolves 'lost', guard does NOT fire (no over-fire).
Panel: SOFTLOCK seeds = 0/5. The r150 softlock is CLOSED.

Regression provenance: 6 targeted betrayal/party tests fail at load with
`ReferenceError: Text is not defined` (test-betrayal, test-betrayal-fixes-
20261008, test-betrayal-aftermath, test-betrayal-spawn-stacking, test-party,
test-tbadvance-stale-loop-20261011). All 6 fail IDENTICALLY on the pristine
base (main tree a2e005cbe, no fix) — pre-existing stale eval boilerplate
that never loads the Text module, NOT caused by this fix. (Two more files
fail differently on both bases — test-betrayal-diegetic TypeError, test-party-
betrayal-shadow Game.state — also pre-existing, outside the 6.)

## PANEL (5 seeds, oracleV2, 120d)

| seed | end | days | raids | gorge | sorties | convos | alive | pantry |
|------|-----|------|-------|-------|---------|--------|-------|--------|
| 13501 Denver | game-over (died out) | 88 | 4 | 5 | 6 | 5 | 0 | 2,983 |
| 13502 Miami | horizon | 120 | 10 | 25 | 6 | 8 | 9 | 28,000 |
| 13503 Portland | game-over (scattered) | 101 | 9 | 15 | 5 | 8 | 1 | 0 |
| 13504 Atlanta | horizon | 120 | 11 | 29 | 6 | 8 | 1 | 32,124 |
| 13505 Minneapolis | game-over (died out) | 57 | 5 | 7 | 1 | 8 | 0 | 497 |

Sorties: 24 attempts, 18 ok, 6 refused, 6 cleared. Sortie fights: 29.
Gorge: 81 nights, 92,227 kcal. Convos driven: 37, fabricHits 0.

## VILLAGE ASSESSMENT (plain words)

- 13501 Denver died out by day 91: five villagers dead in combat by day 12,
  pantry hit zero at day 50, Olivia starved day 49, Alison's wound wouldn't
  close day 44. The village bled out early and never recovered.
- 13502 Miami reached the horizon with 9 alive and a 28,000 kcal pantry: the
  strong village. Grace died (mourned by Funke), Andres died on a sortie
  day 90. It held.
- 13503 Portland scattered on day 101: pantry empty, third hungry day, people
  walked in different directions. Anika starved day 78; Victor died on a
  sortie day 80.
- 13504 Atlanta reached the horizon with ONE person alive and a 32,124 kcal
  pantry: the lone-survivor horizon. Elif died day 60, the mantle passed to
  Tashi, who died day 61, the mantle passing to Hassan — two successions in
  two days, and the village recognized each new bearer ("You're not Elif." /
  "You're not Tashi. You'll have to earn this face.").
- 13505 Minneapolis died out by day 58: ten dead by day 58, all monster /
  wild / night. The village was eaten.

## VERDICTS (prereg bars, §14 binding)

- C1 (bend, not break) GO: all 3 game-overs have named causes, none a
  siege-mechanic failure — 13501 died out ("No one is left to pick up the
  Codex"), 13503 famine scatter ("Haven couldn't hold... people started
  walking"), 13505 died out. Horizon 2/5. Softlock seeds 0.
- C2 (episodes fire + gates hold) GO: raids fired on all 5 seeds; fought
  resolutions present; D1 snapshots all delayed >= 3 attempts (24/24);
  deltaBad empty; D3 drift unknown = 0. MISSED-WINDOW corrected = 7
  (descriptive, below the >= 8 instrument-look trigger).
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable case
  fired or was refused with a recorded reason; no boundary-firable case
  unfired. (The R126 ok:false rows are the 6 recorded no-fighters refusals.)
- BENCH (descriptive): 6 refused sorties; shape mixed, no single lever
  (gate-one-short 2, supply-empty 3, availability-drain 1). Alive-bench
  subset (primary): 3 refusals, nodeAway excluded on all 3 — the r150
  finding REPEATS (nodeAway predicts alive-bench refusals 3/3).
- C3 (people check) GO: all 37 driven transcripts read in full (below);
  fabricHits = 0; conversations meet the meaning bar. No-repeat driver fix:
  zero unforced consecutive repeats in the judged panel.
- WRAP-CHECK GO: 37 transcripts, 37 marked, unmarked = 0.
- C7b (instrument) GO: corpse-cause tallies match the corpse record on all
  5 seeds (famine 13501/13503, disease 13502, wound 13501/13504). NOTE: the
  corpse record misses BURIED dead — Elif (died d60) and Tashi (died d61)
  are absent from the 13504 corpse list (buried by the village the night
  they died). The tallies match the record, but the record is not a
  complete death census. See metric review.
- Q1 betrayal softlock: ANSWERED (root-caused + fixed + proven + panel
  clean, 0 softlocks).
- Q2 second strict multi-monster clear: ANSWERED YES — 8 of 12 multi-monster
  sets cleared (incl. a 4-monster set on 13502 d90 and 3-monster sets on
  13502 d80/d107). r150's single first clear is now a pattern.
- W1 count: unchanged 66/4/4/1 (no same-set re-musters, no ok sorties or
  full clears after a refusal on the same set this panel).
- G-ID watch: 10th panel at zero id-matched gorge-after-clear (0
  id-matched, 0 returns; name-matched 5 for comparison). Watch stays open.
- Fight-1 damage threshold (descriptive): okSorties 18, broke after fight-1
  7, cleared 11. Breaks: vTaken [93, 76, 1704, 14, 31, 103, 74] — ALL 7
  opened on a death/flee (vDie/vFlee). Clears: vTaken [71, 13, 37, 6, 9, 10,
  0, 33, 32, 15, 22]. The shape does NOT hold as written: the "breaks" half
  holds via the opener clause (even the 14-vTaken break opened on a flee),
  but clears no longer cap at ~20 (a 71-vTaken clear, plus 37/33/32). See
  metric review.

## C3 PEOPLE CHECK (37 transcripts, read in full)

All 37 meet the meaning bar except the filed items below. What works, seen
repeatedly this panel: unfinished-thread callbacks across days (Elena's grief
re-opened 7 days later, Tariq's protector thread, Ruth's "what's been
happening" 10 days later); mourning grounded in REAL deaths (Somchai d78 →
Antwi d85; Priya d71 + Felipe d73 → Elena d74; Stan d81 → Elena d81;
Elif d60 + Tashi d61 → Elena d62; Tomás d104 → Mandla d108); the favor
system (ask / requirements / decline with a closed subject that recap
respects — d49 forage help; the decline has a consequence: "They won't ask
twice"); party naming (Funke/Riley/Elena/Ruth each suggest a name; "The
Company" picked 3×, "The Hearth" offered once); teaching (Wood Sorrel,
Feral Rice, Sweet Manioc, Cashew, Field Mustard, Lily of the Valley);
villager-initiated link ideas (Victor → Ashford); the betrayal investigation
(site / witnesses / bribery / moot / vote) playing out coherently in 3
seeds; succession recognition (Elif → Tashi → Hassan in two days).

FILED (engine-side, not fixed here):

1. d52 LOOP (NEW, this run): 13501 d52 (Anel, Russian-only) alternates
   [dlg:subject] ↔ [nv:nod] six times and hits the driver cap — the subject
   menu re-opens with no forward motion in a no-shared-words conversation.
2. SUBJECT-MENU ENGLISH (NEW, this run): [dlg:subject] serves fluent
   English replies ("Yeah? What's up?" / "Sure — what's on your mind?") to
   NPCs who speak no shared words — Anel d52, Sigrun d36 (2 conversations).
3. SIGNING-NOD PAIR — GRADUATES (prereg rule, >= 3 conversations): the
   nonverbal nod response opens with the verbatim "They answer at length.
   They nod back..." in 13501 d44 (Anel), 13502 d17 (Boris), 13502 d36
   (Sigrun). Content fix item now (r150's single Joseph sighting + these 3).
4. RECAP-PREFIX STACKING (NEW, minor): "Okay, but what about Still on that
   personal stuff." (13503 d16) and "Here's the thing: As I said — Still on
   your read on people here." (13505 d31) — the recap prefix collides with
   the recap body.
5. Naming-stance wobble: NO 4th sighting (the naming DEBATE is a live topic
   — White Noise/Big-Bane, Inspiration/Big Ugly, Sunback/The Ugly Beast —
   with different monster names per seed; that is the topic working, not a
   wobble). Watch stays open.
6. Filed loop items re-checked: recap respects a closed subject CONFIRMED
   (d49); mourning/closer templates vary per villager CONFIRMED; Jasper
   "You two" garble no sighting; Eli/Cheyenne stock-lines-as-memory no
   sighting; cap line no sighting this panel.

## REACHABLE / FUN / WINNABLE

Reachable: crises fire on all seeds, sorties answerable, conversations rich
and reachable. Fun: the conversation system is the star this panel —
callbacks, grounded mourning, naming, teaching, favors with consequences.
Winnable: 2/5 reached the horizon; 0 wins (this leg judges crisis survival,
not the endgame). The village bends (scatter, deaths) but the crisis
mechanics hold — C1/C2/C2b all GO, and the softlock that froze r150 is gone.

## METRIC REVIEW (§14 — for the NEXT run)

- Fight-1 threshold: re-frame as "breaks open on death/flee OR vTaken
  >= ~70; clears open on vKill regardless of vTaken" — or drop the vTaken
  threshold and judge on opener outcome alone. The current "clears <= ~20"
  half is falsified (71/37/33/32 clears).
- MISSED-WINDOW: report per-DAY missed windows alongside the per-object
  count — one missed day (13504 d66) covers 4 lingerer objects and reads as
  4. Corrected 7 this panel (re-baseline was 2; trigger stays >= 8).
- C7b: cross-check the corpse tallies against the say-line death record as
  well — buried dead (Elif, Tashi) never reach the corpse list. The bar
  (tallies match the record) holds, but the record undercounts deaths.
- The R126 ok:false rows are refused sorties with a recorded reason
  (no-fighters), not unfired cases — the cross-check should treat a refusal
  with a recorded reason as ok.

## INSTRUMENT / TELEMETRY

- Driver/analyzer: r150 verbatim + frozen-day detector + r154 filenames/
  seeds/origins/W1 count + drift dedupe + no-repeat pick rule. Determinism
  proof: 13501 re-run byte-identical JSON + identical transcripts.
- Telemetry: quiet (defendedFights, playerFights, latelyDefenseCount vs
  crisis baseline; no LOUD lines). Baseline NOT rolled (single 5-seed panel).
- R57 D3 death mismatches (Andres 13502 d90, Victor 13503 d80) are
  muster-explained (Dina class, closed) — sortie-leader deaths the
  deathsDuring record misses (Q11 gap, still open, descriptive).
- R59 TRUE early count 0 (legacy method 2 — the Andres/Victor sortie
  deaths, correctly excluded as aidFight vKill).
- R70 phoenix burns: 0 on all seeds. R88 tick-part sampler: no
  instrumentErrors on any seed. R58 refused-sortie book check: refused
  sorties don't consume a slot (working as designed).
- GORGE attribution: 81 nights, 92,227 kcal; ambiguous attributions 13
  (Big Loud nights 87–89 on 13502, Big Beast 60–61 + Big Ugly 91 on 13504).

## CLOSEOUT (main session)

- Fix commit d6b3c6d0b rebased onto a2e005cbe (r112 tip); proof test 10/10
  re-run green on the rebased tip; safe-commit index clobber struck and was
  repaired (ls-tree + update-index, status/diff clean, hash verified).
- Evidence commit: this note + 5 panel JSONs + analyzer output.
- Gate: check.js --quick (see gate log in goal hidden_files).
- Merged ff-only to master; worktree released; lock deleted; rotation-b 6→7.
