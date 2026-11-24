# Second-link stage classification — Loop B, run fleshout-loop-b-20261124T1030Z, arm sim-linkform-b (DIAGNOSTIC)

Axis: winnability chain (re-point 2026-11-03). DIAG-ONLY arm: zero
src/js changes. This arm answers the 0840Z next blank #5 /
standingconfirm blank #2: diplomacy is structurally zero — why the
second link never forms.

Anchor: HEAD `c4d4fd01ccc08319a0d53f9d60a6cfe970fdec05` at prereg time.
Policy `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Seeds 109309–109324 (16 — the replay band named in the
brief). Horizon 150 days, death-aware. Balanced panel (§15):
INAPPLICABLE — a pure diagnostic decomposition, no before/after
change; no comparison is fabricated. Analysis JSONs are attached
instead.

## The question, as frozen

Standingconfirm (16 seeds 109310–109325, anchor `60f6e7436`):
15 seeds form exactly ONE link each (a plain haven↔village link,
kind null); 109316 forms none in 49 days. A seasoned link appears
on 7 seeds — seasoned, but one lone link can never be a realm
(`polityOf('haven')` needs >= 3 seasoned subordinates), so it
scores 0. No seed ever has 2 links, let alone 3. Max counting
links 0, max Haven polity size 0, `pendingNational` NEVER present,
`scaleRefused` never set. The season gate was open for weeks on
14/15 regional seeds — the gate is not the blocker. The region is
not empty: a foreign polity exists (count 1) on 15/16 seeds — the
BELONG road's precondition, a realm to join, standing there while
Haven, with one link to a different village, never becomes anyone's
subordinate. Accordanswer adds: accords ARE answered 7/7 under the
drive, yet no link ever forms, no offer/counter is ever staged.
The link-forming rate, not the seasoning rate, is the zero. WHY
does the second link never form?

## Canon grounding (read before the judged leg)

- `docs/SCALE.md` covers links / diplomacy / realms — it IS the
  canon doc for this target (no canon gap to declare). National =
  one primary with ≥3 SEASONED subordinates (seasoned = 30+ days
  old AND trust 40+); six roads in (LEAD / BELONG / COVENANT /
  TRADE / CONQUEST / REFUSE); foreign polities grow off-screen by
  engagement, drift-only never passes a pair; peer proposals need
  opinion ≥ 10.
- `docs/SCALE-DISCOVERY.md` covers the discovery pointers (beats
  4–5: the wave-4 / national pointers that should teach the climb).
- Code, verified by reading (not assumed) — the ladder has exactly
  THREE stages: `src/js/ladder.js` `villageLadder()` loops
  `for (s = 1; s <= 3; s++)` and `ladderStage()` "never returns 4";
  `ladderGrantStageReward` in `src/js/metaProgression.js` grants
  only s=1 (trader), s=2 (shelter), s=3 (link) — so the ladder can
  grant AT MOST ONE link ever, at stage 3. `_formLink` has exactly
  four callers (grep, all of src/js): `proposeLink` (score ≥ 55),
  `answerCounter` (accept / sweeten), `answerRaid` (terms /
  strike), `_ladderRewardLink` (stage-3 reward). The raise machine
  (`bond-initiation.js`, grounding carried from secondlink-a):
  `stageLinkRaise` gates (raiser alive, person-trust ≥ 20,
  `build_standing` ≥ 1, raiser personally knows the village,
  village unlinked, no pending raise, 14-day re-raise cooldown, no
  undelivered talk request); `npcLinkRaiseTick` (daily, ≤1
  staging/day, hash-roll lottery 0.5, pendings expire after 2
  days); `acceptLinkRaise` tells the lore then calls `proposeLink`.
- Prior decomposition carried forward (NOT re-proven here, cited
  as the baseline this arm replays on a new band):
  secondlink-a (band 99101–99108): 91 second raises staged, 89
  expired + 2 pending-at-end, 0 accepted, 0 refused — because
  competent never takes a conversation turn (`talkRound` opens one
  conversation a day and walks straight out, zero turns); the
  first link on all 8 seeds was the ladder grant (stack trace on
  99101). Havenlink-b (band 109301–109308): Haven's one link never
  points at the foreign primary; the link target IS inside the
  foreign realm on 5/6 regional seeds; 0 propose/counter/national
  events; join path `no-join-path-offered` on all 8 seeds.

## Seed-band note (frozen)

The brief names the replay band 109309–109324. Standingconfirm's
ACTUAL corpus is 109310–109325: its prereg shifted the band by one
because seed 109309 was spent as a dedicated probe by
journey-deepening-r278. Consequences, frozen here:

- Reproduction check (leg 4 below) runs on the 15 OVERLAPPING
  seeds (109310–109324) against the standingconfirm per-seed
  JSONs in `evidence/2026-11-24/perseed-standing-gearready-b/`.
- Seed 109309 has NO standingconfirm counterpart and is judged
  on this arm's own corpus only. It was spent as a probe under a
  different config; a replay is not a fresh-band measurement, and
  this arm is a diagnostic replay by design, so no freshness is
  claimed or needed for it.
- Seed 109325 is NOT in this arm's band and is not run.

## Instruments (reused verbatim, NOT rebuilt)

- `scripts/secondlink-instrument-20261110.js` (raise recorder:
  daily pending raises + raiseState + link roll + per-villager
  eligibility census + known-village roll + linktick lottery +
  `bond_proposed` tele capture + wraps on stage/accept/decline/
  proposeLink/npcLinkRaiseTick) — commit `874c89f89` on this
  tree's history; `git diff HEAD` empty.
- `scripts/havenlink-b-instrument-20261124.js` (layers over the
  standing instrument: foreign-polity FULL entries, Haven links
  with BELONG bar, `_formLink` / proposeLink / `_stageCounter` /
  national-beat wraps, link say-lines) — commit `f2cb6a4f7`;
  `git diff f2cb6a4f7 HEAD` empty for the instrument + driver +
  analyzer + proof.
- `scripts/standing-gearready-b-instrument-20261124.js` +
  `scripts/standing-gearready-b-analyze-20261124.js` (standing
  decomposition + `summarizeSeed`, used for the reproduction
  fields and wall numbers) — `git diff f74931e6 HEAD` empty for
  the instrument + analyzer + `scripts/policies/competent.js`.
- NEW thin layer, this arm only: `scripts/linkform-b-driver-20261124.js`
  (installs BOTH instruments, snapshots both daily, calls the
  secondlink lazy tele install), `scripts/linkform-b-analyze-20261124.js`
  (stage classification + contrasts + reproduction), proof
  `scripts/test-linkform-b-20261124.js`. Zero src/js changes.
  Install order: havenlink first, secondlink second (both wrap
  `proposeLink`; the chain is call-through both ways).
  Uninstall in reverse. Any wrap whose zero is read as evidence
  must have its call path verified live first (secondlink-a
  lesson: the `stageLinkRaise` wrap is DEAD — `npcLinkRaiseTick`
  calls the closure directly — so staging is read from tele
  events + snapshots, never from that wrap).

## Stage definitions (FROZEN — recorded so the next arm can reuse them)

Per seed, the second-link stage reached is the HIGHEST stage whose
condition is met. Counting rules: link events counted from
deduped `_formLink` LOG rows (day + target + caller; one row per
formation); raise stagings counted from `bond_proposed` tele
events RECONCILED against snapshot transitions (a staging must
appear in `pendingRaises` or leave it with a matching
`linkRaiseState` entry within 3 days — the secondlink-a
reconciliation rule); propose/counter counts from the wrapped
method rows. A "second raise" is a raise staged for a village
other than the village of the FIRST formed link, staged on a day
when ≥1 link already exists. Raises staged before any link exists
are first-link attempts, not second raises.

- **S0 `no-link`**: no link ever forms on the seed.
- **S1 `first-only-no-second-staging`**: exactly one link forms;
  ZERO second-raise stagings on the whole run.
- **S2 `second-staged-lost`**: ≥1 second raise staged; every one
  expired unanswered or was pending at run end; none accepted, none
  refused, no proposeLink call for a second village, no counter.
- **S3 `second-offered`**: a second link was OFFERED — at least one
  of: a raise accepted (`acceptLinkRaise` ok), a `proposeLink`
  call for a second village (any outcome), a counter staged for a
  second village. Sub-stage recorded: accepted-but-declined /
  counter-staged / counter-answered / propose-formed-then-lost.
- **S4 `second-formed`**: two active Haven links at once on any
  day (max active links ≥ 2).
- **S5 `polity`**: `polityOf('haven')` non-null on any snapshot
  (≥3 seasoned subordinates). Not expected on this band; recorded
  if seen.

Also recorded per seed (not part of the stage): first-link
provenance (ladder reward vs raise vs other — via the `_formLink`
caller marker + ladder stage crossing on the link day + propose
call count); max active links; seasoned-link flag (any link
seasoned at end); foreign polity present (max size, primary named,
first/last day); whether Haven's link target is inside the foreign
polity; gate census top gates (from the daily raiser census, same
shape as secondlink-a); raise fates (expired / pending-at-end /
accepted / refused); propose outcomes; counter events; national
events.

## Pre-registration (binding, §11/§14) — FROZEN BARS

DIAG-GO requires ALL of:

1. **Every seed classified** — all 16 seeds carry a second-link
   stage (S0–S5) with its supporting counts; 0 UNCLASSIFIED
   (unclassified = no stage assigned, an orphan `_formLink`
   event with no link in any later snapshot, or a `bond_proposed`
   tele event irreconcilable against snapshots).
2. **The blocker named with counts** — the stage distribution is
   stated, AND the dominant loss point is named with its counts
   (e.g. second raises staged N, expired N, accepted 0; or zero
   second stagings on N seeds with the top blocking gate and its
   raiser-day count; or second link offered N times with the
   outcome that killed it). "Nobody ever tries" and "tries die
   unanswered" must be distinguished by the numbers, not asserted.
3. **Contrasts stated** — (a) seeds WITH a seasoned link vs
   WITHOUT: stage reached, second-raise stagings, first-link day,
   foreign-polity presence — per group; (b) seeds WITH a foreign
   polity vs the one(s) WITHOUT: stage reached, max foreign size,
   whether Haven's link target is inside the foreign polity.
4. **Reproduction** — the 15 overlapping seeds reproduce the
   standingconfirm corpus on all 8 frozen fields (days,
   endReason, scaleRank, maxWave, endUnlockedWave, bestCapped,
   doorOpenDay, daysAt199). The anchor HAS moved since
   standingconfirm (`60f6e7436` → this HEAD): intervening src/js
   commits are holdspeak-a, departteach-a (both voiced beats),
   and landing r158 contest-end telemetry — all voice/telemetry,
   no mechanic change claimed in their evidence. If a seed
   diverges, the leg FAILS as written (no re-scoring): the
   evidence names the diverging seeds/fields/first-divergence
   day, and the verdict drops to DIAG-PARTIAL (bars 1–3 pass,
   reproduction failed) with the divergence attributed or left
   unattributed, stated plainly.
5. **Instrument health** — 0 instrument errors on every seed;
   snapshots complete (daily rows from first to last day, no
   gaps > 2 days except after village death); tele/snapshot
   reconciliation 100% (0 irreconcilable `bond_proposed`
   events); proof `scripts/test-linkform-b-20261124.js` green
   BEFORE the judged legs.

Pilot gate: seeds 109309–109316 (8) run FIRST. The pilot passes
only if instrument health (leg 5) holds on all 8 AND every pilot
seed classifies (leg 1 on the pilot subset). If the pilot fails,
STOP — do not run the remaining 8 seeds; report and await the
coordinator. The pilot seeds ARE part of the judged corpus (the
replay band is the judged corpus); the pilot is a spend gate, not
a separate band.

Secondary rates (recorded, NOT judged): wins / national / table;
wave-4 faced, wave-5 unlocks / faced / kills; median survival;
death-cause shares (standing analyzer's counts); first-link day
distribution; ladder stage reached per seed (does any seed reach
stage 3 twice — impossible by construction — or grant a second
link by any path).

## Sense-testing law

Transcripts are read: link-formation lines, raise lines, foreign
polity rumor lines, and the accord lines around each seed's link,
judged for meaning, coherence, repetition, and robotic behavior —
never just counts. The sense sample lives in the per-seed JSONs
(`linkLines`, `linkSays`, `saySample`) and is quoted in the
evidence file.

## Deliverables

- This prereg, committed BEFORE any judged sim.
- Driver + analyzer + proof (new files, this arm; zero src/js).
- Per-seed JSONs under `evidence/2026-11-24/perseed-linkform-b/`
  (16 files, `-linkform-b` in the RUN slot; driver refuses to
  overwrite).
- Evidence `evidence/2026-11-24/sim-linkform-b.md` with the
  per-seed stage table, pooled stage distribution, the blocker
  named, both contrasts, village assessment in plain words, wall
  numbers, next blank named (build lever or design call), and a
  "metric review" section (§14; no in-run re-scoring).
- Zero src/js changes. No push, no bump, no live verification, no
  merge (coordinator merges --ff-only; ship loop owns deploys).
- No second band / no confirm-of-confirm without coordinator
  say-so.
