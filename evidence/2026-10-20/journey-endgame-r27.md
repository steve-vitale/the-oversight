# Journey ENDGAME R27 (2026-10-20) — RELAY/DARK COMPLETION: "become its voice"

**Run id:** playtest-loop2-20261020-1655 (oversight-playtest-loop-2, lane B). Worktree: `journey2-endgame`.
**Base:** master 116e80090 (pulled at run start; includes r25's arenaAct-on-death fix + r26's path-variety landing). Rotation index was 4 (endgame); this run plays leg 4. Rotation advanced to 5 after this run.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** RELAY/DARK COMPLETION — "become its voice". The dark band of the flagship path has NEVER completed in sims: r17's dark arm reached lean −82 via 42 efficient reroutes + 10 deepens, then failed on the designed quarantine machinery (3 backfires from the deepens' 25% roll, grounding hollow from −1/day holding + −3/deepen). r26 forced every lesser door and won 10/10 — but relay landed GREY ×2; dark was not attempted. TABLE.md describes the dark merge as a real ending ("become its voice... Power immense. Self eroded. The System finally says your name right."). This run tests whether a CAREFUL dark playbook can complete it, or whether the dark band is a designed failure funnel (completable in prose, uncompletable in numbers).

**The careful-dark playbook** (all honest player verbs, no cheats): claim the relay office (~day 55–65; needs linked village + roster ≥ 6 + pantry > 25000), then `relayReroute('efficient')` DAILY until lean ≤ −44 (margin past the −40 dark threshold). NO deepens (25% backfire, −3 grounding), NO probes (50% backfire), NO communes (scene lean drift). Holding costs −1 grounding/day → ~−25 over the playbook, landing ~75 (nowhere near hollow). At the table: PATHFORCE=relay; cockpit `beat:efficient` ×4 (merge 8, lean −2/beat, zero backfire, zero grounding); conscript ACCEPTED (dark playbook takes the army); finals `final:voice`.

**Interesting-finding bar:** the first completed relay/dark merge in sims — or the exact quarantine that fires, on exact numbers (which failure mode, at what lean/grounding/backfires).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 setup GO: ≥2/4 seeds reach the table with lean ≤ −40 AND grounding ≥ 50 at door entry.
- M2 complete GO: ≥1 seed completes relay/dark (dark final chosen, table_won with moral 'dark').
- M3 people GO: ≥2 relay beats sense-read (cockpit beats + dark final), 0 senseless flags.
- M4 census GO: all runs end cleanly (win / honest loss); no crash/softlock.
- M5 guardrail GO: table announce ~d90, seat shape consistent with r19–r26 (no instrument perturbation).

**Seeds:** fresh 9051–9054. **Pilot:** seed 9051 first; expand iff M1 shows life. **Horizon:** DAYCAP=260, death-aware (+10d tail max). **Stack:** r26's seat-driver tip (TRIBFLOOR=1 WINDEFER=1 FEASTSCALE_R13=1 BELONG_V3=1, set BEFORE any require — r18's lesson).

## DECISION LIST (my calls — Steve corrects)

1. **R27's question: relay/dark completion** — the last unplayed table branch in sims (r22 played all doors; r24 played beloved-light; r26 played relay-grey ×2; relay-dark never completed).
2. **The careful-dark playbook** (above) — designed from the r17 failure autopsy: the quarantine has exactly two triggers (3 backfires, hollow grounding); the playbook takes neither risk.
3. **Conscript accepted** — the dark playbook takes the army; the consequence (pods opened "not like morning — like a barracks") is recorded, not dodged.
4. **No game-code changes** — evidence + harness only. The one cosmetic prose/state mismatch found (beat-2's static SAY vs the live meter line) is documented, not fixed — flavor text, Steve's call whether it needs the conditional.
5. **No baseline roll-forward** — same call as r21–r26: the endgame baseline is the 8-seed seat-driver tip; this 4-seed darkmerge flavor is a different instrument.

## RESULTS (4 seeds)

| seed | days | won | door/branch | lean@entry | ground@entry | backfires | reroutes | final | mantle passes |
|------|------|-----|-------------|-----------|--------------|-----------|----------|-------|---------------|
| 9051 | 113 | yes | relay/**dark** | −44 | 100 | 0 | 22 | final:voice | 3 (Boris→Eilis→Boafo→Fatima) |
| 9052 | 49 | no | — (died pre-table) | — | — | 0 | 0 | — | — |
| 9053 | 30 | no | — (died pre-table) | — | — | 0 | 0 | — | — |
| 9054 | 90 | yes | relay/**dark** | −44 | 100 | 0 | 22 | final:voice | 2 |

- **M1 setup GO 2/4** (bar ≥2/4): 9051 (lean −44, grounding 100), 9054 (lean −44, grounding 100). Both comfortably clear of both quarantine triggers.
- **M2 complete GO 2/4** (bar ≥1): 9051 and 9054 both completed relay/dark — dark final chosen, `table_won` with `moral: 'dark'`, `path: 'relay'`, `branch: 'dark'`. **The first relay/dark completions in sims.**
- **M3 people GO:** 2+ relay beats sense-read (below), 0 senseless flags.
- **M4 census GO:** 9052 (Bearer Simon "succumbed to the fever" d49, village of 3), 9053 (pantry empty "Day 3 of hunger" d30, "people started walking — in different directions") — both honest pre-playbook deaths (claim day is 55+; reroutes=0 on both), death-aware horizon respected. No crash/softlock.
- **M5 guardrail GO:** 9054 announced/won d90 (classic seat-driver shape); 9051 announced d113 (late — three bearer deaths delayed the seat). 50% pre-table attrition is inside the honest envelope (r23's 9021 d34, r24's 9031 d69).

**The leg question, answered:** the dark band is NOT a designed failure funnel. A careful dark playbook completes the relay/dark merge: 22 efficient reroutes → lean −44 (grounding never below 77 on the playbook), 4× `beat:efficient` in the cockpit (merge 8, zero backfires, grounding untouched), conscript accepted, `final:voice` — "You stay inside. Forever... Power immense. Self eroded. The System finally says your name right." The r17 failure was the playbook (deepens + 84-day holding), not the design. The quarantine triggers are real but avoidable by design — the dark merge is earned, not given.

### The succession chain (9051 — the office outlives the bearer)

- d56: Boris Kowalski claims the relay; 22 efficient reroutes → lean −44 by d79 (grounding 77).
- d83: Boris dies ("Boris is out of the relay — the holder died"). Mantle → Eilis O'Kelly. **The lean (−44) survives** — it lives on `state.scholar.relay`, and the mantle law is explicit: "the OFFICE is the village's (slots, arc, integration, ledger, Codex). The body is new." (ledger.js).
- d100: Eilis dies in combat → Boafo Taylor. d103: playbook re-claims (office was vacant).
- d112: Sanne Bakker dies → Fatima Hassan (48, paramedic).
- d113: Fatima sits at the table, enters relay/dark with the office's inherited −44, accepts the conscript, plays the cockpit, becomes the voice.
- The epilogue names Fatima correctly: "◈ Fatima Hassan reached into the light and the light reached back — person and machine, two caretakers, holding the channel open between them both ways." (Fatima the person, Eilis-now-the-machine — the two caretakers.)

Design observation (Steve's call, not a bug): the leaning meter — "the System is the relationship" — transfers across bearers with the office. Three bearers died earning it; the fourth completed it. The code's office-passes law is deliberate; whether the *relationship* should be office property is a design question.

### Village assessment (census in plain words)

- **9051 (won d113, relay/dark):** 5 alive at the end — James (carpenter), Ruia (cook), Fatima (paramedic, the voice's successor), Sofia (community gardener), Grace (ESL teacher). Four bearers in 113 days (Boris d83, Eilis d100, Sanne d112 — combat and the relay's price). The village that paid its bearers to the dark and won anyway.
- **9054 (won d90, relay/dark):** the clean run — 22 reroutes, lean −44 by d80, table d90, final:voice. Norman Lang completed the merge.
- **9052 (fell d49):** fever took the Bearer Simon; the village was 3. The mundane pool (DISEASES.md canon), honestly voiced.
- **9053 (fell d30):** the pantry never stabilized — "Day 3 of hunger... people started walking — in different directions. The scattering, again." The food engine's early verdict, as it does.

## People check (M3 GO — 2+ sense-reads, 0 senseless flags)

1. **The conscript (9051, d113):** "The System waits. The pods wait. The mourners — somewhere below the light — have gone very still." Accept: "You say yes. The word is small. The pods open — not like morning. Like a barracks." (KIN.md honored — the Taken children, opened as an army. The refusal would have been voiced: "The mourners exhale.")
2. **The cockpit (9051, d113):** four beats with LIVE meter lines — "merge 0/8 · sysbond 0 · grounding grounded · leaning total -44" — the dark band voiced as "total −44", never a hidden reveal. Beat 1 carries the build beat ("◈ YOUR BUILD — The System has watched you for ninety days...") with the stake option offered and legitimately declined. *Cosmetic note:* beat-2's static SAY ("sysbond climbing, grounding fraying") mismatches the live meter line (sysbond 0, grounding grounded) on the efficient playbook — prose written for the deepen path. Flavor only; documented, not fixed.
3. **The dark final (9051 + 9054):** the audit prices the run aloud ("A lesser seat — global standing, waves 1–3 faced (15/10/3), 14 contests survived, 4 crises weathered. The table does not rise. It prices."), then "◈ THE RELAY — 'Become its voice.'" → "You stay inside. Forever... The village grieves you while you're alive, and you feel their grief the way weather feels rain. Power immense. Self eroded. The System finally says your name right." 9054's is identical in structure (waves 11/5/5, 7 contests) — the branch is a different game from grey's both-hands, not a reword.
4. **Day-80 conversations (9051, pre-table):** Eilis (before her death) on her taken grandmother Siobhan — "Eighty-one years old and they called her boring... Some nights I dream about the pods — rows of them, humming" — KIN.md honored, specific, no fabricated history; teaches real foraging (Bael, Wild Amaranth) and Heckler lore. Boafo confesses a hidden injury ("I'm ashamed and I can't stop") — the NPC wants something; the mid-conversation sags into generic react/more lines (known class), but the want is real and the show-memory is specific ("They took Robin and James — Hardened The Lottery, on the screens").

## BLANKS DOCUMENTED (Steve's call / next runs)

1. **The lean survives the mantle** (above) — office property by code law; design question whether the *relationship* should transfer. Left as is.
2. **Beat-2 cockpit SAY vs meter mismatch** (above) — cosmetic; the SAY lines assume deepening. A conditional SAY (or meter-aware lines) is a small content fix if Steve wants it.
3. **The dark conscript's army** — accepted twice ("The pods open — not like morning. Like a barracks"), but what the Taken army DOES after the table is never shown in the run's tail (the run ends at the win). The consequence is voiced at acceptance; its downstream is unwritten. Named next if Steve wants the conscript priced beyond the beat.

## Regression

- New driver: `scripts/journey-endgame-r27-20261020.js` (harness only, no src/js changes).
- `node scripts/check.js --quick` (--cacheDirectory=/tmp/jest-cache-playtest2): **253 passed, 4 failed** (1077s). All 4 failures are PRE-EXISTING relative to this run (zero src/js changes here) — documented loudly, not fixed:
  1. `test-measurement-proof-update.js` — "Proof source inputs are not current" (balance-proof-update.js). Stale because the Game changed (r25's contests.js reorder). Refresh via `scripts/balance-proof-update.js`.
  2. `test-measurement-workflow.js` — "retained neutrality proof covers the current Game/controller/harness inputs". Same class: Game changed, retained proof stale.
  3. `test-phone-frame-proof.js` (2 fails) — "every retained browser input matches current source" lists `src/js/contests.js` among changed inputs; "current phone evidence is required". Same class: needs `scripts/phone-frame-proof-update.js` + real browser receipts (heavy; belongs with r25's [needs-eyes] ship).
  4. `test-main67-gossip-resume-beat.js` (2 fails, deterministic in isolation) — "dry beat admits the quiet": with an empty gossip pool the beat now serves a person description ("the woman in her 60s, with ink-stained fingers?...") instead of the honest quiet line; "failed gossip still restores the real narrator" also fails. NOT r25's wake (conversation.js, not contests.js). Suspects in-window: `f35c96129` (journey-landing r28 gossip walk-down — "walks the pool to the freshest unsaid rumor", per-sitting served-sig ledger) and `1fb6b9140` (journey-social r31 silence/recap). This is the social/landing lane's active work area — NOT fixed here; needs their eyes, not a blind revert.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json` (8-seed seat-driver baseline): **5 LOUD lines** (wins, table, tableSceneFired, tableSceneCompleted, seatApproach all "swung −71%": baseline 7 → current 2). **Verdict: EXPLAINED, not drift.** The swing is denominator + seed variance (n=4 vs n=8): both pre-table deaths (9052 d49 fever, 9053 d30 starvation) happened BEFORE the playbook's claim day (55+) with reroutes=0 — the playbook touched neither death. Win rate on seated runs is 2/2; the instrument cannot perturb the announce rate (it acts only after day 55). Baseline NOT rolled forward (different instrument — darkmerge flavor vs seat-driver tip; same call as r21–r26). Evidence: `evidence/2026-10-20/tele-r27-aggregate.json`.

## METRIC REVIEW (§14)

- M1, M2, M3, M4, M5 all GO. No re-scoring.
- Kill taxonomy: no kills this run. The dark band is completable — the r17 "failure funnel" reading is retired, superseded by the careful-dark completion.
- Note: the pilot (9051) completed the full arc on the first seed — the playbook's quarantine-avoidance math (no backfire rolls, grounding floor ~75) held exactly as designed. Expansion confirmed on 9054 (2/2 completions on seated runs).

## Reachable / Fun / Winnable

- **REACHABLE:** relay/dark is reachable by careful play — 22 efficient reroutes (~3 weeks of relay holding) earns the dark band; the cockpit's efficient×4 completes with zero quarantine risk. Both completions rode the office's inherited lean across mantle passes — the succession law working as designed.
- **FUN:** the dark merge is a different game from grey's both-hands — the conscript ("The pods open — not like morning. Like a barracks."), the live leaning readout ("leaning total −44"), the voice final. The three-bearer succession chain on 9051 is the game's own laws compounding into story.
- **WINNABLE:** 2/2 seated runs won relay/dark. The table remains winnable on the dark band.

## Evidence

- `evidence/2026-10-20/journey-endgame-r27.md` (this note)
- `evidence/2026-10-20/journey-endgame-r27-r27-darkmerge-s{9051..9054}.{json,txt}` + `-frames.json` (4 full runs)
- `evidence/2026-10-20/journey-endgame-r27-r27-darkmerge-convos-s9051.txt` (day-80 people check)
- `evidence/2026-10-20/journey-endgame-r27-r27-darkmerge-summary.json`
- `evidence/2026-10-20/tele-r27-aggregate.json`
- `scripts/journey-endgame-r27-20261020.js` (darkmerge driver)

**Game-code changes:** none. Merged locally, pending ship — no bump/push (ship loop owns that).
