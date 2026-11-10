# Phase 4 social rates screen — analysis

OVE-55 measure-only. Tip **`748cce3b8`** (`748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6`).
Includes #41 bond/link dawn candidates. Does **not** include later #42 fighterState / #43 tips (`origin/master` at write: `6e53adc62`).

## Method

| Knob | Value |
|---|---|
| Seeds | documented screening 16: `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` |
| Policies | `capable,maker,merchant,caregiver` (livelihood registry) |
| Horizon | 150 days |
| Cases | 64 / 64 observed, 0 failed |
| Probe | `scripts/probe-phase4-social-rates-20261108.js` |
| Raw panel | `evidence/2026-11-08/phase4-social-rates-panel.json` |

**Initiations (not response teles):** person = staged OR NPC propose accepted/refused without prior staged; link = `kind=link` staged; conversation = successful `startConvo`.

**Opportunity:** warm pairs (`bondDriveLive.live`), lore-eligible link raisers (lore keys + `build_standing≥1`), talkable living NPCs.

## Verdict

**SOCIAL_RATES_LIVE.** Proposal, link-raise, and conversation rates all fire on every policy in the screen. Opportunity is open; no zero-with-closed-opportunity cases.

## Pooled (64 cases)

| Metric | Count | Per day |
|---|---:|---:|
| Person bond initiations | 520 | 0.0807 |
| Link-raise stages | 374 | 0.0581 |
| Conversations (startConvo ok) | 19129 | 2.970 |
| Game-days observed | 6440 | — |

## Per policy (16 seeds each)

| Policy | person | link | convo | person/run | link/run | convo/run | person/d | link/d | convo/d | seeds w/ each |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| capable | 128 | 94 | 4560 | 8.00 | 5.88 | 285.0 | 0.0849 | 0.0623 | 3.024 | 16/16 · 16/16 · 16/16 |
| maker | 123 | 95 | 5102 | 7.69 | 5.94 | 318.9 | 0.0711 | 0.0549 | 2.949 | 16/16 · 16/16 · 16/16 |
| merchant | 118 | 89 | 4389 | 7.38 | 5.56 | 274.3 | 0.0795 | 0.0599 | 2.956 | 16/16 · 16/16 · 16/16 |
| caregiver | 151 | 96 | 5078 | 9.44 | 6.00 | 317.4 | 0.0879 | 0.0559 | 2.957 | 16/16 · 16/16 · 16/16 |

## Opportunity vs zero

Every policy: 16/16 seeds had warm-pair days, lore-eligible days, and talkable days. Zero seeds with person=0 despite warm opportunity, link=0 despite lore, or convo=0 despite talkable. Opportunity notes list empty.

Zeros that would be defects are **not** observed. Remaining lottery/scorer non-fires while opportunity is open stay **unknown as defects** — they are expected under PAIR_TICK_P / LINK_TICK_P / HOLD picks.

## Bond score picks (cumulative log reads)

| Policy | HOLD | PROPOSE_BOND | RAISE_LINK |
|---|---:|---:|---:|
| capable | 232 | 439 | 124 |
| maker | 201 | 418 | 127 |
| merchant | 211 | 401 | 115 |
| caregiver | 245 | 526 | 130 |

Dawn/candidate scorer is live on this tip (#41): PROPOSE_BOND and RAISE_LINK appear as scored picks, not only warmth-lottery fires.

## Unknowns left unknown

- companionScore unification (OVE-54) not on tip `748cce3b8` — remeasure after it lands if companion-offer scoring claims are needed.
- This is **not** a before/after vs pre-#41; it is a post-#41 Phase 4 social baseline.
- Tips `#42` / `#43` (`1c1b23482` / `6e53adc62`) were not remeasured; fighterState is combat-lane and not required for this social screen.
- Conversation *quality* / want-coherence is out of scope (counts only).

