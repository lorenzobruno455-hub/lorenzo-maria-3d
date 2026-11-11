"""Real capture contact sheet / comparisons. No retouching or generated game images."""
import hashlib
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image

root = Path('docs/captures/comic-overdrive-20-d3')
layout = json.loads(Path('src/data/sao-jorge.json').read_text())
aliases = {'sj-f1-01': 'classroom-a', 'sj-f1-06': 'library', 'sj-f2-07': 'classroom-c', 'sj-f2-10': 'laboratory', 'sj-f3-01': 'hall'}
rows = json.loads((root / 'rooms-metrics.json').read_text())['samples']
assert all(s['room'] == s['expectedRoom'] for s in rows), 'A restored room differs from its requested room'
coverage = []
for floor in layout['floors']:
    for room in floor['rooms']:
        name = aliases.get(room['id'], room['id'])
        path = root / f'{name}-after.jpg' if room['id'] in aliases else root / f'{name}-rooms.jpg'
        assert path.exists(), path
        sample = next((s for s in rows if s['name'] == room['id']), None)
        coverage.append({'floor': floor['index'] + 1, 'id': room['id'], 'name': room['name'], 'capture': path.name, 'restoredRoom': sample['room'] if sample else room['name'], 'evidence': 'diagnostics + screenshot' if sample else 'existing core screenshot / visible game HUD'})
fig, axes = plt.subplots(6, 4, figsize=(16, 17), constrained_layout=True)
for axis, room in zip(axes.flat, coverage):
    axis.imshow(Image.open(root / room['capture']))
    axis.set_title(f"{room['floor']}º · {room['name']}", fontsize=10); axis.axis('off')
fig.savefig(root / 'rooms-contact-sheet.jpg', dpi=110); plt.close(fig)
(root / 'coverage.json').write_text(json.dumps(coverage, ensure_ascii=False, indent=2) + '\n')
table = ['# Inspeção dos 24 ambientes — Fase 3', '', 'Lote de auditoria por ambiente; os comparativos finais documentam o ajuste posterior de matiz das sombras no piso. Geometria e navegação são as mesmas nos dois lotes.', '', '| Piso | ID | Ambiente | Captura real |', '| --- | --- | --- | --- |']
table += [f"| {r['floor']}º | {r['id']} | {r['name']} | [JPEG]({r['capture']}) |" for r in coverage]
(root / 'ROOMS.md').write_text('\n'.join(table) + '\n')
pairs = [
    ('classroom', Path('docs/captures/comic-overdrive-20/classroom-a-b.jpg'), root / 'classroom-a-after.jpg', 'B inicial · antes do piso informado', 'B ajustada · piso marrom escuro'),
    ('library', Path('docs/captures/comic-overdrive-20/library-baseline.jpg'), root / 'library-after.jpg', 'Antes · P3/P4', 'Agora · tinta e profundidade'),
    ('hall', Path('docs/captures/comic-overdrive-20/hall-baseline.jpg'), root / 'hall-after.jpg', 'Antes · P3/P4', 'Agora · salão preservado'),
    ('campus', Path('docs/captures/comic-overdrive-20-d2/campus-before.jpg'), root / 'campus-after.jpg', 'B inicial', 'Pavimentação cinza / tinta'),
]
for name, before, after, left, right in pairs:
    fig, axes = plt.subplots(1, 2, figsize=(16, 5.4), constrained_layout=True)
    for axis, path, title in zip(axes, [before, after], [left, right]):
        axis.imshow(Image.open(path)); axis.set_title(title, fontsize=16); axis.axis('off')
    fig.savefig(root / f'{name}-comparison.jpg', dpi=120); plt.close(fig)
files = ['src/main.js'] + ['src/systems/' + name for name in ['resources.js', 'batching.js', 'actor-ink-material.js', 'ink-outlines.js', 'comic-overdrive-nature.js', 'comic-overdrive-20.js', 'comic-overdrive-p0.js', 'school-comic-depth.js']]
(root / 'render-source.json').write_text(json.dumps({'note': 'Final D3 working-tree renderer hashes; captures reference the preceding local D2 HEAD, whose tree was published as ef346ba. Core captures survived an environment restart; unfinished browser processes were not counted as successful tests.', 'sha256': {f: hashlib.sha256(Path(f).read_bytes()).hexdigest() for f in files}}, indent=2) + '\n')
print(f'{len(coverage)} rooms; all requested/restored audit names match; four real comparison plates.')
