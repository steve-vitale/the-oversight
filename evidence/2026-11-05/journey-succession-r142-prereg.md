# Journey succession r142 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before play. Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout. Run number r142 follows r141 (social life,
same day); the rotation file, not the number, is the authority.
Base master 25de3b127 (post r105 establishment + r138/r140 endgame +
r141 social life).

## Carried question (r137, verdict INSUFFICIENT-DATA)

r137 re-tested capacity at the reachable window (CAP-D14): 2 ELIGIBLE
seeds out of 6 run, and BOTH bonded by d+14 (33503 Jorge↔Petra d+3,
33504 Elijah↔Hugo d+9). The binding verdict was INSUFFICIENT-DATA
because the denominator never reached 3: 3 of 6 seeds had no stranger
pool (saturation findings, not capacity misses), 1 village ended
before any kill. r137's metric review proposed the revision this run
applies verbatim: pre-screen for stranger-pool seeds — run 6–8 seeds
and score CAP-D14 on the eligible subset with a stated minimum
(≥3 eligible or INSUFFICIENT-DATA). CAP-D30 confirmation is DROPPED
as an expectation (both r137 eligible seeds' villages ended before
d+30); relD30 bonds are still reported descriptively via bondedEver.

## Question

Can a bearer bond with a stranger they talk to, by relD14 — judged
on a panel with enough eligible seeds to count? Two rival outcomes:
(a) CAPACITY HOLDS: probe pairs bond by d+14 when the bearer holds
that long — the r123 zero was opportunity (saturation), not a
bearer-specific block.
(b) CAPACITY DEFECT: probe pairs do not bond by d+14 despite the
bearer holding the mantle and the conversation opening — a
bearer-specific block, documented for the builder.

## Instrument (r137 driver + analyzer, names/seeds/verdict only)

Driver: scripts/journey-succession-r142-20261105.js = r137 driver
verbatim except filenames r137 -> r142 (mode string kept
'succession-r123', EVID_DIR evidence/2026-11-05, POST_DAYS=70,
EARLY_KILL_DAY=40). Instrument only, zero src/js changes.

Analyzer: scripts/analyze-journey-succession-r142-20261105.js = r137
analyzer (trust-sorted pick rank included) with the CAP verdict lines
replaced by the eligible-subset scoring below. Analyzer only; reads
JSON.

## Panel — sequential stop rule (stated in advance)

Seeds 33601–33608, run in order. After each seed, the analyzer is run
on that seed; STOP as soon as 3 ELIGIBLE seeds have been collected, or
after 33608, whichever comes first. Eligible = probe convo OPENED (not
refused) AND village survived to d+14 (relD14 exists) AND probe bearer
holds at relD14 (relD14.selfId === probe.bearerId). A refused probe, a
no-stranger-pool seed, a village ending before d+14, or a second
handoff before d+14 is a saturation/window finding: reported verbatim,
does NOT count toward the 3, does not count against capacity.
Skipped seeds (village over before any kill) count in denominators as
"not >= bar" per the r119/r123 skipped-seed rule.
Smoke seed 33699 (EARLY_KILL_DAY=5, POST_DAYS=10) proves the
instrument before the panel (bondDaily entries carry bearerId, probe
opens).

Launch: SEED=<seed> POST_DAYS=70 node
scripts/journey-succession-r142-20261105.js (EARLY_KILL_DAY default
40; DUMP_SAY set per seed so the capped log stays auditable).

## Seed-band freshness (skill: local_seed_band_freshness)

Band 33601–33608 + smoke 33699. Searched ALL dated preregs:
evidence/*/sim-*-prereg.md and evidence/*/journey-*-prereg.md, exact
patterns 33601–33608 and 33699 — ZERO matches. Two loose-hit
explanations, checked and dismissed: a "3360" grep hit in
evidence/2026-11-02/sim-heraldband-pilot-prereg.md is a commit-SHA
substring (62e251b699ba9c3360f4fe02673bce21b44d6000), not a seed
reservation; "33699" hits in October census JSONs (crumbguard pilot,
perseed-prosefix, feastvoice) are data values in non-prereg files,
not reservations. Forbidden bands named in Nov preregs (73641–73648,
73671–73678, 78201–78208) do not intersect. Band FRESH.

## Bars (binding, §14)

- CAP-D14 (binding): scored on the eligible subset only.
  - PASS: >= 3 eligible seeds AND >= 3 bonded by relD14 AND
    bonded/eligible >= 2/3.
  - CAPACITY DEFECT: >= 3 eligible seeds AND 0 bonded by relD14.
  - INSUFFICIENT-DATA: fewer than 3 eligible seeds after 33608, or a
    bonded fraction between 0 and the pass line (reported
    descriptively, not re-scored). The bar is NOT re-scored against a
    friendlier metric mid-run.
- BONDED-EVER (descriptive): probe pair bonded in ANY snapshot
  (relD14 / relD30 / relEnd) regardless of bearer — capacity evidence
  that survives a later death. Reported, never scored.
- OPP (descriptive, reported not scored): per seed, over d+0..d+30
  post-handoff — total talk requests filed to the bearer, split
  bonded vs unbonded requesters; autonomous NPC-NPC new bonds per day
  (median + total); FIRST-bearer bonds (bondDaily.bearerId === first
  bearer) split driven vs undriven days; LATER-bearer bonds
  separately. No threshold: this is the decomposition, and it judges
  mechanism (a) vs (b) together with CAP-D14.
- SELF-REQUEST REGRESSION CHECK (reported, not scored): r133 landed a
  purge of the successor's own pre-handoff talk request in ledger.js
  playerDeath (master 25de3b127 carries it). selfReqDayEntries is
  expected to be 0 on every panel seed. Any recurrence is a regression
  note on that fix, documented with the seed and day — not a re-score
  of CAP-D14.
- CARRIED (reported, not scored): pick-time rank == 1 on every first
  handoff with npcCalls (r123 bar, trust-sorted instrument — the old
  raw-list rank must never be quoted again); funeral INCALL beat
  present on every leg death (r127 bar). A miss on a carried bar is
  reported as a regression note, not a re-score of r123/r127.
- PEOPLE CHECK (sense, not a count): read the stranger-probe
  transcripts in full plus one d+14 successor transcript per scored
  seed. Bar: conversations have meaning per the sense-testing law
  (NPC wants something, options engage or deflect, endings
  resolve/plant/owe); no fabricated shared history. A sense failure
  is documented as a blank even if CAP-D14 passes.

## Expansion trigger

Instrument failure only: talkRequests unreadable, bondDaily empty on a
seed with a recorded handoff, or bondDaily entries missing bearerId
(fix instrument, re-run that seed once). A CAP miss, a no-stranger-pool
seed, a village ending before d+14, or a skipped seed (village over
before any kill) never triggers expansion alone — the stop rule above
bounds the panel at 8 seeds.

## Metric review (to be filled after the panel)

- r137's bond counts are NOT re-scored here; r142 scores only the new
  decomposition (CAP-D14 on the eligible subset + OPP with
  first-bearer attribution), per its prereg.
- If CAP-D14 passes and OPP shows steady NPC-NPC bonding, the
  mechanism is (a) and the carried design question goes to
  Steve/builder as measured, not as a guess.
- Canon note: no canon doc covers mantle/bond formation specifically
  (r127's standing note, unchanged). Governing rules used: ledger.js
  "successor: the village chooses. Trust decides"; party-bond.js
  "v.bonds built by meals/visits/feasts, +6/pair/day cap, no bonds
  with the dead or gone"; CANON.md "No silent actions". Nothing
  invented, nothing changed.
