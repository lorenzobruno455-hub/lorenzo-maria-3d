"""Original CC0 Aurora fictional avatars. Blender 4.3+: blender -b --python scripts/blender/build_aurora.py
Coordinates: metres, Z up, -Y forward; exporter converts to glTF +Z forward.
No downloaded meshes, paid services or AI generation. Change PALETTES / hair profiles to customize.
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
PALETTES={
 'lorenzo':dict(skin='#b98b6d',shirt='#f3ead2',accent='#e6a52e',pants='#304b68',hair='#303540',eye='#243947',shoe='#253040'),
 'bia':dict(skin='#bd8a68',shirt='#b04b50',accent='#f5d184',pants='#39465d',hair='#342a32',eye='#554638',shoe='#533f48'),
 'caio':dict(skin='#925c43',shirt='#368b9c',accent='#f0ce67',pants='#243e57',hair='#241e29',eye='#362b29',shoe='#eee2c9'),
 'helena':dict(skin='#d4a482',shirt='#79649d',accent='#e5c995',pants='#393848',hair='#555265',eye='#3b454a',shoe='#34303d'),
 'davi':dict(skin='#c38a66',shirt='#d3943e',accent='#43475b',pants='#3e5265',hair='#462d26',eye='#3b444b',shoe='#533d32'),
 'lia':dict(skin='#a56a4d',shirt='#63846b',accent='#f0dbc0',pants='#434356',hair='#30282e',eye='#413934',shoe='#39343f'),
 'maria':dict(skin='#ca967f',shirt='#198e98',accent='#f4cf58',pants='#35445c',hair='#543e50',eye='#304b58',shoe='#253040')}

def material(name,hexcolor):
 c=[int(hexcolor[i:i+2],16)/255 for i in (1,3,5)]
 c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c]
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Roughness'].default_value=.8
 return m

def create_avatar(name):
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for m in list(bpy.data.materials):bpy.data.materials.remove(m)
 mats={k:material(k,v) for k,v in PALETTES[name].items()}
 mats['eyeWhite']=material('eyeWhite','#fff3db');mats['ink']=material('ink','#1b2234')
 pieces=[]
 def attach(o,mat,bone):
  o.data.materials.append(mats[mat]);o.name=f'{mat}_{len(pieces)}'
  for p in o.data.polygons:p.use_smooth=True
  o.vertex_groups.new(name=bone).add(list(range(len(o.data.vertices))),1,'REPLACE');pieces.append(o);return o
 def sphere(pos,scale,mat,bone='head',segments=16,rings=10):
  bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=pos);o=bpy.context.object;o.scale=scale
  bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return attach(o,mat,bone)
 def box(pos,scale,mat,bone='chest',bevel=.012):
  bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
  if bevel:
   mod=o.modifiers.new('Soft tailored edge','BEVEL');mod.width=bevel;mod.segments=2;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
  return attach(o,mat,bone)
 def mesh_rings(label,rings,mat,bone='chest',N=16):
  # Elliptic cross sections form authored tapered anatomical/cloth surfaces.
  vertices=[]
  for z,rx,ry,cx,cy in rings:
   vertices += [(cx+rx*math.cos(2*math.pi*i/N),cy+ry*math.sin(2*math.pi*i/N),z) for i in range(N)]
  faces=[]
  for j in range(len(rings)-1):
   for i in range(N):a=j*N+i;b=j*N+(i+1)%N;faces.append((a,b,b+N,a+N))
  faces += [tuple(range(N-1,-1,-1)),tuple((len(rings)-1)*N+i for i in range(N))]
  data=bpy.data.meshes.new(label);data.from_pydata(vertices,[],faces);data.update();o=bpy.data.objects.new(label,data);bpy.context.collection.objects.link(o);return attach(o,mat,bone)
 def curve(points,radius,mat,bone='head'):
  data=bpy.data.curves.new('Authored seam','CURVE');data.dimensions='3D';data.resolution_u=2;data.bevel_depth=radius;data.bevel_resolution=1
  spline=data.splines.new('BEZIER');spline.bezier_points.add(len(points)-1)
  for p,co in zip(spline.bezier_points,points):p.co=co;p.handle_left_type=p.handle_right_type='AUTO'
  o=bpy.data.objects.new('Seam',data);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o=bpy.context.object;o.select_set(False);return attach(o,mat,bone)
 # Tailored torso: hip, waist, ribcage, shoulder, collar.
 mesh_rings('Tailored shirt',[(.91,.15,.098,0,0),(1.0,.155,.10,0,0),(1.12,.145,.092,0,0),(1.30,.195,.106,0,0),(1.39,.224,.105,0,0),(1.44,.165,.085,0,0),(1.46,.073,.062,0,0)],'shirt')
 mesh_rings('Trouser yoke',[(.85,.15,.09,0,0),(.94,.16,.10,0,0),(.98,.153,.10,0,0)],'pants','hips')
 mesh_rings('Ribbed hem',[(.94,.16,.102,0,0),(.975,.158,.102,0,0)],'accent','chest')
 sphere((0,0,1.49),(.062,.062,.10),'skin','neck')
 # Sculpted head with jawline, cheek and forehead profiles; no sphere head.
 mesh_rings('Sculpted head',[(1.52,.048,.058,0,-.018),(1.55,.078,.085,0,-.018),(1.60,.112,.101,0,0),(1.66,.125,.112,0,0),(1.73,.121,.109,0,.004),(1.79,.094,.089,0,.007),(1.815,.035,.04,0,.005)],'skin','head',24)
 for s in [-1,1]:
  sphere((s*.124,0,1.665),(.023,.025,.037),'skin')
  sphere((s*.135,-.012,1.665),(.009,.015,.02),'accent')
  # Slim almond eyes, iris, pupil, highlights; sculpted lids/brows.
  eye=sphere((s*.051,-.102,1.686),(.029,.012,.014),'eyeWhite',segments=16,rings=8);eye.rotation_euler[1]=s*.08
  sphere((s*.050,-.116,1.687),(.011,.004,.011),'eye',segments=12,rings=8)
  sphere((s*.049,-.121,1.687),(.005,.002,.007),'ink',segments=10,rings=6)
  sphere((s*.049-.004,-.124,1.694),(.003,.002,.004),'eyeWhite',segments=8,rings=6)
  curve([(s*.018,-.107,1.7),(s*.05,-.119,1.707),(s*.083,-.098,1.697)],.0035,'skin')
  curve([(s*.019,-.106,1.73),(s*.05,-.112,1.735),(s*.086,-.093,1.724)],.006,'hair')
  sphere((s*.063,-.085,1.635),(.028,.010,.019),'skin')
 sphere((0,-.109,1.657),(.014,.021,.028),'skin')
 sphere((0,-.125,1.639),(.018,.010,.010),'skin')
 curve([(-.035,-.099,1.604),(0,-.112,1.598),(.035,-.099,1.606)],.0035,'ink','jaw')
 sphere((0,-.101,1.591),(.026,.006,.005),'skin','jaw')
 # Original hair: a fitted cap with sculpted locks, contrasting silhouettes.
 mesh_rings('Hair cap',[(1.73,.126,.116,0,.006),(1.78,.127,.118,0,.012),(1.825,.092,.091,0,.018),(1.852,.02,.025,0,.02)],'hair','head',24)
 if name in ['lorenzo','caio','davi']:
  mesh_rings('Swept quiff',[(1.755,.095,.024,0,-.099),(1.80,.12,.04,-.005,-.067),(1.845,.085,.048,-.023,-.015),(1.863,.025,.022,-.045,.005)],'hair','head',20)
  for s in [-1,1]:mesh_rings('Sideburn',[(1.67,.012,.018,s*.119,.005),(1.76,.017,.05,s*.115,.005)],'hair','head',8)
 else:
  # Swept bob follows sides and back; face remains unobstructed.
  for i in range(11):
   a=math.pi*i/10
   x=.12*math.cos(a);y=.035+.082*math.sin(a)
   lock=sphere((x,y,1.675),(.035,.034,.14),'hair');lock.rotation_euler[1]=-.12*math.cos(a)
  for i in range(5):
   lock=sphere((-.085+i*.032,-.078,1.778),(.033,.049,.079-i*.006),'hair');lock.rotation_euler[1]=-.55
  curve([(-.12,-.008,1.744),(-.102,-.077,1.795),(.01,-.095,1.823),(.108,-.038,1.78)],.008,'accent')
 # Fictional NPC identity silhouettes and practical accessories, attached to rig bones.
 if name=='bia':
  sphere((.105,.10,1.77),(.075,.07,.08),'hair')
  # Cross-body book satchel, warm cover and brass clasp.
  box((.18,.09,1.02),(.15,.09,.21),'accent','hips',.018)
  curve([(-.17,-.09,1.4),(0,-.12,1.2),(.18,.03,1.04)],.013,'hair','chest')
 elif name=='caio':
  for x in [-.085,-.04,0,.04,.085]:sphere((x,.005,1.838),(.035,.065,.04),'hair')
  # Athletic chest stripe and sweatband.
  box((0,-.11,1.28),(.36,.012,.045),'accent','chest',.003)
  mesh_rings('Headband',[(1.752,.127,.119,0,.005),(1.776,.128,.12,0,.005)],'accent','head',24)
 elif name=='helena':
  sphere((0,.115,1.79),(.078,.069,.077),'hair')
  # Large round glasses remain readable from dialogue distance.
  for side in [-1,1]:
   points=[(side*.051+.038*math.cos(i*2*math.pi/16),-.125,1.685+.029*math.sin(i*2*math.pi/16)) for i in range(17)]
   curve(points,.004,'ink')
  curve([(-.014,-.126,1.691),(0,-.13,1.699),(.014,-.126,1.691)],.004,'ink')
  mesh_rings('Long cardigan',[(.82,.19,.12,0,.018),(1.05,.175,.115,0,.018),(1.3,.205,.113,0,.018)],'shirt','chest')
 elif name=='davi':
  # Over-ear headphones with a high, unmistakable arch.
  curve([(-.146,0,1.68),(-.14,0,1.84),(0,0,1.9),(.14,0,1.84),(.146,0,1.68)],.017,'accent')
  for side in [-1,1]:sphere((side*.145,0,1.68),(.028,.048,.057),'accent')
  box((0,.127,1.16),(.25,.13,.35),'accent','chest',.035)
  for side in [-1,1]:curve([(side*.12,-.08,1.4),(side*.15,-.11,1.23),(side*.12,-.09,1.02)],.014,'accent','chest')
 elif name=='lia':
  sphere((0,.10,1.80),(.07,.07,.09),'hair')
  # Soft work apron, front pocket and tied waist.
  box((0,-.116,1.08),(.31,.022,.40),'accent','chest',.01)
  box((0,-.134,1.08),(.15,.018,.11),'shirt','chest',.008)
  curve([(-.17,-.03,1.24),(0,-.126,1.23),(.17,-.03,1.24)],.011,'accent','chest')
 # Collar, piping, placket and stitched pocket.
 for s in [-1,1]:
  collar=box((s*.052,-.082,1.426),(.08,.022,.069),'accent',bevel=.006);collar.rotation_euler[1]=s*.32
  curve([(s*.151,-.063,1.0),(s*.156,-.073,1.12),(s*.19,-.068,1.32)],.0025,'accent','chest')
 box((-.105,-.104,1.292),(.067,.012,.078),'accent',bevel=.005)
 box((-.105,-.112,1.305),(.052,.003,.006),'shirt',bevel=.001)
 for z in [1.39,1.35,1.31]:sphere((0,-.111,z),(.004,.004,.004),'ink','chest',8,6)
 # School crest is original geometric sunrise, not a licensed logo.
 sphere((.095,-.111,1.303),(.026,.008,.031),'pants','chest',12,8)
 curve([(.08,-.12,1.292),(.095,-.12,1.32),(.11,-.12,1.292)],.003,'accent','chest')
 # Limbs have loops, proper joints, cuffs, palms, individually modeled fingers, layered soles.
 for s,label in [(-1,'L'),(1,'R')]:
  x=s*.092
  mesh_rings('Trouser thigh',[(.51,.067,.073,x,0),(.64,.075,.081,x,0),(.82,.084,.09,x,0),(.94,.085,.09,x,0)],'pants',f'thigh.{label}')
  mesh_rings('Trouser shin',[(.14,.054,.063,x,0),(.21,.055,.062,x,0),(.40,.06,.066,x,0),(.53,.069,.073,x,0)],'pants',f'shin.{label}')
  mesh_rings('Turned trouser cuff',[(.145,.057,.065,x,0),(.19,.058,.065,x,0)],'accent',f'shin.{label}')
  shoe=box((x,-.045,.084),(.137,.256,.11),'shoe',f'foot.{label}',.028)
  box((x,-.048,.029),(.145,.262,.045),'shirt',f'foot.{label}',.012)
  sphere((x,-.115,.095),(.068,.092,.045),'shoe',f'foot.{label}')
  for dy in [-.03,-.06,-.09]:curve([(x-.034,dy,.139),(x,dy-.008,.147),(x+.034,dy,.139)],.003,'eyeWhite',f'foot.{label}')
  ax=s*.25
  mesh_rings('Shirt sleeve',[(1.21,.066,.067,ax,0),(1.28,.072,.075,ax,0),(1.39,.081,.082,s*.226,0)],'shirt',f'upper_arm.{label}')
  mesh_rings('Sleeve cuff',[(1.205,.067,.068,ax,0),(1.24,.071,.072,ax,0)],'accent',f'upper_arm.{label}')
  mesh_rings('Upper arm',[(1.09,.048,.05,s*.267,0),(1.23,.053,.055,ax,0)],'skin',f'upper_arm.{label}')
  mesh_rings('Forearm',[(.87,.034,.035,s*.28,0),(1.0,.047,.046,s*.276,0),(1.11,.048,.05,s*.268,0)],'skin',f'forearm.{label}')
  sphere((s*.281,-.002,.835),(.039,.024,.059),'skin',f'hand.{label}')
  for i in range(4):
   xx=s*.281+(i-1.5)*.018
   sphere((xx,-.005,.779+abs(i-1.5)*.006),(.009,.013,.033),'skin',f'hand.{label}',10,6)
  thumb=sphere((s*.245,-.009,.823),(.014,.018,.034),'skin',f'hand.{label}',10,6);thumb.rotation_euler[1]=s*.5
 # Join one mesh with grouped materials, bind all authored weights to an actual skeleton.
 bpy.ops.object.select_all(action='DESELECT')
 for o in pieces:o.select_set(True)
 bpy.context.view_layer.objects.active=pieces[0];bpy.ops.object.join();body=bpy.context.object;body.name=f'Aurora_{name}_fictional'
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 bpy.ops.object.select_all(action='DESELECT');bpy.ops.object.armature_add();rig=bpy.context.object;rig.name=f'Aurora_{name}_rig'
 bpy.ops.object.mode_set(mode='EDIT');rig.data.edit_bones.remove(rig.data.edit_bones[0])
 def bone(n,head,tail,parent=None):
  b=rig.data.edit_bones.new(n);b.head=head;b.tail=tail
  if parent:b.parent=rig.data.edit_bones[parent]
 bone('root',(0,0,0),(0,0,.15));bone('hips',(0,0,.9),(0,0,1.04),'root');bone('chest',(0,0,1.04),(0,0,1.43),'hips');bone('neck',(0,0,1.43),(0,0,1.54),'chest');bone('head',(0,0,1.54),(0,0,1.81),'neck');bone('jaw',(0,-.04,1.61),(0,-.08,1.56),'head')
 for s,label in [(-1,'L'),(1,'R')]:
  bone(f'thigh.{label}',(s*.092,0,.92),(s*.092,0,.52),'hips');bone(f'shin.{label}',(s*.092,0,.52),(s*.092,0,.14),f'thigh.{label}');bone(f'foot.{label}',(s*.092,0,.14),(s*.092,-.15,.07),f'shin.{label}')
  bone(f'upper_arm.{label}',(s*.226,0,1.39),(s*.268,0,1.10),'chest');bone(f'forearm.{label}',(s*.268,0,1.10),(s*.28,0,.87),f'upper_arm.{label}');bone(f'hand.{label}',(s*.28,0,.87),(s*.28,0,.77),f'forearm.{label}')
 bpy.ops.object.mode_set(mode='OBJECT');body.parent=rig;mod=body.modifiers.new('Aurora skin','ARMATURE');mod.object=rig
 rig.animation_data_create();scene=bpy.context.scene;scene.render.fps=24
 for clip,frames in [('Idle',48),('Walk',24),('Run',18),('Talk',48),('Interact',36),('Turn',36),('Sit',48),('Stand',36),('Wave',48),('Observe',48),('React',36),('Accelerate',12),('Decelerate',12),('Point',36),('Pickup',36),('OpenBook',48)]:
  action=bpy.data.actions.new(clip);rig.animation_data.action=action
  for f in range(0,frames+1,3):
   phase=2*math.pi*f/frames
   for p in rig.pose.bones:p.rotation_mode='XYZ';p.rotation_euler=(0,0,0);p.location=(0,0,0)
   p=rig.pose.bones
   if clip in ['Walk','Run','Accelerate','Decelerate']:
    a=.82 if clip=='Run' else .52
    if clip=='Accelerate':a*=math.sin(math.pi*f/(2*frames))
    if clip=='Decelerate':a*=math.cos(math.pi*f/(2*frames))
    for side,off in [('L',0),('R',math.pi)]:
     swing=math.sin(phase+off);p[f'thigh.{side}'].rotation_euler.x=swing*a;p[f'shin.{side}'].rotation_euler.x=-max(0,-swing)*a*1.3
     p[f'upper_arm.{side}'].rotation_euler.x=-swing*a*.65;p[f'forearm.{side}'].rotation_euler.x=-.12-(.65 if clip=='Run' else .1)
    p['hips'].location.y=abs(math.sin(phase))*(.018 if clip=='Walk' else .035)
    p['chest'].rotation_euler.x=.06 if clip=='Run' else .015
   elif clip=='Talk':
    p['head'].rotation_euler.z=math.sin(phase)*.075;p['head'].rotation_euler.x=math.sin(phase*2)*.035;p['jaw'].rotation_euler.x=.06*max(0,math.sin(phase*4));p['upper_arm.L'].rotation_euler.x=-.3-.12*math.sin(phase);p['forearm.L'].rotation_euler.x=-.45
   elif clip=='Wave':p['upper_arm.R'].rotation_euler.z=-2.3;p['forearm.R'].rotation_euler.x=.25*math.sin(phase*3)
   elif clip=='Sit':
    p['hips'].location.y=-.48
    for side in ['L','R']:p[f'thigh.{side}'].rotation_euler.x=-1.45;p[f'shin.{side}'].rotation_euler.x=1.45
   elif clip=='Point':
    envelope=math.sin(math.pi*f/frames)**.5
    p['upper_arm.R'].rotation_euler.x=-1.35*envelope;p['forearm.R'].rotation_euler.x=-.12*envelope;p['head'].rotation_euler.z=-.1*envelope
   elif clip=='Pickup':
    envelope=math.sin(math.pi*f/frames)**2
    p['chest'].rotation_euler.x=.6*envelope;p['upper_arm.R'].rotation_euler.x=-.65*envelope;p['forearm.R'].rotation_euler.x=-.3*envelope
    for side in ['L','R']:p[f'thigh.{side}'].rotation_euler.x=-.25*envelope;p[f'shin.{side}'].rotation_euler.x=.25*envelope
   elif clip=='OpenBook':
    envelope=math.sin(math.pi*f/frames)**.4
    for side in ['L','R']:p[f'upper_arm.{side}'].rotation_euler.x=-.45*envelope;p[f'forearm.{side}'].rotation_euler.x=-1.05*envelope
    p['head'].rotation_euler.x=.18*envelope
   elif clip=='Stand':
    envelope=(1-f/frames)**2;p['hips'].location.y=-.48*envelope
    for side in ['L','R']:p[f'thigh.{side}'].rotation_euler.x=-1.45*envelope;p[f'shin.{side}'].rotation_euler.x=1.45*envelope
   elif clip=='Interact':p['upper_arm.L'].rotation_euler.x=-.7*math.sin(math.pi*f/frames)**2;p['forearm.L'].rotation_euler.x=-.45*math.sin(math.pi*f/frames)**2
   elif clip=='Turn':p['chest'].rotation_euler.z=.15*math.sin(phase)
   elif clip=='Observe':p['head'].rotation_euler.x=.12*math.sin(math.pi*f/frames)**2
   elif clip=='React':p['head'].rotation_euler.x=-.10*math.sin(phase);p['upper_arm.R'].rotation_euler.y=-.2*math.sin(phase)
   else:p['chest'].rotation_euler.x=.012*math.sin(phase);p['head'].rotation_euler.z=.018*math.sin(phase)
   for pb in p:pb.keyframe_insert('rotation_euler',frame=f);pb.keyframe_insert('location',frame=f)
  track=rig.animation_data.nla_tracks.new();track.name=clip;strip=track.strips.new(clip,0,action);strip.action_frame_start=0;strip.action_frame_end=frames
 rig.animation_data.action=None;scene.frame_set(0)
 for pb in rig.pose.bones:pb.rotation_euler=(0,0,0);pb.location=(0,0,0)
 bpy.context.view_layer.update()
 body['fictional']=True;body['license']='CC0-1.0';body['author']='Lorenzo & Maria / Project Aurora';body['front']='+Z in glTF';body['customization']='scripts/blender/build_aurora.py PALETTES'
 out=ROOT/'public/models/aurora';out.mkdir(parents=True,exist_ok=True)
 bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);body.select_set(True);bpy.context.view_layer.objects.active=rig
 bpy.ops.export_scene.gltf(filepath=str(out/f'{name}.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_skins=True,export_extras=True,export_force_sampling=True,export_materials='EXPORT')
 print('AURORA_GENERATED',name,len(body.data.vertices),len(body.data.polygons))
import sys
selected=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else list(PALETTES)
for character in selected:create_avatar(character)
