# São Jorge: matriz M1 de ambientes

Cenário artístico inspirado nos croquis; coordenadas, alturas, portas e mobiliário são adaptações de jogo, não medidas reais. Três pisos e o salão superior são confirmados. Nomes numéricos conceituais foram removidos.

| Piso | ID | Ambiente | Tipo | Limites X / Z do jogo | Proveniência |
| --- | --- | --- | --- | --- | --- |
| 1º andar | sj-f1-01 | Sala de aula A | class | -11…-2 / 12…19 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-02 | Banheiro masculino | bath | -11…-2 / 9…12 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-03 | Banheiro feminino | bath | -11…-2 / 5.5…9 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-04 | Escadas | stair | -11…-2 / -0.5…5.5 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-05 | Sala dos professores | teachers | -11…-2 / -9…-0.5 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-06 | Biblioteca | library | -11…-2 / -19…-9 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-07 | Sala de aula B | class | 2…11 / 12…19 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-08 | Sala de aula C | class | 2…11 / 5…12 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-09 | Sala de cinema | cinema | 2…11 / -2…5 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-10 | Recepção | reception | 2…11 / -9…-2 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-11 | Secretaria | secretaria | 2…11 / -19…-9 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 1º andar | sj-f1-12 | Direção | office | -2…2 / -19…-16.3 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-01 | Sala de aula A | class | -11…-2 / 12…19 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-02 | Sala de aula B | class | -11…-2 / 5…12 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-03 | Banheiro masculino | bath | -11…-2 / 1.5…5 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-04 | Banheiro feminino | bath | -11…-2 / -2…1.5 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-05 | Escadas | stair | -11…-2 / -8…-2 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-06 | Sala de ciências | science | -11…-2 / -19…-8 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-07 | Sala de aula C | class | 2…11 / 12…19 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-08 | Sala de aula D | class | 2…11 / 5…12 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-09 | Coordenação | coord | 2…11 / -2…5 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-10 | Laboratório | lab | 2…11 / -12…-2 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 2º andar | sj-f2-11 | Sala de aula E | class | 2…11 / -19…-12 | croqui_usuario; geometry, doors and furniture adapted for gameplay |
| 3º andar | sj-f3-01 | Salão multiuso | hall | -10.8…10.8 / -18.8…18.8 | third-floor hall confirmed; entire layout fictionalized |

## Preparação reproduzível

Execute `python scripts/prepare-sao-jorge.py`. O script lê os três GLBs conceituais originais, decodifica seus POSITIONs em caixas e reaproveita as lajes, acabamentos e mobiliário apropriado dos dois primeiros pisos. A paleta vem do JSON extraído do visualizador. Paredes baixas e escadas sólidas antigas são substituídas por paredes de 3,05 unidades e vãos de 2,2 × 2,6. O terceiro piso reutiliza as lajes originais; palco, foyer e suas divisórias/mobiliário são excluídos. Bancos neutros do salão são novos.

Cada GLB tem três malhas/nós (`structure`, `furniture`, `floors`), um material e três draws. Vértices têm NORMAL plana e COLOR_0 em **RGB linear**, convertido da paleta sRGB. Sem texturas nem teto nesta etapa: a camada de inspeção pode mostrar os interiores por cima. Cada GLB usa Y local; o runtime posiciona o grupo em `baseY`. Colisores têm Y absoluto. Todo volume sólido preservado com altura relevante recebe colisor. Faixas decorativas baixas e pisos não bloqueiam.

A escada é uma transição interativa ficcionalizada entre pontos livres, sem alegação de escada contínua. No segundo piso os pontos subir/descer são distintos. Todas as salas abrem para o corredor; o salão é um único espaço. Portas permanecem abertas nesta etapa.

M1 preserva móveis conceituais onde cabem, mas não conclui o detalhamento M2. Os testes verificam cabeçalhos GLB, camadas, normais/cores, tipos de ambiente, portas livres e alcance em grade com raio de jogador 0,4.
