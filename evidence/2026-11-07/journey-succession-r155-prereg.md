# Journey succession r155 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r155 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards.

## Standing state (why this run replays leg 7)

r151-succession LANDED on master (fix 6aa254c6e + evidence f7e64857c +
corrections c0be7c63d + measurement-proof refreshes 563b7d257 /
a78938a0b; finding line 1827 in sim-findings.md CLOSED: ENGAGEBEAT-
GUARD + DRY CENSUS passed on the extended three-variant guard). The
main session's intended rotation advance 7 → 4 never happened — the
file still reads 7 — so this run replays leg 7 per the rotation file.
Since r151, master has taken the frozenband bisect (1d1dbb467),
witnessdoor (34ee42f0c), feaststopspend (823291451), deepening r116
(934e10f20) and other landings. This run re-verifies the succession
leg on current master AND investigates the one dry class r151 left
open (see below). Run number r155 = next Lane B number after r154
crisis.

## The carried blank: opener dries (conversation.js startConvo)

r151's run note records one opener dry remaining in both legs, "a
knowledge-trade opener dry (conversation.js), NOT an engageBeat-class
dry, present identically on r147 code and extended code; reported
with its attribution, not counted against the bar." The mechanism is
now pinned from r151's own committed evidence (no new play yet):

- 33806 d+45 Katarina (day 86, tag "successor-life d+45", pick null
  = conversation open): the knowledge-trade SEEDING line
  `"...I should say, I trade in what I know. My knowledge for yours.
  Or food, if you're short on secrets."` was run-ledger-blocked
  (preRun=true, fellBack=true) and dry-replaced with "...Sorry, lost
  my train of thought." — immediately after the taughtref opener
  ("Hey — I found some Serviceberry today..."). Sites (r151 code):
  conversation.js:5529:16 → 7793:28 → journal.js:1288:31.
  Current-master location: conversation.js:5615-5623 (SEEDING block).
  The seed is ONE fixed string, spoken via sayLine with no
  convoWouldBlock guard — unlike the grief/secret/taughtref/recall
  openers, which all carry the r19 OPENER SKIP. Worse, the block sets
  `c.traderMentioned = true` anyway: the mechanic is marked as
  mentioned although the player never heard it, and the
  `hasDiscovered('trade')` gate keeps the 50% roll trying (and
  drying) in later conversations.
- Same class, second mechanism, same seed's sayTrace (r151 33806):
  link-raise opener dries — Badr d26 ("I've heard good things about
  The Hungry Road..."), Mohsen d76 (Thornfield), Mohsen d89
  (Stonebridge): the staged link-raise line (bond-initiation.js:541,
  one fixed phrasing per village+how) spoken as the talk-request
  opener, run-ledger-blocked when another villager raised the same
  village first. Site (r151 code): conversation.js:5479:19 — the
  opener sayLine in startConvo, which has no block guard on the
  talk-request branch. A third mechanism in the same trace, NOT this
  run's question (reported only): Badr d49 agency ask_field dry
  (villager-agency.js:1005 via bond-initiation.js:813) — an agency
  line, different owner; recorded, not fixed here.
- Also in the r151 trace, same seed: Ella d56 + Katarina d80 trade-
  seed dries (pick null, same key). The trade seed dried 3 times on
  ONE seed. Denominator (before-leg, r151 files): trade-seed dries 3
  (Ella d56, Katarina d80, Katarina d86), link-opener dries 3 (Badr
  d26, Mohsen d76, Mohsen d89), agency dry 1 (Badr d49).

## Question

On current master: (a) do the r151 bars still hold (ENGAGEBEAT-
GUARD, DRY CENSUS, CAP-NC)? (b) do the opener dries reproduce on
the before-leg (repro seeds, no fix)? (c) is the opener dry a
small, safe, transcript/copy-class fix (r19 OPENER SKIP shape: skip
the blocked line, keep the pending/flag for a later conversation)
with its own proof test — or is it documented for the owning lane?

## Instrument (r151 driver/analyzer verbatim + filenames only)

- Driver: scripts/journey-succession-r155-20261107.js = r151 driver
  with ONLY r151->r155 renames (filename, transcript/tele filename
  patterns, EVID_DIR evidence/2026-11-07). No logic change. The r151
  after-leg files stay intact under their r151 names.
- Analyzer: scripts/analyze-journey-succession-r155-20261107.js =
  r151 analyzer with ONLY r151->r155 renames (CAP-NC scoring
  unchanged).
- POST_DAYS=70, EARLY_KILL_DAY=40, CONVO_DAYS unchanged. Controls:
  no forced kills.

## Seeds

- Repro (DELIBERATE REUSE for same-seed before/after on current
  master): 33803 + 33806 (r146 panel band). Not a fresh-band claim.
- Smoke: 33998 (EARLY_KILL_DAY=5, POST_DAYS=25) proves the r155
  driver first.
- CAP-NC panel (fresh band): 33911–33918, r143 stop rule (run in
  order, stop at 3 eligible or after 33918).
- Order: smoke → repro before-leg → (fix decision) → repro
  after-leg → CAP-NC panel.

## Seed-band freshness (skill: local_seed_band_freshness)

- Band 33911–33918 + smoke 33998: searched ALL dated preregs
  (evidence/*/sim-*-prereg.md + evidence/*/journey-*-prereg.md,
  grep for 3391[0-9]/3399[0-9] excluding r147/r151's own 33901–
  33908/33999 reservation) — ZERO matches. Second grep over all
  *prereg* files for 3391[1-8] and 33998 — ZERO matches. Forbidden
  bands named in Nov preregs (73641–73648, 73671–73678, 78201–
  78208, 99351–99358, 99401–99412) and the r112 contaminated list
  (897–906, 1301–1304, 917–926, 1001–1010, 1101–1110, 1201–1210,
  2001–2010, 3001–3010, 1033–1042, 1043–1052, 1053–1062) do not
  intersect. Band FRESH.
- Repro seeds 33803/33806: deliberate reuse (above).

## Bars (binding, §14)

- REPRO (binding): on the before-leg (current master, no fix), the
  Katarina d+45 trade-seed dry reproduces (day 86, pick null,
  SAYTRACE preRun fellBack on the trade-seed key) AND at least one
  link-raise opener dry reproduces on 33803/33806. A non-repro
  drops out of the denominator, recorded, NOT re-scored (r147
  prereg rule).
- OPENER-DRY CENSUS (binding, new): after the fix, across ALL driven
  transcripts on the after-leg + panel seeds, ZERO dry lines at
  conversation open (pick null) attributable to the trade-seed line
  or a link-raise opener line (SAYTRACE preRun/preSelf RUN/SELF-
  BLOCKED on either key at an open turn). A dry at open through any
  other mechanism is reported with its attribution, not counted
  against this bar — but a new trade-seed/link-opener dry anywhere
  FAILS it.
- DRY CENSUS (binding, carried from r151): ZERO dry lines at
  ask/details turns attributable to a favor whyLine via engageBeat
  (same definition as r151). The r151 three-variant guard must hold
  on current master.
- CAP-NC REGRESSION (binding, carried from r143): PASS = ≥3
  eligible seeds AND ≥3 bonded by the deadline AND bonded/eligible
  ≥ 2/3.
- PROOF TESTS (binding for any fix claim): r146 + r147 + r151
  bothblocked proof tests re-run GREEN on the final tip; any new
  fix carries its own proof test, verified RED on unfixed code and
  GREEN after.
- SELF-REQUEST REGRESSION CHECK (reported, not scored):
  selfReqDayEntries == 0 on every seed.
- CARRIED (reported, not scored): pick-time rank == 1 on every
  first handoff with npcCalls; funeral INCALL beat present on every
  leg death. Controls (r151): the three control dries (33803 d+14
  Lorenzo [dlg:subject], 33803 d+4 Paisley [dlg:doubt], 33806 d+8
  Badr knowledge-question) must read identically on the after-leg.
- PEOPLE CHECK (sense, not a count): read the fixed d+45 Katarina
  transcript in full plus one d+14 successor transcript per CAP-NC
  panel seed. Bar: conversations have meaning per the sense-testing
  law; the fix must not introduce filler or a line promising a need
  that isn't there.

## What would count as an interesting finding

- An opener dry NOT reproducing on current master (already fixed
  by a later landing — check git blame before claiming).
- A NEW opener-dry mechanism (a third single-fixed-line open beat).
- The trade seed drying while `traderMentioned` is set (the
  mechanic marked heard but never spoken — a discovery dead end).
- A control dry changing (the fix leaking into unrelated paths).
- A CAP-NC regression from a dialogue-only fix.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions (r151 precedent:
per-seed means, n=9 panel). KNOWN WART (r151): the checker sums
across files while the baseline holds per-seed means — LOUD lines
on deaths.bearer / census.fallen are the summation artifact unless
per-seed means actually move. Run the check, investigate any LOUD
line, do NOT roll sums into the baseline.

## Fix policy

No new game change is pre-planned. If the before-leg reproduces
the opener dries, the fix is attempted same-run ONLY if small, safe,
and provably a defect in the r19 OPENER SKIP class (transcript/copy
only: skip the blocked line, keep the pending/flag for a later
conversation; no trust/consequence/ledger changes; no RNG change
in the guard path) with its own proof test; otherwise the finding
is documented with evidence for the owning builder lane and the
branch merges only if the binding bars pass. No gate, deed, wave,
or table change under any reading of a finding (freeze stands).

## Expansion trigger

Instrument failure only: talkRequests unreadable, bondDaily empty
on a seed with a recorded handoff, bondDaily entries missing
bearerId, newcomer detection never recording _newcomerSeen, or
SAYTRACE recording no fellBack on a seed whose transcript shows a
dry line (fix instrument, re-run that seed once). A CAP-NC miss, a
no-newcomer-arrival seed, a village ending before the deadline, or
a skipped seed never triggers expansion alone — the stop rule
bounds the panel at 8 seeds.

## Metric review (to be filled after the panel)

- Canon note: no canon doc covers mantle/bond formation
  specifically (r127's standing note, unchanged). Governing rules
  used: ledger.js "successor: the village chooses. Trust decides";
  party-bond.js "v.bonds built by meals/visits/feasts, +6/pair/day
  cap, no bonds with the dead or gone"; CONVERSATIONS.md structural
  contract ("The repeat ledger must not replace a successful
  promise with 'lost my train of thought.'"); CANON.md "No silent
  actions". Nothing invented, nothing changed.
- The mantle 2-day latency owed item (r112 landing note) is still
  open and is NOT this run's question; it stays carried.
- The Badr d49 agency dry (villager-agency.js:1005 via
  bond-initiation.js:813) is recorded, NOT this run's question.
