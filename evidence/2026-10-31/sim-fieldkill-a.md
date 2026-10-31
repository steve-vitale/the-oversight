# sim-fieldkill-a — WHY wave-3 field fights never kill (DIAG ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1702Z.
Replacement worker: the first worker died on a transport error (not a
verdict). Its recovered state was re-verified, not trusted blind: branch
tip 191c1d0d0 (prereg) present, prereg read and judged against exactly,
5 uncommitted instrument files read, 2 misleading comments fixed
(det-compare header naming wave3enc, recorder header naming itself
instead of wave3enc-diag), syntax-checked, committed as f24a4a6c9
before any judged sims. No file was discarded; no prereg line was
rewritten. The safe-commit left the known index-clobber pattern
(worktree files staged-as-deleted, bytes identical to HEAD); repaired
with `git update-index --add --cacheinfo` from HEAD blobs and verified
(`git status` empty, `git diff HEAD` empty, hash-object matches).
Worktree branch: sim-fieldkill-a.
Base anchor: every judged JSON carries anchorCommit f24a4a6c9 (prereg
pin f536e3ad3 + prereg commit + instrument commit; zero src/js
changes, zero policy-default flips, zero gate/demand numbers moved).
Pre-registration: evidence/2026-10-31/sim-fieldkill-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/policies/fieldkill-diag.js (FIELDKILL=1, NEW) +
scripts/fieldkill-sweep-20261031.js (stdout-only runner) +
scripts/fieldkill-split-20261031.js (idle splitter) +
scripts/fieldkill-analyze-20261031.js +
scripts/fieldkill-det-20261031.sh + scripts/fieldkill-det-compare-20261031.js.
Proof: scripts/test-fieldkill-20261031.js — 173 checks green (21
synthetic + 152 corpus legs: 8 per seed x 19 seeds — outcome sums,
trigger sums, join sums, daily sortedness, recorder errors, anchor
pin).
Corpus: evidence/2026-10-31/perseed-fieldkill/leadfeast/s<seed>.json
(19 seeds, all non-empty) + evidence/2026-10-31/fieldkill-analysis.json
(analyzer output).
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG census, no
before/after comparison exists in this arm; none fabricated (same
declaration as wave3enc-a). The det leg compares recorder-on vs
recorder-off trajectories of the SAME stack; it is a neutrality
proof, not a panel comparison, and its numbers never enter the
census tables.

## Verdict: DIAG-GO (with two stated strict-reading notes)

Judged exactly against the prereg's band verdict:

- Completeness: 19/19 seeds fully reported (meeting tables, wall
  numbers, recorder errors, kill joins, killable distributions).
  Recorder errors 0 on all 19 seeds; recorder overflow empty
  everywhere; daily rows sorted on all 19 seeds.
- Cross-check (i): det-gate byte-identical hashes + identical end
  fields on both det seeds (87104, 87127) — PASSED.
- Cross-check (ii): corpus determinism leg — judged 87104 is
  BYTE-IDENTICAL to its det-ON scratch run (241,645 bytes both,
  `cmp` clean) — PASSED.
- Cross-check (iii): kill-log coverage — every wave-3 waveKillLog
  entry has a matching kill event on 19/19 seeds (unmatchedLog 0
  everywhere). One kill event has no log entry (87128 day 74,
  below) — reported and explained, not smoothed.
- Kill join: 19/19 ledger events join (17 TB 'won' + 2 TB
  'routed', 0 field vKill); pyrrhic orphans 0 (0 pyrrhic events
  on the band). The verdict rests on the prereg's 'won' OR
  'routed' clause, as stated.
- Usable judged seeds 19 >= 8. Verdict sections (a)–(f) all
  present below.
- Pilot gate: 8/8 pilot seeds fired with zero recorder errors,
  per-seed JSONs valid, meeting tables computable on every pilot
  seed, cross-check (iii) held on every pilot seed, instrument
  demonstrably fired (120 pilot meetings, 5 pilot ledger kills)
  — pilot GO, confirm spend justified.

### Strict-reading note 1 — the 13 unclassified flights (read before reusing the verdict)

13 of 221 flee fights fall in class 8 (unclassified) under the
prereg's class-2 enumeration — and ALL 13 are the same verified
shape: trick-completion exits the prereg's class 2 did not list.
8 are focus_group bore-outs (trickLog ['bore','bore','bore'],
3 rounds, 0 damage dealt) and 5 are terms_of_service loophole
dismissals (trickLog ['examine','examine'], 2 rounds, 0 damage
dealt). Code points: fieldFights.js trick branch 'bore'
(focusBore >= 3 → mFlee, "the murmur drifts off") and 'examine'
(tosRead >= 2 → mFlee, "the loophole clause... DISMISSED").
The villager spends the whole fight performing the trick instead
of striking, and the monster leaves by the trick's own rule at
near-full HP (142–340 HP left). No other unclassified shape
exists on the band: the full list of 13 is in the analyzer
output (perSeed[].unclassifiedFlights). The prereg's NO-GO
clause names "unclassified > 0 unexplained" — here an
explanation exists and is verified against code + rows + logs,
exactly as wave3enc-a's routed orphans were. Strict-reading
note, stated plainly so the coordinator can overrule: if the
GO bullet "unclassified == 0" is read literally with no
explanation exception, this arm would be DIAG-NO-GO on that
bullet alone — and every census value would be unchanged
either way. The verdict above follows the NO-GO exception
clause plus this verified read-only explanation.
Metric-review item 1 carries the classifier fix for the next
arm (class 2 gains bore-3/examine-2 completion).

### Strict-reading note 2 — the 1 event without a log entry (cross-check iii)

87128 day 74: TWO TB 'won' fights against spool, same killer,
same via, same day — TWO recordWaveKill events (ledger points
1→2 and 2→3) but ONE waveKillLog entry. recordWaveKill dedupes
the log entry on identical (day, mid, by, via, trick)
(game.js recordWaveKill log-write path); the second identical
kill scores its point but writes no second log line. Both
events join cleanly to the two 'won' rows, so the kill join is
19/19; the log count (18) trails the event count (19) by
exactly this dedupe. The prereg's (iii) equality wording
("kill-event count == waveKillLog entries") fails literally on
this one seed; the coverage direction (every log entry has an
event) holds everywhere, and the discrepancy is explained, not
hidden. Metric-review item 2 carries the wording fix (coverage
+ deduped extras, not equality).

## Answer in one paragraph

Field fights never kill wave-3 monsters because the fight has
exits that fire before death, on both sides. On the monster's
side, the break line: a wave-3 monster that drops below 15% of
its max HP (36–63 HP) flees instead of dying, and a monster
met already below that line flees on contact before any blow —
so the killing blow would have to jump from above the break
line to zero in a single strike, which a solo villager's strike
almost never does. On the villager's side, the exits are
learn-withdrawal (leave at round 3+ when not winning),
hopeless-trajectory flight (leave when the damage race is
lost), the HP floor, and trick exits (spend the fight
performing the trick instead of striking, and the monster
leaves by the trick's rule at full HP). And wild fights are
always solo — no ally ever joins in the wild — so the
same-round ally finish, one of the only kill paths, is
structurally unavailable where 202 of 233 field fights happen.
The fights DO reach killable state (11 times) — and 10 of
those 11 ended with the monster fleeing at the break line,
16–44 HP from death. Killable state is not the missing piece:
killable state IS the exit state. The scholar's turn-based
fights, which have no break-line exit, are the only channel
that kills (19/19 ledger events).

## Base note (re-derived, not transferred)

`git diff 9f22a0838 f536e3ad3 -- src/` is EMPTY: the only
src-touching commits between wave3enc's base and this base are
Loop B's axefirst pair (regions lines added, then restored by
the datahold — net zero). The corpus confirms it: meeting
totals, outcome buckets, wall numbers, and death shares
reproduce wave3enc's band EXACTLY (293 meetings, 233 field +
60 TB; national 14/19, table 16/19, wins 15/19, wave 4 12/19,
wave 5 0/19, median 90d, max 197d; deaths 543 with combat
40.9% / villager combat 25.0% / the wild 12.5% / expedition
8.5% / sickness 3.1%). This is a re-derivation on this base
that happens to be identical, not a transfer of wave3enc's
numbers — every table below is computed from this arm's own
corpus, anchor f24a4a6c9.

## (a) Per-seed field-meeting table (all 19 judged seeds)

Meetings = one fieldFight call (wave-3 mdef) + one settled
tbEnd fight containing a wave-3 monster. Field columns:
evade / beast-fled / villager-fled / villager-died / villager-
killed. TB columns: lost / won / routed. Ledger kills join
to 'won' OR 'routed' rows (prereg clause). w3days = daily rows
with the wave-3 rung true (day >= 25 AND p2 >= 4); firstW3Day =
first such row; null = never unlocked. warPts = end
villageStanding warPts; p3 = end wave-3 ledger points.

| Seed | Days/end | W3day | W3days | p3 | war | Meet | Ev | FledB | FledV | VDie | VKill | TB lost | TB won | TB routed | LedKill |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 87103 | 60/lost | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 87104 | 159/won | 135 | 25 | 1 | 1 | 13 | 0 | 2 | 9 | 0 | 0 | 1 | 1 | 0 | 1 |
| 87107 | 90/won | 46 | 46 | 2 | 2 | 21 | 0 | 9 | 9 | 0 | 0 | 1 | 2 | 0 | 2 |
| 87109 | 146/lost | 50 | 96 | 2 | 3 | 9 | 2 | 0 | 4 | 0 | 0 | 1 | 2 | 0 | 2 |
| 87115 | 90/won | 52 | 39 | 0 | 0 | 14 | 0 | 6 | 5 | 0 | 0 | 3 | 0 | 0 | 0 |
| 87119 | 90/won | 54 | 37 | 1 | 1 | 7 | 0 | 0 | 3 | 0 | 0 | 2 | 1 | 1 | 1 |
| 87120 | 103/won | 64 | 40 | 1 | 2 | 3 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 1 |
| 87121 | 90/won | 41 | 50 | 1 | 1 | 15 | 0 | 4 | 8 | 0 | 0 | 2 | 0 | 1 | 1 |
| 87123 | 110/won | 51 | 60 | 1 | 1 | 29 | 0 | 17 | 11 | 0 | 0 | 0 | 1 | 0 | 1 |
| 87124 | 92/won | 32 | 61 | 0 | 0 | 16 | 3 | 7 | 5 | 0 | 0 | 0 | 0 | 1 | 0 |
| 87126 | 90/won | 50 | 41 | 0 | 0 | 10 | 1 | 2 | 4 | 0 | 0 | 1 | 0 | 2 | 0 |
| 87127 | 127/won | 121 | 7 | 0 | 0 | 3 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 0 |
| 87128 | 91/won | 41 | 51 | 3 | 3 | 23 | 0 | 5 | 11 | 1 | 0 | 3 | 3 | 0 | 3 |
| 87132 | 90/won | 34 | 57 | 1 | 2 | 16 | 0 | 4 | 8 | 0 | 0 | 2 | 1 | 1 | 1 |
| 87134 | 90/won | 49 | 42 | 0 | 0 | 7 | 0 | 2 | 1 | 0 | 0 | 4 | 0 | 0 | 0 |
| 87135 | 144/lost | 74 | 71 | 1 | 1 | 48 | 0 | 24 | 23 | 0 | 0 | 0 | 1 | 0 | 1 |
| 87137 | 89/lost | 58 | 32 | 2 | 2 | 21 | 0 | 0 | 7 | 1 | 0 | 11 | 2 | 0 | 2 |
| 87138 | 90/won | 35 | 56 | 3 | 4 | 9 | 0 | 0 | 5 | 0 | 0 | 1 | 2 | 1 | 3 |
| 87140 | 197/won | 152 | 46 | 0 | 0 | 29 | 4 | 8 | 16 | 0 | 0 | 0 | 0 | 1 | 0 |

Notes: 87103 never unlocked wave 3 (died day 60 at wave 2) —
its zero table is complete, not missing. 87128's 3 ledger
kills include the day-74 double spool kill (2 events, 1 log
entry — see strict-reading note 2). The 2 field deaths are
the same round-1 deaths wave3enc found (87128 day 52
redactor, 87137 day 87 buffering — villagers entering at low
HP, not fought-to-the-death duels).

## (b) Damage / rounds / HP-at-flee by outcome (pooled medians, field fights)

vDpr = mDealt / rounds (this fight's own rate; 0-round fights
use volley damage). mDpr = vTaken / rounds.

| Outcome | n | Med rounds | Med mDealt | Med vTaken | Med allyDealt | Med vDpr | Med mHpLeft |
|---|---|---|---|---|---|---|---|
| vFlee | 131 | 2 | 31 | 44 | 0 | 10.5 | 194 |
| mFlee | 90 | 0 | 0 | 0 | 0 | 0 | 33 |
| evade | 10 | 0 | 0 | 0 | 0 | — | 341 |
| vDie | 2 | 1 | 0 | 26 | 0 | 0 | 260 |

The mFlee median hides two different fights, split here because
the pooled median lies about both:
- mFlee, 0 rounds (n=46, all with a pre-call monster HP):
  median monster HP at entry 17, median HP at flee 17 — the
  beast was already nearly dead when met and fled on contact.
- mFlee, fought (rounds >= 1, n=44): median 3 rounds, median
  mDealt 0, median vTaken 37, median HP at flee 166 — and only
  15 of the 44 dealt ANY damage. The fought beast-flights are
  mostly trick exits (30 of 44: 17 named trick-exit + 13
  trick-completion), not drive-offs; 29 of the 44 dealt no
  damage at all (one trick-exit fight dealt 21 before the
  trick ended it).
- vFlee vDpr spreads wide (24 fights at 0, then 3–38, median
  10.5): the typical villager deals ~10/round against a
  240–420 HP monster taking 20–55/round back. The killable
  fights below are the high-DPR tail (32–55/round), not the
  typical villager — and even they lose the kill to the break
  line.

## (c) Flee-trigger distribution (221 flights, prereg classes 1–8)

| Class | n | Share | What it is (code point) |
|---|---|---|---|
| 3 learn | 64 | 29.0% | Learn-first withdrawal: intent learn, round >= 3, not winning (fieldFights.js learn-vs-fight block). ALL 64 have final intent learn. |
| 6 mBreak-driveoff | 58 | 26.2% | Monster below its 15% break line (mBreak, wave >= 2) at a round end or at contact (volley-section + in-round break checks). 45 are 0-round contact breaks; 13 are fought drive-offs. |
| 4 hopeless | 52 | 23.5% | Morale trajectory: round >= 2, rounds-to-die < rounds-to-kill x 0.85, alone or help spent (morale section). ALL 52 have final intent engage. |
| 2 trick-exit | 17 | 7.7% | Named trick exits in the prereg: peaceful / stared-down / redactor-quiet / offer_food. |
| 8 unclassified | 13 | 5.9% | ALL trick-completion (8 bore-out, 5 loophole) — see strict-reading note 1. No other shape. |
| 5 floor | 11 | 5.0% | HP below the situational flee line (vBreak) with a non-hopeless trajectory. ALL 11 have final intent engage. |
| 7 round-cap | 5 | 2.3% | 15 rounds, no finish — the worse-off side disengages (4 vFlee, 1 mFlee). |
| 1 volley-driveoff | 1 | 0.5% | 87107 day 77: volley 23 damage drops a 40-HP chorus_line below the break line before contact; it flees. The volley did not kill (23 < 40) — the break line finished the job. |

Dominant trigger overall: learn (64). Dominant beast-side
trigger: mBreak-driveoff (58). No trigger is a channel
artifact: learn, hopeless, and mBreak all appear in wild,
expedition, and aid channels (wild 57/49/52, expedition
5/2/1, aid 2/1/5 respectively). Trick exits split 15 wild /
2 aid; unclassified split 11 wild / 2 aid.

## (d) Party picture — the wild is always solo

| Channel | n | Solo start-to-finish | Party from start | Shout-joined |
|---|---|---|---|---|
| Wild | 202 | 202 (100%) | 0 | 0 |
| Expedition | 18 | 17 | 1 | 0 |
| Aid | 13 | 9 | 3 | 1 |
| All field | 233 | 228 | 4 | 1 |

Wild outcomes by party class are therefore one row: 202
solo fights — 121 vFlee, 80 mFlee, 1 vDie, 0 vKill. NO wild
fight starts with an ally, and NO wild fight gains one
mid-fight (calledHelp 0/202, allyFromStart 0/202). The shout
mechanism (morale section: hopeless + allies in opts) never
fires in the wild because wild meetings carry no allies in
opts. The single shout-joined fight on the band is an aid
fight, and the 4 party-from-start fights are expedition/aid —
and none of the 5 produced a kill either. The same-round
ally finish — villager strike leaves the beast at 1–5 HP, the
ally's 3–6 strike lands the kill before the break check —
is structurally unavailable in the wild, where 87% of field
fights happen.

## (e) Kill join (prereg 'won' OR 'routed' clause)

| Shape | n |
|---|---|
| Ledger events joined to TB 'won' rows | 17 |
| Ledger events joined to TB 'routed' rows | 2 (wave3enc's 2 orphans, now joined: 87121 + 87138 shapes on this base) |
| Ledger events joined to field vKill rows | 0 (no field vKill rows exist) |
| Ledger orphans | 0 |
| Pyrrhic events joined to TB 'lost' rows | 0 (0 pyrrhic events: no 'lost' TB fight killed a wave-3 monster on this band; the wrap was installed — recordPyrrhicKill simply never fired for wave 3) |
| Pyrrhic orphans | 0 |
| TB 'won'/'routed' rows with no kill event | 7 — ALL 'routed' (87119 d81, 87124 d56, 87140 d184, 87120 d87, 87126 d56 x2, 87132 d58). Every TB 'won' row (17/17) has its kill. A routed row without a kill is the normal shape (party routed, monster lived); no waveKillLog entry claims a death for any of the 7, so none is counted as a missing kill. The corpus cannot confirm TB monster death beyond the log (TB capture carries no dead-monster flag) — see metric-review item 3. |
| Wave-3 log entries | 18, all matched to events; 1 event without a log entry (87128 d74 dedupe — note 2) |

Kill events by via: player 16, companion 3. Field-kill call
sites in game.js (patrol/wild recordWaveKill after a vKill
return) never fired for wave 3 on this band.

## (f) Killable state — fights reach it, then lose it to the exit

Definitions per prereg: killable-at-flee = mHpLeft <= 2 x
vDpr; near-killable = mHpLeft <= 5 x vDpr; below-break =
mHpLeft / mMax < 0.15; rtk_end = mHpLeft / vDpr (infinite
when vDpr == 0 — the zero-damage class, never averaged in).

| Measure | Count / value |
|---|---|
| Flee fights | 221 |
| Killable-at-flee | 11 (5.0%) |
| Near-killable | 24 (10.9%) |
| Below-break-at-flee | 61 (27.6%) — 59 mFlee + 2 vFlee |
| Zero-damage flights (vDpr == 0, own class) | 98 (44.3%): by trigger — mBreak 45, trick-exit 16, unclassified 13, learn 8, floor 7, hopeless 7, round-cap 2 |
| Pooled rtk_end, finite only (n=123) | median 12.6 rounds, min 0.33, max 74.7 |
| Share rtk <= 2 / <= 5 / <= 15 | 8.9% / 19.5% / 58.5% |
| Killable fights that became kills | 0 / 11 |

The prereg's "never killable" verdict requires killable == 0
AND median rtk_end > 15. BOTH FAIL: killable is 11, and the
finite median is 12.6. Field fights DO reach killable state —
but 9 of the 11 killable flights ended in mBreak-driveoff
(monster at 16–44 HP, below its break line, fleeing), 1 in
volley-driveoff (monster at 17 HP after a 23-damage volley),
and 1 in hopeless vFlee (villager fled with the monster at
42 HP, 1.1 rounds from death — both nearly dead, the
villager blinked first). Conversion killable → kill: 0/11.
The 2 vFlee below-break fights are code order, not a skipped
check: the morale section runs before the break check in the
round loop, so a round in which both conditions hold ends in
vFlee with the monster already below its line.

Why the break line is a wall, in numbers: a solo strike
kills only if it jumps from ABOVE the break line (36–63 HP
for wave-3 max HP 240–420) to zero in one blow — i.e. a
single strike of 37–64+. Typical strikes are ~10/round
(median vFlee vDpr 10.5); even the hard tail strikes ~40.
Only doubled strikes (haymaker x2, dead_aim x2 under 25%,
Rage/Aim multipliers) or a same-round ally finish can make
the jump, and the ally finish is unavailable in the wild
(section d). The break check runs after EVERY round, so
there is no "one more round" — the round that would have
been the kill round is the round the monster leaves.

## (g) Sense-testing read — the closest-to-kill fight (SENSE-TESTING LAW)

87140 day 183, Babatunde vs Redactor, wild, solo, intent
engage (flipped to engage on a good exchange), 4 rounds,
dealt 196, took 71, monster 212 → 16 HP, rtk 0.33, outcome
mFlee. Full log:

- Babatunde has Crude bow but no arrows — the string stays
  drawn, useless.
- Babatunde had strung a wire at ankle height before it
  closed — the first rush will eat dirt. (Tripwire)
- R1: The Redactor hesitates — Babatunde bought a breath.
- R1: Babatunde's eyes go red. Next 3 strikes hit twice as
  hard. (Rage) [Babatunde — Stalker of the Apex Predator]
- R1: Babatunde goes still. Breath slows. The world narrows
  to the target. (Take Aim — next shot 2.5x)
- R2: the Redactor's handles point at Babatunde's weapon —
  the redaction lands next round.
- Babatunde's gear absorbs 15. R2: Return hits Babatunde for
  21 (79 left)
- R2: Babatunde strikes for 110 (aimed 2.5x) (x2.0) (102 left)
- Babatunde reads the fight — the odds are good. Committing
  to the kill.
- R3: the Redactor redacts Babatunde's weapon — their strikes
  weaken for two rounds.
- Babatunde's gear absorbs 20. R3: Redact hits Babatunde for
  30 (49 left)
- R3: Babatunde strikes for 40 (blood trail +2) (x2.0) (62 left)
- R4: the Redactor's handles point at Babatunde's last turn
  — the redaction lands next round.
- Babatunde's gear absorbs 14. R4: Return hits Babatunde for
  20 (29 left)
- R4: Babatunde strikes for 46 (blood trail +2) (x2.0) (16 left)
- The Redactor breaks — wounded past its line, it turns and
  runs.

Read for meaning: this is the band's hardest hitter — a
titled apex-stalker, Rage-doubled, Aim-multiplied, 110 on
one strike — doing everything the game asks a fighter to do,
naming the commitment out loud ("Committing to the kill"),
ending at 29 HP himself against a monster at 16 HP (6% of
its 260 max). And the monster walks away, because 46 < 62:
the final strike needed 62 to kill and dealt 46, and the
break check does not ask whether the next strike would have
landed — it asks only whether this round ended below 15%.
The ending reads as a rule, not a decision: no narration
line says the Redactor chose to run from a losing fight; the
line says it "breaks — wounded past its line," which is the
engine's line, and the village hears nothing about it
(zero say lines that day). A villager would remember nearly
killing the Redactor; the game records a flee count. The
contrast with the scholar's channel is the point: in TB,
this fight ends with a kill and a ledger point. In the
field, the same damage ends with the monster leaving at 16
HP, free to be met again tomorrow at whatever HP the world
entity kept.

## (h) The losing mechanism, named exactly

Field fights never kill wave-3 monsters because of the
monster break line plus the solo-wild structure, in this
order of importance:

1. THE BREAK LINE (primary, fieldFights.js): `mBreak =
   wave >= 2 ? 0.15 : 0.25` (line ~627); the volley-section
   check (before round 1) and the in-round check after every
   round's morale section (line ~2000) set mFlee whenever
   the lead drops below 15% of max HP. 58 of 221 flights end
   here, including 9 of 11 killable-at-flee fights. The kill
   requires a single-strike overkill from above the line;
   typical strikes cannot make that jump.
2. THE CONTACT BREAK (same code point, volley section):
   wounds persist on the world entity, so a villager meeting
   an already-wounded monster below the line gets a 0-round
   mFlee — 46 flights, median entry HP 17. Near-dead beasts
   are never finished; they are met, and they leave.
3. THE VILLAGER'S EXITS (morale section): learn-withdrawal
   (round >= 3, not winning — 64 flights, by design),
   hopeless trajectory (rtd < rtk x 0.85 from round 2 — 52),
   HP floor (11), round cap (4 vFlee of 5 round-cap flights).
   Together 131 of 221 flights end with the villager leaving
   (all vFlee), most after 2 rounds with the monster at ~65%
   HP (median mHpLeft 194).
4. TRICK EXITS (trick branches): 17 named + 13 completion
   = 30 flights end with the monster leaving at near-full
   HP because the villager performed the trick instead of
   striking. These are wins of a kind (the monster leaves)
   that score no kill and teach no kill.
5. THE SOLO WILD (structure, not a line): wild meetings
   carry no allies in opts, so the shout never fires and
   the same-round ally finish never happens in 202/202 wild
   fights. The only multi-striker fights are expedition/aid
   (5), and none killed either.

What would have to change for a field kill (NOT built here —
DIAG only): the break line would have to stop firing on a
round where the next strike is lethal, or a finishing blow
would have to be allowed below the line, or wild fights
would have to arrive with allies. Any of those is a design
call (the break line is believable flight; removing it makes
every wounded beast fight to the death), not a bug fix —
the mechanism is working as coded. The veteran consequence
stands as measured: villager field fights cannot manufacture
wave-3+ killers, so the veterans bar's "living roster member
with a wave-3+ kill" is scholar-shaped on this stack, and
non-scholar villages stall by construction at the veteran
gate — the same bottleneck vet2 measured from the other
side (4 wave-4+ kills in 19 runs, 3 scholar, 1 companion).

## Wall numbers on the judged band (19 seeds, THIS base)

| Measure | Judged band |
|---|---|
| National reached | 14/19 (73.7%) |
| Table reached | 16/19 (84.2%) |
| Won | 15/19 (78.9%) |
| Wave 4 reached | 12/19 (63.2%) |
| Wave 5 reached | 0/19 |
| Median survival | 90 days; max 197 |
| Wave-3 meetings | 293 (233 field + 60 TB) |
| Wave-3 field kills | 0 / 233 |
| Wave-3 ledger kills (all TB) | 19 events (17 won + 2 routed) |
| Deaths (all seeds) | 543 total; combat 40.9%, villager combat 25.0%, the wild 12.5%, expedition 8.5%, sickness 3.1%, rest < 2% each |

Scope note (not a gap to hide): Arc reach, four-realm
formation, trap acquisition by source, counter discovery
rates, and young-link succession survival are NOT in this
corpus — the recorder does not read them, so this evidence
reports them as unmeasured, not as zero. Death-cause shares,
wave reach, national/table/win reach, and survival are
measured above from the corpus's own fields.

## Village assessment — what the villages looked like

The band on this base is a winning band (15/19 won, mostly
~day 90 through the table) that nonetheless never learns to
kill wave-3 monsters as villagers. The two still-kill-less
named villages are the clearest picture: 87140 lived 197
days, won at national rank, met wave-3 monsters 29 times in
46 wave-3 days, and killed none — 16 times its own villagers
fled, 8 times the beast fled, 4 times they saw it and gave
it room, once the scholar's party routed. 87124 won in 92
days with 16 meetings and no kill. Who thrived: the scholar
— every wave-3 kill is his, in fights he more often loses
(34 lost vs 17 won in TB). Who died and why: combat
dominates (65.9% combat + villager combat), starvation is 3
deaths in 543. What knowledge/capabilities were missing:
not contact (293 meetings), not courage to engage (fights
run real rounds with damage both ways, and the sense-read
fighter commits out loud) — but CONCLUSION: villager fights
against wave-3 monsters end in flight on both sides before
the killing blow, by the break line's arithmetic and the
solo-wild structure. The blank this arm fills is the
mechanism behind wave3enc's 0/233: it is the 15% break line
converting killable state into flight, plus learn/hopeless
flight on the villager's side, plus a wild that never sends
a second striker.

## Det-gate (trajectory neutrality, prereg requirement)

- ON vs OFF on 87104 and 87127 (same stack, same seeds,
  worktree scratch dirs, never the judged corpus): hashes
  IDENTICAL (159 vs 159; 127 vs 127), end fields IDENTICAL
  (gameDays, won, national, table, maxWave, endScaleRank)
  on both seeds. DET-GATE PASSED. The recorder does not
  move trajectories.
- Sweep I/O discipline, as prereg'd: the sweep printed one
  JSON line per seed to stdout and wrote nothing; the idle
  splitter wrote the per-seed JSONs with a resilient writer
  (retry + full-size verification). stdout/stderr were
  captured to files in single foreground execs, never a
  backgrounded pipe. No judged corpus was staged in /tmp
  at any point (det scratch, pilot/confirm jsonl, and
  splitter outputs all lived in the worktree; scratch dirs
  were deleted before commit).

## Determinism leg (corpus trust, prereg requirement)

- Pilot seed 87104 re-run equivalence: the judged 87104
  JSON is BYTE-IDENTICAL to its det-ON scratch run
  (241,645 bytes both, `cmp` clean). The judged corpus is
  reproducible on this base.

## Metric review (for the NEXT run — mandatory section)

1. Class 2 is under-enumerated: bore-3 (focus_group) and
   examine-2 (terms_of_service) trick completions end fights
   in mFlee with 0 damage and fall to unclassified (13/221
   here, 100% this shape). Next arm: class 2 gains
   "trickLog contains 3x 'bore' OR 2x 'examine' (completion
   counts from the trick branches)" — or, more generally,
   mFlee with a completing trick verb in the log. The
   counts are not re-scored here; the 13 stay unclassified
   in this arm's tables with the explanation attached.
2. Cross-check (iii) equality is wrong for the log: the
   log dedupes identical same-day kills, so events can
   exceed log entries by design (87128 d74: 2 events, 1
   entry). Next arm: state (iii) as coverage (every log
   entry has an event) + report deduped extras, never
   demand equality.
3. The prereg's "won/routed row with a dead monster and no
   kill event is UNCLASSIFIED" is uncheckable from this
   corpus: TB capture carries no dead-monster flag, and the
   only death record is the log (which is fully matched).
   The 7 routed rows without events are all consistent
   with "party routed, monster lived." Next arm: either
   capture a dead-monster flag in tbEnd (fighter HP at
   settle) or rest the clause on log coverage as done here.
4. The pilot gate behaved: 8/8 fired, 0 errors, meeting
   tables computable everywhere, 120 pilot meetings. The
   "thin pilot still confirms" clause was not needed.
5. Killable definition refinement (not a fix): vDpr =
   mDealt/rounds dilutes striking DPR with trick rounds
   (0-damage rounds) — the 11 killable fights are the
   high-DPR tail partly because their rounds all struck.
   A striking-round DPR would sharpen the killable line;
   the prereg definition held as written for this arm.
6. Pyrrhic instrument note: 0 pyrrhic events is a band
   property (no 'lost' TB fight killed a wave-3 monster),
   not proof the wrap is dead — the wrap mirrors the
   recordWaveKill wrap and vet2 verified the writer exists.
   Do not delete the pyrrhic capture; a kill-richer band
   could fill it.

## Backlog items (for the coordinator — NOT chased mid-run)

1. The break-line design question (steve-call if changed):
   is the 15% monster break line intended to make villager
   field kills near-impossible, with the scholar as the only
   wave-3 killer by design? If so, the veterans bar is
   scholar-shaped by construction and the veteran gate needs
   a different manufacturing route (or the bar needs the
   scholar counted differently). If not, the finishing-blow
   window (below-break strikes, or a "finish" when the
   monster is below the line and the villager is winning)
   is the lever — measured here, not built here.
2. The solo wild (design question): wild meetings never
   carry allies, so the shout/ally-finish path is dead in
   202/202 wild fights. If parties are meant to form in the
   wild, the meeting construction (not the fight engine)
   is where it dies — the fight engine's shout branch
   works when allies are present (1 aid fight proves the
   branch exists).
3. Field meetings leave no narration (87140 day 183: the
   band's closest-to-kill fight, zero say lines that day):
   the same voicing gap wave3enc flagged. If flight is the
   dominant wave-3 experience, the village hearing about
   near-kills (gossip beat, trick observation) is a
   narration question, not a verdict-changer. Steve-call
   if it changes narration.
4. The 87128 day-74 double kill is a ledger curiosity, not
   a bug: two same-day spool kills by one killer score 2
   points but write 1 log line. Any arm counting kills from
   the log alone undercounts by the dedupe; count from
   kill events, as this arm does.
