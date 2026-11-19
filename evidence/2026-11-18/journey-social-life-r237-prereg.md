# Journey social life r237 — PRE-REGISTRATION (Lane B, 2026-11-18)

## Run

- Lane B occurrence 17:00 CST Nov 18, 2026 (run_id `2026-11-18T22:55:25Z-loop2-leg5`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout.
- Base at registration: `519653e29` (master after the sim-scale-onramp round landed; worktree branch `journey2-5`, ff-merged to master in the worktree, clean at start).
- Leg 5 (social life). Run number r237 follows r236 (Lane B social, landed 2026-11-18, TRAILTALK fix `32c62cd76`; r235 DRY3 `9d5a45fcc`, r234 DRY2 `39eaa043e` also in master).
- **ADOPTION NOTE:** r236's adoption completed before this run (TRAILTALK `32c62cd76` + evidence `b97a67015` ancestors of master; `journey2-5` tree re-registered by this run). No held work to adopt.

## Leg question (carried from r226 + r229 + r231 + r234 + r235 + r236)

Does social life hold up across a full run — invitations sometimes taken,
bonds proposed and answered by character, moots firing, conversations
reading as people, wants surviving across sittings without drying into the
"...lost my train of thought." dead line — and do the r226 F6 fix, the r231
C3d fix, the r234 DRY2 fix, the r235 DRY3 fix, and the r236 TRAILTALK fix
hold in the wild?

## Fix arm: OUTING-SEEK — the driver never walks a joint forage outing out (r236 finding, promoted to arm)

The r236 panel was VACUOUS for trail talk (0 trail-talk lines on all 4
seeds) and r235 exercised it on 1/4 seeds only. The r236 run note promoted
driver seeking for outings from proposal to owed: "two panels in a row
with ≤1 seed exercising the site means the wild hold cannot be judged
from the standard panel at all."

Mechanism, re-traced this run from the r236 panel JSONs + code (not counts):

- The asks DO happen: "Forage with me tomorrow?" is asked ~10x panel-wide
  on r236 (seeds 45725–45728).
- Outings DO start on this band: seeds 45726/45727 show the live-run
  conversation opening ("Ready to forage? The pantry is counting on us.",
  `forageFavorOpening`, home + 0 haul) and `dlg:forage_talk` offered
  dozens of times in the `offered` menu arrays — the offer gate
  (`convo-wants.js:2463`) requires `favor.forageRun` to exist.
- But the pair NEVER LEAVES Haven: every subsequent favor press is blocked
  with "You have nothing from this outing to bring home yet. Forage
  together on green ground first." (`favor-forage.js:193`, atHome +
  total==0), 25x panel-wide; and "Accept the forage request first. Meet
  at Haven at dawn on the following day." (`favor-forage.js:174`, no
  promise yet), 35x panel-wide. Zero `favor_forage_depart` telemetry,
  zero `forage_together` / `forage_deliver` / `forage_end` strings,
  zero "falls in beside you" departure lines in any r236 JSON.
- Why: the social-life driver (socialite policy) only ever takes
  `agency:` conversation choices and never drives the favor-action chain
  — it never walks to green ground with the partner, never presses
  "Forage this patch together", never unloads. The r62 deepening driver
  HAS this chain (`scripts/journey-deepening-r62-20261028.js`,
  `outingAttemptFavor`: readiness → position adjacent → depart via
  `armConvoAction` → travel to a stocked green tile → joint presses →
  deliver) and proves it works; the social driver never ported it.

**Fix (driver/tooling only — NO game-code change):** port the r62
outing chain into the r237 social driver as a daily step, adapted to the
social driver's scaffolding (`capture`, `vname`, `posDiag` equivalents
already present or copied with the chain):

1. After `innerDaily` each day, for each villager with a live
   `forage_help` favor in state `asked`/`promised` (or a live run):
   check `forageFavorAction` readiness; position adjacent at Haven at
   dawn; take the favor action through the conversation menu
   (`armConvoAction`, the r62 pattern — never a direct
   `performForageFavor` call); travel to the nearest stocked,
   non-haven, non-ruin, unblocked green tile; press the joint forage
   action up to 3x; press trail talk (`dlg:forage_talk`) once per
   outing; travel home; unload (`forage_deliver`).
2. The chain is env-gated (`OUTING_SEEK=1`, default ON for this run's
   panel; the pilot runs with it on). Every stage is recorded in
   `ctxShared.outingArm` (same shape as r62: stages + outcome), so a
   blocked stage names its blocker instead of silently skipping.
3. The chain uses only public Game verbs a real player can press
   (menu favor actions, travelTo, talk) — it is a competent player
   doing the job, not a harness shortcut.

**NOT this arm:** the F5 targeted harness (still owed — sixth thin panel
if this panel is thin again); the M4 split (proposal); the sayLine
choke-point guard (closed r236: "sites were the whole story" unless a
new site appears); repay.engageBeat pools; all-3-blocked F5 residual.

## Proof / validation for the arm

- Pilot seed 45733 with OUTING_SEEK on: the chain must complete at
  least one full outing end-to-end (depart → joint press with haul > 0
  → trail-talk line spoken → deliver with pantry kcal) OR the pilot
  names the exact stage + blocker where it stops. A pilot that cannot
  complete one outing is a NO-GO for the panel — the port is fixed
  first, not papered over.
- Panel (seeds 45733–45736): outing counts per seed from
  `ctxShared.outingArm` + trail-talk lines in transcripts.
- The r236 TRAILTALK proof test stays green
  (`scripts/test-journey-social-life-r236-trailtk-20261118.js`); the
  r235 DRY3 proof stays green.

## Metrics (binding)

- **OUTING-SEEK PROOF:** pilot completes ≥1 full outing end-to-end
  (depart + haul > 0 + trail talk spoken + deliver). Bar is binary.
- **TRAIL WILD HOLD:** per-seed trail-talk lines by grep (same method
  as r234/r235/r236). Bar, per seed where trail talk fires: max
  recurrence of any single trail-talk line ≤ 4 (r235: 12); distinct
  trail-talk lines panel-wide ≥ 6 (r235: 2; r236: vacuous). If <2
  seeds fire trail talk, the bar is judged on the seeds where it fires
  and the thinness is recorded, not re-scored — but a third vacuous
  panel means the arm itself failed and is re-judged, not the fix.
- **F6 WILD HOLD:** dry-line count on the fresh panel. Bar: 0 dry
  servings panel-wide (r236: 0, r235: 0, r234: 4).
- **M1–M12:** same bars as r235/r236 (see
  evidence/2026-11-17/journey-social-life-r235.md and
  evidence/2026-11-18/journey-social-life-r236.md).
- **B5 instrumentation:** per-funeral partial-vs-full split (kept).
- **B6 instrumentation:** want-resolution rows (kept).
- **F5 WILD CHECK:** settled-favor variant servings in the wild
  (r236: 0, sixth thin panel if 0 again). If thin again, the targeted
  harness stays owed — it is NOT built here.
- **WATCH TALLIES (carried, read-only):** re-offer max, dropped
  threads, NARR scan, react shape, scattering capture, player-side
  greeting repetition; M1 hot-accomplice pattern; HEED warn_you
  engagements; M2 combined-proposal bar (design-look at >= 20);
  MOOTS; DRY3 site-1 wild hold; F1/F3; BOND ANSWERED; CONFESS.
- **OUTING CHAIN TALLIES (new, read-only):** per-seed outings
  started / completed / blocked-by-stage, haul kcal delivered via
  joint presses, trail-talk presses per outing.

## Metric review (proposals for the NEXT run, not this one)

- **M4 split:** the near-dup count is still dominated by instructional
  lines (Haven-door cluster + live-want re-asks + teach templates).
  Split M4 into instructional vs conversational dups next run.
- **F5:** if this panel is thin again (0 servings, sixth in a row),
  the targeted harness is the next run's arm, not a watch.
- **TRAIL bar thinness:** if the outing chain completes on the pilot
  but fires on <2 panel seeds, the chain's dawn-positioning step (not
  the fix) is the suspect — the chain must be re-tuned, not the bar.

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45733–45736**. Backup band **45737–45740**.
- Check (2026-11-18 ~23:05Z): `git grep -l -E "45733|45734|45735|45736"
  -- 'evidence/*/*prereg.md'` → 0 hits. Backup
  `45737|45738|45739|45740` → 0 hits. Band FRESH.
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236). r236's named backup 45729–45732 is RESERVED
  (named = used) and is NOT used here.
- No r237 social prereg existed before this file (checked
  `evidence/2026-11-18/` + `git grep journey-social-life-r237`).

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r236-20261118.js` →
  `scripts/journey-social-life-r237-20261118.js` (seeds 45733–45736,
  OUTDIR evidence/2026-11-18, filenames r237; outing chain ported
  from `scripts/journey-deepening-r62-20261028.js`; everything else
  verbatim).
- Analyzer: `scripts/analyze-journey-social-r236-20261118.js` →
  `scripts/analyze-journey-social-r237-20261118.js` (reads r237 JSONs;
  plus outing-arm tally from `ctxShared.outingArm`).
- Helpers: `scripts/journey-social-r226-helpers.js` (reuse, no clone).

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (read 2026-11-18 by this
  run; the joint-forage contract — dawn start beside the partner,
  forage together, trail talk, deliver both shares — is canon in
  CONVERSATIONS.md; the no-repeat invariant and the dry-line contract
  live in conversation.js header comments + CONVERSATIONS.md).
- Outing mechanism re-traced 2026-11-18 from the r236 panel JSONs
  (evidence/2026-11-18/journey-social-life-r236-4572*.json: offered
  menus, block narrations, 0 departures) and the code at master
  `519653e29` (favor-forage.js:100-230, convo-wants.js:2463,
  convo-dialogue.js:281, socialite.js daily).

## Jobs this run

(A) OUTING-SEEK PORT + PILOT: port the r62 outing chain into the r237
    driver, pilot seed 45733 to a full end-to-end outing (or a named
    blocker). NO-GO on the panel if the pilot cannot complete one
    outing.
(B) CONTINUITY PANEL: the leg-5 panel on fresh seeds 45733–45736,
    same metrics as r236 (M1–M12, B5 split, B6 rows) + outing-chain
    tallies. The panel runs on the CURRENT base (TRAILTALK native) —
    the wild hold is judged directly.
(C) NEW-BASE READS (watches): F5 settled-favor variants in the wild;
    F6 dry-line hold (0); B5 funeral-mend voice with the per-funeral
    split; B6 stage-0 is-not-live; trail-talk depth; M4 instructional
    cluster; DRY3 site-1 wild hold.
(D) NOT THIS RUN: F5 targeted harness (owed, next run's arm if thin
    again); M4 split (proposal); sayLine choke-point guard (closed
    r236); repay.engageBeat pools; all-3-blocked F5 residual (r226).
(E) STRETCH (only after panel + gate are green): none — the gate is
    the long pole and the occurrence budget is 3600s; if the gate does
    not finish in-run, the adoption path (r235/r236 precedent) closes
    it out and the run note states so plainly.

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick` (use
  `--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r236 gate note; standalone re-run
  any timeout before attributing). Commit via safe-commit.sh in the
  worktree, ff-merge in main tree, release tree, rotation-b 5 → 6,
  delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (r236 noted
  QUIET; the social.json baseline carries only stale-era l3.* keys
  the driver never emits; do not roll the baseline over schema drift
  without adjudication).
- Heartbeat the registered worktree before each major phase
  (registration 23:04Z; re-heartbeat at prereg, pilot, panel, gate,
  landing). No background heartbeat loop (the runtime reaps
  long-lived backgrounded exec sessions — r234/r235/r236 precedent).
