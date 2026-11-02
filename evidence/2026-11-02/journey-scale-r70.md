# journey-scale r70 — Lane A, leg 3 SCALE (2026-11-01/02)

**Run id:** laneA-scale-2026-11-01T22:45CST (scheduled 22:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 done at run start and verified
by read-back.
**Base:** master@680d60dde at branch creation.
**Pre-register:** evidence/2026-11-02/journey-scale-r70-prereg.md
(written and committed before any scored seed ran).
**Change set at closeout:** ZERO src/js, zero src/data. Tooling (r70
driver/analyzer, labels/seeds/EVIDIR only — diff verified) + evidence +
run note only. Gating freeze honored; perception law honored (all
instruments read-only; the gossip picker only presses an offered menu
item, never engine state). No fix-gate pass this run (see Q2): the one
new anomaly found has an unresolved mechanism, and every other block is
a tuned bar, a fair loss, or a designed price told aloud.

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 25%,
  `git pull` already up to date, worktree-reap ran (10/16 active — all
  dirty/held lane-B and build trees, correctly untouched).
- **Master moved under the run once:** the pull saw 588c1dfb7, then the
  worktree list showed 680d60dde (a sibling Loop B evidence commit
  landed between the two commands). The worktree branched from
  680d60dde; nothing was rebased over, nothing lost.
- **Heartbeat:** manual heartbeat at registration verified landed in
  the registry; a setsid+nohup loop re-beats every 10 minutes (r69's
  lesson). Killed at closeout.
- **Safe-commit index clobber struck once**, same class as r66–r69:
  after the correct private-index prereg commit (4b74db934, 3 files),
  the worktree's main index lied (all 3 files staged-as-deleted +
  untracked). Repaired via HEAD-blob cacheinfo, verified: `git status`
  shows only the heartbeat log, `git diff HEAD` empty, hash-object
  matches HEAD for all 3 files. The commit itself was correct.

## Census (fresh quad 85041–85044, r69 instrument clone, GOSSIP_FIRST=1, DAYCAP 180)

| seed | end | day | pop | pantry | rank | seat | arc | distinct waves w1/w2/w3/w4/w5 | contests | crises | pilg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 85041 | ALIVE (day cap) | 181 | 9/9 | 9,219 | regional | none | 3 | 17/8/7/5/0 | 19 | 3 | 2 |
| 85042 | ALIVE (day cap) | 181 | 8/8 | 7,000 | national | lesser (waiting) | 4 | 18/9/3/0/0 | 27 | 4 | 8 |
| 85043 | ALIVE (day cap) | 180 | 8/8 | 18,050 | global | none | 3 | 19/9/7/1/0 | 20 | 3 | 9 |
| 85044 | ALIVE (day cap) | 181 | 9/9 | 27,373 | regional | none | 3 | 15/9/5/0/0 | 22 | 2 | 11 |

All four villages alive at the cap — no deaths, no scatter in this band
(r69's band had 1 dead, 1 scattered). National 1/4, global 1/4, lesser
1/4, full 0/4, wave 5 faced 0/4. The scale-leg shape is unchanged in
its essentials: the lesser seat waits on one seed, the full seat stays
unwon, wave 5 unfought in normal play.

## Village assessment, in plain words
- **85041 — the strong village that never became a nation.** Nine
  people, full shelves, fought five different wave-4 monsters — and
  still only a regional fire, because it never made a third bond. It
  holds two covenant friendships and one subordinate who barely trusts
  it (trust 35). Its court sat poor for 55 days. Nothing died; nothing
  climbed either.
- **85042 — the village that reached the table and is still waiting.**
  National standing, a lesser seat offered on day 166, arc IV — and the
  overtime clock already ticking twice (tiers 1 and 2, standing docked
  −4 then −8) while the seat sits untaken. Sitting is a commitment with
  no way back, so the sim does not auto-sit; the wait has a price, by
  design. What it still lacks for the full seat is wave breadth, not
  deeds or standing: zero wave-4 and zero wave-5 monsters faced.
- **85043 — the village at the top of the ladder with no seat at all.**
  Global standing, 19 different wave-1 monsters faced, one wave-4
  faced — and the table never comes, because the food-thesis deeds are
  unproven. Rank alone does not open the table; deeds do.
- **85044 — the rich village with one friend.** Pantry 27,373, eleven
  pilgrimages, and exactly one link all run: Stonebridge, subordinate
  since day 25, now 15,513 kcal in tribute arrears. Eleven journeys out
  and not one new bond. Wealth without relationships is still regional.

## Q1 — SCALE CONTINUITY (report-only)
Pilot gate passed on 85041 (no crash, 2 pilgrimages, both transcripts
present). Duty counts: weapon-craft lines 0/4, deadfall-duty lines 0/4
— the NINTH consecutive 0/4 for both. The armed-gate classification
reproduces exactly: every knower-day armed (knower-days 313/309/345/
418, armed real-or-both on all of them), eligible population
structurally empty on the competent scalecourt path. Barrier-pin lines
0/4 — the barrier instrument recorded nothing this band.
Gossip: the forcing picker pressed gossip in only 2 of 8 sittings
(picks 1/0/1/0) — ask:gossip was never offered in the other six menus.
Same class as r68/r69: the bottleneck is the offer, not the picker.

## Q2 — NATIONAL / FULL-SEAT BLOCK TRACE (the new work)
Each seed's single blocking factor, from its own wantwatch deed detail
(distinct monsters faced, contests, crises, rank, stage, food deeds)
plus its trust snapshots and table lines:

- **85041, national block: one bond short.** COVENANT road closest:
  2 of 3 covenants (trust 94/88, seasoned since days 38/47). LEAD road
  further: 1 of 3 subordinates, and that one sits at trust 35. No
  third bond formed in 180 days. **Lesser-seat block: food deeds
  alone.** Every other lesser bar met (waves 17/8/7, 19 contests,
  3 crises, stage 3, regional). The pellet honesty beat fired the day
  the pellet was installed (day 143): no feast can carry the surge
  while the pellet hums; the mantle may pass to hungrier hands.
- **85042, full-seat block: wave breadth alone.** Lesser offered day
  166 (waves 18/9/3 exactly at the 4/4/3 bar, 27 contests, 4 crises,
  stage 3, national, food deeds true). Full needs 3 distinct wave-4
  and 2 distinct wave-5: this village has faced 0 and 0. **The pellet
  is NOT an absolute lock — this seed proves it.** Pellet installed
  day 18, bearer's feasts refused days 21–65, yet food deeds complete
  by day 118: the day-118 feast granted FEASTED ×2.03 with no refusal,
  and the feasted Understudy fight banked the surge deed. The deed is
  banked by whoever's blow lands first (SEATBLOW-OPEN), and a feast
  that warms blades marks it — the village route around the bearer's
  ceiling. The pellet blocks NEW bearer feasts; it does not erase
  banked deeds (the r74 rule, now reproduced on a fresh seed).
- **85043, lesser-seat block: food deeds alone — at GLOBAL rank.**
  Waves 19/9/7/1, 20 contests, 3 crises, stage 3, global standing — and
  seat none, arc 3, because sentimentTaught + feastSurgeUsed never
  banked. The pellet beat fired at day 90 (pellet day 57). This is the
  band's sharpest single line: the top rung of the ladder, no seat,
  because the table does not come below the lesser bar no matter the
  rank (TABLE.md). Not a bug — the rule working as written.
- **85044, national block: one link, all run.** Only Stonebridge,
  subordinate since day 25, arrears 15,513 by day 180. Eleven
  pilgrimages, zero peer proposals recorded, zero new bonds. **Lesser-
  seat block: food deeds alone** (waves 15/9/5, 22 contests, 2 crises,
  stage 3, regional). Pellet installed day 57.

**Fix-gate verdict: NO-GO on every candidate, by design.** The pellet
trap is a designed price told aloud (beats fired for 85041/85043; the
mantle-pass out is real — seat-taker choice / succession). The wave
breadth bars and bond counts are tuned bars, not dead ends. The
national misses are fair losses (bonds never formed, not unfireable
beats). Nothing here meets clause (a) — a senseless defect — so no
code changes, and no proof test was written for a fix that does not
exist.

**Open observation (NOT a defect claim — mechanism unresolved): the
pellet honesty beat fired for 85041/85043 but not for 85042/85044,**
which got the generic day-90 flicker instead — even though all four
bearers held pellets and the generic flicker still named the true
missing deeds, so no player was left in silence. The beat's firing is
inconsistent across same-shape runs: 85042's reactor refusals prove it
online days 21–65, yet a day-118 feast granted FEASTED with no refusal
— online-ness is NOT simply "installed forever," and this run does not
establish what changes it. Follow-up for a focused run: trace
fusionReactorOnline() across a pellet run's days 60–120 and name the
transition. Do not cite the pellet beat as reliable until that lands.

## Q3 — PEOPLE CHECK (sense law — all 8 transcripts read in full)
8 of 8 fully real. No fabricated shared history, no static menus, no
filler loops.
- **85041 d90 Shanice (curious):** regret exchange lands ("I didn't say
  what I needed to say. To someone. Now I can't." / "I think everyone's
  carrying one of those"), then Columbus, Ohio mornings — "I'd pay
  anything for one annoyed morning now." Real.
- **85041 d120 Shanice (seek_comfort):** grief opener, outing aborted
  by fresh tracks ("We go back now. Quietly"), gossip chain with four
  distinct items (Gauntlet win, snares, Jovan walked away, garden
  talks). Real. The snares item ("Harish headed out to check the
  snares") is thin as news but not repeated.
- **85042 d90 Chris (seek_taken):** pod dreams, commit lands ("Even
  asking is more than the silence"), old trapline offered, ridge walk
  ("Nothing much there — but they talk the whole way"). Real. The
  place line reuses the template tail "I'll show you on the map
  sometime. It's real." — the SAME tail as r69's Felipe instance:
  template echo, second band running, still a tail echo, not repeated
  content.
- **85042 d120 Mihimihi (ask_favor):** thin pantry, forage invite with
  a real place and time ("south slope below the meadow, first light"),
  trap-line walk, outing aborted by tracks. Real. Two commits in one
  sitting (forage, then trap line) reads eager but coherent.
- **85043 d90 Sebastian (curious):** first-week exchange, band's best
  line — "you keep not-stopping until not-stopping feels like a plan."
  Real.
- **85043 d120 Sebastian (seek_comfort):** heavy day, comfort lands
  ("You're kind. Don't let this place change that"), gossip chain with
  a real confession ("Ran into the treeline when I heard the
  screaming"), the stray dog that lets Rafael touch it, Lucas talked
  about twice with different content (status, then rumor) — an echo of
  subject, not a repeat. Real.
- **85044 d90 Franz (curious):** laugh-memory exchange ("Stealing joy.
  I like that. We should steal more of it"), then a mood shift ("tone
  levels out — courteous, careful, further away"). Real.
- **85044 d120 Franz (ask_favor):** sickness favor, commit lands
  ("Thank you. Whatever you can do — thank you"), then the
  accept-then-abort beat (see Q4).

## Q4 — ACCEPT-THEN-ABORT SCAN (r69 observation)
**CLASS CONFIRMED — 2 instances across 2 bands, same shape.** r69's
Brian and r70's Franz both: invitation ACCEPTED, then the villager
sinks back down in the same sitting — "Maybe not today. The fire's
got me." — and the player keeps nothing for the accept. The full-
capture scan cannot extend this (conversation lines live only in the
sampled transcripts: 1 abort in this band's 8 sittings, 1 in r69's 8).
Per the prereg, this is now a fix PROPOSAL for the next run, not code
today: the abort should name a real cause from tracked state (tired?
hurt? afraid?) or bank something for the accept (a promise, an owed
outing) — a vague abort that eats a yes is the thing to fix.

## Reachable / Fun / Winnable (plain words)
- **Reachable:** yes. Every seed reached regional; national and global
  both appeared in one band; the lesser seat was offered; courts,
  covenants, pilgrimages, and table omens all fired. Nothing in this
  leg is behind a door a competent player cannot open.
- **Fun:** mostly. The conversations are genuinely good this band
  (Sebastian's not-stopping line, Shanice's annoyed mornings, Franz's
  stolen joy), and the climb produces distinct village stories. The
  dull spots are the ones already named: the accept-then-abort beat
  eats a yes, and the weapon-craft/deadfall duties never fire for a
  competent village (nine bands of zero).
- **Winnable:** not yet, and this band says exactly why. The full seat
  needs wave-4/5 breadth no seed here earned (best: one wave-4 faced),
  and the lesser seat needs food deeds three seeds never banked. The
  path exists — 85042 walked it to the lesser seat — but the full seat
  remains unwon across r66–r70, and wave 5 unfought in normal play.
  That is the wall, stated per seed above rather than as a slogan.

## Telemetry deviation check (body step 14)
NOT APPLICABLE to this instrument, baseline untouched. The scale.json
baseline carries sweep-row markers (firstCourt, tableTele, fightsTotal,
maxGameDay); journey-scale evidence is .txt instruments + trust/wsplit
JSONs that do not carry those fields. Running the check on the JSONs
produces LOUD "disappeared: baseline N -> current 0" lines that mean
"field absent," not "measured zero" — investigated, explained, and
deliberately NOT rolled forward, since a baseline update on absent
fields would corrupt it. No LOUD line here represents a real deviation.

## Metric review
- Q1 was report-only by prereg; no threshold was scored, so nothing
  could be gamed or missed. The continuity verdicts are the report.
- Q2 was report-only unless the fix gate was met; it was not met on
  any candidate (see fix-gate verdict). The block trace itself is the
  deliverable — r66–r69 reported census only, not per-seed block
  attribution against the deed detail.
- Q4's prereg rule (≥2 instances = class) fired exactly as written:
  class confirmed, fix proposal deferred to the next run, no code
  changed under a report-only question.
- Carried, still untested (NOT re-scored here): the pellet-beat
  firing inconsistency is now a named follow-up with a concrete
  trace task (fusionReactorOnline days 60–120); the accept-then-abort
  fix proposal; the wave-4/5 breadth wall for the full seat.
