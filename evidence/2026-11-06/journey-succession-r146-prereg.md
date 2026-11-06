# Journey succession r146 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before play. Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout. Run number r146 follows r145 (social life,
Lane B global sequence); the rotation file, not the number, is the
authority. Base master 304ced6cf (local master ahead of origin/master
30fe8dc00 by the unshipped fight-interior-b + killersurvive-a merges;
`git pull` fails on an ORIG_HEAD.lock write refusal — EPERM flap class,
retried 3x; fetch succeeds and local HEAD contains origin/master, so
there is nothing to pull; noted as infrastructure noise, not a blocker).

## Carried question (r143, blank filed, not fixed)

r143 filed the ASK_FAVOR WANT-FIZZLE as its blank (second sighting):
when the bearer asks a villager "Is there something you need? Really."
(alive:want:ask_favor), the NPC answers "...Sorry, lost my train of
thought" and the want evaporates — no engagement, no characterful
deflection. Sightings: r142 (James, seed 33605, d+14) and r143 (Tyler,
seed 33702, d+14). r143's metric review: "the next run that touches
dialogue should check whether the ask_favor path has a real answer, or
file it to the builder with both sightings cited." This run checks it —
and fixes it if the mechanism confirms.

## Question

When the bearer asks about a need — "Is there something you need?
Really." (alive:want:ask_favor, stage 0) or "Tell me why you need
this." (dlg:details, stage ≥ 2) — does the NPC give a real answer (the
concrete ask, or its why/stakes) instead of the dry line? Two rival
outcomes:
(a) REAL ANSWER: the ask/why reaches the player on both paths — the
    fizzle was a ledger-collision defect with a bounded fix.
(b) STILL FIZZLES: the ask still dries on one or both paths despite the
    fix — the defect is deeper than the ledger collision; filed to the
    builder with the mechanism, no src/js change claimed as a fix.

## Mechanism hypothesis (from code read BEFORE any scored seed; to be
## confirmed or refuted by SAYTRACE on the before-leg)

- sayLine's no-repeat key is the first chunk of the rendered line
  (conversation.js sayLine: `key = chunks[0].trim()`). Any fresh
  sentence escapes; any re-emitted constant dries.
- heal_help's whyLine is a PER-KIND CONSTANT (convo-wants.js
  FAVOR_KINDS.heal_help: one fixed "It's getting worse, not better..."
  string for every wounded villager). Same for snare_mend,
  watch_shift, stay_close (fixed whyLines). So any second use — by
  another villager (run ledger, 48-entry window) or the same villager
  in an earlier sitting (saidLines persists across sittings) — dries
  the beat. James's dlg:details re-emits favor.whyLine, so it dries
  whenever that string was recently spoken.
- Tyler's stage-0 re-ask (conversation.js:6097-6111, r53 guard) tries
  opener line → convoFavorFollowup → favor.whyLine → original stands
  and sayLine dries honestly. The ladder exhausts when the followup is
  blocked/null AND the whyLine is the same blocked text (kinds whose
  whyLine == line fallback, or the fixed whyLine already ledgered).
- The fix, if the hypothesis confirms, composes or selects a FRESH line
  from the favor instance (checked via convoWouldBlock before
  speaking), in the two handlers only. The ledgers themselves are
  untouched; no trust/consequence flow changes (no new
  resolveConsequence, no new favor state transitions).

## Instrument (r143 driver verbatim + declared trace; zero src/js)

Driver: scripts/journey-succession-r146-20261106.js = r143 driver
verbatim except filenames r143 -> r146 (mode string kept
'succession-r123', EVID_DIR evidence/2026-11-06, POST_DAYS=70,
EARLY_KILL_DAY=40). The r143 driver already carries the r70 SAYTRACE
(sayLine fellBack/null wrappers with pre-call ledger state and caller
sites), so each fizzle in a driven transcript attributes to RUN-BLOCK
/ SELF-BLOCK / DLG-DIRECT with the blocked key. No new instrument
logic.
Analyzer: scripts/analyze-journey-succession-r146-20261106.js = r143
analyzer verbatim except filenames (CAP-NC scoring unchanged).
The r142 d+3 stranger probe and the r143 newcomer probe are kept
unchanged (descriptive this run).

## Before-leg (unfixed code, same seeds, same drivers)

- Seed 33702 through the r146 driver (identical to r143's): Tyler's
  d+14 transcript must reproduce the fizzle (or the run records that
  it does not, with the SAYTRACE attribution).
- Seed 33605 through the r146 driver: James's d+14 transcript. NOTE:
  the r143 driver adds the newcomer-probe convo vs the r142 driver,
  which can perturb the run ledger; if James's fizzle does NOT
  reproduce under the r146 driver, the before-leg for James falls
  back to a verbatim r142-driver copy (filenames only, + the same
  SAYTRACE already in that driver's lineage) and the fallback is
  recorded in the run note. The fix is judged only on seeds whose
  fizzle reproduces on unfixed code.
- The before-leg runs BEFORE any src/js change. The fix is written
  only after the SAYTRACE attribution confirms or refutes the
  hypothesis above.

## After-leg (fixed code, same seeds, same drivers)

Re-run 33702 + 33605 (whichever reproduced) through the same drivers
on fixed code; the ask_favor turn in each d+14 transcript must carry
a real ask/why (no dry line at that turn, no re-emitted already-said
line per SAYTRACE).

## CAP-NC regression panel (fixed code, fresh band)

After the fix, the r143 CAP-NC panel re-runs on fresh band 33801–
33808 with the r143 stop rule (run in order, stop at 3 eligible or
after 33808). Smoke seed 33899 proves the instrument first
(EARLY_KILL_DAY=5, POST_DAYS=25). The panel judges whether the
dialogue fix regressed the succession capacity r143 established.
Panel order: fix proof first (repro seeds), CAP-NC panel second.

## Seed-band freshness (skill: local_seed_band_freshness)

- Repro seeds 33702 + 33605: DELIBERATE REUSE of the r143/r142 bands
  for a same-seed before/after comparison (same pattern as
  killersurvive-a's deliberate reuse of its confirm band). Not a
  fresh-band claim; recorded here so no later worker mistakes the
  reuse for a fresh reservation.
- CAP-NC panel band 33801–33808 + smoke 33899: searched ALL dated
  preregs (evidence/*/sim-*-prereg.md and evidence/*/journey-*-prereg.md,
  exact patterns 33801–33808 and 33899) — ZERO matches. Forbidden
  bands named in Nov preregs (73641–73648, 73671–73678, 78201–78208,
  99351–99358, 99401–99412) do not intersect. Broad evidence sweep
  (all .md/.json/.txt) returned 138 hits, sampled as coincidental
  numbers (e.g. "pantryFreshBefore":33805 — a calorie count, not a
  seed); no hit in seed context. Band FRESH.

## Bars (binding, §14)

- FIZZLE-FIX (binding): on fixed code, each reproducing repro seed's
  d+14 transcript shows a real ask/why at the ask_favor turn (no dry
  line at that turn). 2/2 reproducing seeds must pass. If a seed's
  fizzle does not reproduce on unfixed code, that seed drops out of
  the denominator and the bar is judged on the reproducing seeds with
  the drop recorded — NOT re-scored against a friendlier metric.
- CAP-NC REGRESSION (binding, carried from r143): PASS = ≥3 eligible
  seeds AND ≥3 bonded by the deadline AND bonded/eligible ≥ 2/3.
  INSUFFICIENT-DATA / CAPACITY DEFECT per r143's definitions. A miss
  is a regression note + fix-or-revert decision, never a re-score.
- PROOF TEST (binding for the fix claim): scripts/test-journey-
  succession-r146-askfavor.js — unit-level, shared harness: a wounded
  villager (heal_help need) with the kind's whyLine pre-filled in the
  run ledger + saidLines (simulating another villager's recent ask);
  drive dlg:details and alive:want:ask_favor; assert the spoken line
  is not a dry line and names the live need; assert the ledger still
  blocks a true verbatim repeat elsewhere (control: the same whyLine
  spoken twice in one sitting still dries honestly). The proof runs
  red on unfixed code, green on fixed code.
- SELF-REQUEST REGRESSION CHECK (reported, not scored): r133 ledger
  purge holds — selfReqDayEntries == 0 on every panel seed.
- CARRIED (reported, not scored): pick-time rank == 1 on every first
  handoff with npcCalls; funeral INCALL beat present on every leg
  death. A miss is a regression note, not a re-score of r123/r127.
- PEOPLE CHECK (sense, not a count): read the fixed d+14 transcripts
  in full plus one d+14 successor transcript per CAP-NC panel seed.
  Bar: conversations have meaning per the sense-testing law; the fix
  must not introduce a new filler or a line that promises a need that
  isn't there.

## Expansion trigger

Instrument failure only: talkRequests unreadable, bondDaily empty on
a seed with a recorded handoff, bondDaily entries missing bearerId,
newcomer detection never recording _newcomerSeen, or SAYTRACE
recording no fellBack on a seed whose transcript shows a dry line
(fix instrument, re-run that seed once). A CAP-NC miss, a
no-newcomer-arrival seed, a village ending before the deadline, or a
skipped seed never triggers expansion alone — the stop rule bounds
the panel at 8 seeds.

## Metric review (to be filled after the panel)

- r143's CAP-NC standing instrument is kept verbatim (eligible-subset
  design); this run adds the FIZZLE-FIX bar, it does not revise CAP-NC.
- If FIZZLE-FIX passes but CAP-NC regresses, the fix is reverted or
  narrowed in the run note — a dialogue fix must not cost the
  succession capacity it was built to protect.
- Canon note: no canon doc covers mantle/bond formation specifically
  (r127's standing note, unchanged). Governing rules used: ledger.js
  "successor: the village chooses. Trust decides"; party-bond.js
  "v.bonds built by meals/visits/feasts, +6/pair/day cap, no bonds
  with the dead or gone"; CONVERSATIONS.md structural contract ("The
  repeat ledger must not replace a successful promise with 'lost my
  train of thought.'"); CANON.md "No silent actions". Nothing
  invented, nothing changed.
- Telemetry: r143 left the succession baseline's integrationStage at
  15 (definitionally impossible; Game.integrationStage() returns
  0–3) with a recommendation to re-baseline from a stated panel.
  This run runs the telemetry check per step 14 and investigates any
  LOUD line before deciding whether to roll the baseline forward from
  this panel's per-seed means.
