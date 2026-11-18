# Journey deepening r236 — prereg

- Run: r236, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226/r227/r232/r235)
- Run id: playtest-a-20261117T2306Z (lock loop-a-20261117T230607Z)
- Base: master `5168f824d` (batch ship of 77a37fe91; worktree registered at 72581074d, fast-forwarded to 5168f824d before any work — the ship loop's version bump landed mid-registration)
- Base delta vs r235's panel base (3d9517838): 60+ commits. Src changes relevant to titans/muster/deepening: **none in src/js/titans.js** (verified: empty log). In the delta: sim-packhunt-rec-b (Pack Hunt harry total folded into HP recovery, finding #2497 — field fights), sim-fightallycap-b (FIGHTALLY2: second ally slot in the fight engine — wave-4/titan fights), sim-profilegate-b (lever NO-GO, reverted — net zero), journey-landing r143, journey-succession r231 (mourning lines), journey-crisis r230 (pagination), journey-establishment r233 (triple-exile instruments). The muster machine is unchanged since r235; comparisons to r235 numbers are context, never replication.
- Policy: competent + MUSTER POLICY (r227 verbatim + growth-listening amendment, driver-only — see below) + MARCH STEP (r228 verbatim, driver-only). Single arm: this run BUILDS the growth line, proves it, and verifies it in the wild on current master.
- Seeds: 103901–103908 (8 seeds)
- Seed-band freshness check (local_seed_band_freshness): repo evidence `*.md` via git grep — 0 hits for 103901–103908; hidden evidence `*.md` — 0 hits; hidden evidence 2026-11-17 filenames — 0 hits. REJECTED first choice: 103701–103708 (journey-scale r236, Lane B, same day — its prereg + pilot 103701 files are already in the tree). 103801–103812 was fightallycap-confirm-b.
- Driver: fork of scripts/journey-deepening-r235-20261117.js (band + tag r236; r235 instruments carried: refusalHeard + coalitionWatch) + growth instruments (growthHeard say-wrap + daily growthWatch via Game.titanMusterGrowth + growth-aware musterDecision). Analyzer: fork of scripts/analyze-journey-deepening-r235-20261117.js + summarizeGrowth (new; carried summaries verbatim). Proof tests: new game-level growth test (scripts/test-titan-muster-growth-20261117.js) + carried muster/march/analyzer tests with growth cases added.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 + readiness bars; observation channel: 2 survived encounters → trick). NO canon doc covers titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10; quota 6 iff trust >= 70 and opinion >= 10 else 2; refusal bars trust < 25 / opinion < -10 / arrears > 0; Haven commit cap 3). The growth line names only what the muster can already know (link trust/opinion + already-generated rosters); it never names the wave's title beyond the Herald the village has located.

## Q1 — ONE-SHORT GROWTH LINE (primary, BUILD)

Why: r235's binding wall is the 10-blade coalition bar, and its FUN verdict
was PARTLY for one reason: villages sit one blade short for weeks "with no
new information about what would close the one-blade gap". The stall is
structural, not just slow: the call is the ONLY moment quotas are re-read
(soundTitanCall), and the policy sounds it once per link-count change —
so trust that grows between calls (gifts +10, weekly tribute, funeral
mend) sits unharvested until a new link forms. r235's 103601 called twice
(d64, d73), gathered 6 allies + 3 Haven, and sat at exactly 9 blades for
27 straight days. The war council already computes the projection live,
but nobody sits the council again after day 64 — there is no signal that
re-sounding the call would help. The fix supplies the signal.

THE FIX (src/js/titans.js): a dawn voice line, once per growth, when a
short muster could gain blades from a re-sounded call:
- `Game.titanMusterGrowth(titanId)` — NEW, PURE, DAWN-SAFE. Replays the
  call's per-link math (refusal bars, trusted quota 6 else 2, already
  committed, free adults from rosters AS THEY STAND — a never-generated
  roster counts 0, undercount never overclaim) + the Haven two-tap pool
  (cap 3, via titanVolunteers()). No roster generation (unlike
  titanCallReadiness, which generates rosters and is explicit-demand-only),
  no RNG, no mutation. Returns { current, harvestable, total, need,
  wouldBeReady, links[], havenGain }. Exposed on Game + Game._titanTest
  so the dawn tick and the journey driver read ONE function — the game's
  word and the panel's instrument cannot disagree.
- `titanMusterGrowthLine(day)` — called from titanDawnTick after
  titanMusterUpkeep. Per muster: skip slain / ready (titanMusterReady) /
  titan-absent (titanMonsterPresent — the call's own gate, so the line
  never urges a call into the dark) / harvestable 0. Fire only when
  harvestable exceeds the muster's last announced count
  (muster._growthSaid); on fire, stamp it. The line names the fire that
  warmed most ("Emberhold would send 4 more if the call were sounded
  again"), the Haven volunteers if any, the harvestable total and the
  would-be muster total against the need ("The fires have warmed since
  the call" — the driver's key phrase). Ready musters stay silent: the
  march owns them.
- Re-arming: soundTitanCall and titanCommitOwn each recompute the
  harvestable count after they act and store it as _growthSaid — so a
  harvested growth never repeats, and fresh growth after a harvest speaks
  again. (A single high-water mark without the re-arm would suppress later
  smaller growth forever; the re-arm is what makes the dedupe correct.)
- DELIBERATELY NOT COVERED: refusal-recovery naming. A link that refused
  at the call and later recovered has no generated roster, so its gain is
  unknowable without generation — the line stays silent there (undercount
  by design). The council still shows the recovery live. If the panel
  shows recovered-during-stall as a live pool, that is the next run's
  question, not this run's scope creep.

POLICY AMENDMENT (driver-only, r236): musterDecision gains `growthHeard`
— when the growth line fired since the last call, the competent player
re-sounds the call that day (a refusal costs trust −8, but the line only
fires when the projection says blades are waiting — the game itself names
the growth, so re-sounding is the competent play, not a daily spam).
The flag resets when the call sounds. Council/commit rules unchanged.

Bound metrics (per seed, panel totals in the analyzer):
- growthWatch: daily { day, current, harvestable, total, havenGain,
  topGain, topName } via Game.titanMusterGrowth('herald') while a located
  Herald is present. Pure read; zero gameplay effect.
- growthHeard: say-wrap count of the line ("The fires have warmed since
  the call") per titan-day.
- musterLog (carried): before/after totals per call day + whether the
  call was a growth-call (growthHeard flag on the entry).

GO (all must hold):
- >= 1 titan-day panel-wide has harvestable > 0 during a short muster
  AND the line fires on it (the mechanism engages in the wild).
- 0 days where the line fires twice without an intervening call or
  further harvestable growth (dedupe holds — joined from growthHeard +
  growthWatch + musterLog).
- On every growth-call (policy re-sounds the call the same day the line
  fires), the muster gains the announced allied blades: after.allies −
  before.allies == announced allied gain for that day (Haven gain is
  excluded — the call does not commit Haven; the commit is a separate
  verb and the policy commits only once per muster).
If NO titan-day panel-wide has harvestable > 0 during a short muster,
Q1 is UNMEASURED (pool empty — the finding is then about trust growth
during stalls, not the line; the proof test carries the mechanism). If
pool days exist but the line never fires, the verdict is
UNMEASURED-SILENT with the pool series as evidence (the growth was
already announced by the call's re-arm, so silence is correct — but the
mechanism never spoke in the wild). If the line fires but no growth-call
follows, the verdict is UNMEASURED-HARVEST (line fired, harvest
unjudged). If the line fires but a growth-call harvests nothing, that is
NO-GO (mechanism disagrees with the game; classify per §14a:
CONCEPT-DEAD if the growth math misses a path, METRIC-BROKEN if the
instrument mis-attributes the line).

## Q2 — COALITION-REACH (secondary, outcome; r235 metric-review adopted)

Why: r235 retired w4stuck1 (flips run to run while the wall stays put)
and proposed COALITION-REACH = seeds reaching 10 blades, bar >= 6/8
(this band r235: 4/8, r232: 3/8). This run measures it WITH the growth
line in: does naming the gap move the coalition?

Bound metric: per seed, max blades (allies + haven) reached while a titan
is present (carried summarizeCoalitionGap). Bar: >= 6/8 seeds reach 10.
Secondary watch: longest one-short run (r235: 27 days).

## Policy safety rules (part of the prereg, not tunable mid-run)

- Muster (r227 verbatim + r236 growth amendment): call ONCE per
  link-count change OR once per growth-line hearing (refusals cost trust
  −8 per call, never sound daily without the line or a new link);
  council once per located omen; one commit cycle per muster;
  titanCommitOwn two-tap in one daily tick.
- Titan carve-out in policy.fight applies ONLY when the fight holds a
  titan monster id AND Game.titanMusterReady(mid) is true; the mid-fight
  hpPct < 0.35 flee and the stalemate flee stay as-is.
- March (r228 verbatim): fires ONLY for a located (stage >= 2), present,
  unslain titan with a READY muster; sanctity holds (over / tbfight /
  pendingEncounter / tableActive / sleeping) use the braced pattern
  (hold(...) then continue INSIDE the if); never marches without a ready
  muster, never outfits allies, never touches finale/nielsen campaign gates.
- No seek-the-titan pathfinding beyond the march. If a muster completes
  but no fight fires by day 100, that is a recorded finding (march gap),
  not a policy failure to hide.

## Q3 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING
LAW): does the NPC want something, do options engage/deflect it, do
endings resolve/plant/owe? Note verbatim lines. Also read the
muster/march/fight voice in full on at least one seed (the growth line
itself is Q1's instrument — read it in the wild, not just the count).

## Q4 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was
missing). Judge reachable / fun / winnable for deepening. Carried:
w4stuck1 (old bar, continuity only — retired, see r235 metric review),
trick pipeline (taughtRate null rule, learnedRate), w4fights / w4kills
(the analyzer "wave-4 kills" line counts FIGHTS — relabelled in r235),
banked veterans, w5 unlocked/faced/killed. Slain-field carried as a
watch (r227 1/8, r232 0/16, r235 0/8 — the pool is thinner than any
prereg assumed; the proof test carries the verdict). Refusal-heard
carried as a regression watch (r235 Q1 GO: every refusal day heard
exactly once).

## Substrate checklist (§14b, before the pilot)

1. Contact: short musters occur on the deepening band (r235: 7/8 stuck
   at 7–9 blades; 103601 27 days at 9). The growth series is observable
   daily via the pure Game.titanMusterGrowth read.
2. Pool sizing: the GO bar needs >= 1 titan-day with harvestable > 0
   during a short muster. Trust moves under the competent policy (gifts
   +10, weekly tribute when pantry > 15,000 kcal — r235 regionalLog shows
   both firing), so the pool is not thin by construction; if it proves
   thin anyway, Q1 reports UNMEASURED with the series as evidence.
3. Verb existence: the fix needs no new verb — the dawn line is a say in
   titanDawnTick; the harvest verb is the existing call.
4. Horizon fit: DAYCAP 100 — r235's stalls span the whole window; the
   phenomenon is inside the horizon.

## Watches (no verdicts unless the bar trips)

- Scholar deaths (standing metric, r138 rule as corrected by r222's metric
  review): compare against r235 (26 total, 19 wild), NOT the
  establishment ≤2/panel bar.
- Survival vs r235 (7/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores
  (r223: 800–1,200 kcal/night) — counted only if the analyzer scan finds
  them; no verdict.
- FIGHTALLY2: the second ally slot landed in this base (sim-fightallycap-b).
  Watch wave-4/titan fight party sizes in wildFightTable — no verdict,
  the fightallycap confirm panel owns the verdict.
- TableActive distinction (r235 investigated, NOT landed; owed to the
  scale leg): no src change here; the march sanctity gate still uses
  tableActive(). Not re-investigated.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache
  /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/deepening.json --current
  'evidence/2026-11-17/journey-deepening-r236-*-seed*.json'`. Known LOUD
  schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on
  that line alone; any NEW loud line is a same-run investigation item.

## Pilot finding + repair (2026-11-17, before the full panel)

PILOT (3 seeds, 103901–103903): Q1-GROWTH-LINE **NO-GO on the first
build** — 3 bad lines on 103903 (line fired on days 55, 56, 80 with
harvestable 0 by muster time). Root cause, pinned with a vols trace
(dawn line text vs daily-entry pool vs muster-time pool): the line read
`titanVolunteers()` mid-dawn (inside `titanDawnTick`), but the volunteer
pool drains TWICE before anyone can act on it — (1) the dawn's own tail
(`attemptWaitingOutings` sets out after the titan tick: dawn 2 → daily
entry 1 on day 55) and (2) the day's assignments during play (entry 1 →
muster time 0 on days 55/56/80). The line promised a dawn-instant pool;
the call harvests the morning pool. The policy compounded it by checking
the muster AFTER playing the whole day.

REPAIR (same run, before the full panel — the prereg bar is unchanged,
the build is fixed to meet it):
1. GAME: `titanMusterGrowthLine` moved out of `titanDawnTick` to the
   LAST beat of game.js dawn, after `attemptWaitingOutings` — the line
   now names the post-assignment pool a morning call would find.
2. DRIVER: `musterPlay` moved to the top of `policy.daily`, before
   `BASE.daily` — the policy sounds the call the same morning it hears
   the line, the way a real player would. Its growthWatch snapshot is
   now the MORNING pool: the right comparator for the dawn line.
3. PROOF: `test-titan-muster-growth` mirrors the new order (tick, then
   the late-dawn line) and stays green on both fixtures. The pilot is
   RE-RUN on the repaired build; the panel verdict comes from the
   repaired build only. The first pilot's NO-GO stays on the record as
   the defect the repair answers.

## Pilot-2 finding + repair (2026-11-17, before the full panel)

RE-PILOT (3 seeds, repaired build): Q1-GROWTH-LINE **GO on the allied
rule** — poolDays 27, lineDays 4, badLines 0, repeatLines 0,
growthCalls 4, harvestMismatch 0. The dawn-tail drain is fixed.
BUT the Haven leg of the promise was unharvested AND unjudged: 103901
located the Herald day 92, called (0 allies — links refused), committed
1 Haven blade, then the line fired twice naming 1 then 2 Haven
volunteers — and both growth-calls harvested 0 Haven. Root cause, two
halves: (a) GAME TEXT — the line's Haven clause carried no verb
("Haven has 2 volunteers free to march"), while the call brings ALLIED
blades only; Haven marches on the commit verb, which the line never
named (the ready-closer already says "send Haven's own" — the
not-ready case said nothing). (b) DRIVER POLICY — `musterDecision`'s
commit rule was once-per-muster (`!committed`), so even a policy that
heard the line never re-committed; the growth-call sounded the call
(allied only) and the Haven volunteers stayed home.

REPAIR (same run, before the full panel):
1. GAME: the Haven clause now names the commit — "Haven has 2
   volunteers free to march — the commit sends them."
2. DRIVER: `musterDecision` re-opens the commit on fresh Haven growth
   (`growthHeard && havenGain > 0`, still capped at 3 Haven blades);
   allied-only growth does not re-open it. Proof cases (M16)–(M18).
3. ANALYZER (verdict-rule extension, recorded BEFORE the panel runs):
   `summarizeGrowth` now judges the Haven harvest alongside the allied
   one (announced havenGain vs after.haven − before.haven on
   growth-calls); a Haven mismatch is NO-GO like an allied one. Proof
   cases (70) GO / (71) NO-GO. The Q1 bar now reads: every growth-call
   harvests the announced allied blades AND the announced Haven blades.
   The re-pilot's GO was computed under the allied-only rule; the panel
   verdict comes from the extended rule on the twice-repaired build.

## Metric review (filled at closeout)

- (to be filled)
