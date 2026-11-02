#!/usr/bin/env python3
"""Analyze audit-fixtures ability batteries: WITH vs WITHOUT per ability.

Fire detection: ffFired contains the id OR the log contains an ability
marker (ability name words, or known verb lines). Delta metrics use
median across seeds 9201-9203 (scored set) per config; 9204-9205 reported
as confirmation. Prints a compact verdict table.
"""
import json, glob, os, statistics, sys, re

BASE = os.path.join(os.path.dirname(__file__), '..',
                     'evidence/2026-11-01/audit-fixtures-20261101')
SCORED = [9201, 9202, 9203]


def load(ability, arm):
    p = os.path.join(BASE, f'ability-{ability}-{arm}.json')
    if not os.path.exists(p):
        return None
    return json.load(open(p))


def med(vals):
    vals = [v for v in vals if v is not None]
    return statistics.median(vals) if vals else None


def pct(a, b):
    if a is None or b is None or b == 0:
        return None
    return round(100.0 * (a - b) / abs(b), 1)


def analyze(ability):
    w = load(ability, 'with')
    wo = load(ability, 'without')
    if not w or not wo:
        return None
    out = {'ability': ability}
    for cfg in ('solo', 'ally'):
        for arm, rows in (('with', w), ('without', wo)):
            sel = [r for r in rows if r['config'] == cfg and r['seed'] in SCORED]
            key = f'{cfg}_{arm}'
            out[key] = {
                'n': len(sel),
                'totalDamage': med([r['totalDamage'] for r in sel]),
                'vTaken': med([r['vTaken'] for r in sel]),
                'rounds': med([r['rounds'] for r in sel]),
                'outcomes': sorted(set(r['outcome'] for r in sel)),
                'ffFired': sorted(set(x for r in sel for x in r.get('ffFired', []))),
                'logHasAbilityWord': any(
                    re.search(ability.replace('_', '[ _]'), r.get('log', ''), re.I)
                    for r in sel),
            }
        sw, swo = out[f'{cfg}_with'], out[f'{cfg}_without']
        out[f'{cfg}_delta'] = {
            'totalDamage_pct': pct(sw['totalDamage'], swo['totalDamage']),
            'vTaken_pct': pct(sw['vTaken'], swo['vTaken']),
            'rounds_delta': (sw['rounds'] - swo['rounds'])
            if sw['rounds'] is not None and swo['rounds'] is not None else None,
            'outcome_flip': sw['outcomes'] != swo['outcomes'],
        }
    # fire verdict: ffFired OR log marker in either config
    fired = any(out[f'{c}_with']['ffFired'] or out[f'{c}_with']['logHasAbilityWord']
                for c in ('solo', 'ally'))
    out['fired'] = fired
    # best delta across configs
    d = max([out[f'{c}_delta']['totalDamage_pct'] or 0 for c in ('solo', 'ally')] +
            [-(out[f'{c}_delta']['vTaken_pct'] or 0) for c in ('solo', 'ally')])
    out['best_delta_pct'] = d
    return out


def main():
    abilities = sys.argv[1:] or sorted(
        set(re.match(r'ability-(.+)-with\.json', os.path.basename(p)).group(1)
            for p in glob.glob(os.path.join(BASE, 'ability-*-with.json'))))
    print(f"{'ability':22} {'fired':5} {'solo dDmg%':>10} {'solo dTaken%':>11} "
          f"{'ally dDmg%':>10} {'ally dTaken%':>11} outcomes(solo) outcomes(ally)")
    for ab in abilities:
        r = analyze(ab)
        if not r:
            print(f"{ab:22} MISSING")
            continue
        ds, da = r['solo_delta'], r['ally_delta']
        print(f"{ab:22} {str(r['fired']):5} {str(ds['totalDamage_pct']):>10} "
              f"{str(ds['vTaken_pct']):>11} {str(da['totalDamage_pct']):>10} "
              f"{str(da['vTaken_pct']):>11} {r['solo_with']['outcomes']} vs "
              f"{r['solo_without']['outcomes']} | {r['ally_with']['outcomes']} vs "
              f"{r['ally_without']['outcomes']}")


if __name__ == '__main__':
    main()
