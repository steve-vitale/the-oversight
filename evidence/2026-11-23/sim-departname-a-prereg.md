# Prereg — sim-departname-a (Loop A run fleshout-20261124T0215Z)

**Arm:** fix the departure-beat naming bug — a departure beat names a
companion by a generated physical description instead of a name
(tracker blank #4; sim-findings line 2710).

**Base:** `7344d8a56` (master tip at adoption; worktree
`sim-departname-a` rebased onto it, zero branch commits).

**Fix (planned, not yet landed at prereg time):** in `src/js/win-plan.js`,
the four fireside beats (`departLaunchBeat`, `reseedBeat`,
`expiryBeat`, `reseedLaunchBeat`) resolve holder/companion names through
`self.disp` (no such Game method exists — the check always falls
through) → `self.displayName(vid)`. `displayName` is the scholar's
knowledge gate: pre-System-arrival, or when the scholar has not
learned the name, it returns `personDescriptor(vid)` — "A person,
maybe 40s, with deep-set eyes". The fix adds one shared module helper
`beatName(self, vid)` that returns the true first name (`npcName`,
which prefers a bestowed calledName) and uses it in all four beats.
The beats are the village's fireside voice announcing its own people
setting out together — the holder chose these companions by name at
dawn — so they name people as the village knows them, not as the
scholar's stranger-descriptor. Text-only by design: `say()` consumes
no RNG and the fix writes no state (no `revealName` / knowledge
marking — whether hearing the beat should teach the scholar the name
is a follow-up design question, recorded in evidence, not decided
here).

**Scope note:** the holder-descriptor variant is already observed
inside departure beats ("A person, maybe 40s, with a gap-toothed grin
sets out with Lucas…"), so the fix covers holder AND companions in
`departLaunchBeat`, and the three sibling beats in the same file that
share the identical `disp` → `displayName` resolution and the same
village-voice fiction. The hold lines in `src/js/villager-brain.js`
(:736/:768, `firstNameOf`-guarded) are NOT touched — different
finding (held departures silent, steve-call), documented only.

## Instrument

- **Driver:** `scripts/dawnchoke-driver-a.js`, reused unchanged (the
  judged instrument that produced the repro corpora). It records
  `beatLines` (`{day, text}` — every fireside-beat SAY line),
  `departBeats` (structured: day, vid, launched ids, target,
  needWave), `v4departs`, and `deaths`.
- **Policy:** competent verbatim (`scripts/policies/competent.js`),
  unmodified.
- **Horizon:** 150d death-aware (`DAYS=150`; runs end early on
  won/over — never a fixed 200d).
- **Substrate env (identical on both legs):**
  `GUNRATE=1 CELLGATE=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1
  VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1`,
  `MODE=ctl`; `KILLBUNDLE`, `LEND`, `PRESENCE`, `HPGATE`, `PINQUAD`,
  `PROFILEGATE4` all unset. Same substrate the repro corpora ran
  under, so the before leg can reproduce the known beats.
- **Legs:** before = base code, `RUN=departname-a-before`,
  `OUTDIR=perseed-departname-a-before`; after = fixed code,
  `RUN=departname-a-after`, `OUTDIR=perseed-departname-a-after`.
  The ONLY difference between legs is the fix.
- **Repro seeds (frozen reuse):** 107423, 107425, 107429.
- **Band (frozen reuse):** 107601–107616 (16 seeds).

## Known repro beats (verbatim, sim-detgate-order-a §sense-test)

1. 107423 d7: "Sean sets out with A person, maybe 40s, with deep-set
   eyes — the fire marks the trail."
2. 107425: "A person, maybe 40s, with a gap-toothed grin sets out
   with Lucas…"
3. 107425: "A man, maybe 40s, with a scarred cheek sets out with
   Desmond…"
4. 107425: "Owen sets out with A man, maybe 20s, with calloused
   knuckles…"
5. 107429: "DeAndre sets out with A woman, maybe 30s — the fire
   marks the trail."

Descriptor detector (all beat kinds): `/A (person|man|woman), maybe
\d0s/` anywhere in a beat line.

## Frozen GO bars

- **B1 — fix verified on repro:** before leg reproduces ≥4 of the 5
  known beats (same seed, same day, same text); after leg shows **0**
  descriptor-named departure beats on the 3 repro seeds, and each
  reproduced beat re-appears with true first names in place of the
  descriptors (same day, same party size, same target clause).
- **B2 — no regression on band (107601–107616):** departure-beat
  count identical before vs after, per seed and total; every after
  beat line equals its before counterpart except person-name tokens
  (descriptor → true first name); **0** descriptor-named beats after,
  across ALL beat kinds (departure "marks the trail", re-seed launch
  "new trail", re-seed/expiry "put down"); per-seed total deaths
  identical; per-seed `v4departs` launch counts identical.
- **B3 — sense test:** read every fixed beat line as a player would:
  every person reads as a first name, no "A person/man/woman, maybe
  NNs" remains in any departure beat; quote the fixed repro lines in
  the evidence file.
- **B4 — proof test + gate:** `scripts/test-departname-a.js` green on
  new code; its naming assertions RED on old code
  (`git show 7344d8a56:src/js/win-plan.js`); `node scripts/check.js
  --quick` green, or pre-existing failures only, adjudicated
  individually.

**Verdict rule:** GO iff B1+B2+B3+B4 all pass. A miss is NO-GO, never
re-scored against a friendlier metric mid-run.

## Metric review

(To be filled at judgment time. If the metric proves wrong, the
revision is proposed here for the NEXT run, not applied to this one.)
