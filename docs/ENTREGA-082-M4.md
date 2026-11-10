# Living School 0.8.2 — conclusão M4

Versão de pacote e interface 0.8.2. M1/M2, M3 e M4 são commits separados na branch `feat/aurora-082-living-school`, sobre a 0.8.1 validada. O PR #11 é empilhado sobre a branch 0.8.1 enquanto o PR #9 permanece aberto. Sem merge automático e sem publicação da 0.8.2 na hospedagem.

## Entrega completa

- [M1/M2](ENTREGA-082-M1-M2.md): oito salas, placas/lousas, corredores, biblioteca e inventário dos 24 ambientes.
- [M3](ENTREGA-082-M3.md): laboratório, ciências, recepção, secretaria, direção, coordenação, professores e cinema; superfícies de trabalho complementares onde realmente faltavam.
- M4: oito cadeiras em pequenos conjuntos e uma mesa de apoio no perímetro do salão, com papelaria e organizador; murais de eventos no atlas existente. Os seis móveis e pontos narrativos anteriores permanecem. Não se acrescentaram palco, foyer, arquibancada ou infraestrutura fixa. O centro de atividades permanece livre de novos volumes entre X=-6 e X=6. Móveis cenográficos soltos na composição, sem mecânica nova de arrastar/mover.

Os três pavimentos e sua orientação não foram reorganizados. Nenhuma parede, GLB, sala, data, texto narrativo, missão, personagem, animação, rota ou schema de saves foi alterado. A conexão física com o campus continua fora do escopo, reservada à 0.9. Não há expansão narrativa 1.0 nesta atualização.

## Sistemas aproveitados e desempenho

Resources, SchoolMaterials/Colorbeat, batchMeshes, carregamento por piso, culling, inspeção, controles e presets são os sistemas existentes. A camada complementar `school-living-details.js` usa até quatro batches por piso, sem textura por objeto e sem novas luzes dinâmicas. Novas sombras complementares só em Alta. Mesas e cadeiras novas possuem colisores contidos nas salas; pequenas peças sobre superfícies não acrescentam colisão. Registros de apoio e reservas são descartados com o mesmo ciclo da visita; materiais e primitivas emprestados continuam sob seu proprietário anterior.

A configuração PWA publicada anteriormente foi conservada nesta fonte (manifesto, ícones e vínculo autenticado). Isso evita perder a instalação em uma futura publicação da 0.8.2. Continua online; comportamento de tela cheia/orientação depende do Chrome/Android. Não se altera a origem nem o armazenamento do save.

[Métricas finais e dados brutos](PERFORMANCE-082-FINAL.md) registram o custo acrescido. Sem benchmarks de FPS em Android/Chromebook físicos ou promessas de fluidez não medidas.

## Evidência real

Capturas reais Chromium/SwiftShader, Médio, 960×600. Mesmas posições/yaw/pitch, sem mockups; poses variam por simulação. Os arquivos permanecem no diretório `082-m1` para reaproveitar o pipeline de captura, agora ampliado aos outros marcos. As capturas iniciais de cinema/ciências/secretaria/direção/coordenação precedem M3, sobre M1/M2. O detalhe do salão precede M4, sobre M3; o salão geral, laboratório, professores e recepção usam a baseline 0.8.1 original. As capturas M1/M2 representativas foram atualizadas após a integração para medir os batches adicionais.

| Ambiente | Antes | 0.8.2 |
|---|---|---|
| Laboratório | [Antes](captures/082-m1/laboratory-before.jpg) | [Depois](captures/082-m1/laboratory-after.jpg) |
| Ciências | [Antes](captures/082-m1/science-before.jpg) | [Depois](captures/082-m1/science-after.jpg) |
| Recepção | [Antes](captures/082-m1/reception-before.jpg) | [Depois](captures/082-m1/reception-after.jpg) |
| Secretaria | [Antes](captures/082-m1/secretary-before.jpg) | [Depois](captures/082-m1/secretary-after.jpg) |
| Direção | [Antes](captures/082-m1/office-before.jpg) | [Depois](captures/082-m1/office-after.jpg) |
| Coordenação | [Antes](captures/082-m1/coord-before.jpg) | [Depois](captures/082-m1/coord-after.jpg) |
| Professores | [Antes](captures/082-m1/teachers-before.jpg) | [Depois](captures/082-m1/teachers-after.jpg) |
| Cinema | [Antes](captures/082-m1/cinema-before.jpg) | [Depois](captures/082-m1/cinema-after.jpg) |
| Salão geral | [Antes](captures/082-m1/hall-before.jpg) | [Depois](captures/082-m1/hall-after.jpg) |
| Apoio do salão | [Antes](captures/082-m1/hall-details-before.jpg) | [Depois](captures/082-m1/hall-details-after.jpg) |

As duas salas, seus tampos, os dois corredores, a biblioteca e o quadro próximo possuem comparativos na entrega M1/M2. Reprodução focada: `CHROMIUM_PATH=/usr/bin/chromium CAPTURE_CASES=hall node scripts/capture-living-school082.mjs after`, servidor Vite em 5173. Não executar todo o script quando só uma vista mudou.

## Verificação e limites

- M1/M2: regressão completa aprovada no CI 42751490760, unitários/build e 38+38=76 cenários de navegador.
- M3/M4: testes direcionados de apoio, limites, materiais compartilhados/descarte, sombreamento, reserva do centro do salão e navegação entre todos os centros/portas/escadas/abordagens e rotas narrativas passaram. Ajustados apenas o conjunto da direção para liberar passagem e o conjunto norte do salão para respeitar o acesso existente.
- Dois casos direcionados de navegador passaram: colisão real com a cadeira, inspeção/retorno e presets/limites anteriores. Não foram relaxados asserts ou budgets. Build passou com 85 módulos e aviso preexistente do chunk Three acima de 500 kB.
- Regressão de produção executada no [CI 42754437488](https://github.com/lorenzobruno455-hub/lorenzo-maria-3d/actions/runs/42754437488): 147/147 unitários, build e 76 cenários de navegador aprovados. O único erro foi no teste novo de colisão do salão: sua expectativa fixa de Z>14,6 era incompatível com a face da cadeira (14,24) mais o raio oficial do jogador (0,32), cujo limite correto é 14,56. A posição observada no CI, 14,58368, já estava fora do volume.
- Corrigida apenas a expectativa para usar PLAYER_RADIUS; o cenário passou na execução focada (8,6 s). Nenhum arquivo de produção mudou após a regressão. A cobertura final soma 76 casos aprovados no CI e o caso corrigido aprovado localmente (77 ao todo), sem apagar testes ou mudar a física/budgets. O commit exclusivo de teste/documentação usa [skip ci] para não repetir a suíte inteira; a execução histórica do CI permanece vermelha pelo assert anterior, e não se afirma CI integral verde na nova cabeça.
- Revisão independente somente leitura de M1/M2 e depois M3/M4 não encontrou falhas concretas. Não repetiu testes. As entregas parciais anteriores registram a situação de revisão em seu momento.

Equipamentos são representações estilizadas, não simulações funcionais. Relógios são cenográficos; os mapas são esquemáticos; não há projeção luminosa dinâmica nem substâncias funcionais. A licença dos recursos anteriores foi preservada, sem recursos pagos ou dependências novas.

## Ajuste posterior solicitado: tela inteira

Botão **Entrar/Sair da tela inteira** no início das configurações, com Fullscreen API, sincronização ao sair pelo navegador e aviso quando indisponível/negado. Sem alterar jogabilidade ou saves. Teste focado de entrada/saída real aprovado (9,8 s) e build aprovada (86 módulos); sem repetir a regressão anterior. O mesmo botão foi aplicado separadamente à hospedagem 0.8.1, sem publicar a 0.8.2 inteira.
