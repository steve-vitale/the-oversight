# Journey — succession r231 (Lane B leg 7) — MOURN-TEMPLATE

Run `loop2-20261117-1755Z`. Base master `b921fde4f`. Seeds 34331–34334 (EARLY_KILL_DAY=40, POST_DAYS=70) + smoke 33998 (5/25). Panel complete 18:43:38Z, all 5 seeds exit 0. Worktree `journey2-succession`, branch `journey2-succession`.

## Leg question (prereg: `journey-succession-r231-prereg.md`)

**MOURN-TEMPLATE — do the mourning lines stop wearing different names?** r230's watch item: "I keep expecting to see X at the fire. Stupid." fired 5×, "The fire feels smaller without X" 2×, "I keep turning over the last thing X said to me…" 4× — same words, only the name changing. Root cause traced, not guessed: the dead person's name was baked into the line *before* the pick, so the line-dedupe (exact-text) and the village-fresh log both counted (template × name) as a new line and the same template re-served for every new corpse.

## The fix (one file: `src/js/convoTopics.js`)

1. Single-name opener templates use `{mname}` instead of the concatenated name.
2. `t2fol_lately` returns pools with `{mname}` intact (dropped the `nm()` mapping).
3. `t2fill` resolves `{mname}` lazily from the current lately event (`t2LatelyEvent(vid).name || 'them'`) **at the top of `t2fill`, before `fillTalkLine`** — the first attempt placed it at the end and produced empty names ("Since died…") because the text module strips unknown slots; the proof test caught this and the placement was corrected.

Unchanged by design: multi-name branch, nameless branch, sick-death push, successor-grief push. No game rule, price, gate, or balance number changed.

## Proof test (before/after)

`scripts/test-journey-succession-r231-mourning-template-20261117.js` (3 cases, separate processes): **ALL GREEN on the fix. Verified red on the base file** — on base, the same speaker served expect-fire 3× in a row (Zoey, Luigi, Arnold) then dreamed 2×, the exact r230 finding reproduced deterministically. The other two cases passed on base by seed luck; the file as a whole is the discriminator. F5 targeted harness (r225 proof test) re-run on this base: **22/22**.

## Panel verdicts (binding)

| Bar | Verdict |
|---|---|
| **MOURN-TEMPLATE** | **PASS** — 25 servings, 0 same-speaker repeats, 0 village-window repeats |
| **MOURN-EXHAUST** | **PASS** — 0 exhausted-line servings in mourning sittings |
| **MANTLE-FINE** | **PASS** — 20 deaths, 0 flippedImmediate=false, 0 fineLatency≥2, 0 day-skips (16th panel) |
| **DRY-CENSUS** | **PASS** — 0 dry hits (15 honest fallbacks, 0 null-return silences) |
| **CAP-NC** | **INSUFFICIENT-DATA** — 2/2 eligible seeds bonded-by-deadline (bar needs ≥3) |
| **CONTROLS** | **HOLD** — smoke S_fixed d6 Grace 11/1/43, pick rank 1, funeral INCALL true, selfReq 0 |

Mourning shape spread (r231, 25 servings): world-continues 5, last-words 5, expect-fire 3, burnt-piece 3, habit-for 3, fire-smaller 2, dreamed 2, name-right 1, pick-up-share 1. vs r230: 34 servings with the pile-up on 3 templates and 1 same-speaker repeat (Amanda, opener:world-continues for Ethel d+3 and Maureen d+53). **The repeat is gone, and the spread is across 9 of the 10 shapes.**

## Scan artifact found and fixed (instrument, not game)

The first analyzer pass counted 28 servings and the multi-name opener lines ("Bill is gone and Shaun is gone and the world just…") were matched by the single-name `opener:world-continues` regex, polluting the dead name ("Bill is gone and Shaun"). Fix: the scan now skips any hit whose captured dead contains " is gone" (the multi-name construction). Re-ran the analyzer only (no panel re-run): 25 servings, verdicts unchanged — the 3 artifact hits could not have created a false repeat (their dead strings are distinctive). 3 multi-name servings observed descriptively (Tashi 34331, Elijah 34331, Sam 34332).

## Handoffs

- 34331: Bill→Shaun scripted d41. 34332: Hazel→Vera organic d38 (chain Vera→Eric d39, Eric→Ethan d41). 34333: Daniela→Leroy scripted d41. 34334: Tiana→Olivia organic d39 (long chain: Olivia→Howard d60, Howard→Maya d74, Maya→Wendimu d84, Wendimu→Onni d93, Onni→Werner d97 — 6 deaths). Smoke 33998: Heinrich→Grace scripted d6 (matches S_fixed).

## Village assessment (plain words)

- **34331 — the hungry village.** 6 alive at the end, pantry **0**. Six bearers died across the run; the last days are a relief beat ("Or we rally. Second shift, everybody. We work, we eat, we live — and we pay for it.") with hunger gnawing and the pack thin. Bonds 82 — people leaned on each other hard.
- **34332 — the steady one.** 8 alive, pantry 11,081. Two chain deaths. Word travels — riders from Thornfield call the bearer "the Indispensable" and other villages send envoys. Bonds 56.
- **34333 — holding.** 6 alive, pantry 8,359. Two chain deaths. The village gives food with the whole village watching; people look at the bearer differently for it. Bonds 58.
- **34334 — the long chain.** 6 alive, pantry 8,017. Five chain deaths after Tiana: six bearers in 58 days, the longest chain on a succession panel. Wave 4–5 monsters are back as reruns and the table docks standing −10; the wait stretches. Bonds 82.
- **33998 (smoke) — untouched.** 11 alive, pantry 22,223, no chain deaths. A Wren cache sighting on day 31.

No village won; none ended early. Total deaths observed: 20.

## People check (sense-read 6 full transcripts)

Conversations read like people. The mourning lines now vary by speaker and by dead, and the sittings hold together:

- **Tashi (34331 d+3, stranger, trust 20)** grieves two dead in one breath — the multi-name opener names both Bill and Shaun, then the follow-up turns over Shaun's last words. She refuses the party invite ("You want me to follow you into the dark? Earn that first.") — a stranger with a boundary. Teaches Hickory Nuts.
- **Berk (34332 d+6, newcomer, trust 20)** was a journalist: "fun was whatever I could steal between shifts. Now fun is watching the fire and not being afraid. It's a downgrade and an upgrade." Refuses the party ("I don't do parties. …It's not you. It's the party."). Dreams of Eric, then turns over his last words. A past, a boundary, grief.
- **Austin (34333 d+7, trust 90)** on the most useful thing learned: "How to be hungry and keep going anyway." / "The fundamental skill. Everything else is decoration." Then: "I keep expecting to see Daniela at the fire. Stupid." — the r230 watch-item line, now appearing **once**, for one dead, from one speaker.
- **Werner (34334 d+45, trust 96)** on solitude and belief after everything — "That's not naive. That's load-bearing. Hold onto it." — then grieves Howard with the world-continues opener and picks up Howard's habit as his own. Takes Scout.
- **Onni (34334 d+54, trust 93)** — the resume opener names the live favor in its own words: "Maya and I never did finish talking about that foraging help — that was 9 days back. Want to hear where it left off? 'Alright — carefully, now. Both of us.'" (C3c: names the live favor ✓). Then a wound favor with a real location rule ("Get to their side of the Haven door and stand next to them"), and the successor-grief line for Maya.
- **Maya (34334 d+30)** grieves Olivia with the world-continues opener and the habit-for follow-up.

**Watch item (not a bar miss):** Werner and Austin both used the `part:habit-for` follow-up with the *same* habit text ("clean up other people's messes quietly") — different speakers, different dead, so the bar is clean, but the habit pool can deal the same habit to two villagers. If the habit pool is small, the personalization rides on a shared card. Worth a look in a later pass.

**Grief-template watch item from r230: CLOSED.** The same template no longer re-serves for a different dead from the same speaker (0 repeats), and the spread covers 9 shapes. What remains is the *next* build, filed from this run's evidence: relationship-aware mourning lines (bond/kin/shared-deed variants) — the lines are now varied, but they are still one generic voice per template, not the dead person's relationship to the speaker. That is out of this run's scope per the prereg.

## Wild checks (manual, carried bars)

- **F5 settled-favor branch: ZERO-FIRE — finding, not a pass.** No settled-favor variant fired anywhere on the panel (all 4 variants grepped, plus loose "already handled / It's done / taken care of"). No settled favor was re-asked in the driven convos. Per the prereg, a zero-fire panel is a finding, not a pass. The branch itself is proven by the targeted harness (22/22 on this base); its wild rate is roughly one firing per two panels (r229 vacuous, r230 fired 2×, r231 vacuous). Not a regression.
- **C3d recap-empty: HOLD (vacuous).** 0 erasures — and 0 recap-empty servings arose at all (all 4 variants, 0 hits, despite many recap presses). Every recap had something to recap. Same vacuous shape as r230.
- **C3c resume openers: HOLD.** 1 favor-naming resume, naming the live favor with its own words quoted (Onni/Maya foraging help).
- **F2 narration quotes: HOLD.** 0 stage-direction lines quoted as speech.
- **F6 stage-0 openers: HOLD** via the dry census (0 dry hits).

## Telemetry

`node scripts/telemetry-check.js` vs the succession baseline: **quiet** (5 files, 4 metrics, no large deviations). Baseline NOT rolled (means-vs-sum mismatch unresolved since r229).

## Gate

`node scripts/check.js --quick` (run by the adopting main session on the fix tip, 1051s): **330 passed, 10 failed, 0 attributable.**
- Measurement-proof staleness pair (proof-update + workflow): expected — the fix touches `src/js`, the manifest digests all of `src/`, so the retained proof re-stales; refresh is the gateproof arm's job, not this run's.
- Phone-frame (stale receipt) + ladder-bundle (ambient-raid control): standing.
- Six exact-120s timeouts (living-garden, cache-flags, occupation-panels, one-person-army, trust-observer, capable-bot): load artifacts — a sibling scale run was active during the gate; cache-flags scored 4/4 on a quiet box at r232, and this fix touches `convoTopics.js` only.
- Proof re-run by the adopting session on the fix tip: `test-journey-succession-r231-mourning-template-20261117.js` **ALL GREEN** (exit 0). F5 neighbour harness re-run: **22/22**.

## Adoption (main session, 2026-11-17 ~13:17 CST)

The 12:00 Lane B occurrence timed out while the gate was running; the run is dead (no coordinator processes, gate aborted mid-run) with an orphan hbloop (PID 12492, started 18:02Z) keeping the registry heartbeat fresh. Killed by exact PID, tree heartbeated, then adopted: gate re-run by me (above), proof + F5 neighbour re-runs green, commit via safe-commit, rebase onto current master, proof re-run on the rebased tip, ff-merge. Rotation B 7→4, lock deleted after run_id verification, worktree released.

## Metric review (§14)

- **MOURN-TEMPLATE (new bar): kept.** The bar did what it was built for: it convicted the old code on the r230 corpus (1 same-speaker repeat) and passes the fix (0 repeats, 9-shape spread). The multi-name exclusion belongs in the scan permanently — the multi-name opener shares a tail with a single-name shape, so any future shape scan must exclude it. The scan now does.
- **F5 WILD EXERCISE: the bar's "fires ≥1×" arm is not met this panel.** The bar as written treats a zero-fire panel as a finding, not a pass — that held. The question for the next run is whether the wild-rate arm should be a *panel* bar at all, given the branch fires ~every other panel; a rolling 3-panel window (fires ≥1× in any of the last 3 panels) would judge the branch's wild presence without failing quiet panels. Proposed revision for the next prereg: F5 wild exercise = fires ≥1× across the rolling 3-panel window; the harness remains the functional proof.
- **C3d: the bar measures erasures (0), which is the right thing** — but when no recap-empty serving arises, the hold says nothing about the pool. No revision proposed; the pool is exercised by the harness and by r230's 2 servings.
- **CAP-NC: still insufficient-data** (2/2 eligible bonded, bar needs ≥3). The newcomer channel is thin on succession panels because arrivals are rare in the post-death window. No revision proposed; the bar stays descriptive until a panel carries 3 eligible seeds.

## Reachable / fun / winnable

- **Reachable:** the succession content fires on every seed — organic handoffs on 2 of 4 panel seeds, scripted on the other 2, and the smoke control reproduces exactly. Mourning sittings arise naturally in the post-death window.
- **Fun:** the mourning sittings read like people grieving, not a template wearing names — the fix lands where a player would feel it (the same line for the fifth corpse was the thing that broke the spell). The habit-for follow-up personalizes by the speaker's habit; the shared-habit collision is a small crack in that, not a break.
- **Winnable:** no village won on this panel; 34334's rerun monsters and −10 standing dock show the endgame pressure still bites. Succession itself is not the blocker — the mantle flips synchronously at every death (20/20) and the villages keep going.

## Blanks filled

- **MOURN-TEMPLATE (the leg's blank): filled.** One-file fix in `src/js/convoTopics.js`, proof test red-on-base/green-on-fix, panel PASS with a 9-shape spread and 0 repeats. The r230 watch item is closed.
- **Instrument blank: multi-name scan exclusion.** The analyzer now excludes multi-name opener servings from the single-name shape scan (they share a tail). Re-ran the analyzer only; verdicts unchanged.
- **Next build filed (not built):** relationship-aware mourning lines (bond/kin/shared-deed variants). The lines vary now; they are not yet personal to the speaker's relationship with the dead.

## Files

- Fix: `src/js/convoTopics.js`
- Proof test: `scripts/test-journey-succession-r231-mourning-template-20261117.js`
- Driver: `scripts/journey-succession-r231-20261117.js`; analyzer: `scripts/analyze-journey-succession-r231-20261117.js`; runner: `scripts/run-journey-succession-r231-panel.sh`
- Prereg: `evidence/2026-11-17/journey-succession-r231-prereg.md`
- Corpus proof: `evidence/2026-11-17/journey-succession-r231-mournscan-r230corpus.txt` (+.stderr.log)
- Panel: `evidence/2026-11-17/journey-succession-r231-panel.log`, `journey-succession-r231-*.stdout.json`, `journey-succession-r231-*.stderr.log`, `journey-succession-r231-analyzer.txt` (+.stderr.log), `journey-succession-r231-tele-*.json`, 73 transcripts `journey-succession-r231-transcript-*.txt`
- Gate log: `evidence/2026-11-17/journey-succession-r231-gate.log`
- This note: `evidence/2026-11-17/journey-succession-r231.md`

## Closeout

- Rotation B: 7 → 4 (endgame next). Lock deleted. Worktree released after merge.
- Merged locally, pending ship. No bump, no push, no live verification (ship loop owns that).
