# sim-hunttable-a — decompose the hunt-band table collapse (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, arm sim-hunttable-a.
DIAG ONLY — zero src/js changes, zero default flips, no edits to
any existing policy, sweep, summary, or check file. New files only:
a new sweep, a new proof test, this evidence file, and the new
per-seed corpus. scripts/test-transient2-sweep.js,
scripts/test-freshtransient-sweep.js, and every existing policy
are read, never edited. The transient2 sweep is read read-only;
its corpus is NOT re-judged here.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md (manifest), docs/SCALE.md
  (national is a LIVE state, not a title; one rung per season;
  national ~day 65–90), docs/MONSTER-WAVES.md (wave law; wave 4 =
  standing >= 100, wave 5 = standing >= 200 AND wave-4 faced;
  readiness bars gate the standing number), docs/TABLE.md
  (the table PRICES the run, never gates on godhood; lesser seat
  = waves faced 4/4/3, 2+ contests survived, 2+ crises, scale >=
  regional, integration stage >= 2, food-thesis deeds
  sentimentTaught + feastSurgeUsed; full seat = deedGateReady
  5/5/4/3/2, 3+ contests, 3+ crises, stage >= 2, food-thesis
  deeds; Arc IV fires only when want >= 3 AND the seat is
  full or lesser — progression.js checkArc; tablePreview()
  returns null unless tableWaiting AND seat != 'none' AND
  day >= 90; tableTakeSeat() needs preview ready, i.e. no
  tableEntryBlock).
- Context read first and VERIFIED from the file, not trusted
  blindly: evidence/2026-10-26/sim-transient2-a.md, read
  fully. Its hunt band (driveoff-clean, same seeds, same
  substrate) collapses at the table while national reach
  holds: anchor invited 6/8, entered 6/8, wins 6/8, natEver
  7/8, median 109d; hunt invited 1/8, entered 1/8, wins 1/8,
  natEver 7/8, median 170d, 46 draws all driven off, Arc IV
  1/8 vs 6/8. The collapsed seeds for THIS arm are defined
  from that table, before any new sweep: anchor-invited AND
  hunt-not-invited = 73903, 73904, 73906, 73907, 73908
  (5 seeds; 73902 is invited in both arms, 73901 in
  neither). This arm decomposes the chain on those seeds;
  it does not re-judge the transient2 corpus.
- COMPOSITION (new file only):
  scripts/test-hunttable-sweep.js, two columns on the same
  band 73901–73908, 180d death-aware horizon, one seed per
  exec call, current base (worktree HEAD, recorded below):
  - anchor: plain tableseat-nowait (substrate
    LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
    scripts/policies/tableseat-nowait.js) + the new
    table-step recorder.
  - hunt: driveoff-clean shape EXACTLY as transient2
    (FEASTDRAWCLEAN=1, tableseat-nowait substrate,
    COMPETENT_SEEK_FIGHTS left ON, feastdraw +
    nonworldkill recorders installed exactly as the
    freshtransient sweep does) + the same table-step
    recorder.
  The table-step recorder is PURE READS, taken in the
  policy daily wrapper around (never instead of) base.daily:
  pre-daily and post-daily snapshots of scaleRank,
  progState (arc, tableWaiting, tableDone, tableAnnounced,
  sentimentTaught, crises count), scholar.prog.feastSurgeUsed,
  integrationStage, unlockedWave, villageStandingTotal,
  and the LIVE tableSeat() pricing (seat + detail copy:
  w1–w5 faced counts, contestsN, crisesN, rank, stage,
  foodDeeds) plus tablePreview() (null / seat / ready /
  why). It records, per seed, the FIRST day of each chain
  step: national day (tsNationalDay from the tableseat
  ctx + pre/post rank-trace national days), global day
  (first pre/post rank >= global), Arc II/III/IV days,
  first day each lesser-seat bar is met (w1>=4, w2>=4,
  w3>=3, contests>=2, crises>=2, stage>=2, sentimentTaught,
  feastSurgeUsed), first day seat != 'none' (+ seat kind),
  first day tableWaiting (invitation), first day
  tablePreview non-null (preview), first day preview
  ready, first day tableDone (seat taken / entered),
  withdrawal days (tableWaiting true then false without
  tableDone), plus final seat detail, final wave/standing,
  deaths/starvation, and (hunt) feast draws faced/driven
  + feastSurgeUsed. Anchor draws are reported from the
  competent ctx facedDraw count (the anchor column carries
  no feastdraw recorder by design — plain tableseat-nowait
  is its control); hunt draws come from the feastdraw
  store, as in transient2.
  Recorder-neutrality: each column's det-gate (plain vs
  wrapped on pilot seed 73901) must show days/gameDays/
  won/deaths/tsNationalDay IDENTICAL before that column's
  band is spent. The wrapper instruments prove delegation
  the same way transient2's snaps did: the daily wrapper
  calls base.daily exactly once, in the same position,
  and records only from reads; no game call is added,
  removed, or reordered. A det-gate failure STOPS that
  column — no band is spent on a moved instrument.
- CONTROL CHECK (binding, reported plainly, never
  reconciled silently): anchor must reproduce transient2's
  anchor headlines (invited 6/8, entered 6/8, wins 6/8,
  natEver 7/8, median 109d) and hunt its hunt headlines
  (invited 1/8, entered 1/8, wins 1/8, natEver 7/8, median
  170d, 46 draws all driven off). Any disagreement is
  reported as a control disagreement with the numbers,
  not smoothed over. Note: the base here is the current
  worktree HEAD, not transient2's fbcb4e0b8 — a control
  disagreement is therefore evidence about the base, not
  a reason to re-run transient2.
- DIAG-GO (binding): GO requires at least one table-chain
  step (preview / invitation / seat-ready / arc gate /
  deed bar) shown DIVERGENT hunt-vs-anchor on >= 3 of
  the 5 collapsed seeds (anchor-invited, hunt-not), with
  the code path cited (file + function). Otherwise
  DIAG-NO-GO, with the full per-step decomposition
  published and the "no single step" conclusion stated.
  Guardrails are diagnostic only (reported, never
  verdict-flipping): starvation, median, national-ever,
  wins. No metric re-scoring mid-run.
- SENSE plan: (1) read the transcript around one collapsed
  seed's national/global days and say what the village
  looked like; (2) a villager-behavior spot check from
  say-lines. SENSE-TESTING LAW: meaning, coherence,
  consequences — never just counts.
- PILOT GATE: the two det-gates ARE the pilot — neutrality
  must pass per column before that column's band is spent.
- Balanced-panel note: scripts/balance-panel.js cannot
  ingest per-seed recorder corpora (known limitation,
  carried) — do NOT fabricate panel inputs. The
  sweep-compare table is the comparison of record. Do NOT
  run telemetry-check on recorder rows and do NOT roll
  any baseline.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO — THE COLLAPSE IS ONE STEP: THE FEAST SURGE

The pre-registered GO holds with room to spare: a table-chain
step diverges hunt-vs-anchor on 5 of the 5 collapsed seeds
(threshold: >= 3), and on 3 of those 5 it is the SOLE divergent
step. The step is the feast-surge deed — `feastSurgeUsed` —
and the code path is cited below. The hunt band does not
collapse at the scale, the arc gate, the invitation, or the
seat pricing: national and global arrive on schedule, every
other lesser-seat bar is met, and the seat still prices
'none' because one deed in its conjunction never lands.
The downstream steps (seat / invitation / preview /
preview-ready / entered / Arc IV) diverge 5/5 only because
they all sit behind that one deed. This is a single-step
decomposition, not a diffuse drift.

## DETGATES — BOTH RECORDERS MOVE NO PLAY (pilot seed 73901)

- Anchor: plain tableseat-nowait vs tableseat-nowait +
  table-step recorder: days 23/23, gameDays 23/23, won 0/0,
  deaths 8/8, tsNationalDay null/null — MATCH.
- Hunt: plain driveoff-clean (+recorders) vs driveoff-clean
  + table-step recorder: days 23/23, gameDays 23/23,
  won 0/0, deaths 8/8, tsNationalDay null/null — MATCH.
Artifacts: perseed-sim-hunttable-a/detgate-anchor-73901.json
(+ detgate-anchor.json copy) and detgate-hunt-73901.json
(+ detgate-hunt.json copy). Both columns' bands were spent
only after their own det-gate passed, per the
pre-registration. The anchor/hunt trajectory differences
below are the POLICY difference (feast draws driven off),
not instrument perturbation.

## CONTROL CHECK — NO DISAGREEMENT (reported, not reconciled)

Anchor reproduces transient2's anchor headlines EXACTLY:
invited 6/8, entered 6/8, wins 6/8, natEver 7/8, median
109d, deaths 180, starvation 3, per-seed days/won/wave/arc/
final/tsNationalDay identical on all 8 seeds. Hunt
reproduces transient2's hunt headlines EXACTLY: invited
1/8, entered 1/8, wins 1/8, natEver 7/8, median 170d,
deaths 206, starvation 4, 46 draws all driven off,
per-seed days/won/final identical on all 8 seeds. (Two
immaterial reporting differences, not control
disagreements: transient2 did not publish gameDays, and
this sweep's hunt 73903/73905/73908 gameDays differ from
days by 1–2 — the headline days match.) The control is
clean on the current base (worktree HEAD be8541647); no
disagreement had to be reported, and none was smoothed.

## THE ANCHOR TABLE (hunttable-anchor: plain tableseat-nowait + recorder)

Columns: days, won, wave, arc, final rank, national day
(ts), global day (post), bar days w1/w2/w3/contests/crises/
stage/sentiment/surge, seat day:kind, invitation, preview,
preview-ready, entered day.

| seed | days | won | wave | arc | final | tsNat | glob | bars w1/w2/w3/ct/cr/st/se/su | seat | invit | prev | ready | entered |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73901 | 23 | 0 | 1 | 3 | village | null | null | 8/-/-/-/8/11/22/- | null | null | null | null | null |
| 73902 | 97 | 1 | 3 | 4 | national | 77 | null | 14/32/95/32/14/10/19/75 | 95:lesser | 96 | 96 | 96 | 97 |
| 73903 | 94 | 1 | 4 | 4 | global | 81 | 82 | 8/69/64/50/8/11/14/30 | 69:lesser | 70 | 90 | 92 | 94 |
| 73904 | 109 | 1 | 3 | 4 | national | 77 | null | 11/74/108/23/12/11/19/45 | 108:lesser | 109 | 109 | 109 | 109 |
| 73905 | 127 | 0 | 4 | 3 | global | 78 | 79 | 9/37/-/27/9/10/17/27 | null | null | null | null | null |
| 73906 | 95 | 1 | 4 | 4 | global | 84 | 92 | 8/21/49/28/8/12/19/94 | 94:lesser | 95 | 95 | 95 | 95 |
| 73907 | 137 | 1 | 4 | 4 | national | 77 | null | 11/45/80/34/11/10/13/136 | 136:lesser | 137 | 137 | 137 | 137 |
| 73908 | 136 | 1 | 4 | 4 | global | 105 | 106 | 8/43/75/24/13/15/21/135 | 135:lesser | 136 | 136 | 136 | 136 |

Anchor band: won 6/8, median 109d, natEver 7/8,
natFinal 7/8, table invited 6/8, entered 6/8, Arc IV 6/8,
wave-4 5/8, wave-5 0/8. Two anchor patterns matter for the
decomposition: (1) on every winning seed the surge bar is
the LAST bar to land or nearly so (73906: surge 94, seat
94; 73907: surge 136, seat 136; 73908: surge 135, seat
135; 73902: surge 75, seat 95 on the w3 bar) — the seat
waits on the surge, then fires the next day; (2) anchor
73905, the anchor's own stall, misses ONLY the wave-3 bar
(final w3 = 1 of 3 needed) while meeting the surge (day
27) — the wave-3 bar is a real, separate stall on that
seed, and it is NOT one of the collapsed seeds (anchor
never invites there either).

## THE HUNT TABLE (hunttable-hunt: driveoff-clean + recorder)

| seed | days | won | wave | arc | final | tsNat | glob | bars w1/w2/w3/ct/cr/st/se/su | seat | invit | prev | ready | entered | draws/driven |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73901 | 23 | 0 | 1 | 3 | village | null | null | 8/-/-/-/8/11/22/- | null | null | null | null | null | 0/0 |
| 73902 | 121 | 1 | 3 | 4 | global | 77 | 85 | 14/32/102/32/14/10/19/111 | 111:lesser | 112 | 112 | 112 | 121 | 4/4 |
| 73903 | 127 | 0 | 4 | 3 | global | 81 | 82 | 8/60/-/39/8/11/14/- | null | null | null | null | null | 6/6 |
| 73904 | 180 | 0 | 4 | 3 | global | 77 | 78 | 11/55/-/23/12/11/19/- | null | null | null | null | null | 12/12 |
| 73905 | 180 | 0 | 2 | 3 | global | 78 | 79 | 9/74/-/27/9/10/17/- | null | null | null | null | null | 19/19 |
| 73906 | 143 | 0 | 4 | 3 | regional | 84 | 92 | 8/21/49/28/8/12/19/- | null | null | null | null | null | 1/1 |
| 73907 | 170 | 0 | 4 | 3 | national | 77 | null | 11/45/80/34/11/10/13/- | null | null | null | null | null | 1/1 |
| 73908 | 180 | 0 | 4 | 3 | global | 105 | 106 | 8/43/75/24/13/15/21/- | null | null | null | null | null | 3/3 |

Hunt band: won 1/8, median 170d, natEver 7/8,
natFinal 6/8, table invited 1/8, entered 1/8, Arc IV 1/8,
wave-4 5/8, wave-5 0/8, deaths 206, starvation 4. The
hunt column's ONLY winner, 73902, is also its only
surge-marking seed (surge day 111, seat 111) — the
winner and the surge-marking set coincide exactly.

## PER-STEP DIVERGENCE (collapsed seeds only: anchor-invited, hunt-not)

A step is DIVERGENT on a seed when the anchor reached it
and the hunt did not (or vice versa). Days shown as
anchor/hunt; X = never reached.

| step | 73903 | 73904 | 73906 | 73907 | 73908 | divergent |
|---|---|---|---|---|---|---|
| Arc IV day | 70/X | 109/X | 95/X | 137/X | 136/X | 5/5 |
| w1 bar | 8/8 | 11/11 | 8/8 | 11/11 | 8/8 | 0/5 |
| w2 bar | 69/60 | 74/55 | 21/21 | 45/45 | 43/43 | 0/5 |
| w3 bar | 64/X | 108/X | 49/49 | 80/80 | 75/75 | 2/5 |
| contests bar | 50/39 | 23/23 | 28/28 | 34/34 | 24/24 | 0/5 |
| crises bar | 8/8 | 12/12 | 8/8 | 11/11 | 13/13 | 0/5 |
| stage bar | 11/11 | 11/11 | 12/12 | 10/10 | 15/15 | 0/5 |
| sentiment bar | 14/14 | 19/19 | 19/19 | 13/13 | 21/21 | 0/5 |
| SURGE bar | 30/X | 45/X | 94/X | 136/X | 135/X | 5/5 |
| seat first | 69/X | 108/X | 94/X | 136/X | 135/X | 5/5 |
| invitation | 70/X | 109/X | 95/X | 137/X | 136/X | 5/5 |
| preview | 90/X | 109/X | 95/X | 137/X | 136/X | 5/5 |
| preview-ready | 92/X | 109/X | 95/X | 137/X | 136/X | 5/5 |
| entered | 94/X | 109/X | 95/X | 137/X | 136/X | 5/5 |

(73903's contests bar reads anchor 50 / hunt 39 in the
summary table; the per-seed row above carries the same
pair — both met, not divergent. No hunt seed shows a
withdrawal: withdrawalDays is empty on all 16 rows. The
table never flickers and dies on this band — it simply
never comes, because the seat never prices.)

Reading the table: the surge bar is the ONLY deed bar
divergent on a majority of collapsed seeds, and on
73906/73907/73908 it is the ONLY divergent step of any
kind upstream of the seat — every other bar lands on the
same day in both columns on those seeds (w3 49/49,
80/80, 75/75; stage, sentiment, contests, crises all
identical). On 73903/73904 a second, independent blocker
joins it: the wave-3 bar also never lands (final w3 = 2
of 3 on both hunt seeds, vs 5 and 3 on the anchors) —
those two seeds would still be seatless on the wave-3
bar alone. The DIAG-GO verdict does not depend on them:
the surge step alone, divergent 5/5 with 3 sole-bar
seeds, satisfies the pre-registered threshold.

## THE MECHANISM — WHY THE SURGE NEVER MARKS UNDER DRIVEOFF-CLEAN

The chain, with code paths (file + function):

1. The lesser seat's food-thesis conjunction is
   `sentimentTaught AND feastSurgeUsed` — src/js/table.js
   `tableSeat()` (detail.foodDeeds). Sentiment lands on
   every collapsed seed in both columns (days 13–21);
   `feastSurgeUsed` is the half that never lands under
   driveoff-clean.
2. `feastSurgeUsed` marks ONLY on a real feasted combat
   use or landed bonus healing — src/js/feastBuff.js
   `_spendFeastedPower()` (guarded by `feastedActive()`
   and, for combat, `inCombat()`), entered via
   `noteFeastedCombatUse()`, which the turn-based damage
   funnel calls when a feasted blow lands — src/js/game.js
   `tbDamage()`. A feast that warms no blades marks
   nothing; the devotion stays armed for the next feast.
3. The draw fight is, in practice, that blow. Competent's
   feast road faces the pending draw WHILE FEASTED —
   scripts/policies/competent.js `feastFightRoad()` — so
   the draw fight's first feasted blow spends the devotion
   and marks the surge. The paired evidence: on ALL FIVE
   collapsed seeds, the anchor's surge day EQUALS the
   hunt's first granted-feast day (73903: 30/30, 73904:
   45/45, 73906: 94/94, 73907: 136/136, 73908: 135/135) —
   the anchor marks its surge on its first feast, by
   facing that feast's draw, while the hunt drives the
   same day's draw off and never marks.
4. Driveoff-clean intercepts exactly that fight —
   scripts/policies/feastdraw-driveoff-clean.js
   `installFaceIntercept()` replaces `faceFeastDraw`
   with a live `driveOffFeastDraw()` call — no combat
   starts, no blow lands, no surge marks. The driveoff
   narration even says it: "The devotion stays armed;
   the feast's fire still burns in you." Armed, unspent,
   and then expired: the buff window is the feast night
   plus the full next day (src/data/feast-surge.json,
   2 dawns), and the corpus shows the fire burning out
   unspent on every collapsed seed.
5. Nothing else in the window spends it. The hunt corpora
   prove the negative three ways per collapsed seed:
   feasts ARE granted (73903: 6, 73904: 12, 73905: 19,
   73906: 1, 73907: 1, 73908: 3 — all granted, all with a
   draw, all driven off); patrol sweeps DO run (21, 48,
   69, 3, 3, 12 sweeps) but produce ZERO turn-based
   fights starting inside any true feast window (grant
   dusk day D or the next day D+1) on any collapsed seed;
   and the one apparent exception, hunt 73908's day-173
   spool fight, falls on the D+2 dawn — after the buff
   expired — so it correctly marks nothing. Patrol is
   travel + forage (competent.js `feastFightRoad()`), and
   on this band it never meets a monster while the fire
   burns.
6. The control case inside the hunt column confirms the
   rule both ways: hunt 73902, the only hunt winner,
   HAS 3 turn-based fights inside true feast windows
   (days 97, 97, 111) and marks its surge on grant day
   111 — the day of its ad_break fight — then seats the
   same day (seat 111, invitation 112, entered 121).
   Surge-marking needs a feasted blow in the window;
   the draw fight is normally that blow; driving it off
   removes it unless another fight lands in-window, and
   on the collapsed seeds no other fight ever does.

So the collapse is not "driving off draws starves the
village" (starvation is 4 hunt vs 3 anchor; median
survival is LONGER under driveoff-clean, 170d vs 109d)
and not "driving off draws stalls the scale" (national
7/8 both arms, global reached on 4 of 5 collapsed hunt
seeds). It is a deed-accounting consequence: the table's
food-thesis deed is earned by fighting while feasted,
the feast's own scavenger is the designed feasted fight,
and refusing that fight — presented in-game as a free
choice ("Face it while the feast is in you — or let the
watch drive it off") — silently forfeits the deed with no
warning that the table is priced on it. The village
survives longer and never learns why the table never
comes, except on day 90 when the table itself flickers
and names "the food-thesis deeds" (see the sense read).

## SENSE-TESTING READ (hunt 73906: national day 84, global day 93)

The village is alive, proud, and utterly unaware of the
deed it just missed. Day 83 the System stages the
national beat (lead, 4 villages); day 84 the First Court
sits and the shared granary opens — 5,000 kcal for every
fire of the realm, "Emberhold, Stonebridge, Thornfield
count it — and remember who fed them first." Józef, at
the fire, not quite believing it: "Speakers rode in, ate
our grain, and called us a realm. A REALM. I keep saying
it to hear how it sounds." Day 90 the table speaks for
itself — "the ring of pale light flickers at the edge of
the sky... and does not come. Not yet. The table is being
set for those whose deeds are done, and yours are not
done. The ledger still wants: the food-thesis deeds."
Day 91 the world feed lands (viewership 32, planetary
broadcast tier); day 92 the village feasts for the
cameras, "every fire of the realm at the table... the
table has your name now." Global arrives during day 92
(post-daily snap; day 93's dawn confirms it).
Then day 94, the hinge of the whole collapse, in full:
Serwaa opens the pantry wide, the village eats until the
fire burns low, the FEASTED buff lands (×2.03 until
tomorrow's dawn), Nevermore circles the edge of the
light — and Tetsuya takes up a brand and Xavier follows,
and "Nevermore was never brave. It melts back into the
dark. (The watch drove off the feast's scavenger. The
devotion stays armed; the feast's fire still burns in
you.)" Day 96 the buff expires unspent. Day 98 the realm
dissolves aloud — "The climb starts over" — and Tomás
of The Red Table walks into the firelight alone, thinner
than remembered, asking for food. The village ends
regional, lost day 143 with 44 deaths, having held
global and never once been told, in words a player could
act on, that driving off the scavenger was the deed
walking away. On the anchor, day 94 is the surge day:
the same feast, faced, and the seat follows the next
day. Nothing about the hunt village looks robotic or
static — the failure is legible in the fiction only at
the moment it is too late to fix (day 90's flicker names
the deeds but not the act that would earn them).

## VILLAGER-BEHAVIOR SPOT CHECK (sense, not counts)

Nothing new is introduced by this arm (zero src/js, zero
policy behavior change — the recorder only reads), so no
new behavior is claimed. What the fresh rows' say-lines
show is coherent, people-shaped texture throughout:
named villagers opening pantries (Serwaa), taking up
brands (Tetsuya, Xavier), doubting aloud at the fire
(Józef), arriving hungry from other fires (Tomás), and
a realm dissolving with a spoken reason rather than a
silent number change. The driveoff lines name the actors
and the consequence ("the devotion stays armed") — the
narration is honest about the buff; it is the TABLE
PRICE that is never connected to the choice. No robotic,
static, or repeated dialogue was found in the sampled
lines (hunt 73906 days 82–100, hunt 73903/73904 grant
windows).

## WALL NUMBERS (anchor = comparison base; hunt alongside)

Anchor: national-ever 7/8, national-final 7/8, table
invited 6/8, entered 6/8, wins 6/8 (lesser seat only),
wave-4 5/8, wave-5 0/8, Arc IV 6/8, median survival 109d,
max 137d, deaths 180, starvation 3.
Hunt: national-ever 7/8, national-final 6/8, table
invited 1/8, entered 1/8, wins 1/8, wave-4 5/8, wave-5
0/8, Arc IV 1/8, median survival 170d, max 180d, deaths
206, starvation 4. Guardrails (diagnostic only, never
verdict-flipping): starvation 3 vs 4, median 109d vs
170d, national-ever 7/8 vs 7/8, wins 6/8 vs 1/8 — the
win gap IS the table gap (every anchor win and the one
hunt win goes through the table; no win bypasses it).
Median survival is death-aware (dead villages stop;
180 is the cap, not a fixed horizon).

## BLANKS FILLED OR DOCUMENTED

- FILLED (decomposition, the task's core): the hunt-band
  table collapse is now a single named step with a cited
  code path — the feast-surge deed (`feastSurgeUsed`),
  divergent 5/5 collapsed seeds, sole divergent step on
  3/5 — plus the full per-step table above, so no future
  arm has to re-derive which step fails. The transient2
  backlog item ("whether feast-draw refusal deprives
  table-qualifying deeds, or longer survival without Arc
  IV deeds is the cause") is ANSWERED: it is the deed,
  specifically the surge half of the food-thesis
  conjunction, and longer survival is the consequence
  (villages live on at Arc III), not the cause.
- FILLED (mechanism, proven not asserted): the
  draw-fight-is-the-surge-fight account, with the
  paired day evidence (anchor surge day = hunt first
  grant day on all 5 collapsed seeds), the zero
  in-window-fight negative on all 5, and the hunt-73902
  positive control (in-window fights → surge → seat).
- FILLED (instrument): the table-step recorder
  (pre/post-daily pure-read snapshots of rank, arc,
  table flags, seat pricing, preview, stage, standing,
  wave) is trajectory-neutral on both columns (both
  det-gates MATCH on 73901) and is reusable for any
  future table-chain decomposition.
- DOCUMENTED, NOT FIXED (named next blanks): (1) the
  choice-price gap — the in-game draw choice is
  presented as free while it silently forfeits a
  table-priced deed; whether the fix is voicing the
  price at the choice, letting a driven-off draw still
  count as a feasted deed, or making patrol/other
  in-window fights reliably spend the surge is a design
  call for the coordinator/Steve, NOT made here (DIAG
  only, zero src/js); (2) the wave-3 bar as a second,
  independent blocker on 73903/73904 (final w3 = 2 of 3)
  — even a surge fix leaves those two seeds seatless
  until a third distinct wave-3 monster is faced; (3)
  wave-5 remains 0/8 on both arms — the wall's next step
  after the table; (4) anchor 73905's own stall (wave-3
  bar only) is unchanged and still carried.
- CARRIED (not chased here): the table-entry step on
  seeds like anchor 73905; wave-5 reach; the hunt-73902
  entered-day lag (preview-ready 112, entered 121 —
  the seat leg's daily timing, not the collapse).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg, step, or definition was re-scored
mid-run. The run was judged exactly against its header:
DIAG-GO required at least one table-chain step
(preview / invitation / seat-ready / arc gate / deed
bar) shown divergent hunt-vs-anchor on >= 3 of the 5
collapsed seeds (anchor-invited, hunt-not), with the
code path cited. MET: the feast-surge deed bar diverges
on 5/5 collapsed seeds (anchor days 30, 45, 94, 136,
135; hunt never), with the code path cited (tableSeat
in src/js/table.js; _spendFeastedPower /
noteFeastedCombatUse in src/js/feastBuff.js; tbDamage
in src/js/game.js; feastFightRoad in
scripts/policies/competent.js; installFaceIntercept in
scripts/policies/feastdraw-driveoff-clean.js); the
downstream steps (seat, invitation, preview,
preview-ready, entered, Arc IV) diverge 5/5 as
consequences, and the wave-3 bar diverges 2/5 as a
secondary blocker. The verdict is therefore DIAG-GO, not
a softened partial. One method note, not a revision:
the anchor and hunt bands are different trajectories by
design (different base policies), so the per-step table
compares REACHABILITY of each step per seed, never
day-gaps as a score — a step both arms reach is not
divergent even when its day differs (e.g. w2 bar
69/60 on 73903). The proof test honestly reports 59
passed / 0 failed on the stored corpus, with the
GO-branch computation passing on the surge bar. The
control check passed exactly (anchor and hunt headlines
identical to transient2's); no control disagreement
arose, so nothing was reconciled. The telemetry-check
and balanced panel were NOT run, per the standing
exception (panel cannot ingest per-seed recorder
corpora; no panel inputs were fabricated). The
sweep-compare table + this evidence file are the
comparison of record. No game code changed; no
[needs-eyes] flag applies (DIAG only, no narration,
feel, combat, or UI change).

## Infrastructure notes

- Sweep: scripts/test-hunttable-sweep.js (new file only:
  anchor = tableseat-nowait + table-step recorder; hunt =
  driveoff-clean + recorders + table-step recorder; modes
  --one hunttable-anchor|hunttable-hunt / --summary /
  --detgate-anchor / --detgate-hunt; per-day tableTrace +
  rankTrace + first-day chain decomposition per row).
  Corpus: evidence/2026-10-26/perseed-sim-hunttable-a/
  (16 rows + summary.json + 4 detgate artifacts). Proof:
  scripts/test-hunttable-a.js (59 passed / 0 failed —
  detgates, control reproduction, divergence counts,
  sole-bar proof, mechanism legs, GO computation, corpus
  integrity).
- Det-gates: PASS on both columns (73901: 23/23 days,
  8/8 deaths, ts null/null).
- Base: worktree HEAD be8541647 (coordinator merge
  including sim-transient2-a). Transient2's base was
  fbcb4e0b8; the control headlines reproduce exactly on
  this base, so no base-drift caveat applies.
- Commit: sim-hunttable-a, DIAG-GO (single-step
  decomposition: feast-surge deed; zero src/js diff).
  Ready for coordinator merge; NOT pushed, NOT bumped,
  live NOT verified (coordinator/ship-loop line, not
  this arm's).

