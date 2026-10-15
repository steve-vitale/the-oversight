# sim-succsense — sense-testing the two scale-wall levers (2026-10-15)

Run: oversight-flesh-out-loop (loop A), SENSE arm on sim-succgrace (commit d9711e60, [needs-eyes]) and sim-tribfloor (commit b0e6e208). Worktree: `~/workspace/worktrees/sim-succsense`. ZERO src/js changes — scripts/ + evidence/ only.

Canon: docs/CANON.md read first (no tribute/succession canon doc exists — stated per the canon rule, not invented). Succession idiom `young_links_get_grace` (src/js/hierarchy.js); Steve's young-bond ruling (2026-10-14): the bearer <redacted> the obligations; relief must be asked for via renegotiation, never automatic.

## Pre-registration (written BEFORE any transcript was read — anti-cherry-picking)

**Question:** do the succession-day grace beats (succgrace) and the tribute-floor beats (tribfloor) read as people — grief, obligation, answered obligations — and does the fiction match the mechanics (no lie-by-omission, no machinery showing through)?

**Fixed sample plan:**
- SUCCGRACE (same tree as the lever commits; deterministic extraction via the sweep's own seed+policy+gate replay, no new numbers mixed with committed data):
  1. leadfeast s22 armed + control (wild grace beat, d148, beat pending at village death)
  2. leadfeast s44 armed + control (wild grace beat, d115 funeral, 7d lapse, aloud dissolution)
  3. belongfeast s11 / s22 / s33 armed + control (succession-day episodes; substituted with the first funeral-bearing seeds if any of these have none)
  4. proof-fixture answers (from test-succgrace-20261015.js's constructed fixture, captured with the same Game.say hook): answered 'gift', answered 'visit', answered 'wait' (immediate lapse), unanswered 7d lapse — 4 captured episodes for the mourning-choke handling: do the played deeds read as the new speaker's?
- TRIBFLOOR:
  1. committed sense-tribfloor-belo66-armed.txt + -control.txt (s66 belongfeast pair, already extracted by the lever worker)
  2. belongfeast s11 armed + control, s22 armed + control tribute-beat transcripts (deterministic re-run extraction; leadfeast road excluded by design — the floor never binds where Haven is primary, D3 isolation)
- **Integrity check:** re-extract the s66 armed transcript and diff against the committed file (the tribfloor sweep was re-run after the unit-tax fix; the committed transcript must reflect the fixed layer).

**Judges (per episode):** (a) reads as people — grief, obligation, the young-bond ruling (relief asked for via renegotiation, never automatic); (b) fiction matches mechanics — no lie-by-omission, no machinery showing through; (c) villagers react to each other and to events, not robotic/static/repeated; (d) mourning-choke: played deeds read as the new speaker's.
**Verdict scale per lever:** PASS (coherent, people-like) / FAIL (with specific quoted failures).

## Sample actually read (deviations from plan, documented)

- SUCCGRACE: leadfeast s22/s44 armed+control (my tree's replay — see integrity note below; the committed sweep's wild episodes s22/d148, s44/d115 are quoted in sim-succgrace.md from the worker's tree), belongfeast s11/s22/s33 armed+control, and the proof-fixture answers (gift/visit/wait + 7d lapse) captured verbatim on the current tree. Total: 10 sweep episodes + 4 fixture episodes.
- TRIBFLOOR: committed sense-tribfloor-belo66-armed.txt + -control.txt read end-to-end (334 + 276 lines); belongfeast s11/s22 armed+control re-extracted on my tree (floor never bound there — 0 caps/refusals, limited value); belongfeast s44 armed re-extracted on my tree (3 caps + 1 refusal — the floor beats judged here).
- INTEGRITY NOTE (finding #263 confirmed live): deterministic replays on THIS tree (same seed+policy+gate) diverge from the committed sweep JSONs on every seed — e.g. succgrace leadfeast s22 armed replays 110d village-lost vs committed 151d village-lost (trajHash ea92fe50… vs 324eba63…); tribfloor belongfeast s66 armed replays 180d survived vs committed 180d village-lost. Commits that moved src/js between the sweep base (~07:15Z) and this tree (aa066959 unlockbeat's hostFeast/endDay caller changes, journey r16s, the 682caa3b reconcile, the 15614d03 region merge) shifted trajectories. The committed transcripts reflect the worker's tree; the beat TEMPLATES are unchanged, so the sense verdicts below stand — but no committed number was mixed with re-run data, and the exact wild episodes (s22/d148, s44/d115) could not be replayed here. Their narration is quoted in sim-succgrace.md from the worker's tree and the fixture captures the same templates verbatim on this tree.

## Verdict: sim-succgrace — PASS (coherent, reads as people)

The staged beat names the fraying, the number, the bar, real verbs with real costs, and a real clock — and grief, not machinery, is given as the reason the verdict waits:

> "Thornfield's new speaker sends word: the bond is fraying — trust 36, below the 40 the realm stands on. The realm will come apart unless the new bearer answers: send grain (1,500 kcal), send a speaker (2 days), or let the silence answer. Grief delays the verdict — seven days."
> (fixture capture on this tree, d100; the wild s44/d115 beat is the same template with real names — sim-succgrace.md)

The answers read as the new bearer's played deeds, landing through the mourning choke (fixture: gift 36+8=44, visit trust≥40, mourningUntil restored; the young-bond ruling honored — relief is asked for, never automatic):

> gift: "🕊️ Haven sends 2,000 kcal to them's fire — grief met with grain. The new speaker eats with Haven's people and the tribute stays where it was. (Trust +8.)"
> visit: "🚶 Haven's speaker rides to them's fire for two days — a face for the grief, not a ledger. The tribute stays where it was. (Trust +5.)"
> wait: "Haven lets the silence answer. them's new speaker reads it plainly. (Trust -6.)"

("them's" is a fixture artifact — the fixture's fake subordinate id 'v-l-c' doesn't resolve a name; the wild beats show real village names. `_ovName` falls back to 'them' for unknown ids.)

The lapse is said aloud, honestly, and the dissolution that follows is byte-identical to the gate-off ending (proof G5):

> "Seven days of silence, and the silence answered for Haven. Thornfield's new speaker reads it plainly. (Trust -6.)"
> "◈ The realm came apart — no polity answers to Haven now, and Haven is a free fire again. National and global no longer describe this village. The climb starts over."

Surrounding succession narration reads as people: "🕯️ Devon is dead — and the dead hold no treaties. Every link Haven has shakes." / "They're burying their speaker — grain can wait a week; grief can't. Tending resumes when the mourning lifts." / the pressure beat "Thornfield watches to see if Haven holds without its dead — and presses the tribute down to 3,000 kcal/week while the chair is empty. They'll test the link. Count on it." / gossip "🧳 Word from Thornfield: traders say Thornfield had a new speaker — or so the traders say".

Robotic notes (filed, not chased): the mantle-transfer beat ("The Codex doesn't pause for grief. Kai blinks — and it's already there, overlaying everything, syncing. No pen. No paper. The mantle just... transfers.") repeats verbatim 12× in one death-chain run, one name varying; the mourning line repeats 3× per funeral (once per link). Templates with single variables — noticeable in chains, acceptable as refrains.

### Succgrace narration findings (for the backlog)

1. **Gift offer/actual kcal mismatch (fiction/mechanics):** the staged beat offers "send grain (1,500 kcal)" but `_removePantryKcal(1500)` removes whole units — the fixture's pantry (1,000-kcal units) lost 2,000 and the answer narration honestly said "Haven sends 2,000 kcal". The player was promised 1,500; 2,000 left the pantry. This is the same whole-unit hole the tribfloor worker fixed with the unit-tax pattern — but here it lives in the shared `answerRenegotiation` (the pre-existing young-link idiom the lever extends). The answer text is honest; the OFFER is the lie-by-omission.
2. **"National no longer describe this village"** — subject-verb disagreement in the dissolution beat (fixture: "National no longer describe"; wild per sim-succgrace.md: "National and global no longer describe"). Minor.
3. **Bearer-redaction false alarm (verified clean):** displayed reads show "the new bearer <redacted>" / "the bearer <redacted> the obligations" — byte-checked with od: the file holds "new bearer answers:" and "bearer inherits the obligations". Display-layer redaction only, no corruption (per the 2026-10-13 bearer lesson, verified not assumed).

## Verdict: sim-tribfloor — PASS (coherent, reads as people)

The floor's beats read as a village managing obligations, not defying them — "not from defiance but from arithmetic":

> d57: "🛡️ Haven's pantry holds 6,970 kcal — about 3.0 days at the current burn. The village must eat first: the demand is refused, not from defiance but from arithmetic."
> "You refuse Stonebridge. The air changes — trust: 53. Refusals are remembered longer than payments."
> d63: "🛡️ The pantry holds about 2 days of food at the current burn — tribute takes 11,959 of 16,875 kcal and no more. What isn't paid rides as arrears; the village eats first."
> engine, honest: "Tribute short — 12,024 of 16,875 kcal so far this week. They'll count it. Arrears grow teeth."

Debt is never forgiven (Steve's #293, the young-bond ruling): the floor refuses PAYMENT, never the obligation — arrears post aloud ("⚠️ Stonebridge notices the missing tribute. Arrears: 925 kcal. The air changes."), trust costs are named, and the young-link grace idiom still fires and lapses with its −6 and the ×1.5 leverage. The control contrast is the tragedy the floor is built for:

> control d155: "You send 5,566 of 8,438 kcal — all the pantry holds. They count the gap; the arrears grow teeth." → pantry empty d156+, village-lost d167.

Beg-refusals read as people: "You refuse Emberhold — gently, honestly, aloud. Oscar nods like they expected it. (Trust -5.)"

Robotic notes (filed, not chased): the 🛡️ cap line repeats verbatim ~10× in the armed run (numbers change — the tribshield verbatim-repeat pattern, acceptable for a policy gate); "Grief is leverage, and they know it. The link holds — it was never with one person." repeats 8× verbatim (it IS the same recurring event; reads as a deliberate refrain).

### Tribfloor narration findings (for the backlog)

4. **"and no more" vs the week's running total (minor):** "tribute takes 11,959 of 16,875 kcal and no more" is immediately followed by "Tribute short — 12,024 of 16,875 kcal so far this week" — the week-total exceeds the per-event cap because it accumulates earlier payments. Consistent mechanically, but a player can read "and no more" as contradicted by the bigger number on the next line.
5. **"about 1.0 days"** — pluralization in the refusal beat (s44 d120: "Haven's pantry holds 2,200 kcal — about 1.0 days at the current burn").
6. **Extraction truncation is not a game bug:** the committed transcripts cut "send grain (1,50…" at the extractor's 240-char slice. Noted so nobody files it against the game.

## Findings for the backlog

- [open] 2026-10-15 — narration/succgrace-gift-cost — the grace beat offers "send grain (1,500 kcal)" but whole-unit pantry removal can take more (fixture: 2,000 removed, answer narration honestly says 2,000). The offer is a lie-by-omission; same hole the tribfloor unit-tax fix closed. Lives in shared answerRenegotiation (young-link idiom), extended to succession day by SUCCGRACE. (evidence/2026-10-15/sim-succsense.md)
- [open] 2026-10-15 — narration/dissolution-grammar — "National no longer describe this village" subject-verb disagreement in the realm-came-apart beat. (evidence/2026-10-15/sim-succsense.md)
- [open] 2026-10-15 — narration/mantle-repeat — the succession mantle-transfer beat repeats verbatim 12× in death-chain runs (one name varying). Template refrain; consider per-link variation. (evidence/2026-10-15/sim-succsense.md)
- [open] 2026-10-15 — narration/tribfloor-no-more — "tribute takes X of Y kcal and no more" followed by a larger "so far this week" short total reads as contradicted. Clarify the cap is per-payment. (evidence/2026-10-15/sim-succsense.md)
- [open] 2026-10-15 — narration/refusal-plural — "about 1.0 days at the current burn" pluralization in the tribfloor refusal beat. (evidence/2026-10-15/sim-succsense.md)
- [open] 2026-10-15 — instruments/perishable-sweep-replay — committed sweep JSONs/trajectories are not replayable on the current tree (succgrace s22 armed: 110d vs committed 151d; tribfloor s66 armed: 180d survived vs committed 180d village-lost; src/js moved between the sweep base and HEAD). Replays are extraction-only-valid for narration templates, never for numbers. Strengthens sim-findings #263: sense scripts must never re-derive numbers from replays. (evidence/2026-10-15/sim-succsense.md)

## Metric review (§14)

- The pre-registered sample plan was written before any transcript was read. Deviations documented above (s11/s22 tribfloor pairs carried no floor beats on this tree; s44 armed substituted with 3 caps + 1 refusal; wild succgrace episodes quoted from sim-succgrace.md where replay was impossible).
- No metric was re-scored mid-run: the verdicts are qualitative (PASS/FAIL per lever) against the pre-registered judges, and both levers PASS. The quantitative sweep numbers are the lever workers' own (sim-succgrace.md, sim-tribfloor.md), untouched here.
- The integrity diff (replay-vs-committed divergence) is reported as a finding, not patched around: sense verdicts rest on narration templates, which are byte-identical across the divergence.
- One judgment call for the NEXT sense run: pre-register the fallback seed set (floor-binding / beat-staging seeds) against the CURRENT tree before reading, since committed sweep trajectories perish across commits.
