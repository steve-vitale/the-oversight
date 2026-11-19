# sim-partysurvive-b — the launch-party survival-to-the-fight diagnostic

**Verdict: NO-GO, kind BLOCKED-SUBSTRATE-MISSING** — the judged leg
never ran. The instrument is built and proven, the prereg is frozen
and corrected, but the fightcap driver refuses to run on this tip
because the ALLYSLOT3 slot code is absent from master `e1f002065`
(it was never landed — fightcap was NO-GO and the lever was held).
This file records the blocker, what was proven anyway, and the
unjudged reference-band decomposition the analyzer produced while
validating itself — the closest thing to the answer this run can
give, clearly labeled as NOT the frozen verdict.

- **Branch:** `sim-partysurvive-b`, tip `c7cd64327` (prereg
  `df51446`, instrument `c7cd64327`; base master `e1f002065`,
  journey-establishment r243)
- **Prereg:** `evidence/2026-11-19/sim-partysurvive-b-prereg.md`
  (frozen 2026-11-19 12:54 UTC, corrected 13:07 UTC — see §6; no
  judged sim has run)
- **Analyzer:** `scripts/analyze-partysurvive-b.js`
  (`--selftest` 34/34); **proof test:**
  `scripts/test-partysurvive-b.js` (§A green, §B green, §C FAILS
  LOUDLY on the blocker — by design)
- **Corpus:** NONE on the fresh band. No
  `perseed-partysurvive-b/` directory exists; nothing was simulated
  on seeds 105941–105948.

## 1. The blocker, in plain words

The task's substrate is fightcap-b's arm leg: SENSEEXPED=1,
PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1, FIGHTALLY2=1,
ALLYSLOT3=1, run through `scripts/fightcap-driver-b.js`. Five of
the six flags are live on this master (verified by grep:
SENSEEXPED in `party-wiring.js`; PARTYSIZE4 in `villager-brain.js`
/ `win-plan.js`; VETREENGAGE in `game.js` / `villager-brain.js` /
`win-plan.js`; FLEEREPAIR2 in `win-plan.js`; FIGHTALLY2 in
`fieldFights.js` / `party-wiring.js`). The sixth is not: `ALLYSLOT3`
appears NOWHERE in `src/js/` (0 hits in `party-wiring.js`,
`fieldFights.js`, `game.js`; 0 `ally3Vid` in `fieldFights.js`). The
slot lives only on the held branch `sim-allyslot3-b` (`7efbf26a8`)
and the `sim-fightcap-b` branch (port `5a5343363`, tip
`b848fb1a4` — adoption closeout, "lever held"); no
`sim-fightcap-b` worktree exists. The driver guards both legs with
a loud stop (`LEVER_PRESENT` must hold), and the smoke test
reproduces it verbatim:

```
FIGHTCAP STOP: the ALLYSLOT3 lever code (ally3 slot in fieldFights.js
+ ALLYSLOT3 gate in party-wiring.js + wild-router cap) must be present
on BOTH legs.
```

The two ways past it are both forbidden by this arm's own brief:
(a) porting the slot is a `src/js` game-code change — the task says
ZERO src/js changes, instrument-only; (b) weakening the driver's
guard to run a slot-off leg would mislabel the corpus (the prereg
froze the driver UNCHANGED, and a slot-off run is the CONTROL leg,
not the arm leg the reference numbers come from). Neither was
done. The coordinator's call, in order of fidelity to the prereg:

1. **Authorize the port** — cherry-pick the slot (`5a5343363` or
   `7efbf26a8`) onto this branch as a substrate port (the same move
   fightcap-b made), then run the frozen leg unchanged. This is a
   game-code change, so it needs the coordinator's explicit word,
   and the port would need its own proof re-run
   (`test-allyslot3-b.js`).
2. **Re-scope to the control substrate** — run the leg with
   ALLYSLOT3 unset on master as-is. The deaths decomposed would be
   control-leg deaths, comparable to fightcap-b's CONTROL leg
   (whose sense-miss table the analyzer can also reproduce), not to
   the published Dead 10. Needs a prereg amendment (driver guard +
   substrate line) before any sim.
3. **Re-point the arm** — run the driver from the `sim-fightcap-b`
   branch tip in a fresh worktree (slot present there). The corpus
   anchor would be that tip, not master `e1f002065`, and the prereg's
   base would need amending.

## 2. What was proven anyway

| Check | Result |
| --- | --- |
| Analyzer selftest (`analyze-partysurvive-b.js --selftest`) | **34/34** — per-member outcomes, every cause class, died-in-meeting split, same-day ambiguity, presence-based cross-check (agree / seen-after-death / early-vanish), judge GO / NO-GO / METRIC-BROKEN / NO-PRE-FIGHT-DEATHS / instrument shapes |
| §B corpus reproduction (frozen fightcap-b arm corpus) | **PASS** — sense-miss by-cause table reproduced exactly: Dead 10, Expedition ended 5, different-tile 3, same-tile 1, Different expedition 1, trim-unproven 1; meetings 18, sense-full 5 |
| §C driver smoke (30d seed 105941, frozen substrate + LAUNCHSURVIVE=1) | **FAILS LOUDLY** — driver exit 2, the ALLYSLOT3 stop above; smoke corpus cleaned up, no stray files |
| Seed band 105941–105948 freshness | **FRESH** — no prereg, filename, branch, or commit names any of the eight seeds as a seed. (Footnote: a broad grep finds the digit strings only as substrings of longer values in old JSON corpora — e.g. `10594379507584` in `belongfeast-s6101.json`, an `away_wild` counter `105949` in `perseed-dutyfish-b/control-lead.json` — none is a seed reservation.) |
| Worktree hygiene | clean — only committed work (`c7cd64327`); the safe-commit index clobber struck twice (committed files showed staged-deleted in the main index; commit itself correct) and was repaired both times with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified by `git status` empty + `git diff HEAD` empty + hash-object == HEAD blob per file |

## 3. Reference-band validation decomposition (UNJUDGED — not the frozen verdict)

While validating, the analyzer was run on the FROZEN fightcap-b arm
corpus (seeds 104770–104777, same substrate) as instrument
validation. This is NOT the judged leg — the prereg's verdict
requires the fresh band — but it is the only decomposition of the
actual Dead-10 deaths this run can offer, and the instrument proves
itself on real data. All numbers below are that validation run
(`--dir perseed-fightcap-b-arm`), reported so the coordinator can
see what the fresh leg would have measured.

| | Reference band (unjudged) |
| --- | --- |
| Quad launches / members tracked | 18 / 72 |
| Joined meetings (first per launch) | 11 launches met; 44 members with a meeting |
| Alive at meeting | 37/44 = **0.841** |
| **Pre-fight deaths (died before the FIRST meeting)** | **3** — classified 3/3 = **1.000**, top cause **field-fight (2)** |
| Median days launch→death (pre-fight) | **0** (Q1 0, Q3 0.5) — the deaths land on launch day or the day after |
| Alive +7d / +21d after launch (all members) | 0.847 / **0.569** — barely half a launched party is alive three weeks out |
| Died IN the meeting fight | 4 |
| Died, launch never met (in-window) | 6 |
| Death-day cross-check (presence-based) | 57/57 agree, 0 disagree, 1 unchecked, 0 early-vanish |
| Instrument errors / files | 0 / 8 |

The three pre-fight deaths (the whole judged denominator on this
band — note how thin it is; the prereg floor was corrected 5 → 3
for exactly this reason):

| Member | Launch | Death | Meeting | Cause |
| --- | --- | --- | --- | --- |
| Benjamin (visjoin_90), holder, seed 104771 | d125 | d126 (+1d) | d135 Timeslot | **field-fight / linked-v4 — The Timeslot (wave 5)**. Fought THREE aid fights on d126 (Timeslot vKill 10 rounds, Reunion vFlee, Editor vDie 1 round) and died in the third. |
| Emma Larsen, companion, seed 104772 | d135 | d135 (+0d) | d138 Influencer | **field-fight / wave1-3-unrecorded — Gavel (wave 3)**. Died on launch day to a wave-3 monster; no v4 fight row can exist (wave 3 is not recorded). |
| Valeria Quispe, holder, seed 104773 | d109 | d109 (+0d) | d110 Strike | **wounds / wound-fever** — "a wound that wouldn't close". Died of her wound on launch day, one day before the meeting. She launched already dying. |

The four died-in-meeting deaths (not pre-fight — they reached the
fight and died in it): Catalina Reyes (d64 Spoiler, seed 104771 —
the fightcap-cited bleed-out, see §4), Scott (visjoin_120) and Theo
Lindqvist (d138 Influencer, seed 104772), Owen Smith (d90 Reunion,
seed 104775).

The six no-meeting deaths (launches that never met within 21d):
field-fight 2 (Timeslot w5 linked-v4; Influencer w4 linked-v4),
the-wild 3, stranger 1. Two of them are the SAME people as
pre-fight deaths under a different launch (visjoin_90 died d126
under both his d120 launch — no meeting — and his d125 launch —
pre-fight): per-launch-member records double-count a person who
re-launches. The judged denominator counts launch-member pairs,
not unique persons.

Two things the validation run makes plain:
- **The Dead 10 is not the same population as this arm's
  denominator.** Fightcap's 10 counts companions dead at ANY
  missed meeting (a companion dead by the third meeting of a
  long-lived launch still counts). This arm counts deaths before
  the FIRST meeting only: 3 on the same band. The other 7 of the 10
  died after their launch's first meeting, or at meetings of later
  launches — still road deaths, but not pre-first-meeting deaths.
  The fresh leg, if it runs, should report BOTH populations.
- **The road kills on day 0–1, not on day 10.** Median
  launch→death is 0 days: two of the three died on the day they
  launched. The launch itself — or the state the party launches
  in — is the danger, not a long march. Valeria launched with a
  wound that killed her the same day; Emma met a wave-3 monster
  the same day she left. The "survival curve" is really a
  launch-day cliff: 84.7% alive at +7d, 56.9% at +21d.

## 4. Sense-test: two member-death stories read in the transcripts

Both from the frozen fightcap-b arm corpus (`v4encounters` log
lines, capped at 20 lines by the recorder).

**Benjamin (visjoin_90), seed 104771, d126 — died on the road,
one day after launching.** He is the fighter in an AID fight
against The Timeslot (wave 5): walks in open-handed, the parley
fails, he is exposed and off-balance; Ming charges in on his
shout, then Morena on his second shout; the three of them KILL
the Timeslot in 10 rounds. The same day he fights The Editor —
one round, "the editor's scissors snip — measuring Benjamin",
"Cut hits Benjamin for 20 (0 left)". He won a wave-5 fight and
died in the next one, hours later, nine days before his launch's
meeting. This reads as a person dying on the road, not a number:
two Producer fights in a single day, the second one ending him.
(Fiction wrinkle, same as fightcap's d76 note: the Editor fight's
walk-in line calls the monster "The Loud Beast" while the
mechanics lines say "The Editor" — one fight, two names. The
village's nickname for a monster it hasn't learned, presumably;
noted, not chased.)

**Catalina Reyes, seed 104771, d64 — died IN the meeting fight.**
"Walks straight into The Spoiler. No avoiding it." She opens with
a bow (3 of 4 arrows hit), Rages ("eyes go red, next 3 strikes hit
twice as hard"), the Spoiler announces "IN THREE ROUNDS, CATALINA
WILL BLEED", and she dies in 2 rounds to 35 + 34 damage — after
landing a 57-damage doubled strike. Her launch and her meeting
are the same day: she set out as a quad and met the Spoiler the
day she left. The winning-shape ingredients are all there; the
fight is over before they matter. Tragic and legible.

One more sense note, from the d138 Influencer fight (seed
104772): Scott shouts twice, Sofia and Theo charge in, the fight
ends `vFlee` — the party fled — but the death rows say Scott AND
Theo both died that day. The outcome label says "got away" while
two of the four are dead. A flee that costs half the party reads
wrong as a label, whatever the mechanics say; worth a look by
whoever owns fight outcomes.

## 5. Wall numbers

No fresh leg ran, so there are no fresh wall numbers. The
reference band's wall (same substrate, unjudged): wins 0/8,
national 0/8, wave 5 reached 3/8, wave 4 reached 8/8, standing
≥200 3/8, survived 150d 3/8, median survival 147d. Identical to
fightcap-b's published arm leg (as it must be — same corpus).

## 6. Metric review (for the NEXT run — this run is judged as BLOCKED)

1. **Prereg correction (2026-11-19 13:07 UTC, before any judged
   sim):** the death-day cross-check was defined against a
   `dead: true` roster flip that does not exist — the roster is the
   living roster and the dead vanish. Corrected to presence-based
   (last seen = death day or day before; seen-after-death is the
   hard failure). The pool floor was corrected 5 → 3 because
   fightcap's "10 dead" counts a different population (dead at any
   meeting) than this arm's denominator (dead before the first
   meeting), which measures 3 on the reference band. Both
   corrections are committed in the prereg before any judged sim.
2. **The 0.90 bar on n≈3 is effectively "classify all of them."**
   One unclassified death in a pool of 3 reads 0.667 and fails.
   That is the honest consequence of the small denominator, and
   the evidence must name the count beside the share — as this
   file does for the validation run (3/3).
3. **The died-in-meeting split matters more than expected.** On
   the reference band, 4 members died IN the meeting vs 3 before
   it. A future run should report the meeting-fight deaths
   alongside the pre-fight ones — the road and the fight kill
   comparable numbers of launched members.
4. **Same-day launch deaths need a closer look.** Two of three
   pre-fight deaths happened on launch day. The analyzer cannot
   tell whether the member died before or after the depart call
   within that day. A future instrument could record the depart
   hour / the member's wound state at launch (the tracker already
   records holder sickness and health per day; companions' wound
   state at launch is not recorded).

## 7. Blanks and findings notes for the coordinator (file these; do not edit sim-findings.md)

- **BLOCKED:** judged leg not run — ALLYSLOT3 slot code absent
  from master `e1f002065`; driver refuses both legs. Three options
  in §1 (port / re-scope to control substrate / re-point to the
  fightcap branch tip). The instrument is ready: prereg frozen +
  corrected, analyzer 34/34, proof test §A/§B green, §C fails
  loudly exactly on the blocker.
- **Reference-band answer (unjudged):** on fightcap's arm band,
  pre-first-meeting deaths are 3/72 launched members — field
  fight 2 (Timeslot w5, Gavel w3), wounds 1 — and the deaths land
  on launch day or the day after (median 0d). Only 56.9% of
  launched members are alive 21 days after launch. The binding
  constraint is not a long march: it is launch-day exposure plus
  launching while already wounded.
- **Out-of-scope gap (note only):** the d126 Editor fight calls
  the monster "The Loud Beast" in the walk-in line and "The
  Editor" in the mechanics lines — same double-naming wrinkle
  fightcap noted for d76 ("Ugly Beast" / Spoiler). Village
  nicknames vs true names, presumably; no action owed.
- **Out-of-scope gap (note only):** a `vFlee` outcome with two
  party members dead in the same fight (d138 Influencer) — the
  flee label reads wrong against the death rows.
- **Instrument note:** the safe-commit index clobber struck twice
  on this branch (committed files showing staged-deleted in the
  main index; commits themselves correct). Repaired both times
  with the documented `ls-tree -r HEAD | update-index --add
  --index-info` pipe; verify with `git status` + `git diff HEAD`
  + hash-object per file after every safe-commit on this tree.
- **Panel / telemetry:** NOT run — no corpus exists. The panel
  builder (`scripts/build-partysurvive-b-panels.js`) and the
  telemetry check were not attempted; there is nothing to compare.
  The reference band's wall numbers are in §5.
- **No `check.js` gate was run** — there is no game-code change
  to gate, and the branch holds only instrument + evidence. The
  proof test (`test-partysurvive-b.js`) is the gate for this arm:
  §A/§B green, §C red on the documented blocker.
