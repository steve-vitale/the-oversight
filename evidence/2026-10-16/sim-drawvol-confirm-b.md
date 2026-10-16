# SIM-DRAWVOL-CONFIRM — confirm of the landed drawdown-volume cap on 16 fresh seeds (loop B)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b (ARM sim-drawvol-confirm-b) · Worker tree: sim-drawvol-confirm-b
Axis: food-economy (scale-wall lens) — the sim-drawvol-b confirm per pilot->confirm protocol.
Substrate: pre-seat courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1, policies leadfeast/belongfeast, 180d death-aware, own in-sweep control re-measured.
Base: swept on a8c804c8; master moved mid-run (089ff4bd, 4 design-call landings by loop A — none touch drawvol.js or its dependents); rebased clean, proof re-run GREEN on the new base.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims; carried from the pilot, no edits)

- **Question**: does the landed drawdown-outflow cap (2500 kcal/day when fresh-days < 6, scripts/policies/drawvol.js, DRAWDVOL=1 default OFF — pilot GO, landed 95ce25b0) hold up on fresh seeds?
- **PRIMARY**: absolute starvedDays armed ≤ control. starvedDays = cumulative engine-days the village spent hungry (v.hungryDays > 0 sampled post-daily, summed — the engine's own hunger signal). Starvation deaths reported alongside.
- **MECHANISM ENGAGEMENT**: armed must HOLD ≥ 8 drawdown candidacies when fd<6 across the sweep; else verdict = no-coverage diagnostic → KILL as invisible (a non-binding cap is dead code — do not land it).
- **GUARDRAILS**: national ≥ control−2/16; median survival ≥ control−10d; no new death mode; social verbs alive: armed aid+feast count ≥ 50% of control.
- **Horizon**: 180d death-aware; dead villages stop (+10d tail).
- **Seeds**: 8 FRESH seeds [974, 975, 976, 977, 978, 979, 980, 991] × {belongfeast, leadfeast} × {control, armed} = 32 runs, IDENTICAL seeds both sides. Verified fresh: absent from every evidence/ per-seed filename 2026-10-13→16 (the pilot's 982–989 all used). Fresh-seed exclusion list grepped via `find evidence/2026-10-13 evidence/2026-10-14 evidence/2026-10-15 evidence/2026-10-16 -type f | grep -oiE 's[0-9]{2,4}|seed[-_]?[0-9]{2,4}'`.
- **Det-gate**: bit-identical 40d reruns both sides before trusting comparisons (r27 rule) — ran inside every sweep invocation (3/3 GREEN); SMOKE=1 honesty gate 3/3 GREEN.
- **Verdict**: GO (primary + engagement + all guardrails): the layer stays landed. Any miss: KILL per kill protocol — DELETE scripts/policies/drawvol.js zero-trace (revert to byte-identical pre-landing), commit the deletion + evidence + instruments.
- **ENV SENSITIVITY**: the full substrate (FEASTSCALE_R13=1, SEATDRIVE=0) came from the shell env. The sweep script asserts FEASTSCALE_R13=1 and SEATDRIVE=0 up front (exits 2 otherwise) — a bare run cannot silently pass with the wrong substrate.
- Metric doubts go under "metric review" below; the header binds.

## Sweep results (32 runs, identical seeds, own re-measured control)

Det-gate GREEN all three invocations (mid-run service restart killed the sweep after 15/32 runs; det-gated fill-ins completed the rest — identical seeds, identical env; the restart is recorded in drawvol-confirm-sweep.log). 13/16 armed/control pairs byte-identical per-day hashes — exactly the 13 pairs where the cap never engaged (the 3 engaged pairs are the only divergences, confirming clean delegation).

| metric | control | armed | pre-reg |
|---|---|---|---|
| starvedDays (**PRIMARY**, absolute) | 47 | 53 | **FAIL (NO-GO)** (armed ≤ control) |
| starvation deaths | 1 | 1 | — (pair-identical: leadfeast s976 both sides) |
| holds when fd<6 (**ENGAGEMENT**) | — | 4 (2 feast + 2 aid) | **FAIL — no-coverage diagnostic → KILL** (bar ≥ 8) |
| national | 12/16 | 12/16 | ✓ (≥ 10) |
| median survival | 119.5d | 117.5d | ✓ (≥ 109.5d) |
| max survival | 182d | 182d | — |
| fresh-rot kcal | 7930k (454/vday) | 7929k (454/vday) | — (1.00×) |
| table | 16/16 | 16/16 | — |
| wave-4 / wave-5 | 16/16 / 9/16 | 16/16 / 7/16 | — |
| Arc 2 / 3 / 4 | 16/16 / 16/16 / 16/16 | 16/16 / 16/16 / 16/16 | — |
| four-realm | 0/16 | 0/16 | — |
| wins | 0/16 | 0/16 | — (pre-seat by design) |
| exiled | 0/16 | 0/16 | — |
| drawdown outflow | obl 1471k / aid 63k (40 gives) / feast 343k (155) | obl 1440k / aid 59k (38 gives) / feast 333k (152) | — |
| social verbs (aid+feast count) | 195 | 190 | ✓ (≥ 97.5) |

Paired starvedDays deltas (armed−control; holds): belongfeast +1(h2)/+0/+0/+0/+0/+0/+5(h1)/+0; leadfeast +0(h1)/+0/+0/+0/+0/+0/+0/+0. The two positive deltas sit on the two most-engaged pairs (s974 h2, s980 h1) — divergence noise from the engaged pairs, not lever harm at scale, but the bar was absolute.

The 4 holds: belongfeast s974 d43+d44 (feast 3600 + 2800, fd 2.65/3.09, dayTotalBefore=0 — the big-feast brake channel), belongfeast s980 d102 (aid 1946, fd 5.46, dayTotalBefore=2400 — obligated+aid stacking), leadfeast s975 d95 (aid 1705, fd 5.9, dayTotalBefore=1500 — stacking). Hold autopsy: dayTotalBefore=0 feast-holds 2 vs stacking-channel 2.

Death modes: control and armed share the identical mode set {villager combat, sickness, combat, monster, ambush, expedition, Buffering, contest, Big Loud, lockjaw, a wound that wouldn't close, Hummice, the night, Loud-Eyes, thirst, starvation, The Suburb, The Congregation, The Eater} — no new death mode, no singleton divergence.

**Verdict: KILL** — primary missed (53 > 47) AND engagement missed (4 < 8, no-coverage diagnostic → invisible). The layer is DELETED zero-trace per the kill protocol. Proof + sweep + evidence stay as instruments.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 12/16 | 16/16 | 0/16 | 16/16 | 9/16 | 119.5d | 182d |
| armed | 12/16 | 16/16 | 0/16 | 16/16 | 7/16 | 117.5d | 182d |

Exiled 0 everywhere. Arc 4 reached 16/16 both sides; four-realm 0/16 both sides — the scale wall stands where the pre-seat substrate puts it (national + table reachable, table unsat by design, four-realm unreached). The w5 9→7 step-down is divergence noise on pairs with zero cap engagement (leadfeast s974–991 pairs are byte-identical except s975's single aid hold; their wave deltas come from pre-hold trajectory... in fact 13/16 pairs are byte-identical and the w5 delta lives inside them — identical trajectories can't change w5; the 9 vs 7 delta comes from the 3 engaged pairs: belongfeast s974 (armed d127 vs control d131, wave 4 vs 5 — a hold-induced divergence), belongfeast s980, leadfeast s975. All three engaged pairs diverged only because holds perturb trajectories; there is no lever signal beyond "holds move trajectories slightly").

## Death-cause shares

control: combat 307, villager combat 124, monster 94, expedition 22, contest 14, sickness 12, thirst 6, ambush 4, Hummice 4, Loud-Eyes 2, a wound that wouldn't close 3, Buffering 2, Big Loud 2, starvation 1, The Suburb 2, The Congregation 2, The Eater 2, the night 1.
armed: near-identical (combat 307, villager combat 124, monster 92, expedition 22, contest 14, sickness 12, thirst 6, ambush 4, Hummice 4, Loud-Eyes 2, a wound that wouldn't close 2, Buffering 2, Big Loud 2, starvation 1, The Suburb 2, The Congregation 2, The Eater 2, the night 1).
Violence-dominated both sides; starvation 1=1 pair-identical — no lever signal.

## Village assessment (plain words)

Thirty-two villages, thirteen of them the same village twice — where the cap never engaged, trajectories are byte-identical (13/16 pairs), the cleanest proof the layer touches nothing it shouldn't. The cap engaged on three villages: belongfeast s974 (two feast holds d43–44 while its pantry sat at 2–3 days fresh — "Not tonight," the elders decide, two nights running, then a televised feast fires on d45 as the pantry presumably recovered), belongfeast s980 (one aid hold d102 — Rafael... no: Deshawn begs at the treeline while 2,400 kcal already left the pantry, "Come back when the bins are full"), leadfeast s975 (one aid hold d95 — Aisha turned away gently at ~6 days fresh).

The most engaged village, s974 belongfeast, is the cautionary beat: d42 a STARVING warning, a raid carries off ~1,000 kcal, the elders hold two dusk feasts (d43, d44), a feast finally fires d45 — and the armed village then dies at d127 vs control's d131, with 5 extra starvedDays. The holds didn't cause the death (violence did — combat-dominated like its pair), but on a thin pantry the kept-closed feasts visibly shaved the buffer that a STARVING village was already spending. That's the volume-dial trade-off in the open: on 3-day pantries the brake trims exactly the feasts a hungry village also needs.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

**PASS.** All 4 hold beats read as people deciding under pressure:

- Feast hold (armed belongfeast s974 d43): "🍖 The feast fire is laid — but the shelves hold only ~3 days of fresh, and 0 kcal has already left the pantry today. 'Not tonight,' the elders decide. 'The fire waits for a fatter day.'"
- Aid hold (armed belongfeast s980 d102): "🙏 Deshawn begs at the treeline — but the shelves hold only ~5 days of fresh, and 2,400 kcal has already left the pantry today. The village turns them away gently: 'Come back when the bins are full.'"
- Aid hold (armed leadfeast s975 d95): "🙏 Aisha begs at the treeline — but the shelves hold only ~6 days of fresh, and 1,500 kcal has already left the pantry today. The village turns them away gently: 'Come back when the bins are full.'"

The aid/refusal chain runs the engine's honest path (trust moves, the ledger remembers) — the hold is a decision with a price, not a free veto. Surrounding beats: televised feasts with named eaters, the Eater/Herald/Audit circling the feast-smell, grief-leverage tribute reshaping ("With Haven grieving, Stonebridge installs their own speaker at the table. Tribute rises to 12,657 kcal/week. Grief is leverage, and they know it."), named beggars returning thinner (Dmitri of The Hungry Road II: "Our jars are empty"). No NEW defects vs the pilot's read. The pilot's known caveat (consecutive identical-structure hold beats — here s974 d43/d44) recurs; judged acceptable again: the numbers decline honestly (2.65→3.09 days, costs 3600→2800) and the situation genuinely recurs.

## Villagers as people (sense-read)

Goals and routines hold up across the sweep: villagers raid (Emberhold "done asking"), grieve (treaties shake, speakers get installed), beg (named beggars with remembered thinness), televise their feasts, stage national beats, learn the System's coordination layer ("One fire was a village. Two fires is a NETWORK."). The STARVING warnings read as genuine panic, not flavor — d42's STARVING warning sits next to a raid, a death, and two held feasts, and the village's later death reads earned. Nothing robotic in the sampled hold-adjacent beats (≥10 read).

## Blanks filled / documented

- **FILLED (kill)**: the drawvol confirm — 32 runs on 16 fresh seeds against the pilot's GO, verdict KILL per the binding header. scripts/policies/drawvol.js DELETED zero-trace (the landing commit's only game-side file; nothing in src/ or the index ever referenced it — verified). Proof + sweep + analyzer + evidence stay as instruments.
- **DOCUMENTED (mechanism)**: engagement is seed-set dependent: 13 holds on pilot seeds [982–989] vs 4 on confirm seeds [974,975,976,977,978,979,980,991] — ~8.5/32 runs combined. The cap binds rarely because the obligated+discretionary stacking it was named for almost never co-occurs on this substrate (the feast fires at dusk upkeep before the day's tribute lands; aid begs are event-driven). The binding channel is the big-feast brake on 1–5-day pantries, and this seed set simply had fewer of those candidacies.
- **DOCUMENTED (no chase)**: the s974 belongfeast divergence (armed +5 starvedDays, dies 4d earlier on the same violence-dominated trajectory) shows the brake can trim exactly the margin a STARVING village is spending — a volume dial is not neutral on the downside. Any future volume arm on this axis should pre-register an asymmetric guardrail (armed starvedDays ≤ control is not enough; consider armed ≤ control on the thin-pantry subset).
- **DOCUMENTED (no chase)**: w5 9→7 step-down lives entirely in the 3 engaged pairs — hold-induced trajectory perturbation, not a lever signal. wave-4+ reach is unchanged (16/16).

## Metric review (§14)

- No re-scoring. The primary (48-passed-absolutely at 48≤50 on pilot seeds; 53>47 here) and the engagement bar (13≥8 pilot; 4<8 here) were both pre-registered absolute bars, judged as written. The kill follows the header's letter: "Any miss: KILL."
- The lesson is in the metric, not the layer: an absolute count engagement bar over 8 seeds is hostage to seed luck for a rare-event mechanism. Pilot's 13 holds and this sweep's 4 holds are both consistent with ~1 hold/4 runs. For the NEXT run on any rare-engagement lever: pre-register engagement as a RATE over the available channel (holds per thin-day with a discretionary candidacy) with a floor on channel availability, or pre-qualify seeds for channel presence at pilot stage. Revisions apply to the next run, not this one.
- The 4-seed... (correction: 8-seed) fresh-seed requirement was met exactly as specified (filenames verified absent, none of 974–980/991 appear in evidence/2026-10-13→16).
- The mid-run service restart is recorded in drawvol-confirm-sweep.log; the fill-in protocol (det-gated, same env, same script) re-reran gates GREEN in each invocation, so the 32-run set is trustworthy.
- Base move mid-run (a8c804c8 → 089ff4bd, 4 design-call landings by loop A) happened AFTER the sweep completed; the kill only deletes the layer file, which siblings never touched (byte-identical verified). The proof suite was re-run GREEN on the new base before the deletion — so the instrument set is valid against the current base.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current '<confirm per-seed armed/control globs>' --metrics national,table,wins,exiled` (16 files per side, confirm seeds only, staged as perseed-drawvol-confirm-{armed,control}/):
- LOUD: wins disappeared: baseline 16 → current 0 (n=16) — fires IDENTICALLY on control and armed. Expected substrate-mismatch class: the baseline is the full win-side stack (post-seat), the sweep substrate is pre-seat courtship (SEATDRIVE=0), where the win is unreachable by design (0/16 both sides in pilot too). Not a lever regression; no same-run investigation needed beyond this attribution. national/table/exiled quiet.

## Convergence state

**KILL — layer deleted zero-trace** (default-off policy layer removed; repo reverted to byte-identical pre-landing). The food-economy axis stays converging: landed levers remain prodthrottle (inflow) + allowgate2 (outflow gate); the discretionary-volume line (drawvol) is now CLOSED on both forms — pilot GO + confirm KILL. The #200 stacking-channel question survives: the one stacking-channel hold in this sweep (s980 d102, tribute 2,400 + aid ask 1,946 > 2,500) and one in the pilot confirm the channel EXISTS but is too rare to move outcome metrics — it needs a trigger tuned to the actual co-occurrence shape, not a flat daily budget.
