# sim-calledname-a — PREREG (frozen 2026-11-24 12:29 UTC)

**Arm:** sim-calledname-a · **Axis:** scale-onramp (converging, NOT converged) ·
**Run:** Loop A fleshout-20261124T1215Z · **Base master:** `c329b477d` ·
**Findings:** sim-findings.md lines 2742 (#2741: calledName drift line speaks
the true name) + 2743 (#2742: no canon doc covers the overheard name-reveal
channel). **Coordinator decision (1115Z run, Steve can overrule):** the drift
line speaks the USE-name.

## 1. The quirk (read from code, not invented)

- `npcName(rid)` (game.js:17772): a bestowed use-name (`calledName`, e.g.
  "Ash River") is preferred — first token ("Ash") — else the true name's
  first token ("Ashley"), else "Someone". `displayName` (game.js:17903)
  renders `npcName` once the name is known, so after a teach the village
  calls her "Ash" everywhere.
- `revealName(vid, how)` (game.js:17797–17813) computes its spoken name
  from `v.name` only (game.js:17806) — the TRUE first name. So the
  departure beat says "Ash" (beatName → npcName) but the teach's drift
  line says "Ashley", and the journal's name entry (journal.js:1225–1238
  wrap of revealName) also records "Ashley" — it reads `vp.name`
  directly (journal.js:1231). Two surfaces speak a name the village
  never uses.
- The overheard-chat path (game.js:19504) already speaks the use-name
  (`otherSaid = this.npcName(otherId)`); only the drift line it triggers
  — via `revealName(otherId, 'overheard')` — speaks the true name. The
  caller itself needs NO change; the fix in `revealName` covers it.
  Verified by code read at prereg time, not assumed.
- The other `revealName` callers (game.js:3062 gesture, conversation.js:
  6277 intro / 6278 gesture) funnel through the same function and are
  fixed by the same edit — no per-caller change.

## 2. The change (two one-token edits, no flag, no new system)

1. `src/js/game.js`, `revealName`: `const first = (v && v.name) ?
   String(v.name).split(' ')[0] : 'Someone';` → `const first =
   this.npcName(vid);` — `npcName` already returns "Someone" for a
   nameless record, so the NAMELESS guard behavior is preserved. All
   three channels (intro / overheard / gesture) speak the use-name
   when one exists, else the true name, exactly as before.
2. `src/js/journal.js`, the revealName wrap (line ~1231): `const first =
   (vp.name || 'Someone').split(' ')[0];` → `const first =
   (typeof this.npcName === 'function' ? this.npcName(vid) :
   (vp.name || 'Someone').split(' ')[0]);` — the journal's name entry
   records what the scholar actually heard. Same one-token change,
   same rationale; without it the journal would keep saying "Ashley"
   while the drift line says "Ash".
3. NOTHING else changes: `knownNames` writes, the `systemArrived` /
   already-known early returns, `canShow` gating, the beat text, and
   every caller are untouched. The 19504 caller is verified, not
   edited. Commit message carries `[needs-eyes]` (narration/feel).

## 3. Canon read

- `docs/CANON.md` read first; `docs/KNOWLEDGE.md` read in full. It
  registers "names are earned" (lines ~25–27) but the `overheard`
  reveal channel and the `knownNames` store's sharing across callers
  live only in code — finding #2742. This arm adds the KNOWLEDGE.md
  line registering the channel and its scope (name only; mechanics
  stays gated on `goalsKnown`/`systemArrived`).
- Naming-rite canon (`src/js/naming-rite.js` header): a bestowed name
  ADDS identity, never replaces the true name, which stays on the
  record. The fix follows it: the true name stays on the record and
  is still the fallback; only the SPOKEN name in the reveal channels
  prefers the use-name, matching what the village already says.

## 4. Proof test (scripts/test-calledname-a.js, full harness)

Loads the REAL game via `scripts/sim-harness.js` (`loadGame` +
`setupGame`, seed 99104 fixture seed) — no mirrors of `revealName`:
- §A code pins (read-only greps): revealName reads npcName; journal
  wrap reads npcName; the 19504 caller speaks npcName and calls
  `revealName(otherId, 'overheard')`.
- §B staged fixtures on the real Game (pre-System, day 6, holder
  known / companion unknown — the departteach repro shape):
  B1 direct `revealName(vid, 'overheard')` on Ash (true "Ashley Kim",
  calledName "Ash River"): drift line says "Ash" (never "Ashley"),
  `knownNames` set, `displayName` "Ash", journal name entry "Ash".
  B2 real `winPlanDepartLaunchBeat` with Ash as companion: beat line
  "…with Ash after Herald…", drift line "…Ash…".
  B3 no-use-name companion Mara: drift line says "Mara" (true name,
  exactly as before), displayName "Mara".
  B4 intro + gesture channels on Ash: both speak "Ash".
  B5 already-known idempotent (second revealName false, no second
  drift line); post-System no-op (revealName false, nothing spoken).
  B6 nameless record (no name, no calledName): "Someone", no throw.
  B7 no over-reveal: after a teach, `canShow('npc', vid,
  'mechanics')` is false while `systemArrived` false and `goalsKnown`
  unset; journal holds a name-only entry.
- §C sensitivity: the SAME test run BEFORE the fix must fail the
  use-name assertions (B1/B2/B4) and pass the no-use-name pins
  (B3/B5/B6/B7) — the instrument detects the fix's absence. A grep pin
  records that base `c329b477d` revealName reads `v.name`
  (`git show c329b477d:src/js/game.js`, revealName body).

## 5. Pilot (corpus replay — declared here, before any seed runs)

Replay the departteach after-leg seeds — the pooled 16-seed band
109431–109446 (pilot 109431–109438 + extension 109439–109446) — on
the FIXED code, against the RECORDED departteach arm corpora
(`evidence/2026-11-24/perseed-departteach-a-arm`) as the before-leg.
- Driver: a copy of `scripts/departteach-driver-a.js` as
  `scripts/calledname-driver-a.js` (the original refuses unless HEAD
  is its frozen prereg commit; the copy's FROZEN_BASE is THIS prereg's
  commit hash, RUN `calledname-a`, OUTDIR `perseed-calledname-a-arm`,
  MODE `arm` only). Substrate env identical to departteach:
  `GUNRATE=1 CELLGATE=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1
  VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1`; `KILLBUNDLE`,
  `LEND`, `PRESENCE`, `HPGATE`, `PINQUAD`, `PLANRESEED` unset. Policy
  `competent` verbatim. Horizon 150d death-aware.
- Analyzer: `scripts/analyze-departteach-a.js --before
  evidence/2026-11-24/perseed-departteach-a-arm --after
  evidence/2026-11-24/perseed-calledname-a-arm --out
  evidence/2026-11-24/calledname-a-analysis.json`. Its verdict label
  assumes before=ctl (teaches 0); the before-leg here teaches 5, so
  the label is NOT judged — the raw fields are (teach counts,
  line/struct/meta mismatches, drift counts).
- Band freshness: the band is a REPLAY of the departteach band, not a
  fresh band — declared, not hidden. No new seeds are spent; the
  replay's job is no-regression identity, not discovery.

## 6. Frozen bars

- **B1 (PRIMARY — mechanism, proof test):** drift lines speak the
  use-name on 100% of staged use-named companions (B1/B2/B4);
  displayName consistent ("Ash" everywhere after the teach); journal
  name entry records the use-name. PASS = all §B use-name checks
  green post-fix.
- **B2 (NO-REGRESSION — corpus replay):** per seed vs the recorded
  departteach arm corpora: deaths, launches, days, endReason
  identical; teach counts identical (5 taught pooled); beat lines
  identical EXCEPT any drift line whose companion carries a use-name
  (name-token-only diff allowed there — and expected to be ZERO on
  this band: the 5 recorded teaches are Lucas, Alfredo, Howard,
  Ethan, Paola, none bestowed a use-name in sims, so the honest
  expectation is byte-identical beat lines); drift-line count ==
  taught slots on the replay leg. PASS = analyzer `metaMismatches:
  []`, `lineMismatches: []` (or name-token-only), `structMismatches:
  []`, `teachMismatches: []`, taught 5 = taught 5.
- **B3 (SENSITIVITY):** pre-fix run of the proof test fails the
  use-name assertions and passes the no-use-name pins. PASS = the
  pre-fix run shows exactly that split.
- **B4 (NO OVER-REVEAL):** no-use-name companion behaves exactly as
  before (B3: true name spoken, as before); mechanics stays gated
  after a teach (B7). PASS = B3 + B7 green, no other fixture surface
  changes.
- **B5 (INSTRUMENT):** analyzer `--selftest` green; replay analyzer
  runs with 0 instrument errors on all 16 replay files. PASS = both.
- **B6 (PILOT GATE):** GO iff B1 + B2 + B3 + B4 + B5 all pass. No
  confirm spend: the corpus is a replay, not a new band; the
  mechanism is carried by the proof test + determinism of the
  one-token edit, the corpus carries no-regression.
- **Denominator honesty (recorded before running):** if the replay
  shows 0 use-named drift lines (the expected case), B1 is carried
  by the proof test alone and the corpus contributes B2 identity
  only — that is stated in the evidence, not re-scored as a corpus
  pass of B1. A use-named drift line in the corpus, if one appears,
  must speak the use-name (B2's name-token allowance covers it).

## 7. Wall numbers (reported every run, never judged)

From the departteach pooled band (both legs identical): wins 0/16,
national 0/16, table 0/16, wave-5 reached 9/16, wave-4 reached 16/16,
median survival 134.5d. The replay must reproduce them exactly (B2
identity); the scale wall stands, unchanged by this arm — as
expected: a name-consistency fix is not a scale lever.

## 8. Metric review (to fill at evidence time, never mid-run)

- Did any use-named drift line appear in the corpus replay? (Expected:
  none — the naming rite is a player action; sims never bestow
  use-names. If one appears, where did the calledName come from?)
- Is the corpus the right instrument for a narration-consistency fix,
  or does the proof test carry the whole verdict? (Proposed revision
  candidate for the next run: narration fixes judge on the fixture
  + a corpus no-regression replay, with no teach-rate bar at all.)
- Journal wrap: is recording the use-name in the journal the right
  call, or should the journal keep the true name as the scholar's
  private note? (Coordinator/Steve can overrule — the drift line
  decision is theirs; the journal follows it here for consistency.)

## 9. Out of scope

- `revealName` callers other than the two edited sites are verified,
  not edited. The holder-not-taught boundary (departteach §10) is
  untouched. No beat text changes. No `knownNames` semantics change.
- The departteach proof test's §B9 fixture MIRRORS the old revealName
  (its local `first` comes from `v.name`) and pins the old drift line
  ("Ashley") — it does NOT load real game.js, so it is unaffected by
  this fix and needs no update. (Its mirror is now stale w.r.t. real
  game.js; noted here, not chased — a mirror update belongs to a
  departteach follow-up, not this arm.)
