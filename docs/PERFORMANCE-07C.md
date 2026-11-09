# Desempenho · Aurora 0.7C

Cenário estático consolidado por material; portas, telhados, personagens e objetos interativos são excluídos dos lotes. A exclusão considera todos os ancestrais com `inkDynamic`, `placement` ou `inkActor`, preservando capas e corpos dos livros e da fotografia coletável. Lotes maiores reduzem submissões, mas tornam o frustum culling menos granular.

Mantidos InstancedMesh na vegetação, cache de geometrias/materiais/texturas, culling por distância e os presets Baixo/Médio/Alto. NPCs carregam sequencialmente após os dois protagonistas; falhas mantêm o fallback funcional. Cada instância tem seu mixer/rig; o pool controla recursos compartilhados. Após carregar todos os NPCs, geometrias dos manequins são liberadas.

GLTFLoader é importado sob demanda e Three fica em chunk separado para cache. Sombras mantêm mapas 0/1024/2048; reaplicar configurações iguais não realoca o alvo GPU. Resolução adaptativa até 55% permanece ativa; amostras inválidas e pausas longas são descartadas sem ignorar renderização sustentada muito lenta. Pausa/aba oculta suspendem trabalho desnecessário. Efeitos DOM têm pool limitado a duas unidades; áudio encerra e desconecta suas fontes.

## Medições e limites

As medições usam Chromium headless/SwiftShader, viewport 800×450, DPR 1, com os sete GLBs carregados; `renderer.info` inclui passagens de sombra. Não representam GPU Android, memória em bytes ou taxa de quadros de um aparelho físico. O teste `tests/polish07c.spec.js` alterna os três presets e grava resultados brutos em `work/aurora07c/preset-metrics.json`.

Medição final após recuperar os corpos dos coletáveis:

| Preset | Draw calls | Geometrias GPU | Texturas GPU | Triângulos/passagens |
| --- | ---: | ---: | ---: | ---: |
| low | 151 | 84 | 31 | 193116 |
| medium | 264 | 118 | 41 | 251620 |
| high | 272 | 118 | 41 | 266336 |

Os valores variam com câmera e rotinas. O limite de Baixo permanece <160 draws / <110 geometrias.

Não houve acesso físico a Galaxy S24 Ultra, Galaxy A35 ou Chromebook. Metas de 60/30 FPS ainda precisam ser verificadas nesses dispositivos; nenhum FPS de telefone foi inventado.

Os cinco novos GLBs somam 4.065.656 bytes, aproximadamente 3,88 MiB, com menos de 1 MB por modelo. Não foi implementada compressão Draco/KTX2 ou LOD de malha; os modelos não usam texturas raster próprias. O chunk Three permanece acima do aviso padrão de 500 kB: aproximadamente 569 kB/148 kB gzip; a entrada do jogo fica em aproximadamente 181 kB/65 kB gzip. O aviso não foi ocultado.

Prioridades seguintes: medir frame time/temperatura em Android físico, perfilar sombras e NPCs por área e só então considerar quantização, LOD e compressão.
