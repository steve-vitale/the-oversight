# sim-linkdrive-b — the link-forming drive: propose + answer raises, hold through seasoning to the Dawn — PRE-REGISTRATION (arm sim-linkdrive-b)

Run: fleshout-loop-b-20261107T1049Z (Loop B). Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Committed BEFORE any
judged sim. POLICY-SIDE ONLY: one new policy file
(`scripts/policies/competent-linkdrive-b.js`); ZERO src/js changes, zero
default flips, no changes to any existing policy file. The frozen staged
substrate (`scripts/policies/competent-stageally-a.js`) is composed onto,
unmodified. No gate, price, deed, or win-price change. Judging rules
untouched.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/SCALE.md` (the scale ladder,
  designed 2026-10-10, Steve-approved): village → regional →
  national → global, one rung per season (1 season = 30 days), a
  moment not a threshold. REGIONAL bar: Haven's first bond is 21+
  days old — three weeks of knowing them. The first gesture (gift
  2,000 pantry kcal / send the representative 3 days / cold ink)
  stages at link formation, but the Regional Dawn itself
  (`networkLive`, the System's NETWORK announcement) waits for the
  bond to age 21+ days. Regional before ~day 25 is impossible.
  NATIONAL bar: a polity is one primary with ≥3 SEASONED
  subordinates (30+ days old AND trust 40+), or one of the six roads
  (LEAD / BELONG / COVENANT / TRADE / CONQUEST / REFUSE). `scaleRank()`
  reads only the `globalLive` / `nationalLive` / `networkLive` flags —
  standing points do not enter it.
- `docs/godpath/STEVE-ANSWERS.md` — the who-should-ask ruling (Steve
  2026-11-04 22:32): villagers initiate bonds on their own,
  perception-gated; landed 2026-11-06 (`src/js/bond-initiation.js`).
  The drive composes with that landed system; it does not replace it.
  The propose verbs stay player-only per Steve's 2026-10-26 ruling —
  this arm is a measurement instrument like the staged party invites,
  not a game-code change.
- `src/js/hierarchy.js` rules, read from code (not invented):
  `proposeLink(targetId, opts)` scores the courtship (`judgeLink`:
  base 38 + representative standing/2 max 20 + opinion/2 + ally +15
  + strength term, as-subordinate +10, generosity +8 when
  as-subordinate + tribute ≥ 3,000 + opinion ≥ 5, ±10 RNG) — ≥55
  accepts, 35–54 counters (played: accept / sweeten / walk), <35
  declines (−5 opinion, banks `courtshipDeclined`, climb verbs +1
  harder 28 days); opinion ≤ −20 means the door is shut and the
  knock goes unanswered. `proposeLink` is knowledge-gated
  (`knowsVillage`, knower-traced 2026-10-29). `_formLink` starts a
  link at trust 30 and stages the first accord
  (`stageFirstAccord`); `_checkRegional` fires the Dawn
  (`_fireRegionalDawn`) when a bond is 21+ days old while
  `_regionalPending` holds. `answerCounter('accept')` forms the link
  on the counter's terms — the counter always offers Haven as
  subordinate (tribute 6,000/week when the original offer was
  as-subordinate, 5,000 otherwise) — so a counter-accepted link is
  BELONG-shaped. `answerAccord('gift')` sends 2,000 kcal → +10
  trust, +5 opinion. `tendLink` (1,500 kcal → +8 trust, weekly)
  works ONLY for Haven-primary links and peer (covenant/trade)
  links; BELONG links (Haven subordinate) REFUSE it — "tending your
  overlord is not this verb." A BELONG link is held instead by
  `payTribute` (full week's tribute → +3 trust, arrears 0;
  idempotent per week) and by honoring the primary's demands
  (`answerDemand(linkId, true)`, +8 proportional to food sent).
  Weekly `linkTick`: a settled week is +1 trust either direction;
  an unsettled BELONG week is −6 trust + arrears; a Haven-primary
  subordinate's tribute is attempted weekly from THEIR pantry
  (their fields pay). A link with trust < 20 and no upkeep for 14+
  days snaps (the neglect snap). `primaryDemand` fires ~20%/week
  on BELONG links (tribute / aid / counsel).
- `src/js/bond-initiation.js` rules, read from code: an NPC raises a
  link idea (`npcLinkRaiseTick` — needs the villager's trust ≥ 20, a
  `build_standing` goal weight ≥ 1, and ≥1 village in that villager's
  own lore); the raise stages as a talk request and EXPIRES after 2
  days unanswered; the same villager|village pair cannot re-raise
  within 14 days of a decision or expiry. `acceptLinkRaise` tells the
  bearer <redacted> lore (`tellVillageLore`), then calls
  `proposeLink` as the player with NO opts (as-primary, 4,000
  tribute). In conversation the raise is answered with the
  `link:accept` / `link:decline` choices (`bondChoices`, prepended
  to `convoChoices` while a raise is pending; `convoTurn` routes
  `link:*` to `bondTurn`).
- No canon invented here. If the drive finds a gate the canon docs
  do not name, the evidence file says so instead of inventing canon.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-07/sim-regionalstep-b.md` (+ prereg, committed
  98605d40d) — the DIAG this arm answers: scale never leaves
  `village` because nobody ever asks; 0 `proposeLink` calls on band
  53001–53008, 82 link raises expired unanswered; courtship-ready
  day 4, outright-accept from ~day 9, as-subordinate offer scores
  higher everywhere. The two untested gates the diag corpus could
  not exercise: the 21-day seasoning and `_checkRegional` / the
  Regional Dawn. This arm is regionalstep's next blank #1.
- `evidence/2026-11-04/sim-askplus-a.md` — asking was already proven
  on a different band/substrate (proposals 8/8, links 8/8, diplomacy
  102 on 5/8, but end-diplomacy >0 on only 2/8: HOLDING failed, not
  asking). This arm does NOT re-prove asking works. The new question
  is the drive on the STAGED substrate + raise-answering + holding
  through seasoning to the Dawn on band 53001–53008. Askplus's
  values are borrowed verbatim where they are the proven shape:
  proposal pantry gate 12,000 kcal, counter answer 'accept'
  (pantry > 25,000 ? 'sweeten' : 'accept' — this arm always
  'accept': the sure link, no 1,500 kcal sweetener gamble),
  accord answer 'gift', tend gate pantry > 20,000.
- `evidence/2026-11-04/sim-polityfrag-b.md`,
  `sim-tendseason-b.md`, `sim-leadbelong-b.md` — holding lessons
  carried into the design: tend ONLY below the seasoned bar
  (age < 30 days OR trust < 40 — tendseason-b's predicate);
  BELONG links go untended to zero under leadcourt's primary-only
  tend loop, so this arm HOLDS BELONG links with `payTribute`
  weekly + honored demands (leadbelong blank #4a); report LEAD vs
  BELONG shape, not just counts (leadbelong-b, askplus Finding 3);
  diplomacy holds-or-collapses at the trust-40 boundary and the
  end-state read is a lottery over the death day (askplus metric
  review) — so this arm judges links/regional, not end-diplomacy.
- The staged substrate's fragility (trajfrag-b: one extra RNG draw
  flips 3 of 4 seeds) is expected and owned: the armed leg DIVERGES
  from the baseline by design (the lever draws engine RNG through
  `judgeLink` and conversation turns). Only the BASELINE leg must
  reproduce regionalstep exactly (see guard).

## The lever (frozen — do not tune after the prereg)

NEW `scripts/policies/competent-linkdrive-b.js` =
`competent-stageally-a` staged policy verbatim + a `linkDrive`
daily hook AFTER staged daily. The hook does, in order, at most
once per day each:

1. **Answer pending counters** — if `state.pendingCounter`, call
   `answerCounter('accept')` (their terms → the link forms;
   counter-accepted = BELONG-shaped). A pending counter blocks
   further proposals, so it is answered first, the day it stages.
2. **Answer pending first accords** — if `state.pendingAccord`,
   call `answerAccord('gift')` (2,000 kcal → +10 trust; partial
   pantry pays partial, proportional trust — the engine's rule).
3. **Answer pending link raises, in conversation** — for each
   pending raise (`state.village.linkRaises`, oldest first): the
   scholar talks to the raiser (`talkTo` + up to 5 real turns via
   `chooseConversationChoice`, answering the raiser's question
   first, continuing their story, or navigating to the subject —
   the stageally `askToJoin` shape) and picks `link:accept` ONLY
   when the raised village is courtship-ready (deterministic
   judge, as-subordinate offer, ≥ 55 — the score can never
   decline: worst case a played counter, which step 1 accepts
   the next day). The raise itself is the perception event: the
   villager walked up with the idea and the village they
   personally know; the scholar learns it from them in the
   conversation (the engine's own `acceptLinkRaise` tells the
   lore, then proposes). The drive NEVER calls the bare
   `acceptLinkRaise` verb and NEVER picks `link:decline` — a
   decline is the player's call, not the policy's. A raise for a
   not-yet-ready village is left pending (it expires; the
   villager may re-raise after the 14-day cooldown). A raise
   whose raiser is dead, exiled, or off-roster is skipped and
   counted. The `link:accept` pick goes through the conversation
   engine (`convoTurn`), never the bare verb — the fiction-honest
   door, same as the staged party invites.
4. **Propose directly, as-subordinate first** — once per day, when
   no counter/accord/national beat is pending, pantry > 12,000
   kcal, and fewer than 3 active links total: pick the
   best courtship-ready KNOWN village (scholar's own lore —
   `knowsVillage`, the perception law for direct proposals;
   deterministic judge recomputed WITHOUT calling `judgeLink`,
   which draws RNG — the recorder's `detJudge` rule) and call
   `proposeLink(vid, { asSubordinate: true,
   tributeKcalPerWeek: 4000 })`. Courtship-ready = deterministic
   as-subordinate score ≥ 55 (score ≥ 45 even at −10 RNG:
   counter-or-better guaranteed, never a cold decline). Best =
   highest deterministic as-subordinate score, ties by village id.
   A decline costs −5 opinion and banks `courtshipDeclined`, so
   a declined village is not re-proposed within 7 days. The cap
   is 3 ACTIVE links (any direction: LEAD + BELONG) — the LEAD
   road needs 3 subordinates; BELONG needs 1 link to a 4-realm
   primary; the Dawn needs 1 link aged 21 days.
5. **Tend LEAD links below the seasoned bar** — weekly, for each
   active Haven-primary link with age < 30 days OR trust < 40,
   when pantry > 20,000 kcal: `tendLink(link.id)` (1,500 kcal →
   +8 trust). Seasoned links (30+ days AND trust 40+) are NOT
   tended (tendseason-b predicate — tending a held link buys
   nothing and costs food).
6. **Hold BELONG links with tribute + honored demands** — for each
   active Haven-subordinate link: if this week's tribute is not
   current (`tributePaidWeek !== _week()`) and the pantry can
   cover the owed tribute, `payTribute(link.id)` in full (+3
   trust, arrears 0). If `link.pendingDemand`, `answerDemand(
   link.id, true)` — honor it (tribute +8 proportional, aid
   loans the representative 3 days, counsel +8). `tendLink`
   refuses BELONG links in the engine; this is the holding verb
   that exists for them.
7. **Never answer `pendingNational` / `pendingGlobal`** — endgame
   beats, not the ask; the staged baseline does not answer them
   either, so baseline parity holds. A staged beat is recorded in
   the corpus (the road staging is itself an observation).

What the drive does NOT do: no `proposeCovenant` / `proposeTrade`
(peer links are a separate corpus — leadbelong blank #2), no
`raidVillage` (the conquest road is not this arm), no bond
proposals for the scholar, no roster/list-fed decisions (direct
proposals read only `knowsVillage` + the deterministic judge;
raises read only live pending raises from named villagers), no
`villageStandingTotal()` / `unlockedWave()` calls in the policy
(the instrument's one end-of-run call is reported separately and
never counted as a natural door-open, per tendseason-b).

Deterministic-judge rule (frozen, same as the recorder):
base 38 + min(20, repStanding/2) + opinion/2 + (allied ? 15 : 0)
+ (as-subordinate ? 10 + (opinion ≥ 5 ? 8 : 0) : strength term).
Never call `judgeLink` live (it draws RNG). Candidate ranking is
deterministic (score desc, village id asc) — no `Math.random` in
the policy. The only new RNG draws in the armed leg are the
engine's own (`judgeLink` inside `proposeLink`, conversation
turns) — the lever, not the instrument.

## Method

- Band 53001–53008, DELIBERATELY REUSED (balanced panel:
  before/after on identical seeds — the same trajectories as
  regionalstep-b / sitstep-b / stageally-confirm2-b). Do NOT pick
  fresh seeds for the pilot. Horizon 150d death-aware (+10d tail
  max). Legs: baseline = frozen staged policy (this run's own
  replay through the new driver — see guard); armed = staged +
  linkdrive. 8 seeds × 2 legs = 16 runs.
- Driver `scripts/linkdrive-driver-20261107.js`: the regionalstep
  driver shape with (a) a POLICY env switch (staged | linkdrive),
  (b) the regionalstep instrument (`scripts/
  regionalstep-instrument-20261107.js`) reused VERBATIM — every
  daily gate field, link list, raise history, and wrapped-call
  count, so the baseline leg is comparable field-for-field with
  the regionalstep corpus, (c) a widened say-capture regex (adds
  `bows|brings it home|Tribute:|grain|gesture` — the askplus
  instrument finding: the regionalstep pattern misses the core
  link-formation lines), (d) snapshot extensions appended
  driver-side (pantry kcal, `pendingNational` / `pendingGlobal`,
  pending-demand counts — read-only fields, no game-state effect),
  (e) capture of the linkdrive module stats per seed. Refuses to
  overwrite. Corpus `evidence/2026-11-07/perseed-linkdrive-b/`
  (RUN=linkdrive-base / linkdrive-armed).
- Analyzer `scripts/linkdrive-analyze-20261107.js`: per-seed
  before/after table (days, end, scale, maxW, w5 faced, readiness-5
  days, links by shape LEAD/BELONG, first-link day, Dawn day,
  regional days, diplomacy max/end + held days, raises staged /
  answered in-window / expired, proposes by outcome, counters,
  accords, tends by pre-tend class, tribute paid, demands honored,
  starvation deaths, pair days, wave-4+ kills), the gate
  classification on armed no-regional days (the regionalstep
  classifier, reused — which gate, if any, still blocks the Dawn
  once links exist), and the wall numbers.
- Proof `scripts/test-linkdrive-20261107.js`: policy gating
  fixtures (courtship threshold, pantry gates, 3-link cap,
  7-day decline cooldown, counter/accord answering, raise
  answering only when courtship-ready, never bare
  `acceptLinkRaise`, never `link:decline`, BELONG tribute/demand
  holding, LEAD tend below-bar predicate, national/global
  non-answers, deterministic judge fixtures, fake-Game
  wrap/snapshot checks), plus a live harness smoke leg (53006
  staged + linkdrive, short, /tmp) asserting the drive proposes
  and the instrument runs with 0 errors. Green BEFORE any judged
  sim and after every rebase.

## Pre-registered metric (binds the run)

- PRIMARY (GO iff ALL hold):
  (a) links formed on ≥ 3/8 armed seeds (baseline 0/8);
  (b) `scaleRank()` reaches `regional` on ≥ 2/8 armed seeds
      (baseline 0/8) — i.e. a link forms AND seasons 21 days AND
      the Dawn fires;
  (c) COST BAR (from the sim-scalemetric shape): band-total
      starvation deaths (teleDeaths `cause === 'starvation'`)
      armed ≤ baseline + 2, AND starvation deaths on seeds where
      the baseline had zero ("arm-only" seeds) ≤ 2 total;
      baseline starvation total is 6 (53001: 1, 53003: 2,
      53005: 3 — read from the regionalstep corpus before this
      prereg, so armed ≤ 8 total);
  (d) SURVIVAL BAR: armed median survival ≥ 0.8 × baseline
      median (baseline 114.5d → armed ≥ 91.6d).
  A miss on any leg is NO-GO, never re-scored against a friendlier
  metric mid-run. If the metric proves wrong, write it under
  "metric review" and propose the revision for the NEXT run.
- SECONDARIES (descriptive, judged in the evidence, never
  promoted to primary mid-run): raises answered in-window (of
  raises staged while the drive runs); links seasoned to the Dawn
  (21-day) vs links formed; diplomacy held to end (end-diplomacy
  > 0 seeds) and diplomacy-held days; LEAD vs BELONG link counts;
  tribute paid (kcal, BELONG links) and demands honored; wave-4
  kills and pair days vs baseline (the staged pair production must
  not regress: armed band wave-4+ kills ≥ baseline − 2, armed pair
  days ≥ baseline − 10% — the staged substrate is the thing being
  protected); first-link day and Dawn day per seed; gate
  classification on armed no-regional days.
- GUARD: instrument errors 0 on all 16 runs. The BASELINE leg must
  reproduce the regionalstep replay EXACTLY on all 8 seeds (0 links,
  0 regional, median 114.5d, wave-4+ kills 1/1/2/1/0/8/4/0 per seed
  53001–53008, end reasons as regionalstep) — a divergence is a
  STOP: the driver/instrument changed something, and the armed leg
  is not judged until the baseline is byte-identical in outcome.
  (Differs from regionalstep's soft guard deliberately: this arm's
  comparison IS the baseline leg, so the baseline must be exact.)
- INSUFFICIENT-DATA only if > 2 seeds in either leg carry
  instrument errors, or the baseline leg fails the exact-reproduction
  guard, or the armed leg records zero proposals AND zero raise
  answers (lever never fired).

## Balanced panel (§15)

Before/after comparisons run through the balanced panel
(`scripts/balance-panel.js`) — the panel is the instrument, the
pre-registered threshold above is the judge. Pseudo-panels built
from the per-seed JSONs (the askplus pattern,
`scripts/build-linkdrive-panels-20261107.js`, pseudo-policy
'linkdrive', paired seeds, before=staged, after=staged+linkdrive);
compare `.md` attached to the evidence file. Contract metrics
mappable from these JSONs: won, national (scaleRank 'national'
or higher), survival30/60 (gameDays), communityLost (endReason
village-lost/village-dead/pop-zero), villageDeaths (death-event
count), playerDeaths (not instrumented — left null, never faked).
All other contract metrics are null (not observed by this
instrument).

## Corpus

`evidence/2026-11-07/perseed-linkdrive-b/` (16 files, 8 staged +
8 armed, base recorded per file). Evidence:
`evidence/2026-11-07/sim-linkdrive-b.md` (lever played,
before/after numbers, reachability verdict — regional/national/
table/wins, wave 4–5 — village assessment in plain words, blanks
filled or documented, metric review, sense-test read, wall
numbers). Panel files `evidence/2026-11-07/linkdrive-panel*.md`
(+ .json, .json.gz pair).
