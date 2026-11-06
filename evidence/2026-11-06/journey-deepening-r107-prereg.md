# Journey leg: DEEPENING (days 40–80) R107 — "DID THE FUNNEL MOVE, AND DOES THE POCKETED THING COME BACK?" — 2026-11-06

## Pre-registration (written BEFORE any seed runs; one pre-registered game-code fix, see below)

Rotation read 2 (deepening) at run start; r107 plays deepening, writes 2->3
at closeout WITH verified write + retry (r106 rotation note: verified-by-read-back
writes stick; silent ones intermittently don't).
Base: master 792ab8814 at worktree creation.
Policy: competent (r105 driver lineage, VERBATIM — see below).
Seeds: fresh 92601–92604. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 92600 (outside the main band) x DAYCAP=45 proves the r107
driver (with the fix in place) before the main run; smoke outputs deleted
after the check.

Freshness check for 92601–92604 (full check per the 2026-11-05 AGENTS.md
lesson — ALL dated preregs + all dated .md + evidence filenames +
forbidden-band lists, not just today's files): COMPLETED before the
panel ran. Boundary-aware seed-context patterns (`"seed": 9260x` /
`seed=9260x` / `SEEDS=…9260x` / `s9260x` across evidence/ + scripts/ +
docs/): 0 hits. Word-boundary .md mentions of 92601–92604: 0.
Filename hits for 9260*: only `s9260` corpora (seed 9260, a different
4-digit seed) — no `s92601`–`s92604` filenames. The bare-string hits for
92601–92604 in .jsonl corpora are `pantryKcal` values (e.g. 92603) —
kcal noise, excluded per the r105 lesson, not seed reservations.
Band 925xx REJECTED: named in evidence/2026-11-04/sim-tendbelow-b-prereg.md
("925xx corpus filenames carry seed 9250... the band was passed over
anyway for cleanliness") — a named band is not fresh even with no corpus
behind it. 926xx is absent from the tendbelow forbidden list
(99001–99008, 99009–99024 contaminated, 99041–99052, 99101, 99201–99216,
99217–99232, 99401–99412, 99601–99612, 99701–99708, 99801–99808,
98701–98716, 89701–89707, 83601–83800, 16101–16116, 99901–99912).
Smoke seed 92600 cleared the same way (0 word-boundary .md hits, no
s92600 filenames). Band 92601–92604 verified fresh.

## The question (SURV-CONTROL, primary — the control r106's metric review asked for)

r105 survival was 2/4 (92202, 92204 to day 101, wave 4); r106 survival was
0/4 on the same driver shape with one added sitting day. r106's metric
review: "the NEXT run should carry a same-base control (re-run the r105
driver on the current base, the establishment-r105 M0 precedent) before
claiming the deepening funnel moved in either direction." This run IS that
control: the r105 driver VERBATIM (CONVO_DAYS [45, 60, 80], DAYCAP=100,
competent policy) on the current base with fresh seeds.

- **Verdict**: >=2/4 survive → r106 was seed variance; the funnel did
  not move. 0/4 survive → base drift is real; the next job is bisecting
  what changed between r105's base and now (no claim about which change
  until a bisect runs). 1/4 → ambiguous, no claim either way.
- **INTERESTING** if 0/4 (real drift — a regression to hunt) OR if >=2/4
  (variance confirmed — the 0/4 scare is closed).
- The control is descriptive about WHY villages die (fight-heavy vs
  starvation, pantry at death, wave reached) exactly as r105/r106
  reported it — a cause split, not a winnability verdict (fresh seeds,
  small panel).

## The build (D-THING-FIX, secondary — the pocketed thing comes back)

D-THING (r95 open item, carried through r106): a declined invitation
sometimes ends with '"Another time, then." A small thing, pocketed.'
(betrayal.js declineLine pool[0]) and the thing is never mentioned again
— 3 pocketed / 0 revisited / 0 mentioned in r106, all three
last-sitting cases, so the old count method could not separate "never
comes back" from "no later sitting existed". This run fixes it, mirroring
the r104 repay pattern (record outlives the seed; select from the record):

- **Record**: `declineInvite` (betrayal.js) records
  `hist.pocketed = { day: this.state.scholar.day }` on the invite history
  exactly when the returned decline line IS the pocketed line (ledger
  fallback to pool[0] still speaks the line, so it still records).
- **Surface**: new record-driven want `pocketed` (convo-wants.js,
  `pick()` returns 0 — never spontaneous): `opener` names the small
  thing in plain words ("Still carrying that small thing from last
  time..."), `staleOpener` reframes it when the fresh lines are
  ledger-blocked (r104 defect class: never name the want id as
  dialogue), `onSurfaced` marks `hist.pocketed.mentioned` so it is named
  exactly once (settle-on-speak, seek_taken precedent).
- **Select**: `convoSelectWant` checks the pocketed record AFTER the
  unsettled-promise block (below repay, above the weighted pick) — it
  never pre-empts a live seed or the repay voice (the question-first
  half of the coverage bound: a sitting that opens on a question never
  gives repay its turn; pocketed must not add a fourth pre-emptor above
  repay).
- **Proof test**: scripts/test-journey-deepening-r107-pocketed-20261106.js
  — (a) a decline with a fresh ledger records pocketed; (b) the next
  sitting selects the pocketed want and the opener names the thing;
  (c) mentioned-once (a second sitting does not re-select); (d) repay
  still outranks pocketed when both are pending; (e) live-seed priority
  is preserved. The proof test is the fix's verification.
- **Wild check (descriptive, not a verdict on the fix)**: the panel
  counts pocketed declines and whether a later sitting mentions the
  thing. Pocketed declines are rare (3 in r106's 22 sittings) and most
  are last-sitting cases — the panel may well see zero testable threads,
  in which case the wild check reports "no testable thread" and the
  proof test stands alone. No re-run is owed for a zero.
- **Control-validity disclosure**: the fix is conversation text + one
  history flag only — no numbers, no routing, no resources, no survival
  mechanics change — so the SURV-CONTROL comparison stays valid. The
  only survival-relevant path would be a crash, caught by the smoke run
  and the check gate.

## Carried context (reported, not re-judged)

- P-KEEP (r106 primary, now carried): same scan, same definitions.
  The question is closed as a metric question; no verdict is taken
  here. NAMED counts are reported for continuity only.
- V-INIT-BOND (r103 primary, now carried): same scan, same
  definitions. Expectation 0 — nothing in this run touches bonds.
  build-bond-initiate is NOT merged (branch exists, no merge commit);
  this run does not build it and does not touch it.
- G-SENSE: all transcripts read in full; senseless sittings counted
  (expectation from r106: 0). Any senseless sitting is read and named,
  not just counted. A senseless pocketed sitting would be a routing
  defect, named as such.
- D-THING count, with the NEW denominator (r106 metric-review fix):
  threads are counted as testable ONLY when a later sitting with the
  same villager exists (transcript files prove it); the raw count and
  the denominator-qualified count are both reported. If the qualified
  denominator is 0, D-THING is unmeasurable this panel — reported as
  such, not as a zero.
- B-SIT / B-FOLLOW / B-LEAD (carried): betrayal sittings, follow-ups,
  and betrayal lead-ins, same scans as r106.
- S-TRACE (carried): standing-trace verdict, same scan as r106.
- G-ASSIGN/G-STEER/G-STICK goalSnaps are collected by the driver for
  continuity but NOT scored: the goal question is closed for this
  window. (With 3 convo days, G-STICK has 3 snaps; the >=3 threshold
  still holds.)
- Survival/descriptive: endReason, maxGameDay, wave reached, pop at
  end, per seed — the control's cause split (see above).

## Watch item (not a metric, not a pre-registered fix)

r105's near-duplicate line watch (Donna "I'll make it a home" / "I'd make
it a home"): not reproduced in r106. If this panel reproduces a
near-duplicate line in a sitting, it is named in the run note. A fix
follows ONLY if it is a clear ledger defect with a proof test, disclosed
as post-panel, not pre-registered.

## What this run does NOT do

- Does not build the NPC bond-proposer system (V-INIT-BOND). That is
  a builder brief, not a tweak; build-bond-initiate owns it in
  another worktree.
- Does not change succession release, seed priority, or the
  question-first-openings design question (Steve's call, not a tweak).
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.
- Does not touch win prices, deed gates, or any balance number.

## Metric review (required section in the run note)

No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
