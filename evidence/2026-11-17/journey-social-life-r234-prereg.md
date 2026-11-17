# Journey social life r234 — PRE-REGISTRATION (Lane B, 2026-11-17)

## Execution addendum (07:00 CST occurrence, run_id journey2-social-20261117T125612Z)

### Fix-arm correction: the site-3 guard moved (traced during proof)

The prereg placed the site-3 guard in `topic2Ask`. Proof-test debugging showed
that guard is DEAD: `topic2Ask` returns the BARE topic line, but the generic
emission prepends a random 1-of-3 topic ack (`convoComposeBeat`, convo-wants.js
~3200) before `sayLine` — so the run ledger holds the ACK-PREFIXED composite
and WouldBlock on the bare line is always false. The dry fires only when the
drawn ack happens to match another villager's (1-in-3 per pair) — which is why
the first proof run dried on the fix. The guard now lives in the generic
emission (conversation.js, after `convoComposeBeat`), scoped to `'ask:'` turns:
WouldBlock on the COMPOSED line → honest exhausted line. The `topic2Ask` guard
was removed (net diff: convoTopics.js unchanged). The probe and confront fixes
are as preregistered. Proof: 27/27 on fix, 23/27 on base (exactly the 4
discriminator assertions fail on base, all guards pass on both).

### Proof-test deviation (recorded, not hidden)

The prereg said "poison via ANOTHER villager's sitting" for all three
discriminators. The probe and neighbors discriminators poison through real
donor sittings as written. The confront discriminator's TEST-villager doubt
is staged via the real `addDoubt`/`resolveDoubt` APIs (not a real confession)
because the donor already supplies the real-sitting poison; driving a second
full confession sequence would add RNG surface for no extra discrimination.
The donor's confession sequence is fully real (shame motive + trust 90 + warm
temper ⇒ confessP > 1, guaranteed).

## Run

- Lane B occurrence 07:00 CST Nov 17, 2026 (run_id `journey2-social-20261117T125612Z`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout.
- Base at registration: f9b33757a (master; worktree branch `journey2-social`, clean at start).
- Leg 5 (social life). Run number r234 follows r233 (Lane B endgame, landed 2026-11-16;
  Lane A also ran r233 — run-number collision convention stands: files differ by leg prefix).

## Registration (infrastructure)

- Overlap guard: no lock file at run start. Lock created with run_id
  `journey2-social-20261117T125612Z`, timestamp 2026-11-17T12:56:12Z.
- Pre-flight: main tree clean, disk 44%. Reaper skipped (registry lock held by
  another reaper run, consecutive skips: 2 — safe skip, not a failure).
- Registration took ~8.5 min (foreground exec): the registry `flock` is held by
  the reaper for its whole run and a queue of sibling registers/heartbeats forms
  behind it (known reaper lock self-contention, fix owed, needs Steve nod).
  First heartbeat landed 13:00:54Z; re-heartbeat 13:11:01Z.
- Heartbeat loop: the r54-style `while true` loop script (hidden_files/
  journey2-social-heartbeat-r234.sh) was SIGTERM'd by the runtime after one
  tick (~143s) — the runtime reaps long-lived backgrounded exec sessions.
  Fallback: manual heartbeat before each major phase (proof, each panel seed,
  gate, landing). The tree is dirty once work starts, and the reaper never
  auto-removes dirty trees — second line of defense, not a substitute.

## Base movement since r231 (7199f371f → f9b33757a)

- Conversation-relevant: db83d5ccd (r231 C3d fix — already native in this base;
  the panel runs on C3d-fixed code) and af1791e90 (establishment r231
  [needs-eyes]: deferred ask surfaces past a settled ledger favor — convo-wants
  area, adjacent to C3d/F5, does not touch any DRY2 site).
- No changes to the probe handler (convo-dialogue.js), the confront handler
  (truth.js), or topic2Ask (convoTopics.js) since r231. The DRY2 fix shape stands.
- Everything else is sim arms (gateproof, sametick, wideduty, deathcleanup),
  scale/endgame run notes, and evidence — no src/js conversation changes.

## Leg question (carried from r226 + r229 metric reviews + r231)

Does social life hold up across a full run — invitations sometimes taken, bonds
proposed and answered by character, moots firing, conversations reading as
people, wants surviving across sittings without drying into the "...lost my
train of thought." dead line — and do the r226 F6 fix, the r231 C3d fix, and
the r234 DRY2 fix hold in the wild?

## Fix arm: DRY2 — 4 dry servings at 3 new sites (r231 finding)

All four are the dry line "...Sorry, lost my train of thought." The F6 fix
holds at its three sites; the residual is the same defect class one layer out:
`sayLine` handed a line with no `convoWouldBlock` check, or a generic fallback
served as a ledgerable primary. Traced from the r231 panel JSONs
(evidence/2026-11-16/journey-social-life-r231-45706.json + -45708.json):

### Site 1 — dlg:doubt stonewall hole (convo-dialogue.js), 2 of 4

- **Sighting:** Raj Patel, 45706 d31 + d32. The player pressed "That doesn't
  quite add up." 7× in the d30 sitting (the driver hammers the probe while a
  doubt is open). The r192 probe fix picks the first non-blocked variant from
  the prod-branch pool, else the stonewall ("They shake their head — not no,
  not yes. Done talking about it.").
- **Mechanism:** the stonewall fired twice on d30 — served as the PRIMARY line,
  so it was LEDGERED (run ledger push in sayLine's unblocked branch). On d31/d32
  the first probe press found all branch-3 variants blocked AND the stonewall
  run-blocked, and sayLine's run-block branch serves the dry line, ignoring
  `opts.fallback` (the fallback is only honored for true same-sitting
  self-blocks; run-blocks always dry).
- **Fix:** when all pool variants are blocked and the handler falls to the
  stonewall, serve it ledger-exempt — `sayLine(vid, stonewall, { structural: true })`.
  Fallbacks are "deliberately EXEMPT from the ledgers (generic by design)" per
  sayLine's own comment; a stonewall served as primary violates that. Pool
  variants keep ledgering (only the stonewall emission gets `structural: true`),
  so the no-repeat guard still governs real probe lines. Within-sitting repeat
  of the stonewall under hammering is a person digging in ("Done talking about
  it"), not a parrot bug; the sitting still ends on its energy budget.

### Site 2 — confront result (truth.js), 1 of 4

- **Sighting:** gen_o1jb3sv, 45708 d50. Three confronts in the sitting: #1 deflects,
  #2 confesses ("I'm not from Denver. I'm from Columbus, Ohio."), #3 dries.
  After the confession the doubt is resolved, so confrontDoubt returns the guard
  line `'"Never mind."'` — which sat in the 48-entry run ledger.
- **Mechanism:** the confront handler (truth.js ~2205) calls
  `this.sayLine(vid, r.line)` with NO WouldBlock check and NO fallback. Any
  `r.line` that is run-ledger-blocked dries — the guard lines and the literal
  `||` fallbacks after `drawTruthLineUnblocked` returns null (all pool variants
  blocked) alike.
- **Fix (deviation from the filed "fresh phrasing", recorded here):** WouldBlock-check
  `r.line` before sayLine; if blocked, re-speak it with `{ diegeticAct: true }`.
  Rationale: every `r.line` is an outcome whose consequences (resolveDoubt,
  trust moves, memories, trial deeds, accuserPays) already fired inside
  confrontDoubt — paraphrasing risks misreporting a landed outcome as a fizzle
  (the r86 skill-lesson rule), and the codebase already exempts exactly this
  class (invitation beats r7, betrayal outcomes r25, skill lessons r86, secret
  replies r120, plant-teach r157). The unblocked path is untouched (pure read;
  extra work happens ONLY where the old code produced the dry line — the
  drawTruthLineUnblocked discipline). The guard line is a 2-word dismissal;
  repeating it across villagers reads as curtness, not parroting.

### Site 3 — neighbors topic reply (convoTopics.js topic2Ask), 1 of 4

- **Sighting:** Raj Patel, 45706 d132 (C-friendship): "How are we with the
  neighbors, honestly?" → dry.
- **Mechanism (traced this run):** `topic2Ask` composes the line from shared
  village state (`t2gen_neighbors`: village name + grievance event + "when" —
  byte-identical across any two villagers who know the same village) and
  `t2pick`/`convoPick` treats run-ledger avoidance as "a preference, not a hard
  filter: small pools must not collapse" — so when the 1–2 candidate lines are
  all run-blocked it returns one anyway, and the generic emission (`done()` in
  conversation.js ~8108, `structural: false` for non-lately topics) dry-replaces
  it. The change-line ack (`t2changeLine`, shared '__change' pseudo-villager)
  does not save it: after 3 servings the ack falls back to its literal, so the
  composed line is identical too.
- **Fix:** in `topic2Ask`, after composing the line, check
  `convoWouldBlock(vid, line)`; if blocked, return the honest exhausted line
  (`'"I\'ve told you everything I know about that."'` via the same
  `convoPickCycle(vid, 'exh', ...)` path the null-pool branch uses). The guard
  lives in `topic2Ask`, so it covers every t2 topic with deterministic
  shared-state lines (neighbors, others), not just neighbors. Only fires where
  the old code dried — trajectory-neutral otherwise.

### Also filed, not fixed here

- repay.engageBeat broken/open pools (same class as F6, unobserved); all-3-blocked
  F5 residual (r226); the r231 dry-line residual is THIS run's fix arm (above).

## Metrics (binding)

- **DRY2 PROOF:** proof test green on fix, red on base. Three discriminators
  (godpath-lib pattern, real sittings, poison via ANOTHER villager's sitting):
  (1) probe: donor stonewalls first (all branch variants + stonewall in the run
  ledger), test villager presses dlg:doubt with all variants blocked — base dries,
  fix stonewalls; (2) confront: donor's sitting puts `'"Never mind."'` in the run
  ledger, test villager confronts a resolved doubt — base dries, fix speaks it;
  (3) neighbors: donor asks neighbors first (same shared state), test villager asks
  neighbors — base dries, fix serves the exhausted line. Guards (pass on both):
  unblocked probe variant still speaks; unblocked confront unchanged; unblocked
  topic ask unchanged; hammered probe in one sitting stonewalls repeatedly, never dries.
- **F6 WILD HOLD:** dry-line count on the fresh panel. Bar: 0 dry servings
  panel-wide (r226: 21, r231: 4 — the DRY2 sites).
- **M1–M12:** same bars as r226/r231 (see journey-social-life-r226.md /
  journey-social-life-r231.md).
- **B5:** per-funeral partial-vs-full split (instrumented r231: 18 funerals,
  14 full / 4 partial / 0 none).
- **B6:** want-resolution rows; stage-3-'deflected'-from-stage-0 = 0 (r231: 0/542).
- **F5 WILD CHECK:** settled-favor variant servings in the wild (r226: 8; r231: 1).
  If thin again, the targeted harness from the r229 metric review is owed.
- **Watches (carried):** F1 drift-note quote (bar 0); F3 commit-refusal-as-memory
  (watch, not a fail); re-offer max; dropped threads (next-sitting resurface +
  whether resurfaces name the LIVE favor); NARR scan; react shape; scattering
  capture; player-side greeting repetition; VENDETTA trend only (bar retired);
  M1 hot-accomplice pattern; HEED warn_you engagements; M2 combined-proposal bar
  (design-look at >= 20); MOOTS (investigate the trigger only if 0 fire across
  the 4 fresh villages).

## Jobs this run

(A) FIX ARM DRY2 (above) + proof test, base-vs-fix discrimination.
(B) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics as
    r195/r200/r206/r215/r220/r226/r231 (M1–M12). Panel runs on the FIXED code
    (F6 + C3d + DRY2 native) — the fixes land before the panel, per the r228
    precedent, judging the wild hold directly.
(C) NEW-BASE READS (watches): F5 settled-favor variants; F6 dry-line hold (0);
    F1 (0); F3 (watch); B5 split; B6 stage-0-is-not-live.
(D) NOT THIS RUN: r171 M2b scholar-open proof; measurement-proof refresh;
    courtship-rework-b BFS fix (owned by the courtship follow-up arm).
(E) STRETCH (only after panel + gate are green): telemetry baseline re-seed with
    a metric mapping for the current social schema (deferred since r206 — the
    social.json baseline carries only stale-era l3.* keys the driver never emits).
    If time does not permit, it stays deferred with the LOUD lines re-explained,
    not rolled.

## Seeds (local_seed_band_freshness)

- Chosen band **45709–45712**. Backup band **45713–45716**.
- Check (this run, 2026-11-17 ~13:20Z): `git grep -l -E "45709|45710|45711|45712" --
  'evidence/*/*prereg.md'` → 0 hits; same for `evidence/*/sim-*-prereg.md` → 0 hits.
  Backup `45713|45714|45715|45716` → 0 hits in all preregs. Band FRESH.
- Note: the r231 draft's backup band 45901–45904 IS named (r226 + r231 preregs) —
  reserved per the skill; NOT used here.
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226), 45705–45708 (r231).
- DAY CAP 140, policy journey.

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r231-20261116.js` → `...-r234-20261117.js`
- Analyzer: `scripts/analyze-journey-social-r231-20261116.js` → `...-r234-...`
- Helpers: `scripts/journey-social-r226-helpers.js` (reuse as r231 did)
- Proof test pattern: `scripts/test-journey-social-life-r231-c3d-recap-live-20261116.js`
  (godpath-lib pattern, real sittings + real sayLine ledger, poison via ANOTHER
  villager's sitting; base-vs-fix via `git checkout HEAD --` + restore from a
  backup copy, no stash — per r231, bare stash is unsafe on the hot tree)

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (read 2026-11-17 by this run; no canon
  gap for the DRY2 area — the sayLine/no-repeat contract lives in
  CONVERSATIONS.md "Structural contract" + conversation.js sayLine header).
- DRY2 sites re-read 2026-11-17: sayLine run-block branch (conversation.js
  ~916–1140), dlg:doubt handler (convo-dialogue.js ~979–1060), confront handler
  (truth.js ~2180–2215) + confrontDoubt/drawTruthLineUnblocked (truth.js
  ~440–480, ~1420–1700), topic2Ask/t2pick (convoTopics.js ~88–100, ~176–195),
  generic emission `done()` (conversation.js ~8108).

## Gate / closeout (standard)

- Proof test + `node scripts/check.js --quick` (use
  `--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r231 gate note; standalone re-run any
  timeout before attributing). Commit via safe-commit.sh in the worktree,
  ff-merge in main tree, release tree, rotation-b 5 → 6, delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (r231: 6 LOUD lines,
  all known schema drift — stale-era l3.* keys the driver never emits; do not
  roll the baseline over them without adjudication).
