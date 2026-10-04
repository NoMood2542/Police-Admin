from pathlib import Path
import json, re, zlib, base64

# E2 explanation payload is split only to keep repository writes small/reliable.
b64 = "".join(Path(f"tools/e2map.{i}").read_text(encoding="utf-8").strip() for i in range(1, 5))
mapping = json.loads(zlib.decompress(base64.b64decode(b64)).decode("utf-8"))
assert len(mapping) == 150, len(mapping)

p = Path("index.html")
s = p.read_text(encoding="utf-8")
marker = "window.POLICE69_DATA="
start = s.index(marker) + len(marker)
end = s.index("</script>", start)
raw = s[start:end].strip()
if raw.endswith(";"):
    raw = raw[:-1]
data = json.loads(raw)

# Content-critical snapshot: E2 is explanation-only.
def snapshot(d):
    rows = []
    for sec in d["sectionTests"]:
        for q in sec["questions"]:
            rows.append(("section", sec["name"], q["n"], q["q"], json.dumps(q["options"], ensure_ascii=False, sort_keys=True), q["answer"]))
    for q in d["diagnostic"]:
        rows.append(("diagnostic", q["n"], q["q"], json.dumps(q["options"], ensure_ascii=False, sort_keys=True), q["answer"]))
    return rows

before = snapshot(data)

count = 0
for sec in data["sectionTests"]:
    for q in sec["questions"]:
        rw = mapping.get(q["q"])
        if not rw:
            raise KeyError(f"Missing E2 explanation mapping: {q['q']}")
        q["explanation"] = rw["explanation"]
        q["tip"] = rw["tip"]
        q["explanationLevel"] = "E2-teaching"
        count += 1
assert count == 150

section_by_stem = {q["q"]: q for sec in data["sectionTests"] for q in sec["questions"]}
assert len(data["diagnostic"]) == 60
for q in data["diagnostic"]:
    src = section_by_stem.get(q["q"])
    if not src:
        raise KeyError(f"Diagnostic stem not found in section bank: {q['q']}")
    q["explanation"] = src["explanation"]
    q["tip"] = src["tip"]
    q["explanationLevel"] = "E2-teaching"

data["explanationOverhaul"] = {
    "version": "E2",
    "date": "2026-10-04",
    "scope": "sectionTests + diagnostic",
    "uniqueRewritten": 150,
    "diagnosticPropagated": 60,
    "standard": "why correct -> rule/method -> trap when useful -> reusable memory tip"
}

after = snapshot(data)
assert before == after, "E2 changed question/options/answer content"

# Explanation quality gates.
section_qs = [q for sec in data["sectionTests"] for q in sec["questions"]]
assert len(section_qs) == 150
assert all(len(q.get("explanation", "")) >= 45 for q in section_qs)
assert all(q.get("tip") for q in section_qs)
assert all(q.get("explanationLevel") == "E2-teaching" for q in section_qs + data["diagnostic"])
assert all(section_by_stem[q["q"]]["explanation"] == q["explanation"] for q in data["diagnostic"])

newraw = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
s = s[:start] + newraw + ";\n" + s[end:]

# Keep the existing v7.1 teaching feedback UI; advance the visible build badge.
s = re.sub(r'<span class="version-badge">[^<]*</span>', '<span class="version-badge">UX v7.2 · E2</span>', s, count=1)
assert 'class="memory-tip"' in s or '.memory-tip' in s, "Teaching feedback UI missing"

p.write_text(s, encoding="utf-8")
print("E2 PASS: 150 section explanations rewritten + 60 diagnostic explanations propagated")
