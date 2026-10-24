"""Recompute the explicit PSL(2,8) model without GAP or a group database."""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
from itertools import combinations, product
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESULT = ROOT / "research/results/psl2-8.json"
IDENTITY = (1, 0, 0, 1)
POINTS = tuple(range(9))  # 8 denotes infinity.


def field_multiply(a: int, b: int) -> int:
    """Polynomial multiplication modulo x^3+x+1 over F2."""
    out = 0
    while b:
        if b & 1:
            out ^= a
        b >>= 1
        a <<= 1
        if a & 8:
            a ^= 0b1011
    return out


MUL = tuple(tuple(field_multiply(a, b) for b in range(8)) for a in range(8))
INV = {a: next(b for b in range(1, 8) if MUL[a][b] == 1) for a in range(1, 8)}


def matrix_multiply(x: tuple, y: tuple) -> tuple:
    a, b, c, d = x
    e, f, g, h = y
    return (MUL[a][e] ^ MUL[b][g], MUL[a][f] ^ MUL[b][h],
            MUL[c][e] ^ MUL[d][g], MUL[c][f] ^ MUL[d][h])


def inverse(x: tuple) -> tuple:
    a, b, c, d = x
    return (d, b, c, a)  # determinant 1, characteristic 2.


def projective_image(x: tuple, z: int) -> int:
    a, b, c, d = x
    if z == 8:
        return 8 if c == 0 else MUL[a][INV[c]]
    numerator, denominator = MUL[a][z] ^ b, MUL[c][z] ^ d
    return 8 if denominator == 0 else MUL[numerator][INV[denominator]]


def recompute() -> dict:
    # These checks describe the finite field model rather than presupposing it.
    for a, b, c in product(range(8), repeat=3):
        assert MUL[a][b] == MUL[b][a]
        assert MUL[MUL[a][b]][c] == MUL[a][MUL[b][c]]
        assert MUL[a][b ^ c] == MUL[a][b] ^ MUL[a][c]
    group = tuple(x for x in product(range(8), repeat=4)
                  if MUL[x[0]][x[3]] ^ MUL[x[1]][x[2]] == 1)
    group_set = set(group)
    actions = {x: tuple(projective_image(x, z) for z in POINTS) for x in group}
    assert len(set(actions.values())) == len(group)
    assert all(set(p) == set(POINTS) for p in actions.values())
    assert all(matrix_multiply(x, inverse(x)) == IDENTITY for x in group)

    multiplication_pairs = 0
    for x, y in product(group, repeat=2):
        xy = matrix_multiply(x, y)
        assert xy in group_set
        assert actions[xy] == tuple(actions[x][actions[y][z]] for z in POINTS)
        multiplication_pairs += 1

    orders = Counter()
    seven_subgroups = set()
    for x in group:
        powers = [IDENTITY]
        value = x
        while value != IDENTITY:
            assert value not in powers
            powers.append(value)
            value = matrix_multiply(value, x)
        orders[len(powers)] += 1
        if len(powers) == 7:
            seven_subgroups.add(frozenset(powers))

    fixed_pairs, normalizer_sizes = set(), Counter()
    point_incidence = Counter({z: 0 for z in POINTS})
    for subgroup in seven_subgroups:
        common_fixed = tuple(z for z in POINTS
                            if all(actions[x][z] == z for x in subgroup))
        assert len(common_fixed) == 2
        assert common_fixed not in fixed_pairs
        fixed_pairs.add(common_fixed)
        for z in common_fixed:
            point_incidence[z] += 1
        normalizer_size = 0
        for g in group:
            conjugate = frozenset(matrix_multiply(matrix_multiply(g, p), inverse(g))
                                  for p in subgroup)
            normalizer_size += conjugate == subgroup
        normalizer_sizes[normalizer_size] += 1
    assert fixed_pairs == set(combinations(POINTS, 2))

    stabilizer_sizes = [sum(p[z] == z for p in actions.values()) for z in POINTS]
    ordered_pair_orbit = {(p[0], p[8]) for p in actions.values()}
    assert ordered_pair_orbit == {(x, y) for x, y in product(POINTS, repeat=2) if x != y}
    return {
        "model": "SL(2,F2[t]/(t^3+t+1)) = PSL(2,8)",
        "source_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "matrix_candidates": 8 ** 4,
        "group_order": len(group),
        "projective_points": len(POINTS),
        "distinct_projective_permutations": len(set(actions.values())),
        "multiplication_and_action_pairs_checked": multiplication_pairs,
        "element_orders": dict(sorted(orders.items())),
        "order_seven_subgroups": len(seven_subgroups),
        "distinct_common_fixed_pairs": len(fixed_pairs),
        "normalizer_size_histogram": dict(sorted(normalizer_sizes.items())),
        "point_stabilizer_sizes": stabilizer_sizes,
        "seven_subgroups_fixing_each_point": [point_incidence[z] for z in POINTS],
        "ordered_distinct_pair_orbit": len(ordered_pair_orbit),
        "proof_scope": "finite-model verification; minimum-index lower bound is in research/psl2-8.md",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="recompute and compare frozen output")
    args = parser.parse_args()
    output = json.dumps(recompute(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not RESULT.exists() or RESULT.read_text(encoding="utf-8") != output:
            raise SystemExit("PSL(2,8) model result changed; review before freezing again.")
        print("PSL(2,8): all 254016 multiplication/action pairs and 36 Sylow subgroups verified.")
    else:
        RESULT.parent.mkdir(parents=True, exist_ok=True)
        RESULT.write_text(output, encoding="utf-8", newline="\n")
        print(output, end="")
