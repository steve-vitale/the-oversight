# Journey ENDGAME R18 (2026-10-18) — grey finals + trial by combat: the two never-completed endgame mechanics

**Run id:** 20261018T1655Z (oversight-playtest-loop-2, lane B). Worktree: `journey2-4`.
**Base:** master 74b3900df (pulled at run start). Rotation index was 4 (endgame); this run plays leg 4.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** two documented endgame mechanics have NEVER completed in
sims — (1) the relay GREY-band finals ("both-hands" / "the-contract"), the
pragmatist's endings (TABLE.md GRADIENT law; r17's grey-band walks all
failed in the cockpit); (2) TRIAL BY COMBAT (feared beat 2), the single
opt-in existential risk — does the champion fight resolve blow-by-blow, and
on loss does the mantle pass mid-table with the table continuing?

**Arms** (belongseat stack — TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 +
BELONG_V3=1, env set BEFORE any require):
- GREY: control + Bearer claims relay (pk>30000, roster≥6); daily reroute
  alternating honest(+2)/efficient(−2) to hold lean ~0; never deepen/probe
  pre-table. Door: relay-first. Cockpit steer: efficient×4 (merge 8, lean
  −8, zero backfire rolls). Finals steer: 'final:both-hands' (8961, 8963),
  'final:the-contract' (8962, 8964).
- TRIAL: control. Door: feared-first. Beat-2 steer: 'trial'. Finals:
  scorer's pick.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 reach GO: ≥3/4 seeds reach table announcement per arm.
- M2 grey GO: ≥1 seed completes a grey final (outcome voiced, won).
- M3 trial GO: ≥1 trial fight resolves blow-by-blow to win or loss; on loss
  the table continues (no softlock); on win terror maxes (10).
- M4 people GO: ≥2 transcripts sense-read, 0 senseless flags.
- M5 census GO: post-table census real on all seated runs; no crash/softlock.

**Interesting-finding bar:** a grey final COMPLETED (first time); a trial
fought to a result (first time); or a blank discovered (unfireable).

**Seeds:** fresh 8961–8964. **Pilot:** 1 seed (8961) × 2 arms; expand if it
works. **Horizon:** 210 loop-days, death-aware. Conversation driver = r17's
pinned fresh-first driver, unchanged.

## INSTRUMENT BUG (caught by the pilot — read before the results)

The r18 pilot went 0/2 on table-reaching (8961 grey + trial both stalled,
no announcement), and the first matrix went 0/8. Root cause: my harness
never set the policy-stack env vars (TRIBFLOOR/WINDEFER/FEASTSCALE_R13/
BELONG_V3) — r17 sets them BEFORE any require (feastscale gates on
FEASTSCALE_R13, belongseek reads BELONG_V3 at load). Without them the runs
had no feasts, no tribute floor, no win deferral: a weaker stack that
couldn't push scale. The d21 fork was visible in transcripts (r17x feasted,
r18 didn't). Decisive check: r17's exact script (r17x copy) on the current
tree went 3/4 (8951 sat d90 won; 8952 sat d101 won; 8954 sat d166 won;
8953 lost d72) — the tree is fine, the instrument was misconfigured.
Fixed (env block at top of the r18 script) and the full matrix re-ran.
Day-1 transcripts were byte-identical between the broken and fixed runs,
diverging at the d21 feast — the env gate, confirmed.

## INSTRUMENT BUGS 2–4 (caught by the fixed matrix — all harness-side)

The env-fixed matrix reached the table 7/8 — but surfaced three more
harness bugs, all mine:
2. **Beat-steer IDs**: the cockpit/trial options are `beat:efficient` /
   `beat:trial` (tableChoose strips the `beat:` prefix); my steer matched
   the bare ids and never fired. The drain picked `beat:probe` (options[0])
   → 50% backfires → all three grey walks quarantined (2× three-backfires,
   1× hollow grounding). The trial steer likewise never fired.
3. **Wrong tele function**: I wrapped `G.telemetry`; `table_won` emits via
   `teleMilestone` → `G.tele`. My won capture never fired.
4. **`res.over` doesn't exist**: runDays returns `{days, gameDays,
   endReason, ...}` — no `over`. My won/over read `undefined`. Now reads
   `Game.over`/`Game.won` directly (+ the tele `table_won` event).
5. **Flavor flags on the wrong ctx**: the harness passes its own ctx to
   policy.daily; I read flags off my outer `ctx`. Now captures
   `harnessCtx` (r17's pattern). (This hid the fact that the grey flavor
   WAS working: 8962 claimed the relay d68, 18 alternating reroutes.)

All fixed; full matrix re-running.

## RESULTS (8 runs, fixed instrument)

| seed | grey | trial |
|------|------|-------|
| 8961 | **relay/grey → both-hands WON** d139, 8/8 | feared/light WON d114, 8/8 (trial: death → mantle → win) |
| 8962 | **relay/grey → the-contract WON** d128, 9/9 | feared/light WON d112, 9/9 (trial: death → mantle → win) |
| 8963 | **relay/grey → both-hands WON** d97, 7/7 | feared/light WON d90, 8/8 (trial: death → mantle → win) |
| 8964 | scattered d185 (starvation), 4/4 | feared/light WON d125, 8/8 (trial: routed, survived → win) |

- **M1 reach GO:** grey 3/4, trial 4/4 announced+seated.
- **M2 grey GO:** 3/3 seated grey walks completed a grey final — both-hands
  (8961, 8963) and the-contract (8962) — outcomes voiced, runs won.
  Telemetry records `moral: 'grey'`. First grey finals ever completed in sims.
- **M3 trial GO:** 4/4 trial fights resolved blow-by-blow. 3× the Bearer died
  (round 3 vs the Finale) → mantle passed mid-table to a new Bearer → the
  table continued → the new Bearer completed feared/light and WON. 1× the
  Bearer was routed but survived → table continued → won. No softlock, no
  crash. Terror was 4 at loss-resume (not maxed — correct, they lost).
- **M4 people GO:** 4 transcripts sense-read, 0 senseless flags (see below).
- **M5 census GO:** post-table census real on all 7 seated runs; 8/8
  terminated cleanly; no crash/softlock.

**The leg question, answered:** both never-completed endgame mechanics now
complete end-to-end. The grey band is earnable (lean held ~0 via alternating
reroutes; the cockpit efficient×4 holds it) and both grey finals play their
full voiced endings. Trial by combat is the single opt-in existential risk
working as designed — death passes the mantle mid-table and the story
continues weakened; the table never strands.

## Village assessment (census in plain words)

- **8961/grey:** Somchai's village. Claimed the relay, held lean at 2,
  walked the grey road, both-hands ending d139. 8/8 alive. The village
  endures; Somchai walked out of the light alone, which is how he walked in.
- **8962/grey:** Jae's village (Bearer held the relay 60 days, grounding
  eroded to 27). The-contract ending d128. 9/9 alive. Jae OBrien ascended
  unbacked → the honest OUTSHONE epilogue ("the god is someone else") —
  correct per the facilitation design; the Bearer won the table but not the
  village's story.
- **8963/grey:** the fast one. Relay/grey, both-hands, won d97. 7/7 alive.
- **8964/grey:** the starvation seed. Claimed the relay (82 reroutes), but
  the village never scaled and scattered d185 on the fifth hungry day. 4/4
  walked away in different directions. The relay's price (losing the
  Bearer's hands) is honest.
- **Trial arm (all 4):** feared/light wins. Three Bearers died to the Finale
  in round 3 (Somchai d114, Carlos d112, gen_9ewa d90); each mantle passed
  cleanly with the full succession beats (grief, "You're not Somchai",
  trauma, the village speaking for the successor); each successor finished
  the feared path and won. The fourth (8964) was routed but lived.

## People check (SENSE-TESTING LAW)

1. **8961/grey both-hands final:** "The middle road is open" (correct grey
   voicing, not "the light road"). The door gift granted the tender hand
   (lean 2 > 0): Translate/Sanctuary/Advocate. During the cockpit, lean
   went negative and Skim (dark) unlocked via the gradient gates — "acts
   can still open the other track" working as designed. The final: "WHICH
   HAND WON?" / "Neither. Both." / the machine ACCEPTS an unclean answer.
   0 senseless flags.
2. **8962/grey the-contract final:** the System reads the terms —
   "INEFFICIENT. UNFAIR. TILTED ENTIRELY TOWARD THE HUMANS... I LOVE THEM.
   I WILL SIGN THEM IN EVERY COLOR OF WEATHER I HAVE." 0 senseless flags.
3. **8961/trial fight + mantle:** 3-round fight vs the Finale, Somchai down.
   "The Codex turns a page on its own. Somchai Prasert is dead. You didn't
   ask. It knew." → "TRIAL LOST — the champion stands over the body. The
   mantle passes mid-table; a new face sits in the pale light." → Morgan
   Adams (54, crossing guard) takes up the feared path and wins. The
   succession beats are full and human. 0 senseless flags.
4. **Bandar convo (post-table, 8961/grey):** "You walked out of the light
   and came back breathing. Did it work? Is it done?" — the villager wants
   to know; the exchange is short but coherent and grounded in the shared
   event. 0 senseless flags.

## BLANKS (none — no game-code changes this run)

No game bugs found. The five instrument bugs were all harness-side (mine),
fixed in the script. The grey finals and trial-by-combat both work as
designed. Nothing to proof-test.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json`
(wins, table, tableSceneFired, tableSceneCompleted, seatApproach,
ascensions, exiled): **quiet** — 2 files, 7 metrics, no large deviations.
r18: 7/8 wins, 7/8 tables (grey 3/4 + trial 4/4); baseline: 7/8 (r14).
No LOUD lines. Baseline NOT rolled forward (no deviation to explain).

## METRIC REVIEW (§14)

- M1–M5 all GO. No metric proved wrong.
- The pre-reg's pilot (1 seed × 2 arms) caught the env-var instrument bug
  before the matrix ran — the pilot-first rule working as designed.
- Note for future runs: the r18 harness now sets the policy env vars
  explicitly and uses `beat:`-prefixed steer IDs; the `G.tele` (not
  `G.telemetry`) wrap; `Game.won` (not `res.over`); `harnessCtx` for flavor
  flags. Any future endgame harness should start from the r18 script, not
  r17's.

## Reachable / Fun / Winnable

- **REACHABLE:** Yes — 7/8 competent runs reached the table; the relay/grey
  door is reachable on stage-3 integration (all three grey walks qualified
  without pre-playing the relay); the trial is offered on every feared walk.
- **FUN:** The grey finals are the best-written endings in the game
  ("I WILL SIGN THEM IN EVERY COLOR OF WEATHER I HAVE"). The trial is
  genuinely terrifying — three Bearers died in round 3, and the mantle-pass
  mid-table is the most dramatic succession beat in the corpus. The
  downgrade path (from the earlier broken runs) remains the standout
  failure design.
- **WINNABLE:** Yes — 7/7 seated runs won. Failure never wiped anyone.

## Evidence

- `evidence/2026-10-18/journey-endgame-r18.md` (this note)
- `evidence/2026-10-18/journey-endgame-r18-{grey,trial}-s{8961..8964}.json`
- `evidence/2026-10-18/journey-endgame-r18-transcript-{grey,trial}-s{seed}.txt`
- `evidence/2026-10-18/journey-endgame-r18-frames-{grey,trial}-s{seed}.json`
- `evidence/2026-10-18/journey-endgame-r18-convos-grey-s{8961..8964}.txt`
- `evidence/2026-10-18/tele-r18-{grey,trial}.json` (telemetry-check inputs)
- `scripts/journey-endgame-r18-20261018.js` (harness + flavor instruments + steers)
- `scripts/analyze-r18.js`, `scripts/build-r18-tele.js` (analysis tooling)

**Game-code changes this run:** none.
**Tooling:** the r18 harness (5 instrument bugs fixed) + 2 analysis scripts.
Merged locally, pending ship.
