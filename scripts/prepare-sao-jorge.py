#!/usr/bin/env python3
"""Deterministic, stdlib-only preparation of the supplied conceptual GLBs.
Geometry is decoded from source POSITION accessors (8 vertices per box), matched
against the supplied viewer palette, then regrouped with flat normals. All game
coordinates and door openings are artistic adaptations, never measured plans.
"""
import json, struct, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/'references/sao-jorge-v08'
source=json.loads((REF/'dados/maquete-extraida.json').read_text())
def decode_boxes(floor):
    b=(REF/f'modelos/pavimento_{floor+1}_CONCEITUAL.glb').read_bytes()
    size=struct.unpack_from('<I',b,12)[0]; g=json.loads(b[20:20+size]); binary=b[28+size:]
    primitive=g['meshes'][0]['primitives'][0]; a=g['accessors'][primitive['attributes']['POSITION']]; v=g['bufferViews'][a['bufferView']]
    start=v.get('byteOffset',0)+a.get('byteOffset',0)
    xyz=list(struct.iter_unpack('<fff',binary[start:start+a['count']*12]))
    records=[r for r in source['boxes'] if r[0]==floor]
    assert len(records)*8==len(xyz)
    out=[]
    for i,r in enumerate(records):
        pts=xyz[i*8:i*8+8]; lo=[min(p[k] for p in pts) for k in range(3)]; hi=[max(p[k] for p in pts) for k in range(3)]
        # Source individual GLBs already use floor-local coordinates.
        center=[(lo[k]+hi[k])/2 for k in range(3)]; extent=[hi[k]-lo[k] for k in range(3)]
        assert all(abs(center[k]-r[k+1]) < .001 for k in (0,2)), 'GLB/viewer coordinate mismatch'
        assert all(abs(extent[k]-r[k+4]) < .001 for k in range(3)), 'GLB/viewer extent mismatch'
        out.append(center+extent+[r[7]])
    return out

def linear(hexcolor):
    rgb=[int(hexcolor[i:i+2],16)/255 for i in (1,3,5)]
    return [v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
COLORS=[linear(c) for c in source['palette']]
def write_glb(path,layers,reused,floor):
    source_path=REF/f'modelos/pavimento_{floor+1}_CONCEITUAL.glb'
    g={'asset':{'version':'2.0','generator':'Aurora supplied GLB preparation','extras':{'sourceBoxes':reused,'sourceFile':source_path.name,'sourceSHA256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'vertexColorSpace':'linear'}},'scene':0,'scenes':[{'nodes':[0,1,2]}],'nodes':[],'meshes':[],'accessors':[],'bufferViews':[],'buffers':[],'materials':[{'name':'shared-vertex-palette','pbrMetallicRoughness':{'metallicFactor':0,'roughnessFactor':1}}]}; binary=bytearray()
    def accessor(values,kind):
        while len(binary)%4:binary.append(0)
        offset=len(binary); flat=[n for v in values for n in v]; binary.extend(struct.pack('<'+'f'*len(flat),*flat)); view=len(g['bufferViews']);g['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(flat)*4,'target':34962}); idx=len(g['accessors']);g['accessors'].append({'bufferView':view,'componentType':5126,'count':len(values),'type':kind,'min':[min(v[k] for v in values) for k in range(3)],'max':[max(v[k] for v in values) for k in range(3)]});return idx
    faces=[([1,0,0],[(1,0,0),(1,1,0),(1,1,1),(1,0,1)]),([-1,0,0],[(0,0,1),(0,1,1),(0,1,0),(0,0,0)]),([0,1,0],[(0,1,1),(1,1,1),(1,1,0),(0,1,0)]),([0,-1,0],[(0,0,0),(1,0,0),(1,0,1),(0,0,1)]),([0,0,1],[(1,0,1),(1,1,1),(0,1,1),(0,0,1)]),([0,0,-1],[(0,0,0),(0,1,0),(1,1,0),(1,0,0)])]
    for name,boxes in layers.items():
        pos=[];norm=[];col=[]
        for x,y,z,w,h,d,p in boxes:
            for n,corners in faces:
                for j in (0,1,2,0,2,3):
                    q=corners[j];pos.append([x+(q[0]-.5)*w,y+(q[1]-.5)*h,z+(q[2]-.5)*d]);norm.append(n);col.append(COLORS[p])
        attrs={k:accessor(v,'VEC3') for k,v in [('POSITION',pos),('NORMAL',norm),('COLOR_0',col)]};idx=len(g['meshes']);g['nodes'].append({'name':name,'mesh':idx});g['meshes'].append({'name':name,'primitives':[{'attributes':attrs,'material':0,'mode':4}]})
    g['buffers']=[{'byteLength':len(binary)}]; meta=json.dumps(g,separators=(',',':')).encode();meta+=b' '*((-len(meta))%4);binary+=b'\0'*((-len(binary))%4);total=12+8+len(meta)+8+len(binary);path.write_bytes(struct.pack('<III',0x46546c67,2,total)+struct.pack('<II',len(meta),0x4e4f534a)+meta+struct.pack('<II',len(binary),0x004e4942)+binary)

data={'rise':3.6,'coordinateSystem':'fictional game coordinates; no real measurements','vertexColorSpace':'linear','floors':[]}
for f in range(3):
    base=round(f*3.6,2);layers={'structure':[],'furniture':[],'floors':[]};colliders=[]; reused=0
    def add(layer,box,kind=None):
        layers[layer].append(box)
        if kind:
            x,y,z,w,h,d,p=box;colliders.append(dict(minX=round(x-w/2,5),maxX=round(x+w/2,5),minY=round(base+y-h/2,5),maxY=round(base+y+h/2,5),minZ=round(z-d/2,5),maxZ=round(z+d/2,5),kind=kind))
    rooms=[]
    for i,r in enumerate(r for r in source['rooms'] if r['floor']==f):
        if f==2 and r['type']!='hall':continue
        r=dict(r);r.pop('floor');r['id']=f'sj-f{f+1}-{i+1:02d}'
        if f==1 and r['type']=='class':r['name']=f'Sala de aula {chr(65+sum(q["type"]=="class" for q in rooms))}'
        if f==2:r.update(x1=-10.8,x2=10.8,z1=-18.8,z2=18.8)
        dx= -2 if r['x2']==-2 else 2 if r['x1']==2 else 0
        dz=r['z'] if dx else r['z2']
        r['door']={'x':-6.5 if f==2 else dx,'z':-14 if f==2 else dz,'width':2.2};r['provenance']='croqui_usuario; geometry, doors and furniture adapted for gameplay' if f<2 else 'third-floor hall confirmed; entire layout fictionalized'
        rooms.append(r)
    # Preserve actual source slabs, room finishes and furniture; replace low conceptual walls.
    for b in decode_boxes(f):
        x,y,z,w,h,d,p=b
        if y<.07 and h<.4:
            add('floors',b);reused+=1;continue
        if f==2:continue # stage, foyer, curtains and old stairs are unconfirmed
        room=next((r for r in rooms if r['x1']+.18<x<r['x2']-.18 and r['z1']+.18<z<r['z2']-.18),None)
        if not room or room['type']=='stair':continue
        if (p in (0,1) and (w>3 or d>3)) or h>1.7:continue
        # Clear a generous passage from corridor door to the middle of every room.
        if abs(z-room['door']['z'])<1.35+d/2 and ((x<0 and x+w/2>-7.3) or (x>0 and x-w/2<7.3)):continue
        if room['type']=='office' and abs(x)<1.2:continue
        add('furniture',b,'furniture' if y+h/2>.15 and min(w,d)>.025 else None);reused+=1
    # Full-height perimeter, original footprint; 3.05 leaves overhead clearance within 3.6 rise.
    for b in [[-11,1.525,0,.24,3.05,38,0],[11,1.525,0,.24,3.05,38,0],[0,1.525,-19,22,3.05,.24,0],[0,1.525,19,22,3.05,.24,0]]:add('structure',b,'wall')
    for x in [-10.85,10.85]:add('structure',[x,.24,0,.045,.15,38,2])
    if f<2:
        for r in rooms:
            x1,x2,z1,z2=[r[k] for k in ['x1','x2','z1','z2']]; dx=r['door']['x'];dz=r['door']['z']
            if dx:
                for a,b in [(z1,dz-1.1),(dz+1.1,z2)]:
                    if b>a:add('structure',[dx,1.525,(a+b)/2,.18,3.05,b-a,0],'wall')
                add('structure',[dx,2.825,dz,.18,.45,2.2,0],'wall')
                if z1>-19:add('structure',[(x1+x2)/2,1.525,z1,x2-x1,3.05,.18,0],'wall')
            else:
                for a,b in [(x1,-1.1),(1.1,x2)]:add('structure',[(a+b)/2,1.525,z2,b-a,3.05,.18,0],'wall')
                add('structure',[0,2.825,z2,2.2,.45,.18,0],'wall')
    else:
        # Neutral hall furniture, no stage or foyer; preserve source floor only.
        for x in [-9,9]:
            for z in [-7,0,7]:add('furniture',[x,.45,z,1.2,.9,.55,3],'furniture')
    stairs=([{'id':'sj-up-1','x':-6.5,'z':2.5,'destination':1,'spawn':{'x':-6.5,'z':-5}}] if f==0 else [{'id':'sj-down-2','x':-6.5,'z':-6,'destination':0,'spawn':{'x':-6.5,'z':2.5}},{'id':'sj-up-2','x':-6.5,'z':-4,'destination':2,'spawn':{'x':-6.5,'z':-14}}] if f==1 else [{'id':'sj-down-3','x':-6.5,'z':-14,'destination':1,'spawn':{'x':-6.5,'z':-5}}])
    url=f'/models/sao-jorge/pavimento-{f+1}.glb';write_glb(ROOT/'public'/url[1:],layers,reused,f)
    data['floors'].append(dict(index=f,label=f'{f+1}º andar',baseY=base,walkY=round(base+.03,2),url=url,spawn={'x':0,'z':14.5},rooms=rooms,colliders=colliders,stairs=stairs))
(ROOT/'src/data/sao-jorge.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
lines=['# São Jorge: matriz M1 de ambientes','','Cenário artístico inspirado nos croquis; coordenadas, alturas, portas e mobiliário são adaptações de jogo, não medidas reais. Três pisos e o salão superior são confirmados. Nomes numéricos conceituais foram removidos.','','| Piso | ID | Ambiente | Tipo | Limites X / Z do jogo | Proveniência |','| --- | --- | --- | --- | --- | --- |']
for f in data['floors']:
    for r in f['rooms']:lines.append(f"| {f['label']} | {r['id']} | {r['name']} | {r['type']} | {r['x1']}…{r['x2']} / {r['z1']}…{r['z2']} | {r['provenance']} |")
lines+=['','## Preparação reproduzível','','Execute `python scripts/prepare-sao-jorge.py`. O script lê os três GLBs conceituais originais, decodifica seus POSITIONs em caixas e reaproveita as lajes, acabamentos e mobiliário apropriado dos dois primeiros pisos. A paleta vem do JSON extraído do visualizador. Paredes baixas e escadas sólidas antigas são substituídas por paredes de 3,05 unidades e vãos de 2,2 × 2,6. O terceiro piso reutiliza as lajes originais; palco, foyer e suas divisórias/mobiliário são excluídos. Bancos neutros do salão são novos.','','Cada GLB tem três malhas/nós (`structure`, `furniture`, `floors`), um material e três draws. Vértices têm NORMAL plana e COLOR_0 em **RGB linear**, convertido da paleta sRGB. Sem texturas nem teto nesta etapa: a camada de inspeção pode mostrar os interiores por cima. Cada GLB usa Y local; o runtime posiciona o grupo em `baseY`. Colisores têm Y absoluto. Todo volume sólido preservado com altura relevante recebe colisor. Faixas decorativas baixas e pisos não bloqueiam.','','A escada é uma transição interativa ficcionalizada entre pontos livres, sem alegação de escada contínua. No segundo piso os pontos subir/descer são distintos. Todas as salas abrem para o corredor; o salão é um único espaço. Portas permanecem abertas nesta etapa.','','M1 preserva móveis conceituais onde cabem, mas não conclui o detalhamento M2. Os testes verificam cabeçalhos GLB, camadas, normais/cores, tipos de ambiente, portas livres e alcance em grade com raio de jogador 0,4.']
(ROOT/'docs/SAO_JORGE_ROOM_MATRIX.md').write_text('\n'.join(lines)+'\n')
print('Prepared',[(f['label'],len(f['colliders'])) for f in data['floors']])
