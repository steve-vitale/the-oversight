#!/usr/bin/env python3
"""Independent re-judge recomputation for sim-wildavoid-a.

Reads the EXISTING per-seed corpora (ctl + arm legs, 8 seeds 104411-104418)
and recomputes every bar of the frozen re-judge prereg
(evidence/2026-11-18/sim-wildavoid-rejudge-a-prereg.md) from scratch.
Written independently of scripts/analyze-wildavoid-a.js; the outmatched
rule is re-implemented from the prereg's description of the gate rule
(wave >= 4 AND (party < 3 OR not all armed OR not all armored)).

Usage: python3 scripts/rejudge-wildavoid-a.py
Writes: evidence/2026-11-18/wildavoid-rejudge-a-analysis.json
"""
import json, os, glob, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EV = os.path.join(REPO, 'evidence', '2026-11-18')
SEEDS = [104411, 104412, 104413, 104414, 104415, 104416, 104417, 104418]
WILD_ORIGINS = ['world-tick', 'aid', 'patrol']
W4_IDS = ['congregation', 'strike', 'influencer', 'audit', 'reunion',
          'suburb', 'eulogy', 'algorithm', 'eater', 'herald']


def load_dir(d):
    out = {}
    for f in sorted(glob.glob(os.path.join(d, '*.json'))):
        j = json.load(open(f))
        out[j['seed']] = j
    return out


def outmatched(snap, wave):
    """The expedition gate's outmatched rule, per prereg description."""
    if snap is None or not isinstance(snap.get('partySize'), int):
        return None  # unclassified
    if not isinstance(snap.get('allArmed'), bool) or not isinstance(snap.get('allArmored'), bool):
        return None
    if not isinstance(wave, int):
        return None
    if wave >= 4 and (snap['partySize'] < 3 or not snap['allArmed'] or not snap['allArmored']):
        return True
    return False


def launch_events_w4(j):
    n = 0
    for d in j.get('v4departs', []):
        if d.get('result') != 'launch':
            continue
        if (d.get('targetWave') or 0) >= 4 or (d.get('target') in W4_IDS):
            n += 1
    return n


def launches_w4(j):
    """Deduped wave-4+ launches by (vid, day), partySize = max."""
    groups = {}
    for d in j.get('v4departs', []):
        if d.get('result') != 'launch':
            continue
        if not ((d.get('targetWave') or 0) >= 4 or (d.get('target') in W4_IDS)):
            continue
        k = (d['vid'], d['day'])
        g = groups.setdefault(k, {'vid': d['vid'], 'day': d['day'], 'partySize': 1})
        g['partySize'] = max(g['partySize'], d.get('partySize') or 0)
    return list(groups.values())


def fingerprint(r):
    if not r:
        return None
    return json.dumps({
        'day': r['day'], 'scholar': r.get('scholarId'),
        'wkl': r.get('waveKillLog', []),
        'roster': [p['vid'] + ':' + ('1' if p.get('dead') else '0')
                   for p in r.get('roster', [])],
        'v4': (r.get('vetsW4') or {}).get('count', 0),
        'v3': (r.get('vetsW3') or {}).get('count', 0),
    }, sort_keys=True)


def seed_stats(j):
    enc = j.get('v4encounters', [])
    wild = [e for e in enc if e.get('origin') in WILD_ORIGINS]
    wild_w4 = [e for e in wild if (e.get('wave') or 0) >= 4]
    # would-avoid: classifier on the wild snapshot, verbatim rule
    would = [e for e in wild if outmatched(e.get('wild'), e.get('wave')) is True]
    unclassified = [e for e in wild if outmatched(e.get('wild'), e.get('wave')) is None]
    deaths = [e for e in wild_w4 if e.get('outcome') == 'vDie']
    flees = [e for e in wild_w4 if e.get('outcome') == 'vFlee']
    flee_taken = sum(e.get('vTaken') or 0 for e in flees)
    suburb = [e for e in wild if e.get('mid') == 'suburb']
    suburb_outmatched = [e for e in suburb if outmatched(e.get('wild'), e.get('wave')) is True]
    suburb_outmatched_deaths = [e for e in suburb_outmatched if e.get('outcome') == 'vDie']
    suburb_deaths = [e for e in suburb if e.get('outcome') == 'vDie']
    avoids = j.get('v4avoids', [])
    avoid_suburb = [a for a in avoids if a.get('mid') == 'suburb']
    # D3: expedition rows, replica vs live gate
    d3n = d3agree = 0
    for e in enc:
        if e.get('origin') != 'expedition' or not e.get('gate'):
            continue
        g = e['gate']
        if not isinstance(g.get('result'), str):
            continue
        snap = {'partySize': g.get('partySize'), 'allArmed': g.get('allArmed'),
                'allArmored': g.get('allArmored'), 'planStage': g.get('planStage'),
                'isTableVeteran': g.get('isTableVeteran')}
        rep = outmatched(snap, e.get('wave'))
        if rep is None:
            continue
        # veteran-guard is part of the gate too; the replica here is the
        # outmatched rule only, so only count rows where the live gate's
        # reason is outmatched/null (no veteran-guard fire).
        if g.get('reason') not in (None, 'outmatched'):
            continue
        d3n += 1
        if rep == (g['result'] == 'avoid'):
            d3agree += 1
    # instrument: missingHp / recMismatch, same definitions as analyzer
    missing_hp = rec_mismatch = 0
    for e in enc:
        no_contact = e.get('outcome') in ('evade', 'alreadyDead') or \
            ((e.get('rounds') or 0) == 0 and (e.get('mDealt') or 0) == 0)
        is_kill = e.get('outcome') == 'vKill'
        if e.get('mHpStart') is None and not no_contact and not is_kill:
            missing_hp += 1
        if e.get('mHpStart') is not None and e.get('mHpStartRec') is not None \
                and e['mHpStart'] != e['mHpStartRec']:
            rec_mismatch += 1
    say_lines = sum(1 for s in j.get('vetSays', [])
                    if isinstance(s.get('line'), str) and 'gives it room' in s['line'])
    return {
        'seed': j['seed'], 'days': j.get('days'),
        'instrumentErrors': len(j.get('instrumentErrors', [])),
        'encounters': len(enc), 'missingHp': missing_hp, 'recMismatch': rec_mismatch,
        'wildMeetings': len(wild), 'wildW4Meetings': len(wild_w4),
        'wildWouldAvoid': len(would),
        'wildWouldAvoidByRule': {'outmatched': len(would)},
        'wildUnclassified': len(unclassified),
        'wildDeaths': len(deaths), 'wildFleeTaken': flee_taken,
        'wildKills': sum(1 for e in wild_w4 if e.get('outcome') == 'vKill'),
        'wildSuburb': len(suburb),
        'wildSuburbOutcomes': {o: sum(1 for e in suburb if e.get('outcome') == o)
                               for o in set(e.get('outcome') for e in suburb)},
        'wildSuburbDeaths': len(suburb_deaths),
        'wildSuburbOutmatched': len(suburb_outmatched),
        'wildSuburbOutmatchedDeaths': len(suburb_outmatched_deaths),
        'wildSuburbTaken': sum(e.get('vTaken') or 0 for e in suburb),
        'trickSuburbKnown': bool(j.get('trickSuburbKnown')),
        'avoids': len(avoids),
        'avoidSuburb': len(avoid_suburb),
        'avoidByOrigin': {o: sum(1 for a in avoids if a.get('origin') == o)
                          for o in set(a.get('origin') for a in avoids)},
        'wildAvoidsStat': (j.get('winPlanStats') or {}).get('wildAvoids', 0),
        'sayAvoidLines': say_lines,
        'launchEventsW4': launch_events_w4(j),
        'launchesW4': len(launches_w4(j)),
        'd3n': d3n, 'd3agree': d3agree,
        'firstAvoidDay': min((a['day'] for a in avoids), default=None),
        'dailyFp': {r['day']: fingerprint(r) for r in j.get('daily', [])},
        'suburbRows': suburb,
        'avoidSuburbRows': avoid_suburb,
    }


def main():
    ctl = load_dir(os.path.join(EV, 'perseed-wildavoid-a-ctl'))
    arm = load_dir(os.path.join(EV, 'perseed-wildavoid-a-arm'))
    assert sorted(ctl) == SEEDS, sorted(ctl)
    assert sorted(arm) == SEEDS, sorted(arm)
    cs = {s: seed_stats(ctl[s]) for s in SEEDS}
    as_ = {s: seed_stats(arm[s]) for s in SEEDS}

    def tot(d, k):
        return sum(d[s][k] for s in SEEDS)

    # Trajectory control: first diverging day per seed.
    traj = []
    for s in SEEDS:
        cfp, afp = cs[s]['dailyFp'], as_[s]['dailyFp']
        days = sorted(set(cfp) | set(afp))
        first_div = next((d for d in days if cfp.get(d) != afp.get(d)), None)
        fad = as_[s]['firstAvoidDay']
        ok = (first_div is None and fad is None) or \
             (first_div is not None and fad is not None and first_div >= fad)
        traj.append({'seed': s, 'firstDivDay': first_div, 'firstAvoidDay': fad,
                     'pass': bool(ok)})

    # B4 re-scoped detail: the 104417 death, both legs, full row compare.
    def suburb_death_rows(stats, s):
        return [e for e in stats[s]['suburbRows'] if e.get('outcome') == 'vDie']
    d417 = {'ctl': suburb_death_rows(cs, 104417), 'arm': suburb_death_rows(as_, 104417)}
    death417 = {}
    if d417['ctl'] and d417['arm']:
        c, a = d417['ctl'][0], d417['arm'][0]
        death417 = {
            'ctlDay': c['day'], 'armDay': a['day'], 'sameDay': c['day'] == a['day'],
            'ctlOutcome': c.get('outcome'), 'armOutcome': a.get('outcome'),
            'ctlVTaken': c.get('vTaken'), 'armVTaken': a.get('vTaken'),
            'sameVTaken': c.get('vTaken') == a.get('vTaken'),
            'ctlVid': c.get('vid'), 'armVid': a.get('vid'),
            'ctlAllyVids': c.get('allyVids'), 'armAllyVids': a.get('allyVids'),
            'sameParty': (c.get('vid'), c.get('allyVids')) == (a.get('vid'), a.get('allyVids')),
            'ctlOrigin': c.get('origin'), 'armOrigin': a.get('origin'),
            'ctlWave': c.get('wave'), 'armWave': a.get('wave'),
            'ctlMid': c.get('mid'), 'armMid': a.get('mid'),
            'ctlGate': c.get('gate'), 'armGate': a.get('gate'),
            'ctlWild': c.get('wild'), 'armWild': a.get('wild'),
            'ctlTrickBefore': c.get('trickBefore'), 'armTrickBefore': a.get('trickBefore'),
            'ctlOutmatched': outmatched(c.get('wild'), c.get('wave')),
            'armOutmatched': outmatched(a.get('wild'), a.get('wave')),
        }
        # Pre-learning maulings on 104417: Suburb meetings days 94-97 both legs.
        death417['ctlSuburbDays'] = sorted(e['day'] for e in cs[104417]['suburbRows'])
        death417['armSuburbDays'] = sorted(e['day'] for e in as_[104417]['suburbRows'])
        death417['ctlSuburbDetail'] = [
            {'day': e['day'], 'outcome': e.get('outcome'), 'vTaken': e.get('vTaken'),
             'origin': e.get('origin'), 'trickBefore': e.get('trickBefore')}
            for e in sorted(cs[104417]['suburbRows'], key=lambda e: e['day'])]
        death417['armSuburbDetail'] = [
            {'day': e['day'], 'outcome': e.get('outcome'), 'vTaken': e.get('vTaken'),
             'origin': e.get('origin'), 'trickBefore': e.get('trickBefore')}
            for e in sorted(as_[104417]['suburbRows'], key=lambda e: e['day'])]
    death417['firstAvoidDay104417'] = as_[104417]['firstAvoidDay']
    death417['firstDivDay104417'] = next(
        t['firstDivDay'] for t in traj if t['seed'] == 104417)
    death417['predatesAvoid'] = (
        death417.get('ctlDay') is not None and as_[104417]['firstAvoidDay'] is not None
        and death417['ctlDay'] < as_[104417]['firstAvoidDay'])
    death417['predatesDivergence'] = (
        death417.get('ctlDay') is not None and death417['firstDivDay104417'] is not None
        and death417['ctlDay'] < death417['firstDivDay104417'])

    b1 = {'ctlWouldAvoid': tot(cs, 'wildWouldAvoid'), 'armAvoids': tot(as_, 'avoids'),
          'bar': 0.5}
    b1['ratio'] = (b1['armAvoids'] / b1['ctlWouldAvoid']) if b1['ctlWouldAvoid'] else None
    b1['pass'] = b1['ctlWouldAvoid'] >= 8 and b1['armAvoids'] >= 0.5 * b1['ctlWouldAvoid']
    b1['contact'] = b1['ctlWouldAvoid'] >= 8

    b2 = {'events': {'ctl': tot(cs, 'launchEventsW4'), 'arm': tot(as_, 'launchEventsW4')},
          'instances': {'ctl': tot(cs, 'launchesW4'), 'arm': tot(as_, 'launchesW4')},
          'bar': 0.9}
    b2['events']['pass'] = b2['events']['arm'] >= 0.9 * b2['events']['ctl']
    b2['instances']['pass'] = b2['instances']['arm'] >= 0.9 * b2['instances']['ctl']
    b2['pass'] = b2['events']['pass'] and b2['instances']['pass']

    b3 = {'deaths': {'ctl': tot(cs, 'wildDeaths'), 'arm': tot(as_, 'wildDeaths')},
          'fleeTaken': {'ctl': tot(cs, 'wildFleeTaken'), 'arm': tot(as_, 'wildFleeTaken')}}
    b3['pass'] = b3['deaths']['arm'] <= b3['deaths']['ctl'] and \
        b3['fleeTaken']['arm'] <= b3['fleeTaken']['ctl']

    # B4 re-scoped: outmatched Suburb deaths on arm == 0 AND every arm-leg
    # outmatched Suburb meeting was avoided (fought outmatched == 0, and
    # the avoids account for the outmatched meetings the arm met).
    arm_outmatched_fought = tot(as_, 'wildSuburbOutmatched')
    arm_outmatched_deaths = tot(as_, 'wildSuburbOutmatchedDeaths')
    ctl_outmatched_fought = tot(cs, 'wildSuburbOutmatched')
    b4 = {
        'armOutmatchedSuburbDeaths': arm_outmatched_deaths,
        'armOutmatchedSuburbFought': arm_outmatched_fought,
        'armAvoidSuburb': tot(as_, 'avoidSuburb'),
        'ctlOutmatchedSuburbFought': ctl_outmatched_fought,
        'ctlOutmatchedSuburbDeaths': tot(cs, 'wildSuburbOutmatchedDeaths'),
        'armSuburbDeathsAll': tot(as_, 'wildSuburbDeaths'),
        'ctlSuburbDeathsAll': tot(cs, 'wildSuburbDeaths'),
        'trickKnown': {'ctl': sum(1 for s in SEEDS if cs[s]['trickSuburbKnown']),
                       'arm': sum(1 for s in SEEDS if as_[s]['trickSuburbKnown'])},
        'death104417': death417,
    }
    b4['pass'] = (arm_outmatched_deaths == 0 and arm_outmatched_fought == 0
                  and b4['armAvoidSuburb'] >= 1)
    # The 104417 death must verify as matched + identical + pre-avoid.
    d = death417
    b4['death104417Verified'] = bool(
        d.get('sameDay') and d.get('sameVTaken') and d.get('sameParty')
        and d.get('ctlOutcome') == 'vDie' and d.get('armOutcome') == 'vDie'
        and d.get('ctlOutmatched') is False and d.get('armOutmatched') is False
        and d.get('predatesAvoid') and d.get('predatesDivergence'))

    b5 = {
        'files': {'ctl': len(ctl), 'arm': len(arm)},
        'errors': {'ctl': tot(cs, 'instrumentErrors'), 'arm': tot(as_, 'instrumentErrors')},
        'missingHp': {'ctl': tot(cs, 'missingHp'), 'arm': tot(as_, 'missingHp')},
        'recMismatch': {'ctl': tot(cs, 'recMismatch'), 'arm': tot(as_, 'recMismatch')},
        'unclassified': {'ctl': tot(cs, 'wildUnclassified'), 'arm': tot(as_, 'wildUnclassified')},
        'd3': {'ctl': {'n': tot(cs, 'd3n'), 'agree': tot(cs, 'd3agree')},
               'arm': {'n': tot(as_, 'd3n'), 'agree': tot(as_, 'd3agree')}},
        'wildAvoidsStat': {'ctl': tot(cs, 'wildAvoidsStat'), 'arm': tot(as_, 'wildAvoidsStat')},
        'avoids': {'ctl': tot(cs, 'avoids'), 'arm': tot(as_, 'avoids')},
        'sayLines': {'ctl': tot(cs, 'sayAvoidLines'), 'arm': tot(as_, 'sayAvoidLines')},
        'trajectory': traj,
    }
    b5['d3']['ctl']['agreement'] = (b5['d3']['ctl']['agree'] / b5['d3']['ctl']['n']
                                    if b5['d3']['ctl']['n'] else None)
    b5['d3']['arm']['agreement'] = (b5['d3']['arm']['agree'] / b5['d3']['arm']['n']
                                    if b5['d3']['arm']['n'] else None)
    b5['pass'] = (b5['files']['ctl'] == 8 and b5['files']['arm'] == 8
                  and b5['errors']['ctl'] == 0 and b5['errors']['arm'] == 0
                  and b5['missingHp']['ctl'] == 0 and b5['missingHp']['arm'] == 0
                  and b5['recMismatch']['ctl'] == 0 and b5['recMismatch']['arm'] == 0
                  and b5['d3']['ctl']['n'] >= 5 and b5['d3']['arm']['n'] >= 5
                  and b5['d3']['ctl']['agreement'] >= 0.95
                  and b5['d3']['arm']['agreement'] >= 0.95
                  and b5['wildAvoidsStat']['arm'] == b5['avoids']['arm']
                  and b5['sayLines']['arm'] == b5['avoids']['arm']
                  and b5['sayLines']['ctl'] == 0
                  and all(t['pass'] for t in traj))

    metric_broken = (b1['ctlWouldAvoid'] < 8 or tot(cs, 'wildW4Meetings') < 40
                     or b5['d3']['ctl']['n'] < 5 or b5['d3']['arm']['n'] < 5)
    verdict = 'GO' if (b1['pass'] and b2['pass'] and b3['pass'] and b4['pass']
                       and b4['death104417Verified'] and b5['pass']
                       and not metric_broken) else 'NO-GO'

    out = {
        'run': 'sim-wildavoid-rejudge-a', 'seeds': SEEDS,
        'bars': {'b1': b1, 'b2': b2, 'b3': b3, 'b4': b4, 'b5': b5},
        'metricBroken': metric_broken,
        'ctlWildW4Meetings': tot(cs, 'wildW4Meetings'),
        'armWildW4Meetings': tot(as_, 'wildW4Meetings'),
        'perSeed': {str(s): {'ctl': {k: cs[s][k] for k in
                                     ('wildMeetings', 'wildW4Meetings', 'wildWouldAvoid',
                                      'wildDeaths', 'wildFleeTaken', 'wildSuburb',
                                      'wildSuburbDeaths', 'wildSuburbOutmatched',
                                      'avoids', 'launchEventsW4', 'launchesW4',
                                      'trickSuburbKnown', 'firstAvoidDay')},
                              'arm': {k: as_[s][k] for k in
                                      ('wildMeetings', 'wildW4Meetings', 'wildWouldAvoid',
                                       'wildDeaths', 'wildFleeTaken', 'wildSuburb',
                                       'wildSuburbDeaths', 'wildSuburbOutmatched',
                                       'avoids', 'launchEventsW4', 'launchesW4',
                                       'trickSuburbKnown', 'firstAvoidDay')}}
                     for s in SEEDS},
        'verdict': verdict,
    }
    with open(os.path.join(EV, 'wildavoid-rejudge-a-analysis.json'), 'w') as f:
        json.dump(out, f, indent=1)
    print(json.dumps(out['bars'], indent=1))
    print('metricBroken:', metric_broken)
    print('VERDICT:', verdict)


if __name__ == '__main__':
    main()
