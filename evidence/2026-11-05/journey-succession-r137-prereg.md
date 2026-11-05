# Journey succession r137 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before play. Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout. Run number r137 follows r136 (social life,
same day); the rotation file, not the number, is the authority.
Base master e938cda83 (post r136 + establishment r103 + crisis r128).

## Carried question (r133, verdict INSUFFICIENT-DATA)

r133 decomposed r123's "successors form 0 new bonds" into opportunity vs
capacity and answered the mechanism descriptively: the successor is NOT
socially frozen — the village is saturated, newcomers are the bond supply
(every first-bearer new bond was with a newcomer; 24 talk requests to the
bearer in d+0..d+30, only 1 unbonded). But its binding CAP bar (probe bond
by relEnd, same bearer) had ZERO eligible seeds out of 6: 4 no-stranger-pool,
2 second-handoff-before-relEnd. The bar was not re-scored mid-run (§14);
the verdict was INSUFFICIENT-DATA. This run applies r133's metric-review
revision verbatim: judge probe bonds at relD14 (first-bearer window),
relD30 as confirmation, no-stranger-pool seeds as saturation findings.

Verified while writing this prereg (read-only, from r133's own JSONs):
the post-death window often truncates early — seed 33401 ran only 19
post-death iterations (village ended d+18, chain mantles Maher→Lindani→
Aroha→Petra d58–59) and its relD30 snapshot is ABSENT, not empty. That is
why relEnd almost never belongs to the probe bearer, and why D14 is the
reachable judgment window. The driver already captures relD14.selfId, so
the same-bearer check at D14 is a snapshot read, not new wiring.

## Question

Can a bearer bond with a stranger they talk to? (Capacity, re-tested
at the reachable window.) Two rival outcomes:
(a) CAPACITY HOLDS: probe pairs bond by d+14 when the bearer lives that
long — the r123 zero was opportunity (saturation), not a bearer block.
(b) CAPACITY DEFECT: probe pairs do not bond by d+14 despite the bearer
holding the mantle and the conversation opening — a bearer-specific
block, documented for the builder.

## Instrument (r133 driver + 1 declared addition, nothing else)

Driver: scripts/journey-succession-r137-20261105.js = r133 verbatim
except filenames r133 -> r137, EVID_DIR evidence/2026-11-05, mode string
kept 'succession-r123' (harness label, unchanged since r123 to avoid any
mode-branched behavior drift). Instrument only, zero src/js changes.

1. BONDDAILY-BEARER: every bondDaily entry carries bearerId + bearer
(the mantle-holder that day). r133's metric review required this: its
analyzer mixed bearers on chained seeds because bondDaily did not record
which bearer each day's bonds belonged to. The driver already computed
newBearer against the current bearer each day; only the attribution was
missing. Reads only; the instrument writes nothing back into Game state.
2. Everything else (TALKREQ-DAILY, STRANGER-PROBE, PICKCTX, PICKCTX2,
REL snapshots incl. relD14/relD30, FUNERAL-INCALL, CONVO_DAYS
[3,7,14,30,45,53,64], POST_DAYS=70, EARLY_KILL_DAY=40, second/third/
fourth/fifth kills = 0) is r133 verbatim, renamed. No forced regime: the
scripted leg kill fires only when no organic death arrives by day 40,
exactly as r133.

Analyzer: scripts/analyze-journey-succession-r137-20261105.js = r133
analyzer with the CAP judgment replaced (D14, see Bars) and OPP split
FIRST-bearer vs LATER-bearer via bondDaily.bearerId.

## Pilot seeds

33501, 33502, 33503, 33504. Fresh band: exact `"seed": 3350` grep
empty across prior succession stdout JSONs at run start. Reserves
33505, 33506. Launch: SEED=<seed> POST_DAYS=70 node
scripts/journey-succession-r137-20261105.js (EARLY_KILL_DAY default
40; DUMP_SAY set per seed so the capped log stays auditable).
Smoke seed 33599 (EARLY_KILL_DAY=5, POST_DAYS=10) proves the
BONDDAILY-BEARER instrument (bondDaily entries carry bearerId) before
the panel.

## Bars (binding, §14)

- CAP-D14 (binding): stranger-probe pair bonded by relD14 on >= 3 of 4
  pilot seeds. Denominator rule, stated in advance: a seed counts
  toward the 3 only if its probe convo OPENED (not refused) AND the
  village survived to d+14 (relD14 exists) AND the probe bearer still
  holds at relD14 (relD14.selfId === probe.bearerId). Bond presence is
  the bond key in relD14.bonds. A refused probe, a no-stranger-pool
  seed, a village ending before d+14, or a second handoff before d+14
  is reported verbatim and does NOT count toward the 3 — and does not
  count against capacity either. If fewer than 3 seeds are
  probe-eligible, the verdict is INSUFFICIENT-DATA (use reserves
  33505-33506 once each, then stop and report). If >= 3 probes opened
  with same-bearer relD14 and 0 bonded by relD14, that is a CAPACITY
  DEFECT item for the builder, documented not re-scored.
- CAP-D30 (confirmation, descriptive not scored): probe pair bonded
  by relD30 on seeds where relD30.selfId === probe.bearerId. Reported
  alongside CAP-D14; a late bond is a finding, not a re-score.
- BONDED-EVER (descriptive): probe pair bonded in ANY snapshot
  (relD14 / relD30 / relEnd) regardless of bearer survival — capacity
  evidence that survives a later death. Reported, never scored.
- OPP (descriptive, reported not scored): per seed, over d+0..d+30
  post-handoff — total talk requests filed to the bearer, split
  bonded vs unbonded requesters; autonomous NPC-NPC new bonds per day
  (median + total); FIRST-bearer new bonds (bondDaily.bearerId ===
  first bearer) split driven vs undriven days; LATER-bearer new bonds
  separately. No threshold: this is the decomposition, and it judges
  mechanism (a) vs (b) together with CAP-D14.
- SELF-REQUEST REGRESSION CHECK (reported, not scored): r133 landed a
  purge of the successor's own pre-handoff talk request in ledger.js
  playerDeath (master e938cda83 carries it). selfReqDayEntries is
  expected to be 0 on every panel seed. Any recurrence is a regression
  note on that fix, documented with the seed and day — not a re-score
  of CAP-D14.
- CARRIED (reported, not scored): pick-time rank == 1 on every first
  handoff with npcCalls (r123 bar); funeral INCALL beat present on
  every leg death (r127 bar). A miss on a carried bar is reported as
  a regression note, not a re-score of r123/r127.
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
before any kill) never triggers expansion alone — skipped seeds count
in denominators as "not >= bar" per the r119/r123 skipped-seed rule,
and reserves are used only for the INSUFFICIENT-DATA case above.

## Metric review (to be filled after the panel)

- r133's bond counts are NOT re-scored here; r137 scores only the new
  decomposition (CAP-D14 + OPP with first-bearer split), per its prereg.
- If CAP-D14 passes and OPP shows zero unbonded talk requests with
  steady NPC-NPC bonding, the mechanism is (a) and the carried design
  question goes to Steve/builder as measured, not as a guess.
- Canon note: no canon doc covers mantle/bond formation specifically
  (r127's standing note, unchanged). Governing rules used: ledger.js
  "successor: the village chooses. Trust decides"; party-bond.js
  "v.bonds built by meals/visits/feasts, +6/pair/day cap, no bonds
  with the dead or gone"; CANON.md "No silent actions". Nothing
  invented, nothing changed.
