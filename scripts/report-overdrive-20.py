"""Arrange unretouched real captures and analyze linear luminance (Pillow/numpy/matplotlib).
These are developer reporting tools, not new game dependencies.
"""
import hashlib
import json
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

folder = Path('docs/captures/comic-overdrive-20')
variants = ['baseline', 'a', 'b']
labels = ['Antes · P3/P4', 'A · Tinta solar', 'B · Sombra elétrica']
roi = (280, 80, 940, 440)  # Same scene region; excludes most fixed HUD, never used to crop comparisons.
report = {'roiXYXY': roi, 'method': 'JPEG RGB decoded to linear sRGB; luminance Rec.709. ROI includes scenery/actors, excludes most HUD. No quality verdict from saturation alone.', 'scenes': {}}
hist, axes = plt.subplots(1, 2, figsize=(12, 3.5), constrained_layout=True)
for axis, scene in zip(axes, ['facade', 'classroom-a']):
    images = [np.asarray(Image.open(folder / f'{scene}-{v}.jpg').convert('RGB')) for v in variants]
    fig, panels = plt.subplots(1, 3, figsize=(24, 5.4), constrained_layout=True)
    for panel, rgb, label in zip(panels, images, labels):
        panel.imshow(rgb); panel.set_title(label, fontsize=17); panel.axis('off')
    fig.savefig(folder / f'{scene}-comparison.jpg', dpi=120); plt.close(fig)
    for index, variant in enumerate(['a', 'b'], 1):
        fig, panels = plt.subplots(1, 2, figsize=(16, 5.4), constrained_layout=True)
        for panel, rgb, label in zip(panels, [images[0], images[index]], [labels[0], labels[index]]):
            panel.imshow(rgb); panel.set_title(label, fontsize=16); panel.axis('off')
        fig.savefig(folder / f'{scene}-{variant}-comparison.jpg', dpi=120); plt.close(fig)
    report['scenes'][scene] = {}
    for variant, rgb, label in zip(variants, images, labels):
        x1, y1, x2, y2 = roi
        rgb = rgb[y1:y2, x1:x2].astype(float) / 255
        linear = np.where(rgb <= .04045, rgb / 12.92, ((rgb + .055) / 1.055) ** 2.4)
        lum = linear @ [.2126, .7152, .0722]
        values = {'mean': float(lum.mean()), 'p10': float(np.quantile(lum, .1)), 'p50': float(np.quantile(lum, .5)), 'p90': float(np.quantile(lum, .9)), 'nearWhitePercent': float((lum > .95).mean() * 100), 'nearBlackPercent': float((lum < .01).mean() * 100)}
        report['scenes'][scene][variant] = values
        axis.hist(lum.ravel(), bins=40, range=(0, 1), weights=np.ones(lum.size) / lum.size * 100, histtype='step', label=label)
    axis.set_title(scene); axis.set_xlabel('Luminância linear'); axis.set_ylabel('% dos pixels do recorte'); axis.legend(fontsize=8)
hist.savefig(folder / 'luminance.png', dpi=140); plt.close(hist)
(folder / 'luminance.json').write_text(json.dumps(report, indent=2) + '\n')
files = ['src/main.js', 'src/systems/comic-overdrive-p0.js', 'src/systems/comic-overdrive-20.js']
(folder / 'render-source.json').write_text(json.dumps({'note': 'A/B rendered in the D1 working tree after the D0 commit; renderer file hashes below identify that source independently of the HEAD stored in capture metadata. Baseline is the unchanged P3/P4 default.', 'sha256': {f: hashlib.sha256(Path(f).read_bytes()).hexdigest() for f in files}}, indent=2) + '\n')
for variant in variants:
    data = json.loads((folder / f'{variant}-metrics.json').read_text())
    print(variant, [(s['name'], s['drawCalls'], s['triangles'], s['geometries'], s['textures']) for s in data['samples'] if s['name'] in ['facade', 'classroom-a']])
for scene, values in report['scenes'].items():
    print(scene, {v: round(s['mean'], 3) for v, s in values.items()})
