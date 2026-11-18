# Journey social life r235 — PRE-REGISTRATION (Lane B, 2026-11-17)

## Run

- Lane B occurrence 17:00 CST Nov 17, 2026 (run_id `loop2-20261117T225525Z`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout.
- Base at registration: `392ec63d4` (master; worktree branch `journey2-social`, clean at start).
- Leg 5 (social life). Run number r235 follows r234 (Lane B social, landed 2026-11-17).
- **ADOPTION:** this run adopts r234's filed remainders (run note
  `evidence/2026-11-17/journey-social-life-r234.md`, "Remainders" +
  "Metric review"). The r231 handoff files in the goal hidden_files
  (`journey-social-life-r231-prereg-DRAFT.md`, `-c3d-fix.md`, skeleton,
  `test-...-r231-c3d-recap-live-...js`) are SUPERSEDED: the C3d fix
  landed as `db83d5ccd` and the r231 panel ran; do not re-apply them.
  The r231 proof test is re-run here as a GUARD (must stay green).

## Registration (infrastructure)

- Overlap guard: no lock file at run start. Lock created with run_id
  `2026-11-17T22:55:25Z`, timestamp 2026-11-17T22:55:25Z.
- Pre-flight: main tree clean, disk 46%. Reaper ran (11/16 active, no
  journey2-social tree existed).
- Registration took ~4 min (foreground exec, incl. registry-flock queue).
  First heartbeat 23:00:53Z; re-heartbeat before each major phase
  (proof, each panel seed, gate, landing). No background heartbeat loop
  (the runtime reaps long-lived backgrounded exec sessions — r234
  precedent). The tree is dirty once work starts, and the reaper never
  auto-removes dirty trees — second line of defense, not a substitute.

## Leg question (carried from r226 + r229 + r231 + r234)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed and answered by character, moots firing,
conversations reading as people, wants surviving across sittings
without drying into the "...lost my train of thought." dead line — and
do the r226 F6 fix, the r231 C3d fix, and the r234 DRY2 fix hold in
the wild, with the r235 DRY3 fix closing the three new dry sites?

## Fix arm: DRY3 — 4 dry servings at 3 new sites (r234 finding)

All four are the dry line "...Sorry, lost my train of thought." The
F6 fix holds at its sites and the DRY2 fix holds at its sites; the
residual is the same defect class one layer out: `sayLine` is handed a
line with no `convoWouldBlock` pre-check, and its truthy dry-line
return fools the caller's "primary spoken" test. Re-traced this run
from the r234 panel JSONs (transcript text, not counts):

- **Site 1 — expedition-ask answer ×2** (45711 t63 d47, Catalina
  Reyes; 45711 t89 d72, Liam Davis): player picks "What did you see
  out there?" → dry. Handler `agencyTurn`
  (`src/js/villager-agency.js` ~1239-1292) speaks the lesson line
  through `sayLine(vid, lineText)` with NO pre-check (only the place
  branch is exempt via `diegeticAct`, only the closer pool is
  pre-checked, r193). The lesson line CAN collide: the monster line
  is deterministic per species but `agencyTeachableMonsters` filters
  already-observed species, and plant lines embed the plant name and
  are codex-filtered — so the wild collision is the FIXED fallback
  line (`"Saw things with too many joints. Give them room. That's the
  whole lesson."`, one string for every villager with k.monsters>=2
  and nothing teachable). Two such asks inside the 48-entry run
  window → the second dries. The comment "Monster/plant lines cannot
  collide (codex-deduped)" is wrong about the fallback line.
  **Fix:** pre-check `convoWouldBlock(vid, lineText)` before the
  sayLine call (place branch keeps its diegeticAct exemption and
  skips the check); when blocked, skip sayLine and fall to the r193
  closer pool (already pre-checked) or the honest noop.
- **Site 2 — dlg:details favor explanation ×1** (45710 t49 d44):
  player picks "Tell me why you need this." → dry. Handler
  (`src/js/convo-dialogue.js` ~855-920) composes the answer via
  `convoComposeDlg` and hands it to sayLine with NO pre-check on the
  COMPOSED line. The existing r146/r151 guards check the BARE
  whyLine / need-lines — dead guards (r234 site-3 lesson): the run
  ledger holds the ack-prefixed composite (`'"Me? Okay." ' + whyLine`;
  `convoSplitBeats` returns the whole line as one chunk under 260
  chars, so the ledger key IS the composite), and `voiceLine` is a
  no-op during an active ask_favor sitting, so the composition is
  deterministic per favor kind. A second villager with the same favor
  kind composes the identical line → dry.
  **Fix:** pre-check the RUN-block only, via a new shared helper
  `convoWouldRunBlock(vid, line)` (conversation.js, next to
  `convoWouldBlock`): true when the line's first-chunk key is in the
  run ledger AND NOT in this sitting's ledger. When run-blocked,
  serve the `dlg:details:dry` pool deflection via sayLine with
  `{ structural: true }` (generic grammar, DRY2 stonewall precedent)
  and return with the same tail (consequence + favorExplained +
  engage). Within-sitting self-blocks still flow to sayLine → null →
  the existing self-repeat path — the r16 honesty rule (the "I just
  said" accusation is only true for within-sitting repeats; a
  run-block is another villager's line, so it must NOT take the
  self-repeat path).
- **Site 3 — dlg:react greeting reply ×1** (45712 t79 d66,
  gen_b7edxxa): player picks the react option "Yeah. Hey." → dry.
  Handler (`src/js/convo-dialogue.js` ~404-450) takes a thread beat
  (60% gate), composes it (`convoComposeDlg` — the react label
  carries no topic and no you/your, so no ack is prepended: composed
  == raw beat), and calls `sayLine(vid, composed)` with only a
  truthiness test (`if (said)`). sayLine returns the dry line's first
  chunk as a TRUTHY value when run-blocked, so the handler reports
  the composed beat as spoken while the transcript holds the dry
  line. The thread-beat pools are shared across villagers, so a beat
  another villager spoke recently is run-blocked.
  **Fix:** pre-check `convoWouldBlock(vid, composed)` before sayLine;
  when blocked, skip sayLine and fall to the existing dead-react
  wind-down (structural pool).

**NOT this arm:** the sayLine choke-point guard (return null on dry
fallback, or honor opts.fallback for run-blocks). Traced and filed:
returning null would leave the dry line IN the transcript (sayLine
still speaks it) so it does not move the panel metric, and it would
regress the `|| line` call sites (conversation.js:6848 goon,
8158 convoTurn, convo-dialogue.js:617) which today honestly report
the dry line that was spoken. The choke-point needs its own prereg +
proof; the three pre-checks are the filed DRY3 arm. Also not this
arm: trail-talk pool widening (r234 finding, 2 lines deep), F5
targeted harness (owed since r231 — stretch if time permits), M4
split (metric-review proposal below), repay.engageBeat broken/open
pools, all-3-blocked F5 residual (r226).

## Proof test

`scripts/test-journey-social-life-r235-dry3-20261117.js` (godpath-lib
pattern, real sittings + real sayLine ledger, donor-poisoned like
DRY2). Discriminators (each: poisoned on base → dry line in
transcript; on fix → honest fallback, no dry line):

1. Agency fallback line: donor + test villagers staged with
   know.monsters>=2 and nothing teachable; donor's expedition ask
   speaks the fixed fallback line; test's expedition ask must speak a
   closer (fix) / dries (base). Deterministic, no RNG in the line.
2. Details: donor + test villagers staged with the SAME favor kind
   and the SAME whyLine string (stage 2, thread 'small' so
   convoThreadBeat returns null and the whyLine branch runs); donor's
   details press speaks the composed line; test's details press must
   speak a `dlg:details:dry` deflection (fix) / dries (base). Voice
   is a no-op during ask_favor, so the composition is deterministic.
3. React: donor speaks every line of the test thread's beat pool via
   real sayLine in a real sitting; test villager's react (thread
   staged to that pool) must wind down via the dead-react pool (fix)
   / dries (base). One attempt per fresh run; seed chosen empirically
   so the first react takes the 60% beat path (the gate draw is
   prefix-identical on base and fix).

Guards (pass on base AND fix): unblocked lesson/beat/details line
speaks verbatim; within-sitting self-block on details still takes
the self-repeat path (not the deflection); closers/pool behavior
unchanged; C3d proof test still green (`scripts/test-journey-social-
life-r231-c3d-recap-live-20261116.js`).

## Metrics (binding)

- **DRY3 PROOF:** proof test green on fix, red on base (exactly the
  3 discriminator assertions fail on base; all guards pass on both).
- **F6 WILD HOLD:** dry-line count on the fresh panel. Bar: 0 dry
  servings panel-wide (r226: 21, r231: 4, r234: 4 — all at new sites;
  the bar is right, the fix scope is per-site).
- **M1–M12:** same bars as r234 (see journey-social-life-r234.md).
- **B5 instrumentation:** per-funeral partial-vs-full split (kept).
- **B6 instrumentation:** want-resolution rows (kept).
- **F5 WILD CHECK:** settled-favor variant servings in the wild
  (r234: 3, thin). If thin/vacuous again, the targeted harness stays
  owed (third panel in a row) — it is NOT built here unless the panel
  + gate finish with time to spare.
- **WATCH TALLIES (carried, read-only):** re-offer max, dropped
  threads (next-sitting resurface + whether resurfaces name the LIVE
  favor), NARR scan, react shape, scattering capture, player-side
  greeting repetition; M1 hot-accomplice pattern; HEED warn_you
  engagements; M2 combined-proposal bar (design-look at >= 20);
  MOOTS (investigate the trigger only if 0 fire across the 4 fresh
  villages); trail-talk loop depth (r234: 2 lines — watch whether the
  driver still hits the wall).

## Metric review (proposals for the NEXT run, not this one)

- **M4 split:** r234's near-dup count (321) is dominated by
  instructional lines (Haven-door positioning cluster + live-want
  re-asks). Propose splitting M4 into instructional vs
  conversational dups next run; the current count punishes the game
  for re-explaining a mechanic. Not implemented here (analyzer
  change + bar change needs its own prereg line).
- **F6 bar:** keeps missing at new sites each round. The bar (0 dry)
  is right; the fix scope is per-site. If DRY3 lands and the NEXT
  panel still finds dry servings at newer sites, the sayLine
  choke-point guard (filed above) becomes the arm — not a fourth
  single-site patch presented as a cure.

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45717–45720**. Backup band **45721–45724**.
- **CORRECTION vs r234:** r234 named 45713–45716 as its BACKUP band.
  Per the freshness skill, a named band is reserved even with no
  judged corpus behind it ("the name alone reserves it"). This run
  does NOT use 45713–45716.
- Check (2026-11-17 ~23:20Z): `git grep -l -E "45717|45718|45719|45720"
  -- 'evidence/*/*prereg.md'` → 0 hits. Backup
  `45721|45722|45723|45724` → 0 hits. Band FRESH.
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234).

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r234-20261117.js` →
  `...-r235-...`
- Analyzer: `scripts/analyze-journey-social-r234-20261117.js` →
  `...-r235-...`
- Helpers: `scripts/journey-social-r234-helpers.js` (reuse or clone
  as r234 did)
- Proof test pattern: `scripts/test-journey-social-life-r234-dry2-20261117.js`
  (godpath-lib pattern, real sittings + real sayLine ledger)

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (read 2026-11-17 by the
  blocked r231 run; no canon gap for the DRY3 area — the no-repeat
  invariant and the dry-line contract live in conversation.js header
  comments + CONVERSATIONS.md).
- DRY3 sites re-traced 2026-11-17 from the r234 panel JSONs
  (evidence/2026-11-17/journey-social-life-r234-45710.json t49,
  -45711.json t63 + t89, -45712.json t79) and the code at master
  `392ec63d4` (sayLine conversation.js:946-1170, convoWouldBlock
  :1259-1283, convoComposeBeat convo-wants.js:3200-3245,
  agencyTurn villager-agency.js:1206-1360, dlg:react + dlg:details
  convo-dialogue.js:404-450 + 855-920).

## Jobs this run

(A) DRY3 FIX + PROOF: helper + three pre-checks, proof test green
    on fix / red on base (discriminators only), C3d proof stays green.
(B) CONTINUITY PANEL: the leg-5 panel on fresh seeds 45717–45720,
    same metrics as r234 (M1–M12, B5 split, B6 rows). FIRST panel
    with the DRY2 fix AND the DRY3 fix native in the base (panel runs
    on the FIXED code — fixes land before the panel, per the r228
    precedent; the wild hold is judged directly).
(C) NEW-BASE READS (watches): F5 settled-favor variants in the wild;
    F6 dry-line hold (0); B5 funeral-mend voice with the per-funeral
    split; B6 stage-0 is-not-live (no stage-3 'deflected' close from
    a stage-0 want); trail-talk depth; M4 instructional cluster.
(D) NOT THIS RUN: F5 targeted harness (stretch only); M4 split
    (proposal); sayLine choke-point guard (filed, needs its own
    prereg); trail-talk pool widening (finding, not fixed here).
(E) STRETCH (only after panel + gate are green): F5 targeted harness
    from the r229 metric review (owed — two thin panels in a row).
    If time does not permit, it stays owed with the LOUD lines
    re-explained, not rolled.

## Gate / closeout (standard)

- Proof test + `node scripts/check.js --quick` (use
  `--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r234 gate note; standalone re-run
  any timeout before attributing). Commit via safe-commit.sh in the
  worktree, ff-merge in main tree, release tree, rotation-b 5 → 6,
  delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (r234 noted
  the social baselines carry known schema-drift LOUD lines — do not
  roll the baseline over them without adjudication).
