# sim-bindingtrace-b — prereg: trace the BELONG → Binding chain, name the first failing link

Run: fleshout-loop-b-20261110T1030Z (Loop B, second axis). Worktree:
`~/workspace/worktrees/sim-bindingtrace-b` (branch sim-bindingtrace-b).
Axis: scale-onramp / winnability chain. Claim:
`hidden_files/lever-claims/fleshout-loop-b-20261110T1030Z.json` (coordinator).

## Context: the follow-up question (not a re-measurement)

sim-binddiag-b (2026-11-08, evidence/2026-11-08/sim-binddiag-b.md) decomposed
the national pipeline on the tableseat-nowait substrate, band 76401–76408:
links 8/8 → subs 8/8 → seasoned 8/8 → LEAD qualifies 5/8 → beats staged
4/8 (ALL First Court, all day 77) → national held to end 2/8; full seat 0/8.
Its shape attribution was unambiguous: **The Binding (the BELONG road's
beat, swear/serve/walk) never fired once, because the substrate forms ZERO
Haven-subordinate links on that band.** This arm does NOT re-assert that it
fails. Its job is to say WHERE the belong chain fails — the first failing
link per seed — by tracing the chain the prior arm could only see as absent:

  B0 a foreign polity reaches size >= 4 (a realm exists to belong to)
  B1 Haven becomes a subordinate (a link with subordinate='haven' forms)
  B2 the belong link reaches good standing (trust >= 50, arrears 0, age >= 14)
  B3 the belong link's primary holds a foreign 4-realm while B2 holds
      (BELONG qualifies — _belongPolity() non-null)
  B4 The Binding stages (LEAD-mask recorded: shape priority stages the
      First Court first when both qualify)
  B5 The Binding resolves: answered (swear/serve) / walked (refuses the
      scale) / died — and WHY (exiled answerer, link broke, realm dissolved)

## Canon + code read first (before any sim)

- docs/CANON.md, docs/SCALE.md. No canon invented.
- NAMING (code authority, already settled by sim-binddiag-b): "The Binding"
  is the BELONG road's beat — `src/js/hierarchy.js:2489`
  (`belong: 'The Binding'`), `hierarchy.js:2541` (stageNationalBeat comment),
  docs/SCALE.md. The LEAD road's beat is "The First Court".

## The gate, exactly (code authority — src/js/hierarchy.js)

1. **The ONLY way Haven becomes a subordinate on this substrate.**
   leanlinkrescue proposes ONLY `asSubordinate: false`
   (`scripts/policies/leanlinkrescue.js`), but a proposal scoring 35–54
   stages a COUNTER (`_stageCounter`, hierarchy.js:686) whose terms are
   "they'll TAKE Haven" (`asSubordinate: true`, tribute 5,000–6,000 kcal/wk).
   leanlinkrescue answers counters accept (pantry <= 25,000 kcal) or sweeten
   (pantry > 25,000 kcal); accept forms the link Haven-subordinate, while a
   successful sweeten re-judges at the PROPOSAL's terms (Haven-primary).
   So belong links on this substrate are counter-accepts, nothing else —
   and the recorder must read the FORMED link's real role, never the
   proposal's intent (same call binddiag-b made).
2. **Foreign realms grow off-screen** (`_foreignPolitySim`, hierarchy.js:2335):
   weekly, only once `networkLive`; drift ~12%/wk SEEDS a pair but never
   grows past one; growth to 3–4 fires needs engagement (stirRegion beats
   banked by the player's deeds, ~3 beats move the region that week) and
   consolidates around the largest polity. Candidates are other villages
   that know Haven and are not already in a foreign polity.
3. **BELONG qualification** (`polityOf`, non-HOME branch, hierarchy.js:2216):
   the link must be active, subordinate HOME, good standing (trust >= 50,
   arrears 0, link age >= 14 days), AND the primary's foreign polity must
   hold >= 4 villages (primary + Haven + >= 2 subs).
4. **Shape priority** (`_havenPolity`, hierarchy.js:2237; `_checkNational`,
   hierarchy.js:2517): lead → belong → covenant → trade. A LEAD
   qualification stages the First Court first; once `nationalLive` is set
   via LEAD, belong can never stage (`nationalLive` blocks `_checkNational`,
   hierarchy.js:2501). A belong qualification that never stages because
   LEAD staged first is recorded as MASKED, not as "belong failed".
5. **Staging gate** (`_checkNational`, hierarchy.js:2425): networkLive AND
   regional age >= 30 days (one rung per season); never when `scaleRefused`,
   never while the answerer is exiled, never while a beat is pending.
6. **The Binding's answer** (`answerNationalChoice`, belong branch,
   hierarchy.js:2745) re-checks ONLY the link (active, subordinate HOME) —
   NOT the foreign polity size. A realm that shrank between staging and
   answering does not kill the oath at answer time. A broken belong link
   kills it aloud at answer time ("The Binding never happens — the link
   came apart", hierarchy.js:2749).
7. **Death modes.** Exiled answerer kills a staged beat aloud at the next
   day boundary (hierarchy.js:2487). Realm dissolution clears `nationalLive`
   aloud (hierarchy.js:2428). Walking from the Binding refuses the scale
   permanently (hierarchy.js:2764).

## Composition choice (decided before sweeping, documented per brief)

- REUSE `scripts/policies/tableseat-nowait.js` unmodified — leanlinkrescue
  courtship (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no
  wait leg. Same substrate as 2115Z/2215Z and sim-binddiag-b, which reached
  national 7/8, 8/8, and 4/8 respectively — a substrate that never reaches
  national cannot test the mechanism (see the before-validity bar below).
  The doorwalk/takeseat frozen-instrument baseline leg (national 0/16 by
  construction) is NOT used as the judge here.
- REUSE `scripts/policies/binddiag-b.js` (`BINDIAG=1`) as the inner layer —
  it already carries the national pipeline (beats with shape attribution,
  national-loss events, engine-gated standing validation). Re-measuring
  that pipeline in a second recorder would duplicate proven-neutral code.
- NEW recorder `scripts/policies/bindingtrace-b.js` (`BINDINGTRACE=1` gate),
  composed OUTSIDE binddiag-b. PURE-READ, modeled on binddiag-b: it never
  calls `villageStandingTotal()` during a run or `polityOf()` (which
  initializes `state.foreignPolities` on the non-HOME branch); BELONG
  qualification is reproduced from pure reads of `hierarchyState()` links +
  `Game._linkSeasoned` + `state.foreignPolities` + `state.pendingCounter` +
  `state._regionStir` + `state.pendingNational` / `nationalLive` /
  `scaleRefused` flags. It writes nothing to game state and draws no RNG.
  It READS `ctx._binddiag.beats` to attribute Binding staging/resolution
  and LEAD-mask events — never writes to the inner recorder's data.
- The recorder samples AFTER the inner daily delegates (same convention as
  binddiag-b: end-of-day samples). Counter attribution: a counter staged on
  day D is answered on day D+1 by the substrate's daily, so a link first
  seen the day after a seen counter for the same target is a counter
  resolution — accept-sub if it lands Haven-subordinate, sweeten-primary
  if it lands Haven-primary; a counter that clears with no link is a failed
  sweeten (accept always forms a link).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait leg.
- Baseline: tableseat-nowait, `BINDIAG` + `BINDINGTRACE` unset. Own baseline
  replication (8), NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with `scripts/policies/binddiag-b.js`
  (`BINDIAG=1`) and `scripts/policies/bindingtrace-b.js` (`BINDINGTRACE=1`).
- Seeds (pilot): 81201–81208. Freshness verified at run start (see below).
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over). 180d,
  not 150d: the substrate's prior evidence justifies it — national day 77
  on all four national seeds, a second First Court at day 134, national-loss
  events at days 88–147 (sim-binddiag-b). A 150d horizon would truncate the
  persistence leg and the re-stage leg the Binding question needs.
- Primary (DIAG-GO, ALL must hold):
  1. 8/8 armed configs produce a full daily belong-chain trace (foreign
     polity trajectory + first-days, counter events, link-formation events
     with roles, belong-link good-standing days, qualification days, LEAD-mask
     days, Binding beats with death-why) with first-days for every chain
     stage and an end snapshot;
  2. the chain is CLASSIFIED on >= 7/8 seeds — `classifyBelong()` names the
     first failing link per seed (no-foreign-realm / foreign-realm-no-belong-
     link / belong-link-never-good / belong-good-no-realm / masked-by-lead /
     binding-died:<why> / binding-walked / binding-answered);
  3. a ranked belong-funnel list: for each chain stage (B0 foreign realm →
     B1 belong link → B2 good standing → B3 qualify → B4 Binding staged →
     B5 Binding answered), the count of seeds reaching it, with median
     first-days;
  4. det-gate G1 PASSES (see below);
  5. recorder neutrality G2 PASSES (see below);
  6. corpus integrity G3 PASSES (see below).
  Any Binding staged is a breakthrough — reported prominently even if the
  verdict is otherwise NO-GO. (Expected 0/8 staged: the prior arm's zero
  belong links on 76401–76408; this diag judges WHERE the chain fails, not
  whether the beat fires.)
- Before-validity bar (the arm's own bar, per the 2026-11-09 flee-loop
  finding: a before side with 0 events cannot test the mechanism):
  national-ever >= 4/8 on the armed arm. Below 4/8 the arm reports NO-GO
  on before-validity even if G1/G2/G3 pass — the substrate must still reach
  national on current master for the trace to mean anything. (Prior band:
  exactly 4/8.)
- Cost bar (diagnostic, reported even for a diag): starvation totals,
  median days, baseline vs armed.
- Proof gates:
  - G1 det-gate: with BOTH recorders unset, the doubly-wrapped policy ==
    unwrapped policy on one seed (days/gameDays/ts counters identical, no
    `_binddiag` / `_bindingtrace` surface on ctx).
  - G2 recorder neutrality: for ALL 8 seeds, baseline vs armed identical
    on days/gameDays/ts counters/starvation (a daily recorder that leaks
    anywhere is NO-GO).
  - G3 corpus integrity: 16/16 rows; every armed row carries the full
    daily trajectory (binddiag + btrace) + stage first-days + end snapshot
    + a classification; every baseline row carries a post-run pure-read end
    snapshot; engine-gated validation matches on every armed row.
  - Engine-gated validation: the recorder's computed gated standing total
    equals the engine's `villageStandingTotal()` at run end on every armed
    seed (inherited from binddiag-b, same validation).
- Landing rule: DIAG-GO → this run's commit is instruments + evidence +
  corpus (new default-OFF recorder policy composing binddiag-b; no
  game-code change, no default flips). Det-gate failure → NO-GO,
  instruments + evidence only, verdict recorded. Before-validity failure →
  NO-GO on that bar, trace + evidence still committed (the trace is the
  finding's context, not a re-score).
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on the
  corpus; if it throws (known 1955Z/2115Z/2215Z/2026-11-08 failure on
  per-seed rows), record exactly why + sweep-compare tables as the §15
  comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of a seed
  where the belong chain stalls — judge meaning/coherence/consequences,
  never just counts: does the game ever TELL the village it could belong
  to a foreign realm, that a counter offered them a subordinate's seat, or
  that a court is coming — or does the BELONG road stay silent all run?

## Seed-band freshness (per local_seed_band_freshness skill — full search, not just today)

- Chosen band: **81201–81208**.
- Search scope: every dated prereg under `evidence/`
  (`evidence/*/sim-*-prereg.md`), every dated `evidence/*/sim-*.md`, seed
  filenames anywhere under `evidence/`, and `scripts/` — run 2026-11-10.
- Result: **0 seed-uses** in all scopes. Decisive checks (rg, 2026-11-10
  ~11:05Z): 0 hits for `"seed": 8120[1-8]` / `seed=8120[1-8]` /
  `SEEDS=...8120[1-8]` anywhere under `evidence/` `scripts/` `docs/`; 0
  seed-filename collisions (`find ... -name "*8120*"` empty); 0 hits in
  any dated prereg (`evidence/*/sim-*-prereg.md`). Plain-substring hits
  (44–56 files per seed) are all spurious numbers of the same class the
  binddiag prereg recorded: floating-point kcal values in old corpora
  (`"ate":2178.63153081201`, `"ate":1735.8228381201625`) and pantry amounts
  (`"pantryKcal":81208`) — sampled and classified, none a seed. The band
  is fresh.
- REJECTED bands, recorded so the next worker does not repeat them:
  73701–73708 (named in 2026-10-27 preregs; used by
  `scripts/sweep-deathrow-b.js`); 73641–73648 (2115Z); 73671–73678 (2215Z);
  76401–76408 (sim-binddiag-b, 2026-11-08).

## Instrument

- `scripts/policies/bindingtrace-b.js` (new recorder, `BINDINGTRACE=1` gate).
- `scripts/test-bindingtrace-b-sweep.js` (sweep + --detgate + --sense modes),
  modeled on `scripts/test-binddiag-b-sweep.js` (loadGame/setupGame/runDays,
  per-config incremental corpus writes via
  `scripts/sim-postunlock2-b-writer.js`).
- `scripts/test-bindingtrace-b.js` (proof test: belong-good bar boundaries,
  foreign-size computation, classifyBelong on every chain stage, recorder
  purity on a mock Game, counter/link/mask/death-why event legs).
- Corpus: `evidence/2026-11-10/perseed-bindingtrace-b/` (16 rows + summary.json).
- Evidence: `evidence/2026-11-10/sim-bindingtrace-b.md` (with metric review +
  wall numbers: national / table / wins, wave 4–5 unlocks, median survival).

## Flap protocol

Probe O_EXCL file creation (`git update-ref refs/heads/probe-sim-bindingtrace-b
HEAD` then delete it) before every sweep and every commit; if the probe
fails, wait and retry — never force ref surgery during a flap. Heartbeat the
tree every ~30 min (`bash scripts/worktree-heartbeat.sh sim-bindingtrace-b`); if
the heartbeat script hangs >2 min, kill it and continue. Probe OK 10:50:18Z
at sweep time (ref `probe-sim-bindingtrace-b` created + deleted, no flap).
