# sim-vetrel1 — wave-5 unlock-path stall attribution, VETREL diagnostic

Control (vetrel-off): 16 runs. Armed (vetrel-on): 16 runs. 8 fresh seeds 63901-63908 x {leadfeast, belongfeast} per arm, 180d death-aware, pre-seat + windefer.

## Arm shift (off -> on)

| dimension | off | on | delta |
|---|---|---|---|
| stall: progressed-but-stalled | 5 | 5 | +0 |
| stall: engaged-but-failed | 8 | 9 | +1 |
| stall: never-progressed | 3 | 2 | -1 |
| door-reaching runs | 8 | 9 | +1 |
| veteran leg met (r5 vet>=2) | 0 | 1 | +1 |
| villager wave-4 kills (villager+companion via) | 0 | 3 | +3 |
| total wave-4 kills | 7 | 6 | -1 |
| wall: national | 13 | 11 | -2 |
| wall: table | 11 | 11 | +0 |
| wall: wins | 0 | 0 | +0 |
| wall: wave-4 unlocks | 10 | 13 | +3 |
| wall: wave-5 unlocks | 0 | 0 | +0 |
| wall: median survival | 182 | 124 | -58 |
| deaths/100d (median) | 0 | 0 | +0 |

## vetrel-off — stall attribution (16 runs)

Classes: progressed-but-stalled 5 | engaged-but-failed 8 | never-progressed 3

| run | class | sub | w4d | firstDef5d | w5d | end | attempts (outcome) | termRaw/cap | war/dip/plenty | w4kills (via) | r5 short @stall |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| belongfeast-s63901 | engaged-but-failed | w5door-without-w4 | — | d133 | — | survived:d183 | d133-140:regressed; d147-183:horizon | 340/200 | 100/0/240 | 0 () | armor+weapons+veterans |
| belongfeast-s63902 | progressed-but-stalled | — | d148 | — | — | survived:d182 | — | 205/125 | 25/0/180 | 0 () | armor+weapons+veterans |
| belongfeast-s63903 | engaged-but-failed | w5door-without-w4 | — | d107 | — | village-lost:d123 | d107-123:died | 414/234 | 100/34/280 | 0 () | armor+veterans |
| belongfeast-s63904 | progressed-but-stalled | — | d120 | — | — | survived:d182 | — | 205/125 | 25/0/180 | 0 () | armor+weapons+veterans |
| belongfeast-s63905 | engaged-but-failed | — | d87 | d107 | — | village-lost:d130 | d107-130:died | 280/200 | 100/0/180 | 2 (player:2) | armor+weapons+veterans |
| belongfeast-s63906 | progressed-but-stalled | — | d147 | — | — | survived:d182 | — | 235/175 | 75/0/160 | 0 () | armor+veterans |
| belongfeast-s63907 | progressed-but-stalled | — | d77 | — | — | village-lost:d134 | — | 165/125 | 25/0/140 | 0 () | armor+weapons+veterans |
| belongfeast-s63908 | never-progressed | — | — | — | — | village-lost:d40 | — | 40/40 | 0/0/40 | 0 () | armor+veterans |
| leadfeast-s63901 | progressed-but-stalled | — | d69 | — | — | village-lost:d113 | — | 190/150 | 50/0/140 | 0 () | armor+weapons+veterans |
| leadfeast-s63902 | engaged-but-failed | — | d128 | d120 | — | survived:d182 | d120-182:horizon | 382/302 | 100/102/180 | 4 (player:4) | armor+veterans |
| leadfeast-s63903 | engaged-but-failed | — | d111 | d83 | — | survived:d182 | d83-182:horizon | 447/227 | 25/102/320 | 0 () | armor+weapons+veterans |
| leadfeast-s63904 | engaged-but-failed | — | d145 | d57 | — | survived:d182 | d57-182:horizon | 412/252 | 50/102/260 | 0 () | veterans |
| leadfeast-s63905 | never-progressed | — | — | — | — | village-lost:d66 | — | 20/20 | 0/0/20 | 0 () | armor+weapons+veterans |
| leadfeast-s63906 | engaged-but-failed | w5door-without-w4 | — | d62 | — | survived:d182 | d62-182:horizon | 322/202 | 0/102/220 | 0 () | armor+veterans |
| leadfeast-s63907 | engaged-but-failed | — | d76 | d62 | — | village-lost:d155 | d62-155:died | 357/277 | 75/102/180 | 1 (player:1) | armor+veterans |
| leadfeast-s63908 | never-progressed | — | — | — | — | village-lost:d138 | — | 105/105 | 25/0/80 | 0 () | armor+weapons+veterans |

Attempt outcomes: 9 windows across 8 runs — horizon: 5, died: 3, regressed: 1

## vetrel-on — stall attribution (16 runs)

Classes: progressed-but-stalled 5 | engaged-but-failed 9 | never-progressed 2

| run | class | sub | w4d | firstDef5d | w5d | end | attempts (outcome) | termRaw/cap | war/dip/plenty | w4kills (via) | r5 short @stall |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| belongfeast-s63901 | progressed-but-stalled | — | d70 | — | — | village-lost:d86 | — | 244/184 | 50/34/160 | 0 () | armor+weapons+veterans |
| belongfeast-s63902 | progressed-but-stalled | — | d175 | — | — | survived:d182 | — | 259/159 | 25/34/200 | 0 () | veterans |
| belongfeast-s63903 | engaged-but-failed | — | d101 | d94 | — | village-lost:d116 | d94-116:died | 439/259 | 125/34/280 | 0 () | armor+weapons+veterans |
| belongfeast-s63904 | engaged-but-failed | — | d138 | d181 | — | survived:d182 | d181-182:horizon | 329/209 | 75/34/220 | 1 (companion:1) | armor+veterans |
| belongfeast-s63905 | engaged-but-failed | w5door-without-w4 | — | d95 | — | village-lost:d113 | d95-113:died | 335/275 | 175/0/160 | 0 () | armor+weapons+veterans |
| belongfeast-s63906 | progressed-but-stalled | — | d80 | — | — | village-lost:d101 | — | 219/159 | 25/34/160 | 0 () | armor+weapons+veterans |
| belongfeast-s63907 | engaged-but-failed | — | d57 | d71 | — | village-lost:d167 | d71-167:died | 310/250 | 150/0/160 | 4 (player:2,companion:2) | armor+weapons |
| belongfeast-s63908 | never-progressed | — | — | — | — | village-lost:d40 | — | 40/40 | 0/0/40 | 0 () | armor+veterans |
| leadfeast-s63901 | progressed-but-stalled | — | d50 | — | — | village-lost:d65 | — | 175/175 | 75/0/100 | 0 () | armor+weapons+veterans |
| leadfeast-s63902 | engaged-but-failed | — | d121 | d121 | — | village-lost:d179 | d121-179:died | 317/277 | 75/102/140 | 0 () | armor+weapons+veterans |
| leadfeast-s63903 | engaged-but-failed | — | d121 | d83 | — | village-lost:d174 | d83-174:died | 482/302 | 100/102/280 | 0 () | armor+weapons+veterans |
| leadfeast-s63904 | engaged-but-failed | — | d126 | d57 | — | survived:d181 | d57-181:horizon | 437/277 | 75/102/260 | 1 (player:1) | armor+weapons+veterans |
| leadfeast-s63905 | never-progressed | — | — | — | — | village-lost:d73 | — | 20/20 | 0/0/20 | 0 () | armor+weapons+veterans |
| leadfeast-s63906 | engaged-but-failed | — | d152 | d62 | — | village-lost:d170 | d62-170:died | 352/252 | 50/102/200 | 0 () | armor+weapons+veterans |
| leadfeast-s63907 | engaged-but-failed | — | d78 | d62 | — | village-lost:d97 | d62-97:died | 287/227 | 25/102/160 | 0 () | armor+weapons+veterans |
| leadfeast-s63908 | progressed-but-stalled | — | d57 | — | — | village-lost:d124 | — | 130/130 | 50/0/80 | 0 () | armor+weapons+veterans |

Attempt outcomes: 9 windows across 9 runs — died: 7, horizon: 2
