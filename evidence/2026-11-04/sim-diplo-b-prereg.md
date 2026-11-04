# Diplomacy-pipeline pilot diag — Loop B, run fleshout-loop-b-20261104T0730Z, arm sim-diplo-b

Axis: scale-onramp / winnability chain. DIAG-ONLY arm: scripts +
instruments + evidence, ZERO src/js changes. This arm is the named
next blank from the standacc pilot evidence (branch sim-standacc-b,
evidence/2026-11-04/sim-standacc-b.md, read via git show — that
branch is NOT checked out here and is NOT landed by this worker):
on gear-ready seeds, competent villages formed ZERO inter-village
links in 140 days, so diplomacy income is the named missing
income, while the release blocker on the closest seeds is
veterans (living wave-4 killers), not standing. Gates and win
prices stay UNTOUCHED: this arm measures, it does not retune any
door. A named lever candidate for the NEXT run may be proposed,
never implemented here.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. No canon doc covers
  standing / deeds / scale directly: the manifest lists no
  standing doc, and the standacc prereg's docs grep found
  standing only inside code-adjacent docs. That absence is
  stated here instead of inventing canon: the standing rule
  below is read from code, not from a canon doc.
- docs/SIMULATING.md read (policies table, compare-never-eyeball,
  pits). Note from that table, material to this question:
  plain `competent` is the legacy baseline and the leadcourt
  header states plain `competent` "contains zero scale code by
  design (it stays pinned as the scale-free baseline)" — so a
  zero-proposal result under competent is a hypothesis to
  CHECK against the code, not a surprise to report bare.
- docs/MEASUREMENT-PLAN.md consulted; the staged method below
  applies its rules as the loop brief encodes them (pilot gate,
  death-aware horizon, pre-registration, metric binding,
  balanced panel where a comparison exists).
- docs/MAP.md consulted for the travel stage only: other
  villages carry board coordinates (x, y) in state.otherVillages
  (villageAgency.js: splinter villages are placed at a parent
  village's tile +1 in x), so "travel to another village" is
  measurable as the scholar standing on an other-village tile.

## Pipeline rule, as found in code (current anchor, not taken on faith)

From src/js/hierarchy.js (linking) and src/js/membership.js
(alliance) and src/js/standing.js (scoring):

- A link is formed ONLY by a played proposal verb: proposeLink
  (primary/subordinate), proposeCovenant / proposeTrade (peer
  links, via _proposePeer), or proposeAlliance (an understanding
  sealed with a feast — NOT a link, membership.js header).
  In game code the ONLY callers of the propose verbs are
  app.js UI buttons (DOM, excluded from the node harness);
  no engine path auto-forms a link, and no villager-agency
  path proposes. A sim policy proposes only if the policy
  file itself calls the verb (leadcourt, fourthlink,
  belongseek, killroad do; competent does NOT — a grep of
  scripts/policies/competent.js finds zero propose /
  knowsVillage / otherVillages references).
- proposeLink / _proposePeer are knowledge-gated: they refuse
  villages the player never heard of or visited
  (knowsVillage, knower-traced since 2026-10-29: a lore entry,
  a generated village, or a delivered village rumor).
- Peer proposals additionally require opinion 10+ before the
  binding is even proposed (a prerequisite refusal, no -5).
- judgeLink scores the courtship: base 38 + representative
  standing/2 (cap 20) + opinion/2 + ally 15 + stronger-village
  or subordinate terms + tribute generosity (subordinate,
  tribute >= 3000, opinion >= 5: +8) + R()*20-10. Score >= 55
  accepts; 35-54 counters with the village's own terms
  (played: accept / sweeten / walk away via pendingCounter);
  < 35 declines (cold re-ask costs -5 each time; decline
  banks courtshipDeclined, climb verbs land +1 harder 28d).
- Courtship verbs that move opinion (hierarchy.js header):
  studying a village's codex (+3, once), deeds the region
  hears (+2 per contest win), time (+1/week toward 0 for
  unlinked villages). Joining a village is LEAVING Haven,
  not a climb verb.
- A formed link counts toward standing ONLY when seasoned
  (30+ days old AND trust 40+; conquered links need the
  season, not the trust) AND regional+ (LEAD: a seasoned
  subordinate link inside Haven's polity; BELONG: Haven
  subordinate inside the primary's polity; LEAGUE: a
  seasoned covenant/trade peer link inside its league
  polity). A lone bond with a splinter village counts
  NOTHING. Standing diplomacy = 34 x seasoned REGIONAL+
  links.
- Travel to another village is NOT a proposal prerequisite
  in code (knowledge can come from a rumor or generation),
  but the climb's named verb "walk to their fire and sit
  with their book" (studyVillageCodex) requires being
  there. Travel is therefore instrumented as its own stage:
  does the scholar ever stand on another village's tile?

## Pipeline stages (the decomposition this pilot judges)

  S0 villages exist: state.otherVillages non-empty at day 1.
  S1 known: knowsVillage(v) true for at least one village.
  S2 courtship currency: opinion >= 10 on at least one known
      village (the peer-proposal prerequisite bar), and
      opinion movement over time (any nonzero opinion).
  S3 travel: the scholar stands on another village's tile
      at least once (tile == ov x,y), and/or studies a
      village codex (studyVillageCodex call).
  S4 proposal attempted: any proposeLink / proposeCovenant /
      proposeTrade call (proposeAlliance counted separately
      — it is not a link).
  S5 proposal outcome: accept / counter / decline / refused
      (knowledge-gated or opinion-gated refusal), read from
      the verb's return value and pendingCounter/pendingAccord
      state, never from a say-line alone.
  S6 link formed: hierarchyState() gains a link (new link id).
  S7 seasoned: a link reaches 30+ days with trust 40+
      (_linkSeasoned true).
  S8 regional+: a seasoned link passes _linkRegionalPlus.

A seed's attribution = the FURTHEST stage reached by ANY
village on that seed, plus the per-village stall counts at
the next stage (e.g. "S1: 4 known villages, best opinion 2
— S2 never reached"). The zero-link outcome is explained
when the furthest stage and its stall counts are named.

## Pre-registration (committed before any judged sim)

- Question: why do competent villages form ZERO
  inter-village links in 140 days? Decompose the pipeline:
  (a) does competent policy ever travel to another village /
  propose / apply at all? (b) if attempts occur, where do
  they stall — travel, proposal, trust threshold, seasoning,
  the polity filter? (c) diagnostic context only: do links
  form under other policies or longer horizons?
- Policy (judged leg): scripts/policies/competent.js
  {competent} VERBATIM (the CURRENT file at this anchor),
  default env.
- Seeds (judged leg): 99301–99308. FRESHNESS CHECK: no
  evidence filename and no dated evidence .md file uses
  any 99301–99308 seed (checked 2026-11-04; the only
  near-miss in the tree is a commit hash, not a seed); the
  standacc band 99101–99108 and its 99201–99208 extension
  band are NOT reused.
- Horizon (judged leg): 140 days, death-aware (dead
  villages stop simulating; +10d tail max as implemented
  by runDays). WHY 140: the standacc class — its median
  survival was 107d, and 140 covers the proposal window
  (leadcourt proposes from day 25), a full 30-day
  seasoning window for any link formed before day 110,
  and the standacc survival distribution, without
  simulating months past every village's death. A village
  alive at 140 is censored, reported as survived, not as
  a win.
- Instrument: scripts only, zero src/js. Daily snapshots
  of: otherVillages (count + per-village id, name, x, y,
  known, opinion, rumored, generated, splinter flag),
  scholar tile vs village tiles (days on a village tile,
  distinct village tiles stood on), travelTo calls and
  their destinations, propose*/studyVillageCodex/tendLink
  calls with returns, pendingCounter/pendingAccord/
  pendingNational state, hierarchy links (total/active/
  seasoned/regional+ via the game's own reads, same as
  standacc), standing breakdown + capped total, scale
  rank, peak, death events, and a capped diplomacy
  say-line sample. The snapshot NEVER calls
  villageStandingTotal() or unlockedWave() (both
  side-effecting); ONE end-of-run unlockedWave() call is
  reported separately (the harness's own end call is
  likewise reported as a harness artifact, never counted
  as a natural door-open).
- PRIMARY METRIC: per-seed pipeline attribution — the
  furthest stage S0–S8 reached, with stall counts at the
  next stage.
- GO THRESHOLD (DIAG-GO): ONE named stall stage accounts
  for the zero-link outcome on at least 6 of 8 judged
  seeds (same furthest stage, with its stall counts
  stated per seed). "Accounts for" means the instrument
  shows the stage reached and the next stage's zero with
  numbers (e.g. 0 propose calls across N known villages,
  or N proposals all declined/countered with their score
  bands). Otherwise DIAG-NO-CANDIDATE with the scattered
  attributions. INSUFFICIENT-DATA only if > 2 judged
  seeds carry instrument errors or record zero
  otherVillages at day 1 (a worldgen failure, not a
  pipeline finding). A miss is NO-GO, never re-scored
  against a friendlier metric mid-run. NOTE the standacc
  denominator lesson, applied here by construction: every
  seed has a furthest stage, so no seed is untraceable
  the way a no-gap seed was untraceable there.
- SECONDARY (reported, not judged): wall numbers every
  run — wins, national / table (scaleRank), wave 4–5
  unlocks (peak transitions) and facing (waveEngaged),
  median survival, wave reach 1–5, Arc reach where
  instrumented (not instrumented by this arm — stated,
  not faked), death-cause shares, ready days.
- SENSE-TEST (SENSE-TESTING LAW): sample say-lines /
  transcripts where link attempts occur, or where travel
  / proposals should occur but don't (known villages with
  opinion movement, days on village tiles, counter
  negotiations); judge whether diplomacy reads as
  consequences of things villagers did, and flag anything
  robotic, static, or repeated.
- BALANCED PANEL (§15): INAPPLICABLE — pure diagnostic,
  no before/after change; no comparison is fabricated and
  none is attached. Stated explicitly, not omitted
  silently.
- TELEMETRY DEVIATION CHECK: the coordinator runs it
  after evidence; noted, not run by this arm.
- CONTEXT LEGS (diagnostic only, NOT judged, NOT pooled
  with the judged leg): (c1) leadcourt policy (competent
  + LEAD courtship: proposes as primary from day 25,
  tends, answers counters) on fresh seeds 99401–99404,
  same 140d horizon — does the pipeline move when a
  policy actually proposes? (c2) competent on fresh
  seeds 99405–99408 with a 180d horizon cap, death-aware
  — does a longer horizon alone move the pipeline?
  Freshness: no evidence filename and no dated evidence
  .md uses any 99401–99408 seed (checked 2026-11-04; the
  single 9940 substring hit in the tree is commit hash
  48994088e, not a seed). Context legs use the same
  instrument; their attributions are reported separately
  and never averaged into the judged GO count.
- HARD LIMITS (binding, honored): no readyDemand, t4/t5,
  or plentyCap change; no win-price/deed-gate change; no
  wild-router ally-join, field-fight, national-standing,
  or veteran-counting code; no Loop B food-economy code;
  no Loop A food-economy claim touched; no propose verb
  added to competent (that would be a lever, not a diag).
  DIAG ONLY.

## Metric review (placeholder — completed in the evidence file, §14)

- The evidence file carries the completed metric review:
  what the metric proved, what it missed, and any revision
  proposed for the NEXT run (never applied in-run).
