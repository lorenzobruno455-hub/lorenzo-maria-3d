"""Technical annotations on untouched real game renders, never generated scenery."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image

root=Path('docs/captures/comic-overdrive-20-d4')
data=json.loads((root/'annotation-points.json').read_text())
for name,view in data['views'].items():
 fig,ax=plt.subplots(figsize=(12,8));ax.imshow(Image.open(root/view['image']));ax.axis('off')
 annotations=[('facade','1  FACHADA PRINCIPAL\n3 níveis · rosa / azul · grade branca',(70,80),'#172944'),('annex','2  ANEXO PROPOSTO\nazul + cobertura vermelha',(690,80),'#172944'),('gate','3  ENTRADA LATERAL PROPOSTA\nConfirmar este local',(65,535),'#C2185B'),('corridor','4  PORTA ATUAL DO CORREDOR\nLigação a pé pelo trecho cinza',(620,535),'#07556B')]
 for key,label,pos,color in annotations:
  ax.annotate(label,xy=view['points'][key],xytext=pos,fontsize=10,fontweight='bold',color=color,bbox={'boxstyle':'round,pad=.5','fc':'#FFF4D9','ec':color,'lw':1.5},arrowprops={'arrowstyle':'->','color':color,'lw':2.3},ha='left',va='center')
  x,y=view['points'][key];ax.scatter([x],[y],s=60,c=color,edgecolors='white',zorder=5)
 route=view['route'];ax.plot([p[0] for p in route],[p[1] for p in route],'--',color='#FFDA24',lw=3,zorder=4)
 fig.suptitle('D3 · Proposta de fachada, anexo e entrada — AGUARDA CONFIRMAÇÃO',fontsize=13,fontweight='bold')
 fig.text(.5,.055,'Render real em câmera de revisão. Anexo e distâncias adaptados ao jogo; posição do acesso ainda não aprovada.\nTraço amarelo = ligação proposta entre portão 3 e porta 4. Croquis não definem esta implantação.',ha='center',fontsize=9)
 fig.tight_layout(rect=(0,.1,1,.96));fig.savefig(root/f'{name}-annotated.png',dpi=130);plt.close(fig)
