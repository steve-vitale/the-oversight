# Journey social life r260 — PRE-REGISTRATION (Lane B, 2026-11-21)

Run ID `2026-11-21T00:55:17Z-loop2-leg5-r260`. Lane B occurrence 19:00 CST
Nov 20, 2026 (scheduled 19:00 CST; run started 18:55:17 CST). Rotation-b
read 5 at run start (social life); this run plays 5 and writes 6 at
closeout. Base at run start: master `faa5d65a9` (Loop B lever round
fleshout-loop-b-20261120T2130Z; ship-loop version bump
028b34e33 on top). Prior Lane B runs r256 (social, landed ed19c3d57 +
057bfa60f), r257 (crisis), r258 (succession), r259 (endgame) all closed
by adoption; rotation-b 5 is consistent (r259 adoption advanced 4→5).

## Leg question (carried from r238 + r239 + r256)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings
without drying — and do the r226 F6 fix, r231 C3d, r234 DRY2, r235
DRY3, r236 TRAILTALK, r237 OUTING-SEEK, r238 repay-fallback, and
r256 Arm C gossip-ask fixes hold in the wild?

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45785–45788**. Backup band **45789–45792**.
- Check (2026-11-21 ~01:10Z): `grep -rln -E "45785|45786|45787|45788"
  evidence/ --include='*prereg*'` → 0 hits. Backup
  `45789|45790|45791|45792` → 0 hits. Band FRESH.
- Wider grep (all evidence/, not just preregs) hits only October
  files where 45785 is a pantry-kcal value (`pantryFreshAfter: 45785`)
  or a hash substring (`trajHash ...457883...`) — not seed namings.
  No forbidden/contaminated band list names this band (searched
  `evidence/2026-11-*/` for "forbidden band" / "contaminated band" —
  only skill-reference files mention the phrases).
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238),
  45765–45768 (r239), 45773–45776 (r256). Named backups reserved:
  45769–45772 (r239), 45781–45784 (r256). Rejected 45757–45760
  (r250 draft / r239 timestamp coincidence) — named = used.

## Arms

### Arm A: M4-SPLIT METRIC REVIEW (owed since r256 — THIS run applies it)

r256 read conversational 13 vs bar ≤12 — NO-GO by one. Its
investigation found no dominant thin pool and no flag attributable to
the r256 fix; 5 of the 13 are same-opening artifacts on discourse
openers, not repeated content (r256 run note, M4 investigation):

1. ack-prefixed exhausted line vs ack-prefixed gossip line
   ("You want to know about that? Okay." + different content) — 1 flag.
2. "I don't know..." same-opening pair (different content after the
   opener) — 1 flag.
3. "You say nothing." silence-narration pair (same two lines across
   two villagers) — 2 flags.
4. "We're going in circles —" recap-prefix pair — 1 flag; the
   existing strip list covers only the "a bit" variant.

REVISION (frozen for this run): the M4 scan's prefix strip
(`stripRepeatPrefix` in the analyzer, the scan's established
"strips prefixes" concept) gains the discourse openers fitted on
the r256 13, anchored at line start:

- `i don't know` (followed by more words)
- `you say nothing` (silence narration)
- `you want to know about that? okay` (ack-question stem of the
  exhausted-line fallback)
- `we're going in circles` (generalizing the existing "a bit" variant)

The strip applies ONLY to the scan's comparison cores, never to game
text. The bar stays **conversational ≤12 panel-wide** — the revision
removes grammar artifacts, it does not widen headroom. What stays
counted as conversational: the belonging pair, murder/ambush
template, plant-teaching template, favor re-ask, hunger plea
(8 of r256's 13 would remain under the revised scan — re-analyzed
in-run; the run note records the re-analysis number). If a fresh
panel still reads >12, it is a real NO-GO, not a classifier artifact.

- Proof: extend `scripts/test-journey-social-life-r250-m4-split-20261119.js`
  with strip cases for the four openers (RED before, GREEN after) and
  re-baseline the r238 corpus regression — the pinned numbers WILL
  move (the strip changes flag generation); the new numbers are
  recorded in the test and the run note in the same commit, with the
  definition change stated. The r238 conversational 7 must NOT move
  (none of the 7 starts with a discourse opener) — if it does, the
  revision is over-broad and stops here.
- Analyzer: the r260 analyzer clone carries the extended strip +
  prints a `m4discourseStripped` watch count (how many cores had an
  opener stripped before comparison).

### Arm B: F6 WILD HOLD (r256 Arm C fix confirmation)

Binding bar: **dry-line count 0 panel-wide** (same as r238/r239/r256).
The r256 DRY2-guard fix is native in the base; the panel judges the
wild hold directly. A miss is NO-GO; the run reports the site.

### Arm C: TRAIL WILD HOLD

Binding bars (unchanged): distinct trail-talk lines panel-wide ≥6;
max recurrence of any single trail-talk line per seed ≤4. The
3-press driver (r256 Arm B) is carried verbatim.

## Continuity panel

- Fresh seeds **45785–45788** (see band check above).
- DAYCAP 140. Same M1–M12, B5 split, B6 rows, F5 counter, F6 dry
  hold (bar 0), outing-chain tallies as r256.
- Determinism: one panel seed re-run to a separate OUTDIR, JSONs
  diffed identical before judging (r237/r238/r239/r256 precedent).

## Metrics (binding)

- **M4-SPLIT-GO (revised):** conversational near-dup flags
  panel-wide <= 12, under the discourse-opener strip defined above.
- **TRAIL WILD HOLD:** distinct >= 6 panel-wide AND max recurrence
  per seed <= 4.
- **F6 WILD HOLD:** dry-line count 0 panel-wide.
- **F5 WILD CHECK:** report-only (r256: V1=2 V2=0 V3=0 — watch
  whether V3 stays unserved).
- **M1–M12, B5, B6:** same bars as r256 (see
  evidence/2026-11-20/journey-social-life-r256.md).
- **WATCH:** re-offer max, dropped threads, NARR scan, scattering,
  M2 rate, moots, BOND ANSWERED, CONFESS, outing conversion
  (r256 13.0%, watch ≥25% — the re-tune question stays open;
  this run measures, does not redesign).

## Metric review (for the NEXT run, not this one)

- If the revised M4 scan still reads >12 on fresh seeds, the next
  question is the remaining template families (belonging,
  murder/ambush, plant-teaching — same template, different slots),
  not the classifier.
- Outing-chain re-tune stays open (conversion watch).
- F5 V3 still never served in the wild.

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r256-20261120.js` ->
  `scripts/journey-social-life-r260-20261121.js` (seeds 45785–45788,
  OUTDIR evidence/2026-11-21, filenames r260, mode string r260;
  everything else verbatim).
- Analyzer: `scripts/analyze-journey-social-r256-20261120.js` ->
  `scripts/analyze-journey-social-r260-20261121.js` (reads r260
  JSONs; PLUS the discourse-opener strip + m4discourseStripped
  watch count).
- Helpers: `scripts/journey-social-r226-helpers.js` (unchanged —
  the strip lives in the analyzer's scan, where the prefix-strip
  concept already sits; splitM4Flags untouched).
- Proof: extend `scripts/test-journey-social-life-r250-m4-split-20261119.js`
  (strip cases + re-baselined corpus numbers).
- Standing proofs re-run on the worktree: M4-split (extended),
  F5 harness (r238) 50/50, F6 proof (r226) 49/49, TRAILTALK proof
  (r236) 30/30, repay-fallback (r238) 36/36, gossip-dry (r256) 9/9.

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (re-read 2026-11-21 by
  this run; no commits to either since 2026-11-18 — verified
  `git log --since=2026-11-18` empty per the r250 draft; re-verify in
  the worktree). No-repeat invariant + dry-line contract live in
  CONVERSATIONS.md and the conversation.js header comments.

## Infra (this occurrence, pre-panel)

- Pre-flight `git status --short` clean (0 files) at tip `faa5d65a9`;
  `git pull` already up to date; disk 51%.
- Worktree registration queued behind REGISTRY.lock (flesh-out Loop B
  0030Z registrations) — ~6 min queue, registered 01:09Z; heartbeat
  stamped immediately after.
- Write flap: none observed this run so far; VM uptime 1:40 at
  01:03Z (restart ~23:23Z Nov 20). Probe before any registry write
  if a flap window is suspected.

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick`
  (`--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r256 gate note; standalone re-run
  any timeout before attributing). Gate goes to adoption if the
  occurrence budget runs out (r239/r256 precedent). Commit via
  safe-commit.sh in the worktree, ff-merge in main tree, release
  tree, rotation-b 5 -> 6, delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (no
  canonical baseline exists; r256 built an ad-hoc /tmp baseline from
  the r239 panel — this run builds the same from the r256 panel and
  does NOT roll a baseline without adjudication).
- Heartbeat the registered worktree before each major phase
  (`bash scripts/worktree-heartbeat.sh journey2-social`).
