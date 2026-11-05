# sim-awaynaming-rereg-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-awaynaming-rereg-a (Loop A, food-economy / narration).
Run: fleshout-20261105T2215Z. Assignment: RE-REGISTER the killed
awaynaming fix under a corrected prereg and re-run the same 31 seeds.
This arm claims the sim-findings.md awayNaming-cap item (already
[CLAIMED 2026-11-05] by the cap-a run; this run carries the claim).

## The defect and its history (measured, not assumed)

- sim-gossipcensus-a (31 seeds): a haven-gossip burst fires inside a
  stranded scholar's sleep window at the background rate (2/25
  stranded sleep windows = 8.0% vs 134/1,670 non-stranded = 8.0%).
  Sense verdict READS WRONG ("Back at the haven the argument
  starts: ... weigh in if you want" to a scholar asleep miles away).
- sim-gossipfix-a (run fleshout-20261105T1515Z, adopted 1715Z):
  shape (a) — gate burst + settle delivery on being at Haven, hold
  until return — judged NO-GO and KILLED. Primary PASSED (0 stranded
  burst events in 25 windows, before 6; 0 stranded settles, before
  10) but guardrail (ii) FAILED: `holdNamingNews` capped
  `scholar.awayNaming` at 12 entries and dropped the oldest —
  15009 lost 1 burst line, 17010 (9-night stranding) lost 24 lines
  (17 burst + 7 settle), 7 settlements never reached the scholar.
- sim-awaynaming-cap-a (run fleshout-20261105T1915Z, adopted 2115Z):
  the same gate re-done with the cap REMOVED (uncapped queue).
  Judged NO-GO on exactly ONE check — guardrail (i), non-stranded
  sleep burst rate 7.9% (140/1767) vs before 11.6% (205/1767),
  Δ −3.68pp vs the ±3pp band (missed by 0.68pp). Everything else
  PASSED: primary 0 stranded burst events in 17 windows, 0 stranded
  settles; ledger conservation exact (said + stillHeld == kicked,
  0 lines lost on all 31 seeds); 16/16 away stretches conserved;
  trajectories identical 31/31; the relay's 8 dropped lines
  recovered; totals ROSE (2103 vs 2095). Permanent record:
  evidence/2026-11-05/sim-adoption-round-2115.md (verdict table +
  metric review) and evidence/2026-11-05/sim-awaynaming-cap-a.md
  (on the abandoned branch, commit 5b113fe3a — NOT on master).
- The (i) miss is a phase shift (sleep→daily delivery on return),
  NOT silencing — the 2115Z metric review's own words. The metric
  was a phase-shift meter, not a silencing meter: the before-leg
  sleep rate (11.6%) includes 65 relay-flushed lines that the after
  leg deliberately delivers in daily phase on return, while total
  lines said actually rose. The review's proposed revision for the
  NEXT run — applied here, before any judged sim — is to judge
  silencing by the ledger and keep the sleep-phase rate as a
  descriptive phase-shift report. This prereg is that revision.
  The 2115Z verdict stands NO-GO under the prereg as written; this
  run does NOT re-judge that corpus. Fresh corpus, corrected prereg.

## The fix (re-applied, not re-invented)

Cherry-pick commit ee787f220 ("[needs-eyes] sim-awaynaming-cap-a:
gate naming-burst + settle delivery on being at Haven, UNCAPPED
queue") from the abandoned branch tip 8c5bcf095 (base 2d72f104a;
branch deleted, commits preserved as objects) onto this branch,
based on current master 555f59160. The cherry-pick must apply
cleanly; if it does not, the same shape is re-applied by hand from
`git show ee787f220` and the evidence file says so. The fix is
unchanged in shape: `holdNamingNews` (no cap — just push),
`sayNamingNews` (playerAtHaven gate), `deliverHeldNamingNews`
(framing line + held lines verbatim, queue spliced empty, called
from `returnToVillage`), three call-site swaps (monsterNewsCheck
word, seedMonsterNames debate, monsterNamingCheck settle). The r141
haven-news relay keeps killer-tale prose and the endDay witness
line only. No gate/price/deed change. [needs-eyes] stays in the
fix commit message (narration/feel change).

Substrate, unchanged since the cap-a run: the r141 haven-news relay
(`sayHavenNews` / `pendingHavenNews`, cap 20 + flush filters) is
the BEFORE leg's behavior. The relay already gates stranded
delivery and DROPS lines, so before-leg totals understate the
kicked debate; guardrail (ii) is therefore the kick-ledger
identity (carried verbatim from the cap-a prereg, including its
Correction 1 queue-snapshot method for (ii-b), which is the
preregistered method here from the start — not a mid-run
correction). RNG-neutrality by construction, unchanged:
`rotLine` draws zero RNG; proposals are seeded either way;
`monsterNamingCheck` state changes run regardless of position;
only the `say` is gated; held text is said verbatim on return
(no fresh roll at delivery). Trajectory identity (iii-b) proves
it empirically.

## Canon

No single canon doc covers naming-news position-gating. The design
lives in evidence/2026-11-05/sim-gossipcensus-a.md (the defect,
DIAG-GO), evidence/2026-11-05/sim-adoption-round-1715.md (the
gossipfix kill + fix direction), evidence/2026-11-05/
sim-awaynaming-cap-a.md (the cap-a run, branch commit 5b113fe3a),
and evidence/2026-11-05/sim-adoption-round-2115.md (the 2115Z
verdict + metric review). docs/CONVERSATIONS.md (dialogue/gossip)
read; no canon doc prescribes the naming debate's delivery
position. docs/CANON.md standing rule "If you don't know, it
doesn't show" supports holding unheard haven talk. If no doc
covers a target, this prereg says so instead of inventing.

## Band freshness (whole-token grep, ALL dated preregs + evidence .md)

Scope searched: `evidence/*/sim-*-prereg.md` (whole-token grep,
run 2026-11-05 from the main tree, which holds the full prereg
history). RESULT: the band is NOT fresh. Every seed is named in
prior preregs — the band as a whole (the 17001–17024 screen range
and the 8 pilot seeds) is named in sim-gossipcensus-a-prereg.md,
sim-gossipfix-a-prereg.md, and sim-awaynaming-cap-a-prereg.md
(same lineage). REUSE IS BY DESIGN, not a fresh-band claim:
before/after on identical seeds is the methodology (§15), and the
gossipcensus corpus itself is STALE on current master, so the
BEFORE leg MUST be re-run on current master first. No fresh band
is claimed anywhere in this arm.

## Primary metric

Stranded-window burst incidence on the AFTER leg, same 31 seeds,
same driver, same substrate as the fresh BEFORE leg:

- Stranded night / stranded sleep window / stranded upkeep window:
  the census definitions, unchanged (nighttravel outcome
  `travel-refused` or `out-of-reach` AND scholar not inside Haven
  at daily exit).
- Denominator = stranded sleep windows (primary) + stranded upkeep
  windows (reported; upkeep can never fire a burst by mechanism).
- Numerator = stranded windows containing >= 1 primary-burst event
  (either half; adjacent word+debate = 1 event, census collapse
  rule, unchanged). Stranded settle lines counted separately.
- BEFORE leg (fresh, pre-fix relay behavior on current master):
  reported in the evidence file, NOT the judge — the relay
  already gates, so expect ~0 stranded events before as well. The
  before leg's job is to measure the RELAY (its stranded count,
  its drop count via the ledger, its held volumes), not to
  reproduce gossipfix's 6-in-25.
- GO threshold: stranded sleep windows with burst = 0 events AND
  stranded settle lines = 0 on the AFTER leg (31 seeds). A miss is
  NO-GO, never re-scored.

## Guardrails (all must hold for GO)

(i) NO SILENCING of in-haven debate — RE-REGISTERED (the 2115Z
metric review's proposed revision, applied here before any judged
sim): silencing is judged by the LEDGER — said_after == kicked,
exact, per kind per seed. This is the same identity as guardrail
(ii-a); it is promoted here to the silencing judge because the
ledger is phase- and position-independent: it counts every kicked
line exactly once, wherever and whenever it was said, and any
silenced line breaks it. GO iff the identity holds exactly on all
31 seeds, per kind. The non-stranded sleep burst rate is reported
DESCRIPTIVELY ONLY as a phase-shift report (after vs before rate,
with the sleep→daily moved volume): it carries NO band and is NOT
a GO/NO-GO check in this run. The old ±3pp sleep-rate band is
retired — it measured the designed phase shift, not silencing
(2115Z: before 11.6% = natural rate + 65 relay-flushed lines;
after 7.9% = natural rate alone; totals rose 2103 vs 2095).

(ii) THE DEBATE STILL REACHES THE RETURNING SCHOLAR — ledger
conservation + held-volume accounting (carried verbatim from the
cap-a prereg, incl. Correction 1 as the preregistered method).
The compare script (scripts/awaynaming-compare-rereg-a.js, NEW,
this arm — the cap-a compare with guardrail (i) re-registered
per this prereg) computes all of the following from the two
corpora + the per-seed naming ledger the driver records.

(ii-a) LEDGER CONSERVATION (the judge): for EACH seed and EACH
kind (word / debate / settle), the AFTER leg satisfies
  said_after + stillHeld_after == kicked,
where `kicked` is the ledger count (word: monsters with
namingKicked; debate: kicked monsters with >= 1 proposal;
settle: monsters with villageName) and `stillHeld_after` is the
awayNaming queue contents at end of run. GO iff this holds
exactly on all 31 seeds — 0 held lines lost. The ledger is
recorded by the driver at end of run from
`Game.state.codex.monsters` (reads only), identical on both legs.
The same identity on the BEFORE leg MEASURES the relay:
  said_before + stillHeld_before + relayDropped == kicked,
where `stillHeld_before` is the pendingHavenNews queue contents
at end of run (kinds word/debate/settled) and `relayDropped` is
the relay's loss (20-cap drops + flush-filter drops). The
evidence file reports relayDropped per seed — the number this
arm's fix recovers.

(ii-b) HELD-VOLUME ACCOUNTING (per away stretch, REQUIRED;
queue-snapshot method — the cap-a Correction 1 method, here the
preregistered method from the start). An away stretch = a maximal
run of consecutive loop-days whose evening row has `inside !==
true` (scholar not inside Haven at daily exit); the return day =
the first following loop-day whose evening row has `inside ===
true` (or NONE for a terminal stretch). Per stretch:
  held = the after-leg awayNaming queue depth at the last
    evening snapshot of the stretch (qEnd), PLUS the sum of
    mid-stretch queue drops observed in the snapshot sequence
    (each drop = lines delivered at a mid-stretch return).
  delivered = held − stillHeld, where stillHeld is the count of
    lines kicked in the stretch that remain in awayNaming at end
    of run. For a non-terminal stretch the queue drains fully at
    the return (returnToVillage splices the whole queue; the unit
    leg of scripts/test-awaynaming-cap-a.js proves the mechanism,
    and the snapshots show the drain), so stillHeld = 0 and
    delivered = held. For a terminal stretch there is no return,
    so delivered = the mid-stretch drops only and stillHeld =
    qEnd.
  lost = held − delivered. GO iff lost == 0 on EVERY stretch.
  A terminal stretch with qEnd > 0 is NO-GO with the structural
  cause named (delivery lives inside `!over && !estranged`).
  The compare ALSO reports per stretch: max held, the largest
  single-day delivery (wall size, for the sense verdict), and the
  queue-depth cross-check (driver snapshots of awayNamingLen /
  pendingHavenNewsLen at each evening + morning row). The
  preregistered position-based held and DH-excess delivered counts
  are RETAINED in the compare output as diagnostics (renamed
  `posHeld` / `dhExcess`): on the relay substrate posHeld is
  expected to be ~0 (it confirms the relay held everything
  away-fired) and dhExcess is expected to undercount delivered
  when before-leg flushes land in harness phase. They are not the
  judge.

(ii-c) RECONCILIATION (exact, enforced by the compare): per seed
per kind, the before/after difference must satisfy
  said_after − said_before
    == relayDropped + stillHeld_before − stillHeld_after.
(A straight consequence of the two ledger identities.) Any
nonzero residual is a counting error or a trajectory divergence
and fails the run until explained.

(iii) DET-GATE + TRAJECTORY IDENTITY — (a) recorder ON vs OFF
identical on the FIXED code for seeds 17021 and 15003 (the
census det-gate key: bankfood evenings/mornings/first-upkeep
kcal series; proof test asserts it); (b) BEFORE/AFTER
TRAJECTORY IDENTITY on all 31 seeds: daysAlive, endReason,
stranded nights, stranded sleep windows, and non-stranded sleep
windows identical per seed between the fresh before corpus and
the after corpus. GO iff all 31 match. Any divergence is
investigated before any GO, not waved through.

## Staging (pilot gate, §9–12)

- PILOT (8 seeds, judged first, before any confirm spend):
  17021, 15003, 15009, 15091, 15211, 15215, 15220, 15221 (the
  census pilot, verbatim). Pilot GO = primary 0 AND guardrails
  (i), (ii-a ledger), (ii-b accounting), (iii) holding on the
  pilot seeds. The pilot's before leg is judged against the FRESH
  before pilot (not the stale census corpus, not the cap-a
  corpus) — the before leg is re-run fresh on current master.
- CONFIRM (runs ONLY if the pilot passes): the remaining 23 seeds
  17001–17024 except 17021. The full 31-seed after corpus is the
  union of pilot + confirm; no seed is re-run. Full GO = primary
  0 AND (i) AND (ii) AND (iii) on all 31 seeds.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (the census horizon; dead villages stop
  simulating). Driver: scripts/gossipcensus-trace-a.js reused
  VERBATIM except the observational additions listed under
  "Instrument additions" below (reads only, no RNG, no state
  edits — disclosed here before the before leg; the det-gate
  proves they change no trajectory). Policy stack identical
  (bankfood(warmed(woodcarry(nighttravel))) over competent); env
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
  STRANDNARR=1. Before-corpus OUTDIR:
  evidence/2026-11-05/sim-awaynaming-rereg-a-baseline/;
  after-corpus OUTDIR:
  evidence/2026-11-05/sim-awaynaming-rereg-a-corpus/.
- Comparison instrument: scripts/awaynaming-compare-rereg-a.js
  (NEW, this arm; the cap-a compare with guardrail (i)
  re-registered as ledger-based silencing and the sleep-phase
  rate kept as a descriptive phase-shift report only). Reads both
  corpora, judges this prereg. Exit 0 iff GO. Invoked with
  explicit --before/--after/--out flags (defaults point at the
  rereg dirs).
- Balanced panel (§15): before-panel on the PRE-FIX worktree and
  after-panel on the FIXED worktree, same scope as cap-a:
  `node scripts/balance-panel.js --root <worktree> --seeds
  17021,15003,15009,15091,15211,15215,15220,15221 --policies
  capable --days 60 --out evidence/2026-11-05/sim-awaynaming-rereg-a-panel-<before|after>`,
  then `compare --before <before>/panel.json.gz --after
  <after>/panel.json.gz --out evidence/2026-11-05/awaynaming-rereg-panel-compare`.
  Expected decision: `no_material_signal` (the change is
  narration-only); cap-a got `review_required` with every
  metric delta exactly 0 (coverage-driven, not a signal). The
  panel decision is recorded as returned; trajectory identity
  (iii-b) remains the judge for gameplay neutrality. If a panel
  errors for reasons unrelated to the change, that is reported,
  not hidden.

## Instrument additions (driver, observational only)

Committed BEFORE the before leg, in the instrument commit
(prereg commit carries the prereg only). Cherry-picked from the
cap-a instrument commit 068aeba35 (driver additions identical;
compare rebuilt as scripts/awaynaming-compare-rereg-a.js with
the (i) re-registration):

1. Queue-depth snapshots: each evening row and each morning row
   in scripts/gossipcensus-trace-a.js also records
   `awayNamingLen` (`(Game.state.scholar||{}).awayNaming?.length
   ?? 0`) and `pendingHavenNewsLen`
   (`(Game.state||{}).pendingHavenNews?.length ?? 0`), each
   inside try/catch (null on failure). Reads only.
2. Naming ledger: at end of each run the driver records
   `namingLedger`: for each monster entry in
   `Game.state.codex.monsters`, {mid, namingKicked,
   villageName (or null), proposalCount}; plus `endQueues`:
   {awayNaming: [{kind, mid}], pendingHavenNews: [{kind, mid}]}
   contents at end of run. Reads only; no RNG; no state edits.
3. No other driver change. The STRANDNARR=0 det-gate leg runs
   the same driver with the recorder off.

## Proof test (scripts/test-awaynaming-cap-a.js, cherry-picked with the fix)

Unit leg: (1) burst held while away, delivered on return —
scripted monster entry (reported, knowers = full roster),
scholar positioned away: monsterNewsCheck says NO word/debate
line, queue holds 2 entries, namingKicked and proposals still
set; walk onto the Haven tile (returnToVillage): both lines
appear verbatim, queue empty. (2) settle held likewise:
majority proposals while away → villageName set, NO settle line,
queue holds 1; return → settle line appears. (3) THE CAP FIX:
hold 20 lines directly (repeated holdNamingNews calls across
kinds) → queue holds ALL 20 (the killed fix capped at 12);
return → all 20 delivered verbatim, queue drained. (4) in-haven
burst still says immediately (no hold when playerAtHaven).
(5) framing line matches no burst/settle classifier pattern.
Integration leg: det-gate (iii-a) on fixed code (17021 + 15003,
STRANDNARR 1 vs 0); stranded anchor pins the CURRENT-substrate
17021 facts READ FROM THE FRESH BEFORE LEG (the cap-a re-pin
said 60d survived — verify on current master, do NOT trust the
old pin; the proof test pins whatever the before leg shows and
the evidence records it); non-stranded anchor 15003
loop-day-7 sleep-window Word line still reproduces inside Haven
(re-verify from the before leg; if it moved, the evidence says
so and the proof test pins the before-leg fact). Anchor-pin
updates, if needed, land in a follow-up commit AFTER the before
leg, before the after leg — the fix commit itself stays the
verbatim cherry-pick. Usage env identical to the census proof
test.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric proves
wrong, it goes under "metric review" in the evidence file with a
revision proposed for the NEXT run. Every evidence file carries a
"metric review" section. The (i) re-registration above is written
here, before any judged sim, for the documented 2115Z metric
review — it is the prereg, not a revision.

## Wall numbers (carried, NOT re-measured)

Narration fix corpus; records no scale outcomes. Carried state
from the 1041Z round (0915Z run, 24 distinct seeds): wins 0/24,
national 0/24, table 0/24, wave-5 0/24, readiness-5-ready days
0/24.

## Deliverables

- evidence/2026-11-05/sim-awaynaming-rereg-a-prereg.md (this file,
  committed BEFORE any judged sim, including the before-panel)
- evidence/2026-11-05/sim-awaynaming-rereg-a.md (verdict judged
  strictly against this prereg, per-seed table, held-volume
  accounting per away stretch, every delivered line quoted with
  its stranded/delivered loop-days, sense verdict on the
  delivered wording INCLUDING the catch-up wall size, metric
  review, phase-shift report)
- evidence/2026-11-05/sim-awaynaming-rereg-a-baseline/ (per-seed
  JSON from the verbatim driver on pre-fix code; 31 files)
- evidence/2026-11-05/sim-awaynaming-rereg-a-corpus/ (per-seed
  JSON from the verbatim driver on fixed code; 31 files)
- evidence/2026-11-05/awaynaming-rereg-panel-compare.md (+ .json)
  — the §15 balanced-panel comparison
- evidence/2026-11-05/awaynaming-rereg-compare.md (+ .json) —
  the before/after comparison output
- scripts/awaynaming-compare-rereg-a.js (before/after comparison;
  reads both corpora, judges the prereg)
- scripts/test-awaynaming-cap-a.js (proof: unit hold/deliver +
  cap-removal + det-gate + anchors) — cherry-picked with the fix
- src/js/game.js — the gate (three say-sites), the awayNaming
  queue WITHOUT the cap, returnToVillage delivery. Commit
  message carries [needs-eyes] (narration/feel change Steve
  should see, plus the routing change vs the r141 relay).
- scripts/test-gossip-position-r141.js — checks 1–3 updated in
  the fix commit for the new burst/settle routing (documented in
  the cap-a prereg); checks 5–6 untouched.
- Zero policy changes. No gate/price/deed change. No push, no
  bump, no live verification (coordinator merges via --ff-only;
  ship loop owns deploys).
