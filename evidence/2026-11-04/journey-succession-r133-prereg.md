# Journey succession r133 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before play. Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout. Run number r133 follows r132 (social life,
same day); the rotation file, not the number, is the authority.

## Carried question (r123, still open)

r123 calibrated r119's "0 new bonds in 14 days": successors form zero new
bonds in 14 days on 3/3 scored seeds (and 0 more by d+30 on both scored
seeds) while non-successors in the same villages form 8, 9, and 2 new
pairs in the same windows. The one exception proves capacity, not
opportunity: on 33203, Lena's d+30 conversation with Aki — the ONLY
stranger conversation in any scored window — was followed by a
Lena↔Aki bond by relEnd. r123's design question, carried verbatim:
villagers form bonds with each other autonomously, but the player
character's new bonds arrive only through player-driven stranger-talk.
Is that the intended path, or should villagers also strike up bonds
with the bearer on their own? This run does not change wiring on a
guess. It decomposes the zero into opportunity vs capacity, which
r123 did not measure (it measured bond counts, not encounters).

## Question

Why do successors form no new bonds? Two rival mechanisms:
(a) OPPORTUNITY: nobody new ever comes to the bearer — no NPC-initiated
talk requests from strangers, no autonomous bearer bonds — so the
bearer can only gain bonds by talking to strangers themselves, and the
competent-play driver (top-2-by-trust + strongest-bond partner, all
familiars by construction) never does.
(b) CAPACITY: strangers are around and reachable, but talking to them
as bearer does not form bonds (a bearer-specific block).
r123's single accidental stranger case favors (a) but is n=1 and
undated (no snapshot between relD30 and relEnd). r133 tests both
deliberately.

## Instrument (r127 driver + 2 declared additions, nothing else)

Driver: scripts/journey-succession-r133-20261104.js = r127 verbatim
except filenames r127 -> r133, EVID_DIR stays evidence/2026-11-04,
mode string kept 'succession-r123' (harness label, unchanged since
r123 to avoid any mode-branched behavior drift). Instrument only,
zero src/js changes.

1. TALKREQ-DAILY: in the post-death daily loop, after the officeDaily
push, snapshot (i) v.talkRequests entries — requester id/name, day
filed, whether that requester is bonded to the bearer at that moment
(bond key present either order) — and (ii) the bond-key set diff
since the previous post-death day, split into bearer-involved new
keys vs NPC-NPC-only new keys. First post-death day sets the bond
baseline (no diff). Stored compactly in rec.talkreqDaily and
rec.bondDaily. Reads only; the instrument writes nothing back into
Game state. Talk requests are state (v.talkRequests), not say-log
scraping, so a capped sayLog cannot void this instrument the way
it voided r123's funeral windows.
2. STRANGER-PROBE: on the first post-death day with daysSince >= 3
where relPost exists and the probe has not fired, drive ONE
conversation with the highest-trust living villager NOT bonded to
the successor at relPost (fallback: not bonded now), excluding
anyone already talked to at that checkpoint. Filed as a
stranger-probe transcript (dplus3-STRANGER-Name) and recorded in
rec.strangerProbe {day, dplus, vid, name, trust, bondedBefore,
refused, want}. If no unbonded living villager exists, record
{none: 'no stranger pool'} and mark done — that seed is
no-stranger-pool, not a capacity miss. The probe is one extra
driven convo at d+3 only; all other convo days are r127 verbatim.

Everything else (PICKCTX, PICKCTX2, REL snapshots incl. relD30,
FUNERAL-INCALL, CONVO_DAYS [3,7,14,30,45,53,64], POST_DAYS=70,
EARLY_KILL_DAY=40, second/third/fourth/fifth kills = 0) is r127
verbatim, renamed. No forced regime: the scripted leg kill fires
only when no organic death arrives by day 40, exactly as r127.

## Pilot seeds

33401, 33402, 33403, 33404. Fresh band: exact `"seed": 3340` grep
empty across prior succession stdout JSONs at run start. Reserves
33405, 33406. Launch: SEED=<seed> POST_DAYS=70 node
scripts/journey-succession-r133-20261104.js (EARLY_KILL_DAY default
40; DUMP_SAY set per seed so the capped log stays auditable).

## Bars (binding, §14)

- CAP (binding): stranger-probe bond forms by relEnd on >= 3 of 4
  pilot seeds. Denominator rule, stated in advance: a seed counts
  toward the 3 only if its probe convo OPENED (not refused) and the
  seed has a relEnd snapshot with the same bearer (no second
  handoff before relEnd — dual-keyed relEndOrigId/relEndFinalId
  must agree with the probe bearer). A refused probe, a
  no-stranger-pool seed, or a second handoff before relEnd is
  reported verbatim and does NOT count toward the 3 — and does
  not count against capacity either. If fewer than 3 seeds are
  probe-eligible, the verdict is INSUFFICIENT-DATA (use reserves
  33405-33406 once each, then stop and report). If >= 3 probes
  opened and 0 bonded by relEnd, that is a CAPACITY DEFECT item
  for the builder, documented not re-scored.
- OPP (descriptive, reported not scored): per seed, over d+0..d+30
  post-handoff — total talk requests filed to the bearer, split
  bonded vs unbonded requesters; autonomous NPC-NPC new bonds
  per day (median + total); bearer new bonds on days with NO
  driven convo (expect ~0 under mechanism (a)); bearer new
  bonds on driven-convo days. No threshold: this is the
  decomposition, and it judges mechanism (a) vs (b) together
  with CAP.
- CARRIED (reported, not scored): pick-time rank == 1 on every
  first handoff with npcCalls (r123 bar); funeral INCALL beat
  present on every leg death (r127 bar). A miss on a carried bar
  is reported as a regression note, not a re-score of r123/r127.
- PEOPLE CHECK (sense, not a count): read the stranger-probe
  transcripts in full plus one d+14 successor transcript per
  scored seed. Bar: conversations have meaning per the
  sense-testing law (NPC wants something, options engage or
  deflect, endings resolve/plant/owe); no fabricated shared
  history. A sense failure is documented as a blank even if
  CAP passes.

## Expansion trigger

Instrument failure only: talkRequests unreadable or bondDaily
empty on a seed with a recorded handoff (fix instrument, re-run
that seed once). A CAP miss, a no-stranger-pool seed, or a
skipped seed (village over before any kill) never triggers
expansion alone — skipped seeds count in denominators as
"not >= bar" per the r119/r123 skipped-seed rule, and reserves
are used only for the INSUFFICIENT-DATA case above.

## Metric review (to be filled after the panel)

- r123's bond counts are NOT re-scored here; r133 scores only the
  new decomposition (CAP + OPP). If CAP passes and OPP shows zero
  unbonded talk requests with steady NPC-NPC bonding, the
  mechanism is (a) and the carried design question goes to
  Steve/builder as measured, not as a guess.
- Canon note: no canon doc covers mantle/bond formation
  specifically (r127's standing note, unchanged). Governing
  rules used: ledger.js "successor: the village chooses. Trust
  decides"; party-bond.js "v.bonds built by meals/visits/feasts,
  +6/pair/day cap, no bonds with the dead or gone"; CANON.md
  "No silent actions". Nothing invented, nothing changed.

## Prereg amendment #1 (before any scored seed; instrument fix only, bars unchanged)

Smoke seed 33499 (EARLY_KILL_DAY=5, POST_DAYS=10, EXIT=0, no
anomalies) proved both instruments: stranger probe opened with
Priya (trust 24, want curious, not refused) and talkreqDaily /
bondDaily populated on all 10 post-death days. It also caught one
instrument misread, fixed before the panel: a talk request keyed by
the bearer's own id appears at d+0 — filed day 5 by Carlos while
still an NPC, i.e. before the day-7 handoff, and never cleared or
retargeted when he became bearer. The driver now classes
who === self as selfRequest:true with bondedToBearer:null (was
false, which would have miscounted it as an unbonded stranger
opportunity). OPP counts exclude self-requests; they are reported
as their own class. Whether a stale self-request is a game defect
(badge pointing at yourself) or harmless litter is a panel
observation, not a pre-scored claim: if self-requests recur on
panel seeds, the run note documents them as a blank for the
builder. No bar changes: CAP and OPP definitions above already
exclude nothing else, and self-requests were never intended as
stranger opportunities.
