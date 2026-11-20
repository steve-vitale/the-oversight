# Journey social life r256 — PRE-REGISTRATION (Lane B, 2026-11-20)

Run ID `2026-11-20T11:55:22Z-loop2-leg5-r256`. Lane B occurrence 06:00 CST
Nov 20, 2026. Rotation-b read 5 at run start (social life); this run
plays 5 and writes 6 at closeout. Base at run start: master `683c9a6e5`
(ship-loop version bump of the r255 endgame adoption; local master ahead
of origin/master by the adoption, no stale-base issue — verify at merge).

## Resumption

This run resumes the blocked r250 draft (hidden_files/
journey-social-life-r250-prereg-DRAFT.md, blocked 2026-11-19 ~19:00Z at
worktree registration by a host write flap; no panel ran, no code
changed) AND the r239 remainder (r239 ran 2026-11-19 ~20:00Z on seeds
45765–45768; run note evidence/2026-11-19/journey-social-life-r239.md).
Renumbered r250 → r256 because r251–r255 have since run (crisis r253,
succession r254, endgame r255). The r250 arms and bars carry over
unchanged; the r239 headline finding becomes Arm C below.

## Leg question (carried from r238 + r239)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings
without drying — and do the r226 F6 fix, r231 C3d, r234 DRY2, r235
DRY3, r236 TRAILTALK, r237 OUTING-SEEK, and r238 repay-fallback fixes
hold in the wild? r239 broke the F6 hold at a NEW site (gossip-ask
after an empty-news opener); this run probes and fixes that site.

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45773–45776**. Backup band **45781–45784**.
- Check (2026-11-20 ~12:10Z): `grep -rln -E "45773|45774|45775|45776"
  evidence/ --include='*prereg*'` → 0 hits. Backup
  `45781|45782|45783|45784` → 0 hits. Band FRESH.
- Rejected: **45757–45760** (the r250 draft's choice) — named in
  `evidence/2026-11-19/journey-social-life-r239-prereg.md` as rejected
  for a timestamp coincidence (`loop2-20261103T145757Z` in the r118
  prereg) AND named as chosen in the r250 draft itself. Named = used
  per the skill; do not reuse. **45765–45768** used by r239 (panel ran).
  **45769–45772** was r239's named backup (named = reserved).
  **45777–45780** skipped: only hit is the substring `345778656`
  (a prereg number) in `evidence/2026-10-30/sim-warmthdisp-b-prereg.md`
  — not a seed naming, but the cleaner 45781–45784 is used instead.
- No forbidden/contaminated band list names this band (searched
  `evidence/2026-11-*/` for "forbidden band" / "contaminated band" —
  only Nov 1 skill-reference files mention the phrases).
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238),
  45765–45768 (r239).

## Arms (three)

### Arm A: M4 SPLIT (owed since r234; r250 draft, carried verbatim)

The M4 near-dup flag count is dominated by INSTRUCTIONAL text
(requirements / positioning / teaching / want re-asks), not NPC prose
repeating itself. Split every flag instructional vs conversational
and make the conversational count the binding signal.

- Classifier: `classifyM4Flag(a, b)` + `splitM4Flags(flags)` in
  `scripts/journey-social-r226-helpers.js` (draft at
  `hidden_files/r250-helpers-addition.js` — append + add both names to
  the module.exports line). A flag is INSTRUCTIONAL if EITHER core
  matches any pattern (same either-side rule as tallyRecapEmpty /
  tallyDoorReq). Patterns fitted on the r238 corpus; known limitation:
  several are broad by design ('hunt', 'forage', 'fill', 'carry', 'we
  need', 'come back') and err toward INSTRUCTIONAL.
- Analyzer: r256 analyzer (clone of r239) requires the split, prints
  per-seed `M4 SPLIT instructional=X conversational=Y` + lists the
  conversational flags, stores split in `s._m4`, panel rollup line.
- Proof: `scripts/test-journey-social-life-r250-m4-split-20261119.js`
  (draft at `hidden_files/test-journey-social-life-r250-m4-split-20261119.js`;
  validated 30/30 in /tmp on 2026-11-19 by the r250 run — re-run in the
  worktree, do not take the /tmp result as the proof).
  Corpus baseline (r238 panel JSONs, probe
  `hidden_files/r250-m4-split-baseline-probe.js`):
  **flags 181, instructional 174, conversational 7 (3.9%)**.
  The 7 conversational flags: hunger-plea thin pool (3 — same
  "anything to spare? ... I can't keep going like this" core
  re-voiced), nonverbal agreement-translation pair (1), belonging (1),
  survival pride (1), illness plea (1).
- Binding bar: **conversational flags panel-wide <= 12** (r238
  baseline 7 + headroom for fresh seeds). A miss is NO-GO; the run
  investigates which pool is thin. Instructional count is watch-only.
- NOTE: the hunger-plea thin pool (3 of the 7) is the next content
  arm if it dominates again — file it, do not expand scope here.

### Arm B: TRAIL 3-PRESS (r238 metric review; r250 draft, carried verbatim)

The TRAIL distinct bar as written measures press frequency, not pool
depth: the driver presses talk once per outing and `talkLine` returns
the first unused pool index — always pool[0] on a first press (r238:
distinct 2 = default pool[0] + warm pool[0]). Fix the driver, not
the bar: `armTrailTalk` presses `dlg:forage_talk` up to 3 times per
outing (while offered), recording all lines (`lines: [...]`, keep
`line` = first for compat). The pool walks 0,1,2 within the outing
(r237's stranded outing proved repeated presses walk the pool).
- Analyzer: add a NATIVE trail tally reading `s.outingArm[].stages[]`
  (`stage === 'trail-talk'`, `lines` else `line`): per-seed presses,
  distinct lines panel-wide, max recurrence per seed. (r239 counted
  by grep; the native tally replaces it.)
- Bars (unchanged): distinct >= 6 panel-wide AND max recurrence per
  seed <= 4. Bar is binding. Outing-chain tallies keep reporting
  (attempts / kept / kcal) — press count per outing changes 1 -> up
  to 3 by design; record the new baseline, do not compare against
  r237/r238/r239 press counts.
- Standing proof stays green: `test-journey-social-life-r236-trailtk-20261118.js`.

### Arm C: GOSSIP-ASK DRY (r239 headline remainder — NEW this run)

r239 found ONE wild dry on the fixed code, a NEW site: seed 45766,
villager `sigrun_eiriksdottir` (Sigrun), C-friendship, day 45 — the
gossip-ask ("What's the word? What should I know?") reached right
after a share_news opener fired with an EMPTY news payload ("About
that news I was bursting to share — Okay, so — something happened
this morning." → "That's the whole of it. Sorry."), then the ask
answered "...Sorry, lost my train of thought." The sitting recovered
and gossiped naturally afterwards — one dead turn, not a dead sitting —
but the F6 bar is 0.
- Probe first: reproduce the site in the harness (share_news opener
  with empty news → gossip-ask), establish whether the null comes
  from the want resolution, the gossip pool, or a ledger-blocked
  fallback — same class as the r238 probe. Do NOT fix blind.
- Fix in the r238 class (guard the empty-news opener and/or the
  gossip-ask fallback so the ask always has a live line), with a
  proof test in the same class as the r238 repay-fallback proof
  (RED before the fix, GREEN after).
- The empty-news opener itself ("bursting to share" → nothing to
  share) rides with the arm as a design look: whether the opener
  should only fire when there IS news. If the probe shows the opener
  is the trip-wire, fix the opener; if the ask is independently dry,
  fix the ask. Record which.
- Binding bar: **F6 dry-line count 0 panel-wide** (same as r238/r239).
  A miss is NO-GO; the run reports the site, not a re-score.

## Continuity panel

- Fresh seeds **45773–45776** (see band check above).
- DAYCAP 140. Same M1–M12, B5 split, B6 rows, F5 counter, F6 dry
  hold (bar 0), outing-chain tallies as r239.
- Determinism: one panel seed re-run to a separate OUTDIR, JSONs
  diffed identical before judging (r237/r238/r239 precedent).

## Metrics (binding)

- **M4-SPLIT-GO:** conversational near-dup flags panel-wide <= 12.
- **TRAIL WILD HOLD:** distinct trail-talk lines panel-wide >= 6;
  max recurrence of any single trail-talk line per seed <= 4.
- **F6 WILD HOLD:** dry-line count 0 panel-wide.
- **F5 WILD CHECK:** settled-favor servings counted by the analyzer
  counter, report-only. (r239: V1=1 V2=2 V3=0 — watch whether V3
  stays unserved.)
- **M1–M12, B5, B6:** same bars as r239 (see
  evidence/2026-11-19/journey-social-life-r239.md).
- **WATCH:** re-offer max, dropped threads, NARR scan, scattering,
  M2 rate, moots, DRY3 site-1, BOND ANSWERED, CONFESS, outing
  conversion (r238 6/15 = 40%; r239 kept/kcal not extracted — the
  adoption reads them from the committed r239 JSONs; this run
  extracts kept/kcal natively and judges the >=25% watch).

## Metric review (proposals for the NEXT run, not this one)

- M4 instructional count has no bar; if the door-positioning cluster
  keeps dominating, the fix is in the favor-block lines (game text),
  not the metric.
- Hunger-plea pool: 3/7 conversational flags on r238 — thin-pool
  candidate for the next content arm.
- TRAIL distinct bar: if the 3-press driver still shows distinct < 6,
  the pool itself is thin and the bar revision (count distinct per
  press-opportunity) is the next question, not a driver change.

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r239-20261119.js` ->
  `scripts/journey-social-life-r256-20261120.js` (seeds 45773–45776,
  OUTDIR evidence/2026-11-20, filenames r256, mode string r256; PLUS
  the 3-press armTrailTalk change + `lines` in both trail-talk stage
  pushes; everything else verbatim).
- Analyzer: `scripts/analyze-journey-social-r239-20261119.js` ->
  `scripts/analyze-journey-social-r256-20261120.js` (reads r256
  JSONs; PLUS the M4-split section + native TRAIL/outing tally).
- Helpers: `scripts/journey-social-r226-helpers.js` + the
  classifyM4Flag/splitM4Flags addition (draft in hidden_files).
- Proof: `scripts/test-journey-social-life-r250-m4-split-20261119.js`
  (draft in hidden_files; re-validate in the worktree).
- Arm C proof: new `scripts/test-journey-social-life-r256-gossip-dry-20261120.js`
  (RED/GREEN around the fix; written after the probe pins the site).
- Standing proofs re-run on the worktree: F5 harness (r238) 50/50,
  F6 proof (r226) 49/49, TRAILTALK proof (r236) 30/30, repay-fallback
  (r238) 36/36.

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (re-read 2026-11-20 by
  this run; no commits to either since 2026-11-18 — verified
  `git log --since=2026-11-18` empty per the r250 draft; re-verify in
  the worktree). No-repeat invariant + dry-line contract live in
  CONVERSATIONS.md and the conversation.js header comments.

## Infra (this occurrence, pre-panel)

- Pre-flight `git status --short` took **~25.6 min** to return
  (started 11:55:22Z, completed ~12:21Z) under box load 5–14 with
  3–7 concurrent git-status processes (ship loop post-commit
  verification + sibling loops). Main tree verified CLEAN at tip
  `683c9a6e5`. `git pull`: already up to date. Disk 49%.
- Worktree registration queued behind Lane A's live registration
  (`journey-establishment`, started 12:01Z) and a reaper holding
  REGISTRY.lock since 12:01Z — the known queue, not a jam (same as
  r238's 5-skip note, r250's flap note). Reaper SKIP 7 consecutive
  (ALERT threshold 3) — lock holder is live, not stuck.
- Write flap: no EPERM observed this run so far; VM uptime 53 min
  at 12:15Z (restart ~11:22Z). Probe before any registry write if a
  flap window is suspected.

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick`
  (`--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r237 gate note; standalone re-run
  any timeout before attributing). Gate goes to adoption if the
  occurrence budget runs out (r239 precedent). Commit via
  safe-commit.sh in the worktree, ff-merge in main tree, release
  tree, rotation-b 5 -> 6, delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (r237/r238/
  r239 noted LOUD on stale-era l3.* keys the driver never emits; do
  NOT roll the baseline over schema drift without adjudication).
- Heartbeat the registered worktree before each major phase
  (`bash scripts/worktree-heartbeat.sh journey2-social`).
