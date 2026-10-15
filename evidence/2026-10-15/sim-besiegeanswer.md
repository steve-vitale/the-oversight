# ARM "besiegeanswer" — answer the besieger (scale-onramp, sim-findings #270)

Worktree: `~/workspace/worktrees/sim-besiegeanswer`. Run: oversight-flesh-out-loop, run 2026-10-15 (claim fleshout-a-20261015T0515Z, ARM 1 of 3). Axis scale-onramp, lever-2 lens. Claims sim-findings #270 (SUCCESSION-FEED PURSUIT) — the succevac arm proved moving the successor does NOT break the feed (the besieger pursues; transcript-proven "It followed you"). The named next: answer the besieger directly.

## The blank

#270: the succession feed is a Haven-siege phenomenon — a monster kills the scholar AT Haven, the mantle passes, the engine moves the new scholar to Haven, the same besieger kills the successor. succevac tried relocating the successor (KILLED: the besieger pursues; mid-combat travelTo refusal). The remaining honest lever: the village answers the besieger — a deliberate drive-off fight on the village's terms (party, learned counters, no early flee) instead of the successor being ambushed alone. Wave ≥4 besiegers are NEVER engaged (r35 raiddef's w5-engagement-spiral lesson — the layer must not feed the roster).

## Canon read

- docs/CANON.md (manifest + standing rules). docs/MONSTER-WAVES.md (wave law; counters waves 1–2; "monster encounters are fought, not rolled"; the wave-4/5 standing gates).
- Design uses only existing engine verbs (inviteToParty, triggerEncounter, tbPlayerShout/tbPlayerOfferFood/tbPlayerWait, monsterCounterKnown) and the existing policy path (fourthlink/leadcourt/competent). The drive-off fiction ("the village marches to drive off the beast still at the treeline") is new narration — a design call Steve can overrule.
- No canon doc covers besieger drive-offs; the readiness gate below is a design call, pre-registered, Steve can overrule.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

- **Question**: when a scholar combat death happens AT Haven, does a deliberate drive-off fight — successor + present villagers answering the tile-identified besieger on the village's terms — break the succession feed chain for wave ≤3 besiegers?
- **Primary metric** (binding): gap≥1 succession feeds per mantle succession (the touchable set — succevac's definition), armed ≤ control × 0.70.
- **Degeneracy rule** (pre-registered): control gap≥1 feeds == 0 → INSUFFICIENT-EVIDENCE (no GO on a degenerate metric).
- **Secondary** (reported, non-binding): total feeds/succession; same-day vs next-day split; Haven-tile vs wild-tile split of feed deaths; wave-floor subset — feeds by besieger wave (w1–3 vs w4+, sweep-side pairing attribution); drive-off outcomes (answered / held-hp / held-party / w4+-declined / unattributed / held-away / held-table); answer-fight results (besieger driven off or killed vs scholar died vs fled-at-floor).
- **Guardrails**: median survival ≥ control−10d; national ≥ control−2/8; no new death mode (player:cause key in armed absent from control counts only at n≥3, #216); villager (non-scholar) combat deaths ≤ control+2 (#246 roster-level wall — the layer must not feed the roster).
- **Horizon**: 180d death-aware (harness +10d tail). Why: the siege is a late-game pathology (succevac feeds at d48–d135); the run must live into the threat band. Dead villages stop via the harness tail — never a fixed grind.
- **Seeds**: 11/22/33/44/55/66/77/88 (pilot 8; confirm 12–16 only on GO).
- **Policies**: control = fourthlink (leadcourt + FOURTHLINK=1 — the diagnostic's road); armed = fourthlink + besiegeanswer (BESIEGEANSWER=1). Identical seeds. Deterministic (A/A gate per side). Own control in the same sweep (baseline drift #247 — never inherit).
- **Readiness gate** (pre-registered design): answer a wave ≤3 besieger only when ALL hold —
  1. the besieger is identified (monster id + wave from the death-day combat_start/combat_end pairing; unattributed → fail safe, no answer);
  2. the successor's HP ≥ 60% (raiddef's w3–4 bar);
  3. the besieger's counter is LEARNED (state.monsterCounters[mid] — the trick answers it) OR ≥1 villager successfully invited to the party (numbers answer it);
  4. the scholar is at Haven, not mid-combat, no pending encounter, table not active, one answer per death.
  Wave ≥4 → NO engagement, counted silently (the base policy already narrates the death).
- Metric binding (§14): a miss is NO-GO, never re-scored mid-run. Metric doubts go under "metric review" below and apply to the NEXT run.

## The layer (scripts/policies/besiegeanswer.js, BESIEGEANSWER=1, default OFF)

Gate off → the factory returns the base policy unchanged (proof R1/G8; sim det-gate byte-identical). Gate on → wraps fourthlink:
(a) each daily/upkeep scans telemetry for new scholar deaths (player:true); a combat-category death whose death tile (ev.tile, stamped by the sweep's read-only tele wrap — at tele time the scholar is still the dying one, on the death tile) equals the haven tile opens an answer evaluation. Deaths without tile attribution fail safe: no answer.
(b) the besieger is identified by pairing the death-day's combat_start/combat_end tele records (pairFights-lite, inline): the pair whose end is nearest the death (≤1 day) names the monster (vs) and its wave. No pair → unattributed → no answer.
(c) wave ≥4 → counted (ctx.baDeclinedW4) and NOT engaged. Wave ≤3 → the readiness gate above. Gate fails → counted by reason (baHeldHp / baHeldParty / baHeldAway / baHeldTable / baHeldBusy).
(d) gate passes → build the party: inviteToParty every healthy villager at home (health>40, not away, not the scholar) until the party is full; say the drive-off line once (names the dead, the successor, the besieger); Game.triggerEncounter(mid) — the honest choke point, so the next fight is the besieger on the village's terms; arm ctx._baAnswer = {mid, wave, day}.
(e) fight() during the answer: if the besieger is among the live monster fighters and scholar HP ≥25% → COMMIT: first the instant counter verbs when the counter is known (shout/offer_food/wait, mirroring fieldFights parity caps); else return false so the harness default strikes — committed, no flee path. Below 25% HP → delegate to the base (the honest not-suicide floor; the base may flee). Besieger gone from the fight → disarm, delegate. Answer expires after 2 days.
No new verbs; every call is an existing engine path. Design calls (Steve can overrule): HP≥60% answer bar; 25% commit floor; 2-day answer expiry; counter-or-party readiness; w4+ silent decline.

## Proof: scripts/test-besiegeanswer-20261015.js — 15/15 GREEN pre-kill (REAL RED verified)

- R1 (RED): gate OFF -> withBesiegeAnswer returns the base itself; no tracking state.
- R2 (REAL RED): gate OFF + Haven combat death -> NO answer (the blank, unblocked).
- G1: Haven combat death, w2 besieger, HP≥60%, villager joins -> drive-off (line once naming dead+living+besieger, triggerEncounter(mid), party invite, answer armed).
- G2: wave-4 besieger -> NO engagement (declined silently, counted, no triggerEncounter/invites/line).
- G3/G4/G9/G10: HP<60% / no-party-no-trick / table-active / mid-combat -> held, counted by reason.
- G5: counter known + no villagers -> answer (the trick answers it).
- G6/G7/G8/G13: wild death / unattributed tile / unattributed besieger / non-combat -> fail safe, no answer.
- G11: fight() commits — counter verb first when known (base NOT called), else return false (harness default strikes, no flee path); <25% HP delegates to base; besieger gone -> disarm (only once pendingEncounter cleared — post-pilot refinement), delegate.
- G12 (det-gate): gate-off 3-day scripted run, identical verbs + ctx keys.
- REAL RED: layer's answer path broken (wave gate forced to decline) -> 6 failures; restored -> 15/15.
- SMOKE=1 subset 3/3. Sim gates: SMOKE 123/123 hashes identical (instrument trajectory-neutral); DETGATE wrapper-vs-raw identical; AA=1 deterministic both sides (control + armed).
- Post-kill: layer deleted per protocol; proof/sense INFO-SKIP (exit 0); sweep armed/DETGATE refuse LOUD (exit 2); sweep control reproduces s44 exactly (123d, 9 succ, 1 gap1+ feed).

## Results — PRIMARY MISSED → KILL

Control (`evidence/2026-10-15/sim-besiegeanswer-control.json`, own control, same sweep — reproduces the succevac control almost exactly: 10/52 = 0.1923/succ total, gap1+ 3/52 = 0.0577/succ, median 108.5d, national 5/8):
- PRIMARY denominator: **3 gap1+ feeds / 52 mantle successions = 0.0577/succ** → **GO bar: armed ≤ 0.0404**.
- Wave floor (control): w1–3: 5, w4+: 5, unattributed: 0. Zero drive-off lines (contamination check clean), 0 instrument errors.

Armed (`evidence/2026-10-15/sim-besiegeanswer-armed.json`):
- PRIMARY: **2/47 = 0.0426 > 0.0404 → MISS** (NO-GO per §14 — not re-scored).
- Total: 19/47 = 0.4043/succ vs control 10/52 = 0.1923/succ (gap0 = 17 vs 7).
- Guardrails (all pass, for the record): median **106d** vs bar ≥ 98.5d → PASS; national **4/8** vs bar ≥ 3/8 → PASS; new death-mode check: only armed-only key is villager:The Heckler n=1 → noise per n≥3 → PASS; villager combat deaths **135** vs bar ≤ 161 → PASS (down from 159).
- Per-seed days (ctrl → armed): s11 33→28, s22 159→143, s33 53→134, s44 123→101, s55 115→111, s66 93→101, s77 103→113, s88 114→79.
- Layer activity: **27 answers**, 11 w4+ declines, 1 held-HP, 4 held-party, 0 unattributed, 161 committed turns, 0 counter-verb tricks fired (answered besiegers' counters were movement/strike-pattern kinds — the committed strike was the answer).
- Wave floor (armed): w1–3: 15, w4+: 4, unattributed: 0 — the layer's own tier (w1–3) feeds ROSE 5→15.

GO verdict (§14 binds the package): PRIMARY 0.0426 > 0.0404 MISSED. **KILL.** No confirm.

Kill protocol: `scripts/policies/besiegeanswer.js` DELETED. Proof/sweep/sense/evidence retained as documentation (the layer is rebuildable from this spec; instruments degrade gracefully).

## Why it missed — the mechanism probe (the real finding)

The layer does not break the chain — **it feeds it**. The drive-off commits the successor (weaker than the scholar who just died) + 1–2 villagers against a besieger that just proved it can kill a scholar. The readiness gate (HP≥60% + party-or-trick) is not sufficient — the same lesson as r35 raiddef's w5 spiral, one wave-tier down.

Seed 11 is the transcript-proven doom loop: Highbeam Deer (w1, gallowdeer — the 160-HP benchmark) kills Lamar at Haven d10. The layer answers (counter known: move_windup; 1 villager joins). Carlos (55, Fisherman) + Zoe deliberately fight it — "Highbeam Deer's Ocular Discharge hits you for 95. You go down." New scholar Pamela answers again. **8 scholars die in 2 days (d10–d11) to the same deer, same tile [4,4]** — 9 answers, 8 feeds, every one same-monster/same-tile. The village makes a brave, legible decision and it gets them killed, repeatedly.

Seed 55 (Terms of Service w3): 3 deaths d68–d69, same pattern. Seed 22 (Ad Break w3): 2 deaths d77.

The theory's failure: "answer the besieger" assumes the village can win the deliberate fight. It cannot — not because the fight is unfair, but because the besieger just selected for being able to kill the village's strongest fighter, and the answer sends the weakest (the new successor) back in. Force is not the answer to the succession feed. (The w4+ silent decline was the only correct half of the design.)

Post-pilot refinement (dies with the layer): the fight hook's disarm now waits for pendingEncounter to clear, so an unrelated intervening fight can't disarm a still-pending answer. Proof still 15/15 after the change; the running sweep measured the pre-fix code (the intervening-fight case is rare — pendingEncounter resolves the same day-drive as the answer).

## Village assessment

Eight villages on the courtship road. The control villages live a median 108.5 days, reach national on 5/8, and meet the siege in the usual band. The armed villages live a median 106d — the guardrail passes, but the distribution tells the story: s11 collapses in 28 days under the answer loop (10 successions, 8 feeds), s88 falls to 79d. Who died: successors, disproportionately, in deliberate drive-off fights — 9 answers on s11 bought 8 same-deer deaths. Who thrived: s33 (53→134d) — the one seed where the answers didn't cascade, reaching global. The layer is a doom loop wearing a hero's cloak: the drive-off line reads as courage ("Carlos won't let it stand"), and courage is what kills them.

## SENSE-TESTING (scripts/sense-besiegeanswer-20261015.js, seed 11, armed)

The drive-off line reads as a village decision: "🛡️ After Lamar's death at the fire, Carlos won't let it stand — Highbeam Deer is still out there. — 1 villager march with them. They know its trick. They go to drive it off." It names the dead, the living, and the beast — not a system alert. (Prose nit, dying with the layer: "1 villager march" should be "marches".) What follows reads as tragedy, not robotics: "Highbeam Deer's Ocular Discharge hits you for 95. You go down." — then the mantle beats, the grief beats, and the next successor answers again. The surrounding transcript reads as people (mantle transfers, grave-digging, party invites with real refusal lines: "I don't know you well enough for that"). No robotic surface from the layer — one line per answer, no spam. The sense test passes; the design doesn't.

## Blanks filled / documented

- **Measured** (not chased): the succession-feed base rate on this base, reproduced — control 10/52 = 0.1923/succ total, 3/52 = 0.0577/succ touchable; wave-floor split 5 w1–3 / 5 w4+.
- **Falsified** (this arm): the answer-the-besieger-by-force theory. A deliberate drive-off against a w1–3 besieger with HP≥60% + party-or-trick readiness does not break the chain — it feeds it (armed total feeds 19 vs 10 control; w1–3 feeds 15 vs 5; seed-11 doom loop transcript-proven). The besieger just killed the village's strongest fighter; the successor is weaker. Filed to sim-findings.md as the corrected mechanism.
- **Documented** (sim-findings.md): the succession feed is not answerable by force at any wave tier (succevac: relocation fails via pursuit; besiegeanswer: force fails via the doom loop). The remaining space is avoidance/absence — not fighting the besieger at all.
- **Instrument lesson**: the sense script initially measured zero answers because it lacked the sweep's tile-stamp wrap — the layer's G7 fail-safe (no tile → no answer) working as designed. The fail-safe is load-bearing: without the instrument, the layer is inert, not wrong.

## Metric review (§14)

Primary missed cleanly (0.0426 vs ≤0.0404) — no re-score, no metric doubt. The GO bar (30% reduction on the touchable set) was the right bar: the layer moved gap1+ 3→2 but doubled total feeds 10→19, and the mechanism probe shows the extra deaths are the layer's own drive-offs. If a future arm attempts the feed again, it should pre-register against the same primary — the instrument (sweep + pairing + wave-floor + tile-stamp) is kept and proven.

One metric note for the NEXT run: the primary's touchable-set definition (gap≥1) is correct per the succevac same-day-interception proof (0/7 gap-0 feeds had an intervening daily), but this arm shows a lever can WORSEN the untouchable set while barely moving the touchable one. A future feed arm should carry total-feeds/succession as a co-primary guardrail — proposed for the next run, not applied here.

## Telemetry deviation check (scripts/telemetry-check.js) — PENDING (coordinator step)

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | medianSurv | exiled |
|---|---|---|---|---|---|---|---|
| control (8) | 5/8 | 0/8 | 0/8 | 5/8 | 0/8 | 108.5d | 0/8 |
| armed (8) | 4/8 | 0/8 | 0/8 | 4/8 | 0/8 | 106d | 0/8 |

No run reached the table or a win. The scale wall stands. (Wave-4 reach: control 5/8, armed 4/8.)

## Base note

Worktree registered from local master. All runs on the registered base per the landing protocol. Commit: PENDING.
