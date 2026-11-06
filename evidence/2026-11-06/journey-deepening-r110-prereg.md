# Journey leg: DEEPENING (days 40–80) R110 — "BONDS INITIATE IN THE WILD NOW? + R109'S ANALYZER FIXES, PROVEN" — 2026-11-06

## Pre-registration (written BEFORE any seed runs; no game-code fix pre-registered)

Rotation read 2 (deepening) at run start; r110 plays deepening, writes 2->3
at closeout WITH verified write + retry (r106/r107/r108/r109 rotation note:
verified-by-read-back writes stick; silent ones intermittently don't).
Closeout re-verifies the lock is still this run's and the rotation still
reads 2 before touching either (2026-11-06 AGENTS.md lesson: a later run
may already have moved them).
Base: master 05ad9ff56 at worktree creation (worktree registered at
26f11200a, fast-forwarded to 05ad9ff56 before any work — a sibling Loop A
winnability commit landed between pull and registration; both commits are
evidence-only, zero src/js changes).
Policy: competent (r109 driver lineage, VERBATIM except the two
pre-registered instrument additions below — bond telemetry capture +
villageDebrief/trigger capture; CONVO_DAYS [45, 60, 80], DAYCAP=100,
death-aware stop).
Seeds: fresh 95201–95204. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 95200 (outside the main band) x DAYCAP=45 proves the r110
driver before the main run; smoke outputs deleted after the check.

Freshness check for 95201–95204 + smoke 95200 (full check per the
2026-11-05 AGENTS.md lesson + local_seed_band_freshness skill — ALL dated
preregs + all dated .md + evidence filenames + forbidden-band lists, not
just today's files): COMPLETED before the panel ran. Word-boundary .md
mentions of 95201–95204 across evidence/ + docs/: 0. Filename hits for
9520*: none. Boundary-aware seed-context patterns (`"seed": 9520x` /
`seed=9520x` / `SEEDS=…9520x` / `s9520x` across evidence/ + scripts/ +
docs/): 0 hits. Rejected bands on the way here, all named in dated
preregs (a used band is not fresh even with no corpus behind it in this
leg): 92501–92504 (four-digit 9250–9265 used 2026-10-23 depinteraction/
easingchannels — the five-digit band itself is clean by the boundary
check, but the four-digit collision would confuse every future grep, so
it is rejected on clarity, not on use), 93001–93004 (deepening r87,
2026-11-02), 93201–93204 (r89), 93401–93404 (r91), 93501–93504 (r92),
93601–93604 (r93), 93701–93704 (r94), 94801–94808 (food-awayration),
94901–94916 (awayvoice), 95001–95008 (ragerepress, today), 95101–95116
(cookbulk), 92801–92816 (storageshed), 96001–96008 (awayvoice reproof),
92701–92704 (scale r103, today). 952xx is absent from the tendbelow
forbidden list (99001–99008, 99009–99024, 99041–99052, 99101, 99201–99216,
99217–99232, 99401–99412, 99601–99612, 99701–99708, 99801–99808,
98701–98716, 89701–89707, 83601–83800, 16101–16116, 99901–99912).
Band 95201–95204 + smoke 95200 verified fresh.

## Rotation note (6th sighting — the rotation is STUCK at 2)

r107, r108, and r109 all read 2 and each wrote 2->3 at closeout, verified
by read-back. This run again reads 2. The file's mtime at this run's
start is 2026-11-06T22:10:23Z with value 2 — a write happened at 22:10Z,
after r109's 18:38Z closeout. The lock this run recovered was created
22:08:05Z by a run that died before registering any worktree (no registry
entry, no heartbeat — stale-lock recovery, lock deleted, this run's lock
created 22:44:22Z). That dead run cannot have closed out at 22:10Z (two
minutes in), so the 22:10Z write of "2" has no known writer in this
lane's closeout path — the discrepancy is now a loop-health item, not a
one-off: three consecutive deepening runs read 2 despite verified 2->3
writes, and the other legs (landing, establishment, scale) have not been
played by this lane since the stuck value appeared. This run plays
deepening per the file AND per r109's handoff (the r110 work is
deepening work), so no queue-jump is needed — but the stuck rotation is
flagged for the main session, not chased here: no script in scripts/ or
docs/ writes the rotation file (r106's grep), and this run's closeout
write + read-back is the same instrument as r107–r109's.

## The question (V-INIT-BOND-TELEMETRY, primary — the merged code, in the wild)

r109 measured V-INIT-BOND 0/9 sittings and reported "build-bond-initiate
is still NOT merged (branch exists, no merge commit)". That is now
STALE: bond-initiation merged 2026-11-06 19:01Z (commit 5ba7f167f,
amendment 5, GO on amended bars). Its own panels (seeds 84101–84108,
competent, 90d) show proposals on 8/8 seeds, ~40% accepted, 106–108
link raises — but those panels ran the build's own driver, and this
lane's sitting-only scan cannot see the bulk of the mechanism (visits,
daily pair tick — only the talk-request route reaches a sitting). This
run installs the build's own instrument
(scripts/bond-initiation-instrument-20261105.js: wraps proposeBond,
npcInviteDecision kind 'bond', the scholar-proposal resolvers,
proposeLink, and tele('bond_proposed', ...) events; daily bond
snapshots; RNG-neutral call-through wraps) into the r109 driver and
measures the mechanism where it lives, across the whole sim, not only
in sittings.

- **Verdict**: PRESENT iff >=1 `bond_proposed` tele event fires across
  the 4-seed panel. The build's panels suggest ~6 proposals/seed over
  90 days; the deepening leg's villages die earlier and its sittings
  consume day-parts, so the per-seed rate is reported against that
  expectation, not judged by it. The verdict is only whether the merged
  code reaches the wild on this leg at all.
- **INTERESTING** if 0 events (the merged code does not reach this
  leg's conditions — warmth window, visits, pair tick — and the next
  question is which gate holds it shut) OR if events fire but 0 reach
  the scholar (the NPC→NPC half works, the player-facing talk-request
  half never surfaces in sittings) OR if the accept rate differs
  sharply from the build's ~40%.
- Reported per seed: tele events (initiator, target, kind, outcome,
  chance), scholar-targeted events, proposal/decision counts, accept
  rate, link raises, `proposed`-marked bonds at seed end, staged
  bondRequests/linkRaises, instrument errors (any error is a finding,
  not a skip). The sitting-based V-INIT scan is carried unchanged as
  the scholar-facing half.

## Secondary (P-KEEP-FIX — r109's specified regex fix, proven then panelled)

r109's metric review specified the fix exactly: drop bare "forgot" from
PROMISE_MENTION (keep "forget it" — the repay dismissal — and the
REPAY_OPENER vocabulary, which covers every genuine return). The r109
panel's only NAMED was the false positive: Onni (92908 day 45 -> 80),
"The outsider so long I forgot what inside feels like" — a belonging
musing that names no promise. This run builds the fix into the r110
analyzer and proves it BEFORE the panel: Onni's day-80 lines (verbatim
from the r109 transcript) must score SILENT; the genuine repay lines
(Quinton r106 "You came through on the food I needed. I won't forget
it.", Milo r106 "You said you'd help with the pantry run. ...It's done
now. Forget it.", Colin r108 "You came through on the sickness I'm
fighting. I won't forget it.") must still score NAMED. The panel then
re-judges P-KEEP with the fixed metric (same verdict rule: NAMED >= 1
among revisited-alive -> PRESENT). The r109 panel is NOT re-scored:
Onni stands NAMED as computed.

## Secondary (RE-ASK-FIX — all four variants, orphans split)

r109's metric review specified: REASK_OPENER covers all four re-ask
variants (convo-wants.js:1962–1967, verified in source), and
RE-ASK-ORPHAN is reported as "origin outside the panel window" (a
fromSeed favor predates convo days) rather than "a re-ask without a
thread". Grace's day-60 variant 3 ("About the food I needed — I hate
to ask twice, but it's still open. Will you?") is the proof-test
positive: the r109 scan missed it entirely. The fix is proven BEFORE
the panel (all four variants ground in convo-wants.js; Grace-class pair
scores RE-ASK; a fromSeed orphan is tagged origin-outside-panel, a
true no-thread orphan is tagged no-thread). The panel reports RE-ASK
threads and orphans with the split. The r109 panel is NOT re-scored:
RE-ASK stands 0 as computed, with >=1 re-ask sitting disclosed on
content.

## Secondary (DEBRIEF-CAPTURE — r109's instrument proposal, built)

r109's loss-attribution gap: seed 92907's village-lost trigger was
UNATTRIBUTED (the driver records endReason=village-lost without the
debrief), and a base-policy re-run probe DIVERGED on both seeds — the
fix is capturing Game.villageDebrief() inside the driver run. This run
builds it: at seed end the driver captures `Game.villageDebrief()`
lines PLUS the loss-trigger flags read from state
(`state.village.scattered` -> scatter-hunger, `state.village.extinct`
-> extinction, scholar dead at end with neither flag -> scholar-death
(inferred), else unclassified). Verdict: every village-lost seed in
the panel carries an attributed trigger, or the unattributed ones are
named as a live instrument gap. No re-run probe is attempted (r109
proved re-runs diverge).

## Secondary (SURV-CONTROL-4, descriptive — the funnel count)

r107 2/4, r108 3/4, r109 2/4 survived on successive bases. This panel
is the fourth control point on the current base (bond-initiate +
wanderspawn + tableoffer + mootgate landings since r108's base).
Verdict rule as r109's: >=2/4 survive -> funnel unchanged; 0/4 ->
base moved (bisect job, no claim about which change); 1/4 ->
ambiguous. The cause split (fight-heavy vs starvation, pantry at
death, wave reached, loss trigger from the new debrief capture) is
reported exactly as r107–r109 reported it — a cause split, not a
winnability verdict (fresh seeds, small panel).

## Carried context (reported, not re-judged)

- RAJ-PHOTO watch, WIDENED per r109's metric review: the plant scan
  drops the `want: curious` requirement — any sitting whose opener is
  a personal confidence ("Can I tell you something? ... I haven't
  told anyone.") counts, regardless of want id. The betrayal:decline
  + unestablished/none requirements stay (Thabo's candy bar, r109:
  confidence under ask_favor, left without declining — NOT a plant
  under either rule; the widening is proven with a synthetic
  ask_favor + decline case). Thabo-class leavings are reported as
  context, not plants.
- D-THING (r107 closed as a blank; carried as continuity): same scan,
  testable denominator (testable only when a later sitting with the
  same villager exists).
- G-SENSE: all transcripts read in full; senseless sittings counted
  (expectation from r109: 0). Any senseless sitting is read and named,
  not just counted.
- B-SIT / B-FOLLOW / B-LEAD (carried): betrayal sittings, follow-ups,
  and betrayal lead-ins, same scans as r109.
- S-TRACE (carried): standing-trace verdict, same scan as r109.
- FIZZLE-WATCH (carried): dry-line scan, same as r109 (fix held 0/9).
- G-ASSIGN/G-STEER/G-STICK goalSnaps are collected by the driver for
  continuity but NOT scored: the goal question is closed for this
  window.
- All-tracks read (Steve 2026-11-06 11:48 CST, REWARD ALL PATHS): the
  village assessment carries a descriptive all-tracks read (goal-top
  distribution per seed, mapped to tracks). A five-track
  role-formation instrument remains a follow-up job, not built here.
- STANDING CONTEXT (Steve 2026-11-06 11:48 CST): roles differentiate
  by personality; measure by role formation across ALL five tracks,
  not kill counts alone.

## What this run does NOT do

- Does not build a new bond system (V-INIT-BOND). The system is
  merged; this run measures it. Any defect found is reported with
  proof, not fixed here unless it is a one-line analyzer-side error
  with a proof test.
- Does not change succession release, seed priority, or the
  question-first-openings design question (Steve's call, not a tweak).
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.
- Does not touch win prices, deed gates, or any balance number.
- Does not re-score the r109 panel. r109 stands as computed; the
  fixes are proven on fixtures and judged on fresh seeds.

## Metric review (required section in the run note)

No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
