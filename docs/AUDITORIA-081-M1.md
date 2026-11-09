# Auditoria visual focada — Colorbeat 0.8.1 M1

Base local: `main` f05e1c007605316e7a8763085138884afd8bcaee, merge da 0.8 completa. Presença confirmada de GLBs/rigs 0.7A, AnimationMixer/QuestDirector/CutsceneManager 0.7B, biblioteca/jardim/cinco NPCs 0.7C e sistemas São Jorge M1–M4 (navegação, acabamentos, narrativa e orçamento visual). Nenhuma dessas áreas será reconstruída.

## Achados relevantes

| Sistema | Campus | São Jorge | Correção M1/M2 |
| --- | --- | --- | --- |
| Fábrica de materiais | `Resources.material`, aliases de paleta, mapas Canvas 128² | `SchoolMaterials.get`, mapas neutros DataTexture 64² próprios | Uma biblioteca/cache de materiais e mapas pertencente a Resources; fachada escolar empresta recursos |
| Opaque shader | Toon para foscos; Standard para metal | Toon também para metal | Uma família toon com faixas compartilhadas e realce restrito a material; manter vidro transparente específico |
| Gradiente | Rampa compartilhada de 3 faixas, borda dura | Mesma rampa, mas outra fábrica/parâmetros | Política única de rampa, filtragem e borda suavizada no shader |
| Coordenadas de mapas | UV de primitivas, repeat variável | UV projetado em unidades locais dos GLBs | Mapeamento de superfície em unidades do mundo no shader compartilhado |
| Exposição | 1 externo / 1.16 interno com interpolação | 1.05 fixo a cada frame | Um controlador de exposição/sol/ambiente, com transições e respeito à posse de luz pelas cutscenes |
| Preenchimento | PointLights de alas, intensidade 8/12/14 | Duas luzes móveis, 6/8/10 + 3/5, ambient extra | Mesma família de cores/presets, mantendo calibração adequada ao tamanho de cada ambiente |
| Traço de cenário | InkOutlines estático escuro, opacidade .72 | Edges de paredes selecionadas, cinza .22 | Mesma tinta/peso; contornos seletivos de móveis sem contornar detalhes miúdos |
| Vidro | Standard opaco por padrão | Standard alpha .45 / depthWrite false | Transparência coerente, sem sombras opacas dos painéis |

`GLBAssets.acquire` também cria materiais vertex-color próprios para a arquitetura antes do acabamento; devem usar o mesmo cache e shader, sem modificar os arrays COLOR_0. MeshBasic de letreiros/capas/efeitos tem função de legibilidade e não deve ser convertido indiscriminadamente.

`InkOutlines` é o sistema ativo; `OutlineManager` é uma classe legada não instanciada pelo jogo. Não existe dupla aplicação em runtime por esse arquivo; remoção/refatoração dele fica fora do escopo. Contornos de personagens, espessura adaptativa e revisão integral de UI/efeitos pertencem ao M3 da 0.8.1.

## Referências e capturas

A referência estética pública já está registrada em [REFERENCIAS-HIFI-RUSH.md](REFERENCIAS-HIFI-RUSH.md); não serão importados assets, shaders ou especificações oficiais não verificadas. A arte procedural é original.

Baseline capturada de snapshot imutável da 0.8, em nove pontos: campus, sala original, sala São Jorge, corredor, biblioteca, laboratório, salão, personagem próximo e Android emulado. Caminhos `captures/081/*-before.png`; matriz final e comparativos em `ENTREGA-081-M1-M2.md`. São fotografias de execução do jogo, sem mockups. Os enquadramentos entre versões mantêm posição/câmera/preset; as salas de campi distintos têm dimensões de jogo diferentes.

## Preservação

Não alterar: `sao-jorge.json`, geometrias GLB, layouts, colisores, rotas, missões, seis capítulos, controles e formato de saves. A biblioteca central deve ter um único proprietário e descarte idempotente; fachadas, loaders e instâncias não podem descartar materiais que emprestam.
