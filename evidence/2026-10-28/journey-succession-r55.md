# Journey succession r55 — SUCCESSOR RELATIONSHIPS + HISTORY CARRYOVER (lane B, 2026-10-28)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26121–26125
(fresh band), competent policy, mixed regime: 26121–26122 scripted day-5
kills, 26123–26125 mature (EARLY_KILL_DAY=40, staging aspiration),
45-day successor window. Instrument only, zero src/js changes. Base
master@ca1cd93aa at branch point (main tree read master@f1308714c at
preflight; sim-onceaday-scope-b landed between preflight and worktree
registration; lane A's journey-scale r47 and the sim-food-economy
coordinator evidence landed during the run and were rebased in before
the merge — both zero-src/js additions, proof + regression re-run on
the rebased tree). Merged locally, pending ship (no bump/push/live
check — ship loop owns those).

Pre-registration: evidence/2026-10-28/journey-succession-r55-prereg.md
(written BEFORE any run). Instrument: scripts/journey-succession-r55-20261028.js
(r54 driver + REL snapshots + bond-partner convos) + analyzer + proof test,
all new files in this commit. NO FIX in this run, by decision (documented for
overrule): tackle-succession (oversight-tackle-all) owns the succession
inheritance build; this run delivers its relationships/history BASELINE on
master. A competing Lane B succession change would collide with that
workstream (same no-compete decision as r54).

## HEADLINE

The taken-over villager arrives mid-web, not socially blank — and the web
survives the mantle pass untouched. Every bond the successor held as a
villager is still there after takeover, with the same warmth, and the
world's affinity score for them does not move at all. What does NOT
survive is the story of the web: nobody in conversation names the bond
or a shared past, because the bond ledger stores no shared events — so
the successor meets warm strangers-with-history, not friends who
remember. And the dead never leave the ledger: a dead bearer's bonds
stay in the book to the end of the window.

1. BONDS SURVIVE TAKEOVER COMPLETELY: 45/45. Every successor bond present
   before death is present at handoff (26121: 8/8, 26122: 10/10, 26123:
   8/8, 26124: 8/8, 26125: 11/11), and pairAffinity to every living
   villager is byte-identical pre vs post on all five seeds (top scores
   29, 29, 41, 46, 40 unchanged). New bonds keep forming after takeover
   (d+14/end counts meet or beat pre on every seed). The machinery is
   faithful; if a takeover still feels blank, the gap is narrative, not
   ledger — see finding 5.
2. THE DEAD NEVER LEAVE THE LEDGER (phantom bonds). Dead-bearer bonds
   linger post-handoff and at window end: 26123 Dominic 3, 26125 Amara 1
   (4 total, unchanged post→end). Chained 26121 shows the same for the
   mid-window dead: Esther's bonds still number 9 at end, after her own
   death. bondAdd refuses NEW bonds with the dead, but nothing prunes
   old ones. Talk dodges the phantoms (convoTopics' close-read skips
   dead partners), so no ghost ever speaks — but the book keeps them.
   Ledger hygiene (prune vs dodge) is a question for tackle-succession,
   not a talk bug found here.
3. PLAYING BUILDS ALMOST NO BONDS. The dead bearers — who spent their
   whole tenure as the player — held 0, 0, 3, 0, 1 bonds at death, against
   the successors' 8–11 bonds built as NPCs. Whatever builds bonds
   (meals, visits, feasts) mostly happens between villagers while the
   bearer is out playing, not with the bearer. A long-played bearer
   can therefore feel less socially embedded than the villager who
   replaces them. Carried as a question, not ruled: is thin player-era
   bonding intended (the bearer is away, after all) or a missing path?
4. DEEDS-AS-NPC ARE PRESERVED EXACTLY AT HANDOFF. Person-entry deeds:
   Owen 8/8, Catalina 2/2, Wanjiru 7/7 (pre = post, same texts, same
   days — cache finds, monster stand-downs, a taught snare). Codex
   village-memory rows match too (8, 2, 7). The young seeds are the
   honest zero case: Esther has NO person entry at day 5 (nothing
   recorded, not wiped) and Miguel's entry holds 0 deeds. At window end
   the person entries still hold (8, 2, 7) while codex rows roll off
   under the 40-row cap (Owen 8 → 0, Wanjiru 7 → 3) — roll-off, not loss,
   reported with that caveat and never scored as loss.
5. CLOSE FRIENDSHIP IS RARE AND LATE. Only the mature seeds ever reach
   the game's own "close" line (ledger depth ≥ 2): Vincent reaches depth
   2 by end on 26123, Andres depth 3 (v 88) on 26124; Mai stays depth 1
   on 26125. The young villages have no close friends at all at day 5–6
   (top depths 0, warmths 8 and 20). So early in a run, the successor's
   "best friend" is an acquaintance — and the close-voice the ledger
   promises mostly does not exist yet. That is pacing, not a bug, but it
   bounds what the people check can show early.
6. VOICE: WARM, GRIEVING, BUT NEVER "WE". Partners grieve the predecessor
   by name (Mai: "Since Amara died... I keep expecting to see Amara at
   the fire"), tell their own histories (a taken grandmother, a stood-down
   Rut King), and end resolved. But no line names the bond itself or a
   shared past with the successor — the ledger stores no shared events,
   and convoTopics says so outright, so talk invents none. Honest, not
   fabricated. Recurring seam, same class as r54's Miriam teach drop:
   follow-up requests dissolve into "Sorry, lost my train of thought"
   (Mai's invitation, Andres's "tell me about them"). Documented for
   gap-social / tackle-all, not fixed here.
7. GRIEVANCES CAN BE RECORDED AGAINST THE DEAD. On 26121 and 26122,
   grievances involving the original successor rise 0 → 3 by window end
   — on 26121, after Esther herself has died mid-window. recordGrievance
   checks no roster. Small seam, documented: the dead can keep
   collecting grievances.
8. VANISHED ITEMS (carried INH): 3, all sentimental-class under the
   death-pack rule (26122: search_locket, hoodie; 26124: dog_tags) —
   the explained class from r54, not succession loss. "Transferred"
   ids remain presence-not-identity (r54 metric review stands): the
   successor already owned those types.
9. MATURE STAGING BROKE THE STREAK. 3/3 mature seeds staged their
   scripted day-40 kills this band (0 organic pre-emptions), against
   9 organic pre-emptions in the 12 mature seeds of r50–r54. The day-40
   regime staged for once. Regime variance, not a rule change — but the
   streak is over, and the next band decides whether r55 or r50–r54 was
   the outlier.

## Village assessment (plain words)

All five villages lived through the 45 days after the mantle passed —
nobody scattered, nobody starved out. Vito's village (26121) had the
roughest run: Vito died day 5, Esther took over, then Esther died in the
arena and Emilio took over, then Emilio died in the arena too and Fatima
picked it up — three bearers, all arena deaths — ending with 8 alive and
a comfortable pantry. Aidan's village (26122) was quiet: Aidan died day 6,
Miguel held it the whole window, 10 alive, pantry full. Dominic's village
(26123) lost Dominic day 41 and Owen held it, 9 alive, but the pantry
thinned to 11,906 kcal at window end — the one to watch, alive but
leaning hungry. Keisha's village (26124) lost Keisha day 41, Catalina
held it, 10 alive, pantry fine. Amara's village (26125) lost Amara day 41,
Wanjiru held it, 10 alive, pantry fat at 53,288. Nobody's story stopped
because the bearer died; the villages bend and keep going.

## People check (full transcripts read)

Three full transcripts sense-read; villagers act like people in this
leg's windows, with the seam in finding 6.

- 26125 d+3 Mai (bond-partner convo, depth 1): the strongest in the band.
  Mai opens with a real want (news of the taken, her grandmother Diwa),
  grieves Amara by name twice, and ends resolved ("This was good. They
  mean it."). The invitation the driver offers dissolves ("Sorry, lost
  my train of thought") — the documented seam.
- 26123 d+3 Vincent (Owen's closest, depth 1): a real back-and-forth —
  earliest memory, a guarded secret (pottery instructor, not lifeguard),
  a held line ("I told you the truth. You can keep poking it, but it's
  told."), a warm ending. No bond-naming, no shared past — honest per
  the ledger's no-events design.
- 26124 d+14 Andres (Catalina's closest, depth 1 rising to 3): warm and
  personal (stood down Rut King at the treeline, still hears it at
  night), ending "Come back anytime." The "tell me about them" follow-up
  drops to the lost-train-of-thought seam.

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- REL-READABLE: GO — 5/5 full REL snapshots (pre same-day on all
  scripted seeds, post, d+14, end all present).
- REL-BONDS (reported): 45/45 survive to handoff; dead-bearer phantoms
  4 post, 4 end; player-era bonds 0, 0, 3, 0, 1 vs NPC-era 8–11.
- REL-DEEDS (reported): person deeds pre = post on all seeds (8, 2, 7,
  0, NO-ENTRY); codex rows pre = post (8, 2, 7, 0, 0), end roll-off
  caveated.
- REL-VOICE (reported): grief-by-name and warmth present; bond-naming
  absent by ledger design; dropped-request seam on 2 of 3 reads.
- SCRIPT (young staging): GO — 2/2 day-5 seeds staged the scripted kill
  (26121 d5 Vito→Esther, 26122 d6 Aidan→Miguel; same day-6 landing as
  the proof seed on 26122).
- MATURE staging rate: 3/3 scripted, 0/3 organic pre-emption.
  Scripted-or-organic honored on all seeds (GO per the prereg).
- V1 (vouch snapshot): mature seeds PASS-fired 3/3; young seeds
  n/a-none-eligible (expected, trust <60 at day 5–6). No
  FAIL-alive-silent anywhere.
- C1v3 (transition rule, binds): GO — 38 transitions, 0 missing
  (11 + 0 + 1 + 16 + 10).
- W1d-tightened POOLED HEADLINE (binds): GO — 8/9 = 0.89 ≥ 0.5
  (26121 subset-empty named, 26122 subset-empty named, 26123 0/1 —
  the single non-donation direct transition, entryD71 66→96 — 26124
  6/6, 26125 2/2).
- S1 (bearer-own delta, carried): GO — 0 missing bearerDeltaExact,
  0 bad solo (|delta| ≤ 2 everywhere).
- MG2v2 (meal-line only, binds): GO — 0 violations, 45 audit days
  per seed.
- M3v2b (social echo, carried): 5/5 seeds ≥ 2 (3, 3, 3, 5, 8).
- M1/M4: GO on all five. Chain mantles: 2 chains, both arena deaths,
  both cause-known (26121 Esther→Emilio, Emilio→Fatima).
  Identity trips: 0 grief-excluded everywhere.

## Fun / reachable / winnable (leg verdict)

- REACHABLE: yes — every seed staged a mantle pass (scripted this
  band) and a full 45-day successor life without any driver intervention
  beyond the competent policy.
- FUN: yes, with the known texture — successor lives are continuous
  with the village's story (grief by name, a best friend who is already
  the person you talk to most, deeds from their villager days still in
  the book), not a reset screen. The thin-pantry village (26123) and
  the triple-arena village (26121) are the leg's best drama.
- WINNABLE: the leg doesn't gate the win, but nothing in this band
  blocks progress toward it — successors climb, villages warm, the
  codex only grows, bonds only deepen. No NO-GO.

## Blanks filled or documented

- FILLED (instrument): successor relationships + history are now
  measured — the r55 driver/analyzer/proof test are the baseline
  tackle-succession asked for (item 5's "relationships/history" half;
  r54 covered items/knowledge/skills).
- DOCUMENTED, NOT FIXED: (a) dropped-request seam (invite / tell-me
  follow-ups → "lost my train of thought"), for gap-social/tackle-all;
  (b) grievances recordable against the dead; (c) thin player-era
  bonding (question, not ruling); (d) phantom-bond ledger hygiene
  (prune vs dodge — dodge works in talk); (e) 26123's thin pantry
  (11,906 kcal at window end) — watched, not a crisis this run.

## Metric review (§14)

1. REL-END IS FINAL-BEARER STATE ON CHAINED SEEDS. On 26121 the window
   ends with Fatima as bearer, so relEnd's successor-keyed columns
   (Esther's bonds/groups/person deeds at "end") describe a dead
   woman's ledger row, not a living successor. The pooled
   survived-to-end counts therefore mix live + phantom rows. The
   handoff columns (pre vs post) are the clean comparison and are the
   ones the headline quotes; end columns are reported per seed with
   this caveat. Future runs should snapshot relEnd keyed to the
   window's ORIGINAL successor AND the final bearer separately.
2. BOND-CONVO SKIP IS CORRECT BEHAVIOR, NOT A MISSING INSTRUMENT. Zero
   extra bond convos on 4 seeds because the strongest-bond partner was
   already among the top-2-by-trust at that checkpoint (26121 Luis,
   26122 Ellis, 26123 Vincent, 26124 Andres — verified per seed from
   convoReads). The voice question is therefore answered from those
   top-2 transcripts plus Mai's two dedicated bond convos on 26125.
   A side finding: the trust-sorted top-2 already surfaces the closest
   friend in 4/5 villages.
3. TELEMETRY LOUD ARTIFACT, NOT A DEVIATION. The first telemetry run
   used metrics absent from the sparse baseline (5 keys, early-run
   vintage), so every one printed "newly appeared: baseline 0 -> N".
   Re-run on the baseline's own 5 metrics is quiet (5 files, no large
   deviations; census.alive sum 47 vs baseline 49, deaths.bearer sum 7
   vs 5 — the 26121 double chain — both inside tolerance). Baseline
   NOT rolled, same discipline as r52/r53.
4. CODEX END ROWS ROLL OFF UNDER THE 40-ROW CAP. End codex counts
   (Owen 8 → 0, Wanjiru 7 → 3) are cap roll-off through 45 days of
   village deeds, not succession loss. Person entries (uncapped at 12
   per person, oldest-first trim) hold. End codex numbers are never
   scored as loss.
5. INH "TRANSFERRED" REMAINS PRESENCE-NOT-IDENTITY (r54 review stands).
   Disposition ids are types, not serials; a dead-bearer type already
   owned by the successor counts as present without any transfer.

## Regression + proof

- Proof test scripts/test-journey-succession-r55-instruments-20261028.js:
  51 PASS, 0 FAIL (RED: r54 driver lacks all rel fields; GREEN: r55
  driver emits relPre/relPreDeath/relPost/relD14/relEnd, bond arrays,
  person-deed no-creation rule, tele counts matching raw arrays).
  Proof scratch (seed 24999 transcripts/tele) deleted after the run;
  the proof log is committed as journey-succession-r55-prooftest.log.
- Regression: node scripts/check.js --only succession
  --cacheDirectory=/tmp/jest-cache-playtest2: 11 passed, 0 failed.
- Telemetry: baseline's own metrics quiet; no baseline roll.
- Full evidence: repo evidence/2026-10-28/journey-succession-r55.md
  (+ prereg, analyzer, 5 stdout/stderr/tele JSONs, 48 transcripts).
