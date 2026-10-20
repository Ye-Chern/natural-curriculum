"""Independent exact model: all 512 binary 3x3 matrices, no GAP or databases."""
import argparse
from collections import Counter
from itertools import combinations, product
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def image(columns, v):
    value = 0
    for i, column in enumerate(columns):
        if v & (1 << i):
            value ^= column
    return value


def compose(a, b):
    return tuple(image(a, v) for v in b)


def rank_mod(matrix, prime):
    rows = [[v % prime for v in row] for row in matrix]
    rank = 0
    for column in range(len(rows[0])):
        pivot = next((i for i in range(rank, len(rows)) if rows[i][column]), None)
        if pivot is None:
            continue
        rows[rank], rows[pivot] = rows[pivot], rows[rank]
        inverse = pow(rows[rank][column], -1, prime)
        rows[rank] = [(v * inverse) % prime for v in rows[rank]]
        for i in range(len(rows)):
            if i != rank:
                multiple = rows[i][column]
                rows[i] = [(v - multiple * w) % prime for v, w in zip(rows[i], rows[rank])]
        rank += 1
    return rank


def calculate():
    # Every binary matrix is uniquely given by its three columns in 0..7.
    matrices = [a for a in product(range(8), repeat=3)
                if len({image(a, v) for v in range(8)}) == 8]
    identity = (1, 2, 4)
    inverses = {a: next(b for b in matrices if compose(a, b) == identity) for a in matrices}
    unseen, classes = set(matrices), []
    while unseen:
        a = min(unseen)
        conjugates = {compose(compose(b, a), inverses[b]) for b in matrices}
        if not conjugates <= unseen:
            raise AssertionError("Conjugacy classes overlap")
        classes.append(conjugates); unseen -= conjugates
    sizes = sorted(map(len, classes))
    normal_order_candidates = sorted({1 + sum(choice) for r in range(6)
                                     for choice in combinations([s for s in sizes if s != 1], r)
                                     if 168 % (1 + sum(choice)) == 0})
    points = set(range(1, 8))
    lines = sorted({frozenset([a, b, a ^ b]) for a, b in combinations(points, 2)}, key=lambda x: sorted(x))
    fixed_pairs = Counter()
    for a in matrices:
        fp = sum(image(a, v) == v for v in points)
        fl = sum(frozenset(image(a, v) for v in line) == line for line in lines)
        if fp != fl:
            raise AssertionError("Point/line fixed counts differ")
        fixed_pairs[fp] += 1
    stab = [a for a in matrices if image(a, 1) == 1]
    # If a point stabilizer fixed a line, its 3-point set would be invariant.
    invariant_lines = [sorted(line) for line in lines
                       if all(frozenset(image(a, v) for v in line) == line for a in stab)]
    incidence = [[int(point in line) for line in lines] for point in range(1, 8)]
    gram = [[sum(x * y for x, y in zip(a, b)) for b in incidence] for a in incidence]
    assert gram == [[3 if i == j else 1 for j in range(7)] for i in range(7)]
    # Binary line vectors, independently compare their span with a parity-check kernel.
    code = {0}
    for line in lines:
        mask = sum(1 << (v - 1) for v in line)
        code |= {word ^ mask for word in code}
    kernel = set()
    for word in range(128):
        syndrome = 0
        for v in range(1, 8):
            if word & (1 << (v - 1)):
                syndrome ^= v
        if syndrome == 0:
            kernel.add(word)
    assert code == kernel and len(code) == 16
    weights = Counter(word.bit_count() for word in code)
    assert min(word.bit_count() for word in code if word) == 3
    ranks_two = [rank_mod([[a * v + b for v in row] for row in incidence], 2)
                 for a, b in product(range(2), repeat=2)]
    rank_three = rank_mod(incidence, 3)
    rank_three_corrected = rank_mod([[v + 1 for v in row] for row in incidence], 3)
    assert max(ranks_two) < 7 and rank_three == 6 and rank_three_corrected == 7
    assert len(matrices) == 168 and sizes == [1, 21, 24, 24, 42, 56]
    assert normal_order_candidates == [1, 168]
    assert len(lines) == 7 and len(stab) == 24 and not invariant_lines
    return {"scope": "all 512 binary 3x3 matrices; all 168 invertible matrices",
            "group_order": len(matrices), "conjugacy_class_sizes": sizes,
            "normal_subgroup_order_candidates_from_class_unions": normal_order_candidates,
            "points": 7, "lines": [sorted(line) for line in lines],
            "point_stabilizer_order": len(stab), "point_stabilizer_invariant_lines": invariant_lines,
            "fixed_point_count_histogram_equal_to_line_histogram": dict(sorted(fixed_pairs.items())),
            "incidence_gram_matrix": gram,
            "binary_line_span_equals_parity_check_kernel": True,
            "binary_code_weight_histogram": dict(sorted(weights.items())),
            "ranks_over_F2_of_aM_plus_bJ_for_pairs_00_01_10_11": ranks_two,
            "rank_over_F3_of_M": rank_three,
            "rank_over_F3_of_M_plus_J": rank_three_corrected,
            "status": "exact-finite-check; mathematical coverage argument in minimal-index.md"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    path = ROOT / "research/results/fano.json"
    output = json.dumps(calculate(), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if path.read_text(encoding="utf-8") != output:
            raise SystemExit("Fano finite check drift")
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(output, encoding="utf-8", newline="\n")
    print("Exact Fano check passed: 168 matrices, 6 conjugacy classes, all point/line fixed counts")
