# Journey endgame r109 — THE SECOND VETERAN BANKS, TWICE — AND STILL NOBODY SITS THE FULL SEAT (lane B, 2026-11-02)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at closeout, verified by re-read after landing
(closeout write per r103/r104/r105 precedent, so a failed run cannot
skip the leg). Run number basis: last numbered Lane B run is r108
(succession, landed 2026-11-02). This run is r109. Slug deviation:
none — journey2-endgame was free (r105 used it and released it)
and registered clean; heartbeat verified in the registry after
registration (12:59:38Z) and by a 10-minute heartbeat loop with a
readable log (verified landings 13:03:50Z, 13:04:12Z, then every
10 minutes; registry read-back at every step). Base: master
b82b298ca at registration (git pull already up to date). Main tree
clean at pre-flight (0 files), disk 23%. Reap: 8/16 active, with
LOUD dirty trees left untouched (journey2-succession,
journey2-succession-r86, journey2-crisis-r90 — held trees for
main-session inspection, never touched). No lock existed at run
start (no stale-lock recovery this run); fresh lock written
(2026-11-02T12:55:33Z), to be deleted at closeout.
Infra note: registry contention delayed registration and the
first heartbeat by minutes (a sibling flesh-out registration's
git reset --hard was still running, holding the registry flock;
a sibling reap held it next). Nothing was killed or forced — the
registration heartbeat (12:59:38Z) protected the run throughout,
and the queued heartbeat landed 13:03:50Z.

Substrate r105 EXACTLY (capable + deedhunt + vetcommit + greedy
deferral defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control
clean). 180d, death-aware. NEW vs r105, both read-only
instrumentation: the three gaps r105's metric review named
(codex/telegraph kinds, walkedBranch from tableState only with
telemetry moral as walkedMoral, feastedAtOpen sampled at fight
open) PLUS the raw killLog for second-veteran chronology. Probe:
`scripts/probe-endgame-r109-20261102.js`. Analyzer:
`scripts/analyze-endgame-r109-20261102.js`, full output in
`evidence/2026-11-02/journey-endgame-r109-analysis.txt`.
Analyzer exit 1, PRIMARY NO-GO, ALL NO-GO — driven by M2-census,
M4-wave5-or-full, and W5-question, each explained below as run
outcomes, not instrument failures (M3b-peak, M5-voicing,
SECOND-VETERAN-coverage, KILL-ANATOMY-coverage all GO). No src/js
change this run.

Seeds: 89601-89603 waves (Arm A), 89604 forcedrift control,
89605-89607 wavesnw (Arm B, waves + NOWALKIN_W4). Seeds verified
fresh: no prior endgame note or endgame probe script contains
89601-89607 as a seed. Pilot (89601+89605+89604) met the prereg
gate (1 sat, 5 census fights, 2 classified village losses), so
the run expanded to the full 7; pilot seeds reproduced
BYTE-IDENTICALLY in the full sweep (JSON + transcript snapshotted
to `evidence/2026-11-02/r109-pilot/` before the sweep overwrote
them). Determinism leg: DET GREEN byte-identical on 89601 (2x 120d).

## Village assessment, in plain words

Three villages won the lesser seat, four died. No village won the
full seat, and no village unlocked wave 5 — the fourteenth block
in a row with the full seat unwon. But the wall's shape changed
this block: for the first time in the series, TWO seeds held two
living veterans at once — and both still lost before ever sitting.

- 89601 (waves): SCATTERED d31. Six people left, pantry 0 — the
  honest scattering line again: hunger, not death, broke it, but
  here it broke FAST: nine deaths in the first 30 days (expedition,
  ambush, monster, contest, stranger, starvation, thirst), never
  announced, never reached wave 4 (unlocked wave 2 only), zero
  census fights. A village that never got to play the leg.
- 89602 (waves): WON LESSER, feared/light, announced d90, sat
  d115 after a 25-day deferral (priced honestly: "3 weeks kept
  waiting. Every door's standing −12"). Ten alive. Five census
  fights: two fled-from, two talked-down, and the block's sit-day
  kill — Thabo put down the Eater on d115, the day the village
  sat. Peak veteran 1. Full-seat gap w5 alone.
- 89603 (waves): SCATTERED d62. Five people left, pantry 0,
  unlocked wave 3 only, zero census fights. The second Arm A seed
  that never reached wave-4 fighting — which is why M2-census
  NO-GOs this block (Arm A with fights 1/3).
- 89604 (forcedrift control): WON LESSER, relay/dark, announced
  d109, sat d109. Eight alive. WITHDREW d90 first — the table did
  not come ("NO HUNGER ON THE RECORD — THE PELLET HUMS"), then
  came back after the d108 combat surge spend: a withdrawal AND
  a return in one seed, the shape r68 asked whether any seed
  shows. The control crossed a band (lean to -99, dark) AND
  voiced (1 notice) — M5 GO, the opposite of r105's voiced-but-
  uncrossed control. walkedBranch reads 'dark' from tableState
  only, walkedMoral null — the r105 mixing bug is gone.
- 89605 (wavesnw): SCATTERED d138. One person left, pantry 0.
  Five fights, 1 kill, 3 villager deaths. The first second-bank:
  Nina killed the Congregation d123, visjoin_87 killed the Suburb
  d133 (gap 10 days), peak 2 on d134. Nina died of sickness d136;
  the village scattered d138. The pair lived together ~3 days,
  and the village never sat (it had withdrawn d90 and never
  re-earned the table: zero feasts, zero surge all run).
  Note: the Suburb kill came from a villager-side channel, not a
  player census fight — the census has no Suburb fight; the
  killLog records visjoin_87's kill while the transcript shows
  the Suburb raiding and gorging at the treeline (900–1,813 kcal
  a night) and killing Harpreet in 1 round. The second veteran
  can be banked off-screen.
- 89606 (wavesnw): NO-SUCCESSOR LOSS d143, zero alive, pantry
  3,500. Seven fights, 2 kills, 4 villager deaths in fights. The
  second second-bank: Diana killed the Influencer d73,
  visjoin_37 killed the Algorithm d89 (gap 16 days), peak 2 on
  d89. visjoin_37 died "the wild" d90 — ONE DAY after banking
  the pair. Diana died d122. The pair lived together ~1 day.
  Standing peaked 170, never 200; the village never announced.
  Its sole mFlee is the Strike standoff below.
- 89607 (wavesnw): WON LESSER, feared/light, announced d92, sat
  d119 after a 27-day deferral (guard: losses). Seven alive. ONE
  census fight all run: a double-Influencer fight that killed a
  villager (d114, 1,913 damage observed of a 3,286 pool, 15
  turns). A lesser win with essentially no wave-4 fighting —
  the feared road carried by presence and pledge, not blood.
  Veterans 0 of 2; full-seat gap w4 1/3 + w5 0/2.

## Leg questions, answered

1. SECOND-VETERAN — ANSWERED, FIRST MEASUREMENT, COVERAGE 6/6.
   Two seeds banked a second living veteran (89605 d133, gap 10d;
   89606 d89, gap 16d), and neither converted it into anything:
   - 89605's pair lived ~3 days (Nina d136 sickness), then the
     village scattered d138 on an empty pantry. No sit was ever
     available (withdrawn d90, no feast/surge re-earn).
   - 89606's pair lived ~1 day (visjoin_37 d90 "the wild"), then
     Diana d122. Standing peaked 170, never announced.
   The finding is sharper than "two at once is hard": two at once
   is now PROVEN REACHABLE (2/6 waves seeds this block, after
   0/6 in r105), but the pair is fragile — it must survive to a
   sit AND to standing 200, and in both cases it died within days
   while the village was still far from either. The wall is no
   longer "can two veterans coexist"; it is "can two veterans
   coexist LONG ENOUGH, while the village also stands at 200 and
   sits". Previous-killer fates are named for every kill after
   the first (89602's single kill has no predecessor; all other
   predecessors: 89605 Nina d136 sickness, 89606 Diana d122 the
   wild — both deaths, not departures).
2. KILL-ANATOMY — SECOND MEASUREMENT, coverage 18/18. By
   census-fight outcome (waves seeds, multi-turn fights only):
   - vKill (n=4): party median 4, turns median 14, damage median
     873 of pool median 900, share median 0.74.
   - vFlee (n=2): party median 7, turns median 7, damage median
     514, share 0.47.
   - vDie (n=8): party median 5, turns median 10, damage median
     424, share 0.42 — the grind again, now the modal outcome.
   - talkDown (n=2): 1 turn, 0 damage — Algorithm fights talked
     down without a blow.
   - mFlee (n=1): the Strike standoff, below.
   - otherEnd (n=1): 9 turns, 372/1000.
   Feasted-at-open now measures cleanly: 18/18 anatomy fights
   sampled at open (0 post-daily fallbacks — the r105 evening
   blind spot is closed as an instrument), feasted-true 3/18.
   The r105 kill-recipe question (threshold vs control) stays
   open: kills this block rode neither a named stun-lock nor a
   feast (feasted 1/4 kills, and that kill — 89602's 2-monster
   Eater fight, 2,125 damage of a 3,333 pool over 14 turns — was
   won by damage, not control). The solo-kill bound from r105
   stands; no new solo kill this block.
3. W5-FORK (cleaned, positive list + codex/telegraph kinds) —
   ANSWERED AS NEVER-ARRIVED, EVERYWHERE, BY INSTRUMENT. No seed
   reached uw=5, so every fork class is no-uw5 by construction.
   Cleaned-presence (presence/crew-beat only) is 0/7. The new
   kinds did NOT empty 'other': the residual is exactly 2 lines,
   both the same beat — the producers NAMING the Nielsen
   ("📻 The producers name it: the Nielsen. Ratings embodied.
   It fights boring — and the crowd adores it for that.",
   89602 d114, 89607 d113). That is a naming/announcement beat,
   not monster presence, and it is NOT a codex line or a Rerun
   telegraph — the next run's kind rules need a 'producer-name'
   (or 'announce') kind. Cleaned-presence is unaffected either
   way; the residual is now one beat, not two kinds.
4. WALL CONTINUITY — fourteenth block: the wall as "full seat"
   stands (0/7), but its shape moved. M3b-peak GOES for the first
   time in this series (2/6 waves seeds peak >=2, after 0/6 in
   r105). Standing at the 199 attractor on 2 seeds (89602, 89607;
   raw peaks 332/307) with the defer5 veterans hold named. The
   wall is not breadth (89602 gap w5 only) and not the pair
   alone (two pairs banked) — it is pair-survival + standing-200
   + a sit, all at once.
5. M5-VOICING — GO, CONTROL CROSSED AND VOICED. 89604 crossed
   (bandCrossings 1, lean -99 dark) and voiced (noticed 1). The
   r105 question (voiced-but-uncrossed grey road) is answered
   by contrast: this control's road went all the way dark.
   walkedBranch/moral separation verified on the control itself
   (branch dark, moral null — no mixing).
6. M17 SURGE SPLIT — VALIDATED AGAIN. All 3 surged seeds carry
   named combat spends (89602: d44/d65/d79/d115; 89604: d108;
   89607: d91/d98); the 4 unsurged seeds read banked-true /
   used-false with no receipt — the genuine unspent shape, not a
   capture gap. No spent-but-unreceipted seed this block.
7. M2-CENSUS — NO-GO, RUN OUTCOME. Arm A with fights 1/3:
   89601 scattered d31 and 89603 scattered d62 before ever
   reaching wave-4 fighting. The instrument is complete
   (M2c 6/6, M2d 2/2, VETCONV 6/6); the seeds simply never got
   there. Two of three Arm A seeds dying before the leg's
   content is itself a leg finding: the waves road's early game
   is lethal enough to starve the endgame measurement.
8. STRIKE STANDOFF (new finding, against Steve's 2026-11-02
   flee rule) — 89606's sole mFlee is a 121-round solo fight
   against The Strike in which the PLAYER tried to flee every
   round ("You hurl yourself at the barrier — no escape that
   way") while the Strike cycled SHUTDOWN (dead turns, nothing
   works) and lift ("It will post new demands"), 0 damage dealt
   either way, ending on the generic "It got away" line. The
   census labels it mFlee via the monFled flag, but nothing
   here fled from damage: the player was trapped, and the fight
   ended by exhaustion. The Strike's def carries a Picket Line
   "withdraw" tactic (backs behind the line, unreachable), which
   may be the explicit component the new rule allows — but the
   observed end is a timeout, not a withdraw, and the label
   mFlee misdescribes it. NOT fixed this run: a flee-rule change
   would change census outcomes and invalidate this block, and
   Steve paired the flee fix with the loot taper build — that
   build lane owns it. Carried as a documented blank with the
   exact fight (89606 d103, party 1, 120 policy turns, 0 damage)
   and the def reference for that lane.
   The FUN edge is the same fight from the player's side: 121
   rounds of dead turns with no escape and no progress is the
   leg's dullest shape this block — worse than the vDie grind,
   because nothing happens at all.

## Pre-registered verdict

Analyzer exit 1. PRIMARY NO-GO, ALL NO-GO — on three verdicts
whose causes are run outcomes, stated plainly so the NO-GO is
not misread as an instrument failure:
- M2-census NO-GO: Arm A with fights 1/3 (89601/89603 never
  reached wave-4 fighting).
- M4-wave5-or-full NO-GO (waves scope): 0/6 waves seeds
  unlocked wave 5 or earned the full seat.
- W5-question NO-GO: no uw=5 seed, so the question is
  unanswered — but every seed's records are complete
  (complete=true 7/7), and the fork answer for this block is
  NEVER-ARRIVED on the instrument-cleaned reading.
- GO (all others incl.): M1-guard 7/7, M2c (fights == opens
  6/6, errs 0), M2d (2/2 gate-named), M2b (9/9 dieFlag named),
  M8-exit-canon (1 mFlee, codex-matched — see the Strike note
  above for why the label itself is questioned), M3-conversion
  (tally, Arm B 4 vs Arm A 1), M3b-peak (2/6 peak >=2 — FIRST
  GO in the series), M5-voicing-canonical (1/1 crossed+voiced),
  M5b-relay-branch-tabulation (89604 dark, branch from
  tableState, moral null), M6-guard-named (89602 not-ready,
  89607 losses), M10-fullseat-gap (89602: w5 only; 89607: w4
  1/3 + w5 0/2), M11-standing-peak, M12-bar-record (89602:
  arm 4 armed 10 tricks 18 vet 1 short [veterans]; 89607: arm 5
  armed 7 tricks 21 vet 0 short [veterans]), M13-release-snapshot
  (vacuous — no uw=5), M14-invite, M15-feast-census,
  M16-dusk-census, M17-surge-mode (revised split, 7/7),
  M18-ghost-scan (10th block clean), M19-grant-log,
  M20-standing-trace, M21-audit-crosscheck, M22-feast-hold
  (contribution shortfall still exactly 1500 kcal median on
  every seed — ninth block), REG-r35-audit,
  REG-r37-satpenalty, VETCONV-recon 6/6, LOSSKIND-classified
  4/4 (89601/89603/89605 scattering, 89606 no-successor),
  KILL-ANATOMY-coverage 18/18, SECOND-VETERAN-coverage 6/6.
- M4b: retired as a verdict per r95's metric review; INFO
  only (0/6 conjunction on waves seeds this block).

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89604's relay/dark finale, read in full (the whole
63-line announce-sliced transcript). The audit is honest
(11/4/4 + 0 wave-4 fought, 13 contests, 3 crises; "the table
does not rise. It prices."). The war path names both bars
plainly ("blood your fighters (0 of 1 veterans)", "(0 of 2
veterans)"). The beat does what r105's relay beat did and
goes one step further: it says yes to the pods AND shows the
withdrawal first — the d90 table-that-didn't-come (pellet
hums, no feast/surge) is in the header, and the d109 return
follows the d108 surge, so the return is earned, not granted.
Then the pods: children in uniforms, Salvador and Chris
watching the signer sign ("will remember the exact shape of
your hand"), "the village has never been this quiet", the
System delighted and not understanding why nobody else is.
The merge resolves AND owes: "Power immense. Self eroded."
plus the Nora Wilson coda (village endures, conversation does
not end). Also noted, as a contrast to r108's wrinkle 2: the
scout handover IS spoken here ("Ji nods, stepping back.
'Scout is yours now.'") — the transfer line exists on this
path.

Beat 2 — 89602's feared/light finale, read in full (finale
section of the announce-sliced transcript). The audit is honest
(13/8/5 + 5 wave-4 fought, 12 contests, 3 crises). The war path
names the sit-day kill ("On day 115, Thabo put down Big Ugly")
and reads the wave-5 bar plainly ("1 of 2 veterans"), and the
deferral is priced in the open ("3 weeks kept waiting. Every
door's standing −12"). The feared beat resolves: "Show mercy"
— the most frightening thing the feared one ever did, terror
pledged as a shield over every village forever, the audience
weeping. The Oversight coda lands its indictment from the
feared side — the napping little ones, the looking away done
on purpose because the village was busy. Watch item, not a
defect: the war path says "They faced The Ugly Beast and lived"
for fights the census records as fled/talked-down as well as
killed — "faced" is true, "killed" is not claimed, so the
record stays honest (same watch item as r105, same verdict).

Live-build conversation check: not run — this run changes no
UI or dialogue code (instrument-only, zero src/js diff), so
there is no player-facing flow to verify at 390×844; the r105
precedent (same leg, same instrument-only pattern) likewise
verified dialogue via transcripts. If a future run touches
dialogue UI, the live check applies then.

## Blank: instrument gaps filled (r105's three) + gaps for the next run (documented)

FILLED — all three r105-named instrument blanks, verified on
this block's data:
1. MENTION-KIND 'codex'/'telegraph': no Codex firstLine and no
   Rerun telegraph firstLine occurred this block, so the new
   kinds are unexercised — but the residual they were meant to
   shrink is now exactly one beat (the Nielsen naming beat),
   which is neither kind. The kinds are in place; the residual
   needs the third kind below.
2. walkedBranch sourcing: 89604's relay final reads branch
   'dark' from tableState with walkedMoral null — no mixing,
   and the band (dark, lean -99) agrees with the branch. The
   r105 ambiguity is closed on fresh data.
3. FEASTED-AT-OPEN: 18/18 anatomy fights carry feastedSource
   'open' (0 fallbacks). The evening blind spot is closed as an
   instrument: feasted-true is now 3/18 at open, not a
   post-daily lower bound.

DOCUMENTED, NOT FIXED — three items for the next run / build lane:
1. MENTION-KIND third kind: add 'producer-name' (or 'announce')
   for the producers-naming beat ("📻 The producers name it:
   the Nielsen..."). Until then 'other' holds exactly that beat
   on seeds that name a Producer — cleaned-presence unaffected.
2. STRIKE mFlee LABEL (build lane, with the loot taper): the
   89606 d103 Strike standoff ends on the generic "It got away"
   line and reads monFled, but no monster fled from damage.
   Question for the flee-rule build: does the Picket Line
   withdraw tactic count as the explicit flee component, and
   should a 121-round dead-turn timeout end as mFlee, as a
   designed lift, or as something else? Do not re-score this
   block's M8 on the answer — M8 GO stands as codex-matched;
   the label question is the carry.
3. SUBURB KILL CHANNEL: 89605's second veteran came from a
   kill the player census never saw (no Suburb census fight;
   killLog only). The next run's second-veteran anatomy should
   record, per kill, whether it rode a census fight, a fast
   fight, or a villager-side channel — the channel matters for
   whether a player can deliberately repeat the bank.

DOCUMENTED, NOT A DEFECT CLAIM — the unlock wall's new shape:
two pairs banked, both dead within days, neither seated, neither
at standing 200. Whether "2 simultaneous living veterans" is
the right bar is still a design question for Steve/Codex, not a
bug report: the mechanism is working as wired, and the run's job
was to measure it, which it does. What changed is the question:
it is no longer whether a pair can coexist, but whether a pair
can coexist long enough, at standing 200, through a sit.

## Metric review (for the NEXT run, not this one)

- SECOND-VETERAN: keep, with the channel column above (census /
  fast / villager-side) and a pair-lifetime column (days from
  second kill to first pair death / sit / scatter). The next
  question the table now supports: what kills the pair — the
  wild, sickness, and scattering did it here, never a fight.
- KILL-ANATOMY: keep, with feastedAtOpen as the feasted column
  (fallback column retired if it stays 0). The threshold-vs-
  control question stays open: this block's kills rode damage,
  not a named control condition.
- W5-question: keep, with the 'producer-name' kind added. The
  question's next form stays upstream — what keeps a banked
  pair alive to a sit? — until an unlock exists to fork on.
  The feast-rate sub-question stays dormant.
- M2-census: keep the bar, but report the early-death shape
  beside it (this block: 2/3 Arm A seeds scattered before wave
  4). If early lethality keeps starving Arm A, the next run's
  prereg should ask whether the waves road's early game, not
  the census bar, is the thing to move.
- M5-voicing: keep the bar, with crossings and notices as
  separate tallies (as here). The r105 grey-voiced question is
  answered by contrast (this control went dark); no bar change.
- M17: keep the split; the gap case (used-unreceipted) did not
  recur, so the 'spend-capture-gap' class is still unproven on
  fresh data. Keep it as the NO-GO class.
- M18 ghost scan is now ten blocks clean. Keep the scan; do
  not retire it yet.
- ARM COMPARISON (descriptive, no lever fate): wins Arm A 1/3
  vs Arm B 1/3 (plus control 1/1); veteran-counted kills Arm A
  1 vs Arm B 4; seeds peaking >=2 living veterans Arm A 0/3 vs
  Arm B 2/3. The NOWALKIN_W4 arm again banks more kills — but
  both its pairs died before sitting, so the arm difference
  does not change the wall's shape this block.
- Telemetry baseline: still the r37-era 2-metric snapshot.
  This run's check LOUD lines (maxTier 16->6, satPenalty.penalty
  91->33) are the same stale-baseline artifact as r48–r109:
  EXPLAINED, baseline NOT rolled. The re-seed proposal stands.
  (This block's values run HIGHER than r105's 2/17 because this
  block's deferrals were longer — the direction tracks the
  deferral, not a telemetry break.)
- STEVE 2026-11-02 FLEE RULE (arrived mid-run, after the sweep):
  monsters do not flee unless their kind carries an explicit
  flee component, paired with the loot taper build. This run's
  census predates any flee-rule implementation; its single
  mFlee (Strike, 89606 d103) is reported above against the new
  rule as a measurement, not re-scored. The flee-rule + loot
  taper build lane owns the implementation; this loop does not
  land combat changes mid-measurement.

## Regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 284 passed, 6 failed in 514s — EXACTLY r108's
standing pre-existing families (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes). No NEW failure. This
run carries zero src/js diff, so no regression was possible from
it; the check confirms the tree it ran on.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
--current 'evidence/2026-11-02/perseed-endgame-r109/endgame-r109-*.json'
--metrics maxTier,satPenalty.penalty --sweep-rows`:
- LOUD: maxTier swung -62%: baseline 16 -> current 6 (n=7).
- LOUD: satPenalty.penalty swung -64%: baseline 91 -> current 33 (n=7).
Verdict: EXPLAINED, baseline NOT rolled — the same stale-
baseline artifact as r48–r105 (the baseline file itself says
its regime is unrecorded and forbids pre-seat comparisons, and
the check's "current" values aggregate 7 seed rows, not a
single-seed snapshot). The re-seed proposal stands.

## Reachable / fun / winnable, for this leg

- REACHABLE: the lesser seat, yes — 3 of 7 villages sat or won,
  including a win after a 27-day deferral and a withdrawal-and-
  return. The full seat, no — 0 for 14 blocks, and wave-5
  content was not faced on any seed this block (the pool never
  contained a Producer; the Nielsen was only NAMED, never
  fought). The content exists; the road to it (2 simultaneous
  living veterans, alive to a sit at standing 200) is not
  traversable in these runs — though the pair itself is now
  proven traversable.
- FUN: the beats read well — the sit-day Eater kill, the
  withdrawal-and-return, both sense-read finales resolving and
  owing. The unfun shapes are the vDie grind (8 fights, 42%
  damage share, someone dies) and, worse, the Strike dead-turn
  trap: 121 rounds where nothing works, no escape, no progress.
  A solo player trapped in a Strike shutdown is the leg's dull
  edge this block.
- WINNABLE: lesser, yes; full, no (this block). A real player
  can win the game; they cannot yet reach the full seat through
  this road, and the measurement now says why in numbers:
  pairs banked 2, pairs surviving to a sit 0, standing-200
  reached 0.

## Closeout

- Commit 1 (2484dc7d0, rebased to 2a1c245f4): 31 files — 2
  instrument scripts (probe + analyzer, r105 renames + the four
  r109 instruments) + 29 evidence files (prereg, pilot log/err,
  sweep log/err, analysis txt/err, checkquick log, run note, 14
  perseed JSON/transcript files, 6 r109-pilot snapshot files).
  Zero src/js diff.
- Post-commit index clobber (documented class, staged-deletion
  variant): all 31 committed files showed staged-deleted in the
  main index, worktree files byte-identical to HEAD. Repaired
  with `git update-index --add --cacheinfo` per file from HEAD
  blobs; verified `git status --short` empty + `git diff HEAD`
  empty. The commit itself was always correct (message + file
  list verified via `git show --stat HEAD`).
- Rebase: main tree had moved during the run (flesh-out
  sim-creekwide-a + sim-closedecay-a landed; HEAD b82b298ca ->
  3f8d5568f). Rebase onto the new master landed cleanly, no
  quirk, single commit, each commit exactly once. Post-rebase
  proofs re-run: node --check OK on both scripts, analyzer
  re-run byte-identical to the committed analysis (exit 1, same
  NO-GO).
- Merge: `git merge --ff-only journey2-endgame` in the main tree,
  HEAD verified 2a1c245f4, main tree clean.
- Commit 2 (this closeout section) merged the same way
  immediately after; final HEAD below.
- Release: worktree released + removed, branch deleted, final
  reap run, main tree verified clean.
- Rotation-b written 4->5, verified by re-read (social life
  next). Lock deleted only after verifying it still carries
  this run's run_id (2026-11-02T12:55:33+00:00).
- Heartbeat loop: the loop's beats landed throughout (verified
  by registry read-back at every step); loop killed after
  release.
- No push, no bump, no live check — merged locally, pending
  ship (ship loop owns version bumps, pushes, live
  verification).
- No game change this run: instrument + evidence only. No
  [needs-eyes] flag — nothing player-facing changed.
