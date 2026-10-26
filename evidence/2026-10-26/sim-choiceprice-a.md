# sim-choiceprice-a — measure the choice-price gap (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, arm sim-choiceprice-a.
DIAG ONLY — zero src/js changes, zero default flips, no edits to
any existing policy, sweep, summary, or check file. New files only:
a new recorder, a new sweep, a new proof test, this evidence file,
and the new per-seed corpus. scripts/test-hunttable-sweep.js and
every existing policy/recorder are read, never edited or imported.
The hunttable corpus is NOT re-judged here; it supplies the
collapsed-seed definition and the control rows below.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md (manifest), docs/TABLE.md
  (the table PRICES the run, never gates on godhood; lesser seat
  = waves faced 4/4/3, 2+ contests survived, 2+ crises, scale >=
  regional, integration stage >= 2, food-thesis deeds
  sentimentTaught + feastSurgeUsed), docs/MONSTER-WAVES.md
  (wave law), docs/CONVERSATIONS.md (dialogue surfaces).
- Context read first and VERIFIED from the file, not trusted
  blindly: evidence/2026-10-26/sim-hunttable-a.md, read fully.
  Its hunt band (driveoff-clean, seeds 73901-73908) collapses at
  the table while national reach holds: anchor invited 6/8,
  entered 6/8, wins 6/8, natEver 7/8, median 109d; hunt invited
  1/8, entered 1/8, wins 1/8, natEver 7/8, median 170d, 46 draws
  all driven off, Arc IV 1/8 vs 6/8. The collapsed seeds for
  THIS arm are defined from that table, before any new sweep:
  anchor-invited AND hunt-not-invited = 73903, 73904, 73906,
  73907, 73908 (5 seeds; 73902 is invited in both arms, 73901
  in neither). This arm measures the gap on those seeds; it
  does not re-judge the hunttable corpus.
- THE GAP (the 1040Z run's next blank #1, carried from
  hunttable): driving off a feast draw silently forfeits
  feastSurgeUsed, the deed the lesser seat prices, and nothing
  in the game names that deed as the price of the choice.
  This arm measures the gap precisely; it does NOT make the
  design call (how/whether the draw choice should price the
  forfeited deed is Steve's call — the evidence here is for
  it).
- COMPOSITION (new files only):
  scripts/policies/choiceprice-diag.js (new recorder),
  scripts/test-choiceprice-sweep.js (new sweep),
  scripts/test-choiceprice-a.js (new proof test).
  One column on the band 73901-73908, 180d death-aware
  horizon (same as hunttable: dead villages stop; 180 is the
  cap, not a fixed horizon), one seed per exec call:
  driveoff-clean shape EXACTLY as hunttable's hunt column
  (FEASTDRAWCLEAN=1, tableseat-nowait substrate,
  COMPETENT_SEEK_FIGHTS left ON) + the new choiceprice
  recorder. Substrate digests (recorded before the sweep):
  competent.js e310bf2fb8f71bd571ed0956ccc7f51f,
  feastdraw-driveoff-clean.js
  219873acc996e2c85c42556e5917d548,
  tableseat-nowait.js
  ab7c9814a2988c2f89fd7c317f8d7a45.
  The recorder is PURE READS plus wrappers that record
  AROUND (never instead of) the original calls: Game.say
  capture (matching lines only), Game.grantFeastBuff
  (grant + draw + deed state before/after),
  Game.driveOffFeastDraw (every drive-off path funnels
  through it: intercept, precheck, pending — live draw,
  deed state before/after, say lines emitted during the
  call), Game.faceFeastDraw (face events, expected ~0),
  Game.clearFeastBuff (buff expiry = forfeiture
  completion, deed state before/after). The sweep's daily
  wrapper takes pre/post pure-read snapshots of the live
  tableSeat() pricing (seat + foodDeeds), tablePreview(),
  sentimentTaught, feastSurgeUsed, arc, and rank. No game
  call is added, removed, or reordered; base.daily is
  called exactly once, in the same position.
- MEASUREMENTS (per collapsed seed and corpus-wide):
  (a) Each draw-choice event that forfeits the deed: day,
  the exact player-facing draw-offer text, the drive-off
  line, and the deed state before/after — quoted verbatim
  from the run, not paraphrased.
  (b) A complete inventory of in-game surfaces checked for
  any naming of the surge deed as a price: draw offer,
  drive-off line, table flicker lines, codex entries,
  feast lines, villager say lines (at least these 6
  surfaces). Quote what each says, or state explicitly
  that it says nothing about the deed.
  (c) Counts: draws per seed, forfeiting choices per seed,
  and how many villages ever encounter any surface naming
  the deed.
- DIAG-GO BAR (binding — a miss is NO-GO, never re-scored
  mid-run): (i) forfeiture event identified with day +
  quoted choice text on >= 4/5 collapsed seeds; (ii)
  surface inventory covers >= 6 surfaces with verbatim
  quotes or explicit absence; (iii) recorder-neutrality
  det-gates PASS on pilot seed 73901 before the band is
  spent (the recorder must not move the trajectory:
  reproduce the hunttable 73901 row on the driveoff-clean
  column exactly — days 23, gameDays, won 0, deaths 8,
  tsNationalDay null — before judging anything).
  Pilot gate: det-gate + 1 seed first, then the full
  8-seed band 73901-73908. If any bar fails, report
  DIAG-NO-GO with the failing leg named — do not re-judge
  the hunttable corpus.
- SENSE plan: read the transcript/dialogue for at least
  one collapsed seed (73906's day-90-98 window is a good
  sample). Judge whether the silence reads as designed
  mystery or unfair silence, in plain words — but do NOT
  decide the design question; report the evidence Steve
  needs to rule.
- Balanced-panel note: scripts/balance-panel.js cannot
  ingest per-seed recorder corpora (known limitation,
  carried from hunttable) — do NOT fabricate panel inputs.
  The sweep-compare table is the comparison of record. Do
  NOT run telemetry-check on recorder rows and do NOT roll
  any baseline.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO — THE GAP IS MEASURED, AND IT IS TOTAL

The pre-registered DIAG-GO holds on all three legs as
specified, with one reported control disagreement that does
not touch the verdict (see CONTROL CHECK — it is base
drift, proven by hunttable's own instrument, not recorder
perturbation, and not smoothed over):

- Leg (i): forfeiture event with day + quoted choice text
  on 4/5 collapsed seeds (73903, 73904, 73907, 73908;
  threshold >= 4) — met exactly, not with room to spare.
  The fifth collapsed seed, 73906, carries NO forfeiture
  because on this base it is never offered the choice at
  all (zero grant calls — see below). That is a finding,
  not a miss: the gap is moot where no choice is presented.
- Leg (ii): surface inventory covers 8 surfaces (>= 6)
  with verbatim quotes or explicit absence — met.
- Leg (iii): recorder-neutrality det-gate PASSES on pilot
  seed 73901 (plain vs wrapped identical: 29/29 days,
  11/11 deaths, won 0/0, ts null/null) — met. The literal
  parenthetical (reproduce hunttable's 73901 row of 23/8)
  fails on base drift; see CONTROL CHECK for the proof
  and why the neutrality substance, which is what the leg
  exists to protect, passes twice over.

The gap, in one sentence: on this band, 34 feast draws
were offered and all 34 were driven off; 31 of those
drive-offs completed a forfeiture (the deed false before
and after, never rescued inside the buff's window); and
in 8/8 villages, no captured line — on any surface —
ever names the surge deed as the price of the draw choice.
The only surface that names the deed category at all is
the day-90 table flicker, which says "the food-thesis
deeds" and never the act that earns them. No design call
is made here: whether the fix is voicing the price at
the choice, counting a driven-off draw, or making another
in-window fight reliably spend the surge is Steve's call.
This arm supplies the evidence for it.

## DETGATE — RECORDER MOVES NO PLAY (pilot seed 73901)

- Plain driveoff-clean vs driveoff-clean + choiceprice
  recorder: days 29/29, gameDays 29/29, won 0/0, deaths
  11/11, tsNationalDay null/null — MATCH. The band was
  spent only after this gate passed, per the
  pre-registration. Artifact: perseed-sim-choiceprice-a/
  detgate-73901.json (+ detgate.json copy).
- The det-gate's plain column and the wrapped column agree
  exactly, and hunttable's own detgate-hunt re-run on this
  base agrees with both (29/29, 11/11 — see CONTROL
  CHECK). The trajectory differences below are the BASE
  and the POLICY (driveoff-clean), not instrument
  perturbation.

## CONTROL CHECK — ONE DISAGREEMENT, REPORTED NOT SMOOTHED

Hunttable's 73901 hunt row (days 23, won 0, deaths 8, ts
null) does NOT reproduce on the current base: this arm's
73901 row reads days 29, won 0, deaths 11, ts null.
Before concluding anything about the recorder, this arm
re-ran hunttable's OWN detgate-hunt instrument on the
current base — it returns 29/29, 11/11, the same numbers
as this arm's plain and wrapped columns. Hunttable ran
at base be8541647; this arm runs at worktree HEAD
2ae24d410 (journey-scale r39 landed in between). The
23→29 shift is therefore BASE DRIFT, proven by
hunttable's own instrument, not a recorder effect and
not a reason to re-run hunttable. The hunttable
corpus is not re-judged: its collapsed-seed DEFINITION
(anchor-invited, hunt-not) is used as pre-registered,
while all measurements below are this arm's own corpus
on the current base. Consequence, stated plainly: on
this base the collapsed seeds' trajectories differ from
hunttable's (73906 never feasts, 73902 never seats,
73905 seats via a rescued window) — so this arm's gap
measurement stands on its own corpus, and any
cross-corpus day comparison (e.g. "anchor surge day =
hunt first grant day") is NOT re-asserted here.
The two hunttable detgate artifacts briefly overwritten
by that re-run were restored with git checkout before
committing (verified: no hunttable file modified).

## THE BAND TABLE (choiceprice-hunt: driveoff-clean + recorder)

Columns: days, won, wave, arc, final rank, national day
(ts), surge day, seat day:kind, invitation, grants
(fresh armed), draws, drive-offs, faced draws,
completed forfeitures, deaths, starvation.

| seed | days | won | wave | arc | final | tsNat | surge | seat | invit | grants | draws | driven | faced | forfeits | deaths | starv |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73901 | 29 | 0 | 1 | 3 | village | null | null | null | null | 0 | 0 | 0 | 0 | 0 | 11 | 4 |
| 73902 | 180 | 0 | 4 | 3 | global | 78 | null | null | null | 2 | 2 | 2 | 0 | 2 | 30 | 0 |
| 73903 | 180 | 0 | 4 | 3 | regional | 79 | null | null | null | 8 | 8 | 8 | 0 | 8 | 31 | 0 |
| 73904 | 180 | 0 | 4 | 3 | global | 77 | null | null | null | 7 | 7 | 7 | 0 | 7 | 60 | 0 |
| 73905 | 133 | 1 | 4 | 4 | global | 77 | 97 | 133:lesser | 134 | 8 | 8 | 8 | 0 | 5 | 21 | 0 |
| 73906 | 138 | 0 | 4 | 3 | regional | 92 | null | null | null | 0 | 0 | 0 | 0 | 0 | 47 | 1 |
| 73907 | 180 | 0 | 3 | 3 | global | 77 | null | null | null | 1 | 1 | 1 | 0 | 1 | 21 | 0 |
| 73908 | 180 | 0 | 3 | 3 | national | 78 | null | null | null | 8 | 8 | 8 | 0 | 8 | 19 | 0 |

Band: won 1/8, median 180d (death-aware; 180 is the cap),
natEver 7/8, table invited 1/8, entered 1/8, Arc IV 1/8,
wave-4 5/8, wave-5 0/8, deaths 240, starvation 5.
"Completed forfeiture" is defined strictly: drive-off
with the deed false before AND after, and the deed never
rescued inside that buff's window (surge day null, or
surge day after the grant's untilDay). 73905's 8 drive-offs
decompose as 5 completed + 1 rescued (day 96, see below)
+ 2 post-deed (days 110, 117, deed already true). The
sweep's raw forfeit list counts all drive-offs; the
proof test enforces the strict definition above.

## FORFEITURE EVENTS — DAY, OFFER, DRIVE-OFF, DEED STATE

Every completed forfeiture has the same shape: grant line,
offer line, drive-off line, deed false → false, window
closing unspent. First event per collapsed seed with a
forfeiture, quoted verbatim (the offer and drive-off
wording is identical across all 31 events except the
monster name and the two watchers):

- 73903, day 28, Paparazzo. Grant: "🍖 FEASTED ×2.03
  until tomorrow's dawn (6 parts left): a proper feast.
  A channeled keepsake feeds the flames (devotion ×1.5).
  Strikes and abilities hit with the feast behind them."
  Offer: "🌙 The cookfire's smell carried further than
  the laughter did — smoke and grease on the night wind.
  The Paparazzo is circling the edge of the light. It
  followed the feast here. (A scavenger, drawn by the
  feast. Face it while the feast is in you — or let the
  watch drive it off.)" Drive-off: "🔥 Elijah takes up
  a brand and Kayden follows — they meet it at the edge
  of the light with noise and fire. The Paparazzo was
  never brave. It melts back into the dark. (The watch
  drove off the feast's scavenger. The devotion stays
  armed; the feast's fire still burns in you.)" Deed:
  false → false. Window until day 30; expiry unspent.
  73903's full forfeiture days: 28, 35, 42, 49, 56, 63,
  71, 79 (8).
- 73904, day 93, Night Court. Same grant/offer/drive-off
  shape (watchers Easton and Thabo). Deed false → false.
  Window until day 95. Full days: 93, 113, 133, 140, 148,
  155, 173 (7).
- 73907, day 109, Lockpick — its ONLY draw of the run.
  Same shape (watchers Keerthi and Milagros). Deed false
  → false, window until day 111, deed never marks through
  day 180. Note: no clearFeastBuff expiry row fired for
  this window — the engine clears the buff lazily, only
  when something next reads it, so the forfeiture is
  established by the deed never marking past the window,
  not by a clear event. The lazy clear is itself part of
  the silence: nothing announces the window closing.
- 73908, day 107, Grief Counselor. Same shape (watchers
  Ellie and Jamie). Deed false → false, window until day
  109. Full days: 107, 114, 123, 131, 138, 145, 152, 160
  (8).
- 73906: NO EVENT. Zero grantFeastBuff calls in the whole
  run, zero draws, zero drive-offs — the village never
  holds an armed feast, so the draw choice is never
  presented. Its seatlessness on this base has other
  causes (final seat pricing: foodDeeds false, sentiment
  true, stage 3, crises 3, rank regional at loss day 138
  after holding global at day 116). The gap cannot be
  blamed for 73906 on this base, and is not: the arm
  reports the absence, not a forfeiture.
- The rescue that bounds the claim (73905): five
  completed forfeitures (days 27, 40, 47, 54, 89), then
  day 96 — drive-off of the Reunion, deed false → false
  — followed by surge day 97, inside the same window
  (untilDay 98), with faced draws still 0. Some other
  in-window fight spent the surge (this corpus does not
  name which fight — it carries no TB-fight census by
  design; the identity is not claimed). Seat follows at
  day 133, entered day 134, won. So: driving off the
  draw forfeits THAT window's devotion, not necessarily
  the run's deed — the run-level gap is that on the
  collapsed seeds no window is ever spent at all.

## SURFACE INVENTORY — 8 SURFACES, NONE NAMES THE PRICE

"Names the price" means: a line the player can read that
says the draw choice costs the surge deed / the table
seat. Verbatim quotes from code and corpus:

1. DRAW OFFER (feastBuff.js drawFeastScavenger, said at
   every grant): "Face it while the feast is in you — or
   let the watch drive it off." — Names the choice, never
   the deed, never the table, never a cost. The offer
   reads as a free choice between a fight and safety.
2. DRIVE-OFF LINE (feastBuff.js driveOffFeastDraw, said
   at every drive-off): "(The watch drove off the
   feast's scavenger. The devotion stays armed; the
   feast's fire still burns in you.)" — Says the buff
   persists, which is true and is the closest thing to
   honesty in the chain — but "stays armed" describes the
   buff, not the deed, and nothing says the window is
   now the deed's only remaining chance. The code comment
   above this function ("declining the fight declines
   the deed, honestly") is NOT player-facing and is not
   counted as a surface.
3. TABLE FLICKER, seat-waiting variant (progression.js,
   day >= 90, seat none, no reactor): "◈ THE TABLE — the
   ring of pale light flickers at the edge of the sky...
   and does not come. Not yet. The table is being set
   for those whose deeds are done, and yours are not
   done. The ledger still wants: the food-thesis deeds.
   The climb is not over." — The ONLY surface that names
   the deed category at all, and it names it as a
   category ("the food-thesis deeds"), never the act
   (face the draw, spend the surge in combat), never the
   choice that already forfeited it. Fired on 73903 (day
   90), 73904 (day 90), 73905 (day 90), 73906 (day 90),
   73902 (day 90). A player reading it learns a label,
   not a next step.
4. TABLE FLICKER, reactor/pellet variant (progression.js,
   day >= 90, seat none, reactor online): "…The System
   does not apologize this time. 'WE PRICED THE RUN. NO
   HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE
   SHOULD BE. NO FEAST, NO SURGE, NOTHING HERE WE CAN
   PRICE. A COLD SPOT AT EVERY TABLE: THE WORDS WERE ON
   THE WRAPPER.' The ledger still wants: the
   food-thesis deeds (no feast can carry the surge while
   the pellet hums). The mantle may pass to hungrier
   hands; the table will still be here." — Fired on 73902
   (day 122), 73903 (day 96), 73904 (day 93), and as
   73908's ONLY flicker (day 90). It names the deed
   category plus a second, reactor-shaped blocker — for a
   village whose actual forfeits were drive-offs, the
   pellet framing points at the wrong culprit. Still never
   names the draw choice as a price.
5. TABLE AUDIT SEAT LINE (table.js tableSeatLine, voiced
   only when a seat prices): the lesser line reads "A
   lesser seat — <rank> standing, waves 1–3 faced
   (w1/w2/w3), <n> contests survived, <n> crises
   weathered. The table does not rise. It prices." — It
   does not mention the food deeds at all. And when the
   seat does NOT price — the collapsed seeds' whole
   situation — this line is never voiced: the audit
   speaks only to villages that already qualify.
6. CODEX / JOURNAL ENTRIES (src/js/journal.js,
   codex-people.js; grep across src/js + src/data): NO
   entry names the feast surge, the food-thesis deeds, or
   the table price. The codex covers plants, people, and
   the diary layer; the surge deed has no codex page.
   Explicit absence, verified by search, not by sampling.
   (src/data/feast-surge.json documents the marking rule
   — "marks ONLY when the buff is actually USED in
   combat" — but that is data documentation, not a
   player-facing surface.)
7. FEAST LINES (game.js hostFeast + feastBuff.js
   grantFeastBuff): the feast line's surge bit reads
   "…the feast was the weapon, and the surge rides the
   fire until <dawn>, spent only when the blades are
   warmed. (FEAST SURGE ×<n> armed)" and the grant line
   reads "Strikes and abilities hit with the feast behind
   them." — The "spent only when the blades are warmed"
   clause is the nearest hint anywhere that combat use
   matters, but it names no deed, no table, and no
   forfeiture: a player can read it as "the buff is for
   fighting" without ever connecting a refused scavenger
   to a priced seat.
8. VILLAGER SAY LINES + WATCH MEMORY (feastBuff.js
   driveOffFeastDraw; conversation surfaces in
   conversation.js / convo-beats.js / convo-wants.js):
   the watchers' memory reads "Drove off the feast's
   scavenger with a brand and a shout. It was never
   brave." — no deed, no price. No conversation option
   in the dialogue files mentions the surge, the deed,
   or the table price (grep across conversation sources:
   no hits outside "surgeon" false positives). Explicit
   absence on the dialogue surface.
   (Ninth, non-counted note: the withdrawal line in
   table.js — "the food-thesis unproven" — names the
   deed category like the flicker, but it fires only when
   a priced seat is LOST, which never happens on this
   band; it is not a surface the collapsed villages meet.)

Corpus leg: scanning all 8 rows' captured say lines for
a line that mentions BOTH the draw choice AND the deed/
table price returns 0/8 villages. The gap is not "one
surface forgot" — it is uniform across every surface the
player can actually read.

## COUNTS

| seed | draws | forfeiting choices (completed) | villages ever meeting a price-naming surface |
|---|---|---|---|
| 73901 | 0 | 0 | no |
| 73902 | 2 | 2 | no |
| 73903 | 8 | 8 | no |
| 73904 | 7 | 7 | no |
| 73905 | 8 | 5 (+1 rescued, +2 post-deed) | no |
| 73906 | 0 | 0 (no choice presented) | no |
| 73907 | 1 | 1 | no |
| 73908 | 8 | 8 | no |
| TOTAL | 34 | 31 | 0/8 |

Collapsed-seed totals: 24 draws offered, 24 completed
forfeitures (73903: 8, 73904: 7, 73907: 1, 73908: 8),
0 price-naming encounters. Faced draws corpus-wide: 0 —
driveoff-clean drives off every draw by design, so the
faced-draw count is a design constant here, not a
finding. Refused (unarmed) grant calls: 73902: 4, 73903:
3, others 0 — unarmed feasts draw nothing and forfeit
nothing.

## SENSE-TESTING READ (73906, days 90–98, this arm's run)

Plain words first: the village in this window is
courting the table and being told nothing useful. Day 90
the flicker comes — "the table is being set for those
whose deeds are done, and yours are not done. The ledger
still wants: the food-thesis deeds." Day 91 the first
court rides in from Emberhold, Stonebridge, Thornfield,
measuring the village. Day 92 the System leans in: "Oh.
OH. Do you feel that? That's the whole PLANET leaning
in. …There's a table, little fires. A big one. Far away.
And it is LOOKING at you. Give it a season worth
judging." Then nothing about food, feasts, or deeds for
the rest of the window — the village holds its first
court, hears the planet lean in, and keeps living, while
the one deed-category it was given ("the food-thesis
deeds") has no action attached to it anywhere the player
can reach. And on this trajectory the gap is even
starker than hunttable's: this village never had a draw
choice to make, so the flicker's label points at a door
with no handle the player ever touched.
Judgment (evidence, not a design call): this reads as
UNFAIR SILENCE, not designed mystery. Designed mystery
withholds the HOW while showing the WHAT and the
stakes; here the WHAT is a label ("food-thesis deeds")
with no verb, and the stakes (a seat that never comes)
are never connected to any choice the player made or
could remake. A player who drove off every scavenger
would read the flicker and have no reason to connect it
to those drive-offs — the drive-off line told them the
devotion "stays armed," which reads as "nothing lost."
What Steve needs to rule, in one line: should the draw
choice itself say what it costs, or should the cost land
somewhere else (a later window, a different fight)? The
evidence says the current text supports neither reading
— it supports "nothing was lost."

## VILLAGER-BEHAVIOR SPOT CHECK (sense, not counts)

Nothing new is introduced by this arm (zero src/js, zero
policy behavior change — the recorder only reads), so no
new behavior is claimed. What the fresh rows' say-lines
show is coherent, people-shaped texture throughout:
named watchers taking up brands (Elijah and Kayden,
Easton and Thabo, Keerthi and Milagros, Ellie and Jamie,
Onni and Rosa), keepsake lines that read as lived
memory (knife rolls, dog tags, photo albums), and a
first court that arrives measuring rather than
announcing. No robotic, static, or repeated dialogue was
found beyond the engine's own repeated lines (the daily
keepsake line repeats by design, once per day per bearer
— it is a status line, not conversation). The drive-off
lines name the actors and the buff consequence honestly;
it is the TABLE PRICE that is never connected to the
choice — same conclusion as hunttable, now measured
across 8 villages instead of sampled from 1.

## WALL NUMBERS (choiceprice-hunt = comparison base on this base)

national-ever 7/8, national-final 5/8 (73903 and 73906
end regional after holding national/global; 73901 never
leaves village), table
invited 1/8, entered 1/8, wins 1/8 (lesser seat only,
73905), wave-4 5/8, wave-5 0/8, Arc IV 1/8, median
survival 180d (cap; death-aware — dead villages stop),
max 180d, deaths 240, starvation 5. Guardrails
(diagnostic only, never verdict-flipping): starvation 5
across 8 villages is not the story; the win gap IS the
table gap (the one win goes through the table; no win
bypasses it). Wave-5 remains 0/8 — the wall's next step
after the table, unchanged and still carried.

## BLANKS FILLED OR DOCUMENTED

- FILLED (measurement, the task's core): the
  choice-price gap is now a counted fact, not a hunch —
  34 draws, 31 completed forfeitures, 0/8 villages ever
  meeting a price-naming surface, 8 surfaces inventoried
  with verbatim quotes or explicit absence, first-event
  quotes per collapsed seed, and the deed state
  false → false on every completed forfeiture. No future
  arm has to re-derive whether the game names the price:
  it does not, anywhere a player can read.
- FILLED (boundary of the claim): the rescue case (73905
  day 96 → surge day 97) proves driving off the draw
  forfeits the WINDOW, not necessarily the run — a fix
  that only voices the price at the choice would still
  leave villages whose only windows are driven off
  seatless, while a fix that counts driven-off draws
  would change the deed's meaning. Both readings are
  preserved for Steve's call; neither is decided here.
- FILLED (instrument): the choiceprice recorder (say
  capture + grant/draw/drive-off/face/expiry wraps +
  daily seat-pricing snapshots) is trajectory-neutral on
  the pilot (det-gate MATCH) and reusable for any future
  price-gap decomposition.
- DOCUMENTED, NOT FIXED (the design call, Steve's):
  how/whether the draw choice should price the forfeited
  deed — voice the price at the choice, count a
  driven-off draw, make patrol/other in-window fights
  reliably spend the surge, or something else. DIAG only,
  zero src/js, no call made.
- DOCUMENTED, NOT FIXED (second-order findings, not
  chased here): (1) the pellet flicker variant fires on
  4/8 villages and points at the reactor as the blocker
  for villages whose actual forfeits were drive-offs —
  whether that framing misleads or correctly names a
  second, later blocker is a separate question; (2)
  73906's zero-grant trajectory on this base — a village
  can reach national/global with no armed feast at all,
  so the draw choice is not even presented; (3) the
  lazy buff clear — no expiry event fires unless
  something reads the buff, so a window can close with
  no announcement of any kind; (4) wave-5 0/8, unchanged;
  (5) the 73901 control-row drift (23→29 days) is base
  drift between hunttable's base and this base, not a
  finding about the gap.
- CARRIED (not chased here): which non-draw fight spent
  73905's day-97 surge (needs a TB-fight census, out of
  this arm's instrument); the wave-3 bar as a second
  blocker on hunttable's 73903/73904 (not re-measured
  here — this arm's corpus does not price wave bars).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg, step, or definition was re-scored
mid-run, with one explicitly disclosed judgment call that
the coordinator may overrule: leg (iii) is written as
"recorder-neutrality det-gates PASS … (reproduce the
hunttable anchor row on 73901 exactly)". Read literally,
the parenthetical fails (29/11 vs 23/8) — but hunttable's
own detgate-hunt instrument reproduces 29/11 on this
base, proving the gap is base drift between be8541647
and 2ae24d410, not recorder perturbation. The operative
gate — "det-gates PASS" — passed (MATCH, plain vs
wrapped, on this base, twice over including hunttable's
own instrument). This run therefore judges leg (iii) on
its neutrality substance (PASS) and reports the literal
row mismatch as a CONTROL DISAGREEMENT in its own
section, not as a smoothed pass and not as a verdict
flipper — the same treatment hunttable's pre-registration
gave control disagreements ("reported, not reconciled").
If the coordinator reads the parenthetical strictly, the
verdict becomes DIAG-NO-GO on leg (iii) alone, with legs
(i) and (ii) still met and all measurements standing.
One method note, not a revision: "completed forfeiture"
is defined strictly in the band-table note (deed false
→ false AND never rescued inside the window) — the
sweep's raw forfeit list counts all drive-offs, and the
proof test enforces the strict definition (31, not 34).
The proof test honestly reports 179 passed / 0 failed on
the stored corpus, with the GO computation passing on
legs (i) + (iii-neutrality) + the static surface legs.
The telemetry-check and balanced panel were NOT run, per
the standing exception (panel cannot ingest per-seed
recorder corpora; no panel inputs were fabricated). The
sweep-compare table + this evidence file are the
comparison of record. No game code changed; no
[needs-eyes] flag applies (DIAG only, no narration,
feel, combat, or UI change).

## Infrastructure notes

- Sweep: scripts/test-choiceprice-sweep.js (new file only:
  driveoff-clean + choiceprice recorder; modes --one
  choiceprice-hunt / --summary / --detgate; per-day
  chainTrace + rankTrace + choiceprice store per row).
  Recorder: scripts/policies/choiceprice-diag.js (new file
  only: say capture + grant/draw/drive-off/face/expiry
  wraps, pure reads otherwise). Corpus:
  evidence/2026-10-26/perseed-sim-choiceprice-a/ (8 rows +
  summary.json + detgate artifacts). Proof:
  scripts/test-choiceprice-a.js (179 passed / 0 failed —
  detgate, per-seed draws/faces/drive-offs, strict
  forfeiture definition with verbatim quote checks,
  collapsed coverage 4/5, 73905 rescue, 0/8 naming,
  static surface legs, band headlines, GO computation).
- Det-gate: PASS (73901: 29/29 days, 11/11 deaths).
- Base: worktree HEAD 2ae24d410 (coordinator merge
  including journey-scale r39). Hunttable's base was
  be8541647; the 73901 control row drifts 23/8 → 29/11
  on this base (see CONTROL CHECK). No base-drift caveat
  applies to the gap measurement itself, which is
  entirely this arm's corpus on this base.
- Commit: sim-choiceprice-a, DIAG-GO (choice-price gap
  measured: 34 draws, 31 completed forfeitures, 0/8
  price-naming encounters; zero src/js diff). Ready for
  coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this arm's).
- Limitations, stated plainly: (1) 73904's say capture
  hit the recorder's 600-line cap, so late say lines on
  that seed may be truncated — forfeiture joins are
  unaffected (joined at grant time) and its day-90/93
  flickers were captured before the cap; (2) 73907's
  forfeiture has no expiry row (lazy buff clear) and is
  established by deed-never-marks past the window; (3)
  the identity of 73905's day-97 spending fight is not in
  this corpus (no TB-fight census in this instrument).
