"""Labels projected from real camera diagnostics onto real game captures."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
root=Path('docs/captures/comic-overdrive-20-d4-confirmed')
data=json.loads((root/'annotation-points.json').read_text())
for name,view in data['views'].items():
 fig,ax=plt.subplots(figsize=(12,8));ax.imshow(Image.open(root/view['image']));ax.axis('off')
 # The campus view reveals all three gates; the photo view shows the external one.
 labels=[('court','G1 · PORTÃO EXTERNO DA QUADRA',(580,520))] if name=='overview' else [('court','G1 · PORTÃO EXTERNO\nEntrada da quadra',(25,90)),('school','G2 · PORTÃO DA ESCOLA\nDentro da quadra',(25,535)),('reception','G3 · ENTRADA DIRETA\nAbre na recepção',(580,535))]
 for key,label,pos in labels:
  ax.annotate(label,xy=view['points'][key],xytext=pos,fontsize=10,fontweight='bold',color='#131a2a',bbox={'boxstyle':'round,pad=.5','fc':'#FFF4D9','ec':'#131a2a','lw':1.5},arrowprops={'arrowstyle':'->','color':'#131a2a','lw':2.3},ha='left',va='center')
  x,y=view['points'][key];ax.scatter([x],[y],s=60,c='#ffe238',edgecolors='#131a2a',zorder=5)
 if name=='entry':
  route=view['route'];ax.plot([p[0] for p in route],[p[1] for p in route],'--',color='#ff3d9a',lw=3,zorder=4)
 fig.suptitle('Fase 4 · Quadra colada à escola e três portões confirmados',fontsize=13,fontweight='bold')
 fig.text(.5,.05,('Corte de revisão: somente a cobertura da quadra foi ocultada para revelar G2.\n' if name=='entry' else '')+'Render real do jogo. Dimensões adaptadas; implantação não é levantamento arquitetônico.',ha='center',fontsize=9)
 fig.tight_layout(rect=(0,.1,1,.96));fig.savefig(root/f'{name}-annotated.png',dpi=120);plt.close(fig)
