# Comic Overdrive — P1 + P2

## Base e limites

GitHub conferido em 10/11/2026: PR #13 / P0 em `b0a68e0`, empilhado sobre #12 / 0.9.1 em `92ceca8`; ambos abertos. Branch desta entrega: `feat/aurora-comic-overdrive-p1-p2`, baseada no P0. A versão funcional continua 0.9.1, com mundo contínuo e recuperação de personagem. Main, PRs anteriores e hospedagem não foram alterados.

O usuário autorizou P1 e P2 juntos após receber o P0. Implementação usa o mesmo renderizador, cache Colorbeat, atlas, geometria e infraestrutura de carregamento. Nenhuma dependência, recurso pago ou asset externo novo. P3 (revisão individual de personagens/UI/cutscenes) e P4 (polimento global/dispositivos) não foram implementados. Revisar em P4 a densidade da hachura no piso distante do salão, aliasing e custo em aparelho físico.

## O que mudou

O estilo agora é o padrão da branch. `?comic=legacy` permite comparação com a apresentação anterior; `?comic=overdrive-p0` mantém a amostra limitada de P0. O código continua no módulo existente para evitar uma renomeação/refatoração sem benefício funcional.

P1 aplica céu azul em três faixas, nuvens desenhadas e sol do atlas procedural original; pigmentos limão/esmeralda/turquesa na vegetação, madeira quente, sombras cromáticas em três valores e hachura seletiva nos materiais de construção. As máscaras espaciais do protótipo e seu hash com seno são eliminados do shader global, reduzindo trabalho por fragmento e removendo as bordas do recorte.

As oito árvores do campus e três do caminho usam três massas de copa cada: 150 volumes originais passam a 33 volumes de preenchimento e 33 de contorno, em batches instanciados. Flores recebem coral/rosa/violeta/amarelo. Troncos, posições e colisores permanecem os mesmos. As novas copas são filhas dos objetos originais: seguem a ocultação do campus ao entrar na escola, frustum culling e visibilidade dos props do caminho. Não foi inventada uma floresta ou expandida a geografia; toda a vegetação existente usa a linguagem compartilhada.

P2 aplica o perfil aos três pavimentos e aos materiais dos leases carregados depois. Placas/cartazes preservam UV, atlas, textos e alpha; a mistura parcial de azul conserva a diferença entre desenho e fundo, identificada na inspeção visual; vidro usa duas zonas gráficas de cor/reflexo mantendo sua transparência e regras de profundidade. Contornos arquitetônicos existentes são reforçados. Não foram criados novos móveis, salas, rotas ou luzes.

## Cobertura dos ambientes existentes

| Categoria | Cobertura / evidência |
|---|---|
| Céu, horizonte, nuvens e sol | Atlas único 512×128 e céu procedural; campus e conexão |
| Árvores, arbustos, flores, grama | Onze copas instanciadas; pigmentos compartilhados nos canteiros/solo; campus e conexão |
| Chão, caminho e campus original | Perfil global, sem limites artificiais do P0; mesmas malhas e colisões |
| Fachadas São Jorge | Proxies distantes e prédio detalhado usam a paleta; passagem/culling preservados |
| Primeiro pavimento | 12 entradas na matriz, incluindo 3 salas de aula, banheiros, escada, professores, biblioteca, cinema, recepção, secretaria e direção |
| Segundo pavimento | 11 entradas: 5 salas de aula, banheiros, escada, ciências, coordenação e laboratório |
| Terceiro pavimento | Salão multiuso existente; móveis, paredes, placas e pisos compartilham o perfil |
| Livros e decoração | Geometrias e atlas da 0.8.2 reaproveitados; seis memórias narrativas e suas interações preservadas |
| Personagens/UI | Modelos recebem o perfil de materiais compartilhados; a UI conserva o Colorbeat existente. Rigs, animações, textos, layout e áreas touch não foram redesenhados. Trabalho específico fica no P3 |

Cobertura de materiais dos 24 ambientes não significa inspeção de cada ângulo ou conclusão de P3/P4. As vistas abaixo são amostras reais representativas; a revisão geral de exceções e o teste em aparelho físico ficam para P4.

## Comparativos reais

| Vista | Antes | Depois |
|---|---|---|
| Campus / céu / vegetação | [Antes](captures/comic-overdrive-p1-p2/campus-before.jpg) | [Depois](captures/comic-overdrive-p1-p2/campus-after.jpg) |
| Caminho e fachada | [Antes](captures/comic-overdrive-p1-p2/connection-before.jpg) | [Depois](captures/comic-overdrive-p1-p2/connection-after.jpg) |
| Sala de aula | [Antes](captures/comic-overdrive-p1-p2/class-a-before.jpg) | [Depois](captures/comic-overdrive-p1-p2/class-a-after.jpg) |
| Corredor do segundo piso | [Antes](captures/comic-overdrive-p1-p2/corridor-2-before.jpg) | [Depois](captures/comic-overdrive-p1-p2/corridor-2-after.jpg) |
| Biblioteca | [Antes](captures/comic-overdrive-p1-p2/library-before.jpg) | [Depois](captures/comic-overdrive-p1-p2/library-after.jpg) |
| Laboratório | [Antes](captures/comic-overdrive-p1-p2/laboratory-before.jpg) | [Depois](captures/comic-overdrive-p1-p2/laboratory-after.jpg) |
| Recepção | [Antes](captures/comic-overdrive-p1-p2/reception-before.jpg) | [Depois](captures/comic-overdrive-p1-p2/reception-after.jpg) |
| Salão | [Antes](captures/comic-overdrive-p1-p2/hall-before.jpg) | [Depois](captures/comic-overdrive-p1-p2/hall-after.jpg) |

960×600, Médio, sombras ligadas, exposição 1, adaptive desligado, relógio 08:15, mesmas posições e parâmetros de câmera (diferença residual de interpolação abaixo de 0,001 unidade). Fases de animação dos NPCs podem diferir. Capturas pausadas com apenas o overlay ocultado de forma igual nas duas fases; sem mockups ou imagens de Hi-Fi RUSH.

| Vista | Draw calls antes → depois | Triângulos antes → depois | Geometrias | Texturas |
|---|---:|---:|---:|---:|
| campus | 214 → 217 | 247492 → 240006 | 128 → 129 | 33 → 34 |
| connection | 114 → 117 | 201676 → 202830 | 116 → 117 | 12 → 13 |
| class-a | 85 → 88 | 121608 → 122762 | 158 → 159 | 19 → 20 |
| corridor-2 | 83 → 86 | 89568 → 90722 | 168 → 167 | 41 → 40 |
| library | 99 → 101 | 137030 → 137224 | 164 → 165 | 41 → 42 |
| laboratory | 64 → 66 | 95256 → 95450 | 164 → 169 | 22 → 27 |
| reception | 85 → 87 | 129442 → 129636 | 162 → 162 | 39 → 39 |
| hall | 70 → 73 | 54656 → 55810 | 144 → 145 | 30 → 31 |

Dados: [antes](captures/comic-overdrive-p1-p2/before-metrics.json) e [depois](captures/comic-overdrive-p1-p2/after-metrics.json). Os tempos de oito frames por vista são amostras curtas de Chromium/SwiftShader, com variância de CPU/compilação. Não representam FPS no Android nem estabelecem ganho de fluidez. Contagens de geometrias/texturas também incluem os recursos residentes do carregamento existente. Sem luz ou shadow map adicional; o custo extra de shader ainda requer medição física antes de P4.

## Validação e reprodução

- Build final aprovado: main **389,04 kB / gzip 108,26**, contra 385,99 / 107,10 no P0; CSS 41,76 / 9,17 e Three 569,75 / 148,04. Permanece o aviso já existente do chunk Three maior que 500 kB.
- **157/157 unitários** na versão final; **6/6 smokes focados** durante implementação; oito pares de capturas sem erro de shader/console.
- **Regressão geral executada uma única vez: 89 casos, 84 passaram e 5 falharam**, em 48,1 minutos no Chromium/SwiftShader deste ambiente.
- **Três retestes após os ajustes: 3/3 passaram** (`aurora07`, inspeção M2, parede legada), em 1,7 minuto. Não houve repetição da suíte geral.

| Ocorrência da rodada geral | Evidência / tratamento |
|---|---|
| Movimento após exatamente 350 ms | Diagnóstico reproduziu **zero frames no intervalo tanto no legado quanto no perfil novo**, e deslocamento de z=19 para 18,65 ao aguardar a condição. Teste agora mantém a tecla até observar movimento e a solta em finally; preserva limites de geometria e verificações de erro. Reteste passou. |
| Inspeção geral com 163 draws, limite <160 | Ao mostrar os três pisos, omitidos apenas o céu e os contornos da vegetação de fundo; restaurados ao sair da inspeção geral. Copas e contornos da arquitetura permanecem. Mesmo limite original, reteste passou em Baixo/Médio/Alto e no retorno ao campus. As oito vistas normais capturadas não usam essa inspeção e não mudaram. |
| Teste antigo de parede lisa, desvio 4,55 acima de 3 | A nova arte inclui hachura intencional. O guard contra acne de sombra foi mantido com seu limite original no modo `?comic=legacy`; reteste passou. O perfil novo conserva seus próprios testes de shader, colisores e comparativos visuais. |
| `sao-jorge-m3`: seis capítulos/livros | As verificações dos seis capítulos, datas e releituras passaram antes do limite total de 300 s, atingido durante `walkOut`. **Timeout pendente**: não declarar este cenário completo aprovado. |
| `sao-jorge-m4`: visitas repetidas / GPU | Limite total de 240 s atingido no helper de câmera/retorno pelas escadas. **Timeout pendente**: a checagem final de estabilidade após todos os ciclos não foi concluída. |

Após os retestes, os casos correspondentes a **87 dos 89** foram verificados; os dois roteiros longos acima continuam sem aprovação completa neste ambiente. Não foram aumentados timeouts nem modificadas missões, física ou helpers de navegação para esconder esses resultados. Os testes separados de ida/volta pela porta, três pavimentos, save/reload, prologue, aventuras M3, quiz Android, controles touch e ponto seguro passaram. A regressão não está totalmente verde; dispositivos físicos e conclusão desses dois cenários ficam registrados para P4. Sem afirmação de FPS Android.


Revisão independente das mudanças de shaders, ownership, copas e carregamento não encontrou defeitos acionáveis. Sem reexecução repetida da suíte inteira durante cada ajuste. O primeiro smoke em desenvolvimento foi interrompido por recarga HMR ao editar; a execução focada com código estabilizado passou por completo.

```sh
npm run test:unit
npm run build
npx playwright test tests/comic-overdrive-p1-p2.spec.js tests/comic-overdrive-p0.spec.js
# Regressão geral, uma execução ao finalizar:
npx playwright test
```

Neste ambiente, Playwright usa `work/aurora082/playwright.config.mjs` (ignorado) para apontar ao Chromium do sistema. Capturas reproduzíveis com Vite em localhost:5173:

```sh
CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-overdrive-p1-p2.mjs before
CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-overdrive-p1-p2.mjs after
```

Os JSONs registram o hash local do código coletado; a publicação pelo conector pode gerar commits com metadados/hash diferentes, mas as árvores são verificadas byte a byte.

## Atualizar pelo terminal

Pare o servidor antigo com Ctrl+C. Na pasta do repositório, com o trabalho local salvo:

```sh
git fetch origin
git switch feat/aurora-comic-overdrive-p1-p2
git pull --ff-only origin feat/aurora-comic-overdrive-p1-p2
npm ci
npm run build
npm run dev -- --port 5173 --strictPort
```

O Vite mostra os endereços local e de rede. Use a mesma URL/origem de antes para continuar usando os saves locais; strictPort impede mudança silenciosa de porta. Para testar pelo celular, use o endereço de rede na mesma Wi-Fi. Isso executa esta branch localmente; não atualiza a hospedagem pública. Instalação PWA exige uma origem segura, conforme as regras do Chrome.
