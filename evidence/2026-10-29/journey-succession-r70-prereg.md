# Journey succession r70 — EXPANSION BAND + ANALYZER EAGER FIX (lane B, leg 7, pre-registration 2026-10-29)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
Base: master 583d09c05. Instrument only. ZERO src/js changes.
No dedicated succession canon doc exists in docs/ (CANON.md read; mantle
behavior is carried by the r54–r67 run lineage + CONVERSATIONS/PARTY docs).
Nothing is invented here; the Steve-call from r67 (widen the diegetic-act
exemption to teach/favor vs vary the shared lines) is NOT decided by this
run — it stays Steve's call, and this run adds expansion-seed evidence for it.

## The question

r67 traced the sibling seam on the 4-seed pilot (26131, 26132 chain-forced;
26134, 26135 controls): 5/5 joined sibling deflections SAME-CLASS run-block,
carried invite 25/25 spoken (24 table + 1 hand-judged OTHER), chain bonds
19/19. Two things were left open by r67's own prereg and run note:

1. EXPANSION: the full r56 band is 26131–26136. Seeds 26133 (chain-forced)
   and 26136 (control) never ran under the r67 SAYTRACE driver. r67's
   prereg allowed expansion only if the pilot was opportunity-0 — it was
   not (5 deflections), so expansion did not happen there. This run runs
   exactly those two seeds, same driver, same regime.
2. ANALYZER GAP: r67's one OTHER invite outcome (Carlos, 26135 d+3,
   "Finally. I was wondering when you'd see my value.") is one of the 3
   BACKSTABBER eager-accept lines (party.js betrayalIntent path). The
   analyzer's YES table covers only the 4 standard accepts, so it was
   hand-judged. This run adds the 3 eager cores to YES (substring match,
   as the standard lines already are) and re-runs the seam tables over
   r67's corpora to prove the reclassification is exact.

## Instrument

- Driver: r67 driver verbatim → r70 (names, date, EVID mode only:
  `journey-succession-r70-20261029.js`). SAYTRACE unchanged.
- Analyzer: r67 analyzer verbatim → r70 (SEEDS=[26133, 26136], r70 file
  prefixes) + YES extended with the 3 eager cores:
  'Yes. Absolutely. I\'ve been hoping you\'d ask.',
  'Finally. I was wondering when you\'d see my value.',
  'I\'d love to. Lead the way.'
  (Cores, not full lines: the transcript lines carry parenthetical asides
  and quote marks that stripQ does not remove mid-line; substring match
  is the analyzer's existing YES mechanism.)
- Eager recheck: the r70 analyzer's seam tables run over r67's corpora
  (r67 prefixes, r67 seeds) as a read-only recheck script, proving the
  YES change against already-landed evidence before it judges r70.
- Proof test: `scripts/test-journey-succession-r70-eager-yes.js` asserts
  the 3 eager transcript line shapes classify accept, and that declines,
  deflections, and standard accepts are unchanged by the YES extension.

## Seeds, regime, policy

- 26133: chain-forced (SECOND_KILL_DPLUS=20). 26136: control (0).
- Competent policy, POST_DAYS=45, EARLY_KILL_DAY=40 (r67 regime verbatim).
- PILOT FIRST (§9–12): this IS the expansion pilot (2 seeds). No further
  expansion: the r56 band is exhausted after these two seeds.

## Binding verdicts (§14 — a miss is NO-GO, never re-scored)

- EXPAND-TRACE (binds): SAME-CLASS iff ≥1 joined sibling deflection on
  expansion seeds is RUN-BLOCK (sayLine fellBack, preRun, no exemption).
  MIXED if classes split. DIFFERENT if all joined are DLG-DIRECT or
  SELF-BLOCK. 0 sibling deflections = INSUFFICIENT-DATA (opportunity-0),
  never TRACED-by-absence. UNJOINED deflections listed, never folded in.
- EXPAND-INVITE (binds): GO iff 0 deflected invite outcomes across
  expansion seeds. Any deflected invite = OPEN (regression), named.
- EXPAND-CHAIN (26133 only, reported): second-handoff bond survival
  counted from the analyzer's carried sections; GO iff no bond wipe
  (all second-successor bonds survive, as r64/r67's 19/19); any wipe
  outranks the trace question and is named.
- ANALYZER-EAGER (binds): GO iff the r67-corpus recheck moves EXACTLY 1
  outcome (Carlos 26135 d+3) from OTHER → SPOKEN-accept and changes no
  other outcome's class. Any other movement = NO-GO, analyzer fix held.
- PEOPLE CHECK (binds): every expansion transcript read in full
  (bounded set: 2 seeds × checkpoints); 0 fabrication flags or named.

## What would count as an interesting finding

- A DIFFERENT or MIXED trace class on expansion seeds (would break
  r67's SAME-CLASS picture and reopen the handler question r67 closed).
- A deflected invite on expansion seeds (seam reopened after the shipped
  fix-all C exemption).
- A chain bond wipe on 26133 (would outrank the trace question).
- Any eager-line reclassification beyond Carlos (analyzer overreach).
