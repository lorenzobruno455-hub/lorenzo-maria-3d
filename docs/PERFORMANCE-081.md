# Colorbeat 0.8.1 — desempenho e reprodução (M4)

## Ambiente e método

Chromium headless usando SwiftShader (rasterização por software), Linux na nuvem. **Não é emulação fiel da GPU de um Galaxy S24 Ultra/A35 nem teste em Chromebook físico.** Versão do SO e relatórios brutos estão em [METRICAS-081-M4.json](METRICAS-081-M4.json). As capturas comuns usam 960×600; Android usa viewport 844×390, isMobile e hasTouch. DPR 1, preset Médio, sombras habilitadas, adaptação de resolução desligada para comparar a mesma configuração.

Todos os sete modelos e fontes locais estavam carregados. Contadores de `renderer.info` são coletados após a captura; não representam automaticamente a soma de todos os passes internos de sombra. NPCs e animações seguem ativos, portanto visibilidade e número de draws podem variar. Não há afirmação de que todas as cenas ficaram mais rápidas.

| Cena | Draw calls 0.8 → 0.8.1 | Texturas 0.8 → 0.8.1 | Geometrias 0.8 → 0.8.1 |
|---|---:|---:|---:|
| Campus | 250 → 241 | 40 → 40 | 124 → 119 |
| Sala campus | 126 → 124 | 18 → 18 | 124 → 120 |
| Sala São Jorge | 73 → 75 | 27 → 23 | 155 → 152 |
| Corredor | 124 → 126 | 45 → 41 | 155 → 152 |
| Biblioteca | 92 → 94 | 45 → 41 | 155 → 152 |
| Laboratório | 47 → 53 | 28 → 25 | 157 → 152 |
| Salão | 57 → 58 | 34 → 30 | 139 → 135 |
| Personagem próximo | 73 → 75 | 25 → 23 | 153 → 152 |
| Android paisagem | 93 → 95 | 46 → 42 | 155 → 152 |

O traço seletivo dos móveis custa um draw por piso visível em Médio/Alto. O acabamento plástico separado exige um lote em algumas salas. O novo marcador contextual custa no máximo um draw e uma geometria quando visível. A seleção do contorno de NPCs usa distância da câmera (incluindo altura) e pode mostrar silhuetas diferentes do antigo critério horizontal ao jogador; parte da variação no laboratório vem dessa seleção e da simulação. A biblioteca única reduz mapas/objetos GPU duplicados; a 0.8.1 não garante redução de draws em toda vista.

## Amostra temporal real, somente software

Amostras limitadas a duas cenas representativas para evitar um benchmark longo e repetitivo. Cada uma contém 30 intervalos consecutivos de `requestAnimationFrame`, depois de carregamento/captura e sem outro navegador de teste simultâneo. Elas medem a cadência total observada, incluindo browser, CPU, animação e renderização; não são tempo GPU isolado nem benchmark de carregamento. Dados individuais estão no JSON, sem ocultar outliers.

| Cena em software | Média de frame | Mediana | P95 |
|---|---:|---:|---:|
| Campus Médio com sombras | 622,20 ms | 600,00 ms | 1166,70 ms |
| Laboratório Médio com sombras | 360,54 ms | 350,00 ms | 716,60 ms |

Esse ambiente de software ficou lento e **não demonstrou a meta de 30/60 FPS**. Não se convertem esses resultados em promessas para celulares. Verificação em GPUs reais, com perfis térmicos e sessões longas, permanece pendente. Não houve medida temporal equivalente da 0.8, portanto não há alegação de ganho de FPS antes/depois.

## Política preservada e custos

- Baixo/Médio/Alto conservam limites de pixel ratio e sombras 0/1024/2048; resolução adaptativa existente mantém escala de 0,55 a 1.
- Contorno de atores usa um material compartilhado, geometrias/esqueletos emprestados, máscaras de roupa/cabelo/sapato, descarte da camada sem descarte dos modelos e seleção por distância. Sem outline fullscreen nem uma nova textura por personagem.
- Largura em pixels CSS é estável entre DPRs; limite em mundo impede halo distante. A resolução baixa ainda pode serrilhar. NPCs distantes e preset Baixo continuam com menos contornos.
- Materiais de roupa são foscos e sem mapas globais deslizantes. Shader/program cache e rampa são compartilhados com o sistema M1/M2. Vidro continua separado, transparente e sem sombra opaca.
- Marcador contextual reutiliza um pequeno BufferGeometry e material; depth test normal, sem transparências sobrepostas. Efeitos DOM anteriores limitam instâncias e respeitam movimento reduzido.
- Instancing/culling/cache/pausa de renderização existentes foram preservados; nenhuma biblioteca ou pós-processamento foi adicionado. O aviso preexistente de chunk Three.js >500 kB permanece.

## Como reproduzir

Na branch `feat/aurora-081-colorbeat-unified`, com dependências instaladas e o Vite em 5173:

```sh
npm run dev -- --port 5173
# Em outro terminal; CHROMIUM_PATH é opcional quando Playwright já tem Chromium:
CHROMIUM_PATH=/usr/bin/chromium CAPTURE_SAMPLE=1 node scripts/capture-colorbeat081.mjs final
CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-colorbeat081-ui.mjs final
```

O primeiro comando de captura grava nove imagens e checkpoints em `work/aurora081/final-metrics.json`; apenas campus e laboratório recebem amostras temporais. `CAPTURE_CASES=campus-classroom` permite recapturar somente uma vista e `CAPTURE_DIR` controla a pasta. Não altere fontes ou HTML durante a coleta no servidor Vite: o reload reinicia a página. Para comparar, execute o mesmo script usando `CAPTURE_URL` apontando a uma cópia imutável de `f05e1c0`, com fase `before`. Posições/câmeras estão no script.

```sh
npm run build
node --test tests/unit/ink081.test.js tests/unit/interaction-accent081.test.js tests/unit/colorbeat081.test.js tests/unit/effects07c.test.js
npx playwright test tests/colorbeat081-final.spec.js tests/colorbeat081.spec.js tests/aurora07.spec.js
```

A validação final integral ocorre no CI do PR: unitários e build uma vez, todos os specs Playwright divididos em dois shards disjuntos (workers=1 em cada runner), sem executar o mesmo teste nos dois. O runner único atingiu o limite de 18 minutos antes de concluir; o limite de cada job e os timeouts/asserts dos testes foram preservados. Relatórios line/JSON tornam o progresso e o total de cada lote verificáveis. Não duplicada localmente; testes focados não são apresentados como regressão completa. Para avaliar aparelhos físicos: usar a mesma versão, URL, viewport/preset e rota de exploração; registrar aquecimento, tempo e método antes de publicar FPS.
