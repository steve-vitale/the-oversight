# sim-windowloss — wave-5 window loss attribution DIAG (axis scale-onramp)

Run fleshout-20261022T1717Z, arm sim-windowloss. Worker tree sim-windowloss,
base b73e4751e (= master at run start; rebased onto master pre-build so the
stagemuster corpus, landed this run, is present repo-relative).

The question (the named wall from the 1015Z review): "the post-veterans
window (bar fills, veterans die before the door opens) is the next named
wall." The vetwindow DIAG found (a) RERUN-overtime is the window's clock —
while the seat is untaken, wave-4/5 monsters return as RERUNs at +25% HP/+12%
dmg per overtime level (~d112 x1, ~d119 x2, ~d126 x3); the DIAG veteran deaths
were all in RERUN-scaled or lingering wave-4 fights; (b) in never-opened
wave-5 windows the door was blocked SOLELY on armor while veterans held at 2;
(c) the mantle-promotion chain is a veteran-death accelerant (veterans become
scholars, then die leading the next wave-4 party).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The Mirror
Draft; wave 5 = The Producers; the readiness gate's VETERANS bar = 2 living
roster members with wave-4+ kills in state.waveKillLog; wave-5 demand:
ARMORED 4 fighters at worn P>=15, ARMED 6, TRICKS 3, VETERANS 2). No canon
doc covers armor/equipment — stated, not invented.

## Corpora (re-analysis only — NO new sims)

| Corpus | Configs | Windows observed |
|---|---|---|
| evidence/2026-10-22/perseed-armorydrive-confirm/ | 64 (32 control + 32 armed) | 4 (all armed; control 0) |
| evidence/2026-10-22/perseed-vetwindow/ (pilot) | 32 | 0 (max vetsMax=1) |
| evidence/2026-10-22/perseed-vetwindow-probe/ | 12 | 8 obs = 4 unique (probe-duplicates of the 4 confirm windows) |
| evidence/2026-10-22/perseed-stagemuster/ | 32 (16 control + 16 stagemuster-arm) | 4 (all control; coarse — scalars + kill rows only) |
| evidence/2026-10-22/diag-vetwindow.json | — | DIAG census + death rows for the 4 confirm windows |

140 configs scanned; 16 window observations; 8 unique windows (W1..W8).
A "window" is observed iff w5vetsMax >= 2 (the VETERANS bar filled at some
point). The probe's control runs are macro-identical to the DIAG replay
(same anchor 2a3fc56b) and its vetwindow runs byte-identical trajectories —
replication, excluded from the channel tally.

## PRE-REGISTRATION (§14 binding — written BEFORE building the instrument)

- PRIMARY (DIAG): window-loss table delivered covering >=80% of observed
  wave-5 windows across the corpora, with a single dominant loss channel
  named with counts — or an honest "no dominant channel" verdict with the
  distribution. GO = table delivered at >=80% coverage AND the verdict
  (dominant channel or no-dominant) stated with counts.
- Loss channels: veterans | armor | rerun-escalation | mantle-succession |
  other. Breaking-death rule (deterministic): RERUN level >= 3 ->
  rerun-escalation; else deceased was the mantle-holding scholar ->
  mantle-succession; else -> veterans.
- There is NO before/after panel for a re-analysis DIAG — the instrument
  reads landed corpora; nothing is treated. Stated explicitly per the brief.
- A miss is NO-GO, never re-scored.

## Proof gates — GREEN before analysis (16/16 PASS, 0 FAIL)

scripts/test-windowloss-20261022.js: E1 two-run byte-identical determinism;
E2 corpus file counts 64/32/12/32 (140 configs); E3 16 window observations
(4/0/8/4 by corpus); E4 8 unique windows W1..W8, 8 probe duplicates; E5
outcome tally opened 4 / killed 4 / held 0, killer channels
{rerun-escalation:1, mantle-succession:1, veterans:2, armor:0, other:0};
E5c verdict no-dominant-channel; E6 armor sole-blocker 28/28
fully-instrumented never-opened window-days; E7 coverage 8/8 >= 80%; E8
fact-sheet provenance + attribution rule present; E9 instrument is
read-only (no repo writes on run). Instrument:
scripts/windowloss-20261022.js; fact sheet:
scripts/windowloss-facts-20261022.json (every breaking-death fact cited to
evidence/2026-10-22/sim-vetwindow.md + diag-vetwindow.json).

## The window-by-window table

| Window | Seed x base (corpus) | Fill | Window | Blocked | Outcome | Loss channel |
|---|---|---|---|---|---|---|
| W1 | s65477 x leadfeast (armorydrive-confirm + DIAG) | d127: Nadia d127 strike (companion); Mai d127 strike (player) | 20d (d127–d146) | armor sole on 20/20d | killed | rerun-escalation (+mantle-succession) |
| W2 | s65477 x belongfeast (armorydrive-confirm + DIAG) | d107: Saleh d98 influencer (companion); Shuting d107 congregation+suburb (companion) | 8d (d107–d114) | armor sole on 8/8d | killed | mantle-succession (+rerun-escalation) |
| W3 | s65478 x leadfeast (armorydrive-confirm + DIAG) | d93: Ethan d86 eater (player); Giulia d93 audit (companion) | 0d (opened on fill day) | armor (transiently satisfied on fill day) | opened | — |
| W4 | s65475 x belongfeast (armorydrive-confirm + DIAG) | d136: Sigrun d110 algorithm (companion); Assunta d136 congregation (player) | 0d (opened on fill day) | unknown (no census rows) | opened | — |
| W5 | s65536 x belongfeast (stagemuster) | Sigrun d162 congregation (player); Amina d163 suburb (companion) — fill day unknown | unknown (no census) | unknown (no census) | killed | veterans |
| W6 | s65537 x belongfeast (stagemuster) | Lena d94 congregation (companion); Ella d101 eater (player) — fill day unknown | unknown (no census) | unknown (no census) | killed | veterans |
| W7 | s65532 x leadfeast (stagemuster) | Pooja+Yudi d141 strike (companions); Dorothy d141 strike x2 (player) — fill day unknown | unknown (no census) | unknown (no census) | opened | — |
| W8 | s65538 x leadfeast (stagemuster) | Grace d156 influencer (companion); Katarina d169 congregation (player) — fill day unknown | unknown (no census) | unknown (no census) | opened | — |

Window-kill detail (rich windows):
- W1 (killed d147): Mai + Nadia died the same day — a RERUN x6 Suburb
  (+150% HP/+72% dmg) followed by a RERUN x6 Audit. Mai was the
  mantle-holding scholar; the mantle passed to Nadia mid-fight; Nadia died
  too; mantle to Saleh. Bar 2->0 in one day. Village lost d148.
- W2 (killed d115): Saleh (scholar) died in a RERUN x1 Reunion ("Your own
  move, returned hits you for 42") — bar 2->1, window ends. Shuting
  (scholar; mantle Saleh->Shuting) died d123 in a RERUN x2 Reunion — bar
  1->0, kept dead; mantle to Sanne. Village lost d126.
- W3/W4 (opened): the door opened the same day the bar filled — the window
  never lived as a census period. Post-door deaths (Ethan d107, Giulia
  d138, Assunta d161) are not window-killers.
- W5/W6 (killed): one veteran died each (vetsEnd=1 < vetsMax=2); death
  detail unavailable — the stagemuster per-seed JSONs carry no death rows
  or readiness census (documented gap, not hidden).

Probe replication (not in tally): the vetwindow arm registered live windows
on the W1/W2 configs (vwWindowDays 20/8, 10/14 wave-4+ fights restrained)
but executed ZERO disengagements — every window fight was a haven assault
and the restraint holds at haven by design (MECHANISM FIRED-BUT-HELD).

## Verdict

**GO at DIAG — honest "no dominant channel" verdict.** Killed-window
channel tally (unique windows, n=4): veterans 2, armor 0,
rerun-escalation 1, mantle-succession 1, other 0. No channel holds a
majority; half the killed windows (W5, W6) lack the death detail to rule
rerun/mantle in or out. The distribution IS the finding.

The strongest consistent signal is the BLOCKER, not the killer: armor was
the SOLE short bar on 28/28 fully-instrumented never-opened window-days
(W1: 20/20, W2: 8/8), and both fully-instrumented opened windows opened
the same day the veterans bar filled (armor transiently satisfied). The
veterans leg is now manufacturable (armorydrive: 8 villager wave-4 kills,
4/32 armed reached w5vets2=2 vs 0/32 control); the armor leg has no
economy on the measured substrate (end-run armored P>=10 median = 0 both
arms — "still vacuous") and no policy verbs (finding #646).

## Wall numbers (as recorded in the corpora's own evidence)

- armorydrive-confirm armed (32): national 16, table 29, won 0, wave4
  27/32, wave5 2/32, w5vets2 4/32, median 148d.
- armorydrive-confirm control (32): national 18, table 27, won 0, wave4
  30/32, wave5 0/32, w5vets2 0/32, median 131d.
- vetwindow pilot (32): national 16/32, table 30/32, wins 0/32, wave4
  30/32, wave5 0/32, w5vets2 0/32, median 124d.
- stagemuster control (16): national 11, table 14, won 0, wave4 15/16,
  wave5 2/16, w5vets2 4/16, median 157d. stagemuster arm (16): national 8,
  table 14, won 0, wave4 15/16, wave5 0/16, w5vets2 0/16, median 147d.
- Across the DIAG corpora: 4 unique doors opened (W3, W4, W7, W8), 0 wins.

## Named next intervention

**"Armor the village" — a game-side armor-economy drive (finding #646).**
The door-blocker is the ARMORED bar (4 fighters at worn P>=15): sole
blocker on 100% of instrumented never-opened window-days, and the
restraint probe proved veteran survival alone doesn't open doors (the
window just persists). Concrete pilot: while the post-veterans window is
live (bar filled, door shut), add armor-acquisition verbs sufficient to
get 4 living fighters into worn P>=15 — crafting recipes, loot-table
weight, and/or trader stock (game-side; no policy verbs exist today).
Pre-reg primary for the pilot: wave-5 doors opened among configs reaching
w5vets2=2 on identical seeds — GO = drive >= control + 2 doors AND >=2/8
drive seeds with a door opened; guardrails: median survival |d|<=10d,
starvation/100d paired, no new death modes, armor not bled. Runner-up
(window-survival companion, policy-side): veteran benching during the
window — veterans don't join wave-4+ haven-door fights while the bar is
filled and the door is shut (closes the restraint's haven-assault gap
without fleeing; the door must still be held). Note: the armor bar's
demand (P>=15 x 4) is a sim starting point Steve can overrule — if the
economy can't support it, the fallback design question (retune the bar
vs build the economy) is a Steve-call.

## Metric review (§14)

1. The primary as written was satisfiable by a DIAG: 8/8 coverage, counts
   stated, no-dominant verdict honest. No re-scoring temptation — the
   "veterans 2" rows are explicitly low-information, not quietly
   reassigned to rerun/mantle.
2. No before/after panel applies to a re-analysis DIAG (nothing treated);
   stated in the pre-reg and here. The panel remains the instrument for
   the NEXT run's pilot, not this one.
3. The stagemuster corpus's coarse per-seed schema (no census, no death
   rows) caps attribution at "veterans (detail unknown)" for W5/W6. NEXT
   runs that sweep for windows should carry the w5 readiness census +
   veteran death rows (the vetwindow instrument set) so the killer
   distribution can be completed.
4. The probe-duplicate counting choice (unique configs for the tally,
   duplicates as replication) doesn't move the verdict: with duplicates
   the killed tally is 2/2/2 — still no dominant channel.

## Blanks filled / documented

- FILLED: the wave-5 window-loss instrument
  (scripts/windowloss-20261022.js + scripts/windowloss-facts-20261022.json,
  zero src/js) + proof (scripts/test-windowloss-20261022.js, 16/16 GREEN)
  + the window-by-window table above (8/8 unique windows, 16 observations,
  140 configs scanned, deterministic).
- FILLED: the loss-channel taxonomy with a deterministic breaking-death
  rule (RERUN>=3 -> rerun-escalation; scholar -> mantle-succession; else
  veterans), applied uniformly.
- DOCUMENTED: (1) the stagemuster corpus's unattributable W5/W6 deaths
  (no death rows/census — instrument gap for the next sweep); (2) the
  armor-blocker consistency (28/28 days) vs the killer-distribution split
  (1/1/2) — the blocker is the stronger signal; (3) the restraint's
  haven-assault gap stands (probe replication); (4) the armor economy is
  vacuous on the measured substrate (P>=10 median 0) — the named next is
  game-side, finding #646.

## Convergence

Axis scale-onramp: the post-veterans window is now ATTRIBUTED
(converging -> the wall has a named next). The door opens 4/8 unique
windows; the never-opened door is armor-blocked (28/28 instrumented
days); the killed windows split 1/1/2 across rerun-escalation /
mantle-succession / veterans-unknown. Next: the "armor the village"
pilot (game-side, #646) with the pre-reg primary above; the veteran-
benching companion stays a policy-side option. Lever rotation index NOT
advanced (standing directive override in force).
