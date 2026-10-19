# sim-windowsurvive — window-death attribution diagnostic (flesh-out loop, 2026-10-19, ARM sim-windowsurvive)

Run: fleshout-20261019T0415Z, arm sim-windowsurvive. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law + design call #4 combat-readiness
bar, villager XP law), docs/PRESERVATION.md (pantry defense relevance).
Named next #1 from evidence/2026-10-19/sim-w5census.md: ATTRIBUTE the window deaths —
18/21 door-reaching villages died IN the window (median 40d hold) on the pre-seat full
win-side stack; 0/32 open wave-5. The census named the window — not just the veteran leg —
as the lever surface: a veteran-production lever that doesn't keep the village alive
through the window produces better-fed corpses.

Substrate (this arm): the w5path substrate with VETREL=1 ON — policy
`withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))` on {leadfeast,
belongfeast}, SEATDRIVE=0, REPOSITION unset (inert), env
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
NODEWITNESS=1 VETREL=1 — composing with this run's vetrel1 arm (which re-measures the
w5path stall-path census with VETREL=1). Taxonomies are the vetwindow-identical
classifier (death-channel) plus the death tele's `wave` field (killer monster's wave) —
comparable to sim-fieldfightsrc (FIELD-EXPOSURE-DOMINANT: RAID 28.4% / EXPEDITION 68.9% /
WILD 2.7%), sim-vetwindow (8/8 veteran deaths scholar successions, 0/8 in-window), and
sim-winloss-a (3/5 non-winning runs end in THE SCATTERING, famine clock).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (diagnostic GO):** 16/16 runs window-attributed with a cause taxonomy that
NAMES the policy-side lever surface — which window deaths are addressable by window
support (the w5census candidate: field recovery for wave-4-engaged fighters, pantry
defense during deferral), measured against door-reaching runs' survival. The taxonomy
must name WHO (scholar successions vs villager attrition), WHERE (field channels),
WHAT (wave-4 monster verbs vs wave-3 vs mundane causes), WHEN (window day,
inter-death intervals), and STATE at death (pantry, armor, veterans, standing).
The veteran leg (0/16 satisfied?) and armor mortality are read jointly.

**DIAGNOSTIC MISS:** deaths unattributable (unattributed > 0 on died-in-window runs) or
the taxonomy shows no addressable surface (no window-support policy could reach the
killers). A miss is NO-GO, never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating; the honest surface for a
wave-5 question — pre-seat villages survive to ~140d median).

**Seeds:** 8 FRESH 63801–63808 (verified: zero filename hits in evidence//scripts;
content hits are pantry-kcal artifacts in other seeds' files, the loop convention) ×
{leadfeast, belongfeast} = 16 runs.

**Instrument:** scripts/probe-windowsurvive-20261019.js (daily window census + Game.tele
death capture with death-time state snapshots — pure engine reads; DET gate pins
instrument-on vs instrument-off byte-identical), scripts/analyze-windowsurvive-20261019.js
(window-death attribution; the w5census endRec-boundary fix carried over identically),
scripts/windowsurvive-transcripts-20261019.js (SAY-line probe with sysSay restored —
the w5census probe-artifact lesson), scripts/test-windowsurvive-20261019.js (proof:
classifier-parity + window + addressability fixtures, SMOKE, DET, attribution
completeness).

**No balanced panel** (§15): pure diagnostic, no lever, no before/after — the corpus
summary + taxonomy table are attached and the reason is noted here.

**No [needs-eyes]**: instrument-only, no player-facing change.

## Results

16/16 runs window-attributed, 0 bad files. 10/16 door-reaching; 9 died in the window (72 window deaths); median window length 78d. Wall on this substrate: national 11/16, table 15/16, wins 0/16, wave-4 13/16, wave-5 0/16, median survival 136d.

**Window-death taxonomy (72 deaths, 0 unattributed — diagnostic bar met):**
- WHO: scholar successions 42, villager attrition 30 — the scholar dies more than the village.
- WHERE: raid 40, wild 18, alien 5, expedition 4, other 4, disease 1. Raids are the #1 window killer (56%).
- WHAT: wave-4 9, wave-3 5, wave-1/2 4, non-combat/unknown 54.
- WHEN: mean window-day at death 46.1; mean inter-death gap 6d.
- STATE at death (means): pantry 28,469 kcal, hungry streak 0, living veterans 0, armored ~1, standing cap 271. They die rich and unequipped, not starving.
- Legs at stall: veterans short 16/16, armor short 16/16, weapons short 15/16.
- Addressable by window support: 63/72 (field combat 62 — wave-4 9, wave-3 5, mundane field 6; logistics 1).

**Verdict: DIAG-GO.** The taxonomy names the policy-side lever surface the w5census run asked for: window deaths are field-combat deaths (raids first, wild second), addressable by window support — field recovery for wave-4-engaged fighters and raid defense during deferral. The 63/72 addressable share is the named next lever's hunting ground. The non-addressable 9 are the honest remainder (contests, dehydration, cause-unmapped).

Full taxonomy: evidence/2026-10-19/windowsurvive-taxonomy.md. Corpus: evidence/2026-10-19/windowsurvive-corpus-summary.json.

## Metric review

The pre-registered diagnostic bar (0 unattributed on died-in-window runs + a named addressable surface) is met exactly: 0 unattributed, 63/72 addressable with the surface named by channel (raid/wild), wave (w4/w3), and state (full pantry, 0 veterans). No re-score needed — the instrument did what it was built to do. The killer-wave re-run subset (6/16) was not needed for the verdict; the 16/16 first sweep carries it.

**§14 honest metric doubts — for the NEXT run, not this one (the bar is met and the DIAG-GO verdict stands):**
1. **Killer-wave join is thin**: 54/72 deaths wave-unmapped; the 63/72 "addressable" leans on channel+cause, not killer identity. Harden the killer-wave join (name→wave mapping, combat-tele killer fields) before a winsupport lever sizes effects by wave.
2. **"Addressable" is a channel proxy, not a measured lever effect.** The winsupport arm must pre-register its own GO bar (window-death reduction on identical seeds) — never inherit 63/72 as an effect size.
3. **Death-count clustering**: successions cluster within runs (63808: 4 scholars in 3 days). 63/72 is not 63 independent saves; use per-run survival as the confirm primary.
4. **Base-relativity**: the sweep measured base 8433576dc. Master has since moved (sibling game-code: succession r26, crisis r25, deepening r19 — 98 insertions across 9 src/js files). A base-faithful re-run reproduces the sweep's death vectors EXACTLY (verified: 15/15 day:name identical on 63804, last-rec d167) and DET=1 passes 67/67 — the sim is deterministic; trajectories are base-relative. Re-sweep on current master before sizing the winsupport lever. (Same seed 63804 on master ends d136 with wave-4 reached vs d167/no-wave-4 on the sweep base — same seed, different code, different village.)
5. **The window is a leadfeast phenomenon** (door 8/8 vs belongfeast 2/8). Generalizing beyond leadfeast needs the door reached first.
6. **Transcript fidelity**: the first transcript pass ran on master and diverged from the sweep trajectories (63804 SAY ended d136 vs measured d167) — regenerated base-faithful on 8433576dc; the 3 committed transcripts align death-day-exact with the measured teles. Lesson: sense-testing probes must run on the sweep's base, or not at all.

## Village assessment

What the villages looked like: 16 villages on the pre-seat full win-side stack (leadfeast/belongfeast, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0). They are rich villages that die fighting. Mean pantry at window-death: 28,469 kcal; hungry streak 0 at 70/72 deaths. They reach national 11/16 and the table 15/16 — the scale wall's outer markers move on this substrate — but wins 0/16, wave-5 0/16. The door (deferral-5) is a leadfeast phenomenon: 8/8 leadfeast reached it (first d57–d107), 2/8 belongfeast (d74, d113). Nine of ten door-reaching runs died inside the window (median window 78d); the tenth (leadfeast-63803) regressed out of deferral at d158 and died at d174 anyway — the only run to leave the window alive, and it still didn't survive.

Who thrived and who died and why: the scholar dies more than the village — 42 scholar successions vs 30 villager deaths across 9 died-in-window runs. The scholar is the combatant of last resort: raid deaths carry ctx scholar-fight-at-haven (defending Haven) and aid-crisis (answering crises in the field). 63808 is the extreme: 4 scholars in 3 days (d69–d71) — Jesse falls in a 40-round televised Murmur fight, the mantle passing Luz→Sophia→Mario as each dies. Wave-4 kills 9 (aid-crisis/expedition), wave-3 kills 5; the rest mundane field combat. The village doesn't starve — it bleeds out in field combat, raids first (40/72). Missing at every window death: veterans (0 living at all 72 deaths), armor (~1 armored fighter), weapons — legs short 16/16 on veterans and armor at stall.

What the village does while its scholars die: it functions. Transcripts show villagers teaching each other (Quinn taught everyone about Açaí — "The Codex grows without you lifting a finger"), leaving wood "No announcement. That's how it works here.", debating newcomers ("One more pair of hands.", 84% for), gossiping stories bigger by the fire, staring down monsters while the scholar is away. The community is alive; its leadership is being ground down in the field.

## Sense-testing (SENSE-TESTING LAW)

Read: 3 base-faithful transcripts — leadfeast s63804 (13,653 SAY lines, d55–167), s63806 (13,955), s63808 (8,514) — generated on the sweep's base 8433576dc; death announcements align day-exact with the measured teles.

**Deaths read as meaningful tragedy, not counters.** Every death fires the liturgy: Codex page-turn ("You didn't ask. It knew."), "🕯️ X is dead — and the dead hold no treaties. Every link Haven has shakes.", tribute renegotiation (Emberhold/Stonebridge/Thornfield each press tribute down 1,688–3,000 kcal/week "while the chair is empty"), "The village's quarrel was with X — and X is dead" (social ledger cleared), mantle transfer ("You'll have to earn this face.", +5 trauma, "The audience CRIED"), grave scenes, and "N open questions closed unanswered" — Jada's alien-contact thread (d61: "watch the northern treeline") dies with her on d111. Consequences are mechanical AND narrative.

**The dehydration death is coherent, not a bug.** Jada (d111, pantry 90,776) died dehydrated in the field after 8 days away from Haven ("You camp wild tonight — no pantry meal. Eat from your pack."; "You come home after 8 days"). The taxonomy's pantry figure is the village store, not her pack. The "die rich" finding has its fiction explanation: scholars die in the field while the village's stores sit full at home.

**Monster fiction justifies mechanics (wave law).** The Eulogy narrates your death ("...they ended." — "you die as narrated"; counter telegraphed: "Contradict it — do the opposite — or give it a better ending"); The Gavel holds trials ("THE ACCUSED WILL RISE... Object — cite precedent · Demand recess · Confess first"); Big Big the contract horror (Binding Arbitration — "moving won't dodge it"); The Murmur deliberates (loved/hated actions buffed/suppressed live). Wave-2 conceptual horror: met.

**Villagers act like people.** Monster-naming arguments ("Henry is calling it 'Big Big.' They'll fight it out"), mutating gossip ("barely the same story now. That's what fires do"), inter-village succession crises (Stonebridge: "Dmitri is dead, and the fire's got two mouths arguing over it... asking Haven to back a claimant"), the night-gorge choice (The Eulogy gorges at the treeline — endure or sortie), "Vex Marlowe is in the audience tonight... bored hunters improvise."

**Blanks (robotic/static):**
1. Mass-casualty grief templating repeats verbatim per death — "Nobody's talking much. The fire feels smaller tonight." ×5 in one fight; the 3-village tribute-press block repeats identically per scholar death. Noticeable in cascades.
2. "The village's quarrel was with X" fires even with no quarrel on record — boilerplate.
3. "Someone in your party saw it happen. X is dead. They tell you straight." — fine once, repeated per death in cascades.

Verdict: the fiction earns its deaths. The window kills read as tragedy with real costs, not silent counters.

## Named nexts

1. **sim-winsupport — GO** (coordinator-contingent on this diagnostic naming an addressable surface; it does: 63/72). Concrete surface: (a) **field recovery for wave-4-engaged fighters** — 9 wave-4 combat deaths, all aid-crisis/expedition ctx; scholars answer crises personally and die there; (b) **raid defense during deferral** — 40/72 raid deaths, scholar-fight-at-haven the dominant ctx; the pantry draws the raids and the scholar defends it. Pre-register per-run window survival as primary (clustering — metric doubt #3); re-sweep the baseline on current master first (doubt #4).
2. **belongfeast door-reach gap** (2/8 vs 8/8): why the same substrate reaches deferral-5 on leadfeast and stalls on belongfeast — out-of-arm finding appended, not chased here.
3. **Killer-wave join hardening** (instrument): 54/72 unmapped — needed before any wave-sized lever claim.
4. **Mass-casualty grief templating** (content blank): vary the death liturgy under cascades — out-of-arm finding appended.

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chased — staying on the diagnostic.)
- belongfeast door-reach asymmetry (2/8 vs leadfeast 8/8).
- Sibling game-code landings move sim trajectories substantially — re-sweep baselines after game-code landings before sizing levers; sense-testing probes must run on the sweep's base.
- Mass-casualty grief templating repeats verbatim (content blank).

## Convergence

**converging.** The diagnostic answered its question (DIAG-GO: 16/16 attributed, 0 unattributed, 63/72 addressable with the surface named by channel/wave/state) and hands the coordinator a GO winsupport arm. The axis stays converging: wins 0/16, wave-5 0/16 on this substrate. Flag for coordinator/tracker: national reached 11/16 and table 15/16 on this pre-seat stack — the STANDING DIRECTIVE's lift condition ("a run demonstrates national reached in sims") is arguably met on this substrate; lift is a coordinator/Steve call, not this arm's.

## Files

- scripts/probe-windowsurvive-20261019.js — sweep probe (daily window census + Game.tele death capture with death-time state snapshots; DET gate)
- scripts/analyze-windowsurvive-20261019.js — window-death attribution + taxonomy + corpus summary writer
- scripts/windowsurvive-transcripts-20261019.js — SAY-line probe (sysSay restored; base-faithful)
- scripts/test-windowsurvive-20261019.js — proof: classifier-parity + window + addressability fixtures, SMOKE, DET, attribution completeness — 65/65 pass, DET=1 67/67
- evidence/2026-10-19/perseed-windowsurvive/{leadfeast,belongfeast}/s63801–s63808.json — 16 per-seed sweep JSONs (base 8433576dc)
- evidence/2026-10-19/windowsurvive-corpus-summary.json — corpus summary (analyzer output, byte-identical on re-run)
- evidence/2026-10-19/windowsurvive-taxonomy.md — full taxonomy + row-by-row table + per-run table
- evidence/2026-10-19/windowsurvive-transcripts/leadfeast-s63804.txt — 13,653 SAY lines, d55–167, death-day-exact vs measured teles
- evidence/2026-10-19/windowsurvive-transcripts/leadfeast-s63806.txt — 13,955 SAY lines, d59–159
- evidence/2026-10-19/windowsurvive-transcripts/leadfeast-s63808.txt — 8,514 SAY lines, d54–139
- evidence/2026-10-19/sim-windowsurvive.md — this file

## Recovery notes (run fleshout-20261019T0615Z)

The 0415Z coordinator died after landing the quantitative analysis (ab8110e32, merged to master as 24c8e1364) but before the sense-testing and assessment sections were written — and the sim-windowsurvive worktree was removed on landing. This recovery run: verified the landed numbers independently (analyzer re-run byte-identical; base-faithful probe re-run reproduces death vectors exactly; proof 65/65, DET=1 67/67), generated 3 base-faithful transcripts on the sweep's base, read them under the SENSE-TESTING LAW, and completed the evidence file. Recovery work was done in a fresh tree (sim-winsurv-rec) since the original tree no longer existed; no collision — registry shows sim-windowsurvive done-merged.
