# Journey social life r268 — PRE-REGISTRATION (Lane B, 2026-11-23)

Run ID `playtest-loop-2-20261123T0200Z` (leg 5, r268). Lane B occurrence
02:00 CST Nov 23, 2026. Rotation-b read 5 at run start (social life);
this run plays 5 and writes 6 at closeout. Base at run start: master
`86e5bd38e` (sim-launchfield-horizon-b). Prior Lane B social runs: r256,
r260, r261, r265 (landed `fc915f94d`, all binding bars GO; outing watch
PASSES 38.1%; F5 V3 zero for the 7th panel, proven honest on both pools),
r266 (NO-GO: M4-SPLIT conversational 15 vs ≤12, TRAIL distinct 4 vs ≥6,
F6 dry 1 — the David Kim d82 dry line, root-caused; F5W V3 served in
the wild for the first time in 8 panels, 6 servings on 45813; Arm B
test-side fix landed, all three matchers green).

Rotation note: no queue jump. r266's closeout wrote rotation-b 5→6, but
the endgame r267 adoption (complete ~13:05Z Nov 22) then wrote 4→5;
rotation reads 5 now, so social life is genuinely next (verified:
`fc915f94d` on master, r267 adoption merge `32897eb7a`, no
journey2-social tree in registry at run start, no live adoption
processes). No recent commit touched a system not up next.

## Leg question (carried from r238 + r239 + r256 + r260 + r261 + r265 + r266)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings
without drying — and do the r226 F6 fix, r231 C3d, r234 DRY2, r235
DRY3, r236 TRAILTALK, r237 OUTING-SEEK, r238 repay-fallback, r256
Arm C gossip-ask fix, r260 M4 discourse-opener strip, and the r262
M12 escalator cap + "You asked me that before" strip hold in the
wild on FRESH seeds?

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45829–45832**. Backup band **45837–45840**.
- **45825–45828: USED.** Named in
  `evidence/2026-11-11/journey-endgame-r178-prereg.md` and
  `evidence/2026-11-21/journey-crisis-r261-prereg.md`. Collision
  recorded here so the next worker does not repeat it.
- **45829–45832: FRESH.** `grep -rl` each seed over `evidence/`
  `--include='*prereg*'` → 0 hits each. Non-prereg hits are
  incidental data values, spot-checked in context: `45830` is a
  `cumTakes` calorie count in
  `evidence/2026-10-16/perseed-ledgerdiag/leadfeast-s662.json`;
  `45829` is inside `"totalDeliberate": 4582973` in
  `evidence/2026-10-14/journey-deepening-r10-competent-8107.json`.
  Neither is a seed naming.
- **45833–45836: CONTAMINATED (backup rejected).** `45833` appears
  in dmgpin reprereg per-seed files
  (`evidence/2026-11-21/perseed-dmgpin-reprereg-b-*/dmgpin-reprereg-b-s106729-*.json`).
  Treat as used; the name alone reserves it.
- **45837–45840: FRESH (backup).** 0 prereg hits each.
- No forbidden/contaminated band list file exists under evidence/ or
  hidden_files (only `evidence/2026-10-13/drive-practice-contaminated-baseline`,
  a drive-practice baseline dir, not a band list).
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238),
  45765–45768 (r239), 45773–45776 (r256), 45785–45788 (r260),
  45793–45796 (r261), 45801–45804 (r265), 45813–45816 (r266).
  Named backups reserved: 45769–45772 (r239), 45781–45784 (r256),
  45789–45792 (r260), 45797–45800 (r261), 45805–45808 (r265),
  45821–45824 (r266).

## Arms

### Arm A: F5-REASK interception at the sitting (driver change)

r266 diagnosis: the daily scan ran AFTER the day's social play. A
seed whose favor settles is consumed by the first sitting that opens
on it the same day — by the end-of-day scan it is already gone, and
the seeds still visible are the ones whose favors have not settled
yet. Funnel: scanned 3878, askFavorSeeds 1478 (distinct 198),
settled-at-last-sight 0, sittings 0, reasks 0. A daily scan
structurally cannot catch the window.

This run moves the scan to BEFORE the day's social play (same max 2
visits/day, same sitting mechanics: open a sitting on a villager
holding an `ask_favor` seed on a settled favor, press the offered
want choice, record the served variant by the F5W shape cores).
Binding deliverable: the FUNNEL, named in plain words — ask_favor
seeds seen (by favor state at first sight) → seeds on settled favors
→ sittings opened → want was ask_favor → want choice offered →
re-asks pressed → variants served (V1/V2/V3). If ≥1 re-ask lands,
the panel rate is the story; if the funnel still starves at
settled-at-scan-time, the finding is "the window is the sitting
itself" and the next arm seeds the re-ask (prereg fallback, still
applies). Report-only (diagnosis, no GO/NO-GO bar).

### Arm B: dry-fallback resume fall-through (GAME FIX, binding F6=0)

r266's one dry line (seed 45815, day 82, David Kim): the player
picks the resume line *"We never finished — that debt."* and the
game answers *"…Sorry, lost my train of thought."* — a dry answer
to a real pick about a real, still-open debt. Root cause, verified
in code this run before the panel:

- The resume pick (`alive:thread:<tid>`, convo-scene.js:421) is
  handled at conversation.js:7180. It draws the thread's next beat
  via `convoThreadBeat(vid)` (4222) and speaks it with full ledger
  protection (`structuralTurn = !beat`, turn tail 8290). The beat
  is the thread's LAST spoken line (the dropped thread's memory) —
  often still inside the 48-entry run-ledger window, so `sayLine`
  (946) run-blocks it and falls back to the dry line.
- The r19 opener fall-through pattern already exists:
  `convoWouldBlock(vid, line)` (1251) mirrors sayLine's block
  decision without emitting; the opener chain skips a blocked
  candidate and serves the next one instead of drying.
- The SAME dry-risk shape exists at three sibling call sites that
  speak a non-null `convoThreadBeat` with full ledger protection
  and fall through only on null: `more` (7567), the resume-offer
  Yes (`gq:yn` + resumeOffer, 7597), and `follow:` (7687).

Fix: a shared `convoLiveBeat(vid)` helper — `convoThreadBeat`
unless the returned line is ledger-blocked (via
`convoWouldBlock`), in which case null — and all four call sites
speak through it. A blocked beat then falls through to each
site's existing graceful line (the generic resume line, the
exhausted pool, the follow-up fallback) instead of the dry
fallback. State hygiene: the helper snapshots and restores
`c.depth` / `c.reactDryCount` when it discards a beat, so a
blocked draw leaves the thread exactly as if it was never drawn.
Proof: a staged test plants the thread's next beat in the run
ledger (another villager said it), picks the resume, and asserts
the generic resume line is served (not the dry line) and the
thread stays live; same shape for the `more` pick. The panel
runs on the fixed code and judges the wild hold (F6=0) directly,
per the r228 precedent. If the fix is not proof-green before
panel launch, the panel runs on the base and the run note says
so — the fix is then judged by proof tests + a confirm panel,
never by re-scoring this panel.

### Arm C: M4 template-slot variety (GAME FIX, binding M4-SPLIT ≤12) — investigated during the panel, lands only if conclusive

r266 M4-SPLIT: conversational 15 vs bar ≤12 (instructional 208).
The 15 conversational flags, read off the r266 analysis log, are
a mix, NOT the door-direction cycle (door lines classify
instructional): (a) true repeats — the previous-bearer outing
line re-served with the "Ask me something else" suffix, the
"Something eases in their shoulders" opening served twice with
different continuations; (b) template-with-slot lines — plant
teaching ("Knotweed Shoot — crush the leaf, smell it, taste the
stem. That's how you know it." vs "Porcini — ...") and landmark
memory ("a ridge with a view for miles — remember the shape of
it." vs "a burned farmhouse — ...") — one sentence, one noun
swapped, Jaccard ≥0.5; (c) same-opening different-content
("I've never really had people." vs "I've never really fit
anywhere.") — classifier noise, not a defect.

Fix direction, if it lands: vary the teaching/landmark sentence
frames (rotate 2–3 frames per template) and stop the spend-out
from re-serving an already-said line with a suffix. This arm is
investigated WHILE the panel runs; it lands in this run only if
the exact sites are found and proof-green before the panel ends.
Otherwise it is filed with exact sites for the next run, and the
M4 bar is judged on the panel as-run — a miss is NO-GO, never
re-scored. The bar is doing its job; the fix is line variety,
not a bar change.

### Arm D: retire legacy F5, judge F5W (analyzer change)

Legacy F5 reads 0 by design — its cores match only the generic
pool, and servings come through the named pool (r266: F5 0/0/0,
F5W 2/2/2, all on 45813). The legacy bar measures the generic
pool's silence, which is by design. This run's analyzer reports
F5W (widened, both pools) as the settled-favor read; legacy F5
is still printed for continuity but is NOT a binding bar. The
binding settled-favor read is F5W total ≥1 (the path is proven
to fire in the wild since r266).

### TRAIL (report-only)

r266: distinct 4 vs bar ≥6, max recurrence 2 (passes). The next
question is pool width: read the trail-talk pool size in code
(`performForageTalk`); if the pool is genuinely thin (4
distinct lines), widening it is a content fix for the next run.
Report distinct with AND without template variants.

## Panel

- Fresh seeds **45829–45832**, DAYCAP 140.
- Driver `scripts/journey-social-life-r268-20261123.js` (r266 driver
  verbatim except seeds, OUTDIR evidence/2026-11-23, filenames r268,
  mode string r268, + Arm A scan-before-play). Analyzer
  `scripts/analyze-journey-social-r268-20261123.js` (r266 analyzer
  verbatim except DIR/pattern r268 + Arm D F5W-as-primary). Helpers
  `scripts/journey-social-r226-helpers.js` unchanged.
- People check: read full transcripts in the 5 social contexts
  (day-1 nudge, first meeting, friendship, talk request, moot) —
  SENSE-TESTING LAW. Village assessment in plain words.
- Reachable / fun / winnable verdict for the leg.

## Metrics (binding)

- **M4-SPLIT-GO:** conversational near-dup flags panel-wide ≤12.
- **TRAIL WILD HOLD:** distinct ≥6 panel-wide AND max recurrence
  per seed ≤4 (plus de-templated distinct reported).
- **F6 WILD HOLD:** dry-line count 0 panel-wide.
- **F5W WILD CHECK:** widened settled-favor total ≥1 (V1/V2/V3
  counts reported; legacy F5 printed, not binding).
- **F5-REASK (Arm A):** report-only funnel — the diagnosis is the
  deliverable.
- **ARM B FIX:** staged resume-pick + `more`-pick proof tests
  green; F6 holds in the wild on the panel.
- **OUTING:** report-only (attempts/kept/conversion + outcome
  distribution).
- **M1–M12, B5, B6:** same bars as r266 (see
  evidence/2026-11-22/journey-social-life-r266.md).
- **WATCH:** re-offer max, dropped threads, NARR scan, scattering,
  M2 rate, moots, BOND ANSWERED, CONFESS, M12-native (watch-only).
- **Determinism:** one panel seed re-run to a separate OUTDIR,
  JSONs diffed identical before judging.

## Metric review (for the NEXT run, not this one)

- If the F5-REASK funnel still starves at settled-at-scan-time,
  the next arm seeds the re-ask (or gives settled favors a want),
  not another count. If re-asks land but V3 never serves, the next
  question is the cycle across sittings on one villager.
- If M4 conversational still reads >12, the next question is the
  remaining template families (plant-teaching, landmark, "Something
  eases", belonging), not the classifier.
- If TRAIL distinct stays 4, the pool question closes as a content
  fix (widen the trail-talk pool), not a bar change.

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (re-read 2026-11-23 by
  this run). No-repeat invariant + dry-line contract live in
  CONVERSATIONS.md ("The repeat ledger must not replace a
  successful promise with 'lost my train of thought.'") and the
  conversation.js header comments.
- `~/workspace/the-scattering/AGENTS.md` read at run start (repo
  house rules; worktree copy verified byte-identical).
- Source read for Arm B (this run, worktree, before the panel):
  `src/js/conversation.js` sayLine 946, convoWouldBlock 1251,
  convoThreadBeat 4222, alive:thread 7180, `more` 7567,
  resume-offer 7597, follow: 7687, turn tail 8290;
  `src/js/convo-scene.js:421` (resume pick id);
  `src/js/convo-dialogue.js:200-280` (favor-requirements
  reframe / spend-out); `src/js/conversation.js:2457-2610`
  (convoRecapLine).

## Infra (this occurrence, pre-panel)

- Pre-flight `git status --short` clean (0 files) at tip `86e5bd38e`;
  disk 47%.
- Lock: `playtest-loop-2.lock` run_id
  `playtest-loop-2-20261123T0200Z` (no prior lock present at
  07:55Z).
- Registration: `worktree-register.sh journey2-social` took ~4.5
  min (registry flock queue, faster than r266's ~32 min).
  Heartbeat landed 08:01:30Z; hbloop
  `journey2-social-hbloop-r268.sh` running (pid 25438, 5-min
  beats, setsid nohup).
- Write flap: no window observed this occurrence so far; /tmp
  fresh-file probe OK at run start. The r261 lesson applies if
  one opens: verify every exec-written file by size + content,
  never trust the exit code alone; `muse.write` writes reliably.
- The panel is launched in the worktree with OUTDIR
  evidence/2026-11-23. Per-seed JSONs land as each seed finishes,
  so a timeout mid-panel still leaves completed seeds for adoption
  (SEEDS env supports subsets).

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick`
  (`--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r266 gate note; standalone re-run
  any timeout before attributing). Gate goes to adoption if the
  occurrence budget runs out (r239/r256/r260/r261/r265/r266
  precedent). Commit via safe-commit.sh in the worktree, ff-merge
  in main tree, release tree, rotation-b 5 -> 6, delete lock
  (same-call run_id verification).
- Telemetry: `telemetry-check.js` vs the social baseline (no
  canonical baseline exists; `telemetry-baselines/social.json` is
  an October snapshot on stale `l3.*` keys — r266 built an ad-hoc
  /tmp baseline from the r265 panel; this run builds the same from
  the r266 panel and does NOT roll a baseline without
  adjudication).
