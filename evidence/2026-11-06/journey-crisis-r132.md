# Journey crisis r132 — run note (2026-11-06, Lane B)

## Prereg
`goal hidden_files/evidence/2026-11-06/journey-crisis-r132-prereg.md`
(written before any scored seed; band 13301–13305 verified fresh — full-scope
check: zero hits in any dated prereg, zero in goal hidden_files preregs, zero
in standaccum preregs; the only "13301" hits anywhere are pantry-kcal values
in October JSONs). Leg 6 (crisis). Rotation-b read 6 at run start; this
closeout writes 7 (succession next). Driver
`scripts/journey-crisis-r132-delayed-20261106.js` (r131 driver verbatim EXCEPT
r132 filenames/paths/seeds, the W1 carried count 46/1/1/0, and the ORIGINS map:
13301 Denver, 13302 Miami, 13303 Nashville, 13304 San Diego, 13305
Minneapolis), PLUS the transcript fix below (proven transcript-only before
the judged panel ran). Analyzer
`scripts/analyze-crisis-r132-delayed-20261106.js` (r131 analyzer verbatim
EXCEPT r132 filenames/paths and the W1 carried count, PLUS C7b corpse-cause
counts, the BENCH alive-bench subset, the muster-size/break table, and the
killer-subject filter). Policy oracleV2, 120d death-aware +10d tail, pilot
seeds 13301–13305, sequential. Panel evidence (JSONs, 32 transcripts,
panel.log, analysis.txt) in goal hidden_files `evidence/2026-11-06/r132-panel/`;
only the run note + driver + analyzer + proof test are committed to the repo
(r129 convention). Master at run start 12cac2ec7 (Lane A journey-landing r110
landed during pre-flight); this worktree branched from c6530f212 and was
rebased onto 12cac2ec7 at closeout before merging.

## Instrument fixes landed this run (with proof)
1. DRIVER TRANSCRIPT FIX: the `slice(-2)` dump in driveConvo dropped the
   player's YOU line whenever a turn produced 2+ NPC lines after it — 48/237
   picks on the first r132 panel run had no YOU line in the file. Fixed to
   dump every transcript entry added by each turn (slice(prevLen), tracked
   across turns, both paths). Proof `scripts/test-crisis-r132-instruments.js`:
   re-ran seed 13301 before/after — JSON differs ONLY in the 8
   convosDriven[].npcLines counts (all rose), transcripts differ by added
   YOU:/NPC: lines only (36 counted, 0 removed). The judged panel was
   re-run on the fixed driver; determinism re-proven on it (below).
   YOU completeness on the judged panel: 237/237 picks carry their YOU line.
2. ANALYZER KILLER-SUBJECT FILTER: a say line "<Name> killed ..." names the
   killer, not the dead (Ruth class, r131). D3 mismatch matching now ignores
   killer-subject names, and a line whose only names are killers is a kill
   report, not a death report. Proof in the same test (synthetic panel):
   Ruth NOT a mismatch, a real death line (Aria) still IS.
3. ANALYZER C7b: corpse-cause counts (famine/disease/wound/thirst, feed vs
   corpse record) — the r131 deaths-feed gap, now instrumented. Proof in the
   same test (synthetic corpses: 1/1/1/1 counted). All 14 proof checks PASS.

## Determinism proof (prereg-required, before judging the panel)
**PASS, twice.** (a) Pre-fix driver: re-ran seed 13301 into r132-det —
panel JSON byte-identical, all 8 transcripts identical. (b) Fixed driver:
re-ran seed 13301 into r132-det2 after the judged panel re-run — panel JSON
byte-identical, all 8 transcripts identical. The instrument is
trajectory-neutral on both driver versions; the panel below stands as judged.

## Panel verdict (BINDING metrics)
- C1 (bend, not break): **GO.** Every game-over has a named cause that is
  NOT a siege-mechanic failure: 77 corpses across the panel — monster/wild
  dominate, plus 9 non-combat deaths now visible in C7b (1 starvation,
  2 sickness, 3 wounds, 3 thirst). The villages bled in fights, died out
  on the treeline and the road, and starved/thirsted at pantry 0 —
  attrition, not a broken siege mechanic.
- C2 (episodes fire + gates hold): **GO.** Raids fire on all seeds
  (9/8/4/7/5); fought resolutions present on all seeds; D1 snapshots 21/21,
  missing 0; D1 delayed>=3 attempts 21/21; deltaBad empty; D3 drift unknown
  = 0 (labels: player-drawn-off 25, moved-on-valve 20, sortie-clear 8).
  MISSED-WINDOW 8 — triggers the prereg instrument look (see below); it is
  descriptive, not folded into C2.
- C2b (linger-conditional gorge/sortie): **GO.** Every boundary-firable case
  fires or is refused with a recorded reason; all 5 seeds judged on
  gorge+sorties. **W1: ANSWERED.** A full clear after a refusal happened:
  13302 refused d56 (redactor+spool), refused again d57, ok sortie d57
  (remaining 1 — redactor killed, spool fled), ok sortie d78 (remaining 0 —
  the spool remnant cleared). Count now: refusals 53, same-set re-musters 2,
  ok sorties after a refusal 2, full clears after a refusal 1.
- BENCH (descriptive): refused 7 (musterAvailable 0:5, 1:2). Shape
  gate-one-short 2, supply-empty 4, availability-drain 1, other 0 — same
  2/4/1 split as r131. No shape covers >=80%, so by the prereg rule:
  **mixed, no single lever** — majority shape supply-empty (4/7); gate ruled
  out as the majority (2/7) AND availability-drain ruled out as the majority
  (1/7). NEW alive-bench subset: 3 refusals with livingBesidesPlayer >= 2
  (13302 d56/d57, 13303 d45); all 3 carry nodeAway exclusions (6+5+7 = 18),
  and 2 of the 3 are labelled gate-one-short while the bench existed but
  was away at other nodes — even the gate label is nodeAway underneath when
  the bench is alive. Refusal rate 7/21 = 33% (r131 47%, r130 56%) — lowest
  yet, but above the 20% collapse trigger.
- C3 (people check): **GO.** fabricHits 0; WRAP 32/32 marked; all 32
  transcripts scanned for the watched patterns and 2 read in full (Eli d11,
  Nora d56 — see below). Naming-stance wobble: NO fourth sighting — 4
  naming debates, all reporter-asks-vote ("The whole fire was arguing about
  X last night — what to even CALL it. 'Y' got shouted down. What's your
  vote?"); no pusher disavows. The wobble stays a three-panel wrinkle.
  Nonverbal nod: NOT graduated — 0 conversations carry the signing-nod
  pair (no "sign" anywhere); the generic nod line recurs in a new variant,
  "They nod slowly, not quite done, not quite continuing." ×3. Columbus
  echo: GONE — 0 "not from Denver" lines. The "About unasked-for food"
  memory-label leak did not recur (0 hits); the trap-line decline "Maybe
  not today. The fire's got me." did not recur (0 hits). A delegated
  full read of all 32 transcripts was in flight at closeout; its report
  will be reconciled in the memory log and, if it overturns anything,
  amended here — the verdict above rests on the scan + fabric/WRAP + the
  two full reads.
- WRAP-CHECK: **GO.** Analyzer WRAP section: 32 transcripts, 32 marked,
  unmarked 0 (engine-ended 28, driver cap break 1, refused/ended 3).
- C7b (instrument): **GO.** Corpse-cause counts match the corpse record on
  all 5 seeds (the counts ARE read from corpses; the verdict is that the
  gap is now measured, not assumed): feed 0 vs corpse 9 non-combat deaths
  (famine 1, disease 2, wound 3, thirst 3). No run should cite C7 feed
  zeros as village facts — C7b is the count from here on.
- D2 clear rate: **1/14** — the first set-level clear on an ok sortie in
  four panels (r129 0, r130 0/7, r131 0/8). It is a singleton set (13302
  d78, party 3 vs 1 redactor, vKill, leader took 97 damage). The break
  still binds for every multi-monster set (13/13 broke).
- Interesting-finding triggers: W1 ANSWERED (first full clear after a
  refusal) FIRED; the first full clear on ANY ok sortie FIRED (same
  event); missed-window >=8 FIRED (instrument look, below). Refusal
  collapse below 20% did NOT fire (33%). Gate >=80% did NOT fire.
  Availability-drain majority among ALIVE-bench refusals: 1/3 — did NOT
  fire as a majority, but nodeAway exclusions cover 3/3 alive-bench
  refusals (see BENCH).

## Per-seed panel
| seed | days | end | raids | gorge nights | gorge kcal | sorties (ok/refused) | convos | deaths (corpses) | alive | pantry |
|---|---|---|---|---|---|---|---|---|---|---|
| 13301 | 110 | game-over | 9 | 80 | 94,714 | 7 (6/1) | 8 | 20 | 0 | 1,400 |
| 13302 | 92 | game-over | 8 | 19 | 20,881 | 5 (3/2) | 8 | 12 | 0 | 0 |
| 13303 | 63 | game-over | 4 | 12 | 13,993 | 5 (1/4) | 4 | 15 | 0 | 0 |
| 13304 | 99 | game-over | 7 | 21 | 22,014 | 2 (2/0) | 8 | 16 | 1 | 0 |
| 13305 | 120 | horizon | 5 | 18 | 19,827 | 2 (2/0) | 4 | 14 | 3 | 0 |
Panel totals: gorge nights 150, gorge kcal 171,429, sortie fights 21, aid
resolutions 33, drifts 53. Sortie attempts 21, ok 14, refused 7, full
clears (remaining 0) 1. Rations paid: 55,365 kcal for 14 sorties.

## Muster size vs break (new, prereg Q3)
14 ok sorties: parties of 3 ×10, of 2 ×4; sets of 4 ×6, 2 ×4, 1 ×2, 3 ×1,
5 ×1. 13 broke, 1 cleared (singleton). Fight outcomes: vKill 7, vFlee 10,
vDie 3, mFlee 1. The break is NOT wound-accumulation across many fights:
7 of 14 sorties ended after a SINGLE fight — the party fled (vFlee) after
one fight taking 36–76 damage, or the leader died (vDie). Only 2 sorties
ever reached a 3rd fight. The party fights as leader + 1 ally at most, so
the break is a single-fighter damage threshold in fight 1, not party
attrition. The one mFlee is the redactor-quiet starve-out: the policy
played the designed counter-dismissal (go quiet ×3, "nothing left to
redact") — a trick ending a wave-3 fight outright, NOT a violation of the
Nov 2 monster-commitment ruling (redactor carries no flee component; the
starve-out is the designed per-monster exit, same class as offer_food /
poison meal / boredom / loophole). Three sortie leaders died mid-sortie
this panel (Aria d70 13301 on the Eulogy, Dmitri d94 13302 on the Reunion,
Ava d67 13304 on the Eater) — all missing from deathsDuring (the known
sortie-death capture gap), all muster-explained in D3, none a false
mismatch. A 4+ fighter muster never formed: the muster requests 3 and the
fight engine fields leader + 1 ally, so "would a 4+ muster clear" is still
untestable by this instrument — the lever would need a muster-size change,
not a measurement.

## Missed-window instrument look (prereg Q8, triggered at 8)
7 of the 8 cases are NOT misses — the strict test does not exclude sets
already answered after lastSeenDay: 13301 d81 (herald + suburb) and 13304
d70 (eater) drifted AFTER an ok sortie 3 days earlier broke on them;
13302 d59 (spool) drifted after the d57 ok re-muster; 13301 d114 (audit)
and 13303 d63 (anaconda) drifted the SAME day their sortie was refused
(no-fighters) — the refusal IS the answer. 1 of 8 is a genuine no-attempt
drift: 13305 d57 focus_group (lastSeen 55, waited 4, no sortie within
±6 days). Two instrument items for the next run: (a) the missed-window
test should exclude drifts whose set had any sortie attempt (ok or
refused) with day > lastSeenDay and day <= drift day — that leaves the
true miss rate at 1/8 this panel; (b) the 13304 d70 eater drift is
recorded TWICE (two identical drift records, same id/episode/day) — a
drift-recording double-count; the drift census overcounts it.

## Village assessment, in plain words
Five villages, four lost, one standing at the horizon with an empty
pantry. 13301 is the expensive one: 80 gorge nights, six sorties, three
leaders lost (Aria to the Eulogy on day 70, after killing a tick first),
and the village died at day 110 with 1,400 kcal left and nobody alive to
eat it — Nora died sick on day 47, Desmond of thirst on day 42. 13302 is
the W1 village: refused twice, answered twice, and on day 78 Nora's party
of three killed the last redactor and cleared the set — the first full
clear after a refusal in eight panels of watching. The village itself
ended on day 92 with the pantry at 0; in the death-tail, Dmitri died to
the Reunion on day 94. 13303 is the short one: four refusals, one ok
sortie, dead by day 63 with Wolfgang dehydrated and David's wound
unclosed. 13304 is Ava's village: she killed the cliffhanger and the
chorus line on day 67 and died on the Eater in the same sortie; the
village ended at day 99 with one alive and the pantry at 0, Catalina
dehydrated on day 98. 13305 held to the horizon with three alive and an
empty pantry — Hyun-jun starved on day 102, Priya sick on day 33, Leo
and Ella both lost to wounds that wouldn't close. The siege ends; the
thirst and the wounds wait behind it, same as r131.

## The blank filled — and the ones left open
FILLED: W1 is answered — a re-muster after a refusal CAN fully clear (13302
d78, singleton remnant, two sorties after two refusals). The deaths-feed
gap is now instrumented (C7b: feed 0 vs corpse 9 non-combat deaths).
The transcript YOU-line drop is fixed and proven (237/237 complete).
The killer-subject false positive is filtered and proven.
LEFT OPEN: the set-level clear for multi-monster sets (0/13 this panel —
the break in fight 1 binds); whether a 4+ fighter muster would clear
(untestable: muster requests 3, engine fields leader + 1 ally); the
missed-window strict test (7/8 over-counted, fix filed above); the eater
drift double-count; the sortie-leader death capture gap (deathsDuring
still misses all 3 leader deaths — muster-explained, not fixed).

## Instrument notes
- R57 D1 episode resets: 2 sortie resets (13301 d94, 13305 d94) + 3
  lingerBook entries with episode > 1. Same class as r130/r131 (re-linger
  after drift, tracked not fixed).
- R57 D1 drift old-vs-new nightsWaited diffs: 3 (instrument diagnostic).
- R59 TRUE early count: 0 (legacy method kept for comparison).
- R58 refused-sortie book check: all refusals show the refusal day is NOT
  the book's lastSortieDay — refused sorties don't consume a slot (r58
  change, working). R58 bloodied lines: 0.
- R70 phoenix burns 0 everywhere. R82 V1/F1 clean (no no-longer entries).
- R126 boundary-sortie cross-check: 'none' class 0 — every target had a
  prior tick-part sample.
- R122 G-ID: eighth panel at zero id-matched gorge-after-clear (0
  name-matched 19, 0 id-matched, 0 returns across the cleared rows) —
  stays open, not closed.
- The .err files carry only the benign feastBuff retirement notice.
- Transcript quirks (driver rendering): FIXED this run — the YOU-line drop
  (48/237 picks on the pre-fix run) is gone on the judged panel (0/237).
  No YOU/NPC order flip seen on this panel (r131's single flip did not
  recur).
- Content notes (filed, not fixed here): (1) the "About unasked-for food
  (meal)" memory-label leak did not recur this panel (0 hits) — stays
  filed for a builder run with its convo-driving proof test.
  (2) the goal-thread generic-reply pattern recurs — "Take your time" ×2
  in the Eli thread (13301 d11); r145 already holds this for a design
  decision, not a wiring bug. (3) the driver's repeated-identical-pick
  behavior: on 13302 d56 the driver picked dlg:favor_requirements 6× in a
  row and the game answered with escalating "As I said / Like I said /
  Still the same thing" before the "told you three times" cap — honest
  and varied, a cap not a loop; the repetition is the driver's pick
  logic, not a game defect. (4) the burnt-piece mourning motif and the
  "I've told you three times now" cap are unchanged from r131.

## Metric review (for the NEXT run, not this one)
- W1 is ANSWERED (53/2/2/1). The count closes; the next panel's question
  becomes the clear rate on multi-monster sets (0/13 this panel) — the
  break in fight 1, not the re-muster, is the open question now.
- BENCH: the shape held 2/4/1 for the second straight panel. The sharper
  question moves to the alive-bench subset: nodeAway exclusions cover 3/3
  alive-bench refusals — is nodeAway the lever when the bench is alive?
  n=3 this panel; the next panel should test it with the subset as the
  primary BENCH number, not the whole-panel shape.
- Muster size vs break: the break happens in fight 1 (7/14 single-fight
  sorties). The next run's sharper question is the leader-damage
  threshold: what vTaken in fight 1 predicts the flee, and would a
  second ally in the fight (not just the muster) change it? That needs a
  game-side change to field more than leader + 1 ally — measurement
  alone cannot answer it.
- Missed-window: adopt the exclusion (sets with a sortie attempt after
  lastSeenDay are not misses) and dedupe the drift records; re-baseline
  the watch at the corrected count (1 this panel).
- C7b is now the non-combat death count. The C7 feed columns stay for
  comparability; no run cites them as village facts.
- Still open, unchanged: G-ID watch (8 panels at zero); naming-stance
  wobble (3 panels); nonverbal-nod wrinkle (0 signing conversations this
  panel; the nod variant changed).

## Telemetry deviation check (step 14)
**QUIET** — `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/crisis.json --current
'.../r132-panel/journey-crisis-r132-delayed-seed*.json' --metrics
defendedFights,playerFights,latelyDefenseCount` → "telemetry-check: quiet
(5 files, 3 metrics, no large deviations)". Baseline NOT rolled (single
5-seed panel's variance).

## Reachable / fun / winnable (crisis)
- Reachable: YES — raids fire on every seed, sorties are answered (21
  attempts), the gorge offer reaches the player, defenders talk after
  resolutions. The sortie itself is reachable; the SET-LEVEL CLEAR is now
  reachable too (1/14) — but only for a singleton remnant set.
- Fun: MIXED — the W1 chain (refuse, refuse, answer, answer, clear) is the
  leg's best beat this panel, and Nora's water-haul ask and Eli's invite
  accept read as real people. But 13 of 14 sorties break the same way —
  one fight, one flee — and will read to a player as a gesture that costs
  55,365 kcal and three leaders' lives without ever finishing a real set.
- Winnable: NOT YET on this leg — 1/5 horizons, 4/5 game-overs, and the
  crisis cost (171,429 kcal gorged + 55,365 kcal rations) is paid in food
  and water the village cannot spare; the horizon seed ends with three
  alive and a pantry at 0.

## Closeout
Determinism PASS (both driver versions), telemetry quiet, note + driver +
analyzer + proof test committed from the r132 worktree, merged locally,
pending ship. Rotation-b advanced 6 → 7 (succession next). No src changes
this run (measurement panel + instrument fixes; findings filed above). No
`[needs-eyes]` — nothing player-facing changed.
