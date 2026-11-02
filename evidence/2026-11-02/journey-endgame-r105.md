# Journey endgame r105 — THE KILL WALL, MEASURED: BIG PARTIES, LONG FIGHTS, ONE BANKED VETERAN AT A TIME (lane B, 2026-11-02)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at closeout, verified by re-read after landing
(closeout write per r103/r104 precedent, so a failed run cannot skip
the leg). Run number basis: last numbered Lane B run is r104
(succession, landed 2026-11-02). This run is r105. Slug deviation:
none this run — journey2-endgame was free (no local branch, no
directory) and registered clean; heartbeat verified in the registry
after registration (09:00:06Z) and re-verified at every step
(09:09, 09:15, 09:24, 09:34); one heartbeat exec backgrounded
without delivering, but the registry read each time proved the
heartbeat had landed, so no step ever ran on a stale heartbeat.
Base: master 26703bd81 at registration (git pull already up to
date). Main tree clean at pre-flight (0 files), disk 27%.
No lock existed at run start (no stale-lock recovery this run);
fresh lock written (2026-11-02T08:55:56Z), to be deleted at closeout.

Substrate r101 EXACTLY (capable + deedhunt + vetcommit + greedy
deferral defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control
clean). 180d, death-aware. NEW vs r101, both read-only
instrumentation: the three gaps r101's metric review named
(KILL-ANATOMY, MENTION-KIND marker-first, M17 surge arming/spend
split). Probe: `scripts/probe-endgame-r105-20261102.js`. Analyzer:
`scripts/analyze-endgame-r105-20261102.js`, full output in
`evidence/2026-11-02/journey-endgame-r105-analysis.txt`.
Analyzer exit 1, PRIMARY NO-GO, ALL NO-GO — driven by M3b-peak,
M4-wave5-or-full, W5-question, and M5-voicing-canonical, each
explained below as run outcomes, not instrument failures (M2c,
M2d, VETCONV, LOSSKIND, M17, M18, M20, M21, M22,
KILL-ANATOMY-coverage all GO). No src/js change this run.

Seeds: 89501-89503 waves (Arm A), 89504 forcedrift control,
89505-89507 wavesnw (Arm B, waves + NOWALKIN_W4). Seeds verified
fresh: no prior endgame note uses them, and the full evidence-tree
substring matches for 89501-89507 are pantry-kcal values and float
fragments (e.g. 17.8950785), not seed uses. Pilot
(89501+89505+89504) met the prereg gate (2 sats, census fights,
1 classified village loss), so the run expanded to the full 7;
pilot seeds reproduced BYTE-IDENTICALLY in the full sweep (JSON +
transcript snapshotted to `evidence/2026-11-02/r105-pilot/` before
the sweep overwrote them). Determinism leg: DET GREEN
byte-identical on 89501 (2x 120d).

## Village assessment, in plain words

Five villages won the lesser seat, two died. No village won the
full seat, and no village unlocked wave 5 — the thirteenth block
in a row with the full seat unwon. But the wall now has
measurements on it, not just a name: 24 census fights produced 4
veteran-counted kills, and no seed ever held 2 living veterans at
once (peaks 1, 0, 0, 0, 1, 1, 0).

- 89501 (waves): WON LESSER, beloved/light, announced d90, sat
  d94. Nine alive, pantry 17,854. Three census fights: a Eulogy
  fled from, a Eulogy that fled, and the block's story kill — Ella
  Johnson put down the Eater on d94, the day the village sat. The
  Eater came as a feast scavenger ("circling the edge of the
  light"), the party fought it under FEASTED x2.53, chain-stunned
  it with screams for three rounds, and the player landed a 304
  spear strike before Ella's killing blow. Peak veteran 1. The
  full-seat gap is w4 2/3 + w5 0/2; the unlock bar reads
  veterans alone (1 of 2, armor 8/4, armed 9/6, tricks 20/3).
- 89502 (waves): SCATTERED d125. Five people left, pantry 0 — the
  honest scattering line again: hunger, not death, broke it. Three
  fights: a Suburb that ended without a blow (0 damage), a Reunion
  that killed Rafael Torres while the party managed 20 damage
  against its 1200 HP, and an Eater fled from without dealing
  damage. Never announced. The unlock bars read short on all
  three: armor 2, weapons 5, veterans 0.
- 89503 (waves): WON LESSER, feared/light, announced d90, sat
  d90. Nine alive, pantry 12,351. ONE census fight all run: a
  Eulogy that ended without damage. A lesser win with essentially
  no wave-4 fighting — the feared road carried by presence and
  pledge, not blood. Veterans 0 of 2.
- 89504 (forcedrift control): WON LESSER, relay/dark, announced
  d90, sat d90. Ten alive, pantry 4,500. One fight: an Algorithm
  talked down. The relay road stayed grey the whole run (lean
  0 to -35, never reaching the -40 dark threshold), voiced twice
  ("YOUR REGISTER IS SHIFTING TOTAL", "BACK IN THE MIDDLE"),
  but crossed no band — M5's NO-GO this block is the missing
  crossing, not missing voicing. Branch dark vs band grey is a
  reporting ambiguity, clarified below, not a game bug.
- 89505 (wavesnw): NO-SUCCESSOR LOSS, zero alive, pantry 0. Five
  fights: two Influencer kills and three monster-flees from
  small 3-person parties. The second kill is the block's
  outlier: a SOLO player kill (party of 1) of an Influencer on
  d136, 391 observed damage of a 637 pool in 4 turns. It did not
  save the village — peak veteran 1 (d98), zero living veterans
  at the end, because the two killers were never veterans at the
  same time and the village died around them.
- 89506 (wavesnw): WON LESSER, feared/light, announced d90, sat
  d91. Five alive, pantry 11,559. The bloodiest seed: 8 fights,
  3 villager deaths (Tom Baker to an Audit d48, Zoltan Nagy to a
  Reunion d57, Jovan Milic + a generated villager to an
  Influencer d81), 1 Reunion kill d78 (734 observed damage of
  830, 21 turns, party of 6 — the most complete observed kill
  in the block), 3 other-ends, 1 monster-flee. Peak veteran 1.
  Its full-seat gap is w5 alone (w4 complete); the unlock bars
  read weapons 5/6 + veterans 1/2.
- 89507 (wavesnw): WON LESSER, feared/light, announced d90, sat
  d107 after a 17-day deferral (guard: losses). Eight alive,
  pantry 10,912. Four fights: 2 other-ends, 2 villager-flees
  (including a double-Suburb flee, 637 observed damage of a
  3299 pool). Gap w5 alone; veterans 0 of 2.

## Leg questions, answered

1. KILL-ANATOMY — ANSWERED, FIRST MEASUREMENT. By census-fight
   outcome (waves seeds, multi-turn fights only, 24 fights):
   - vKill (n=4): party median 6, turns median 9, observed
     damage median 702 of pool median 853, share median 0.82.
   - vFlee (n=4): party median 6, turns median 7, damage median
     462, share 0.52 — big parties hurt it halfway, then run.
   - mFlee (n=5): party median 3, turns median 5, damage median
     66, share 0.07 — small parties do not drive monsters off
     by damage; monsters leave small parties early.
   - vDie (n=4): party median 6, turns median 12, damage median
     73, share 0.08 — long grinding fights where the party
     barely scratches a 1200-HP monster and someone dies.
   - otherEnd (n=7): turns median 2, damage 0 — fights that
     never engage (Suburb escapes, day-boundary closes).
   The kill recipe this block: a full party (6-7) dealing most
   of the pool over ~9 turns, plus control — the Eater kill
   rode a 3-round scream-stun lock under FEASTED x2.53 and a
   304 player spear strike. The solo Influencer kill bounds
   the rule from below: a lone player CAN kill, but one kill
   does not bank a veteran pair.
   TWO CAVEATS, both load-bearing, both stated so the table is
   not misread: (a) observed damage is a LOWER BOUND, not a
   total — ZERO fights closed 'over' (16 ref-change, 7
   day-boundary, 1 day-end), so the last snapshot always
   predates the resolution tail; the Eater kill reads 543/960
   in anatomy but 1065+ in the transcript. True kill shares
   are higher than 0.82, and the ordering (kill >> flee >>
   die) is the finding, not the decimals. (b) feastedAtStart
   0/4 kills is ALSO a lower bound — it samples feastedActive
   at post-daily, which misses evening feasts; 89501's kill
   was fought under FEASTED x2.53. Never cite 0/4 as "kills
   are unfeasted."
2. W5-FORK (cleaned, positive list) — ANSWERED AS
   NEVER-ARRIVED, EVERYWHERE, BY INSTRUMENT. No seed reached
   uw=5, so every fork class is no-uw5 by construction — but
   this block's cleaned reading needs NO hand correction,
   unlike r101's: the marker-first kinds correctly classify
   the Nielsen war-table lines as 'ability-text' (89503,
   89506, 89507), every SYSTEM line as 'broadcast', and
   Rerun move lines as 'buff-move'. Cleaned-presence
   (presence/crew-beat only) is 0/7 by instrument. Residual
   'other' firstLines, inspected: a Codex unlock line
   (89501 Rerun) and a Rerun fight telegraph (89507, 38
   mentions, "winding up Rerun — lands next beat") — both
   non-presence. Next run's kind rules should add 'codex'
   and 'telegraph' kinds so 'other' empties.
3. WALL CONTINUITY — thirteenth block: the wall as "full
   seat" stands (0/7), and its shape is now MEASURED. The
   veteran bank never opens: waves arms banked 4
   veteran-counted kills in 24 census fights (Arm A 1, Arm B
   3), but peaks never exceeded 1 living veteran — kills
   arrive one at a time and the second never lands before
   sitting, scattering, or the killer's death. Standing sits
   at the 199 attractor on 4 seeds (89501, 89502, 89504,
   89507; raw peaks 202-362) with the defer5 veterans hold
   named. The wall is not breadth (89506/89507 gap w5 only)
   and not feasts (89501 feasted 13 days, 9 scale feasts) —
   it is two SIMULTANEOUS living veterans.
4. M5-VOICING — NEW NO-GO, RUN OUTCOME. The control voiced
   (2 notice lines) but crossed no band: lean 0 to -35,
   grey the entire run, 5 short of the -40 dark threshold.
   The bar requires crossing AND voicing; the crossing is
   what is missing. This is not an instrument failure — the
   lean trace is complete (32 samples, all grey) and the
   notices are real. Metric review may ask whether a grey
   road that voices twice should count, but the binding
   stands this run.
5. M17 SURGE SPLIT — VALIDATED, GAP CASE DID NOT RECUR. All
   6 surged seeds carry named combat spends; the new split
   had no surged-no-spend seed to classify. But the shapes
   are now distinguishable in the data: 89502 is armed but
   never spent (banked True, used False, no surgeDay — the
   genuine unspent shape), distinct from r101's 89403
   (used, unreceipted). The split instrument works; the
   capture-gap case simply did not occur this block.
6. VETCONV — ANSWERED, 6/6 reconciled, fourth straight
   block. Per-turn attribution holds everywhere (89506:
   tot=48, turns=55, delta=29, kills=1). Kill conversion on
   waves seeds (veteran-counted): Arm B 3, Arm A 1.
7. LOSS-KIND — ANSWERED, 2/2 classified. 89502 scattering
   (flag + SAY line agree, d125, 5 alive, pantry 0);
   89505 no-successor (0 alive).

## Pre-registered verdict

Analyzer exit 1. PRIMARY NO-GO, ALL NO-GO — on four verdicts
whose causes are run outcomes, stated plainly so the NO-GO is
not misread as an instrument failure:
- M3b-peak NO-GO: peak(>=2) 0/6 on waves seeds (peaks 1, 0, 0,
  1, 1, 0; only 89501/89505/89506 peaked 1).
- M4-wave5-or-full NO-GO (waves scope): 0/6 waves seeds
  unlocked wave 5 or earned the full seat. The control also
  failed to unlock — M4's waves-only scope and the control
  agree this block.
- W5-question NO-GO: no uw=5 seed, so the question is
  unanswered — but every seed's records are complete
  (complete=true 7/7), and the fork answer for this block is
  NEVER-ARRIVED on the instrument-cleaned reading.
- M5-voicing-canonical NO-GO: 0/1 — 89504 crossed=false
  voiced=true (see item 4 above).
- GO (all others incl.): M1-guard 7/7, M2-census (Arm A with
  fights 3/3), M2c (fights == opens 6/6, errs 0), M2d (8/8
  gate-named), M2b (3/4 dieFlag named + 1 day-window-only:
  89506 d48 audit), M8-exit-canon (5 mFlee fights, all
  codex-matched), M3-conversion (tally, Arm B 3 vs Arm A 1),
  M10-fullseat-gap (89501: w4 2/3 + w5 0/2; 89503: w4 1/3 +
  w5 0/2; 89506/89507: w5 0/2 only), M11-standing-peak,
  M12-bar-record, M13-release-snapshot (vacuous — no uw=5),
  M14-invite, M5b-relay-tabulation, M6-guard-named,
  M15-feast-census, M16-dusk-census, M17-surge-mode (revised
  split, 7/7), M18-ghost-scan (9th block clean; firstNameOnly
  Ruby x2 on 89506, unconfirmed, not ghosts),
  M19-grant-log, M20-standing-trace, M21-audit-crosscheck,
  M22-feast-hold (contribution shortfall still exactly 1500
  kcal median on every seed — eighth block),
  REG-r35-audit, REG-r37-satpenalty, VETCONV-recon 6/6,
  LOSSKIND-classified 2/2, KILL-ANATOMY-coverage 24/24.
- M4b: retired as a verdict per r95's metric review; INFO
  only (0/6 conjunction on waves seeds this block —
  expected, since no waves seed unlocked).

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89501's beloved/light finale, read in full
(announce-sliced transcript, finale section). The audit is
honest (14/7/5 + 2 wave-4 fought, 14 contests, 4 crises;
"the table does not rise. It prices."). The war path names
its fights and reads both bars plainly ("blood your
fighters (1 of 2 veterans)"), and notes the ascension
honestly ("The table notes 1 ascension from one village —
its terms improve accordingly. Nobody has ever seen that
before."). The beloved beat resolves: the audience as
constitution ("You made popularity into a constitution —
and constitutions, unlike ratings, don't dip"), naming the
unfilmed villages and the dead. The Oversight coda lands
its indictment from the beloved side, same device as r98's
and r101's beats, opposite path — the napping little ones,
the looking away done on purpose because the village was
busy. Watch item, not a defect: the war path says "They
faced The Big Thing and lived" for a fight the census does
not name that way — "faced" is true, "killed" is not
claimed, so the record stays honest.

Beat 2 — 89504's relay/dark finale, read in full (the whole
64-line announce-sliced transcript). The audit is honest
(22/6/7 + 1 wave-4 fought, 13 contests, 4 crises), the war
path itemizes ("They faced Old Ugly and lived", "blood
your fighters (0 of 2 veterans)"). The beat does something
the series has not shown on the relay road: it says yes to
the pods and names the price in the same breath — children
in uniforms, Kelsey and Ada watching the signer sign,
"the village has never been this quiet", the System
delighted and not understanding why nobody else is. Then
the merge: "Power immense. Self eroded." — and OUTSHONE:
Arlo acted while the player watched. The ending resolves
AND owes, which is the bar.
Watch item, clarified, not a defect: walkedBranch reads
'dark' while the at-sit band reads grey (lean -35). Traced
to source: the probe's walkedBranch mixes tableState().branch
with the telemetry table_won moral (probe lines 1237,
1368), while the game itself resolves relay branch to the
lean band (table.js:1042) with a dark tint for negative
lean in the grey band (table.js:1071, 1100 — "the dark
road is open" is the negative-lean grey text, not a band
claim). The beat is coherent with a grey-band, dark-tinted
walk; the field name is what mixes two sources. Next run
should source walkedBranch from tableState only, or report
moral and band as separate fields.

Live-build conversation check: not run — this run changes no
UI or dialogue code (instrument-only, zero src/js diff), so
there is no player-facing flow to verify at 390x844; the
r101 precedent (same leg, same instrument-only pattern)
likewise verified dialogue via transcripts. If a future run
touches dialogue UI, the live check applies then.

## Blank: instrument gaps filled (r101's three) + gaps for the next run (documented)

FILLED — all three r101-named instrument blanks, verified on
this block's data:
1. KILL-ANATOMY: anatomy on 24/24 multi-turn census fights;
   the decomposition above is its first measurement. The
   closeWhy caveat (0 'over' closes) was found BY the
   instrument and is reported with it, not hidden by it.
2. MENTION-KIND marker-first: Nielsen ability-text lines
   classify correctly on all three seeds that carry them;
   every SYSTEM line reads broadcast; cleaned-presence needs
   no hand correction this block.
3. M17 SURGE SPLIT: fight-turn receipt sampling + end-state
   landed; the armed-never-used shape (89502) vs the
   used-unreceipted shape (r101's 89403) are now
   distinguishable fields, not guesses.

DOCUMENTED, NOT FIXED — three instrument gaps for the next
run (all read-only, none worth re-running this sweep to
populate):
1. MENTION-KIND 'other' still holds two non-presence kinds:
   Codex unlock lines ("📖 Codex: Rerun — ...") and Rerun
   fight telegraphs ("winding up Rerun — lands next beat").
   Fix: add 'codex' and 'telegraph' kinds; cleaned-presence
   (presence/crew-beat only) is unaffected either way.
2. FEASTED-AT-START evening blind spot: post-daily sampling
   misses feasts held after post-daily, so a night fight
   under FEASTED reads feastedAtStart=false (89501's Eater
   kill). Fix: sample feastedActive at fight open, not just
   post-daily — or report the column as a lower bound, as
   this note does.
3. CLOSEWHY 'over' never fires: no census fight in this
   block closed via an observed f.over turn, so anatomy
   damage is always a lower bound. Fix (investigation, not
   a re-score): determine whether fights resolve between
   policy.fight calls by engine design, and if so, capture
   a closing snapshot at day-boundary close — the current
   lastSnap already IS that sample, so the gap is the tail
   damage between the last policy call and resolution,
   which only a fight-end hook can close.

DOCUMENTED, NOT A DEFECT CLAIM — the unlock wall's shape:
a village can meet breadth (89506/89507 gap w5 only),
feast (89501: 13 feasted days), and stand at 199, and still
never unlock, because rd5 demands 2 SIMULTANEOUS living
veterans and no seed held more than 1. Whether two-at-once
is the right bar — vs lifetime veterans, or a lower bar —
is a design question for Steve/Codex, not a bug report:
the mechanism is working as wired (defer5 hold, named
short), and the run's job was to measure it, which it
does.

## Metric review (for the NEXT run, not this one)

- KILL-ANATOMY: keep, with the two caveats (lower-bound
  damage, evening-feast blind spot) as reported columns, not
  footnotes. The next question the table now supports: do
  kills require a damage THRESHOLD (share ~0.8 observed) or
  a CONTROL condition (stun-lock, feast buff)? The Eater
  kill had both; the solo Influencer kill had neither
  named — read its transcript before theorizing.
- W5-question: keep, with the marker-first kind rules plus
  the 'codex'/'telegraph' kinds above. The question's next
  form stays upstream — what banks a SECOND living veteran?
  — until an unlock exists to fork on. The feast-rate
  sub-question stays dormant.
- M5-voicing: keep the bar, but report crossings and
  notices as separate tallies (as here) so a voiced-but-
  uncrossed control reads as what it is. The question for
  the next run: is a grey road that voices twice a
  voicing success with no crossing to show, or a crossing
  failure? Do not soften the bar without that answer.
- M17: keep the split; the gap case (used-unreceipted) did
  not recur, so the 'spend-capture-gap' class is still
  unproven on fresh data. Keep it as the NO-GO class.
- walkedBranch sourcing: fix the probe to prefer
  tableState().branch and report telemetry moral
  separately (see Beat 2 watch item). Until then, any
  relay-branch claim needs the band beside it.
- M18 ghost scan is now nine blocks clean. Keep the scan;
  do not retire it yet.
- ARM COMPARISON (descriptive, no lever fate): wins Arm A
  2/3 vs Arm B 2/3; veteran-counted kills Arm A 1 vs Arm B
  3; seeds peaking >=1 living veteran Arm A 1/3 vs Arm B
  2/3. The NOWALKIN_W4 arm does not change the wall's
  shape this block — both arms peak at 1 veteran.
- Telemetry baseline: still the r37-era 2-metric snapshot.
  This run's check LOUD lines (maxTier 16->2,
  satPenalty.penalty 91->17) are the same stale-baseline
  artifact as r48–r105: EXPLAINED, baseline NOT rolled. The
  re-seed proposal stands. (This block's values run LOWER
  than r101's 5/23 because this block's deferrals were
  milder — the direction tracks the Arm A deferral, not a
  telemetry break.)

## Regression check

`node scripts/check.js --quick` (cacheDirectory
/tmp/jest-cache-playtest2) in the worktree: 284 passed, 6
failed in 464s — EXACTLY r101's baseline (same families:
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof).
No new failure. This run carries zero src/js diff, so no
regression was possible from it; the check confirms the
tree it ran on.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
--current 'evidence/2026-11-02/perseed-endgame-r105/endgame-r105-*.json'
--metrics maxTier,satPenalty.penalty --sweep-rows`:
- LOUD: maxTier swung -87%: baseline 16 -> current 2 (n=7).
- LOUD: satPenalty.penalty swung -81%: baseline 91 -> current 17 (n=7).
Verdict: EXPLAINED, baseline NOT rolled — the same stale-
baseline artifact as r48–r105 (the baseline file itself says
its regime is unrecorded and forbids pre-seat comparisons, and
the check's "current" values aggregate 7 seed rows, not a
single-seed snapshot). The re-seed proposal stands.

## Reachable / fun / winnable, for this leg

- REACHABLE: the lesser seat, yes — 5 of 7 villages sat or
  won, including a win with one no-damage fight and a win
  after a 17-day deferral. The full seat, no — 0 for 13
  blocks, and wave-5 content was not faced on any seed this
  block (the pool never contained a Producer). The content
  exists; the road to it (2 simultaneous living veterans)
  is not traversable in these runs.
- FUN: the beats read well — the Eater kill is a real
  story (feast, scavenger, stun-lock, 304 spear, veteran
  callout), and both sense-read finales resolve and owe.
  The unfun shape is the vDie grind: 12-turn fights dealing
  8% of the pool before someone dies. Long fights with no
  damage progress are the leg's dull edge.
- WINNABLE: lesser, yes; full, no (this block). A real
  player can win the game; they cannot yet reach the full
  seat through this road, and the measurement now says why
  in numbers: kills 4, simultaneous veterans 1.
