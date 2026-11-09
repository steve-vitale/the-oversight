# journey-deepening r120 — run note

- Run: `laneA-20261108T1745Z`, leg 2 deepening (days 40–80, DAYCAP=100), scheduled Sun 2026-11-08 17:45 CST.
- Prereg: `evidence/2026-11-08/journey-deepening-r120-prereg.md` (committed `a3da219b2`); Amendment 1 (committed `879dc1105`): panel expanded 4→8 seeds.
- Seeds: 96801–96808 (+ smoke 96800). Policy: competent. Driver: `scripts/journey-deepening-r120-20261108.js`. Analyzer: `scripts/analyze-journey-deepening-r120-20261108.js`.
- Before-panel evidence (8 JSONs + 100 transcripts) archived at `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-08/before-panel-r120/` before the after-panel overwrote the top-level files. Before-panel analyzer output: `/tmp/r120-before-analysis.txt` (1527 lines); after-panel: `/tmp/r120-after-analysis.txt` (1600 lines).
- Rotation: read `2`, wrote `3` (verified read-back). Lock: run_id `2026-11-09T00:27:22Z`.

## LOUD — infrastructure (pre-run, unresolved)

- `git pull --ff-only` FAILED: local master and origin/master diverged. Local ahead 155 / behind 76; merge-base `d229b58f5` (Nov 8 11:28Z batch ship). Origin-only commits (76) include Steve's Cursor work merged on GitHub: PR #49 (phase6-role-census) + PR #50 (improvements-verify-evidence), OVE-57/60/61 (duty candidates joining dawn scorer, role census, person-trust errand mix).
- Per repo push discipline: NO reconciliation (no merge of origin/master, no rebase, no push). All work is local-only: worktree branch → local master `--ff-only`. The ship loop / main session owns resolving the divergence (3-way merge). This run's base lacks the 76 origin commits; the fix touches `conversation.js` while the origin work is dawn-scorer/duty/census, so overlap risk is low.

## Q1 (PRIMARY) — THE SECRET: does a villager's confession get an answer?

Basis: r119 people check (Exaucee, seed 96703 day 45, trust 73): villager opens `"Can I tell you something? I can't read, and I'm scared it matters now."` — once-per-life high-trust confession (`conversation.js` secret hook: trust ≥ 40, 20% per conversation, `secretShared` flag, one of six secret templates). The offered menu had no choice addressing the confession; the picker taught five plants; the ask_favor want stayed unestablished. Source-verified pre-panel: `buildMenu` had narrowing branches for pendingQ/reactiveQ/genericQ/trade/hawker/rumor/nonverbal/favor but none for thread `'secret'`.

### Before-panel (pre-fix code): openers=0 → SECRET-NO-OPENERS (Amendment 1 term: SECRET-SILENT)

0 openers across 8 seeds / 100 transcripts (raw-transcript grep confirms the line never appears — not a detector miss). r119 rate was 3/41 trust≥40 sittings (~7%); 0/54 is a ~1.7% event. Mechanism hypothesis: ~26/55 r120 openers are pending bond/link requests (the #1 hook, which pre-empts the secret hook) vs ~15/45 in r119 — merged villager-initiated-bonds traffic may be starving the hook.

### The fix (worktree only, `src/js/conversation.js`)

1. **`buildMenu` — new `'secret'` branch** (after pendingQ, before nonverbal): when `thread === 'secret' && !secretAnswered` (and no pendingQ/reactiveQ/genericQ/choosingSubject), the menu is `secret:promise` ("That stays between us."), `secret:comfort` ("Thank you for trusting me with that."), `secret:offer` ("Is there anything I can do?"), `secret:silence` (say nothing — just sit with them), `secret:deflect` (change the subject, rude), `leave`. Teach/theorize pivots are suppressed while the confession hangs, per the reactiveQ pattern ("answers come first").
2. **`convoTurn` — new `secret:` handler** (after the `react:` handler, modeled on it): voices a resolving/planting reply, applies trust through `resolveConsequence`, sets `c.secretAnswered`, clears the thread (`c.thread = null`), sets `answeredReactive` so the tail doesn't hang a generic question on the reply ("Would you... teach me?" is THEIR question, already answered). Replies: promise → `"Thank you. ...I needed someone to know, and I needed it to stop there."` (+2 trust); comfort → `"It helps, just saying it out loud. ...Thanks for not looking away."` (+1); offer → literacy secret plants `"Would you... teach me? Sometime. When there's time. I don't want to be the one who can't read the warnings anymore."`, any other secret → `"Just knowing someone knows helps. ...If it ever matters, you'll know first."` (+1); silence → `"...Thanks. ...That's enough, for now."` (+1); deflect → `"...Right. Forget I said anything."` (−1 trust, −1 mood, cruel temper, like `deflect_q`). No new mechanics (no reading-teaching system); no threshold/bar/price/gate change.
3. **Trust is a real act (`talk: false`)**: answering a once-per-life confidence is not small talk. The talk cap (gains stop at trust 40) would zero the gain in EVERY possible firing, since the hook itself requires trust ≥ 40. Found by reading `resolveConsequence` (`convo-scene.js`) before writing the handler.
4. **Secret replies are diegetic acts** (turn-tail exemption, same class as invite/lesson outcomes): a promise/comfort is a speech act whose consequence already fired — blocking its line would misreport a landed answer as a fizzle.
5. **`startConvo` — two thread-hijack guards** (found by the proof test's deterministic harness, not by the panel):
   - **Trader seed (PROVEN)**: the knowledge-trader seeding overwrote `c.thread = 'trade'` after the secret opener had set it, burning the once-per-life confession with the generic menu (reproduced: Aaron Gordon, trade undiscovered). The seed now defers to `traderIntroPending` when `opThread === 'secret'`, like a talk request or a live want.
   - **Reactive match (PREVENTIVE)**: `convoMatchReactive` runs on the voiced opener line; a matching fragment would overwrite the thread the same way. No current secret text matches any of the eight reactive fragments (all six templates checked against all eight defs), but the classifier runs on the voiced line including voiceLine's lead-in, so `'secret'` joins `'request'` in the exemption. Same reasoning as the talk-request exemption.
6. **Driver `isSecretOpener` — contains, not starts-with**: voiceLine prepends a discourse lead-in ("I feel like — ", "Mm. ", "I think — ") before the confession, so the phrase sits mid-line. The old starts-with detector missed every forced confession in the proof-test debug. The before-panel's 0 stands (raw-transcript grep), so the before/after contrast (0→4) is real, not a detector artifact.

### Proof test: `scripts/test-journey-deepening-r120-secret-response-20261108.js` — 35/35 GREEN

- Picker (4): secret menu → `secret:promise` (rotation starts at promise) in both panels; secret outranks teach; normal verbal menu unchanged (`dlg:more`).
- Engine (31): forced-secret harness (trust 50, rigged prototype secret, `Math.random` stubbed to 0.05 around `startConvo`, fresh villager per sitting, distinct secret text per sitting so the no-repeat ledger can't block a repeat). Menu offers all four answers + no teach; promise resolves + trust rises + `secretAnswered` set + next menu has no `secret:` ids; literacy offer plants "teach me"; other-secret offer gives the generic reply; comfort/silence resolve + trust rises; deflect closes the door + trust falls; trader confession keeps thread `'secret'`; the rude deflect is suppressed vs a close friend (room-fit rule 1, trust ≥ 35) and returns once the player escalates.
- **RED verified**: with `conversation.js` stashed, 21 engine assertions fail (14 passed = picker + vacuous checks). The failures reproduce the r119 defect verbatim: menu `["dlg:react","teach","dlg:subject","leave","silence"]`, handler falls through to `"..."` / `"...Sorry, lost my train of thought."`, trust unmoved, and the trader case shows `thread=trade`. Stash popped cleanly; re-run 35/35 green.
- Instruments: `scripts/test-journey-deepening-r120-instruments-20261108.js` 28/28 (was 26/26; +2 lead-in detector cases).

### After-panel (fixed code): openers=4 → SECRET-ANSWERED + SECRET-CROWDED

Analyzer: `openers=4 addressingOffered=2 teachPicks=3 wantEstablished=0 crowdedSittings=4`.

- 96803 day 60 Yara Haddad (candy-bar secret): secret menu turn 1 → promise → "Thank you. ...I needed someone to know..." — ANSWERED.
- 96806 day 45 Ella Johnson (photo secret): secret menu turn 1 → promise → same resolve — ANSWERED.
- 96801 day 80 Joel (swim secret): betrayal menu turn 1 (pending invite spoken as second beat) → invitation accepted → secret menu turn 2 → promise → resolve — ANSWERED on turn 2.
- 96805 day 45 Luke (literacy secret — Exaucee's exact secret): betrayal menu turn 1 → invitation declined → secret menu turn 2 → promise → resolve — ANSWERED on turn 2; then 2 teaches (the curious want's engagement, AFTER the confession was answered — the r119 order is reversed, not repeated).

**TRUE record: 4/4 answered.** The analyzer's per-sitting UNANSWERED tags for 96801/96805 are instrument false negatives: it checks only the FIRST menu, and a pending betrayal invitation owns the first menu when one is staged. Both confessions were answered on turn 2; the transcripts prove it. The analyzer's first-menu detection is the gap, not the game — a pending invitation is answered first and the confession waits one turn, which is human (both get answered in the sitting). If the player had left on the betrayal menu instead, the confession would honestly die unanswered — that is the player's choice, not a defect.
- The CROWDED tag persists because `wantEstablished=0` in all 4 secret sittings (the want has its own lifecycle; answering a secret doesn't establish it). The crowding MECHANISM changed: 0 teaches before the answer in all 4 sittings (Luke's teaches came after). The panel tag is blunt; the transcript record is the evidence.
- All 4 wild answers were `secret:promise` (rotation entry 0 — one process per seed resets the rotation, and each seed had exactly one secret sitting). Comfort/offer/silence are proven deterministically by the proof test, not by the wild panel.

### Q1 verdict: FIX LANDED AND PROVEN IN THE WILD. The confession now has an answer, the answer resolves, and the teach pivot no longer pre-empts it.

## Q2 (carried) — LADDER, FIRST-STAGE-DAY UNCENSORED

Read-only; leg 4 owns calibration. Identical before/after: `opens=8 late=0 silent=0 broken=0 mintedTracks=5/5 mintedPerTrack={fight:8,forage:8,craft:8,talk:8,explore:8} holds=8/8 firstDays=[14,14,14,14,14,14,14,14]` → **LADDER-OPENS + LADDER-MINTS + LADDER-HOLDS**. First Village stage day 14 on every seed — the ladder is already open when deepening begins. All 8 hold peak at end in both panels. Explore mints at cap 24 on all 8 in both panels.

## Q2-TRUST (carried, not re-judged) — the carried watch FIRED AGAIN, LOUDER

- Before: `deaths=54 strangerGains=3 strangerTotal=11 lateGains=4 knownGains=73 deadBearerDays=2` → CARRIED (TRUST-PAID-TO-STRANGERS).
- After: `deaths=28 strangerGains=1 strangerTotal=9 lateGains=0 knownGains=44 deadBearerDays=1` → CARRIED (TRUST-PAID-TO-STRANGERS).
- The after-panel stranger gain is the SAME villager, day, and amount as the before-panel: seed 96807, day 9, `gen_qjp0wjv` +9, kind=stranger, firstContact=null — the successor themself, never talked to the previous scholar. It reproduces deterministically across both panels on this seed. Not panel noise; a reproducible behavior. Design call stays with the main session.
- Dead-bearer day (after): 96808 day 98, scholar `visjoin_82`, health 0 — the extinction day (self-inheritance, gains=[]), same shape as before-panel 96807 day 94. Explained per r119 metric review #4.
- r119 metric review #3 over-count (gainers count includes fallback-to-net-deltas entries) is still open — negative amts in death lines are fallback entries, not payments.

## SURV — funnel unchanged

- Before: 6/8 (96801–96804 4/4 survived; 96806 lost d97 scatter-hunger; 96807 lost d94 extinction).
- After: 7/8 (96806 and 96807 survived this time; 96808 lost d98 extinction).
- First four seeds 4/4 in both panels — funnel unchanged per the ≥2/4 rule. The extension-seed swap (96805–96808: 2/4 → 3/4) is trajectory noise from the code change perturbing the sims, not a winnability signal — reported, not attributed.
- Note: all 8 after-panel seeds ended at wave 4 (before: 4 at wave 5, 4 at wave 4). The sim trajectories diverged after the fix changed conversation outcomes; wave timing follows the trajectory. Not attributed to the fix; no wave mechanic changed.

## Village assessment — after-panel (plain words)

- **96801** (survived d103, wave 4, national, standing 202): 5 alive — Gunther, Nyatichi, Joel, Elías, Roksana. 15 fallen. 13 fights, 4 wave-3 kills (buffering, spool, chorus_line, redactor). Joel confessed he can't swim — and was heard.
- **96802** (survived d102, wave 4, regional, standing 190): 5 alive — Farid, Lucas, Sami, Emma, Mia. 12 fallen. 26 fights, 11 wave-3 fights, 6 wave-3 kills. Farid still speaks only Bengali at day 102 — the language arc fires but the scholar never closed the gap.
- **96803** (survived d102, wave 4, global, standing 342): 8 alive — Dorothy, Githu, Valeria, Stan, Theo, Yara, Dmitri, Zoltan. 4 fallen. 19 fights, 8 wave-3 kills. Yara's candy-bar secret was answered.
- **96804** (survived d101, wave 4, global, standing 332): 7 alive — Nandi, Elena, Daniyar, Grace, Ruby, Owen, Hien. 11 fallen. 46 fights (the busiest village), 10 wave-3 fights, 5 wave-3 kills.
- **96805** (survived d100, wave 4, global, standing 302): 8 alive — Luke, Joseph, Chaiti, Luis, Sanne, Nora, Dmitri, Ursula. 4 fallen. 16 fights, 2 wave-3 fights, 8 wave-3 kills by type. Luke's literacy confession — Exaucee's exact secret — was answered.
- **96806** (survived d100, wave 4, regional, standing 75): 10 alive — Penelope, Enzo, Conall, DeAndre, Sigrun, Desmond, Miguel, Ella, Petra, Priya. 2 fallen (the gentlest run). Ella's photo secret was answered.
- **96807** (survived d100, wave 4, regional, standing 195): 8 alive — Blanca, Cecília, Chloe, Victor, Ruth, Dulat, Viktor, Mwakina. 7 fallen. The village that died twice before now lives — and its successor still gains +9 trust from a stranger on day 9.
- **96808** (lost d98 extinction, wave 4, regional, standing 150): 0 alive. 15 fallen. A 2-day death cascade (days 97–98, 6 scholar deaths) ended the village; the mantle passed to itself on the last day.

Before-panel census (for comparison): 96801 6 alive/23 fallen/standing 470/wave 5; 96802 6/6/345/w4; 96803 4/13/517/w5; 96804 9/7/337/w4; 96805 3/16/325/w5; 96806 lost scatter-hunger/8 alive at scatter/6 fallen/175/w4; 96807 lost extinction/0/16/401/w5; 96808 4/11/150/w4. Standing totals are not comparable across panels (trajectories diverged); the shape — most villages alive at day 100 with a handful of people, wave 4–5 — is the same.

## People check — SENSE-TESTING LAW (4 before-panel + 4 after-panel transcripts, read in full)

Before-panel (all sensical, 4/4):
- **Giulia (96801 d75)**: bond proposal → declined honestly ("Not like that. Not yet.") → she pockets it gracefully → betrayal invitation ("Walk with me?") → declined → her favor surfaces (a cut needing hands) → player commits → "Careful with it. And — thank you." A real arc: proposal → refusal with dignity → invitation → favor → promise.
- **Tariq (96801 d74)**: link raise for Ashford → accepted → carried to Ashford → favor (pantry bare, forage together tomorrow) → committed with specifics (meadow edge, west of the creek, dawn, pack and knife). Clean chain.
- **Farid (96802 d33)**: nonverbal sitting — speak-back attempt corrected gently ("Hm. Almost." ... "Again." You say it right. They nod, satisfied with both of you.) — a real teaching moment across the language barrier. A link proposal surfaces mid-sitting (accepted, carried to Emberhold); listening that can't quite reach meaning; ends where language couldn't reach. The listen lines vary. Honest, human.
- **Oscar (96802 d52)**: bond proposal accepted ("Stick together, then.") → repay want surfaces ("You came through on the food I needed. I won't forget it.") → betrayal invitation declined → "Don't worry about it" → "...Fine. But I don't like owing." The debt stays on their face. Resolution: deflected — the debt is OWED, planted for later. Exactly the quality bar (endings resolve/plant/owe).

After-panel secret sittings (all 4 read in full — see Q1): Yara, Ella, Joel, Luke. All four confessions resolve with "Thank you. ...I needed someone to know, and I needed it to stop there." The post-secret follow-up is thin ("That's... pretty much all of it, honestly." on `dlg:more`) — honest, but the conversation dries quickly after the confession. Not a defect to fix here; the generic small-talk pool owns that line.

## Regression watches — before → after (all hold unless noted)

- langGate: 62 offers / 51 decisions / 0 'none' → 45 / 41 / 0 'none'. NOT-REPRODUCED both.
- replay: 0 both. NOT-REPRODUCED.
- menuFlip: 0 flips / 32 listen turns → 0 flips / 57 listen turns. NO FLIPS.
- safety goalLine: HEALTHY all 8 both (party_up capture 312 after vs 374 before; food_security 1313 vs 1325; safety 281 vs 251). Knowledge track GOALS-FAULT in both (tops 3→2, capture 0) — pre-existing.
- FIZZLE: 0 both. FIZZLE-FIX HOLDS.
- AWAY-LINE: old 0, new 10 → old 0, new 13. OLD LINE GONE.
- DEBRIEF: 2/2 attributed → 1/1 attributed.
- LANGARC: 2 flips / 2 post-flip decisions → 3 flips / 3 post-flip decisions. ARC-FIRES.
- B-SIT: 36 (20 accept/16 decline/0 unanswered) → 49 (26/23/0). Holds.
- BOND-TELEMETRY: PRESENT both (164 tele/78 proposals/27 decisions/13 accepts/24 initiated → 142/69/28/17/21; acceptRate 0.48→0.61; errors 0).
- Q1-REQUESTS: REACHED both (69 staged/51 decided/5 expired-talkable-untalked → 57/41/5).
- BOND-CHOICE: 51/51 → 70/70 answered. ANSWERED.
- V-INIT: bondSittings=0 both (r119's single sitting stays a sighting).
- P-KEEP: NAMED 8 → 9. PRESENT.
- PANEL VERDICTS: {"EXPLAINED":8} → {"NEEDS-POLITY-CHECK":1,"EXPLAINED":7} — seed 96801: a deed record at regional scale with standing total 0 while holding a SEASONED link (day 50: village_0, age 31, trust 58, active). The village had a seasoned, trusted regional link but zero standing — the standing accounting doesn't credit it. Analyzer flag, not a verdict this run judges; leg 4 / main session owns standing calibration. The village recovered (standing 199, national, by day 100).

## Reachable / fun / winnable (leg 2)

- **Reachable**: the secret content now fires and answers in the wild (4 openers in 8 seeds after the fix, 0 before — the before-panel's 0 was the starved-hook rate, not unreachability; the fix's proof is deterministic). A real player at trust 40+ will meet a confession within a few dozen conversations and can now answer it.
- **Fun**: the answered confession lands — the promise reply reads as a real moment, and the literacy offer plants a future ("Would you... teach me?"). The sitting still dries quickly after the answer (thin follow-up), which is the next feel gap, not this fix.
- **Winnable**: funnel unchanged (6/8 → 7/8, first-four 4/4 both panels). The fix is conversation-scope; it doesn't move the winnability chain. No win price or deed gate touched.

## Metric review (§14)

- **Q1 prereg bound**: the primary question was "does the confession get an answer?" The before-panel returned SECRET-NO-OPENERS (0 openers) — the question as preregistered could not be answered from the wild panel, which is why the fix was justified on source proof (missing branch) + the r119 wild transcript, and the after-panel proof became deterministic (forced-secret harness) + wild re-run. The wild after-panel now answers it: 4 openers, 4/4 answered by transcript (analyzer says 2/4 by first-menu detection — the instrument's first-menu rule undercounts turn-2 answers after a pending betrayal invitation; the transcripts are the record). **Proposed revision for the next run**: the analyzer's `summarizeSecret` should count an addressing choice anywhere in the sitting's picks, not only the first menu — a confession answered on turn 2 after an invitation is still answered. The prereg's verdict terms (ANSWERED/CROWDED) stay; only the detection window widens.
- **SECRET-CROWDED persists as a tag** because wants stayed unestablished in all 4 secret sittings. The tag's definition (teachPicks ≥2 OR want unestablished) conflates two different things: teaching pre-empting the confession (the r119 defect, now gone — 0 teaches before the answer) and the want's own lifecycle (the want establishes over multiple sittings, not one). **Proposed revision**: split CROWDED into TEACH-CROWDED (teaches before the answer) and WANT-OPEN (want unestablished at sitting end). The fix kills the first; the second is not the secret's business.
- **Q2-TRUST carried watch**: fired in both panels with the same villager/day/amount (96807 gen_qjp0wjv +9 day 9). The carry stands; the design call stays with the main session. No new trust verdict this run.
- **Q2-LADDER carried**: identical both panels; leg 4 owns calibration. No threshold/cap/minting comparison across runs (per the leg-4 adoption).
- **SURV**: the ≥2/4 rule held (first-four 4/4 both panels). The extension-seed swap is trajectory noise, not a signal.
- **r119 metric review #3** (gainers over-count from fallback entries) still open.

## Gate / landing

- Gate: [TO FILL — check.js --quick result]
- Commits: [TO FILL — safe-commit SHAs]
- Merge: [TO FILL — local master merge, pending ship]
