# sim-retribution-offer-b — ability-offer DIAGNOSTIC (finding #2318)

Run: fleshout-loop-b-20261114T0330Z (Loop B), arm sim-retribution-offer-b
Axis: winnability chain (backlog open item #2318 RETRIBUTION NEVER
EXERCISED BY COMPETENT PLAY, filed by Loop B arm sim-retribution-b;
see evidence/2026-11-13/sim-retribution-b.md §Check leg)
Branch: sim-retribution-offer-b — worktree
~/workspace/worktrees/sim-retribution-offer-b
Base: master 6a74c1522 (6a74c1522b9a72bac2615e428457a2640eeb6f06)
Date: 2026-11-14
Anchor commit (judged leg): 655a0bc9b (instrument + proof test;
prereg c70013470). Driver refuses any other HEAD via
EXPECTED_ANCHOR.

## Verdict: DIAG — NEVER OFFERED, gated by kit depth AND class, compounded by succession reset

The System never offers retribution to the scholar in 108 offers
across 8 long sims — 0/71 level-ups, 0/23 contest prizes, 0/8
arrival sheets, 0/6 fusion offers. So it is NOT "offered and
competent declines": the offer never reaches the policy. The gate
is twofold, and a third mechanism keeps resetting the climb:

1. KIT DEPTH (the window never opens). Retribution is combat-kit
   entry #11 of 18 (tracks.json:19); kitSheet draws 3 offers from
   the next 6 unheld kit entries (godpath.js:769, window 6), so it
   enters a combat sheet's window only once the scholar already
   holds >=5 of the first 10 combat-kit abilities. Max combat-kit
   held at ANY combat offer on the band: **1**. Only **11 combat
   level-ups** in 8 runs (1.4/run); the offered ids are always the
   front of the kit (adrenaline_surge 8×, rage 8×, war_cry,
   adrenaline_control, phoenix_clause, cornered_rat,
   trade_of_blows — never past #7). End-state combat XP by seed:
   9, 18, 9, 0, 7, 13, 0, 1 (L1 threshold 18, L2 48) — only one
   seed's final holder ever reached combat L1.
2. CLASS (Bulwark never forms). The other route is the payoff
   lean: a recognised Bulwark gets retribution swapped into ANY
   level-up sheet (shapeOffers, godpath.js:805-840;
   payoffAnyTrack: true). **0 Bulwark recognitions in 108
   offers**; only one recognition of ANY class on the band
   (190392: Forager/Gardener, day 137 — after that seed's last
   offer, so it never leaned a sheet). The pre-class version, the
   emerging-path lean (2+ shieldbearer-path abilities held), also
   never fired for shieldbearer: no offer snapshot shows 2+
   shieldbearer-path abilities held.
3. SUCCESSION RESET (the climb never accumulates). The kit climb
   is per-holder, and the holder keeps dying. Seed 190393 is the
   clean demo: combat sheets on days 35, 65, 94 each offer
   adrenaline_surge (kit entry #1) to a fresh successor — the
   day-35 holder's adrenaline_surge is gone by day 65 (player
   deaths days 58, 61, 62 in between), and gone again by day 94.
   Across the band the scholar-office changes hands repeatedly
   (e.g. 190395: 8 scholar deaths; 190396: 16) and every successor
   restarts the kit from entry #1.

Competent's side, for completeness: competent takes ch[0] every
time (92/92 resolved non-trampled offers accepted, 0 kept, 0
replaced) — so even a position-2 retribution offer would be
declined-by-position. The trophy_room control proves it live:
trophy_room (the Stalker payoff, kit #12) WAS offered 3× at
position 2 — 190396 day 68 (trampled by succession the same day)
and 190398 days 64, 70 (both accepted, competent took
adrenaline_surge at position 0, trophy_room declined-by-position)
— via the emerging-hunter lean, the same lean that would have to
fire for shieldbearer. The lean works; shieldbearer never leans.

## The band, counted

Driver scripts/retribution-offer-driver-20261114.js, competent
verbatim, 150d death-aware, steeple band 190391–190398. The
instrument wraps (driver-side only, no game-code change) all six
offer setters (pumpLevelUps, checkSystemArrival,
maybeOfferPurify, maybeOfferFusionReactor, _cxPrizeAbilityOffer,
_completeAidQuest) plus chooseAbility / keepAbilities, and the
villager offer/grant functions. Every offer is recorded with
source, ids in order, slots, held counts, combat-kit depth, track
levels, recognised class — and one resolution class.

| seed | days | end | offers | level-ups | combat LUs | retr offers | scholar held (end) | class (end) |
|------|------|-----|--------|-----------|------------|-------------|--------------------|-------------|
| 190391 | 65 | village-lost | 5 | 2 | 0 | 0 | 2 | none |
| 190392 | 143 | village-lost | 11 | 7 | 1 | 0 | 4 | Forager/Gardener (d137) |
| 190393 | 126 | village-lost | 16 | 13 | 3 | 0 | 2 | none |
| 190394 | 128 | village-lost | 11 | 6 | 1 | 0 | 2 | none |
| 190395 | 150 | survived | 16 | 9 | 1 | 0 | 2 | none |
| 190396 | 140 | village-lost | 16 | 10 | 2 | 0 | 5 | none |
| 190397 | 135 | village-lost | 14 | 10 | 1 | 0 | 1 | none |
| 190398 | 139 | village-lost | 19 | 14 | 2 | 0 | 1 | none |
| TOTAL | | | **108** | **71** | **11** | **0** | | |

Offers by source: arrival 8, level_up 71, prize 23, fusion 6,
purify 0, aid-quest 0 (no poison / aid-quest offer fired on the
band). Offers by status: accepted 92, trampled 13, pending-at-end
2, unattributed 1, kept 0, taught-skill 0.

What the System DOES offer (contrast — top offered ids):
lucky_rock 28, green_thumb 21, dowsing 19, echo_location 18,
beard_moss 16, pyrokinesis 11, green_whisper 11,
bird_whisperer 11, bloodhound 10, iron_stomach 9. The sheets are
overwhelmingly early-kit field/craft entries; the deepest kit
entry ever offered is trophy_room (#12, via lean).

## Resolutions: the stall story (61 attempts, all full-slots)

Competent never keeps and never replaces: when slots are full, a
level-up sheet sits pending and every evening's
chooseAbility(ch[0]) is refused (game.js:25708-25722). The
instrument recorded **61 stall attempts, all class
stalled-full-levelup, on 4 offers across 3 seeds** — 190395: one
social sheet stalled 4 days (days 116–119) until succession
cleared it; 190397: one field sheet stalled 32 days (days 52–83)
then cleared by succession, one strange sheet stalled 13 days to
the end of the run (pending-at-end); 190398: one field sheet
stalled 12 days until succession cleared it, one field sheet
pending-at-end with 0 attempts (opened day 138, village lost day
139). A full-slots scholar under competent therefore stops
gaining abilities until the holder dies — level-ups queue behind
the pending sheet (tracks.js:438) and are never offered meanwhile.
That is policy behavior (competent never swaps/keeps), not the
retribution gate — but it is the same full-slots wall retribution
would hit even if offered late.

## Tramples: 11 succession, 2 genuine overwrites

Of the 13 trampled offers, 11 are succession-clears: a player
death falls on or between the offer day and the trample day, the
predecessor's open sheet closes (villager-build.js:535), and the
next queued level-up opens for the successor. The other 2 are a
genuine overwrite in the game: **maybeOfferFusionReactor tramples
a pending prize sheet** — it checks only whether a fusion_reactor
choice is already pending (game.js:25883), not whether ANY sheet
is pending, so when the pellet arrives it overwrites whatever the
scholar was still deciding on. Instances: 190395 day 75 (prize
[switcheroo, aegis_link, bird_whisperer] → fusion [fusion_reactor])
and 190396 day 91 (prize [cornered_rat, bribe, lucky_rock] →
fusion). Filed as a finding below (out of scope for this arm).

## The one unattributed offer — instrument NO-GO (bars (a)/(f))

Seed 190395, day 34: prize sheet [fusion_reactor, long_table,
last_rites]; competent chose fusion_reactor; the sheet cleared;
fusion_reactor was NOT held afterwards. The instrument logged
`choose-cleared-without-grant` — 1 unattributed offer of 108,
1 instrument error. The mechanism is identified by code reading
plus a forced deduction, not a guess: chooseAbility pushes the
ability and then abilityOnAcquire('fusion_reactor')
(game.js:25819-25852) revokes it when there is no pellet to
install ("No pellet, no reactor") or when another holder already
holds the world's reactor. The day-75 fusion offer on the same
seed was accepted AND installed (resolution accepted = held after
the call), and the singularity flag is never cleared — so no other
holder existed on day 34 either, which forces the no-pellet cause.
The prize bag offers fusion_reactor whether or not the scholar
holds a pellet, and the install fizzles it. Filed as a finding
below. The instrument's gap: it does not model the
abilityOnAcquire revoke path — a fix (classify
accepted-then-revoked) is proposed for the next run; per the
prereg's metric-review rule the judged run is NOT re-scored.
This offer is a fusion offer, not a retribution offer, so the
retribution verdict is unaffected: 0 retribution offers is a
complete count, not an unattributed one.

## NPC side (metric (d))

- Villager level-up offers: **205** across the band, **0** with
  retribution (top ids: lucky_rock 100, echo_location 88,
  dowsing 41 — the same early-kit front as the scholar's sheets).
- Villager grants (npcGrantAbility): **159**, **0** retribution.
- End-state scan: 36 villagers scanned (1–10 per seed — the
  roster collapses on village-lost, so the scan is near-blind
  there), **0** retribution holders.
The NPC answer rests on the offer/grant streams (205/159), not
on the end-state scan. No villager holds retribution either, by
the same kit-depth gate (villagers use the same kitSheet).

## Held-but-never-offered (direct grants)

End-state scholars hold 7 ability ids never recorded as offered
to the office: iron_stomach, cornucopia, beast_calm, the_touch,
bloodhound, scream_cheese (1–2 seeds each). Expected class:
successors bring their own villager-granted abilities with them
when the mantle passes (villager-build.js:535 — the successor's
npcAbilities become the scholar's), and spawn knacks are granted
directly. The instrument measures offers to the office, not to
each holder personally — after a succession, "held but never
offered" means "offered to no holder of this office", which is
the right denominator for the finding's question.

## Scale-wall numbers (every run)

1/8 survived (190395, 150d), 7/8 village-lost, median survival
137d (days 65, 126, 128, 135, 139, 140, 143, 150); maxWave 4 on
7 seeds, 5 on 190398; standing 145–370, all regional, 0 national,
0 table, 0 wins. The wall stands — this diagnostic arm was never
expected to move it.

Control: days / standing / maxWave per seed are BYTE-IDENTICAL
to the sim-retribution-b check leg on the same band (65/145/4,
143/199/4, 126/199/4, 128/199/4, 150/199/4, 140/199/4,
135/199/4, 139/370/5) — the instrument wraps are
outcome-neutral. Telemetry deviation check: telemetry-check.js
refuses recorder-corpus input by design (same refusal the prior
arm recorded); the per-seed byte-identity above is the
equivalent check and is strictly stronger for this diagnostic.

## GO bars (pre-registered)

- (a) Every offer attributable, zero unattributed: **FAIL** — 1
      unattributed (190395 day-34 fusion fizzle, mechanism
      identified above). 107/108 attributed.
- (b) Retribution offer rate counted per level-up with contrast:
      **PASS** — 0/71 level-ups, 0/108 offers; contrast table
      above.
- (c) Code gate confirmed or corrected: **PASS** — retribution
      appears via no route; the gate's predicted routes are
      confirmed by the contrast (trophy_room reaches a sheet only
      via the emerging-path lean; prize/arrival/fusion never carry
      an overpowered-tier ability).
- (d) NPC scan complete: **PASS** — 205 villager offers, 159
      grants, 36 end-state villagers scanned; 0 retribution
      everywhere.
- (e) Proof test GREEN: **PASS** — scripts/
      test-retribution-offer-b.js 26 passed, 0 failed
      (9 instrument legs + 17 game legs, incl. a staged
      retribution offer via the Bulwark payoff lean, seen and
      classified accepted at position 0; full-slots stall
      classified; villager offer captured; keep resolved).
- (f) Instrument errors 0: **FAIL** — 1 error
      (choose-cleared-without-grant on the same fusion offer).

Per the prereg, (a)/(f) failing is an instrument NO-GO: the
instrument as run cannot attribute the abilityOnAcquire revoke.
The DIAG verdict on retribution itself stands on complete
counts (0 offers is not an unattributed offer).

## Metric review

1. Offer snapshots should carry the full held-id list, not just
   the combat-kit subset: the trophy_room lean attribution rests
   on code reading + window arithmetic (only the
   recognised/emerging-path lean scans the whole rest pool), which
   is sound but would be stronger with the holder's held ids in
   the record.
2. The instrument needs an accepted-then-revoked resolution
   class for the abilityOnAcquire revoke path (fusion no-pellet
   fizzle / singularity race). Proposed for the next run; not
   re-scored here.
3. Trample-cause attribution should join player-death days in
   the analyzer (done by hand here: 11 succession, 2 fusion
   overwrite) instead of leaving `by` as the only signal.
4. The NPC end-state scan is near-blind on village-lost seeds
   (roster collapses); the villager offer/grant streams are the
   denominator for (d) — the prereg's (d) should name them.
5. Analyzer median takes the upper middle (139); evidence
   reports the conventional median (137) with the sorted days
   shown.

## Sense-testing: what the village looked like

The scholar's office changes hands constantly and each new
holder starts the ability climb from nothing — the System keeps
offering the same first-page tricks (lucky rocks, green thumbs,
echoes) to every successor while the deep-kit powers sit eleven
entries down a list nobody lives long enough to climb. Twice the
System did lean in with a build-around — trophy_room, twice
declined for the earliest entry, once lost to a death the same
day. The battery that would have been retribution never gets its
first charge because the offer never arrives, not because the
player refuses it.

## Findings (filed in hidden_files/sim-findings.md by this arm)

- FUSION OFFER TRAMPLES A PENDING PRIZE SHEET:
  maybeOfferFusionReactor overwrites any pending sheet (it only
  checks for a pending fusion_reactor choice, game.js:25883) —
  2× on this band (190395 day 75, 190396 day 91), each time
  discarding a 3-choice prize sheet the scholar had not answered.
- PRIZE OFFERS FUSION_REACTOR WITH NO PELLET, THEN FIZZLES:
  the contest prize bag offers fusion_reactor regardless of
  pellet possession; abilityOnAcquire revokes it when no pellet
  is found (game.js:25819-25852) — 190395 day 34. The offer is a
  taunt the install dissolves.

## Files

- scripts/retribution-offer-driver-20261114.js — offer instrument driver.
- scripts/retribution-offer-analyze-20261114.js — analyzer (judge).
- scripts/test-retribution-offer-b.js — proof test (26/26).
- evidence/2026-11-14/perseed-retribution-offer-b/ — 8 per-seed JSONs.
- evidence/2026-11-14/sim-retribution-offer-b-prereg.md — prereg.
- evidence/2026-11-14/sim-retribution-offer-b.md — this file.

## Commits (branch sim-retribution-offer-b, base master 6a74c1522)

- c70013470 — prereg.
- 655a0bc9b — offer instrument + analyzer + proof test (26/26).
- (this commit) — band corpora + this evidence file.
- Note: the safe-commit index clobber struck on both commits
  (first: the prereg file staged-as-deleted; second: all 3 files
  staged-as-deleted); each was repaired with the `git ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info` pipe and
  verified with `git status --short` empty + `git diff HEAD`
  empty + hash-object match before continuing. Both commits
  verified correct by `git show --stat`.
