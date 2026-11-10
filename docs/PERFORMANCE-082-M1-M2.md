# Living School M1/M2 — métricas

Chromium headless/SwiftShader, 960×600, Médio, sombras e DPR 1; sem resolução adaptativa. Mesma câmera/posição antes/depois, modelos e fontes locais carregados. Simulação e o alvo do marcador podem variar; texturas incluem recursos que carregam de forma assíncrona. Dados [brutos](METRICAS-082-M1-M2.json).

| Vista | Draws | Triângulos | Geometrias | Texturas |
|---|---:|---:|---:|---:|
| class-b | 54 → 57 | 74374 → 79602 | 151 → 152 | 17 → 15 |
| corridor-2 | 66 → 69 | 76786 → 82050 | 154 → 154 | 41 → 38 |
| class-desks-b | 64 → 67 | 76642 → 81906 | 154 → 157 | 40 → 40 |
| class-a | 74 → 76 | 117918 → 120540 | 150 → 154 | 17 → 18 |
| corridor-1 | 126 → 129 | 121962 → 125532 | 152 → 155 | 41 → 41 |
| library | 94 → 96 | 128194 → 130816 | 149 → 155 | 38 → 41 |
| class-desks-a | 130 → 132 | 122034 → 124704 | 151 → 155 | 39 → 40 |
| board | 74 → 76 | 117918 → 120540 | 151 → 154 | 18 → 18 |

Os novos objetos usam os batches de material existentes, e o traço seletivo dos móveis é mantido. Objetos do primeiro piso somam 258 detalhes e 53.412 triângulos de mobiliário (20 batches); segundo: 141 detalhes e 47.544 triângulos (22 batches). Terceiro: seis caixas herdadas, sem novo mobiliário. Contagem de triângulos inclui buffers estáticos agregados, mesmo que apenas parte do batch esteja à vista.

Uma textura de sinalização por piso, faixas com UV próprio e resolução conforme o painel: atlas de largura 256, área máxima testada 256×4096; relógios usam só 64 pixels de largura e cartazes 128. Sem atlas/textura de alta resolução por cartaz. Reaproveitam-se as primitivas e a biblioteca Colorbeat. Bebedouros e vasos ocupam a margem já bloqueada pela parede; não acrescentam consultas de colisão. Cache, carregamento por piso, culling e presets anteriores permanecem.

Os testes existentes continuam exigindo os budgets anteriores de presets/inspeção, sem limites relaxados. Há aumento de draws e triângulos, não promessa de otimização universal. As amostras são contadores; não foi medido FPS em Android/Chromebook físico. Metas de fluidez precisam de validação no aparelho.

Reprodução: servidor Vite e `CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-living-school082.mjs after`; `CAPTURE_CASES` seleciona uma área e `CAPTURE_URL` permite baseline imutável. A scriptura grava JPEG real do browser e métricas em `work/aurora082/`.
