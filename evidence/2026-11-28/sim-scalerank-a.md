# sim-scalerank-a — scale-rank inputs diagnostic (Loop A run fleshout-20261128T0315Z)

**Arm:** sim-scalerank-a · **Loop A run:**
fleshout-20261128T0315Z · **Axis:** scale-onramp (the scale wall)
**Type:** DIAG (instruments + evidence only — no game-code fix
lands; one instrument rule corrected after the selftest, see §6)
**Prereg:** `evidence/2026-11-28/sim-scalerank-a-prereg.md`
(frozen 2026-11-28 ~03:20 UTC, before any judged sim)
**Branch:** `sim-scalerank-a` (worktree
`~/workspace/worktrees/sim-scalerank-a`).
**Commits:** (prereg) c5e6b5092; (instruments + proof,
selftest 23/23, live proof 18/18) 983c5974; (evidence +
corpus) this run — see closeout.
**Band:** 113301–113308 (fresh — see prereg §4: the candidate
113201–113208 block was REJECTED because the census prereg
itself names that range; the next block verified fresh),
competent verbatim, NO substrate flags, 150d death-aware.
**Corpus:** `evidence/2026-11-28/perseed-scalerank-a-arm/`
(8 per-seed JSONs + summary.json).

## Verdict: DIAG-GO

| Bar (§2) | Result |
|---|---|
| Pool floor (≥6/8 alive day 80) | 8/8 — met |
| Snapshot coverage (complete scale-rank input block / all snapshots) | 1.000 (1169/1169) |
| Reconciliation (stored vs recomputed) | 0 mismatches |
| Instrument errors | 0 |
| Mechanism answer | written (§0, per-seed §1) |
| Staging sniff (regional ≥1 seed + links ≥1 seed) | pass (regional 8/8, links 8/8) |

Determinism: seed 113301 full-150d re-run after the pilot is
**byte-identical** to its pilot file (see §6 for the rerun's
own wrinkle).

## §0. The answer, in plain words

National never fails at the court, the rung, or the answer —
it fails at the very first step, and the first step is the
only step any village ever takes. Every village on this band
forms **exactly one link in 150 days** — one plain bond, with
Haven as the head, born at trust 30 some time in the first
seven weeks — and then never forms another. No second
subordinate, no covenant league, no trade charter, no oath
to a bigger fire. Ever. On any seed.

That one link is the whole story:

- The LEAD road needs three seasoned subordinates. The best
  any village does is one (five seeds season their single
  link; three never even manage that).
- The COVENANT and TRADE roads need three seasoned peer
  links each. The count is zero on all eight seeds — the
  village never proposes a league of any kind.
- The BELONG road needs Haven to swear to a fire whose realm
  already holds four villages. Haven never swears to anyone.
- The standing bar tells the same story twice: diplomacy
  standing is **zero on all eight seeds** — no link ever
  counts as regional power — while war standing runs
  200–525 from fighting alone.
- The rung gate is not the wall: every surviving village is
  regional by day 38–72, so the 30-day season is long past
  before the horizon ends. The scale was never refused and
  nobody was exiled. No polity ever qualifies, so no court
  beat ever stages, so the question of whether the bot would
  answer it never even arises — the competent-never-answers
  confound from the prereg is moot on this band. National
  0/8 here is a game wall on this road, not a bot artifact.

What the next link would require: two more seasoned
subordinates (LEAD), or three seasoned peer links
(COVENANT/TRADE), or a good-standing oath to a four-fire
realm (BELONG). The deeds that make links — `proposeLink`,
`proposeCovenant`, `proposeTrade` — are player verbs the
competent policy never calls; the one link each village gets
arrives through a villager raising the idea and the bot
accepting it (`acceptLinkRaise` → `proposeLink`,
bond-initiation.js). After that first idea, no second one is
ever raised or accepted in 150 days. The next question is
why the village stops at one — that is next arm #1, not
this one.

## §1. Per-seed table

linkDay = the single link's formation day. lead/cov/tr =
seasoned counts at end (need 3/3/3). trust = the single
link's trust at end (birth trust 30). diplo = diplomacy
standing at end (always 0). rung = rung-gate days remaining
at end (0 = open). Pop = roster start → end (start 12).

| seed | days | end | regional | lesser | linkDay | lead/cov/tr | trust | diplo | rung | pop | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 113301 | 150 | survived | d38 | d38 | d16 | 0/0/0 | 9 | 0 | 0 | 12→9 | 17 |
| 113302 | 150 | survived | d55 | d55 | d33 | 1/0/0 | 73 | 0 | 0 | 12→10 | 2 |
| 113303 | 150 | survived | d48 | d48 | d26 | 0/0/0 | 31 | 0 | 0 | 12→5 | 18 |
| 113304 | 150 | survived | d42 | d42 | d20 | 1/0/0 | 46 | 0 | 0 | 12→5 | 18 |
| 113305 | 150 | survived | d72 | d72 | d50 | 0/0/0 | 28 | 0 | 0 | 12→6 | 10 |
| 113306 | 111 | village-lost | d52 | d52 | d30 | 1/0/0 | 53 | 0 | 0 | 12→6 | 11 |
| 113307 | 150 | survived | d42 | d42 | d20 | 0/0/0 | 16* | 0 | 0 | 12→2 | 15 |
| 113308 | 150 | survived | d41 | d45 | d19 | 1/0/0 | 85 | 0 | 0 | 12→8 | 12 |

\* 113307's link BROKE (status `broken` by day 151); the
trust shown is its last reading before the break.

Mechanism stage (0 no polity / 1 polity / 2 beat staged /
3 answered / 4 held): **0 on all 8 seeds.** First polity
day, first beat day, first national day: null on all 8.
National held days: 0 on all 8. Stage counts: {0: 8}.

The single link's trust journey (birth 30 on every seed):
113301 30→9 (decayed all run, never seasoned); 113302
30→73 (seasoned 89 days); 113303 30→31 (never seasoned,
max 41); 113304 30→46 (seasoned 27 days); 113305 30→41
then fell to 28 (seasoned 22 days, then UN-seasoned — the
bar is live, not a ratchet); 113306 30→54 (seasoned 46
days, village died d111); 113307 30→16, link broke;
113308 30→85 (seasoned 103 days — the strongest bond on
the band, and still 2 short of a realm).

Standing at end (war / diplomacy / plenty): 113301
525/0/0; 113302 375/0/0; 113303 375/0/20; 113304 525/0/40;
113305 300/0/0; 113306 200/0/60; 113307 300/0/0; 113308
275/0/60. War is the whole standing on every seed;
diplomacy never scores a point; plenty is a feast or two.

Wall: wins 0/8, national 0/8, regional 8/8, table waiting
8/8, seated 0/8, median survival 150d. Wave-4 bar (≥3
distinct fought) 8/8; wave-5 bar (≥2) 3/8.

## §2. Village assessment — the diagnostic in plain words

Seven villages survive to day 150 with 2–10 people left;
one is lost (day 111). 103 deaths across the band, every
one named (classification completeness 1.000, §5), and
every seed's roster books close (initial + joins == final
+ rostered deaths + leavers, 8/8). Nobody leaves: leavers
0 on all 8 seeds — people die or stay; they never walk
away.

- **113301 — the decay.** Survived, 9 left. Its link is
  the weakest bond on the band: trust 30 at birth, 9 by
  day 150, never seasoned a single day. 17 deaths (the
  second-highest), 13 joiners — the village churns while
  its one bond quietly rots. War standing 525, the highest
  tied: it fights everything and binds nothing.
- **113302 — the quiet one.** Survived, 10 left. Two
  deaths in 150 days — the gentlest run on the band — and
  the second-best bond (trust 73, seasoned 89 days). Even
  so: one link, no realm. Survival and scale are unrelated
  here; the safest village climbs no higher than the
  bloodiest.
- **113303 — the bleed.** Survived, 5 left. 18 deaths, 11
  joiners. Its link never seasons (trust 31 at end, max
  41). The village replaces its dead faster than it
  deepens its one bond.
- **113304 — the fighter.** Survived, 5 left. 18 deaths,
  war standing 525, wave-4 bar cleared, w5 = 2. Its link
  seasons (trust 46) — and one seasoned subordinate is
  still two short of a realm.
- **113305 — the un-seasoning.** Survived, 6 left. The
  live-bar proof: its link seasons at trust 41 around day
  120, then trust falls to 28 and the link un-seasons.
  Seasoned is a state to hold, not a prize to keep.
  Latest regional day on the band (d72).
- **113306 — the lost.** Village-lost day 111 with 6 left.
  The only death on the band; its link was seasoned
  (trust 53) when the village fell. A realm would not
  have saved it — it had one seasoned bond and no second
  anything.
- **113307 — the break.** Survived, 2 left. 15 deaths, and
  the only broken link: trust fell to 16 and the bond
  snapped. The village ends with two people and no links
  at all — back to a free fire after 150 days.
- **113308 — the strongest bond.** Survived, 8 left. The
  best link on the band (trust 85, seasoned 103 days) and
  the clearest proof of the mechanism: the finest single
  bond a competent village builds is still one-third of a
  realm. 12 deaths, 8 joiners.

What they knew: every village reached regional, stage 3,
the food lesson, and the lesser seat. What was missing:
a second link of any kind — the village never has two
fires bound to it at once, so no shape of polity can
even be attempted.

## §3. People check — full transcripts read

Three seeds read in full (fireside lines + system scale
lines + table lines): 113301 (survivor), 113306 (died day
111), 113308 (strongest bond). The talk is coherent and
the waiting has a voice — and the climb has none:

- The waiting talk lands, and it is the same thin pool
  the census found (§7 arm 3, still open): on 113308,
  "Did you see their faces? Too many angles..." fires 5
  times, "Nobody's sleeping. The sky is waiting..." 4
  times, "Why them?..." 3 times, across 100 days of
  waiting. A real player hears the same four lines on
  loop for a season. The early talk is the same shape
  (palisade/wood/stone counts, the number changing, the
  sentence not).
- **Nobody at the fire ever talks about the climb.** Not
  once in three full transcripts does a villager say
  anything about binding another fire, a realm, a league,
  or the nation the System demands. The System DOES say
  it aloud — the nation prod fires day 55 on 113306 and
  113308 ("FINALES need a NATION... Bind fires under one
  head, or bend the knee to someone who has") and a trader
  tells of a foreign realm ("FOUR fires under one head...
  a REALM") on day 42–47. The information reaches the
  village; the villagers never pick it up in conversation,
  and the bot never acts on it. The climb has a System
  voice and a trader voice, but no villager voice.
- The single link's formation IS voiced, once: on 113308
  day 19, "Renato speaks at Emberhold's table now —
  earned, not appointed. And the other fire is watching
  what Haven does FIRST." The bond arrives as a person
  doing a thing, not a ledger entry. Then nothing — no
  villager ever mentions a second fire again.
- Other fires climb while Haven watches: "Stonebridge and
  Thornfield have bound together" (113301 d38), "The Red
  Table and The Hungry Road have bound together" (113306
  d52). The region moves; Haven doesn't.
- The Herald's feeding lines are honest and escalating
  (0 kcal, then 320, then 960, 1,960, 2,240 kcal nights)
  — the wait has a price the village can feel, and the
  villagers say so ("It eats while we deliberate").

## §4. Reachable / fun / winnable — the scale leg

- **Reachable: YES for the lesser seat, NO for the full —
  and now the why is measured.** The TABLE.md target
  holds (lesser 8/8, days 38–72). The full seat is
  unreachable on this band because no polity ever
  qualifies (stage 0 on 8/8): the scale bar binds before
  the court, the rung, or the answer can even be tested.
- **Fun: the wait works, the climb is voiceless.** The
  waiting table has a real voice and a real price (the
  Herald eats). But a 100-day wait on ~4 repeated lines,
  with no villager ever speaking about the realm the
  System demands, will wear thin — and the bot's wait is
  passive, as in the census: it never sits, never pushes
  for full, just waits out the horizon.
- **Winnable: unmeasured, not disproven.** No seed sat at
  the table (0/8 seated) because the competent policy has
  no sit verb. The road TO the seat is now measured to the
  link: one link, no polity, no nation. The win itself
  needs a sitting policy or a player; this arm does not
  claim the win is impossible.

## §5. Death-cause recorder (secondary instrument)

The census's open gap (§5.2/§7 arm 4) is closed on this
band: 103 deaths, 103 named — classification completeness
**1.000**, unattributed 0, books close 8/8, guest deaths 1
(a fight death pushed to Haven's fallen for a villager who
never joined Haven — reported separately, never counted
as a roster death). Pooled death-cause shares (named
causes only, verbatim strings, never bucketed):

| cause | n |
|---|---|
| the wild | 45 |
| monster | 25 |
| ambush | 6 |
| the arena | 5 |
| a stranger | 5 |
| contest | 2 |
| dehydration | 2 |
| starvation | 2 |
| a wound that wouldn't close | 2 |
| Buffering | 2 |
| Ugly-Eyes | 1 |
| The Influencer | 1 |
| Gavel | 1 |
| The Big Beast | 1 |
| Choir Toad | 1 |
| Inspiration | 1 |
| sickness | 1 |

Field fights dominate the dying (the wild 45 + monster 25
+ named monsters 5 = 75 of 103). Hunger/thirst kill
rarely (starvation 2, dehydration 2). 'a stranger' (5) is
the alien-player kill label, recorded verbatim — the
overloaded word, not this arm's to rename. The census's
unanswerable deaths (113105/113107 in its band) now have
an answer on this band: villages die in the wild, in
fights they walk into, not in raids that report "Nobody's
dead" — every raid-adjacent death here carries its fight
cause.

## §6. Metric review

- Frozen bars held; no re-scoring. The pool floor was
  exceeded (8/8 alive day 80, not the 6/8 floor) — the
  band is healthy, which makes the stage-0 result
  stronger: these are not dying villages failing to climb,
  they are surviving villages that never start.
- The prereg's "beat staged but unanswered" branch never
  engaged: stage 2 never occurs on this band, so the
  competent-never-answers confound is moot here rather
  than measured. The staging ladder did its job — it kept
  a bot artifact from being mistaken for a game wall, by
  showing the wall sits one stage earlier. A follow-up
  arm that teaches the bot the link verbs (next arm #2)
  will be the first run where the answer stage can even
  be observed.
- The `closestLink` rule was corrected after the
  selftest's first run (23/23 after the fix): the first
  version picked the max-progress link, which is the
  already-seasoned one — the gap is the nearest
  UNSEASONED link. The correction is in the analyzer only
  (a measurement definition, fixed before the pilot, not a
  re-score — no judged sim had run).
- **Determinism rerun wrinkle (mine, recorded honestly):**
  the post-pilot determinism re-run's first invocation ran
  WITHOUT the temp OUTDIR set, so it rewrote the pilot's
  `s113301.json` in place before the second invocation
  wrote to /tmp. The `cmp` then proved the re-run bytes
  are identical to the pilot file — the corpus is intact
  and the determinism bar is met — but the rerun should
  have gone to /tmp first. The proof test's own
  determinism leg (100d, two temp dirs) had already
  passed before the pilot; the 150d check confirms it.
- Coverage 1.000 with zero accessor failures: the scale
  block (`_havenPolity`, `_linkSeasoned` agreement,
  standing breakdown, link list) read cleanly on all
  1169 snapshots. One note: the driver's own
  `seasonedOf` recomputation agreed with the game's
  `_linkSeasoned` on every link (0 `seasoned-disagree`
  errors) — the bar as documented (30 days + trust 40)
  is the bar as coded.
- The `belong` candidate is null on all 8 seeds at every
  snapshot, not just at end: Haven is never anyone's
  subordinate, so the BELONG shape is never even
  attempted. The foreign sim does build realms (trader
  lines report them), but Haven is never invited in —
  or never asks.
- Convergence: scale-onramp is **not converged** — the
  blocking input is now named (link count: exactly one
  link per village), but nothing has moved it. The axis
  stays open.

## §7. Next arms (named from this proof)

1. **Second-link diagnostic** — why does the village stop
   at one link? Record link-raise ideas (who raises, when,
   accept/decline, which village), peer-proposal arrivals,
   and `proposeLink`/`proposeCovenant`/`proposeTrade` call
   counts daily on a fresh band. The mechanism behind the
   one-link ceiling is the next question; this arm only
   shows the ceiling.
2. **Linkdrive policy variant (lever arm, needs its own
   prereg)** — teach the competent policy the link verbs
   (propose the best-known unlinked village once the first
   link seasons; answer peer counters) and measure whether
   national becomes reachable. This is the first lever
   that can move the binding input this arm named.
3. **Capstone-readiness recorder** — census §7 arm 2,
   still open: record `ladderCapstoneReady()` daily and,
   if readiness is real, teach the competent policy the
   delivery verb.
4. **Waiting-talk variety** — census §7 arm 3, still open,
   confirmed again here (§3): ~4 lines over a 100-day
   wait, plus no villager voice for the climb at all. New
   waiting lines + at least one link/realm line in the
   fireside pool are a content arm; flag `[needs-eyes]`
   if landed, since Steve should hear the voice.
5. **Link-trust drift diagnostic** — the single link's
   trust falls on 3/8 seeds (113301 30→9, 113305 un-seasons,
   113307 breaks). What tends a link, and what lets it rot?
   A tending-behavior census on the link tick.

## §8. Infrastructure

- **Heartbeat:** the registry lock was held >120s at two
  heartbeat attempts (03:20Z and ~04:40Z) — heartbeat
  skipped, retried later; one heartbeat landed between
  them. No work lost; the tree stayed registered throughout.
- **Safe-commit index clobber** struck on BOTH commits
  (prereg + instruments): the committed files showed
  staged-deleted in the worktree index. Repaired via the
  ls-tree pipe both times; both commits verified correct
  (`git status` empty, `git diff HEAD` empty after repair).
- **Write flap:** none. No EPERM. No VM restart this run.
- **Determinism:** seed 113301 full-150d rerun is
  byte-identical to its pilot file. Proof test 18/18 +
  analyzer selftest 23/23 re-green before the pilot.
- **Sibling arm:** sim-capstoneready-a runs band
  113201–113208 in its own worktree — different band, no
  shared files, no shared corpus; this arm's trees, files,
  and corpus were not touched, and B's were not touched.
- **Telemetry deviation check:** NOT run by this worker —
  coordinator step (loop body §10). The corpus glob for
  it is `evidence/2026-11-28/perseed-scalerank-a-arm/*.json`
  with metrics national,table,wins,exiled against
  `hidden_files/telemetry-baselines/scale-wall.json`.
  Expected: national/wins LOUD at 0 (same regime artifact
  the census reported in §9 — competent verbatim, no seat
  stack — baseline NOT to be rolled without the
  coordinator's verdict).

## §9. Findings backlog (for the coordinator's sim-findings.md)

- The climb has no villager voice: the System's nation
  prod and the trader's realm line arrive, but no fireside
  line ever mentions binding another fire — filed as next
  arm #4 above (content arm, census §7 arm 3 family).
- The single link's trust can decay to 9 and the link can
  break with nothing said at the fire — the trust-drift
  warning leg watches the bar, but no villager ever
  mentions the cooling bond in the transcripts read.
  Filed as next arm #5.
