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
