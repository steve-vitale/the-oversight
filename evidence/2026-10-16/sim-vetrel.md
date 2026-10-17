# sim-vetrel — the companion-veteran reliability driver (finding #427's named next)

**Run**: flesh-out loop, 2026-10-16, run fleshout-20261016T2315Z, axis SCALE-ONRAMP (blocking).
**Question**: the companion-veteran channel is PROVEN but RARE (2/16 wave-4
unlocks, sim-arming). Can a focused reliability driver make it RELIABLE —
more companion kill opportunities, better companion survival?
**Layer**: scripts/policies/vetrel.js (VETREL=1, default OFF) — NEW file,
zero game-code, zero changes to existing policies. Wraps
leadfeast/belongfeast (the feastscale composition pattern). Veteran bar
ONLY: no armory, no counters, no armor-crafting (documented constraints from
sim-arming, not re-litigated).
**Proof**: scripts/test-vetrel-20261016.js — 20/20 GREEN (RED→GREEN;
gate-off byte-identical to base policies on the real harness, gate-on
deterministic, gate-on non-vacuous).

## PRE-REGISTRATION (written before the pilot; binds per MEASUREMENT.md §14)

- **Primary metric (binding)**: companion wave-3 kills (waveKillLog entries
  with w>=3 AND via='companion' — the tricktag channel, finding #405),
  armed − control ≥ 3 across the 16-run pilot.
- **GO**: diff ≥ 3 → confirm on 12–16 fresh seeds.
- **KILL**: miss the GO bar → delete scripts/policies/vetrel.js zero-trace
  per kill protocol; keep instruments + evidence.
- **Guardrails**: no new death mode (n≥3); median survival ≥ control−10d
  (per policy pair); scholar deaths ≤ control+2 (villagerId-change count);
  national ≥ control−2.
- **Secondary (report-only)**: vet=2-peak rate (readiness veterans≥2 at any
  snapshot), wave-4 unlocks.
- **Horizon**: 180d death-aware (dead villages stop; the scale wall needs the
  full clock — wave 3 fires ~d25–75, Standing crosses 100 ~d60–120).
- **Seeds**: pilot 8 fresh (1221–1228); confirm 12 fresh (1231–1242) —
  all verified 0 per-seed filename hits across evidence/ before use.
- **Policies**: {leadfeast, belongfeast} × {control (VETREL unset),
  armed (vetrel-lead/vetrel-belong, VETREL=1)}.
- **Substrate**: pre-seat courtship — SEATDRIVE=0 EXPLICIT,
  FEASTSCALE_R13=1 (per the 0215Z method note: unset != active).
- **Own paired control** on identical seeds (in-sweep).

## The lever

Four pushes, all policy-side, all engine-honest (full design in
scripts/policies/vetrel.js header):

(a) **Companion selection by combat stats** — invite the STRONGEST available
    companion via the real inviteToParty verb (trust≥20 floor honored),
    ranked by weapon bonus + armor + health, non-veterans first. Never
    P≥15 armor wearers (preservation-only armor game). No dismissals
    (dismissFromParty seeds negative gossip — deliberate non-action).
(b) **Scholar-softens / companion-finishes** — veteran-aware commit:
    non-veteran scholar commits (ctx._huntCommit → 12% floor, needs their
    own kill); veteran scholar keeps the 35% eject discipline AND yields
    the killing blow (real tbPlayerWait) when the weakest live wave-3
    monster is ≤20% maxHp and a committed companion is engaged. Bounded
    (6 turns/fight, 2-stall cap), guarded (scholar hpPct≥0.5, round≥2).
    Never fakes a kill.
(c) **Companion survival** — engaged companion <40% HP ends the commitment:
    monster near death → scholar resumes striking (fastest fight end);
    otherwise the scholar breaks off via the real tbBarrierExit/
    tbPlayerMove verbs (p.fled ends the fight 'fled' — the companion stops
    taking damage). Covers the engine's winning-floor gap (a winning brave
    companion holds to 5% — one wave-3 hit can kill them).
(d) **Deliberate hunts** — every 3rd day, HP≥60%, fed (kcal≥200), ≥1
    companion, veteran bar unmet: thicket/ruin expeditions through the real
    checkEncounter, walk-up engages (bounded 12 steps), home the same day.

## Results

### Pilot (8 seeds 1221–1228, 16 runs/side, 180d death-aware)

| | control (lead/belongfeast) | armed (vetrel-lead/belong) |
|---|---|---|
| companion wave-3 kills | **0/16** | **6/16** |
| wave-4 unlocks | 0/16 | 1/16 |
| vet=2 peak | 0/16 | 1/16 |
| national | 0/16 | 0/16 |
| median survival | 170d | 180d |
| scholar deaths | 102 | 63 |

Per-policy: vetrel-lead 3 kills (s1222×2, s1226×1); vetrel-belong 3 kills
(s1221×1, s1227×2 + the wave-4 unlock). Control: 0 kills on all 16.

**PRIMARY: GO (6 − 0 = 6 ≥ 3).** Guardrails ALL PASS: no new death mode
("unknown" village-lost both sides — the standard wall cause); median
survival 180 ≥ 160; scholar deaths 63 ≤ 104 (FEWER — the survival pushes
protect); national 0 ≥ −2.

### Confirm (12 fresh seeds 1231–1242, 24 runs/side, 180d death-aware)

| | control | armed |
|---|---|---|
| companion wave-3 kills | **0/24** | **12/24** |
| wave-4 unlocks | 1/24 | 2/24 |
| vet=2 peak | 1/24 | 5/24 |
| national | 0/24 | 0/24 |
| median survival | 158d | 180d |
| scholar deaths | 145 | 109 |

Per-policy: vetrel-lead 10 kills; vetrel-belong 2 kills + 1 unlock.
Control's single unlock came through a NON-companion villager channel
(patrol/wild/agency kill attribution — villagers can blood off-screen);
its companion-channel count is still 0.

**PRIMARY: GO (12 − 0 = 12 ≥ 3).** Guardrails ALL PASS: no new death mode;
median survival 180 ≥ 148; scholar deaths 109 ≤ 147; national 0 ≥ −2.

### Combined (40 runs/side)

Armed 18 vs control 0 companion wave-3 kills. 11/40 armed runs produced ≥1
companion kill (distribution {1:5, 2:5, 3:1}); control 0/40. The channel
fires in ~27.5% of armed runs vs 0% control — up from sim-arming's 12.5%
(2/16). Road-dependence PARTIALLY replicated: lead produced 13/18 kills,
belong 5/18 — lead is the stronger road, but belong is no longer shut out
(sim-arming's 0/8 belong is overturned).

### What actually carries the channel (honest decomposition)

Armed telemetry, 40 runs: vetInvitesOk 267, vetHunts 510, vetHuntLegs 885,
vetHuntEngaged 77, vetHuntFights 137, vetYields 17, vetBreakoffs 167
(turn-counted — see metric review), vetRescues 4.

The kills come from (a)+(c)+(d), NOT (b): the yield fired only 17× across
40 runs and 0× on either sense re-run — both transcript kills landed
organically (ranked companions in the fight + turn order), the scholar's
big strikes doing the softening. The yield is proven in unit tests
(20/20) but thin in the wild: the ≤20%-HP window is structurally narrow
because scholar strikes (40–100) usually overshoot it — the monster goes
from 30% to dead in one scholar hit, leaving no window for the companion.
A follow-up could widen the window (e.g. ≤35%) at the cost of longer
companion exposure; not tuned here — the bar was met without it.

The breakoff count (167) is turn-counted, not event-counted: the scholar
walks out over 2–4 turns and each turn increments. Real breakoff events
are ~40–80 — still most committed fights. That eagerness is protective,
not destructive: scholar deaths FELL (63 vs 102 pilot, 109 vs 145
confirm) and median survival ROSE. The design judgment stands: a
companion's life > one kill chance.

## Village assessment

The armed villages look like villages preparing for war, not bot farms.
vetrel-belong s1227 (pilot, wave-4 unlock): 9 invites OK, 13 deliberate
hunts, 25 hunt legs through real encounters, 3 committed fights — and the
unlock came when the second veteran was blooded, exactly the designed
path. The control villages on identical seeds: 0 companion kills, 0
unlocks, more scholar deaths.

Who died: the standard wall causes on both sides ("unknown" village-lost
— the scale wall, not the hunts). The hunts did not buy kills with lives:
armed scholar deaths are DOWN by ~35% and median survival is UP. The
companion-survival push (c) is doing its job — companions come home.

The remaining gap is still reliability, not mechanism: 29/40 armed runs
produce zero companion kills. The hunts fire (510 hunts, 77 engagements)
but the killing blow is stochastic — turn order, monster focus, companion
damage (5–10/turn vs 240–420 HP). The next named step, if Steve wants it,
is widening the finish window (yield threshold tuning) or heavier
companions (better arms for the invited — the armory work sim-arming
deleted, rebuilt honestly).

## Sense-reads (SENSE-TESTING LAW)

**vetrel-belong s1227, d68** — the Callback (wave 3). "⚔ THE CALLBACK!
Elena, Declan, Lambert, Teodoro join you!" — four villagers pile into the
fight. The beats read as a brawl between people: "Declan SCREAMS — a
sound like milk curdling in fast-forward", "The Callback wears Nino's
face. The face is too symmetrical." Full transcript:
evidence/2026-10-16/vetrel-sense-vetrel-belong-s1227.txt.

**vetrel-lead s1222, d43** — the Spool (wave 3, "The Ugly Beast").
"⚔ THE UGLY BEAST! Catalina joins you!" The scholar softens with a
crowbar (104, 49, 39); Catalina chips (5, 8, 8); Lesya, Robin, Wanjiru
chip in. "Catalina hits spool for 8. The Ugly Beast falls. Tape snaps
and whips loose." Then: "Lesya nods, slow. 'Remind me not to cross
you.'" / "📺 Lesya, Catalina, Robin, Wanjiru brought down The Ugly
Beast. Together. (The village watches the broadcast. Nobody blinks.)" /
"You came back bloody. Nobody asks. Someone saves you the good seat by
the fire." — people fighting together, not a bot. The scholar-softens /
companion-finishes dynamic emerges from the fight structure even without
the yield firing. Full transcript:
evidence/2026-10-16/vetrel-sense-vetrel-lead-s1222.txt.

## Metric review (§14)

- **PRIMARY judged GO (binding), twice.** Pilot 6−0≥3, confirm 12−0≥3.
  The metric stood; no re-scoring.
- **vetBreakoffs is turn-counted, not event-counted** (my counter
  increments per player turn while walking out, 2–4× overcount). The
  behavior is correct; the telemetry label overstates. A follow-up can
  gate the count on fight identity. Not fixed here — code is frozen
  post-confirm.
- **The yield (b) is the weakest push in the wild** (17 firings / 40
  runs). Kept: it's proven, bounded, and harmless — and the one time the
  window opens it converts a scholar-steal into a companion blood. Tuning
  the window wider is a follow-up experiment, not this run's call.
- **Control CAN unlock wave 4 without the companion channel** (1/24 via
  patrol/wild/agency villager kills). The primary measures the
  companion channel specifically; the unlock count is secondary. No
  contradiction — the veteran bar counts all villager wave-3+ kills.
- **Haven edge case (reviewed, unfired):** the breakoff walks the scholar
  to the grid edge even at haven, where competent's directional flee
  holds ground ("no exit leads toward safety"). No anomaly observed in
  40 armed runs; if ever observed, mirror the hold (clear the commit,
  delegate) instead of walking out.
