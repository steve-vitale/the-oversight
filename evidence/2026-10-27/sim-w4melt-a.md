# sim-w4melt-a — classify the wave-4 melt door on the w4funnel-repin band (axis scale-onramp)

Run: fleshout loop A, run fleshout-loop-a-20261027T0840Z.
DIAG ONLY — zero src/js changes, zero default flips, no game lever,
no game-lever proposal. The deliverable is measurement, not a fix:
melt behavior is unchanged. No [needs-eyes] flag applies (DIAG
measurement only — no feel, combat, or UI change; said explicitly).

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

Full text: evidence/2026-10-27/sim-w4melt-a-prereg.md
(committed first, before any sweep). In brief:

- Base: branch sim-w4melt-a rebased onto current master tip
  3a12db1aa (journey crisis r54) BEFORE the prereg — rebase
  clean, no conflicts, branch had no unique commits of its own
  (merge-base == old HEAD a2e3e2719). Master movement since the
  repin base fc57dd0bd is ONLY evidence/scripts commits plus
  r54, whose message states "no src change"; the five reused
  recorders hash IDENTICALLY to the repin prereg.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4
  = The Mirror Draft, standing >= 100). Melt mechanism read from
  code before sweeping: game.js startCombat lifts the
  player-tile monster ONLY when it IS one of the fight's
  monsters (r42 bystander hold); tbfight.worldOrigin is set
  ONLY for a lifted fighter that is a titan or lingering;
  tbEnd restores worldOrigin only on result !== 'won', a
  lingerer only on 'fled'/'lost', and only when a fighter of
  the origin's id still stands AND the origin tile is
  unoccupied; a restored lingerer comes back wounded, a
  restored titan at full HP; every other lifted monster melts.
- Context read first: evidence/2026-10-27/sim-w4funnel-repin-a.md
  and its prereg, plus the sim-findings backlog lines on melt
  (2026-10-27 melt-is-real-funnel-exit; 2026-10-25 TB bystander
  melt #1054; 2026-10-26 tbmelt census #1062 — NOT re-run: that
  census is a different band, different waves, and is never
  conflated with this arm's 5 wave-4 melts).
- Substrate: seeds 73671-73678, tableseat-nowait policy
  (composed upon, never edited), 180d death-aware horizon
  (180 is the cap, not a fixed horizon). Two arms, same seeds:
  PLAIN (no recorders) runs FIRST; ARMED (six recorders) must
  reproduce plain EXACTLY on every shared field or STOP.
- Instruments reused VERBATIM from current master (never
  edited; sha256 in the prereg, identical to repin's):
  raftdraft-diag, spawnsrc-diag, oldcore-diag, w5births-diag,
  defwound-diag. New this run: scripts/policies/w4melt-diag.js
  (W4MELT=1, installed outermost): startCombat lift rows
  (tile monster via the pure monsterAt scan — never
  playerMonster(), which can adopt a debug-set alias — plus
  fighter ids, lifted flag, worldOrigin set), tbEnd settlement
  rows (pre-call: worldOrigin presence, monster fighters
  alive/hp, origin-tile occupancy; post-call: restored
  presence, HP after restore), and daily wave-4 HP snapshots
  (the post-fight HP path). Pure reads only; unset, it
  delegates byte-identically.
- New sweep-side only: scripts/test-w4melt-diag-sweep.js (the
  repin sweep copied: new evidence dir, sixth recorder in the
  armed arm and the detgate, corpusOk extended to w4melt).
  Analyzer reused VERBATIM: scripts/test-w4funnel-diag.js.
  New proof validator: scripts/test-w4melt-a.js (pure corpus
  analysis). New sense script: scripts/test-w4melt-sense.js
  (NON-MEASURED replay only).
- The 5 melts to classify (from repin): 73671 reunion born
  d153 removal d167; 73675 eater born d106 removal d145;
  73675 eulogy born d139 removal d145; 73675 suburb born d150
  removal d167; 73677 suburb born d114 removal d123.
- DIAG-GO rule (ALL required): (a) every melt on the band
  fight-classified (fought entity vs bystander lifted by
  another fight, lingerer/titan restore state, tbEnd restore
  rule cited from code) AND carrying a named no-restore
  reason; (b) per-melt days-to-removal (birth-to-removal AND
  fight-to-removal) and fight result; (c) raid/siege-day
  clustering TESTED, not assumed, for the d145 pair (same
  seed 73675) and the d167 pair (cross-seed — a shared
  calendar day across seeds is not a shared cause, said
  plainly whatever the per-seed answers are); (d) one melt
  thread sense-read in plain words (73675's d145 pair, fixed
  in advance; non-measured replay allowed, replay text never
  enters any count). Gates (STOP, not verdict inputs):
  armed-vs-plain exactness, corpus recorder errors 0 on all
  SIX recorders with no overflow, detgate PASS on 73671,
  analyzer unit proof 48/48. Any leg missing = DIAG-NO-GO.
- Melt-set movement rule (fixed in advance): if the new
  base's melt set differs from the repin 5, that is BASE
  MOVEMENT, reported field by field, and the legs apply to
  the ACTUAL band melts. The validator reports MATCH/MOVED
  (report-only, never a gate failure).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO

- (a) All 5 melts fight-classified: 5/5 FOUGHT-ENTITY (each
  has exactly one w4melt lift row with lifted=true and its id
  among the fight's monster fighters, plus one oldcore tbEnd
  row for the same seq) and 5/5 carrying the SAME named
  no-restore reason (tile-occupied, with the occupying
  monster named per melt — see the census table). Zero
  bystander melts, zero unlifted melts, zero unexplained.
  The r41 bystander class does not occur on this base: the
  r42 hold (lift only when the tile monster IS a fighter)
  holds for every melt.
- (b) Per-melt days-to-removal and fight result: in the
  census table below. All 5 fights are 'lost'; all 5 have
  fight-to-removal lag 0 (the melt removal is recorded at
  tbEnd itself); birth-to-removal spans 6–39 days.
- (c) Clustering TESTED: the d145 pair shares a besieging
  raid (lingerSince d139, a raid day on 73675) and a fight
  day (d145) but d145 is NOT a raid day — no raid-day
  cluster. The d167 pair shares nothing but a calendar day
  across two different seeds — NOT a shared cause, said
  plainly as fixed in advance (per-seed facts below).
- (d) Sense: 73675's d145 pair read below (census timeline,
  authoritative, plus a NON-MEASURED narration replay whose
  trajectory matches the census on all three 73675 melt
  fights — disclosed, and the replay proves wording only).

## CONTROL GATE — PLAIN, ARMED, AND REPIN ALL AGREE

Armed band reproduces plain EXACTLY on every shared field,
per seed and in total (summary gate ARMED-vs-PLAIN: EXACT,
8/8 seeds exact on days, gameDays, endReason, won,
waveReach, maxArc, finalRank, maxRank, nationalEver,
nationalFinal, table, entered, deathTotal,
starvationDeaths, faced, waveKillLog entries). Plain
reproduces the repin band EXACTLY on every field too
(summary gate PLAIN-vs-0615: EXACT) — r54 did NOT move the
control headlines. Detgate PASS (seed 73671: baseline vs
recorders-OFF wrapped, 180d/181 gameDays both,
tsNationalDay 91 both, no diag surface, no wraps
installed, post-setup world 0). Corpus PASS (recorder
errors 0 on all SIX recorders, no overflow). Raftdraft
census matches repin's armed census exactly (raids 89,
raiders 382, pool total 1,442, pool wave-3+ 161).
Analyzer over the new corpus reproduces the repin funnel
EXACTLY (arrivals 31, known 31, outcomes 23 still-present /
2 killed-by-player-fight / 5 melted / 1 departed, fought
11, never-fought 20, stages never-fought 20 /
fought-not-killed 9 / killer-not-living 1, raid pool
wave-4 64 traced / 0 untraced). Proof validator 14/14
(scripts/test-w4melt-a.js). Analyzer unit proof 48/48
(scripts/test-w4funnel-a.js, before and after the sweep).
Melt-set comparison: MATCH (the new base's melt set is
exactly the repin 5 — no base movement).

## CONTROL TABLE (plain == armed == repin)

| field | plain | armed | repin reference |
|---|---|---|---|
| wins | 4/8 | 4/8 | 4/8 |
| national-ever | 7/8 | 7/8 | 7/8 |
| national-final | 5/8 | 5/8 | 5/8 |
| table invited | 5/8 | 5/8 | 5/8 |
| table entered | 4/8 | 4/8 | 4/8 |
| wave-3 reached | 8/8 | 8/8 | 8/8 |
| wave-4 reached | 5/8 | 5/8 | 5/8 |
| wave-5 reached | 0/8 | 0/8 | 0/8 |
| median survival | 130d | 130d | 130d |
| deaths | 284 | 284 | 284 |
| starvation deaths | 2 | 2 | 2 |
| wave-4 kills total | 2 (73671: 1, 73677: 1) | 2 (same) | 2 (same) |

Per-seed (both arms identical): 73671 180d survived wave-4
regional; 73672 118d won wave-4 global; 73673 32d
village-lost wave-3 village; 73674 118d won wave-3
national; 73675 169d village-lost wave-4 global; 73676
144d won wave-4 national; 73677 130d won wave-4 global;
73678 122d village-lost wave-3 regional. Identical to the
repin per-seed table.

Death-cause shares (plain corpus, 284 deaths; armed total
identical): villager combat 123 (43.3%), villager-vs-
villager combat 70 (24.6%), player arena 34 (12.0%),
villager expedition 20 (7.0%), villager sickness 10
(3.5%), wound that wouldn't close 7 (2.5%), ambush 6
(2.1%), villager monster 5 (1.8%), player dehydration 2
(0.7%), starvation 2 (0.7%: 1 villager, 1 player), and
singles at 0.4% each: player lockjaw, The Redactor, The
Congregation, player contest, alien. Identical to repin.

## CENSUS — THE 5 MELTS, FULLY CLASSIFIED

Fight-class for all 5: FOUGHT-ENTITY. No-restore reason for
all 5: TILE-OCCUPIED (a different monster sits on the
origin's tile at tbEnd — occupant named per melt). All 5
origins are lingerers (titan false) at the haven tile
(tx 4, ty 4). All 5 fights are 'lost' with the fighter
still alive at tbEnd. Follow-up for all 5: the melt
removal itself (no re-appearance in any later daily
snapshot, not in the final present list). HP path columns:
world HP at lift (maxHp in parentheses) / TB fighter HP
at fight start / TB fighter HP at tbEnd. The TB fighter
is a fresh copy with its own HP scale — it is NOT the
world HP (e.g. the eater's world body is 712 while its
fight body starts at 1111 and ends at 549).

| melt (seed, seq) | birth → fight → removal | result | birth→removal / birth→fight / fight→removal | lingerer state at lift | tile occupant at tbEnd | HP path (world / start / end) |
|---|---|---|---|---|---|---|
| 73671 reunion (seq 47) | d153 → d167 → d167 | lost | 14 / 14 / 0 | lingering, lingerSince d166 | chorus_line | 900 (1200) / 1310, 1389 (two fighters) / 1203, 1389 |
| 73675 eater (seq 28) | d106 → d145 → d145 | lost | 39 / 39 / 0 | lingering, lingerSince d139 | eulogy | 712 (950) / 1111 / 549 |
| 73675 eulogy (seq 31) | d139 → d145 → d145 | lost | 6 / 6 / 0 | lingering, lingerSince d139 | algorithm | 675 (900) / 999 / 949 |
| 73675 suburb (seq 36) | d150 → d167 → d167 | lost | 17 / 17 / 0 | lingering, lingerSince d164 | reunion | 975 (1300) / 1393 / 543 |
| 73677 suburb (seq 42) | d114 → d123 → d123 | lost | 9 / 9 / 0 | lingering, lingerSince d121 | redactor | 975 (1300) / 1398 / 1153 |

Every melt's world HP at lift is exactly its maxHp minus
the 25% palisade wall toll from its besieging raid
(950→712, 900→675, 1300→975, 1200→900). The daily HP
series shows the same story: the eater sits at 950 from
birth (d106) through d139, then 712L from d140 (the day
after the d139 raid); the eulogy is born d139 at 900 and
is 675L from d140; the 73671 reunion sits at 1200 from
d153 through d166 and is 900 at the d167 lift (the d166
raid's toll, applied after that day's snapshot). The
series ENDS at the fight for every melt — a melted
entity has no post-fight HP path, because there is no
post-fight entity. That absence is the measurement, not
a gap: the daily snapshots run through the end of every
seed and the seq never reappears.

## CONTRAST — THE SAME DOOR, OPEN: 10 LINGERER RE-ENTRIES

The corpus holds 10 wave-4 tbEnd settlements with kind
re-entry (restored lingerers), all 'lost', all with the
tile FREE at tbEnd — the exact mirror of the melts:

- 73671 eulogy (seq 43, born d132): restored d138
  (fighter 612 → hpAfter 612), d139 (954 → 900, capped at
  maxHp), d140 (663 → 663). Later departed d140
  (departure-lost-trail) — a lingerer that survived three
  lost fights and then walked away on its own.
- 73675 reunion (seq 38, born d152): restored d167
  (1184 → 1184), d168 (1083 → 1083; 1238 → 1200, capped),
  d169 (1332 → 1200, capped; 1221 → 1200, capped; 1223 →
  1200, capped). Six lost fights, still present at the
  village-lost end — the repin census's six-loss lingerer,
  now with its mechanism: every restore found the haven
  tile free.
- 73677 influencer (seq 39, born d96): restored d112
  (fighter 388 → hpAfter 388), then killed d113 ('won',
  fighter dead at hp -14 — a kill, not a melt; the restore
  block does not run on 'won', and the tile occupant
  that day, paparazzo, is irrelevant to a kill).

The discriminator is binary across 15 lingerer lost-fight
settlements (5 melts + 10 re-entries): tile occupied →
melt, tile free → restore. No melt has a dead fighter
(the fighter-dead reason never fires: every melt's
fighter is alive at tbEnd); no melt has an unset
worldOrigin (every melt's lift row shows worldOriginSet
true); no melt is 'routed' (the lingerer routed-refusal
never fires: every melt is 'lost'). The tbEnd restore
rule, applied mechanically, leaves exactly one blocker
standing in all 5 cases, and the instrument names it
with the occupant.

## CLUSTERING VERDICT — TESTED, NOT ASSUMED

d145 pair (same seed 73675, eater + eulogy, both removal
d145):
- d145 a raid day on 73675? NO. 73675's raid days are
  19, 28, 45, 53, 60, 67, 77, 92, 100, 111, 118, 130, 139,
  148, 164 — d145 is not among them.
- Same fight day? YES — both melts' losing fights fall
  on d145 itself (tbEnd d145 for both).
- Shared lingerSince? YES — both lingerSince d139, and
  d139 IS a raid day on 73675 (the raid that drafted both
  as raiders: "RAID — 4 raiders (The Algorithm, The
  Eulogy, Big Big, The Eater)"; both unmet, both told
  "it's still out there at the treeline").
- VERDICT: shared besieging origin + same fight day, but
  NO raid-day cluster on the removal day. The coincidence
  is two lingerers from one raid being fought on the same
  day the scholar went out to meet them — the scholar's
  outing is the shared day, not a raid. The removal day
  equals the fight day in both cases (lag 0), so the
  shared removal day is fully explained by the shared
  fight day, and the shared fight day is fully explained
  by the shared outing, not by any d145 event.

d167 pair (cross-seed: 73671 reunion + 73675 suburb, both
removal d167):
- Per seed separately: 73671's melt — fight d167,
  lingerSince d166, and d166 IS a raid day on 73671
  (raid days include 156, 166); 73675's melt — fight
  d167, lingerSince d164, and d164 IS a raid day on 73675
  (raid days include 148, 164). d167 is a raid day on
  NEITHER seed (73671's list ends 156, 166; 73675's ends
  148, 164).
- VERDICT (fixed in advance, stated plainly): NO
  shared-cause claim across seeds. Two different villages,
  two different raids (d166 vs d164), two different
  entities, two different tile occupants (chorus_line vs
  reunion) — the shared calendar day d167 is coincidence.
  Each seed's melt is fully explained inside its own run
  (its own linger raid + its own d167 fight + its own
  occupied haven tile); nothing needs to cross between
  runs to explain it, and nothing may.

Siege-day note (fixed in the prereg): lingering gorges
happen nightly (havenGrowthDaily), not on event days —
there is no single "siege day" in the corpus vocabulary
to cluster on. The testable events are raid days and
fight days; neither pair clusters on a raid day, and no
"siege cluster" is claimed under another name.

## WHAT A MELT IS, MECHANICALLY, AFTER A LOST TB FIGHT

A wave-4 melt is a five-step chain, and every step is
measured here, not inferred:

1. RAID + TOLL. A raid drafts the entity; the palisade
   takes its 25% wall toll (maxHp → 75%: 950→712,
   900→675, 1300→975, 1200→900). The toll is the last
   thing that touches the world body before the melt.
2. UNMET → LINGER. No defender meets it, so it stays at
   the treeline — lingering=true, lingerSince stamped
   with the raid day — and gorges nightly. It is now a
   besieging raider, and its home tile is the haven tile
   (4, 4), where it sits with every other lingerer.
3. LIFT AS THE FIGHT'S OWN MONSTER. The scholar meets
   it; startCombat lifts it (it IS the fight's monster,
   so the r42 bystander hold does not protect it) and
   sets worldOrigin (it is a lingerer). This is a fought
   entity, never a bystander: the melt's fight IS its
   fight.
4. LOST, FIGHTER ALIVE. The scholar loses ('lost' =
   the scholar dies; the monster's fight body survives,
   wounded: 549, 949, 543, 1153, 1203/1389). The restore
   block therefore runs — result is non-won, the
   lingerer qualifies on 'lost', a fighter stands.
5. TILE OCCUPIED → NO RESTORE. The restore's last
   condition fails: another monster sits on (4, 4)
   (chorus_line, eulogy, algorithm, reunion, redactor).
   The entity is not put back, is not in the world, and
   has no other exit: no kill log entry, no carcass, no
   departure, no farewell beat. It is simply gone, the
   same day it was fought (fight-to-removal lag 0).

That is what distinguishes a melt from its neighbors:
a KILL is a 'won' (or pyrrhic 'lost' with a dead
fighter — neither applies here, since every melt's
fighter lives); a DEPARTURE walks away under its own
power on a later monsterTurn (the 73671 eulogy d132
did exactly that after three successful restores); a
FLED-RECORD is a fledMonsters entry, not a tbEnd
settlement; a BYSTANDER melt is the r41 class (a tile
monster lifted by a fight it is not in) — closed by the
r42 hold, zero instances here; and a RESTORE is the
same chain with step 5 passing (tile free), which the
corpus shows 10 times. A melt is the chain with step 5
failing: a lingerer the village failed to kill, failed
to drive off, and then failed to keep — because the
door it came back through was blocked by someone else
standing in it.

The haven-tile crowding is the load-bearing detail:
every melt's origin sits at (4, 4), and (4, 4) is where
lingerers are parked. The restore check
`!monsterAt(o.tx, o.ty)` is a single-occupancy test on
a tile that routinely holds several monsters. When the
scholar meets a lingerer on a crowded haven tile and
loses, the lingerer melts — not because it was beaten,
not because it left, but because there is nowhere to
put it back. (Stated as measured mechanism, not a fix
proposal: this arm classifies the door; whether the
tile check should yield is a Steve design ruling, and
the tbmelt-a ruling question #1062 is still open.)

## DISTINGUISHED FROM THE TBMELT-A BYSTANDER CENSUS

Do not conflate: sim-tbmelt-a (2026-10-26) counted 7
melts / 128 TB fights on an older band, waves w1 4 / w2 2
/ w3 1 / w4 0, doors wanderer-pending 4 + contest-arena
3, 0 veteran-flagged — bystander melts, monsters lifted
by fights they were not in. This arm counts 5 melts on
the repin band, ALL wave 4, ALL fought entities, ALL
lingerers, ALL tile-occupied restores refused — a
different door on a different band. The bystander door
and the lingerer-restore door share only the word
"melt": one is a lift that should never have happened
(closed by r42), the other is a restore that could not
complete (open, measured here, 5/31 wave-4 arrivals =
16.1% of the funnel's arrivals, 5/9 of its
fought-not-killed stage).

## SENSE-TESTING READ — 73675'S d145 PAIR (plain words)

The census timeline is the authoritative thread; the
replay (scripts/test-w4melt-sense.js, SEED=73675
DAYS=169, window d139–169, saved as
perseed-w4melt-a/sense-73675.txt, 599 lines) matches it
on all three 73675 melt fights (Eater d145, Eulogy d145,
Suburb d167 — all three appear as turn-based fights on
exactly the census days) and is used for wording only.

Day 139: a raid hits Haven in the night — four raiders,
The Algorithm, The Eulogy, Big Big, The Eater, drawn by
the smell of the pantry. The palisade takes its toll as
they come over the wall. Nobody meets any of them. The
fiction says it four times, once per raider: "Nobody
met The Eater — it's still out there at the treeline.
It'll gorge every night until it's driven off." And
then it does: night after night the gorge lines come —
"The lingering The Eater gorges at the treeline — 1,453
kcal gone," "1,350," "1,080," "670" — and the same for
The Eulogy beside it, 1,074, 630, 600, 1,440. The
village is being eaten alive by two monsters it can
see from the fire, and the game tells it the price and
the choice every night: endure it (they drift off
within ~6 nights) or send a sortie.

Day 145: the scholar goes out. The Eater first — "THE
EATER! Elena, Aisha join you!" — teeth, no warning, the
scholar striking back for 173 and 168 with the
Worldbreaker Maul while companions land their own
blows. The scholar loses. Then The Eulogy, the same
day — "THE EULOGY! Somchai joins you!" — narrating the
fight as it happens ("and then they stood their ground,
poor brave fools," "and then they ran, and the
spotlight followed," "and then they bled, politely,
where everyone could see"). The scholar loses again.
And then: nothing. No farewell beat, no "it didn't
leave — you did" (that line fires only on a successful
linger restore), no drift beat. The gorge lines simply
stop. The Algorithm, the fourth raider from the same
d139 raid, keeps gorging on d145 and then gets its own
beat on d146 — "The Algorithm stops at the treeline —
pacing, unwilling. The walls end the argument. It's
still out there." The game knows how to say goodbye to
a lingerer that drifts off. It says nothing at all for
one that melts.

Sense judgment: the d145 pair reads as a siege the
village survived by accident. The Eater and the Eulogy
were never "fought" in the sense the village chose a
fight — they were a tax the village endured for six
nights, and then, on the day the scholar finally met
them, the tax collectors vanished without a receipt.
The player who lived those six nights — watching the
pantry bleed a thousand kcal a night, weighing a
sortie that might kill a villager — gets no payoff
scene for either monster: not a kill, not a departure,
not even the drift's quiet "melts back into the dark."
The monsters that ate the village's food for a week
simply stop existing, mid-siege, because a different
monster happened to be standing on the village tile
when the scholar fell. That is coherent as a system
(the restore rule is legible once you see it) and
incoherent as a story (the fiction promises these
things gorge "until driven off," and melting is neither
driven off nor endured — it is unhappened). The melt
is honest in the census and silent in the fiction, and
that silence is itself a finding: a player cannot learn
this door exists from playing, only from counting.

NON-MEASURED replay note: the replay's trajectory
matches the census on the melt fights, but replay text
never enters any count above — the census tables come
from the corpus rows (oldcore + w4melt + raftdraft),
and the replay proves wording and presence only (the
d139 raid composition, the nightly gorge beats, the
d145/d167 fight beats, the Algorithm's d146 drift
beat). The replay's tap regex also catches ambient
daily lines (the repeated Contract Quill beat) — noise
in the instrument, not in the game.

## VILLAGE ASSESSMENT (plain words)

These are the same eight villages as the repin band —
their fates did not move — so what is new is what
happened to five of their monsters after the village
lost to them. The answer is unglamorous and specific:
they were all besiegers. Every melted monster had
already been to the village's wall, already been
wounded by it, already been left standing at the
treeline because nobody went out to meet it — and then
the scholar did go out, lost, and the monster vanished
anyway, not because the village beat it but because
the village tile was crowded. The villages that won
(73672, 73674, 73676, 73677) did so with this door
mostly shut (73677's one melt aside); the villages
that did not win (73671 survived to 180d, 73675 and
73678 village-lost) ate the door's cost in the open. 73675 is the clearest:
thirteen Mirror Draft monsters, three of them melted
after lost fights, ten still standing at the end, zero
killed — a village that absorbed the whole Mirror
Draft as weather, including three monsters it fought,
lost to, and then watched unhappen. The funnel's new
shape, "arrive, rarely meet, often melt," now has its
melt mechanism named: the melt is not a monster
leaving. It is a monster that cannot come back.

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with numbers): what a wave-4 melt IS
  after a lost TB fight — the five-step chain above, with
  per-melt fight classification (5/5 fought-entity),
  lingerer state (5/5 lingering, lingerSince per melt),
  no-restore reason (5/5 tile-occupied, occupant named),
  HP paths (world toll → fight body → wounded end →
  nothing), follow-ups (5/5 melt removal, no
  re-appearance), and the 10-settlement contrast proving
  the tile check is the discriminator.
- FILLED (clustering, tested): d145 pair — shared
  besieging raid (d139) + shared fight day (d145), NOT a
  d145 raid-day cluster; d167 pair — no shared cause
  across seeds (different raids d166 vs d164, different
  entities, different occupants; d167 a raid day in
  neither seed).
- FILLED (control, re-pinned again): plain == armed ==
  repin on every headline, plus the raftdraft census
  identical (89 / 382 / 1,442 / 161) — r54 moved nothing.
- OVERTURNED (a plausible reading that does not stand):
  the melts are NOT bystander melts (0/5 — the r42 hold
  holds), NOT fighter-dead melts (0/5 — every fighter
  lives at tbEnd), NOT routed-lingerer refusals (0/5 —
  every fight is 'lost'), and NOT raid-day events (0/2
  pairs cluster on a raid day).
- DOCUMENTED, NOT FIXED (named next blanks): whether the
  haven-tile restore check should yield when the tile is
  crowded (a Steve design ruling — this arm classifies,
  it does not propose the lever; the tbmelt-a ruling
  question #1062 stays open, now with a second, distinct
  melt door measured); the melt's silence in the fiction
  (no farewell beat for a melted lingerer, while drift
  gets one — a narration blank, not a counting blank).
- CARRIED (not chased here): the 33 unsettled TB starts
  on 73675 (startCombat rows with no tbEnd row, clustered
  d113–118, d126–127, d152 — fights abandoned without
  tbEnd; the tbfight=null sites in game.js/party.js are
  the candidate paths; appended to sim-findings.md as an
  open item, not investigated here); the single
  direct-build tbEnd on 73671 (d179 'lost', no startCombat
  row, no worldOrigin — a fight built without startCombat,
  not a melt, noted in the instrument section below).

## INFRASTRUCTURE NOTES

- Sweep: scripts/test-w4melt-diag-sweep.js (repin sweep
  copied: plain arm, armed arm with SIX recorders,
  summary gate armed-vs-plain exact + melt census print).
  Corpus: evidence/2026-10-27/perseed-w4melt-a/ (16 rows
  + summary.json + analysis.json + sense-73675.txt).
  Analyzer: scripts/test-w4funnel-diag.js (verbatim).
  Unit proof: scripts/test-w4funnel-a.js (48/48).
  Validator: scripts/test-w4melt-a.js (14/14).
  Sense: scripts/test-w4melt-sense.js (NON-MEASURED
  replay only). New instrument:
  scripts/policies/w4melt-diag.js (W4MELT=1).
- Instrument notes (stated, not hidden): (1) On 73675,
  w4melt records 61 startCombat rows but 28 tbEnd rows
  (42 of the starts carry a wave-4 tile monster). The gap
  is engine behavior, not recorder loss: unsettled starts
  cluster on d113–118, d126–127, d152, settlements resume
  after each cluster, pendingLifts at run end is empty,
  and all six recorders report errs 0. Every melt has
  exactly one fight row + one settlement + one oldcore
  tbEnd, so no melt classification depends on the gap.
  (2) On 73671, one settlement (d179 'lost') has no
  startCombat row and no worldOrigin — the tbmelt
  vocabulary's DIRECT-BUILD class (a fight built without
  startCombat). It settles nothing, removes nothing, and
  is not a melt. (3) The validator's settlement pairing
  is greedy in-order (oldcore tbEnds are a subsequence of
  w4melt settlements: oldcore skips tbEnds with no
  recovered origin); for the 5 melts the pairing is
  origin-seq-exact, not order-guessed, because every melt
  origin is a lingerer with worldOrigin set.
- Safe-commit index clobber hit the prereg commit
  (e2d28c73b) — the known class: the commit itself
  correct, the main index showing a bogus staged deletion
  after. Repaired via HEAD-blob cacheinfo, verified with
  git status --short empty + git diff HEAD empty +
  worktree files intact, before any further work.
- No EPERM flap blocked this run's writes; all 16 rows
  wrote first try (the sweep's writeFileRetry was not
  needed beyond its first attempt). Plain sweep ~14 min
  (8 seeds), armed sweep ~12 min (8 recorder-heavy
  seeds), detgate ~5.5 min (2 seeds) — slower than
  repin's wall times, consistent with sibling CPU
  contention on the shared box, not with a slowdown in
  the game or the recorders.
- Commit: sim-w4melt-a, DIAG-GO, zero src/js diff. Ready
  for coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this arm's).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged
exactly against its four pre-registered DIAG-GO legs
(a) every melt fight-classified with a named no-restore
reason (5/5 FOUGHT-ENTITY, 5/5 tile-occupied — achieved),
(b) per-melt days-to-removal (birth-to-removal AND
fight-to-removal) and fight result (all 5 tabulated —
achieved), (c) clustering TESTED for both pairs (d145:
shared raid + shared fight day, no raid-day cluster;
d167: cross-seed, no shared-cause claim — achieved),
(d) 73675's d145 pair thread described in plain words
(census timeline + replay note — achieved). Gates all
passed: armed-vs-plain EXACT (8/8 seeds), plain-vs-repin
EXACT (report-only, would not have failed the run
either way), corpus PASS (six recorders, errs 0, no
overflow), detgate PASS, analyzer unit proof 48/48,
proof validator 14/14. Two method notes, neither a
revision: (1) The melt-set movement rule was fixed in
advance and never needed: the new base's melt set
MATCHED the repin 5 exactly, so no MOVED branch was
taken and no judgment call was needed. (2) The sense
replay's first capture was truncated by a `tee | head`
pipeline (SIGPIPE cut the file at 144 lines); the
replay was re-run with a direct redirect (599 lines,
complete) and only the complete file is cited — the
truncated capture was overwritten, never quoted. The
telemetry-check and balanced panel were NOT run, per
the standing exception for recorder rows (panel cannot
ingest per-seed recorder corpora — carried from
w4funnel-repin-a). The sweep-compare table + analyzer
output are the comparison of record. The telemetry
baseline was NOT rolled. No game code changed in this
run; no [needs-eyes] flag applies (DIAG-only, no
narration or behavior added — the sense script only
READS beats on a replay, it adds none to the game).
