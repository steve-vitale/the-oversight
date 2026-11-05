# Bond-initiation build — pre-registration (2026-11-05)

Steve's ruling (2026-11-04 22:32 CST, verbatim): "Yes obviously
villagers should initiate bonds. How many times can I tell you that
they need to act like the player because eventually the player may
inherit that villager they encounter."

## The question

Do villagers initiate bonds on their own — proposing a bond to a
person they have actually perceived, and raising a village link to
the bearer — with acceptance decided by character, never always and
never never?

## Baseline (measured, not assumed)

- Person bonds today form ONLY by accumulation (betrayal.js bondAdd:
  meals/visits/feasts/talk, +6/pair/day cap). No villager ever
  proposes one. There is no propose verb for person bonds anywhere
  in src/js.
- Village links today form ONLY from the player's propose verbs
  (proposeLink/Covenant/Trade/Alliance). The engine contains NO
  villager-agency path that proposes (linkseek-b DIAG-GO, 2026-11-04:
  0 propose verbs on 8/8 seeds; askplus proved asking works, 23/23
  proposals end in a link). Linkseek's named next blank #2 is
  exactly this road: "villager-agency courtship (villagers pursuing
  bonds on their own, through perception)".
- Invitations (Steve 2026-10-27): sometimes taken — one shared
  character decision, npcInviteDecision (betrayal.js), chance
  clamped 5–95.

## The build (what changes, in plain words)

1. **A bond proposal verb** — `Game.proposeBond(initiator, target)`:
   a villager asks a specific person to be their bonded friend
   (stick together, watch each other's backs). The target decides
   by character through npcInviteDecision with a new kind 'bond'
   (same shared decision as party/lure invites: temperament, goal,
   mood, fear, pair relationship, social need; sick target vetoes).
   Accept: the bond jumps (bondAdd 'bond proposed') and the bond
   record is marked `proposed` with proposer + day, so an initiated
   bond is countable separately from accumulation-formed ones.
   Refuse: an honest decline line, no trust penalty, 14-day
   cooldown for that pair. Accept once: never re-proposed.
2. **Perception gate only** — `Game.bondProposalPerceived(initiator,
   target)` must pass before any proposal, from the initiator's OWN
   records only: same fire-group (they started life together), an
   existing bond record (bondAdd fires only on real interaction),
   gossip heard naming the target, or a sensed ally
   (villagerFightAllies: co-tasked/co-located). No roster scan, no
   snapshot, no list feed. A proposal to the scholar surfaces only
   inside a live conversation (the villager is talking to the
   scholar at that moment).
3. **Drive-first** — proposals fire from VISIT arrivals (indoor and
   outdoor, villager-objectives.js), the existing "go find someone
   specific" errand. Eligible only when the villager's `bonds`
   drive is live (vgoalWeights.bonds >= 1 — the goals system already
   gates 'bonds' on the villager trusting someone), the pair is not
   already close (bond warmth < 50), no cooldown, perception
   passes. Propose probability 0.35 when 'bonds' is their top goal,
   0.15 otherwise. The goals system itself is untouched (weights
   only read, no new RNG draws there, no new objective kinds).
4. **NPC → scholar proposals** — a daily tick beside npcInviteTick
   (betrayalDaily): 0–1 villagers with a live bonds drive, trust
   >= 12, not sick, stage a pending bond proposal + talk request.
   Answered in conversation (bond:accept / bond:decline, mirroring
   betrayal:accept/decline): the PLAYER decides. Decline costs -1
   trust, mirroring declineInvite. Accept bonds the pair and marks
   it initiated.
5. **Link raises** — a daily tick: 0–1 villagers with a live
   build_standing drive, personal village lore (their OWN
   villageLoreOf map, >= 1 village), trust >= 20, stage a pending
   link-raise + talk request. In conversation the villager names
   the village they know and asks the bearer to link with it.
   Accept calls the existing proposeLink (the PLAYER's act, the
   existing courtship — hierarchy propose verbs stay player-only
   per Steve 2026-10-26: only the player chooses the village's
   path). Decline: honest line, no penalty.
6. **Telemetry** — `tele('bond_proposed', {initiator, target,
   kind: 'person'|'link', outcome: 'accepted'|'refused'|'raised'|
   'staged', chance})` on every proposal event. Narration only
   when the player is at Haven (no sim spam); refusals and
   acceptances both say something honest.

## What does NOT change

No gate, win price, deed gate, food cost, or six-slot change. No
new objective kinds. No change to the competent policy (the asking
belongs in villager agency, not the baseline — linkseek next-blank
#2 design note). No change to proposeLink/proposeCovenant/
proposeTrade courtship scoring. No list-fed decision anywhere: any
proposal whose perception gate fails at instrument time is a
perception-law violation and fails the run.

## Panel (staged, per MEASUREMENT.md)

- Policy: competent verbatim. Horizon: 90 days, death-aware
  (villages that die stop simulating).
- Seeds: 84101–84108 (8 seeds). FRESHNESS (checked 2026-11-05
  against ALL dated preregs + evidence): no prereg or evidence
  file names any 84101–84108 seed. Adjacent range 84001–84100 is
  a different, earlier screening band (ends at 84100). Rejected
  as used: 99101–99108 (linkseek/gearbar), 99201–99208 (dmground,
  contaminated), 99301–99308 (diplo-b), 99401–99408,
  99501–99508 (askplus), 99601–99612 (approachfire), 99701–99708
  (holdbeat), 99901–99912 (approachconf), 88101–88108 (endgame
  r55).
- Design: baseline (instrument only, zero src/js) vs armed (build)
  on IDENTICAL seeds, paired by seed (§15 balanced panel).
- Pilot FIRST: 3 seeds (84101–84103). If the pilot shows zero
  proposals, tune the drive (probability/gates) and re-pilot —
  the bars below are judged on the full 8-seed panel only, never
  re-scored mid-run.
- Instrument: new scripts/bond-initiation-instrument-20261105.js
  (wraps proposeBond + tele + daily snapshots of bond records
  with `proposed` markers + staged pendings) and
  scripts/bond-initiation-driver-20261105.js (linkseek-driver
  shape). Analyzer: scripts/bond-initiation-analyze-20261105.js.
  Proof: scripts/test-bond-initiation-20261105.js.

## Bars (GO iff ALL pass; a miss is NO-GO, never re-scored)

- M1 INITIATED (person): >= 4 of 8 seeds show >= 1 NPC-initiated
  person-bond proposal (tele bond_proposed, kind person,
  initiator is a villager); pooled proposals >= 8.
- M2 SOMETIMES (person): pooled acceptance rate between 10% and
  90% (requires >= 8 proposals; otherwise INSUFFICIENT-DATA).
- M3 INITIATED BONDS EXIST: pooled bond records carrying the
  `proposed` marker >= 4; and proposals per seed <= 12 (no spam:
  a villager who proposes to everyone is a bug, not a person).
- M4 LINK RAISES: pooled link-raises staged >= 2 (tele
  bond_proposed, kind link, outcome staged/raised). Conversion
  to proposeLink calls is NOT judged on the wild panel — the
  competent policy never holds conversations, so a raise can only
  resolve in real play; conversion is proven in prepared-scene
  tests (conversation-playtest harness) instead, and the run note
  says so plainly.
- M5 NO REGRESSION: accumulation-formed bonds per seed not down
  more than 25% vs baseline on identical seeds; village survival
  (run days) not down more than 10% vs baseline; check.js --quick
  shows no NEW failures (standing profile 279 passed / 11 failed
  is acceptable — cite base and run).
- M6 PERCEPTION: 0 counted proposals with a failed perception
  gate (instrument re-checks bondProposalPerceived from the
  proposer's own records at proposal time). Any failure is a
  perception-law violation: NO-GO with the code cited, not a
  quiet fix.

## Metric review (for the NEXT run, not this one)

- If M1 passes but proposals cluster on one pair type (e.g. only
  fire-group mates), the next run should ask whether the gate is
  too narrow (gossip/co-fight channels never firing).
- If M2 lands near a boundary (10% or 90%), the chance model
  needs a character-spread review, not a centre move.
- The 90d horizon may undercount link-raises (lore accrues
  slowly); if M4 is thin, the next run should try 140d rather
  than lowering the lore bar.

## Tuning amendment 1 (2026-11-05, after armed pilot 1 — BEFORE re-pilot)

- Armed pilot 1 (seeds 84101–84103, 90d, commit 221e23d47): 0 proposals,
  0 link raises, 0 errors on all three seeds. Per the prereg, zero
  proposals at pilot stage means tune the drive and re-pilot; the bars
  (M1–M6) are UNCHANGED.
- Root cause (diagnostic census, seed 84101, 90d): the bonds drive as
  first written read `vgoalWeights.bonds >= 1`, whose gate is
  `trustedAnyone` (the villager's own trust map >= 40). That map is
  NEVER written in wild play — maxTrust 0 across all 90 days, gate
  never opened, `bondProposalMaybe` refused 17/18 VISIT arrivals for
  `no-drive`, `npcBondTick` staged nothing in 90 days. Meanwhile bond
  warmth grows fine (warming pairs 0 -> 26 over the same 90 days).
- New drive (tuned): `bondDriveLive(vid, targetVid)` — live when the
  pair's bond warmth is warming but not yet close, 15 <= v < 50,
  depth < 1. One definition, read by `bondProposalMaybe` (VISIT
  arrivals, flat probability 0.25, replacing the 0.35/0.15 top-goal
  split that could never fire either), `stageBondProposal`, and
  `npcBondTick` (village trust >= 12 bar kept). Link raises UNCHANGED
  (build_standing drive via lore, which accrues; judged separately).
- Proof test updated to the new drive (warmth setup in the prepared
  scene instead of the trust-map setup): 47/47 pass, fingerprint
  identical across two separate processes.
- Note for the record: the dead `trustedAnyone` gate also means the
  villager-goals system's own bonds objective never fires in the wild.
  That is a goals-system finding, NOT this build's to fix — no change
  to villager-goals.js in this build.

## Tuning amendment 2 (2026-11-05, after armed pilot 2 — BEFORE re-pilot)

- Armed pilot 2 (seeds 84101–84103, 90d, commit 5f6cce73a): staging
  WORKS (12/8/7 staged per seed, by several villagers) but nothing
  ever decides — 0 accepted, 0 refused, 0 initiated bonds, 0 link
  raises, 0 errors, 0 gate fails. The counting as written read 24/16/14
  "proposals" (see fix 1). Bars M1–M6 UNCHANGED.
- Fix 1 — analyzer double-count: an expiry is the lifecycle of an
  already-counted ask, not a new ask. 12 staged + 12 expired read as
  24 "proposals", which also broke M3's <=12/seed spam cap by design.
  Now `proposalsPerson` / `linkRaises` exclude outcome 'expired'.
- Fix 2 — succession misattribution: the analyzer used the FINAL
  scholarId, so a stager who later became scholar counted as
  scholar-initiated (84102: 14 of 16; 84103: 14 of 14). The instrument
  now stamps scholarId at event time; the analyzer uses the per-event
  stamp with fallback to the final id.
- Fix 3 — NPC->NPC path never fires: 19 VISIT arrivals in 90 days,
  all `no-drive` for their specific pair; `proposeBond` never called.
  New daily `npcPairBondTick` (gate 0.08, at most one pair a day):
  picks among warming, perceived, not-disliked pairs and proposes —
  decided at once by character, so this is the path that produces
  wild acceptances. The VISIT-arrival path stays as the in-the-moment
  trigger. Scholar-staging gate lowered 0.6 -> 0.25: staging alone ran
  ~12/73d, over M3's <=12/seed cap once pair proposals add in.
- Fix 4 — link raises never fire: `loreAny` 0 across 90 days. Only the
  scholar gains village lore (rumors, approaches, links); villagers
  learn it only via `tellVillageLore`, which nothing in the wild calls.
  New `maybeTellVillageLore` on conversation end: the scholar tells
  the villager about a village they know (told, secondhand, traced to
  the scholar by name; gate 0.3). Silent bookkeeping — the link raise
  is the visible moment. Plus a 14-day re-raise cooldown per
  villager+village (decided or expired), the bond side's spam guard
  mirrored for links.
- Fix 5 — RNG-stream drift: the module's own Math.random draws (2/day
  of tick gates) swung identical-seed panels with zero game effect
  behind the swing (84103 pilot 1: days 90 -> 71, bonds 62 -> 40), so
  M5's paired comparison measured noise. All module lotteries now use
  hash rolls (`bondRoll`: FNV-1a + fmix32 finalizer; verified uniform —
  pairtick 3/90 at 0.08, bondtick 20/90 at 0.25, linktick 42/90 at 0.5).
  Raw FNV-1a without the finalizer clustered on short inputs
  (`pairtick|N` all 0.25–0.43, so the 0.08 gate never passed) — the
  finalizer is load-bearing, not cosmetic. `npcInviteDecision` still
  rolls Math.random (existing code, per decided proposal only).
- Fix 6 — wiring bug found by the proof test: internal callers used
  the closure `proposeBond` / resolvers directly, bypassing
  `Game.proposeBond` — the instrument (and M6's gate check) never saw
  pair-tick / VISIT proposals or conversation resolutions. Internal
  callers now go through the public methods with closure fallback.
- Gates now: staging 0.25, pair tick 0.08, link tick 0.5, tell 0.3,
  VISIT propose 0.25. Proof test 60/60 (new: expired/succession
  fixtures, pair-tick direct + 60d hook, lore tell, link cooldown);
  fingerprint identical across two separate processes.

## Amendment 3 — full-panel NO-GO, tuning 3 (2026-11-05)
- Full armed panel (8 seeds 84101–84108, 90d, tuning-2 code) judged
  NO-GO: M1 true (8/8 seeds, 56 pooled proposals), M2 true (8/21 =
  38.1% accepted, n=21), M3 FALSE (8 initiated >= 4, but maxPerSeed
  13 > 12 — seeds 84106 and 84108), M4 true (106 link raises),
  M5 FALSE (84102 bonds 42 vs baseline 59, -29%; 84103 days 74 vs
  baseline 90, -18%), M6 true (0 gate fails, 0 errors). Panel JSONs
  filed under perseed-bondinit-b/panel1-nogo/; baseline unchanged.
- M3 cause: staging dominates the count (84106: 10 staged + 3
  decided; 84108: 10 staged + 3 decided). The 0.25 scholar-staging
  gate stages ~10/90d on long-lived villages. Fix: staging gate
  0.25 -> 0.18 (expected ~7 staged, total ~11/seed with margin).
  Pair tick (3–4/seed) untouched.
- M5 cause: RNG-stream drift, same class as tuning 2's fix 5 but
  one draw deeper. The module's own lotteries were hash-pinned in
  tuning 2, yet the shared character decision (npcInviteDecision)
  still drew Math.random per decided proposal — 1 draw on 84102, 4
  on 84103 — and a single draw shifts the whole seeded stream
  downstream, so the paired panel measured noise (84102 bonds -29%
  with the village living LONGER, 63d vs 55d; 84103 dying 16 days
  earlier). No mechanism in the module reduces bonds or kills
  villagers; per-seed bond rates move both ways across the panel.
  Fix: proposeBond now passes a hash-pinned decision roll
  (bondRoll('bonddecide', day, initiator, target)) to
  npcInviteDecision; opts.roll still pins it for tests. The module
  now consumes zero Math.random anywhere — its own rule
  (bondinit_no_stream_drift) finally holds end to end. Proof test
  adds an unpinned-decision-draws-zero-Math.random test (63/63).
- Gates now: staging 0.18, pair tick 0.08, link tick 0.5, tell 0.3,
  VISIT propose 0.25. Bars unchanged. The armed panel re-runs on
  the same 8 seeds against the same baseline.
