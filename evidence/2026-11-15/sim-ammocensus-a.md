# sim-ammocensus-a — DIAG-GO (ammo census at wave-4 meetings)

Run: fleshout-20261116T0315Z (Loop A), axis scale-onramp, arm
sim-ammocensus-a. Branch `sim-ammocensus-a`, worktree
`~/workspace/worktrees/sim-ammocensus-a`. Base at arm start:
`6ca37144b`. Instrument tip: `a502b0f8f` (prereg `6cd47b3a6`).
Policy competent verbatim (sha256 `74a890f0844e` — the same
hash the vetparty arm ran under). Horizon 150d, death-aware.
Seeds 100861–100868 (8-seed pilot, SHARED with the sibling
arm sim-dawnbid-a, also a neutral recorder — separate
worktrees/processes/corpus dirs, no shared files).

## Pre-registration (frozen, from sim-ammocensus-a-prereg.md)

- Primary metric: **share of wave-4 meetings fully classified,
  and the ammo-less share among fighters counted "armed" by
  the gate.**
- GO (instrument validity) iff ALL: (1) 100% of wave-4 meetings
  classified (0 unclassified); (2) corpus 8/8 files parse;
  (3) neutrality proven (determinism legs green); (4) proof
  test `scripts/test-ammocensus-a.js` green.
- Single leg on the instrument tip (no game change, no lever);
  the control is the determinism leg (recorder on vs off).
- This is a DIAG: no lever GO/NO-GO, only instrument validity.

## Verdict: DIAG-GO — all four bars green

| Bar | Result |
| --- | --- |
| 1. Meetings fully classified | **133/133 (100%), 0 unclassified** |
| 2. Corpus files parse | **8/8, 0 parse errors, 0 instrument errors** |
| 3. Neutrality (determinism legs) | **GREEN** — seed 100861, 60d: recorder-on ≡ recorder-off ≡ recorder-on-again on days, endReason, deaths, final waveKillLog, standing, scaleRank, ready4/ready5 — and on-vs-on identical including the recorder rows themselves (`scripts/ammocensus-detcompare.js`, both exits 0). Proof test's in-process 20d legs agree. |
| 4. Proof test | **`scripts/test-ammocensus-a.js` 40/40 green** |

Analyzer: `scripts/analyze-ammocensus-a.js` on
`evidence/2026-11-15/perseed-ammocensus-a/` (8/8 files);
full output saved as
`evidence/2026-11-15/ammocensus-a-analysis.json`.
Determinism corpora kept as
`evidence/2026-11-15/perseed-ammocensus-a-det-{on,off,on2}/`.
Corpus run log: `evidence/2026-11-15/ammocensus-a-corpus.log`.

## The census — per-meeting numbers (133 wave-4 meetings)

A meeting is one `fieldFight` vs a wave-4 monster. Each
fighter and every ally present is classified at contact:
armed-with-ammo (ranged weapon + ≥1 unit of its ammo),
armed-no-ammo (ranged weapon, 0 ammo), unarmed (no ranged
weapon equipped).

### Fighters (the 133 leads)

| Class | n | Share |
| --- | --- | --- |
| armed-with-ammo | 23 | 17.3% |
| armed-no-ammo | 23 | 17.3% |
| unarmed | 87 | 65.4% |

**Among fighters carrying a ranged weapon (46), exactly half
(23, 50.0%) are dry.** The volley agrees exactly: volley
fired 23 meetings, `{shots:0}` 23 meetings, volley null 87
meetings — the three counts match the three classes 1:1.

### Everyone at the meeting (fighters + starting allies + called-help allies, 462 persons)

| Class | n |
| --- | --- |
| armed-with-ammo | 119 (fighters 23, allies 80, called 16) |
| armed-no-ammo | 95 (fighters 23, allies 52, called 20) |
| unarmed | 248 (fighters 87, allies 123, called 38) |

Among all 214 ranged-weapon carriers at wave-4 meetings,
**95 (44.4%) carry no ammunition for their weapon.**

### What the dry weapons need

Dry needs across all 95 dry carriers: **stone 72, arrow 20,
bolt 3.** The sling dominates the gap — three quarters of
dry ranged weapons are slings with no stones. Wrong ammo:
**0** — nobody carries the wrong ammunition type; the gap
is absence, not confusion. Of the 95 dry carriers, **56
have no melee weapon either** — their only weapon is a dry
ranged weapon.

Two structural shapes inside "unarmed": **58 unarmed
persons hold a spear in the ranged slot** (a melee weapon
sitting where a bow would go — the spearxbow slot
competition, live on this corpus), and **0 carry an
unequipped ranged weapon in the pack** (the "bow in the
pack" shape does not occur).

### The volley — the bow's whole identity

Fired in **23/133 meetings (17.3%)**: 66 shots, 30 hits,
593 damage. The other 110 meetings open with either the
honest dry line (23) or no ranged weapon at all (87).
Volley-a's 0/1179 is not a fluke of its band: on this fresh
band the bow fires about once in six wave-4 meetings, and
when it fires it is the only ranged damage in the corpus.

### The gate's all-armed bar — did it count ammo-less fighters as armed?

Gate rows (one `winPlanFightGate` call vs a wave-4 monster):
**19**, on only 3 of 8 seeds (100863: 13, 100864: 3,
100866: 3 — the other five seeds produced 0 gate rows; their
74 meetings were all wild, the gate never consulted).
Outcomes: seek 1, avoid:outmatched 9, null 9.

- Gate members: 29, all 29 gate-armed, all 29 effectively
  armed. **Ammo-less share among gate-counted-armed fighters:
  2/29 (6.9%)** — and both had a melee fallback (a dry sling
  + sharpened stick; a dry phase sling + worldbreaker maul).
- **Dry-only share among gate-counted-armed: 0/29 (0%).**
- **Gate over-count rate: 0/19 rows.** The gate never
  counted a dry-only fighter as armed in this corpus.
- The armed bar never bit at all: `gateAllArmed` was true on
  all 19 rows. The 9 avoids were all party-size (8 parties
  of 2, 1 solo — the bar demands 3), never the armed bar.

The finding's worry — an ammo-less villager counting as
armed for the gate — **does not fire on this corpus, but the
corpus cannot exonerate the gate either**: the gated subset
is 19 rows and heavily selected (expedition fighters are the
geared ones; the wild meetings where the dry fighters
actually are never reach the gate). The gate's `gearOf`
still never checks ammunition (read in code,
`src/js/win-plan.js`); the measurement says the over-count
did not happen here, not that it cannot happen.

## Per-seed table

| Seed | Days | End | Standing | MaxWave | Meetings | Gate rows | Fighter with-ammo / dry / unarmed | Volleys fired |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100861 | 127 | lost | 199 | 4 | 21 | 0 | 1 / 4 / 16 | 1 |
| 100862 | 150 | survived | 145 | 4 | 13 | 0 | 0 / 8 / 5 | 0 |
| 100863 | 150 | survived | 375 | 5 | 25 | 13 | 3 / 1 / 21 | 3 |
| 100864 | 99 | lost | 199 | 4 | 5 | 3 | 0 / 4 / 1 | 0 |
| 100865 | 150 | survived | 325 | 5 | 5 | 0 | 1 / 1 / 3 | 1 |
| 100866 | 93 | lost | 199 | 4 | 41 | 3 | 5 / 4 / 32 | 5 |
| 100867 | 103 | lost | 125 | 4 | 15 | 0 | 5 / 1 / 9 | 5 |
| 100868 | 150 | survived | 300 | 5 | 8 | 0 | 8 / 0 / 0 | 8 |

Seed 100868 is the outlier in the good direction (8/8
fighters with ammo); seed 100862 the opposite (0/8 with
ammo, 8 dry). Meeting outcomes pooled: vFlee 96, mFlee 14,
vDie 12, vKill 6, evade 5. Meetings by monster: reunion 41,
eulogy 31, influencer 21, herald 19, eater 10, suburb 3,
strike 3, audit 2, congregation 2, algorithm 1. Allies
present: 2 allies on 126/133 meetings — the fights are
nearly always fought as a trio at the instant, even though
the gate was consulted only 19 times.

## Wall numbers (this run's judged corpus, 8 seeds)

National (standing ≥ 200): **3/8**. Table 0/8, wins 0/8.
Wave 4 reached 8/8, wave 5 3/8. Median survival 138.5d,
survived 4/8. No movement on the wall; this is a DIAG, not
a lever, and it claims none.

## Sense-testing (SENSE-TESTING LAW)

The vetparty quotes do not recur by name — Koki and Devon
are not in this band — but the line shape re-occurs **23
times, once per dry fighter**, including Jesse, who was one
of the four #2064 fighters ("Jesse has Crude bow but no
arrows", seed 100862 day 129, reunion, twice that day and
again day 131 vs the audit).

- Seed 100861 day 50, reunion, Valeria Quispe (bow, 0
  arrows), vFlee after 3 rounds: "Valeria has Bow but no
  arrows — the string stays drawn, useless." She then
  strikes 18–19/round with the bow as a club (the melee
  fold-in) and withdraws at 63 HP: "Valeria has seen enough
  — withdraws to report back." The narration is honest
  about the range failure and about the retreat.
- Seed 100861 day 111, eulogy, Olivia Bennett: "Olivia has
  Sling but no arrows — the string stays drawn, useless."
  (Also day 119 vs the herald.) The sling needs stones, not
  arrows — **the line misnames the ammunition**. 7 of the 23
  lines do this (sling 5, crossbow 2): the #1592 mislabel,
  live and counted, 30% of the honest lines.
- Seed 100861 day 102, eulogy, Illapa: "Illapa has
  Crossbow but no arrows" — same mislabel, bolt weapon.
- Seed 100866 day 89, reunion, the corpus's only SEEK: the
  gate's party is a crossbow with 7 bolts, a spear-carrier,
  and Omar Farouk with a dry phase sling and a
  worldbreaker maul. The gate said seek because the maul
  counts — the sling's dryness never entered the decision.

Judgement: the dry line is honest that the weapon cannot
fire, and it fires exactly when it should (23/23 dry
fighters, 0 false positives on armed fighters). It
misnames the ammunition for slings and crossbows, and it
never says what the fighter actually needs. A dry-bow
fighter is not helpless — the bow still strikes in melee —
so "effectively unarmed at range" is the precise claim,
not "unarmed outright". The fight logs read like fights;
the ammo gap reads like a supply failure the village never
names aloud.

## Village assessment, in plain words

Every village in this band meets wave 4, and three of eight
reach wave 5 and national standing — but none wins, and half
the villages die. When a wave-4 beast arrives, the village
answers with whoever is standing there, and whoever is
standing there usually has no way to hurt it from range:
two thirds of the fighters carry no ranged weapon at all,
and of the third that does, half hold an empty one. The
sling is the worst of it — the most common ranged weapon in
the corpus is a sling with no stones. The bow's opening
volley, the thing that is supposed to make range matter,
happens about once in six fights. The gate that is supposed
to demand an armed party never once had to say no on
ammunition — it says no on party size instead, and it only
ever gets asked on three seeds. The village is not losing
wave-4 fights because it brings the wrong ammo. It is
losing them because it brings no ammo, and nobody — not the
village, not the gate — ever checks.

## Blanks filled or documented

- **Filled (#2405, #1486):** the census this arm was
  claimed for — measured rates above (fighter dry share
  50% among ranged carriers; 44.4% dry among all ranged
  carriers at meetings; gate-counted-armed dry share 6.9%
  dry-any, 0% dry-only; gate over-count 0/19 rows).
  Findings #2405 marked fixed; #1486 answered by the same
  numbers.
- **Documented, not fixed (DIAG — no game change):**
  (1) the gate over-count question is UNMEASURED, not
  answered — the gated subset (19 rows, 3 seeds) is too
  small and too selected to exonerate `gearOf`'s
  ammo-blindness; a future arm needs expedition-heavy
  seeds or a bigger corpus. (2) Sling-stone dominance
  (72/95 dry needs are stones) — the stone supply blank:
  are stones even obtainable/carried in the first place?
  (3) Spear-in-ranged-slot on 58 unarmed persons — the
  slot competition is live and may be suppressing bow
  equip. (4) The dry-sling/crossbow mislabel (#1592) —
  counted here (7/23 lines), still a cosmetic wording fix.
  (1)–(3) appended to `hidden_files/sim-findings.md` as
  open items.

## Metric review

The metric was the instrument's own validity, and it held:
133 meetings, 0 unclassified, 8/8 parse, determinism green,
proof 40/40 — DIAG-GO is unambiguous. Two notes for the
NEXT run, not re-scores of this one:

- The "unarmed" class is dominated by melee-armed fighters
  (58 of them hold a spear in the ranged slot; the rest
  mostly carry a melee weapon) — the class name overstates
  the gap. The prereg anticipated this: split "unarmed"
  into melee-armed vs truly-unarmed next run. The numbers
  here are reported as frozen; the split is a revision
  proposal only.
- The gate over-count rate was measurable only on the
  gated subset (19 rows). The prereg anticipated this too:
  the rate is reported on the subset, with its size named.
  The gate question stays open, not closed — a null result
  on 19 selected rows is not an exoneration.

No metric revision proposed beyond those two; the
instrument stands as frozen.

## Disposition

DIAG-GO per frozen bars. The instrument, analyzer,
detcompare, proof test, corpora (judged + determinism),
and this evidence merge evidence-only. **No game-code
change** — `git diff` over `src/` is empty; the arm's
commits touch only `scripts/ammocensus-*`,
`evidence/2026-11-15/sim-ammocensus-a-prereg.md`, and
this evidence file plus corpora. No confirm band spent
(this arm has no confirm band — single leg by design).

## Infrastructure

- Safe-commit index clobber struck on BOTH instrument
  commits (files staged-as-deleted + untracked after a
  correct commit); repaired both times via the ls-tree pipe
  (`git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info`), verified with `git status --short`
  empty + `git diff HEAD` empty + hash-object match.
- No write-flap strike during this run. No rebase (no
  rebase performed — the arm worked on its own branch from
  the registered worktree).
- Worktree heartbeated at run start and mid-run.
- check.js NOT run: this arm touches no `src/` code and no
  green-list test; the proof test is the arm's own gate
  (40/40) and it ran green. The coordinator's gate run
  covers the merge.
- No file the sibling arm sim-dawnbid-a needs was touched
  (only `ammocensus-*` names and this arm's corpus dirs);
  nothing to sequence at merge.
