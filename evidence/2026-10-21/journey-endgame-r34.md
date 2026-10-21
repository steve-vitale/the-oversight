# journey-endgame r34 — OVERTIME HONESTY (lane B, 2026-10-21)

Leg 4 (endgame). Follows r16/r17 (the table approach: announce → audit →
door-offer, 4/4 seats taken aloud) and the flesh-out sim-fullseat diag
(full-seat decomposition: wave-4/5 deed bars bind, 0/16 indispensable).

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any play, 2026-10-21T05:15Z)

**Leg question:** After the Table is announced (day 90+), when a competent
village DEFERS sitting, does the overtime system fire honestly? Steve
2026-10-14: "waiting should have a cost- but also an opportunity for the
truly powerful."

**What would count as interesting:** a tier that stages silently (no System
line, no ◈ line, no telemetry); teeth that don't match the TABLE.md table
(RERUN HP/dmg multipliers wrong, raid knobs not applied, seat-price penalty
absent from the audit); the window opening real wave-4/5 deeds (the
fullseat binding constraint) — or proving it doesn't.

**PRIMARY (binding):** on every run reaching overtime tier ≥ 2, each staged
tier 1..maxTier is announced aloud (the System line + the ◈ OVERTIME line)
AND the `overtime_tier` telemetry event fires with the matching tier.
GO = 0 silent tiers, 0 telemetry mismatches. A silent tier is NO-GO (§14).

**Non-binding (report):** RERUN fight count/teeth by tier; raid frequency vs
the knobs; seat-price penalty spoken in the audit; wave-4/5 deeds earned
during the window vs before; third-titan omens at tier 2; the key.

**Substrate:** CAPABLE bot (policies/capable — competent play that uses the
game) with CAPABLE_GREEDY=1 (Steve's deferral design, 2026-10-15),
CAPABLE_GREEDY_MAXTIER=6, CAPABLE_GREEDY_LASTDAY=170, TELEMETRY_FULL=1.
180d, death-aware. Seeds 71001–71004 (pilot; the pilot showed the full
arc, so no expansion — the question is answered).
**Instrument:** scripts/probe-overtimehonest-20261021.js (policy-side, zero
src/js changes); DET-gate byte-identical GREEN (2×120d); analyzer
scripts/analyze-overtimehonest-20261021.js.

## RESULTS

**PRIMARY: GO.** 12/12 staged tiers voiced aloud (the System line + the ◈
OVERTIME detail line with exact numbers) and 12/12 `overtime_tier`
telemetry events fired with the matching tier, across all 4 seeds. Zero
silent tiers, zero mismatches. Tier days exact: 97/104/111/118/125/132
(announce day 90 + 7).

Per-seed:

| seed | announce | sat (tier) | tiers voiced/tele | RERUN fights | raids | w4+ deeds in window | penalty | won |
|---|---|---|---|---|---|---|---|---|
| 71001 | d90 | d132 (×6 cap) | 6/6 | 4 (t3–t5) | 16 | congregation/eater/reunion (w4 ×3) | −30 (2 lost) | yes |
| 71002 | d90 | d100 (×1, weakened) | 1/1 | 1 (t1) | 9 | suburb/strike (w4 ×2) | −4 (0 lost) | yes |
| 71003 | d90 | d130 (×5, weakened) | 5/5 | 4 (t3–t5) | 13 | timeslot (**w5**), algorithm (w4) | −29 (3 lost) | yes |
| 71004 | d170 | d170 (×0, sat at once) | — | 0 | 14 | — (late-announce control) | 0 | yes |

**The teeth are real.** RERUN fights fired 9 times across the 3 deferral
seeds (tiers 1–5; nothing reached a fight at ×6 — the cap sit is same-day).
Raid rate roughly doubled inside the window: 71001 8 raids/42d vs 8/85d
pre-window; knobs read correctly per tier (cooldown 7→3, gorge ×2.5 at ×6).
The seat dock priced exactly: −4/−8/−12/−22/−26/−30 matching
min(40, tier×4 + losses×3), and the audit speaks it: "The table notes the
overtime: 6 weeks kept waiting, 2 of Haven lost meanwhile. Every door's
standing −30."

**The opportunity is real — this is the wave-4/5 on-ramp.** The fullseat
diag (today) showed w4≥3 failing 14/14 on the natural track. In the
overtime window: 71001 went w4 0→3 (exactly the full-seat bar, via RERUN
fights on days 116/117/131 — the deed feed records RERUN fights through
the normal startCombat wrap); 71002 went w4 3→5; 71003 earned a **wave-5
deed** (timeslot, day 113, tier-3 RERUN) — the wave-5 wall (0-for-96 pooled
wins) has a door, and it's this one. w5 ended 3 on 71003 (1 pre + 1 window
+ 1 from the table's own challenge on sit day).

**The cost is real and priced.** 71001 lost 2 Haven on day 116 (first
tier-3 RERUN day, +75% HP/+36% dmg); 71003 lost 3 across the window (days
111/126/129) and sat with the pantry at 5,600 kcal. The audit names the
losses aloud. Both villages still won — deferral is survivable, not free.

**Third-titan gate:** overtimeThirdTitan() open on all 29+27 tier≥2 days
(71001/71003) — the uncast apocalypse gets its 25%/day omen. The key never
became ready (all three titans slain required — "almost impossible" by
design; not a miss).

**71004 (the control):** an early-game population crash (12→5 by day 71)
kept the seat bar from holding until day 170; the village sat the same day
and won. The lesser seat can come as late as day 170 after a brutal start
— and the run still resolves. (Which sub-bar bound isn't instrumented here;
candidate for a seat-bar diag, not this run.)

## VILLAGE ASSESSMENTS — in plain words

**71001 — the patient village.** Ten alive at the end, global standing, a
pantry of 92,859 kcal — fat and confident. They rode all six overtime
tiers, fought four RERUN battles (three of them first-contact wave-4
monsters), buried two Haven on the day the reruns turned tier-3, and sat
the table at day 132 with the full −30 dock. They won. The village that
could afford to wait did, and the table priced the wait honestly.

**71002 — the strong village that blinked.** Eight alive, global, 53,249
kcal. They waited ten days, picked up two more wave-4 deeds in the window
(suburb, strike), and sat at tier 1 on day 100 when the run softened. The
−4 dock was a shrug. They won. Not every village needs the full clock —
the mechanism lets a strong village take a short, cheap look at wave 4.

**71003 — the village that paid.** Seven alive at the end (three lost in
the window), global, pantry nearly empty at 5,600 kcal. They fought RERUNs
at tiers 3–5, earned the run's only wave-5 deed (timeslot), and sat at day
130 with a −29 dock. They won. This is Steve's "opportunity for the truly
powerful" with the price tag attached — the window opens wave 5, and it
charges in people and food.

**71004 — the survivors.** Six alive, global. Lost seven people before day
71, spent a hundred days clawing back to the seat bar, sat at day 170 the
day the table finally came, and won. No overtime — the table arrived late
and they took it at once. Proof the endgame resolves even for the
almost-dead.

## PEOPLE CHECK (SENSE-TESTING LAW)

Read the tier-announce + audit transcripts in full (perseed-overtime/
overtime-r34-*-transcript.txt). The System's tier voice is authored and
escalating, never mechanical: ×1 "The season was supposed to END. You
didn't sit. So we kept the cameras rolling. RERUNS, folks — the hits, but
HUNGRIER." → ×4 "Raids every few nights now! Bigger packs! Is this cruel?
It's TELEVISION." → ×6 "MAXIMUM OVERTIME! The table is still set. The
chair is getting cold. Sit — or don't! We LOVE this!" The ◈ detail lines
carry exact numbers (HP/dmg/pack/dock) matching the TABLE.md table —
no drift between doc and engine on any tier. The audit's overtime line
("6 weeks kept waiting, 2 of Haven lost meanwhile. Every door's standing
−30.") reads like a ledger clerk settling an account — the pricing beat
has a voice. Ambient life around the beats is people-shaped: "The village
is calling it 'Ugly-Eyes.' The Codex keeps it." / "The System files the
name away with visible satisfaction. It has so few words for things that
bleed." No senseless dialogue in the sampled beats; nothing unfireable.

## REACHABLE / FUN / WINNABLE

**Reachable:** yes — the announce fired day 90 on 3/4 seeds; the tiers
stage on their own once you don't sit. A real player who dithers (or
deliberately waits) WILL meet this system. **Fun:** the tier lines are the
best-voiced System content in the endgame — the table as a gameshow host
that loves your stall. The RERUN fights are real fights with real teeth,
not a tax screen. **Winnable:** 4/4 seeds won, including two that rode
deep overtime and one that sat at day 170 after a collapse. Deferral is a
genuine strategic choice with a priced upside (wave-4/5 deeds) — not a
trap, not a skip.

## BLANKS

1. **Documented (no game-code change): the lesser-seat audit hardcodes
   "waves 1–3 faced"** (table.js:486). Villages that bled for wave-4/5
   deeds in the overtime window hear an audit that pretends those deeds
   don't exist. The full-seat line ("every wave faced, the deeds
   complete") covers it, but the lesser line should name w4/w5 counts
   when nonzero — the audit "reads your run back to you," and right now
   it skips the bravest chapter. Candidate fix for an endgame-content
   run; the pricing itself is correct, only the voicing is incomplete.
2. **Documented: the RERUN fiction assumes prior contact.** The System
   announces "RERUNS, folks — the hits, but HUNGRIER" and "you have seen
   this episode," but 71001's wave-4 RERUNs were first-contact fights
   (w4=0 at announce). For villages that unlocked wave 4 without ever
   fighting it, overtime serves scaled-up first encounters under a rerun
   frame. Mechanically coherent (the scaling applies to whatever wave-4/5
   fights happen); fictionally loose. Not a bug — a voicing note for the
   fiction pass.
3. **Documented (instrument gaps, fixed or noted):** the first probe
   version read `deedState().wavesFaced` as `{w1:[...]}` arrays — always
   0 (real shape is `{monsterId: wave}`); fixed and the sweep re-ran
   clean. RERUN-fight monster detail reads `x.mid||x.id`, missing the
   TB fighter's `monsterId` field (fixed post-sweep; deed-exact
   waveFirst data is authoritative). The greedy sit-trigger (which
   strength gate released 71002 at day 100) isn't attributed — hpFrac and
   pv.ready aren't in the day series. The announce-line slice missed the
   dawn announce text (10-line window vs dawn-to-dusk; widened to 80 for
   future runs — the announce itself was verified by r17).

## METRIC REVIEW (§14)

The primary bound the run and was met (12/12 tiers voiced + telemetry,
0 silent). No re-scoring. Two metric notes for the NEXT run: (a) the
"runs at tier≥2" scope worked as designed — seeds that never reach tier 2
(early sit, late announce) are controls, not misses; (b) wave-deed
attribution needs the faced-id snapshot, not counts — the count-only
first version silently zeroed the opportunity half of the question.

## TELEMETRY

First leg-4 (endgame) telemetry baseline: seeded with --update-baseline
below. Key metrics: overtime_max_tier, overtime_tiers_voiced,
overtime_telemetry_matched, rerun_fights, raids_in_window, w4_deeds_window,
w5_deeds_window, seat_dock, won.

## FILES

- scripts/probe-overtimehonest-20261021.js (new; DET-gate GREEN)
- scripts/analyze-overtimehonest-20261021.js (new)
- evidence/2026-10-21/perseed-overtime/overtime-r34-{71001..71004}.json
- evidence/2026-10-21/perseed-overtime/overtime-r34-{71001..71004}-transcript.txt
- evidence/2026-10-21/journey-endgame-r34.md (this file)
