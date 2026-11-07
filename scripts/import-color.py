"""Import only literal data from the supplied HTML; never execute its scripts."""
import re,json,ast,hashlib,sys
from pathlib import Path
source=Path(sys.argv[1]); text=source.read_text(); out=Path('src/data')
def expression_at(pos):
 start=pos
 if text[pos] in "\"'":
  quote=text[pos];pos+=1
  while pos<len(text):
   if text[pos]=='\\':pos+=2;continue
   if text[pos]==quote:return text[start:pos+1]
   pos+=1
 stack=[];quote=None
 for pos in range(start,len(text)):
  c=text[pos]
  if quote:
   if c==quote and len(re.search(r'\\*$',text[start:pos]).group())%2==0:quote=None
   continue
  if c in "\"'":quote=c;continue
  if c in '[{(':stack.append(c)
  if c in ']})':
   stack.pop()
   if not stack:return text[start:pos+1]
 raise ValueError('Unbalanced literal')
def literal(expr):
 tokens=re.findall(r'''"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_$][\w$]*|-?\d+(?:\.\d+)?|[\[\]{},:]|\S''',expr)
 def parse(i):
  t=tokens[i]
  if t in ['[','{']:
   obj=[] if t=='[' else {};end=']' if t=='[' else '}';i+=1
   while tokens[i]!=end:
    if tokens[i]==',':i+=1;continue
    if t=='{':
     key=ast.literal_eval(tokens[i]) if tokens[i][0] in "\"'" else tokens[i];assert tokens[i+1]==':';v,i=parse(i+2);obj[key]=v
    else:v,i=parse(i);obj.append(v)
   return obj,i+1
  if t[0] in "\"'":return ast.literal_eval(t),i+1
  if re.fullmatch(r'-?\d+(?:\.\d+)?',t):return float(t) if '.' in t else int(t),i+1
  if t in ['true','false','null']:return {'true':True,'false':False,'null':None}[t],i+1
  raise ValueError('Nonliteral token: '+t)
 value,i=parse(0);assert i==len(tokens);return value
def get(name):
 m=re.search(r'\b'+name+r'\s*=\s*',text);return literal(expression_at(m.end()))
def write(name,data):out.joinpath(name+'.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def category(line):
 for key,words in [('fé',['deus','rez','fé','divin']),('música',['músic','rock','rhcp','foo fighters','everlong','trilha']),('escola',['escola','aula','engenheir','universit','tese']),('filosofia',['universo','filosof','livre-arbítrio','consciência','sentido']),('humor',['piada','maluc','esquisit','npc']),('especiais',['te amo','eternidade'])]:
  if any(w in line.lower() for w in words):return key
 return 'cotidianas'
all_dialogues=[];counts={}
for name,speaker in [('LL','LORENZO'),('MM','MARIA'),('NN','NARRADOR')]:
 rows=get(name)
 for m in re.finditer(r'\b'+name+r'\s*=\s*'+name+r'\.concat\(',text):rows+=literal(expression_at(m.end()))
 counts[name]=len(rows)
 all_dialogues += [dict(id=f'{name.lower()}-{i+1:03}',source=name,speaker=speaker,text=line,category=category(line),provenance='creative-fiction') for i,line in enumerate(rows)]
write('dialogues',all_dialogues)
locations=[(-17,-7,'Sala de história'),(-7,20,'Jardim'),(-24,19,'Espaço de reflexão'),(7,15,'Pátio'),(23,20,'Jardim das flores'),(17,-7,'Biblioteca')]
memories=[];chapters=[]
for i,m in enumerate(get('MO')):
 x,z,place=locations[i];mid=f'memory-{i+1}';cid=f'chapter-{i+1}'
 memories.append(dict(id=mid,date=m['d'],title=m['t'],description=m['x'],rarity=m['k'],rarityLevel=m['r'],image=m['f'],source='MO',provenance='author-reported-memory',environment=place,position={'x':x,'z':z},quest=cid,reward=f'vale-{i+1}',narrativeIds=[mid]))
 steps=[dict(id='visit',type='visit',label=f'Explore: {place}',position={'x':x,'z':z})]
 if i in [0,1,5]:steps.append(dict(id='talk',type='talk',label='Converse com Maria no pátio'))
 steps.append(dict(id='discover',type='memory',label=f"Revisite: {m['t']}",memory=mid))
 chapters.append(dict(id=cid,title=m['t'],date=m['d'],requires=f'chapter-{i}' if i else None,steps=steps,conclusion=m['x'],reward=f'vale-{i+1}'))
write('memories',memories);write('chapters',chapters)
unavailable={'win','mini','boss','both','bike','whack','who','vale'}
write('achievements',[dict(id=a[0],name=a[1],description=a[2],secret=len(a)>3 and a[3]==1,available=a[0] not in unavailable,source='AC',condition=a[0]) for a in get('AC')])
write('minigames',[dict(id=g[1],title=g[0],playable=g[1] in ['mem','quiz','rit'],environment={'mem':'Biblioteca','quiz':'Sala de história','rit':'Sala de música'}.get(g[1],'Planejado'),position={'mem':{'x':19,'z':-10},'quiz':{'x':-20,'z':-10},'rit':{'x':30,'z':-11}}.get(g[1])) for g in get('GL')])
qs=get('QS');write('quiz',[dict(id=f'quiz-{i+1}',question=q[0],options=q[1:],answer=0) for i,q in enumerate(qs)])
tr=re.search(r'var TR=\s*',text);tracks=expression_at(tr.end());tracks=re.sub(r"P\(('(?:\\.|[^'\\])*')\)",lambda m:json.dumps(ast.literal_eval(m[1]).split(' ')),tracks)
write('music',literal(tracks))
messages=[]
for token in re.findall(r'''"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*' ''',text[text.index('<script>'):],re.X):
 try: value=ast.literal_eval(token)
 except (ValueError,SyntaxError): continue
 if isinstance(value,str) and '<' not in value and any(word in value for word in ['Conquista','conquista','FIM!','Certo!','PERFEITO','VITÓRIA','Completou','COMBO:','pontos']) and value not in messages: messages.append(value)
write('rewards',dict(vouchers=[dict(id=f'vale-{i+1}',name=v[0],rarityLevel=v[1],virtual=True) for i,v in enumerate(get('VL'))],letter=dict(id='final-letter',title='Para a Maria',text=get('CARTA')),messages=[dict(id=f'message-{i+1:03}',text=t,source='Color') for i,t in enumerate(messages)]))
report=dict(source='Lorenzo & Maria Color (2).html',sha256=hashlib.sha256(source.read_bytes()).hexdigest(),counts={**counts,'memories':len(memories),'achievements':len(get('AC')),'visibleAchievements':16,'secretAchievements':1,'minigames':8,'quiz':len(qs),'vouchers':len(get('VL'))},duplicateTexts=[s for s in {d['text'] for d in all_dialogues} if sum(d['text']==s for d in all_dialogues)>1],notes=['O pedido menciona 16 conquistas: AC contém 16 comuns e uma secreta (egg). Todas preservadas.','Datas mantidas sem correção automática. CARTA menciona 2 anos e 2 meses e primeiro mês; revisar a data de referência com o autor.','LL/MM/NN são diálogos criativos, não transcrições factuais. MO é relato fornecido pelo autor.','Títulos GL mantidos em maiúsculas conforme o HTML. Nenhuma gravação de músicas comerciais foi importada.'])
assert len(memories)==6 and len(get('GL'))==8 and len(get('AC'))==17
assert len({d['id'] for d in all_dialogues})==len(all_dialogues)
assert all(isinstance(d['text'],str) and d['text'].strip() for d in all_dialogues)
write('import-report',report);print(json.dumps(report,ensure_ascii=False,indent=2))
