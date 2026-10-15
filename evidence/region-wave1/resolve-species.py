#!/usr/bin/env python3
"""region-wave1 species resolution: split different-species sharing one id,
merge biomes/regions for same-species shared across wave-1 regions.
Reads fragments, patches src/data in the given dataDir. Idempotent-ish:
skips splits whose new id already exists; merge unions are set-based.
"""
import json, os, sys

dataDir = sys.argv[1] if len(sys.argv) > 1 else 'src/data'
evBase = sys.argv[2] if len(sys.argv) > 2 else 'evidence/region-wave1'
fragEA = sys.argv[3] if len(sys.argv) > 3 else '/tmp/frag-eastasia/east_asia'

def load_frag_plants(r):
    p = os.path.join(fragEA if r == 'east_asia' else os.path.join(evBase, r), 'plants.json')
    frag = json.load(open(p))
    items = frag if isinstance(frag, list) else frag.get('plants', frag)
    return {x['id']: x for x in items}

def dump(path, obj):
    with open(path, 'w') as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write('\n')

plants_path = os.path.join(dataDir, 'plants.json')
plants = json.load(open(plants_path))
by_id = {p['id']: p for p in plants}
log = []

# --- 1. splits: different species, one id -> new id for the later region ---
splits = [
    ('water_chestnut', 'chinese_water_chestnut', 'east_asia'),
    ('bamboo_shoot', 'moso_bamboo_shoot', 'east_asia'),
    ('jujube', 'chinese_jujube', 'east_asia'),
]
for old_id, new_id, r in splits:
    if new_id in by_id:
        log.append(f'split {old_id}->{new_id}: already exists, skipped')
        continue
    entry = dict(load_frag_plants(r)[old_id])
    entry['id'] = new_id
    if isinstance(entry.get('taxon'), list) and len(entry['taxon']) == 3:
        entry['taxon'] = [entry['taxon'][0], entry['taxon'][1], new_id]
    plants.append(entry)
    by_id[new_id] = entry
    log.append(f'split {old_id}->{new_id} ({entry.get("scientific")})')

# --- 2. merges: same species -> union biomes + regions across fragments ---
merges = ['banana', 'guava', 'papaya', 'taro', 'moringa', 'neem', 'tamarind']
frag_plants = {r: load_frag_plants(r) for r in
               ['eu_temperate', 'sa_amazon', 'africa_sahel_savanna', 'south_asia', 'east_asia']}
for pid in merges:
    owners = [r for r in frag_plants if pid in frag_plants[r]]
    want_biomes, want_regions = [], []
    for r in owners:
        for b in frag_plants[r][pid].get('biomes', []):
            if b not in want_biomes: want_biomes.append(b)
        for rg in frag_plants[r][pid].get('regions', []):
            if rg not in want_regions: want_regions.append(rg)
    p = by_id[pid]
    added_b = [b for b in want_biomes if b not in p.get('biomes', [])]
    added_r = [rg for rg in want_regions if rg not in p.get('regions', [])]
    p['biomes'] = p.get('biomes', []) + added_b
    p['regions'] = p.get('regions', []) + added_r
    log.append(f'merge {pid}: +biomes {added_b} +regions {added_r}')
dump(plants_path, plants)

# --- 3. east_asia forageTable: point split ids at the new entries ---
biomes_path = os.path.join(dataDir, 'biomes.json')
biomes = json.load(open(biomes_path))
ea = next(b for b in biomes if b['id'] == 'east_asia_temperate')
ft = ea.get('forageTable', {})
for old_id, new_id, _ in splits:
    if old_id in ft:
        ft[new_id] = ft.pop(old_id)
        log.append(f'forageTable east_asia_temperate: {old_id}->{new_id}')
dump(biomes_path, biomes)

# --- 4. east_asia region flora bounty references ---
regions_path = os.path.join(dataDir, 'regions.json')
regions = json.load(open(regions_path))
ea_r = next(r for r in regions if r['id'] == 'east_asia')
def swap(obj):
    n = 0
    if isinstance(obj, dict):
        for k, v in obj.items(): n += swap(v)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            if isinstance(v, str):
                for old_id, new_id, _ in splits:
                    if v == old_id:
                        obj[i] = new_id; n += 1
            else: n += swap(v)
    return n
n = swap(ea_r.get('flora', {}))
log.append(f'regions.json east_asia flora: {n} reference(s) swapped')
dump(regions_path, regions)

print('\n'.join(log))
