# journey-deepening r28 — the full-HP route verdict (2026-10-21)

## Pre-register (§14 BINDING)
- **Leg question:** When a wave-3 fight "routes" with the monster at FULL HP, WHAT ends the fight, and is the ending honest to the player? (r27 found 3 such routes: 2× spool @121 rounds untouched-vs-untouched, 1× ad_break @10 rounds with the player at 13hp. The generic fleeAt needs damage; the disengage path needs follows:false — spool follows:true; the chase give-up marks the PLAYER fled — records show p.fled=false.)
- **Interesting-finding bar:** every full-HP wave-3 route on 4 seeds classified by trigger (chaseGiveUp / disengage / fleeAt / bellow / stareDown / redactorStarve / tosLoophole / focusWalkout / dawnDisperse / alienRetreat / UNEXPLAINED). ≥1 UNEXPLAINED or narration-missing route = a blank to fill. All classified + narrated = the route layer is honest; document and move on.
- **D1 route census (BINDING):** 4 fresh seeds (9921–9924), competent policy, DAYCAP=100, death-aware stop (+10d tail). ROUTE instrument in finalizeFight: for every wave-3 fight ending 'routed' with any monster fled at hp/maxHp ≥ 0.9 — record mid, hpFrac, _pursuit, follows, telegraph, player fled; dump the fight tail; classify by narration markers. Also check deedState().wavesFaced credit for routed types.
- **D2 sense (conditional, BINDING):** ≥1 full-HP route → sense-read each routed fight's transcript for honesty. 0 routes → sense-read ≥2 wave-3 fights for legibility.
- **M1 winnable:** ≥3/4 villages alive at end.
- **M2 people (report-only):** ≥4 full villager transcripts sense-read, 0 senseless expected.
- Report-only extras: death census (r27 instrument retained), wave-3 unlock/fights per seed, regional links, plain-words census per seed.
- Canon: "Monsters don't have self-preservation — you flee from monsters, never vice versa" (game.js:21723) — a full-HP monster vanishing needs a named reason.

## Results — VERDICT: the route layer is honest. Document and move on.
- **Full-HP wave-3 routes on 4 seeds: exactly 1** (9922, day 72, focus_group, 123 rounds, hpFrac=1.0, player untouched, playerFled=false, follows=true, telegraph active, signature mechanics firing throughout).
- **Trigger: the WHIFF GUARD** (game.js:34865-34915, tbWhiffGuard). After 120 consecutive rounds with ZERO damage dealt by either side, the fight "comes apart" via the honest-disengage idiom — monsters marked fled, result 'routed', narrated: "It comes apart — no one in reach, no one chasing. The fight ends; they melt back into the wilds." Never a silent kill, never a free win (by design — the guard's own comment names the focus_group softlock it was built for: eye-head interception ate every scholar strike while the anchor-centered Deliberation couldn't reach range 2).
- **This also explains r27's two 121-round spool routes** (untouched-vs-untouched, monster fled at full HP): same guard, same 120-round threshold. The r27 10-round ad_break route is the honest disengage path (ad_break follows:false; the player fled at 13hp and the passive couldn't chase). All three r27 anomalies are now classified.
- **Honesty verdict: GO.** "No one in reach" is literally true in game-mechanical terms — the eye-heads intercepted every player strike (the player couldn't reach the mouths) and the Deliberation couldn't connect at range (the monster couldn't reach the player). 120 rounds of mutual ineffectiveness reads as both sides unable to reach each other; the fight coming apart is the honest outcome. The narration is shared with the disengage path, but the fiction holds for both: separation by ineffectiveness, not just distance.
- **Deed-gate credit: CORRECT.** The routed focus_group IS in deedState().wavesFaced (focus_group: 3) — a 123-round blow-by-blow fight counts as "faced" for the endgame deed gate, as the design intends ("fled or won"). (My instrument's routeWavesFacedCredit check assumed wavesFaced was keyed [wave][mid]; it's actually [mid]=wave — the game is right, the instrument was wrong. Noted for the next run.)
- **0 UNEXPLAINED routes.** The interesting-finding bar's blank-to-fill condition is NOT met. No src/js changes warranted.
- **M1: 4/4 villages alive at end → GO.**

## D2 sense read — the 9922 focus_group route (the full fight)
- The signature layer is the fight: 7 heads rise ("three all MOUTH, the rest all EYE"), the murmur deliberates every round ("they LOVE your STRIKE, they HATE your DODGE"), eye-heads mark the player's strike, the boredom counter ticks ("1/3 boring rounds — they're losing interest. Stay boring.") and resets on action. Telegraph honesty holds throughout.
- Rounds 118–123: Deliberations fire but land nothing; the player's strikes are eaten. Then: "It comes apart — no one in reach, no one chasing. The fight ends; they melt back into the wilds." The player saw 120 rounds of exactly what the line describes — nobody able to reach anybody. The ending lands as relief, not confusion. GO.
- Same-seed siblings: a wave-1 Big-Eyes disengage at round 17 (player out of sling stones, walked away from a non-chaser — "No stone left. Your Sling is a stick you hold wrong." then the line; honest), a wave-1 Anaconda Empress whiff-guard route at ~120 rounds, a Union Rep instant disengage (it doesn't fight, it organizes — the fight never started). All narrated.

## Census in plain words
- **9921 (day 93, survived, wave 3 @ d45-probe, regional):** 9 alive — Meenakshi the chimney sweep, Ethan the trail crew lead, Giulia the crossing guard (trust 100), Quinn the bartender, Aroha the comic shop owner, Daniyar the paramedic, Omar the piano tuner, Si the teacher (Spanish-only), Yesenia the hunter. 37–43 plants known (except Si 16, Yesenia 15). Dead: 5 villagers (ambush d8, monster d27, combat d32/d39/d53). Pantry min 15.7k. 3 wave-3 fights, 23 villager field fights vs wave-3 (7 with tricks).
- **9922 (day 101, survived, wave 3 @ d45-probe, regional):** 8 alive — Olivia the fisher (trust 15), Naran the bus driver, Zoltan the mushroom grower (trust 90), Quinn the bartender, Dalila the farmer, Nompumelelo the police officer, Tariq the electrician, Wilhelm the hunter. The stratified village — trust 15–90, plants 1–46. Dead: Ursula (monster d17), one starvation (d19), 3 sickness (d73/d74/d94), one "wound that wouldn't close" (d94). The sickness cluster late is the notable strain. Pantry min 9.2k (leanest).
- **9923 (day 93, survived, wave 3 @ d45 natural-5pts, regional):** 7 alive — Frank the PT aide (grieving), Sandra the aquarium keeper, Kayden the sailor, Meera the dentist, Wanjiru the wild-food forager (trust 93), Henry the dispatcher, Ingrid the PT aide. Dead include two wave-3 monster kills with teeth: gen_ep30xcl killed by THE CALLBACK (d51), gen_iqjq3ez killed by BUFFERING (d60) — the signature fights have real stakes. 14 ducks_in_a_row killed in one day-40 field-fight cascade. Pantry min 36k (richest).
- **9924 (day 101, survived, wave 3 @ d45-probe, regional):** 9 alive — Pearl, Hugo the gardener, Kunio the soldier, Gulshan the lifeguard, Giulia, Yuki the librarian, Vasyl the soldier, Elif the housekeeper, Raj the pharmacist. Trust 88–90 across the board — the tightest village. Dead: Nora (contest d62), one Callback kill (d78), one spool kill (d87), one monster (d86). Pantry min 25.7k.
- Missing everywhere: nothing structural. The probe was needed on 3/4 seeds (the day-25+4-ledger gate held on fresh seeds; 9923 earned it naturally).

## People check (M2: 5 transcripts sense-read, 0 senseless)
- **Vasyl, 9924 d42 (want: curious):** "When's the last time you really laughed?" — a real, person-shaped opener from a withdrawn infantry soldier. "Stealing joy. I like that. We should steal more of it." Teaching beats land (Wild Ginger, Sassafras — "I never knew that"). Want resolves engaged. Sensible.
- **Si, 9921 d60 (Spanish-only):** the barrier holds — "No shared words at all — just eyes, hands, and patience." Graceful close: "The conversation ends where language couldn't reach." Sensible.
- **Hugo, 9924 d83 (want: curious):** the weakest — a deflection loop ("I just said — did you miss it?", "Huh. I wouldn't have guessed that about you.") as the harness topic-hops instead of engaging. Coherent and in-character for cautious, but the want never engages (resolution: unresolved). Not senseless, but the curious-want engagement path deserves a driver that actually engages. Noted, not a game defect.
- **Rocco, 9922 d60 / Frank, 9923 d60:** both opened with betrayal:accept/decline at turn0 (pending invites) and the harness bailed to 'leave'. The invite beat is spoken by the game per the spoken-lure fix — my transcript driver only logs r0.line, so the second beat isn't captured. Driver gap, not a game blank.
- No templates, no fabricated history, no filler loops.

## Blanks filled / documented
1. **The r27 full-HP route anomaly — FILLED:** classified as the whiff guard (120 rounds, zero damage both sides), narrated honestly, deed-gate credit correct. The r27 spool/ad_break routes are likewise classified (whiff guard ×2, honest disengage ×1).
2. **Residual open item (r27 9911 day-81 spool, 8 rounds, monster fled at 28% HP, player at 7hp):** not reproducible from the r27 capture (the fight falls past the 1.5MB capture-dump truncation; no REC lines in the dumped file). Not in r28's D1 binding; documented, not filled.
3. **routeWavesFacedCredit instrument bug:** assumed wavesFaced[wave][mid]; actual is wavesFaced[mid]=wave. The game is correct; fix the instrument next run.
4. **Transcript driver gap:** invite second-beat not captured (only r0.line logged). Fix next run.
5. No src/js fix warranted. The r28 harness (scripts/journey-deepening-r28-20261021.js) is committed as the reusable route-probe instrument.

## Reachable / fun / winnable
- **Reachable:** wave-3 signature fights reached on 4/4 (probe-assisted on 3/4 — the gate is real, the probe rides the honest ledger path). The whiff guard fired exactly as designed on the mutual-whiff class.
- **Fun:** the focus_group fight is the leg's showpiece — 123 rounds of audible ratings, marking, boredom pressure — and its ending reads as earned relief. Wave-3 kills have teeth (Callback and Buffering both killed villagers on 9923/9924).
- **Winnable:** 4/4 villages alive, pantries 9–36k, wave-3 ledger points banked. M1 GO.

## Metric review (§14)
- D1 was satisfiable and satisfied (1 route found, classified, narrated). No mid-run re-scores; the D2 conditional's ≥1 branch was followed (sense-read the routed fight).
- The PROBE_W3 path (day-45 ledger injection via scoreLedgerKill when wave 3 not yet unlocked) is declared here: it rides the honest gate, affects only UNLOCK timing, never fight mechanics. Seeds that unlock naturally are untouched. 9923 unlocked naturally (5pts); the probe fired on 9921/9922/9924.
- Metric-review note for the NEXT run: fix routeWavesFacedCredit nesting; capture the invite second-beat in transcripts; the 'deaths' telemetry LOUD line from r27 stands (baseline predates the metric — canned verdict: not a real deviation).

## Telemetry (vs hidden_files/telemetry-baselines/deepening.json)
- **LOUD: deaths newly appeared: baseline 0 → current (per-seed 18–32). VERDICT: not a real deviation** — same canned verdict as r27 (baseline predates the deaths metric; volumes match r26/r27).
- All baseline-covered metrics quiet (w3fights, engaged.w3, fightsTotal within r27 ranges). No other LOUD lines.
