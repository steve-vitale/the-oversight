# sim-fiberfetch-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-fiberfetch-a · **Loop A run:** fleshout-20261121T0015Z
**Type:** BUILD + MEASURE (pilot) — finding #2590's serve half, fiber
first: the trailhead fiber fetch, scale-onramp axis.
**Frozen:** 2026-11-21 ~01:20 UTC, before any judged sim. The bars
below were fixed in the design brief before the lever was
implemented; the two-seed probe in §0.4 is unjudged design research
and is never counted toward the pilot.
**Branch:** `sim-fiberfetch-a` (worktree
`~/workspace/worktrees/sim-fiberfetch-a`). **Base:** master faa5d65a9.
**Builds on:** `evidence/2026-11-20/sim-ammo-a.md` + prereg
(NO-GO on the primary 1/6: the served bow's quiver works at the
trailhead, but the binding constraint is FIBER supply — pile fiber
0 at the attempt in 20 rows/leg, no-mats 17×/leg; §7 names the next
mechanism: "a fiber fetch" — the quiver must not depend on pile
fiber the village never stocks),
`evidence/2026-11-20/sim-depmat-a.md` + prereg (trailhead bundle
served 5 attributable bows, 0 served-bow volleys; unscoped, it
fired day 2 and departures fell 30% — the cascade lesson),
`evidence/2026-11-20/sim-evade-a.md` + prereg (NO-GO: a served bow
CAN volley — Ximena, seed 107051 d35, 2 shots / 2 hits / 27 dmg —
but consistency + guardrail failed),
`evidence/2026-11-20/sim-roll35-a.md` + prereg (NO-GO: the learned
60% roll doubles servings to 10, but 0 served-bow volleys — 5
engaged served fights entered with 0 ammo),
`evidence/2026-11-20/sim-speargate-a.md` (gate fix LANDED on
master). DEPMAT + AMMO + ROLL35 substrate was REVERTED after
those arms (no held branch exists) and is REBUILT here from the
evidence + proof tests (frozen-ladder precedent, sim-lendfix-a).

## §0. The design call (frozen, not a sim)

The ammo verdict named this lever exactly: "a fiber fetch" — at
the departure arrow-craft attempt for a served bow, if pile fiber
is short, the crafter gathers the missing fiber at the departure
site. The code was read in full before designing.
`villagerPocketAmmo` (`src/js/game.js`) already runs at every
departure, AFTER `villagerStageBow`, from `startExpedition`:
a bow-holder pockets, in order, (1) their own stashed ammo,
(2) sling stones from the communal pile, (3) ONE craft attempt
per departure for bow/crossbow ammo from the communal pile, using
the EXISTING arrow recipe (arrow: stick 2 + stone 1 + fiber 1,
makes 5) at the player's craft odds exactly (blind 35%, learned
85%, AMMO served 60%; a blind success teaches — the PRACTICE
rule). The craft reads the COMMUNAL PILE only — a carrier's own
pack fiber is never spent (noted here so the next arm does not
re-litigate it: own-pack fiber is out of scope for this lever).
The pile is the wall: on the ammo band the pile held fiber 0 at
the attempt in 20 rows/leg and the attempt died `no-mats` 17×/leg,
while stick and stone were plentiful. The fetch attacks that wall
and nothing else.

### §0.1 The frozen rule — FIBERFETCH=1 (the trailhead fiber fetch)

In `villagerPocketAmmo`, step 3, at the departure arrow-craft
attempt — and nowhere else — when the carrier's bow was staged
THIS departure (a served bow: `village.bowOpenByVid[vid]` has
`day === today` and `source` in `crafted` / `fromStash` /
`fromArmory`), the ammo is `arrow`, and pile fiber is the SOLE
shortfall (the other recipe materials are covered by the pile),
the crafter gathers the missing fiber at the departure site:
`fiberShort = need − pile fiber` (always 1 for the arrow recipe),
consumed by the attempt exactly like pile fiber, never added to
the pile, lost on a failed roll. The fetch is DETERMINISTIC —
zero new `Math.random` draws, the DEPMAT site-supply pattern
applied to fiber. The return carries `fiberFetch` (true when the
fetch fired) and `fiberSite` (units gathered), so the instrument
reads the lever off the return, never from a re-read. Telemetry
`ammo_fetch_site` {vid, item: 'arrow', mats: ['fiber']} and a
witnessed say line when the scholar is at home: "<name> strips a
length of plant fiber from the cleared brush at the trailhead."
(fiction grounded in existing game text about stripping plant
fiber from cleared brush). Default OFF in live play (env
`FIBERFETCH=1`); the turn-on decision is the coordinator's, NOT
this arm's. Rationale, in plain words: a villager who has just
made a bow at the trailhead is standing in the brush — the fiber
is underfoot, and the village should not lose the quiver to an
empty pile when the material grows at the trailhead. The fetch
does not touch the roll: a 60% craft still fails 2 times in 5
and the fetched fiber is lost with it, the same honesty as
today.

**The fetch is INDEPENDENT of the AMMO rate.** It is a supply
mechanism, not a rate mechanism: it fires on the attempt
whatever rate the attempt uses, and the proof test pins this
(F10: AMMO unset, fetch still serves 5 arrows). The pilot
always runs AMMO=1 alongside anyway (the arm is the whole stack
against live), but the fetch does not depend on it — a future
arm could run the fetch under the blind 35% rate and it would
still fire.

**Scope discipline (the depmat cascade lesson):** the fetch fires
ONLY at the arrow-craft attempt for a served bow — never at the
bow craft, never for non-served departures. A non-served
departure short on fiber gets no fetch (the probe §0.4 shows one:
day 136, pile fiber 0, stick 110 / stone 260 — fiber the sole
shortfall, but the carrier held no served bow, and the fetch
correctly stayed silent). The consistency bar (bar 4) is the
judge that would catch a cascade: departures within 5% AND
spearSeen within 10%, or the arm is NO-GO.

### §0.2 Draw-neutral by construction

The fetch swaps no threshold and draws nothing — it supplies a
missing material to the existing single craft draw. Zero new
`Math.random` draws, verified by grep over the diff and by the
proof test (a FIBERFETCH-on call consumes exactly the draws the
flag-off call consumes, identical with and without a craft
attempt). The DEPMAT + ROLL35 + AMMO substrate is draw-neutral
by construction (depmat/roll35/ammo proofs). The recorder is
pure reads. Draw-neutrality is a property of the mechanism, not
a promise of byte-identical corpora — a fetched fiber puts
arrows in a pack, and the villages can still diverge from there.

### §0.3 The substrate rebuild (frozen-ladder precedent)

DEPMAT + ROLL35 + AMMO were reverted after their arms and are
rebuilt here from the evidence + proof tests, env-gated OFF
(unset = the old game), before the lever was added. The rebuild
is proven by the recovered proof tests on this base, all green
before the pilot: `scripts/test-depmat-a.js` 43/43,
`scripts/test-roll35-a.js` 41/41, `scripts/test-ammo-a.js`
52/52, `scripts/test-fiberfetch-a.js` 71/71, plus the landed
proofs re-run on this base: `test-spearstage-a.js` 26/26,
`test-speargate-a.js` 31/31, `test-bowcraft-a.js` 58/58,
`test-bowknow-a.js` 19/19. The ctl leg is the LIVE game
(substrate OFF) — unlike the ammo arm, whose ctl was the
substrate ground: the substrate was reverted, so this arm tests
the WHOLE stack (DEPMAT + ROLL35 + AMMO + FIBERFETCH) against
live. The substrate-served bar (bar 0) guards the substrate half;
the fetch bars guard the fetch half. If the substrate cannot be
recovered cleanly the arm kills fast at this step — it was
recovered cleanly, so no kill was needed.

### §0.4 Design research before freezing (NOT a judged sim)

Two unjudged probe seeds ran BEFORE this prereg was frozen, on
both legs (ctl: live game; arm: whole stack). No bar was judged
on them; they size the design. Probe corpora:
`evidence/2026-11-21/perseed-fiberfetch-a-probe-ctl/` and
`evidence/2026-11-21/perseed-fiberfetch-a-probe-arm/` (seeds
107101, 107102, 0 instrument errors on all 4 files). The probe
confirms the instrument: `fiberFetch` / `fiberSite` are recorded
on every ammo row, the flags read correctly on both legs (ctl:
depmat/roll35/ammo/fiberfetch all OFF, speargate ON; arm: all
four ON), and the ctl leg behaves as the live game (0 served
rows in 48 — the blind craft with no site supply stages
nothing this departure on this bow-rich band).

Probe findings (2 seeds, 102 pocketAmmo rows, 0 errors):
- **The fetch never fired: 0 fetch rows in 2 seeds.** 9 served
  departures on the arm leg, 7 quivered (5 arrows each, AMMO
  60% rate on all 9 attempts), 2 craft-failed at 60% — and NONE
  of the 9 was pile-fiber-short (pile fiber 6–37 at every served
  attempt). The one `no-mats` row on the band (arm 107101 day
  136: pile fiber 0, stick 110 / stone 260) was a NON-served
  departure, so the fetch correctly stayed silent. The trigger
  — served + pile fiber 0 + other mats covered — is RARE on this
  band so far. The pilot's pool floor (bar 1) + primary (bar 2)
  judge whether the trigger occurs at all on 8 seeds; a primary
  miss with 0 fetch rows is a NO-GO that says the trigger never
  fired here, not that the fetch is broken — the proof test
  proves the mechanism, the pilot judges whether the band ever
  asks for it.
- **The quiver works where it fires:** arm served 9, served
  with ammo 7/9; the 2 empties are 60% craft-fails (fiber was
  plentiful) — the roll wall, not the materials wall. The fetch
  addresses the materials wall only, never the roll wall.
- **Thin-meeting warning (stated plainly, not hidden):**
  pair-inclusive engaged meetings are 0 on ctl / 2 on arm in 2
  seeds, so `deathsPerEngaged` is null on ctl — the guardrail
  bar (bar 5) fails on null by its frozen rule if the 8-seed
  pilot still has 0 ctl meetings. The raw population is thin
  too: arm served-bow engaged meetings 1 (0 with ammo), 0
  served-bow volleys in 2 seeds. The pilot's pool floor (bar 1,
  ≥ 3) is the judge of whether this band can support the primary
  at all; a THIN-POOL verdict is an honest verdict about the
  band, not a failure of the lever — and the evidence must say
  which it is.
- **Consistency drift on 2 seeds (noise at this size, the bar
  judges it):** departures 54 arm vs 48 ctl (+12.5%, over the
  5% bar if it held) and spearSeen 2 arm vs 9 ctl (−78%).
  Small numbers — one spear-holder's staging flips the count —
  but the consistency bar (bar 4) is the judge, and the pilot
  must not explain a miss away as noise.
- **The arm villages fight more:** arm deaths 179 vs ctl 128
  across 2 seeds; arm 107102 reached wave 5 (ctl maxWave 4)
  with 91 kill calls vs 53. More engagement, more deaths — the
  substrate puts bows in hands and the villages use them. The
  guardrails (bars 5–7) are the judge of whether that costs too
  much.

**Canon:** `docs/CANON.md` read (manifest). No canon doc covers
launch gear-up, ranged-slot rules, weapon-craft knowledge
seeding, departure pocket ammo, or the served-bow quiver — said
here rather than inventing canon. The mechanism respects "If you
don't know, it doesn't show": the carrier must already hold a
served bow, and the fetch gathers what grows at the trailhead
rather than conjuring arrows. Arrows stay earthly craft, not
System magic; no monster stats, wave pacing, or damage formulas
are touched.

## The question

DEPMAT + ROLL35 + AMMO (fresh band 107101–107108, gate ON, whole
stack live on the arm leg, live game on the ctl leg): the bow
serve works where the pipeline fires, and the served bow still
leaves the trailhead with an empty quiver when the pile holds no
fiber. **Does gathering the missing fiber at the departure site
— served-bow carriers only, at the arrow-craft attempt — put
arrows into served bows' packs, and do those fetch-quivered
served bows reach the fight and volley?**

## Primary metric (BINDING, §14)

Wave-4+ engaged meetings + staging departures, from the live
corpora (never snapshots). Legs differ ONLY by env: ctl =
SPEARGATE=1 + rebuilt substrate OFF (DEPMAT/ROLL35/AMMO/
FIBERFETCH unset — the live game); arm = SPEARGATE=1 +
DEPMAT=1 + ROLL35=1 + AMMO=1 + FIBERFETCH=1. BOWKNOW,
DEPARTSEE, and EVADEOBS are UNSET on BOTH legs (knowledge
seeding is proven non-binding and must not leak into this
measurement; the evade fix is proven and is NOT re-landed here,
so the evade wall stands at its background rate — evade-on-a-
fetch-quivered-bow is the NEXT arm, not this one).

- **(0) Substrate-served:** arm `attributableServed` ≥ 3
  (spear + site-supplied + crafted, read straight off
  depmatRows — without served bows the primary has no
  population).
- **(1) Pool floor:** arm served-bow engaged meetings ≥ 3
  (the RAW population below — if the band cannot field 3, the
  primary is unjudgeable and the verdict is THIN-POOL).
- **(2) PRIMARY — fetch-attributable served-bow volleys —
  BINDS.** The RAW population: ALL wave-4+ engaged meetings
  (any origin, any party — the quiver matters whenever the bow
  is carried into a fight), lead served by the mechanism
  (attributable-served, served day ≤ meeting day), outcome
  engaged (rounds > 0, outcome in vKill/vDie/vFlee/mFlee),
  rangedId bow/crude_bow, volley.shots > 0 — AND the arrows in
  the pack came from the fetch (lead fetch-served on an
  earlier-or-same day: a served departure where the fetch fired,
  the craft succeeded, and carriedAfter ≥ 1). **GO iff ≥ 1
  fetch-attributable volley on the band.** The roll35 band's
  anchor is 0/5 served-bow volleys on the same raw population;
  the ammo band's is 1/6. Served-bow volleys beside it are
  reported, NOT binding.
- **(3) Served-with-ammo rate rise — BINDS.** Arm share of
  served-bow engaged meetings entering with ≥ 1 arrow STRICTLY
  above ctl's share (a ctl pool of 0 counts as share 0). The
  ammo arm's primary failed at 1/6 — the fetch must move the
  share, not just fire once.
- **(4) Consistency — BINDS.** Total departures within 5% AND
  spearSeen within 10% (the depmat rate-based form — the
  depmat cascade fired day 2 and departures fell 30%; this bar
  catches that shape).
- **(5) Guardrail — deaths per engaged meeting — BINDS.**
  `arm.deathsPerEngaged ≤ ctl.deathsPerEngaged`
  (pair-inclusive; null on either side FAILS the bar — stated
  here so a thin-meeting pilot cannot pass it by default).
- **(6) Guardrail — starvation — BINDS.** `arm.starvation ≤
  ctl.starvation + 2` AND `arm.starvationVillager ≤
  ctl.starvationVillager + 2` (the scalemetric cost bar from the
  task brief: totals AND villager-only).
- **(7) Guardrail — median survival — BINDS.**
  `arm.medianDays ≥ 0.80 × ctl.medianDays` (the scalemetric
  cost bar from the task brief).
- A miss on any bar is NO-GO, never re-scored.
- **Instrument errors 0** on all per-seed files.

**GO threshold:** substrate-served ≥ 3 AND pool floor ≥ 3 AND
fetch-attributable volleys ≥ 1 AND served-with-ammo share rises
AND consistency holds AND deaths per engaged meeting holds AND
starvation holds AND median survival holds.

## Secondary metrics (supporting, not binding)

- **The fetch, sized:** fetch rows per leg, fetch-served rows,
  fetch-served-with-ammo, fetch craft-ok / craft-fail split —
  so the pilot can say whether the fetch fired where it was
  supposed to and whether the empties that remain are roll
  failures or supply failures.
- **The wall, sized:** served `no-mats` rows per leg,
  pile-fiber-0 served departures per leg, pile stick/stone/fiber
  zeros at served departures per leg — the supply profile the
  fetch attacks, re-checked live.
- **The quiver, sized by fail reason:** pocketAmmo fail-reason
  split on served departures per leg (craft-ok / craft-fail /
  no-mats / stock-draw / already-capped), the served-carried
  mean, and the rate actually used (`ammoRate` on the row:
  0.60 served, 0.35 blind, 0.85 learned-at-lv2).
- **The serve split:** site rows by spear vs non-spear per leg;
  knowing-noSource spear-holders; pile-vine-empty rate at spear
  departures (the substrate's health, carried over from
  roll35).
- **Volley-capable share at wave-4+ meeting entry per leg;
  spear share at the fight per leg. Staging by source per leg.
  Mean volley damage, ranged-at-entry share, trio+ population
  beside the primary, never substituted. Kill share,
  damage/round, community loss, median survival — reported as
  diagnostics, NOT binding here; only the guardrails bind as
  cost. Wall numbers every run: national / table / wins, wave-4
  and wave-5 unlocks, median survival, per leg. Table not
  instrumented by this driver — reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowcraft/spearstage/bowknow/bowsee/depmat/evade/roll35/ammo
  bands, for comparability). Dead villages stop simulating (+10d
  tail max).
- **Seeds (FRESH 8-seed pilot band): 107101, 107102, 107103,
  107104, 107105, 107106, 107107, 107108.** Freshness check
  (skill local_seed_band_freshness), run 2026-11-20, before this
  prereg was frozen:
  `grep -rln "10710[1-8]" evidence/*/sim-*-prereg.md` returns
  **nothing** — no prereg names any seed in this band. Finding
  count 0; convergence-tracker count 0; lever-claims none; no
  forbidden/contaminated list names it. A sibling branch
  `sim-fibersupply-a` exists but has no prereg naming the band
  (its worktree has no `evidence/2026-11-21/` dir). The
  coordinator pre-check also found no prereg naming it. (One
  broad grep matched "107101" as a substring inside a large
  unrelated JSON corpus — not a band designation.) The band is
  fresh. The two probe seeds (107101, 107102) are re-run as full
  judged pilot seeds — the probe corpora are unjudged design
  research and are NOT counted toward the pilot (the pilot writes
  fresh corpora under `perseed-fiberfetch-a-{ctl,arm}`).
- **Policies:** competent verbatim. **Common both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`, `SPEARGATE=1`. BOWCRAFT is
  always-on in code on both legs (live ground, not a flag).
  BOWKNOW, DEPARTSEE, and EVADEOBS are UNSET on both legs.
  **Ctl = same code, DEPMAT/ROLL35/AMMO/FIBERFETCH unset (the
  live game); arm = same code, DEPMAT=1 + ROLL35=1 + AMMO=1 +
  FIBERFETCH=1.** The legs differ ONLY by env — no code change
  between legs. The driver asserts the flags match the MODE
  label and each corpus file records `depmatOn` +
  `depmatPresent` + `roll35On` + `roll35Present` + `ammoOn` +
  `ammoPresent` + `fiberfetchOn` + `fiberfetchPresent` +
  `speargateOn` + `speargatePresent` + `bowopenOn` +
  `bowopenPresent` + `bowknowOn` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/fiberfetch-driver-a.js` (clone of
  `scripts/ammo-driver-a.js`, RUN=fiberfetch-a,
  OUTDIR=perseed-fiberfetch-a-{ctl,arm} — env-parametrized; the
  `depmatRows` recorder is UNCHANGED, plus the `ammoRows`
  recorder extended with `fiberFetch` / `fiberSite` from the
  return — a pure-read wrap of `Game.villagerPocketAmmo`
  capturing, per departure, rangedId/ammoId, servedThisDepart,
  carriedBefore/After, stashedBefore, pile stick/stone/fiber +
  pile arrow stock, ammoCraft level, pocketed/crafted/
  craftedOk, `ammoServed`/`ammoRate` from the return,
  `fiberFetch`/`fiberSite` from the return, and the derived fail
  reason); analyzer `scripts/analyze-fiberfetch-a.js` — cloned
  from the ammo analyzer with the judge re-pointed to this
  prereg's bars (substrate-served, pool floor, PRIMARY
  fetch-attributable volleys, served-with-ammo rise,
  consistency, deaths-per-engaged + starvation + median-survival
  guardrails) plus the fetch / wall / quiver diagnostics and
  `--selftest` covering the new bars (85/85 green at freeze).
  Per-seed JSONs under
  `evidence/2026-11-21/perseed-fiberfetch-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-fiberfetch-panels-a.js` (cloned
  from the ammo builder, re-pointed at the fiberfetch corpora)
  + `node scripts/balance-panel.js compare`; the compare `.md`
  is attached to the evidence file. The panel is the
  instrument, the frozen bars above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run unless the
  pilot GOes and the evidence judges a confirm warranted; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a departing served-bow carrier
leaves with arrows the fetch gathered, so the fixture is the
departure itself, staged by the competent policy: a geared
scholar fighting with a party, never a fresh un-geared solo
scholar. The proof test (`scripts/test-fiberfetch-a.js`, GREEN
before the pilot) runs on a LIVE loaded village with real
roster/gear — a geared fighter holding a freshly staged crude
bow (served this departure), knowing arrows at lv 1, a pile
short on fiber only — and proves: (F1) FIBERFETCH off = the
served carrier's arrow craft dies `no-mats` on pile fiber 0
(old behavior); (F2) FIBERFETCH on = the same served carrier
fetches the missing fiber at the trailhead and crafts 5 arrows
(`fiberFetch` true, `fiberSite` 1, carriedAfter 5); (F3)
flag-off repeat = old behavior again; (F4) a NON-served
bow-holder with the flag on gets no fetch (the scoping — the
pile-fiber-0 attempt still dies `no-mats`); (F5) stick AND
fiber short = no fetch (fiber is not the sole shortfall); (F6)
pile stocked with fiber = no fetch (nothing to gather);
(F7) with the flag on and a failing roll at the served rate,
the fetch fires, the fiber is lost, and the pile is never
driven negative; (F8) a served carrier with a stone-sling
(ammo `stone`, no pile recipe) is untouched by the flag (no
craft attempt, no `fiberFetch`); (F9) a served carrier at
lv[arrow] = 2 with the flag on still faces the learned 85% (a
roll of 0.80 succeeds — the learned rate is untouched); (F10)
AMMO unset + FIBERFETCH on = the fetch still serves 5 arrows
(the fetch is independent of the AMMO rate). The substrate is
proven by `scripts/test-depmat-a.js` (43/43),
`scripts/test-roll35-a.js` (41/41), and
`scripts/test-ammo-a.js` (52/52) on the rebuilt code, and the
existing landed proofs (`test-spearstage-a.js`,
`test-speargate-a.js`, `test-bowcraft-a.js`,
`test-bowknow-a.js`) are re-run on this base before the pilot.
The pilot's per-seed corpora carry the encounter averages
(party size, gear, abilities, ranged-at-entry) beside the
verdict in the evidence file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate
   — probe band: 2 pair-inclusive engaged meetings per 2 seeds
   on the arm leg (0 on ctl), 61 wave-4+ encounters. The pool
   floor (≥ 3 served-bow engaged meetings) is sized to the ammo
   band's 6, with the thin-band warning above: if the band
   cannot field 3, the verdict is THIN-POOL and the evidence
   says so.
2. **Pool sizing:** the substrate-served bar (≥ 3) is sized
   against the roll35 pilot (10 served on the reused band) and
   the probe's warning (2 attributable in 2 seeds on this fresh
   band) — the bar judges whether the substrate serves at all
   here. The primary (≥ 1 fetch-attributable volley) is sized
   against the roll35 anchor (0/5) and the ammo band (1/6): one
   fetch-quivered served bow reaching a fight and shooting is
   the whole claim — a primary miss with 0 fetch rows is a
   NO-GO that says the trigger never fired here, and the next
   arm inherits the trigger rate, not a guess.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-fiberfetch-a.js`, GREEN before the pilot)
   proves the fetch rule on a live village (see the fixture
   section above), and `scripts/test-depmat-a.js` (43/43) +
   `scripts/test-roll35-a.js` (41/41) +
   `scripts/test-ammo-a.js` (52/52) prove the rebuilt substrate.
   The analyzer `--selftest` covers the new judge shapes (GO /
   NO-GO fetch volleys 0 / NO-GO thin pool 2 and 0 / NO-GO
   substrate 2 / NO-GO share no-rise and share fall /
   NO-GO consistency departures 25% and spearSeen 50% / GO
   consistency exactly 5% and 10% / NO-GO deaths per engaged
   rise / GO deaths per engaged fall / starvation at and past
   ctl + 2 / median survival at and below 0.80x). The probe
   confirms the instrument records fetch rows and the flags
   (§0.4).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on GO the serve half is
  confirmed — the served bow departs with pocket ammo the fetch
  gathered, and the fetch-quivered bows reach fights and volley.
  On NO-GO the finding stays open with the failing bar named,
  and the next lever is named (the fetch trigger rate + the
  evade wall, in that order — evade-on-a-fetch-quivered-bow is
  the named next arm).
- The primary is a fetch-attributable volley count on the RAW
  population (this prereg): if it misfires, the metric review
  says whether the miss is the trigger (the fetch never fired),
  the roll (fetches fired but crafts failed), the pool (band too
  thin to judge), or the substrate (no bows served) — the verdict
  does not get re-scored — and names which population the miss
  lives in (raw vs pair-inclusive).
- The consistency bar is the depmat-cascade guard (this prereg):
  if it misfires, the review names whether the drift is
  departures, spearSeen, or both, and which seeds drove it —
  the verdict does not get re-scored.
- The guardrails are the scalemetric cost bar (this prereg):
  deaths per engaged meeting ≤ ctl, starvation ≤ ctl + 2
  (totals AND villager-only), median survival ≥ 0.80× ctl. If
  any misfires, the review says so — the verdict does not get
  re-scored — and names whether the cost is deaths, starvation,
  survival, or several.
- RNG divergence: if the arm leg's departure counts drift from
  ctl, the review names the drift seeds and whether any bar
  turned on it — the verdict does not get re-scored, but the
  next arm needs the drift sized.
- Draw-neutrality is a property of the mechanism, not of the
  corpora: a fetched fiber puts arrows in a pack, so the
  streams diverge by design once the fetch fires. The review
  must not re-litigate this as a mechanism failure.
