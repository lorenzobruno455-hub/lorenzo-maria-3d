# Living School 0.8.2 — métricas finais

Dados reais de renderer.info, Chromium headless/SwiftShader, 960×600, Médio, DPR 1, sombras, resolução adaptativa desligada. Modelos/fontes carregados. Mesmos pontos de câmera e jogador, com variações normais de poses/recursos assíncronos. [Dados brutos](METRICAS-082-FINAL.json). Não medem FPS em aparelhos físicos.

Baselines: 0.8.1 para salas, corredores, biblioteca, laboratório, recepção, professores e salão geral; M1/M2 para cinema/ciências/secretaria/direção/coordenação; M3 antes da composição M4 para o detalhe do salão. Cada origem está identificada no JSON. Isso compara cada área com sua captura inicial real, sem atribuir um cenário intermediário à 0.8.1.

| Vista | Draws | Triângulos | Geometrias | Texturas |
|---|---:|---:|---:|---:|
| class-a | 74 → 76 | 117918 → 120550 | 150 → 153 | 17 → 17 |
| class-b | 54 → 57 | 74374 → 79608 | 151 → 154 | 17 → 17 |
| corridor-1 | 126 → 133 | 121962 → 131590 | 152 → 159 | 41 → 41 |
| corridor-2 | 66 → 73 | 76786 → 88320 | 154 → 161 | 41 → 41 |
| library | 94 → 100 | 128194 → 136874 | 149 → 159 | 38 → 41 |
| laboratory | 53 → 60 | 83722 → 94992 | 152 → 158 | 25 → 25 |
| science | 58 → 61 | 89046 → 95016 | 154 → 160 | 38 → 41 |
| reception | 76 → 82 | 120486 → 129214 | 152 → 158 | 41 → 40 |
| secretary | 81 → 85 | 130588 → 136646 | 155 → 159 | 41 → 41 |
| office | 77 → 81 | 130516 → 136574 | 155 → 158 | 41 → 40 |
| coord | 59 → 63 | 81642 → 87912 | 157 → 159 | 41 → 39 |
| teachers | 115 → 122 | 121074 → 129826 | 152 → 159 | 41 → 41 |
| cinema | 81 → 84 | 122616 → 126154 | 154 → 157 | 18 → 18 |
| hall | 58 → 60 | 48088 → 53348 | 135 → 137 | 30 → 30 |
| hall-details | 56 → 60 | 48064 → 53636 | 134 → 136 | 17 → 15 |

A camada M3/M4 acrescenta no máximo quatro batches por piso: piso 1, 6.048 triângulos/44 props/9 volumes sólidos; piso 2, 6.264 triângulos/97 props/2 volumes; piso 3, 5.568 triângulos/3 props/9 volumes (oito cadeiras e mesa). São custos adicionais aos acabamentos M1/M2; sombras novas só em Alta. Primitivas, materiais e buffers compartilhados; sem nova luz dinâmica ou textura por objeto.

O aumento é explícito, não se promete redução universal de draws. Limites dos testes de presets e inspeção foram preservados, sem tolerâncias ampliadas. Culling, qualidade adaptativa e carregamento por piso existentes continuam ativos. Materiais, geometrias e atlas são liberados por seu proprietário.

O canvas compartilhado tem uma textura por pavimento; letras e relógios usam células proporcionais, com UVs dentro da faixa e sem geração de mipmaps que misture painéis. A área do atlas permanece limitada pelos testes; nenhum cartaz tem textura individual de alta resolução.

Para repetir somente uma vista: `CHROMIUM_PATH=/usr/bin/chromium CAPTURE_CASES=hall node scripts/capture-living-school082.mjs after`, Vite em 5173. Para baseline imutável, defina `CAPTURE_URL`. Não é necessário repetir todas as capturas para verificar um objeto. As metas de 30/60 FPS, aquecimento e sessões longas precisam de validação em GPU/aparelhos reais.
