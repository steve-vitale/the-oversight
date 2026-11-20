# Journey social life r256 — RUN NOTE (Lane B, 2026-11-20)

Run ID `2026-11-20T11:55:22Z-loop2-leg5-r256`. Lane B occurrence 06:00 CST
Nov 20, 2026. Rotation-b 5 (social life); this run plays 5, adoption
writes 6 at closeout. Base at run start: master `683c9a6e5` (ship-loop
version bump of the r255 endgame adoption).

**Adoption:** the run timed out at 3600s before its probe run. Adopted
Nov 20 ~06:58 CST by a fresh worker: coordinator verified dead by live
process check (no WT_RUN_ID process for r256), orphan heartbeat loop
PID 48425 killed by exact PID, adoption heartbeat stamped from
`date -u`. A host write flap ran 11:46–~12:05Z Nov 20; writes re-probed
OK before every write phase. Prereg:
`evidence/2026-11-20/journey-social-life-r256-prereg.md`.

## Headline

- **Arm C (gossip-ask dry) — FIXED and confirmed in the wild: F6
  dry-lines 0 panel-wide, bar 0 — GO.** The r239 site (Sigrun,
  C-friendship, day 45, seed 45766) is closed.
- **TRAIL — GO:** distinct 8 (bar ≥6), max recurrence 2 (bar ≤4).
- **M4-SPLIT — NO-GO by one flag: conversational 13 (bar ≤12).**
  Investigated (below): no dominant thin pool, no flag attributable
  to the fix, total near-dup flags fell 181 → 140 vs r239. The bar's
  headroom (r238 corpus 7 + 5) was too tight for fresh seeds, and 3 of
  the 13 are same-opening artifacts on discourse openers. Recorded as
  a metric-review item for the next social run; it does not block the
  Arm C fix (see Adjudication).
- **Outing conversion watch still missed: 13.0%** (6 kept / 46
  attempts; watch ≥25%). The outing-chain re-tune question, reopened
  in r239 at 16%, stays open.

## Arm C: the gossip-ask dry line — mechanism and fix

### The wild sitting (r239, seed 45766, committed JSON)

Sigrun Eiriksdottir, C-friendship, day 45, 9 turns
(`social.transcripts[41]`): the share_news opener fires with an empty
news payload ("About that news I was bursting to share — Okay, so —
something happened this morning." → "That's the whole of it. Sorry."),
then the gossip ask ("What's the word? What should I know?") answers
"…Sorry, lost my train of thought." Two turns later the same sitting
serves real gossip (Ingrid). One dead turn, not a dead sitting — but
the F6 bar is 0.

### Attribution (probe, not blind fix)

A staged probe (seed 256000, trust staged to 40 so gossip opens,
poison set = 20 exhausted-pool strings + 9 bare idle composites,
re-applied before every trial sitting) reproduced the site on the
unfixed code: control 6/6 asked, 0 dry; trials 30/30 asked, **18
dry**. A replay of the r239 driver diverged at sitting idx 29 (game
code changed since r239's base), so the mechanism was pinned by the
staged probe, not the replay.

The null comes from the **ledger-blocked fallback**, NOT from want
resolution and NOT from the gossip pool:

- The want resolved fine; the gossip engine had content (Ingrid gossip
  served two turns later).
- Turn 2's "That's the whole of it. Sorry." is the `dlg:more` dry
  closer — the news beat (fixed treeline sighting line) was
  run-ledger-blocked, so the thread went dry-honest. It is NOT an F6
  dry line.
- Turn 6: the ask:gossip turn's line is composed (a random 1-of-3
  topic ack is prepended; the composite is one ledger chunk). The
  DRY2 guard (r234, `conversation.js` tail) replaces a run-ledger-blocked
  composed line with an exhausted-pool pick — but the pick was NEVER
  checked against the ledger. The exhausted pool (20 fixed strings)
  cycles per villager, not cross-villager, so a pick another villager
  spoke recently is handed to `sayLine` blocked and dry-replaced. The
  gossip engine's idle admission is 3 fixed strings; both fixed-string
  pools collide in the 48-entry run ledger.

### The fix

`src/js/conversation.js`, DRY2 guard (~line 8151): after picking the
exhausted replacement, walk the pool for a variant the ledger check
would NOT refuse (r186/r192 pattern); if every variant is blocked,
speak the pick as structural (r169 wind-down class — the honest "I've
told you everything I know" admission is conversation grammar, not
content).

### Design question answered (prereg Arm C)

The opener is NOT the trip-wire, so the opener stands as-is: the
ask was independently dry and the ask was fixed. The opener's
dry-honest closer is correct behavior for a ledger-blocked beat.

### Proof test

`scripts/test-journey-social-life-r256-gossip-dry-20261120.js`
(r238 proof style: reporter, control + discriminator sections).
RED before the fix: 7 passed, 2 failed, dry=18, exhSpoken=0. GREEN
after: **9 passed, 0 failed**, dry=0, blocked asks speak an
exhausted-pool line. Temporary `CONVO_BLOCK_LOG` instrumentation in
`sayLine` was removed before the fix was finalized (grep-confirmed
absent); the diff is clean: only the fix in `conversation.js`
(+21 lines).

## Standing proofs — all GREEN on the fixed code

- M4-split 30/30, corpus regression exact (181 flags / 174
  instructional / 7 conversational)
- F5 harness 50/50; F6 dry-opener 49/49; TRAILTALK 30/30;
  repay-fallback 36/36
- New gossip-dry proof test 9/9 (above)

## Panel (seeds 45773–45776, DAYCAP 140)

Driver `scripts/journey-social-life-r256-20261120.js`, exit 0, ~61s.
JSONs in `evidence/2026-11-20/journey-social-life-r256-4577{3,4,5,6}.json`.

- 45773: village-lost/scattered day 75 (hungryDays 5, aliveEnd 8)
- 45774: survived day 141, alive 1
- 45775: survived day 139, alive 8
- 45776: village-lost day 97, alive 0

Determinism: SEEDS=45773 re-run to `/tmp/r256-determinism` — JSON
identical except wall-clock `ms` (10s vs 23s). Determinism confirmed.

Analyzer `scripts/analyze-journey-social-r256-20261120.js`, exit 0.
Full output: `evidence/2026-11-20/journey-social-life-r256-analysis.log`.

### Binding bars

- **F6 WILD HOLD — GO: dryLines=0 panel-wide (bar 0).** No dry
  servings. The r239 site is closed in the wild.
- **TRAIL WILD HOLD — GO: presses=24, distinct=8 (bar ≥6),
  maxRecurrencePerSeed=2 (bar ≤4).** The 3-press driver walks the
  pool (r238: distinct 2 = pool[0] twice).
- **M4-SPLIT — NO-GO: instructional=127, conversational=13 (bar
  conversational ≤12).** Missed by one flag. Investigation below.
- **F5 WILD CHECK (report-only): V1=2, V2=0, V3=0, total=2** (r239:
  V1=1 V2=2 V3=0, total 3). All V1 on 45774. **V3 still never served.**

### M4-SPLIT investigation (prereg: "a miss is NO-GO; the run
### investigates which pool is thin")

The 13 conversational flags, by cluster (no cluster above 2):

1. ack-prefixed exhausted line vs ack-prefixed gossip line
   (ava_garcia) — the exhausted line comes via the pre-existing
   `exh()` fallback path (empty beat → tail composes ack + exh),
   NOT via this run's fix (the fix speaks the bare pick, no ack).
2. Belonging pair, same two lines mirrored across two villagers
   (lena_ruiz, stan_kowalski) — "Back home I was invisible..." /
   "Back home nobody noticed me..."
3. Plant-teaching template, same template with different slots
   (carlos_diaz ×2) — White Yam vs Shepherd's Purse; cellar vs spring.
4. Silence-pool pair, same two lines across two villagers
   (gen_xdpmqrd, wanjiru_kamau).
5. Murder/ambush template, different event word / name
   (gen_cowzrh3, chloe_dubois).
6. Recap "going in circles" prefix pair (raj_patel).
7. Favor re-ask variants (chloe_dubois).
8. Hunger-plea pair (gen_s7xf5y5) — 1 flag only.
9. "I don't know..." same-opening pair (app_mgpsphea310) — different
   content, shared opening words.

Findings: **no dominant thin pool** — the flags spread across 9 small
clusters (max 2 each). The hunger-plea pool, the prereg's named
next-content-arm candidate, contributes only 1 of 13, so **no content
arm is indicated**. Three flags (#1 ack prefix, #9 "I don't know",
#4/#5 silence pair) are same-opening artifacts on discourse openers,
not repeated content. **None of the 13 is an exhausted-line repeat
from the fix** (the fix's structural lines never repeat within a
sitting; the one exhausted line among the flags is the pre-existing
`exh()` path). Total near-dup flags fell 181 (r239) → 140.

Metric-review proposal for the NEXT run (not this one): the bar's
headroom was set as r238 corpus 7 + 5 = 12, but fresh seeds read 13 —
either the headroom needs widening, or the same-opening classifier
should ignore discourse openers (acks, "I don't know", "You say
nothing"). The instructional count (127) is watch-only; the
Haven-door positioning cluster still dominates it, as in r239.

### M1–M12, B5, B6 (same bars as r239)

- **M1 GO:** 11 plots, 11 arms, grievance-linked 11/11 by the reasons
  bar (binding judge); springs 9 (hurt 3, killed 4, escaped 2);
  expired plots 2 (r239: 0 — watch); vendetta maxUnordered 4
  (Chloe↔Raj).
- **M2 rate 0.241** (109 proposals / 452 lived days; r195 0.328,
  r200 0.177 — watch only).
- **M3 GO (sometimes-taken):** lure 314 accept / 278 decline; party
  23 accept / 12 decline; bond 5 accept / 12 decline.
- **M4:** 410 transcripts, 140 nearDupFlags (r239: 448 / 181) — down.
  Same families as r234–r239: Haven-door positioning instruction
  cluster (dominant), repeated live-want re-asks, teach-lesson
  same-opening template.
- **M5 report-only:** 2/4 past d100 (r239: 3/4). **Moots 3** (r239: 7).
- **M6 GO** (re-aligned gate definition): away-gate 0 on all four
  kinds; debates kicked/settled 162/162. Strict-definition away total
  76 (r239: 67) = known metric/gate discrepancy, does not fail M6.
- **M7 HOLDS:** NARR-DUP verbatimRepeats 0 (conversations 424).
  **M9 HOLDS:** recap 391 presses, 0 after cap. **M10 HOLDS / FACE
  HOLDS:** coach/face verbatim 0.
- **M11 GO:** recap-empty flags 0/140.
- **M12:** door-req flags 82/140 (20.00%; r239 107/181, 23.88%);
  worst sitting 9 serves (45774). **M12-native HOLDS:** threeTimes
  total 52, max 1 per sitting, 0 sittings 2+, exits 143.
- **M8 SETTLED:** 1 settle, 1 link-formed, 0 BLOCKED re-raises after
  a settle.
- **B5:** 14 funerals — 11 full / 2 partial / **1 none** (45774; the
  d93 Carlos funeral: pantry held nothing, so no shaken fire could
  be fed — mourned, unmended; honest behavior, watch only).
- **B6 GO:** 416 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 25 total, 9 confessed, 0 double-confession sittings.
- **BOND ANSWERED:** 109 villager-initiated proposals (109 villager +
  0 scholar; 60 link, 49 person; 28 accepted, 12 refused, 46
  staged, 23 expired). Person accepted 15.
- **RE-OFFER max 12** (same watch level as r236/r237/r238/r239).
  **DROPPED-THREAD: 0 drops** (r239: 1 — the dry sitting). The fix
  also closed the dropped thread.
- **SCATTERING: 1/4** (45773 d75; r239: 2/4).

### Outing chain (watch)

46 attempts, 6 kept, deliveredKcal 4605, **conversion 13.0%**
(watch ≥25% — missed; r239: 25 attempts, 4 kept, 16%). TRAIL's bar
is met but the chain still drops most attempts; the re-tune question
stays open.

## Telemetry

Canonical baseline `telemetry-baselines/social.json` does not exist
in the tree (same as r238/r239). Ad-hoc comparison: baseline built
from the r239 panel JSONs in /tmp, r256 checked against it with
`telemetry-check.js` on the real-signal metrics
(`social.moots`, `social.fullConvs`, `social.transcripts`,
`bondProposed`, `confrontEvents`, `outingArm`, `mootNotes`,
`funeralMendStats.funerals`). **One LOUD line:
`outingArm swung 84%: baseline 25 -> current 46`.** Investigated:
not attributable to the fix — the fix touches only the conversation
dry-line guard; outing attempts are scheduled by the outing arm and
driven by world state (r256 villages lived 452 days vs r239's 510,
2/4 died before d100). Kept barely moved (4 → 6) while attempts
nearly doubled, i.e. the extra attempts are mostly declines/aborts —
seed/world variance in attempt volume, and the conversion watch
above is the real signal. **Baseline NOT rolled** (no canonical
baseline exists; the /tmp r239 baseline is an ad-hoc comparison
artifact, not committed). All other metrics quiet (moots 7→3,
bondProposed 139→109, confrontEvents 38→25, funerals 23→13,
transcripts 458→424).

## Gate (`check.js --quick`)

Two runs, both on the rebased tip `ed19c3d57`:

- **Flap-contaminated run (14:17–14:36Z): 329 passed, 15 failed.**
  A host write flap (window since ~14:25:45Z, confirmed by the
  watchdog) overlapped the run's tail: 5 failures were EPERM write
  refusals (proof-text-identity, telemetry-check-recorder,
  sw-audio-cache copyfile, prepared-runner-custody,
  deathcleanup-instrument), 4 were 120s timeouts under flap + a
  concurrent sibling gate, and the flap truncated `docs/ONTOLOGY.md`
  to 0 bytes in the worktree at ~14:30:08Z. Log preserved as
  `evidence/2026-11-20/check-quick-r256-adopt-flap.log`. The
  ONTOLOGY.md truncation was restored byte-identical from HEAD
  (hash `c4fcc0454e5d20095f3d16631186b5b62550fdde` matches HEAD) and
  never committed.
- **Fresh re-run after the flap cleared (15:22–15:32Z, fresh boot):
  339 passed, 5 failed in 596s.** All 5 are standing failures,
  **0 attributable**:
  - measurement-proof staleness pair: test-measurement-proof-update
    ("Proof source inputs are not current") + test-measurement-workflow
    ("retained neutrality proof covers the current Game/controller/
    harness inputs") — proof re-sign round 22 owed, unchanged on master.
  - phone-frame stale receipt: test-phone-frame-proof (index.html +
    5 data files) — standing.
  - 120s timeouts: living-garden + one-person-army deed-attainment —
    the known cap issue (they exceed 120s even solo on a fresh boot
    with no concurrent gate).
  - Everything the flap run flagged beyond the standing set passed
    fresh: foodpower (ontology validator green — the conversation.js
    edit does not trip it), occupation-panels, measurement-cache-flags,
    proof-text-identity, telemetry-check-recorder, sw-audio-cache,
    prepared-runner-custody, deathcleanup-instrument,
    trust-observer-neutrality, capable-bot.
- Log: `evidence/2026-11-20/check-quick-r256-adopt.log`.

## Adjudication

Panel verdict is **MIXED**: the run's headline arm (F6) is GO, TRAIL
is GO, and every M1–M12/B5/B6 bar holds or is report-only — but the
binding M4-SPLIT bar reads 13 vs ≤12, a NO-GO by one flag.

The fix lands. Reasons: (1) the arm's own bar is met with a RED→GREEN
proof test and a 0-dry wild panel; (2) the M4-SPLIT miss is not a fix
regression — no flag is attributable to the fix, total near-dups fell,
and the miss traces to bar headroom + classifier artifacts on
discourse openers; (3) precedent: landing r148 landed its fixes under
a panel NO-GO on an unrelated binding bar, with the verdict recorded.
The M4-SPLIT miss is recorded here as an open metric-review item for
the next social run, not re-scored mid-run.

## Files committed

- Fix: `src/js/conversation.js` (DRY2 guard, +21 lines)
- Proof test: `scripts/test-journey-social-life-r256-gossip-dry-20261120.js`
- M4-split classifier + proof test (r250 draft, carried):
  `scripts/journey-social-r226-helpers.js`,
  `scripts/test-journey-social-life-r250-m4-split-20261119.js`
- Driver: `scripts/journey-social-life-r256-20261120.js` (Arm B
  3-press trail driver)
- Analyzer: `scripts/analyze-journey-social-r256-20261120.js`
- Probe script: `scripts/journey-social-life-r239-PROBE-45766.js`
- Prereg, run note, analysis log, panel JSONs ×4:
  `evidence/2026-11-20/journey-social-life-r256-{prereg.md,.md,
  -analysis.log,-45773.json,-45774.json,-45775.json,-45776.json}`

## Open items (carried forward)

- M4-SPLIT metric review for the next social run: bar headroom
  (7 + 5 = 12 read 13 on fresh seeds) and/or same-opening classifier
  ignoring discourse openers. No content arm indicated (hunger-plea
  pool 1/13).
- Outing-chain re-tune question stays open (conversion 13.0%,
  watch ≥25%; attempts nearly doubled while kept barely moved).
- F5 V3 still never served in the wild (V1=2, V2=0, V3=0).
- B5: one none-funeral on an empty pantry (honest, watch only).
- Expired plots 2 (r239: 0 — watch).
