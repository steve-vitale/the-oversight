# Journey succession r143 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before play. Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout. Run number r143 follows r142 (succession,
same leg, previous day); the rotation file, not the number, is the
authority.
Base master 792ab8814 (branch base at registration; master moved to
abc4df164 during pre-flight when a sibling merged
sim-spandraw-census-a — the r143 branch rebases onto the new master
before merge, per the run body's step 8).

## Carried question (r142, verdict INSUFFICIENT-DATA)

r142 re-tested capacity on the eligible subset (CAP-D14): 1 ELIGIBLE
seed out of 8 run — and it bonded (33604 Norman↔Shaurya d+3, same day
as the probe conversation). The binding verdict was INSUFFICIENT-DATA
because the denominator never reached 3: 6 of 8 seeds had no stranger
pool at relPost (saturation findings, not capacity misses). r142's
metric review proposed the revision this run applies verbatim: probe
the NEWCOMER channel directly — the first newcomer who arrives after
the handoff and talks to the bearer, bond by d+14 after arrival (or
after the probe conversation, whichever is later). The mechanism data
says newcomers are the entire bond supply (9/9 first-bearer bonds in
r142, 100% in r137 too), so the bar measures the channel that actually
supplies bonds. The no-stranger-pool rate itself (6/8 in r142) becomes
a saturation datapoint, not a denominator.

## Question

Can a bearer bond with a NEWCOMER they talk to, by d+14 after arrival
(or after the probe conversation, whichever is later)? Two rival
outcomes:
(a) CAPACITY HOLDS: newcomer-probe pairs bond by the deadline when
    the bearer holds that long — the r123 zero was opportunity
    (saturation), not a bearer-specific block.
(b) CAPACITY DEFECT: probe pairs do not bond by the deadline despite
    the bearer holding the mantle and the conversation opening — a
    bearer-specific block, documented for the builder.

## Instrument (r142 driver + analyzer, ONE declared addition)

Driver: scripts/journey-succession-r143-20261106.js = r142 driver
verbatim except filenames r142 -> r143 (mode string kept
'succession-r123', EVID_DIR evidence/2026-11-06, POST_DAYS=70,
EARLY_KILL_DAY=40) + NEWCOMER-PROBE:
- relPost roster baseline: the living roster ids in rec.relPost
  (relSnap affinityNames keys) are the handoff-day roster.
- Each post-death iteration after relPost exists, detect living roster
  ids not in the baseline and not previously seen; record first-seen
  day/dplus in rec._newcomerSeen (arrival = first detection; a
  newcomer who arrives AND dies inside one runDays call before any
  detection is missed — stated limitation, not hidden).
- On the FIRST newcomer seen, drive a convo with them (the newcomer
  probe) and record rec.newcomerProbe = {arrivalDay, arrivalDplus,
  probeDay, probeDplus, vid, vidId, bearerId, bearer, trust, refused,
  want, deadlineDplus = max(arrivalDplus, probeDplus) + 14}. If the
  pair is already bonded at probe time (autonomous bond on arrival
  day, before the convo), record bondedBefore:true and do not drive —
  classified 'bonded-before-probe', excluded from the eligible
  denominator, reported descriptively.
- If no newcomer ever arrives during POST_DAYS, newcomerProbe =
  {none: 'no newcomer arrived'} — a saturation datapoint.
- The r142 d+3 stranger probe is KEPT unchanged (saturation
  datapoint + continuity); it is descriptive this run, not binding.
Instrument only, zero src/js changes.

Analyzer: scripts/analyze-journey-succession-r143-20261106.js = r142
analyzer with the CAP section replaced by the newcomer-channel
scoring below (bondDaily-based; snapshots relD14/relD30/relEnd may
not align with the per-seed deadline). Analyzer only; reads JSON.
- Eligible: probe opened AND the run observed the deadline (some
  bondDaily entry with dplus >= deadlineDplus) AND the probe bearer
  still holds at the deadline (the last bondDaily entry with dplus <=
  deadlineDplus has bearerId === probe.bearerId).
- Bonded by deadline: the pair key appears in newBearer of any
  bondDaily entry with dplus <= deadlineDplus and bearerId ===
  probe.bearerId.
- BONDED-EVER (descriptive): pair key in ANY snapshot (relD14 /
  relD30 / relEnd) or ANY bondDaily entry (any bearer).

## Panel — sequential stop rule (stated in advance)

Seeds 33701–33708, run in order. After each seed, the analyzer is run
on that seed; STOP as soon as 3 ELIGIBLE seeds have been collected, or
after 33708, whichever comes first. A refused probe, a
no-newcomer-arrival seed, a village ending before the deadline, a
second handoff before the deadline, or a bonded-before-probe seed is
a saturation/window finding: reported verbatim, does NOT count toward
the 3, does not count against capacity. Skipped seeds (village over
before any kill) count in denominators as "not >= bar" per the
r119/r123 skipped-seed rule.
Smoke seed 33799 (EARLY_KILL_DAY=5, POST_DAYS=25) proves the
instrument before the panel (newcomer tracking runs, probe fires or
no-arrival recorded cleanly, bondDaily entries carry bearerId).

Launch: SEED=<seed> POST_DAYS=70 node
scripts/journey-succession-r143-20261106.js (EARLY_KILL_DAY default
40; DUMP_SAY set per seed so the capped log stays auditable).

## Seed-band freshness (skill: local_seed_band_freshness)

Band 33701–33708 + smoke 33799. Searched ALL dated preregs:
evidence/*/sim-*-prereg.md and evidence/*/journey-*-prereg.md (732
files), exact patterns 33701–33708 and 33799 — ZERO matches. One
loose-hit explanation, checked and dismissed: a "3379" grep hit in
evidence/2026-11-03/sim-verifyfield-b-prereg.md is the seed 83379 in
a seed list (line 136: "83281, 83284, 83286, 83336, 83341, 83373,
83377, 83379."), not a 33799 reservation. Forbidden bands named in
Nov preregs (73641–73648, 73671–73678, 78201–78208) do not intersect.
Band FRESH.

## Bars (binding, §14)

- CAP-NC (binding): scored on the eligible subset only.
  - PASS: >= 3 eligible seeds AND >= 3 bonded by the deadline AND
    bonded/eligible >= 2/3.
  - CAPACITY DEFECT: >= 3 eligible seeds AND 0 bonded by the deadline.
  - INSUFFICIENT-DATA: fewer than 3 eligible seeds after 33708, or a
    bonded fraction between 0 and the pass line (reported
    descriptively, not re-scored). The bar is NOT re-scored against a
    friendlier metric mid-run.
- BONDED-EVER (descriptive): probe pair bonded in ANY snapshot or
  bondDaily entry regardless of bearer — capacity evidence that
  survives a later death. Reported, never scored.
- OPP (descriptive, reported not scored): per seed, over d+0..d+30
  post-handoff — total talk requests filed to the bearer, split
  bonded vs unbonded requesters; autonomous NPC-NPC new bonds per day
  (median + total); FIRST-bearer bonds (bondDaily.bearerId === first
  bearer) split driven vs undriven days, and split newcomer vs
  pre-existing partner; newcomer arrivals per seed (count + first
  arrival dplus). No threshold: this is the decomposition, and it
  judges mechanism (a) vs (b) together with CAP-NC.
- SELF-REQUEST REGRESSION CHECK (reported, not scored): r133 landed a
  purge of the successor's own pre-handoff talk request in ledger.js
  playerDeath. selfReqDayEntries is expected to be 0 on every panel
  seed. Any recurrence is a regression note on that fix, documented
  with the seed and day — not a re-score of CAP-NC.
- CARRIED (reported, not scored): pick-time rank == 1 on every first
  handoff with npcCalls (r123 bar, trust-sorted instrument — the old
  raw-list rank must never be quoted again); funeral INCALL beat
  present on every leg death (r127 bar). A miss on a carried bar is
  reported as a regression note, not a re-score of r123/r127.
- PEOPLE CHECK (sense, not a count): read the newcomer-probe
  transcripts in full plus one d+14 successor transcript per scored
  seed. Bar: conversations have meaning per the sense-testing law
  (NPC wants something, options engage or deflect, endings
  resolve/plant/owe); no fabricated shared history. A sense failure
  is documented as a blank even if CAP-NC passes.

## Expansion trigger

Instrument failure only: talkRequests unreadable, bondDaily empty on a
seed with a recorded handoff, bondDaily entries missing bearerId, or
newcomer detection never recording _newcomerSeen (fix instrument,
re-run that seed once). A CAP miss, a no-newcomer-arrival seed, a
village ending before the deadline, or a skipped seed (village over
before any kill) never triggers expansion alone — the stop rule above
bounds the panel at 8 seeds.

## Metric review (to be filled after the panel)

- r142's bond counts are NOT re-scored here; r143 scores only the new
  decomposition (CAP-NC on the eligible subset + OPP with
  newcomer attribution), per its prereg.
- If CAP-NC passes and OPP shows steady NPC-NPC bonding, the
  mechanism is (a) and the carried design question goes to
  Steve/builder as measured, not as a guess.
- Canon note: no canon doc covers mantle/bond formation specifically
  (r127's standing note, unchanged). Governing rules used: ledger.js
  "successor: the village chooses. Trust decides"; party-bond.js
  "v.bonds built by meals/visits/feasts, +6/pair/day cap, no bonds
  with the dead or gone"; CANON.md "No silent actions". Nothing
  invented, nothing changed.
- Telemetry: r142 left the succession baseline's integrationStage at
  15 (definitionally impossible; Game.integrationStage() returns
  0–3) with a recommendation to re-baseline from a stated panel.
  This run runs the telemetry check per step 14 and investigates any
  LOUD line before deciding whether to roll the baseline forward from
  this panel's per-seed means.
