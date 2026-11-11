# Fans / audience — first numbers: pre-registration (arm sim-fansfirst-a)

Run fleshout-20261111T0715Z, Loop A. Coverage Program Tier 3 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit 28875b1b1 (master has since moved to ae53134ae…;
see rebase note in the evidence — the pilot runs on 28875b1b1 and
the branch is rebased onto the explicit master SHA before the final
commit, with the proof re-run green). No judged sim has run on this
base yet.

## Canon

- docs/CANON.md read first. **docs/FANS.md read in full** — it is
  the canon doc for this area, and it promises MORE than the code
  delivers (see the canon gap below; nothing is invented here).
- **FANS.md canon:** the audience is composed of **named, recurring
  alien fan personas** — individuals with species flavor, lane
  affinities, personalities, and arcs. A fan persona has: name,
  species/homeworld sketch, lane affinity, personality (what they
  cheer/boo), and an arc (how their feeling about the PLAYER evolves
  across the run). They appear in: show commentary (named
  reactions), care package notes (**signed, personal — not generic
  loot**), fan club figureheads (each per-lane club gets a face),
  and eventually at the galactic table. Knowledge-gated like the
  personas: a fan is "a viewer" / "the audience" until introduced.
  Fans are NOT fighters; their power is attention: Favor, votes,
  packages, and — at the table — testimony. The System name-drops
  fans obliviously. Rules: **4–6 fan personas per run, drawn from a
  larger pool — never the same six twice. No repeated names within a
  run** (unique-person law). Care package notes are SIGNED and
  personal. Fan arcs respond to the player's real history. Never
  let fans become a management screen.
- **CONTESTS.md canon (fan side):** TV shows are about being
  watched; a villager pulled onto *Ask a Human* comes home with
  fans or with shame — sometimes both; shows are how the audience
  meets non-fighters. Ratings summons (day 14+, 20% of a dipping
  TV slot): do the stunt (200 kcal, 4 trauma) "shakes a fan care
  package loose"; phone it in (loss); refuse on camera (played,
  consequences). Prizes: "fan care packages (wacky, never dinner)";
  "Social prizes: reputation, fan growth, audience boons (the
  audience can vote small favors)"; "Fan clubs: audience segments
  per lane that send care packages, vote, and grow with highlights.
  Whatever you do, there's a club for it." Release restoration
  (2026-10-18): "Three/six actual contest wins or 40/70 shared
  audience favor open tier2/3 gifts independently of monster
  waves."
- **The code as it stands (src/js/alienPlayers.js, the fan engine):**
  four anonymous per-lane clubs — fight (Blood), survival
  (Endurance), social (Moot), showbiz (Weird + TV) — in
  `apState().fanClubs`, legacy single `favor` mirrored to the
  loudest lane (`apFavor()` = max-absolute lane, sign preserved).
  `apAdjustFavor(n, why, lane)` moves one lane, clamped ±100,
  announces via sysSay only when |n|>=3 and the System has
  arrived. Drift: `apDailyTick` (called from the `endDay` wrapper,
  alienPlayers.js:3425) moves each lane 1 toward 0 every 3rd day
  (longsim contests r4 2026-10-11: was −1/day, which erased every
  highlight between shows). Gates, all lowered by longsim contests
  r4 because the old ones never fired in 16 long runs: care
  package at favor ≥12 (was 20), club boon at lane ≥25 (was 50),
  feed celebrity lines at favor ≥25 (was 50). `apCarePackage()`
  (max 1/4 days, 25% daily roll inside apDailyTick, plus a direct
  call from `_showEnd` WIN path and `_contestEnd`): wacky gift
  (curio, NEVER dinner — `apWackyGift`, one helper one rule) +
  30–69 kcal of snacks; the package note names the loudest club
  only when that lane is ≥20 (`apPackageClubLine`). `apClubBoon()`
  (max 1/5 days, 15% roll, lane ≥25): fight +10 health,
  survival +300 kcal pantry rations, social +1 unity, showbiz a
  wacky curio. `apFeedMessage()` (max 1/day, 40% roll): feed
  gossip; fan chatter scales with favor (≥25 growing / ≤−30
  restless / else watching); per-lane 25+ lines name the chanting
  club. Favor SOURCES (all flow through apAdjustFavor): contest
  wins on camera (`_contestEnd`, contests.js:5242/5275 — per
  `_cxFanLane`: blood→fight, endurance→survival, moot→social,
  else showbiz), highlight packages (+2), show results (+1/+2
  showbiz), group-encounter face-downs (+5 fight), stranger-fight
  outcomes (+gain/−2/−5 fight), the Death Reel (+2 showbiz),
  sigW5 cancellation overrule (−15). `apContestInterference`
  (verdict-only): fan favor bends verdict performance; the
  benevolent lifeline is the only player-facing branch.
  `apPersonaPackage()` is a SEPARATE system — packages from named
  alien-player personas (meddlers), not from fans — recorded
  separately, never conflated with fan packages.
- **Audience trials (src/js/progression.js):** `checkStruggle`
  (day 10+, weak + unfed → `offerAudienceTrial('struggle')`),
  `offerAudienceTrial(reason)` — haul 1,000 / haul 3,000 /
  identify 3 plants, 3-day window, reward integration + a lesson;
  `completeTrial()` on success; post-40 encore offers at 40%
  (`offerAudienceTrial('audience')`). The trial is the audience
  speaking directly, and the abilityfirst-a corpus shows one
  offered and expired unplayed ("The trial window closed. The
  audience makes a disappointed sound, like wind.").
- **Viewership (src/js/ledger.js):** `havenViewership()` —
  deed-reactive, never pantry-reactive: arc*5 + showmanship +
  codex breadth capped at 15, floored at 12 (the drift's resting
  state); spikes (recordMoment +1, arena, stunts) and spends
  (OBJECT −3, declines) ride a sticky pool. `viewershipBoard()`
  is the per-village leaderboard API. The 40 global bar is the
  docs/SCALE.md provisional "roughly a season+ of being worth
  watching" threshold.
- **Table testimony (src/js/table-beloved.js):** the Beloved path
  reads fan favor (`fanFavor()` from `ap.fanClubs`) and viewership
  at the table — "No audience — the show isn't watching and no
  fan club carries your name" blocks the path when viewership
  <12 and favor ≤0. Fans matter at the table; this arm measures
  whether they ever get there in lived play.
- **CANON GAP (recorded, not invented): FANS.md promises named
  fan personas and the code has none.** There is no fan-persona
  data file (no `fans.json`; `alienPlayers.json` holds the 12
  meddler personas, not fans); no per-run draw of 4–6 fans; no
  signed care-package notes (the one package line is the generic
  "WE LOVE YOU!" plus an optional club credit); no fan arcs; no
  named show commentary from fans; no fan figureheads per club.
  The clubs are anonymous audience segments, exactly as
  `apClubName` admits ("descriptive, not proper nouns — the clubs
  are audience segments, not characters"). This arm PROVES the
  absence in lived play (metric 8: zero named fans in the say
  corpus + zero fan-persona state) rather than assuming it — and
  records it as a canon-vs-code gap. The audit row says the same
  from the other side: coverage-audit-20261110.md §4, Fans /
  audience — **Unmeasured**: "Zero Nov evidence files, zero
  analyzers, zero `test-*fan*` files; canon only (docs/FANS.md)".

## What the existing fan tests prove — and what they do NOT

The fan-adjacent tests (test-alien4-packages, test-alien4-systems,
test-alien-break-carepackage, test-alien-break-economy,
test-alien-players-20261007, test-alien-players-integration-20261008,
test-alien-r12-breakit, test-alien-r7-breakit-20261009,
test-alien3-honesty) prove the verbs work when CALLED: packages
grant usable items, the BEANS hole is closed, favor gates were
lowered after the old ones never fired, the club credit line names
the loudest club at 20+. None of them measures whether fans ever
HAPPEN in a lived village under default competent play: no favor
trajectory, no package count, no boon count, no feed-line count,
no trial offers/completions, no viewership trajectory, no named
fan ever appearing. This arm measures exactly that, on a plain
competent band. (The r4 evidence itself is the prior art: old
gates 20/50 "never fired in 16 long runs" — this census re-tests
the lowered 12/25 gates on a fresh band.)

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked
2026-11-11: no open line names fans/audience first numbers; the
closest lines are about contests/shows generally, not this
census.) Any fans gap this arm surfaces is APPENDED as [open] in
the evidence file's findings section and in sim-findings.md, not
claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the fan verbs exist and are wired — apAdjustFavor
   is called from contest ends, show ends, fights and sigW5;
   apDailyTick runs from the endDay wrapper every day (eligibility
   inside: systemArrived + wave ≥2); apCarePackage is called
   from apDailyTick (25% roll), _showEnd WIN and _contestEnd;
   apClubBoon/apFeedMessage run from apDailyTick; audience trials
   are offered from checkStruggle + the post-40 encore. The pilot
   will confirm live counts in the corpus, not assume them.
   `apContestInterference`'s favor lean is verdict-only by
   construction (the forPlayer path skips it) — expected rare-or-
   zero favor effect under competent; proven live in the fixture
   by direct calls and marked dead-under-competent if the pilot
   never fires it.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every apAdjustFavor
   call, every apCarePackage/apClubBoon/apFeedMessage attempt,
   every audience-trial offer, every contest-interference call,
   every viewership read, every fan/audience say line on the
   band. The engagement floor (GO table) is set from the pool's
   nature: if the band produces <5 favor events total, the census
   is uninterpretable, not a GO.
3. **Verb existence**: apState, apFavor, apFanLane, apTopLane,
   apClubName, apAdjustFavor, apSyncFavor, apCarePackage,
   apWackyGift, apGrantItem, apPackageClubLine, apClubBoon,
   apFeedMessage, apDailyTick, apPersonaPackage,
   apContestInterference, offerAudienceTrial, completeTrial,
   checkStruggle, havenViewership, viewershipBoard, _cxFanLane
   all exist in the engine (citations above). The policy plays
   contests and shows (competent enters TV), which is what feeds
   the clubs — that asymmetry (what the audience does vs what
   the policy does on camera) IS one of the first numbers.
4. **Horizon fit**: 150d covers the full village life (sibling
   pilots' median survival 116–140d); fans are a whole-life
   question (favor accumulates across shows, trials recur
   post-40, viewership is a season-long arc). Same horizon as
   the siblings for comparability.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of fans /
audience in a lived village** — every favor move classified by
lane + why; every care-package attempt classified by outcome;
every club-boon attempt classified; every feed attempt
classified; every audience trial classified by offer/completion/
expiry; every contest-interference call classified; viewership
trajectory captured; every metric in the list below counted or
explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every apAdjustFavor call classified by lane + why, none 'unclassified' | 0 unclassified favor events across the pilot (lane in fight/survival/social/showbiz, why non-empty) |
| Every apCarePackage attempt classified by outcome, none 'unclassified' | 0 unclassified package attempts (sent / gate-blocked / cooldown-blocked / roll-blocked / show-win direct) |
| Every apClubBoon attempt classified by outcome, none 'unclassified' | 0 unclassified boon attempts (fired + type / gate-blocked / cooldown-blocked / roll-blocked) |
| Every apFeedMessage attempt classified, none 'unclassified' | 0 unclassified feed attempts (fired + favor band / cooldown-blocked / roll-blocked) |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | ≥5 favor events band-wide, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Favor flow: apAdjustFavor events by lane (fight/survival/
   social/showbiz), by why-class (contest-win, show, highlight,
   fight-outcome, death-reel, sigW5, other), n distribution;
   per-lane max ever, days each lane spends ≥12 / ≥20 / ≥25;
   drift events (apDailyTick −1/3d moves); end-of-run clubs.
2. Care packages: apCarePackage attempts by outcome (sent,
   gate <12, cooldown <4d, roll >25% — the roll-block is
   inferred from apDailyTick calls where the 25% roll fails,
   counted as roll-blocked, never invented); gifts by id/tier
   (apWackyGift), vault-shy count; snack kcal totals; club
   credit line shown vs not (lane ≥20 at send); packages from
   _showEnd/_contestEnd direct calls vs the daily tick.
3. Club boons: apClubBoon attempts by outcome; fires by top
   lane (fight +10 health / survival +300 pantry / social +1
   unity / showbiz curio); gate-blocked (lane <25) vs
   cooldown-blocked vs roll-blocked.
4. The feed: apFeedMessage attempts by outcome; fires by favor
   band (≥25 growing / ≤−30 restless / else watching) and by
   per-lane 25+ line eligibility; sysSay fan lines in the
   corpus, classified.
5. Audience trials: offerAudienceTrial offers by reason
   (struggle / audience / milestone) and task id (haul_small /
   haul / identify); completeTrial completions; expiries
   (window closed unplayed); trial state at end; integration
   gained from trials.
6. Contest interference: apContestInterference calls, winMod
   from favor (and its sign), deathSave, notes; how often fan
   favor bends a verdict vs how often it is verdict-only
   fiction (forPlayer path).
7. Viewership: havenViewership trajectory (daily snapshot) —
   start, max, end, days ≥40 (the SCALE provisional bar), days
   ≥25; recordMoment/arena/stunt spikes vs the drift floor of
   12; viewershipBoard rows at end.
8. Named fans (the canon check): named fan personas appearing
   anywhere — say corpus search for fan names (any proper noun
   attached to "fan"/"viewer" lines), state search for a fan
   roster/pool/draw; signed care-package notes (any note naming
   a fan); fan arcs (any per-fan feeling state). Expected zero;
   a zero here is a measured zero (corpus + state searched),
   not an assumption.
9. Say-line coherence: every fan/audience say line in the
   corpus classified (package line vs club named and its lane
   value, feed line vs favor band at fire, boon line vs boon
   type, trial line vs trial offered); any line whose number
   contradicts the live state it describes; repeated lines
   (same line, how many days running).
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail
  max). Why 150d: fans are a whole-life question (favor
  accumulates across a season of shows, trials recur post-40,
  viewership is a season-long arc); sibling first-numbers pilots
  ran 150d with median survival 116–140d, so 150d captures the
  full village life without ticking dead villages. Same horizon
  as the siblings for comparability.
- **Seeds: 190371–190378 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190371–
    190378: zero hits.
  - Searched ALL dated evidence `.md` (full evidence/ tree,
    word-boundary ripgrep): zero hits for all eight seeds.
  - Searched the 2026-11-11 summary `.json` files
    (word-boundary): zero hits.
  - No perseed directory names any seed 190371–190378 (listing
    of evidence/2026-11-11 checked).
  - Known used 19xxxx bands: 190211–190218 (trustfirst-a),
    190221–190228 (abilityfirst-a), 190301–190308 (vetfirst-b),
    190321–190328 (titanfirst-a), 191702, 199585 — none overlap.
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked).
  - NOT completed: the full-tree grep over ALL dated evidence
    `.json` (the corpus holds multi-MB per-seed JSONs; the
    abilityfirst arm hit the same wall at 100s+ with no hit
    returned). Recorded honestly: a stray `"totalDraws":
    19037x`-style numeric coincidence inside a per-seed JSON
    cannot be excluded by this search — the band is fresh as a
    SEED naming, which is what the skill guards. Search scope
    recorded so a later reader can retrace it.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON
    (the judged leg). No COMPETENT_TALK, no other env gate —
    default competent is the measurement substrate.
  - **neutral:** control policy, instrument OFF (no wraps, no
    snapshots; end-of-run wall numbers + days + end pantry kcal
    + deaths only), same seeds — must match the instrumented
    control leg exactly on days + end pantry kcal + death count
    (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/fansfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- apAdjustFavor: every call — n, why, lane, clubs before/after,
  apFavor before/after.
- apCarePackage: every call — favor at call, returned, gift id
  + tier (via apWackyGift wrap), snack kcal (via state diff),
  club line (via apPackageClubLine read), caller context
  (daily-tick vs show-win vs contest-end, from a flag set by
  the calling wrapper — the daily tick's 25% roll is recorded
  on the apDailyTick wrap, so a roll-block is counted, not
  inferred from silence).
- apWackyGift: every call — tier, returned id/null (vault-shy).
- apGrantItem: every call — itemId, and whether it was issued
  inside a fan package/boon (context flag) vs a persona package
  vs other.
- apPackageClubLine: every call — returned string, top lane,
  top lane value.
- apClubBoon: every call — returned, top lane + value, boon
  type (from the say lines fired during the call + state diff:
  health / pantry / unity / gift).
- apFeedMessage: every call — returned, favor at call, lane
  values at call.
- apDailyTick: every call — eligible or not (apEligible),
  drift diff (clubs before/after on %3 days), the 25% package
  roll outcome (roll-blocked vs called), boon/feed/dead-drop
  outcomes as observed through their own wraps.
- apPersonaPackage: every call — returned, persona id if any
  (separate class: meddler packages, never counted as fan
  packages).
- apContestInterference: every call — forPlayer, winMod,
  deathSave, note, favor at call.
- offerAudienceTrial: every call — reason, task id/text,
  expires.
- completeTrial: every call — task id, integration before/
  after.
- checkStruggle: every call — offered or not (via the trial
  offer wrap), day, strong/fed reads.
- say + sysSay: fan-regex lines only (fan|audience|care
  package|favor|viewer|showbiz|moot crowd|fight fans|survival
  fans|the crowd|cheer|boo|📦|◈ AUDIENCE TRIAL, uncapped up to
  a 5000-line cap with a dropped counter), day + seq + source
  (say vs sysSay) — the sense corpus and the line-repetition
  census. BOTH are wrapped, and that is correct in node, not a
  double-count: the harness stubs say and sysSay as SEPARATE
  no-ops (sim-harness.js:242-243, narration off), so a sysSay
  line never reaches say in a node sim. In the browser sysSay
  routes through say (game.js:37082) — but this instrument never
  runs in the browser. Say-only capture would lose every feed
  and favor-announce line in the pilot (the abilityfirst
  "sysSay blind spot" is real under the harness, not in the
  browser).
- tele cross-check: no fan/favor tele type is known to exist
  (no tele('fan…') / tele('favor…') call found in alienPlayers.js
  or contests.js) — the instrument records every tele call's
  type on fan-adjacent paths if present, and the proof asserts
  the absence honestly rather than inventing a cross-check.
- Daily snapshot: fanClubs {fight, survival, social, showbiz},
  apFavor, topLane, lastPackageDay, lastBoonDay, lastFeedDay,
  havenViewership, contestsHeld, trial state (progState trial),
  pantry kcal, roster size, standing, scaleRank, nationalLive,
  wave.
Driver: scripts/fansfirst-driver-20261111.js (mirrors
titanfirst-driver; Game.say + Game.sysSay wrap with the fan
regex for the sense corpus, 300 lines/seed cap — same
early-game-only caveat as the siblings). Analyzer:
scripts/fansfirst-analyze-20261111.js (classifiers for favor
events by why, package/boon/feed attempts by outcome, say
lines by class, snapshot reconciliation for favor). Proof:
scripts/test-fansfirst-a.js (each wrap proven live on a fixture
or miniature; RED checks on the pre-fix instrument where a wrap
is dead by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-trustfirst-a,
sim-abilityfirst-a, sim-titanfirst-a, sim-relayfirst-a). The
control/neutral legs are the neutrality proof, not a panel. Panel
context: **no panel metric for fans, favor, care packages, boons,
trials, or viewership** (coverage audit §4) — this arm supplies
its first-numbers analogue (Metrics 1–9).

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (abilityfirst-a: median survival 116d, 1/8 survived,
630 deaths over 851 village-days; titanfirst-a/relayfirst-a
similar). If the instrument changes any numeric field vs the
recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
