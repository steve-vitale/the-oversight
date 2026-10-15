# Public Table stakes and livelihood access audit

The campaign policy now reads the current meter from the Table's existing
italic prompt and the cost from the offered choice. No game rules, rewards,
prices, UI or gates changed. The initial suspicion that the current meters
were hidden was incorrect: the browser already displays these prompt lines.
The old default policy ignored them and could choose an unaffordable answer.

## Matched natural panel

150 driver days, the same 64 seeds per policy, 256 runs. Baseline is
`survivalist-passive-after-64.json.gz`; after is
`table-access-public-64.json.gz`. The latter pins source/observer commit
`90c2d0247b006b392cff143b5ab0c0141a66e01a`. Source hashes and exact counters
are retained in `table-access-validation.json`.

| Policy | Wins before -> after | Entered Table, both | Median game days, both | Player deaths, both |
|---|---:|---:|---:|---:|
| capable | 42 -> 52 | 56 | 90 | 95 |
| maker | 18 -> 21 | 24 | 120.5 | 73 |
| merchant | 16 -> 20 | 24 | 144.5 | 42 |
| caregiver | 15 -> 20 | 22 | 136 | 52 |

Wins rose **91 -> 113/256**. Table availability, entries, deaths and median duration stayed the
same for each policy; 227/256 complete standard result rows were identical.
All 256 after-runs emitted zero captured warnings. This improves the policy's
use of information available to a human; it does not establish balanced
acquisition or equal viability of all playstyles.

The three four-seed caregiver trace files separate the prior NPC settlement
change from this policy correction. With the old policy, seed 99 tried
Witness at swing 3 when it needed 4, then Beloved at audience 3 when it
needed 4, and lost. Reading the visible stakes wins Witness on day 90.
Seed 24 still fails its first Relay attempt, but then wins Beloved on day 94.
Seeds 2 and 12 still never reach a Table. These are decision repairs, not
guaranteed victories or unlocked seats.

## Confirmed dead spots and next work

The observer counted **6,453 player and 20,280 NPC ability offer appearances**
(62 and 51 distinct IDs respectively). Neither Second Wind nor Molt appeared
in either role; daily held-ability samples also found neither. A presentation
can repeat, so these are not 26,733 independent level-ups. Outside-kit gifts
are not exhaustively observed. Both abilities sit at Strange positions 10/11;
class leans can reach beyond the initial window, so impossibility is not
proven. Measure a focused access lever before tuning passive strength.

Caregiver seed 12 at day 150 had global rank, integration stage 3, 16 contests,
two crises and wave counts 14/9/14. Its seat was `none`, with only
`foodDeeds` false in the seat requirements. It had taught sentiment and
hosted a real feast: 1,655 kcal served on day 146, a 2.03 multiplier, three
guests, expired unused. The current `feastSurgeUsed` credit comes from combat
use. Livelihood policies disable the deliberate feast-powered hunt. The
endpoint is preserved in `table-access-caregiver12-endpoint.json`.

Next investigate a meaningful, paid noncombat use of the feast's power that
can satisfy the food-work requirement. Hosting alone must not fabricate a
successful use. Prove the actual beneficial outcome and cost, then repeat
matched livelihood simulations. Broader subclass/passive parity, nine other
authored ascension deeds and natural Titan coverage remain open. Contest/TV
gear routes retain their prior evidence; this panel does not re-audit them.

## Verification and provenance

The new public-stakes proof has five assertions spanning 30 actual Table
path/moral/boundary prompts, a throwing private-meter getter, contradictory
private values, unrelated prose numbers, missing readings and the opt-out.
The legacy greedy diagnostic retains 15 assertions. Observer on/off parity
retains four assertions over a 150-day run and full gameplay hash.
Quick checks **145/145**; full checks **917/917**, 158 seconds.

A metadata-only follow-up fixes frozen source attribution: a directory below
`.git` used to inherit the enclosing checkout's HEAD. Archives now accept an
explicit immutable `--source-head`, or report null when unavailable; they
never borrow a parent checkout's HEAD. Five dedicated assertions pass.
The three focused trace files were regenerated with this guard, explicitly
pinning the two archived bases. The completed 256-run matrix retains the
earlier observer hash, available at commit 90c2d024; no decision/runtime
logic changed in the metadata follow-up. Hashes, rather than the old archive
HEAD field alone, establish provenance for earlier reports.

No browser UI changes or browser play were needed for this policy-only pass.
No deployment, main-branch push or service-worker bump.
