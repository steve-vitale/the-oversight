# journey-scale r93 — Lane A, leg 3 SCALE (2026-11-03 evening)

**Run id:** laneA-scale-2026-11-03T19:45CST (scheduled 19:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@d86c1854a at branch creation (worktree journey-scale).
r92's peer-tending commit 420f0c7ee is IN this base (verified: the
tendLink peer branch in hierarchy.js + "League with" panel wording in
app.js are present; the r92 proof test re-runs 12/12 green on this base).
**Pre-register:** evidence/2026-11-03/journey-scale-r93-prereg.md
(written before any scored seed ran).
**Change set at closeout:** NO src/js changes. Tooling only: r93 driver
+ analyzer clones (labels/seeds/EVIDIR + analyzer seed list) and this
run's evidence. The run's deliverable is a measured verdict + named
follow-ups, not a game change — see Blanks.
**Gating freeze (2026-10-27 16:53) honored** — no threshold, bar, price,
or gate touched. **Perception law (2026-10-28) honored** — all
instruments read-only; pickers press offered menu items only; the
tend-arm presses the offered Haven-panel tendLink verb only.

## Infrastructure notes (loud, first)
- No lock contention at start: no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- Pre-flight clean: main-tree `git status` empty, disk 28%,
  `git pull` already up to date, worktree-reap ran (11/16 active —
  dirty/held sibling trees correctly untouched; one locked sibling
  tree's removal failed aloud in reap, not mine to force).
- Registration queued ~2 min (registry lock serialized across agents'
  checkouts), then landed; first heartbeat verified by read-back
  (02:03:06Z). A 10-minute heartbeat loop runs for the whole run; its
  first beat is verified at closeout before release.
- No EPERM flap hit this run: all evidence writes landed, all git
  operations completed (contrast r92's container-wide outage).

## Q1 — COMPETENT-PLAYER SCALE: fresh quad, tend-arm ON

Policy scalecourt-nogate, WANT_SUBJECT=1, GOSSIP_FIRST=0 (unforced),
TEND_PEER=1 (press tendLink on below-40 peer links after courtship,
driver guard: pantry > 12,000 kcal), DAYCAP 180, death-aware stop.
Pilot 85201 ran first, no crash → quad expanded per prereg (pilot gate
is crash-only this run).

| seed | end | day | pop | pantry | rank | seat | arc | maxWave | tends landed | peers at end (trust/age) |
|---|---|---|---|---|---|---|---|---|---|---|
| 85201 | SCATTERED (hunger, 3rd day) | 56 | 8/8 | 0 | regional | none | 3 | 3 | 2 | covenant 67/27d, 59/26d, 51/10d |
| 85202 | SCATTERED (hunger, 5th day) | 65 | 9/9 | 0 | regional | lesser | 4 | 4 | 0 | covenant 30/9d, 29/8d, 29/7d |
| 85203 | SCATTERED (hunger, 3rd day) | 97 | 4/4 | 0 | regional | lesser | 4 | 4 | 0 | covenant 14/32d, 28/28d, 28/27d; trade 22/26d, 27/25d |
| 85204 | DIED OUT (last bearer) | 84 | 0/0 | 8322 | regional | lesser | 4 | 3 | 0 | no peers at all (1 lead link, trust 26/59d) |

National 0/4, global 0/4, full seat 0/4, seasoned peers 0/4 seeds.
Lesser seat waiting on 3/4 seeds — the r91/r92 shape holds.

**The verb fired, and still changed nothing on this quad — but not
for the reason the prereg feared.** The prereg's NO-GO clause assumed
tends would land and still fail to season peers. What actually
happened, seed by seed:
- **85201 — the near miss.** Two tends DID land, said aloud both
  times ("Haven sends 1,600 kcal of grain to Stonebridge's fire — not
  tribute, the other way around… (Trust +8.)" and 1,709 kcal to The
  Red Table). Peers reached trust 67/59/51 — well past the seasoned
  40 — but aged only 27/26/10 days when hunger scattered the village
  on day 56. The first covenant would have seasoned on day 59/60.
  The road was THREE DAYS from seasoning when the village starved.
  Trust was never this seed's blocker; the season clock + hunger were.
- **85202 — born into starvation.** All three covenants formed on
  days 56–58, exactly as the pantry collapsed (8,100 → 4,998 → 1,900
  → 0). The tend-arm's pantry guard (>12,000 kcal) never opened, and
  honestly it should not have: sending 1,500 kcal/link/week out of a
  pantry already at zero would have hastened the scatter on day 65.
  Tends 0 is correct competent play here, not a verb failure.
- **85203 — the slow leak (the run's sharpest finding).** Lived into
  the scale window (day 97) with FIVE peers, yet every one sat below
  40 at the end — and the oldest covenant (Stonebridge, formed day 65
  at trust 30) ENDED at 14. Its daily trust series falls almost every
  day (30 → 28 → 24 → 22 → 21 → 17 → 15 → 14) even on days whose
  trustevents line claims "Conceded better terms; the league holds
  (trust +8)". The +8s are nominal: something drains faster than the
  concessions credit. One confirmed drain is the league pool: when
  Haven's share comes up short, trust −4 lands across the whole
  league that week (hierarchy.js covenantTick), and Haven's pantry
  sat at 0–10,000 kcal for the entire life of these links, so Haven
  was short nearly every week. Same-day arithmetic (e.g. day 67:
  +8 claimed, trust 30 → 28) still leaves ~10 points unexplained —
  that decomposition is a named follow-up instrument, not a guess
  this run makes. A league that bleeds trust while its player keeps
  conceding is a live design question, not a tuning number to tweak
  blind.
- **85204 — no courtship at all.** Pantry stayed healthy (10k–28k
  through day 65) but zero peers ever formed; only the day-25
  subordinate. Died out day 84 with people, not links, as the
  constraint. The tend verb is irrelevant where courtship never
  produces a peer.

**Verdict on the prereg threshold, stated plainly:** neither the
"verb changes the outcome" clause (national ≥1/4 or ≥3 seasoned peers
on a seed) nor its NO-GO clause (0 seasoned peers DESPITE tends
landing) literally triggers — tends landed on only one seed, and on
that seed they did their job (trusts 67/59/51) while the village
starved 3 days short of seasoning. The honest reading is: **the
peer-tend verb is proven working (r92) and fired correctly here, but
it is not the scale road's binding constraint on this band.** The
binding constraints, in order, are (1) hunger scatter before peers
season (3/4 seeds scattered hungry; the 4th died out), (2) courtship
so late that peers have no season left to serve (formed days 56–65),
and (3) covenant trust bleed that outruns concessions. The next
scale question is one of those three — not another tend re-test.

**Method note (carried to metric review):** the driver's pantry guard
(>12,000 kcal) means "competent player" here never sends grain while
hungry. A real player COULD send grain while thin and go hungrier —
but on this quad that trade would have bought trust with the
village's last food days before a scatter, so the guard's verdict
(conservative, survival-first) is the defensible competent play.

## Q2 — PEOPLE CHECK (unforced, scale band)

- **Day-90 conversation, seed 85203, Daljit (Rancher, gentle,
  trust 30, want seek_comfort):** a real grief arc. Daljit stumbles
  ("Have you — sorry. I keep thinking about them."), dreams Nathan
  is still here and wakes "angry at the dream", and lands on
  "I'm picking up Nathan's share of the work. Someone should, and it
  might as well be me." Want stage 0 → 2, thread resolved toward
  carrying on. Two picker artifacts, not NPC failures: the driver
  opened with betrayal:accept (a strange first move toward a grieving
  person — the conversation survives it, but the choice itself reads
  as driver opportunism, not human sense) and closed with a teach
  pick mid-mourning ("Here — let me show you"), which Daljit absorbs
  gracefully ("Go on, then. I'll be thinking good thoughts at you.")
  but which a human would not offer at that moment. The NPC writing
  holds; the bot's choice policy is the rough edge.
- **The league speaks, but its numbers don't (85203):** "Conceded
  better terms; the league holds (trust +8)" repeated five times
  while the link's trust fell 30 → 14 is the one place this run
  where the game's words and its numbers disagree in plain sight.
  A player watching Stonebridge would hear reassurance and see
  drift. Named follow-up: a covenant trust-delta decomposition
  instrument (per-day: tick, pool, titan, crisis, concession) before
  any wording or number change.
- **Drift warnings with a sting (85203):** "Emberhold's fire is
  drifting from ours… Bonds don't mend themselves; a tended fire
  remembers who fed it." — the game itself names tending as the
  remedy while the village is too hungry to tend. That irony is
  honest design, not a bug: the warning is true and the pantry is
  the reason it can't be answered.
- **Foreign polities live (all seeds):** "Word comes late, through
  traders: Stonebridge has bound itself to Thornfield. The region's
  map is being redrawn — not by Haven." The region-climbs-without-you
  beat fires and reads as intended.
- **Scatter narration holds:** "Haven couldn't hold. On the third
  hungry day, people started walking — in different directions. The
  scattering, again." Three seeds, same line, and it still lands
  because the hunger days before it were counted aloud.

## Village assessment (plain words)

Four villages, one story told four ways: Haven learns to make friends
late, feeds them thinly or not at all, and then runs out of food
before friendship can harden into a league. On the best seed the
league was three days from real — two grain sends had already lifted
its friends past the trust mark — and the pantry emptied first. On
the longest-lived seed the village kept five friends for a month
while their trust quietly bled away, because a starving league can't
pay its own pool share and every short week costs trust across the
board. On the worst seed nobody new ever came to the fire at all.
Nobody reached national, nobody sat the full seat, and the lesser
seat waited on three villages that then scattered or died — the
waiting seat is becoming the scale band's signature image: a chair
held for people who run out of food first. What is missing is not a
verb — the tending verb works and was used — it is time and food:
courtship that starts early enough, and a pantry that survives the
season the league needs to season.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — PARTLY.** The regional rung is reached on 4/4 seeds
  (network day 46 on every seed — that uniformity is the driver's
  courtship cadence, not a game claim). The national rung was
  reachable in the near-miss sense on 85201 (3 days short) but not
  reached on any seed. A real player doing what this bot did
  would feel national as "almost", not "locked".
- **FUN — YES, in the parts a player actually touches.** Courtship,
  grain sends, drift warnings, foreign-polity rumors, and scatter
  narration all read as people and places, not systems. The trust
  bleed is the fun-killer in waiting: a league that says +8 and
  means −2 teaches the player not to believe the game's words.
- **WINNABLE — NOT YET, and not for a scale reason.** The full seat
  stays unwon because villages scatter or die before the scale
  ladder's season requirements can be served. The wave-4-kill wall
  (Nov 3 picture) sits behind this one: even a village that seasoned
  its league would still face it. Scale is not the current binding
  wall; survival-to-season is.

## Metric review (§14)

- The r93 threshold (national ≥1/4 OR ≥3 seasoned peers on a seed;
  NO-GO if 0 seasoned peers despite tends landing) is RETIRED as
  mis-aimed, not failed: it assumed tends would be the contested
  quantity, but tends landed only on 85201 (where they worked) and
  were correctly idle or impossible elsewhere. Re-scoring this quad
  against that threshold either way would misdescribe it.
- Proposed metric for the NEXT scale run: "seasoned-peer count AND
  scatter-day gap" — i.e. for each seed, report (peers reaching
  seasoned 40/30d) alongside (days between scatter/death and the
  nearest peer's seasoning date). That pair separates "trust-blocked"
  from "time-blocked" from "food-blocked", which this run shows are
  three different failures wearing one national-0/4 number.
- The analyzer's console "tended=" field is the LEAD-tend counter,
  not the peer count — the peer count is census tendPeer (85201=2,
  others 0) and capture "Haven sends … kcal of grain to" lines
  (85201=2, others 0). Future run notes must cite censusTendPeer,
  not the console's tended= field (this note's earlier reading nearly
  reported 85201 as 0 tends on that field alone).
- Telemetry check: `node scripts/telemetry-check.js --baseline
  …/telemetry-baselines/scale.json --current
  'evidence/2026-11-03/journey-scale-r93/journey-scale-r93-trust-*.json'
  --metrics nationalLive,scaleRank` → "quiet (4 files, 2 metrics, no
  large deviations)". Caveat: that baseline is an old aggregate shape
  (maxGameDay 880), so "quiet" means "no large deviation on these
  two metrics", not a clean bill. Baseline NOT rolled forward — the
  run's finding is a shape change in the failure mode (time/food,
  not trust), which a baseline roll would bury.
- Analyzer seed-list catch: the cloned analyzer's first run silently
  scored r92's seeds (85101–85104, zeroed fields) because its seed
  list lives at line 197, not in the header. Fixed, re-run; the
  corrected output is the committed one. Future clones must grep the
  seed list, not just the header.

## Blanks: filled or documented

- FILLED (tooling): r93 driver/analyzer clones with corrected seed
  list (see metric review catch above).
- DOCUMENTED, not fixed (needs the decomposition first):
  1. Covenant trust bleed vs +8 concession lines (85203 Stonebridge
     30 → 14 across five "league holds" concessions + two titan
     strikes + weekly pool shortfalls). Next step: per-day trust
     delta instrument; no wording or number change until the drain
     is attributed.
  2. Late courtship (peers forming days 56–65) leaves no season to
     serve before scatter. Next step: a courtship-timing question,
     not a gate change (freeze stands).
  3. Driver picker artifacts (betrayal:accept open, teach close in a
     grief conversation) — bot choice policy, not NPC writing.
- NOTHING in this run needs Steve's eyes on his phone as a feel
  change (no src/js, no UI, no combat change) — no [needs-eyes].

## Appendix — analyzer output (corrected seeds)

seed 85201: fusionInstallDay=null fusionPelletDay=null fusionFlips=0 feastGrants=0 feastRefReactor=0 feastRefDevotion=0 villagerDays=280 knowerDays=15 armed(stick-only=0 real=14 both=1 srcEq=0 srcPack=0 srcBoth=15) weaponless=0 weaponlessKnower=0 eligibleDays=0 attempts(Cd)=0 unexplained=0 stickBlocked=0 wcLines=10 deadfallDuty=65 tendRefusals=0 tendPeerLines=2 censusTendPeer=2 censusTended=0 captureDiff=null gossipPicks=0 gossipThem=0 sittings=0
seed 85202: fusionInstallDay=null fusionPelletDay=null fusionFlips=0 feastGrants=7 feastRefReactor=0 feastRefDevotion=0 villagerDays=234 knowerDays=180 armed(stick-only=0 real=154 both=26 srcEq=0 srcPack=0 srcBoth=180) weaponless=0 weaponlessKnower=0 eligibleDays=0 attempts(Cd)=0 unexplained=0 stickBlocked=0 wcLines=4 deadfallDuty=20 tendRefusals=0 tendPeerLines=0 censusTendPeer=0 censusTended=0 captureDiff=null gossipPicks=0 gossipThem=0 sittings=0
seed 85203: fusionInstallDay=null fusionPelletDay=null fusionFlips=0 feastGrants=12 feastRefReactor=0 feastRefDevotion=0 villagerDays=318 knowerDays=161 armed(stick-only=0 real=150 both=11 srcEq=0 srcPack=0 srcBoth=161) weaponless=0 weaponlessKnower=0 eligibleDays=0 attempts(Cd)=0 unexplained=0 stickBlocked=0 wcLines=5 deadfallDuty=42 tendRefusals=0 tendPeerLines=0 censusTendPeer=0 censusTended=0 captureDiff=null gossipPicks=0 gossipThem=8 sittings=1
seed 85204: fusionInstallDay=15 fusionPelletDay=15 fusionFlips=2 feastGrants=6 feastRefReactor=2 feastRefDevotion=0 villagerDays=368 knowerDays=167 armed(stick-only=0 real=146 both=21 srcEq=0 srcPack=0 srcBoth=167) weaponless=0 weaponlessKnower=0 eligibleDays=0 attempts(Cd)=0 unexplained=0 stickBlocked=0 wcLines=3 deadfallDuty=21 tendRefusals=0 tendPeerLines=0 censusTendPeer=0 censusTended=0 captureDiff=null gossipPicks=0 gossipThem=0 sittings=0

## Closeout
- Safe-commit: f031f5823 (80 files) on base d86c1854a; post-commit
  index clobber (all 80 files staged-as-deleted, the known
  safe-commit.sh class) repaired via per-file `git update-index
  --add --cacheinfo` from HEAD blobs; verified `git status` empty +
  `git diff HEAD` empty. Commit itself was always correct.
- Rebase onto new master f085d5df0 (Loop B coordinator evidence,
  landed during this run): clean, 1/1, new hash 640a99208; proof
  re-run post-rebase 12/12 + node --check on both r93 scripts green.
- check.js --quick on the worktree: 280 passed, 10 failed in 1051s.
  Failures are NOT regressions from this run: the change set has zero
  src/js diff vs d86 and touches no existing test file (verified via
  `git diff d86c1854a HEAD -- src/js/` = empty). One failure
  reproduced standalone (test-establishment-r20-fixes racks-full gate:
  "next day voices once more: expected 2, got 1") on unchanged code,
  i.e. pre-existing on base; the remaining failures include 120s
  harness timeouts under a heavily contended box (succession-grief,
  table-endings, capable-bot). Full failure list was not retained
  (output piped through tail) — recorded here, not hidden.
- Merged locally, pending ship (ship loop owns bump/push/live verify).
  No [needs-eyes]: no src/js, no UI, no combat change.
- Heartbeat loop: beats verified landed 02:12:34Z and 02:21:52Z by
  read-back of REGISTRY.json + the loop's log file; loop killed at
  closeout. Rotation 3→0 written; lock deleted.
