# Journey succession r133 — Lane B, leg 7 (succession): the successor is NOT socially frozen — the village is saturated, newcomers are the bond supply

Leg 7 (succession). Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout, verified by re-read after landing.
Base master b4a7c9fcb. Run number r133 follows r132 (social life,
same day); the rotation file, not the number, is the authority.

## Run setup — lock, slow registration, stale slug, heartbeat lesson

- No lock at run start. Fresh lock written (run_id 2026-11-05T00:58:40Z).
- Pre-flight: main tree clean, disk 29%. Reap ran clean except the
  standing sibling noise (other lanes' dirty trees, never touched).
- Registration: the plain body slug journey2-succession is
  stale-registered (status done-merged, Oct 30) AND its directory is
  an orphaned 4.5G non-git copy (no .git file — release removed the
  worktree pointer but left the files). The register script refuses
  an already-registered slug, so this run used the run-suffixed slug
  journey2-succession-r133, the same deviation prior runs used when
  the plain slug was blocked (crisis r122/r126). The orphan dir was
  NOT deleted: it may hold unique evidence, and deleting another
  run's leftovers unverified risks data loss. It needs a main-session
  disposition (inspect, then release or preserve), not a loop-run
  deletion. Checkout took ~6 min under sibling load (not killed,
  not retried).
- Heartbeat: first heartbeat landed promptly after registration
  (01:05Z), but the nohup loop died after its 01:15Z tick (its pid
  was gone by 01:33Z — a loop spawned from a finished exec session
  does not survive), and the registry lock queue under sibling load
  (register/reap/check processes from other lanes) delayed the next
  tick past the 15-minute line (stale 01:15Z → 01:32Z). Recovery:
  manual heartbeat queued on the lock + a new setsid/detached loop
  (sleep 300) started; both land when the lock drains. Lesson for
  the next run: spawn heartbeat loops detached (setsid) and verify
  the pid survives the spawning exec — a loop that dies silently
  is exactly how a live run looks dead.

## Pre-registration (binding, written before any scored seed)

Prereg: evidence/2026-11-04/journey-succession-r133-prereg.md (+
amendment #1, instrument fix only, before the panel).
Question carried from r123: successors form 0 new bonds in 14/30 days
while non-successors form 8/9/2 — is that opportunity (nobody new
ever comes to the bearer) or capacity (bearer cannot bond with
strangers)? Instrument = r127 driver + 2 declared additions:
TALKREQ-DAILY (v.talkRequests snapshot + bond-key diff per day,
split bearer vs NPC-NPC) and STRANGER-PROBE (one driven convo at
d+3 with the highest-trust living villager unbonded at relPost).
Pilot seeds 33401–33404 (fresh band, verified clean), reserves
33405–33406, POST_DAYS=70, EARLY_KILL_DAY=40, no forced kills.
Smoke seed 33499 (EARLY_KILL_DAY=5, POST_DAYS=10) proved both
instruments before the panel and caught the self-request misread
(see amendment #1): a request filed by the successor-to-be before
the handoff survives under the bearer's own id. The driver now
classes who === self separately (bondedToBearer null, not false).

## Binding verdict: CAP = INSUFFICIENT-DATA (not a fail, not a pass)

- CAP bar: stranger-probe bond by relEnd on >= 3 of 4 pilot seeds,
  counting only seeds where the probe opened AND the same bearer
  held to relEnd. Result: ZERO eligible seeds out of 6 run
  (4 pilot + 2 reserves, per the prereg's reserve rule, then stop).
  - 4/6 seeds had NO stranger pool at d+3 (33401, 33403, 33404,
    33405): the successor was already bonded to every living
    villager at relPost. The probe could not run — not a refusal,
    not a capacity miss.
  - 2/6 seeds had a probe that opened (33402 Jesse, trust 24,
    want curious; 33406 Yuki, trust 14, want none) — but both
    bearers died again before relEnd (second handoff), so neither
    counts under the prereg's same-bearer rule.
  - Per §14 the bar is NOT re-scored against a friendlier metric
    mid-run. The verdict is INSUFFICIENT-DATA, and the metric
    review below proposes the d+14 judgment for the NEXT run.
  - Descriptively (not scored): the 33402 probe pair DID bond —
    Gabriel↔Jesse appears in bondDaily at d+4, the day after the
    probe conversation, and is present at relD14 and relD30
    (Gabriel died later, so relEnd attribution breaks, but the
    bond itself is dated). The 33406 pair did NOT bond by d+14
    (warm language-barrier conversation at trust 6, want none;
    Vito died d51). Capacity evidence is therefore 1/2 at d+14,
    with the miss confounded by very low trust and no want —
    reported, not verdictized.

## The mechanism answer (OPP, descriptive): saturation + newcomers

Corrected first-bearer counts (the analyzer's bondDaily uses the
CURRENT bearer each day, so chained seeds mix bearers — the counts
below re-attribute each bondDaily entry to the bearer named in
that day's talkreqDaily entry; the one misattribution found and
removed is 33403's Aria↔Malachy bond, which belongs to second
bearer Aria, not first successor Oliver):

- Talk requests to the bearer, d+0..d+30, distinct (self excluded):
  24 total across 6 seeds, of which UNBONDED = 1. The single
  unbonded requester is Valeria on 33402 (filed d61, a newcomer
  who sought the bearer out unprompted — NPC-initiated stranger
  opportunity exists, but it is rare: 1 in 6 seeds' windows).
  Every other requester was already bonded to the bearer.
- Bearer new bonds, first bearer only, d+0..d+30: 6 total
  (33401: 1, 33402: 1, 33403: 0, 33404: 0, 33405: 4, 33406: 0),
  vs NPC-NPC new bonds 87 in the same windows. The autonomous
  bonding engine runs daily (median 0–1 NPC-NPC bonds/day);
  the bearer is not excluded from it.
- THE DECISIVE CHECK: every first-bearer new-bond partner was NOT
  living at relPost (Aroha, Jesse, Valeria, Farid, Meera, Nikos,
  Morgan, Raj, Amine, Dale — all absent from relPost's living
  roster). Every one is a newcomer who arrived after the handoff.
  And the driver NEVER conversed with Aroha, Farid, Meera,
  Morgan, Raj, Amine, or Dale — yet bonds with the bearer formed,
  including on days with no driven conversation at all
  (Eamon↔Aroha d+11; LaToya↔Nikos d+24; LaToya↔Morgan d+26).
  The game's stated bond path (party-bond.js: bonds built by
  meals/visits/feasts) is doing this work, not driven dialogue.
- REFRAMING of r123: "0 new bonds in 14/30 days" was measured in
  villages where the successor was already bonded to everyone
  alive and no newcomers arrived in-window. The successor is not
  socially frozen and villagers do not shun the bearer: when new
  people arrive, the bearer bonds with them through ordinary
  village life, with or without a driven conversation. The
  carried design question (should villagers strike up bonds with
  the bearer on their own?) is answered in the negative direction
  by mechanism, not by preference: they already do — through
  shared life with newcomers — and the old village offers no
  strangers left to bond with. A player who wants new bonds as
  bearer should seek out newcomers (joiners, visitors), not
  re-talk old friends: the driver talking to top-2-by-trust
  familiars for 70 days is the wrong instrument for new bonds,
  and r123's zero is what that instrument measures.
- Self-requests recur (panel: 33401, 33403, one day-entry each,
  plus smoke 33499): a pre-handoff request from the
  successor-to-be survives as a self-addressed request. Fixed
  this run (below); panel observations are pre-fix, honestly so.

## Blank filled: self-talk-request purge (src/js change + proof)

Fix: src/js/ledger.js playerDeath, beside the shelter-flag reset
(the same stale-NPC-state class, with its own prior self-talk
case): delete v.talkRequests[newId] at handoff. Only the
successor's own entry clears; every other villager's request
survives. Rationale, verified in code: talkRequestNear lights the
Talk badge for any undelivered request within distance 3, and a
self-request sits at distance 0 — the badge pings about yourself
until expireTalkRequests prunes it (~3 days). Small, transient,
real.
Proof: scripts/test-journey-succession-r133-selftalk.js — self
case + control child case, 9/9 PASS (successor's own request
purged, other's survives; control proves no blanket clear).
No other src/js change this run. [needs-eyes] is NOT attached:
this is a quiet badge/litter fix, not a feel change Steve needs
to playtest — but it is flagged here in plain words.

## Carried bars (reported, not scored)

- Pick-time rank == 1 on 6/6 handoffs (r123 bar holds).
- Funeral INCALL beat present on 6/6 leg deaths (r127 bar holds).
- No regression signal on either carried bar.

## People check (sense, not counts) — PASS

Read in full: both stranger-probe transcripts + one d+14
successor transcript (33405 Renee).
- Jesse (33402): grief by name ("Camila always took the burnt
  piece... I take it now"), invite refused with character and a
  planted condition ("I don't know you well enough for that. Ask
  me again when we've survived something together"), ending
  resolves ("Good talk. I feel like I know you a little better
  now") — and a bond follows the next day. No fabricated shared
  history: Jesse correctly treats the new bearer as a stranger.
- Yuki (33406): language-barrier conversation works as people —
  nonverbal exchanges, one English word ("Food?"), gentle
  correction ("Hm. Almost... Again."), warmth, ending "This was
  good." No bond by d+14 at trust 6 with no want — a warm single
  conversation is not a bond by itself, noted not judged.
- Renee (33405 d+14): resumes honestly ("we wandered off it, 7
  days back"), real want (mother taken at the Scattering), a
  found-thing outing that plays out, role promise with consent
  ("Roles. Not ranks — promises."), ending resolves. One line
  references Nikos "taken — Pattern Hunger, on the screens";
  this instrument cannot audit show events, so it is noted as
  unverified, NOT claimed as fabricated (same honesty rule as
  r123's wrinkle (b)).

## Verdicts for the leg

- REACHABLE: yes — succession fires on every seed (3 organic,
  4 organic, 2 scripted-after-40d in this panel), the pick is sound, the
  funeral arc fires, and the new bearer's social life continues
  through newcomers. A real player reaches this content by
  surviving to a death, which is the ordinary game.
- FUN: yes, with the standing caveat — the successor's second
  life is scholarly and social through newcomers, but a village
  with no arrivals offers no new faces to befriend; that is a
  property of a small saturated village, not a broken system.
- WINNABLE: unchanged by this run (no gate, price, or power
  changed; the fix is badge hygiene). The winnability chain is
  untouched, as ordered.

## Metric review (§14)

- CAP-as-written (bond by relEnd, same bearer) is the wrong
  instrument for this mortality regime: 5 of 6 seeds had a second
  handoff inside 70 days, so relEnd almost never belongs to the
  probe bearer. Proposed revision for the NEXT run (not applied
  here): judge probe bonds at relD14 (first-bearer window, dated
  snapshots exist) with relD30 as confirmation, and count
  no-stranger-pool seeds as a finding about saturation, not as
  denominator failures. The prereg's reserve rule worked as
  written (reserves used once each, then stop).
- The analyzer's bondDaily "bearer" attribution must record the
  bearer id per day (it currently uses the current villagerId
  implicitly): on chained seeds it mixes first and later bearers.
  This run's OPP numbers were re-attributed by hand from
  talkreqDaily bearer names; the next run's analyzer should
  carry bearerId in bondDaily itself.
- r123's bond counts are NOT re-scored here; r133 scores only
  the new decomposition (CAP + OPP), per its prereg.

## Telemetry deviation check (step 14) — 2 LOUD lines, both EXPLAINED, baseline NOT rolled forward

Command: node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-04/journey-succession-r133-tele-3340*.json'
--metrics deaths.bearer,census.alive,census.fallen,
census.integrationStage,week2.deadBearerMentions.
- LOUD: deaths.bearer 420%: baseline 5 -> current 26 (n=6 files).
- LOUD: census.fallen swung 660%: baseline 10 -> current 76.
- No LOUD on census.alive, census.integrationStage,
  week2.deadBearerMentions.
Verdict — aggregation-unit mismatch, not a game deviation: the
tool SUMS across files, so "current" is a 6-seed sum while the
baseline (5 / 10) is single-seed scale. Per-seed values are in
line: deaths.bearer 7, 9, 4, 1, 2, 3 (mean 4.3 vs baseline 5;
the 7 and 9 are the chain-heavy seeds over the 70-day window,
expected); census.fallen 18, 16, 13, 4, 17, 8 (mean 12.7 vs
baseline 10; fallen accumulates with chain deaths over 70 days).
Rolling the baseline forward would bake a 6-seed sum in as the
new baseline and corrupt the next comparison, so the baseline
is deliberately NOT updated this run. The next run should
either compare per-seed means or re-baseline from a stated
panel size, and say which.

## Files

- Prereg: evidence/2026-11-04/journey-succession-r133-prereg.md
- Driver: scripts/journey-succession-r133-20261104.js (r127 +
  TALKREQ-DAILY + STRANGER-PROBE + smoke fixes, instrument only)
- Analyzer: scripts/analyze-journey-succession-r133-20261104.js
  + evidence/2026-11-04/journey-succession-r133-analysis.txt
- Panel records: evidence/2026-11-04/journey-succession-r133-{33401..33406,33499}.{stdout.json,stderr.log,saydump.txt,tele-*.json}
  + transcripts journey-succession-r133-transcript-*.txt
- Fix: src/js/ledger.js (self-talk-request purge)
- Proof: scripts/test-journey-succession-r133-selftalk.js (9/9)
- Smoke: seed 33499 (not scored; instrument proving only)
