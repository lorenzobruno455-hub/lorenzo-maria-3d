# Lorenzo & Maria 3D — Project Aurora 0.7B

Exploração em terceira pessoa no fictício Colégio Aurora, com Three.js, JavaScript e Vite. Interface e diálogos em português. O capítulo inicial continua completo: converse com Maria, encontre três lembranças e retorne ao pátio.

## Executar no computador ou Chromebook Linux

Requer Node.js 20.19+ ou 22.12+ e Git.

```sh
git clone https://github.com/lorenzobruno455-hub/lorenzo-maria-3d.git
cd lorenzo-maria-3d
npm ci
npm run dev
```

Abra `http://localhost:5173` e mantenha o terminal aberto. Para atualizar uma cópia existente depois que a versão estiver na sua branch:

```sh
git pull --ff-only
npm ci
npm run dev
```

Para testar no Android na mesma rede Wi-Fi, abra `http://IP-DO-COMPUTADOR:5173`. Vite já escuta em `0.0.0.0`. A porta precisa estar acessível na rede; no Chromebook pode ser necessário ativar o encaminhamento da porta 5173 nas configurações do Linux. Evite redes públicas para o servidor de desenvolvimento. LocalStorage funciona por navegador e endereço: mudar a URL ou porta usa outro salvamento.

## Aventuras 0.7B

Após o prólogo, abra **Álbum e história → Aventuras 0.7B**. Três aventuras com cenas puláveis, investigação física, escolhas, quebra-cabeça e ritmo. [Entrega 0.7B](docs/ENTREGA-07B.md) · [Missões](docs/MISSIONS-07B.md) · [Animações](docs/ANIMATION-SYSTEM.md) · [Cutscenes](docs/CUTSCENES-07B.md).

## Project Aurora 0.7A

[Entrega e capturas comparativas](docs/ENTREGA-07A.md) · [Auditoria](docs/AUDITORIA-07A.md) · [Assets e licenças](docs/ASSET-LICENSES.md). Para regenerar os modelos: `blender -b --python scripts/blender/build_aurora.py`. O jogador precisa apenas do navegador.

## Direção visual Aurora Comic

Influência de Hi-Fi RUSH em painéis angulares, tipografia expressiva, cores fortes, materiais toon, contornos e enquadramentos de leitura. Os personagens, a escola e as memórias continuam próprios de Lorenzo & Maria. Fontes Barlow Condensed e Atkinson Hyperlegible ficam hospedadas localmente com licenças OFL.

Veja [as referências verificadas](docs/REFERENCIAS-HIFI-RUSH.md), [a entrega visual e limitações](docs/ENTREGA-VISUAL-COMIC.md) e [as capturas reais](docs/captures/comic). Os avatares são fictícios personalizáveis; não foram copiadas aparências, imagens ou músicas de Hi-Fi RUSH.

## Biblioteca das Memórias · 0.5

Seis livros físicos na biblioteca permitem revisitar as memórias desbloqueadas, com capas individuais, abertura animada e enquadramento da câmera. Os ambientes recebem móveis reconstruídos, superfícies de apoio e colisões coerentes. Caderno, livro de física, carta e fones iniciam conversas no mundo. Pressione E perto do banco de reflexão para sentar; mova para levantar.

Leia [a entrega 0.5](docs/ENTREGA-05.md) e [a auditoria visual](docs/AUDITORIA-05.md). Para visualizar apoios, caixas e colisões, abra `http://localhost:5173/?debug` e pressione F3. Lorenzo e Maria agora usam GLBs fictícios originais com esqueleto; NPCs continuam procedurais. Os saves v04 continuam compatíveis.

## O Colégio Vivo · 0.4

Cinco NPCs fictícios têm rotinas e amizade; Maria circula respeitando as missões. Explore cantina e quadra, encontre o livro de Bia, responda ao enigma de Helena e descubra a partitura de Davi. O menu permite alternar entre campanha e exploração livre, ver histórico e ajustar tamanho/opacidade dos controles e volumes separados.

Leia [a entrega 0.4](docs/ENTREGA-04.md) e [a auditoria inicial](docs/AUDITORIA-04.md). O salvamento v04 mantém os registros v03/v02 como fallback. Modelos finais e testes em Samsung físicos ainda são necessários.

## Campanha preservada · 0.3

Depois do prólogo, siga o indicador para descobrir as seis memórias originais. Converse com Maria e conclua as sequências para liberar cartas e vales. Use **Álbum e história** (◇ no celular) para capítulos, álbum, inventário, minijogos, conquistas e carta final. Os três minijogos começam em objetos físicos da sala, biblioteca e pavilhão de música. O progresso da 0.2 é migrado mantendo o registro antigo como backup.

Veja [a entrega completa da versão 0.3](docs/ENTREGA-03.md), incluindo conteúdo importado, testes e limitações.

## Controles

| Ação | Computador | Android |
| --- | --- | --- |
| Caminhar | WASD | Joystick analógico à esquerda |
| Olhar ao redor | Arrastar mouse; setas nos dois eixos | Arrastar na metade direita da cena |
| Correr | Segurar Shift | Segurar Correr |
| Conversar, coletar, abrir portas e ler placas | E ou indicador contextual | Botão contextual à direita |
| Pausa e configurações | Esc ou ☰ | ☰ |

Joystick, câmera e corrida aceitam toques simultâneos independentes. A intensidade do joystick regula a velocidade. Ao soltar, cancelar o toque, trocar a orientação, perder foco ou pausar, os controles são limpos. O jogo aceita retrato; paisagem oferece mais espaço.

## O que há na 0.2

- Câmera orbital com sensibilidade, acompanhamento suave, colisão com paredes/telhados e aproximação automática.
- Humanoides provisórios articulados com transições entre espera, caminhada, corrida, conversa e interação. Adaptador para GLB com AnimationMixer e crossfade.
- Escola com texturas procedurais locais, carteiras, bancos, marquises, pilares, janelas, mural, lixeiras, bandeira e vegetação agrupada em instâncias.
- Portas animadas com colisão atualizada, bloqueio contra esmagamento, placas e pontos de interesse.
- Objetivos indicados na tela, proximidade contextual, efeitos de coleta, diálogos, pausa, áudio e volume.
- Salvamento automático de posição, câmera, capítulo, lembranças, portas e configurações. Reinício do capítulo exige confirmação. Dados inválidos ou armazenamento bloqueado não impedem jogar.
- Qualidades Baixa/Média/Alta e resolução adaptativa. Materiais e geometrias em cache, malhas estáticas agrupadas por material e suspensão de animação/renderização com a página oculta. Pausa e boas-vindas congelam a cena; redimensionamento e configurações ainda redesenham.

## Gráficos e desempenho

Baixa desliga sombras e limita DPR a 1; Média usa sombras 1024 e DPR até 1,35; Alta usa sombras 2048 e DPR até 1,75. Sombras podem ser desligadas separadamente. A cada janela de três segundos, a resolução adaptativa cai se a taxa observada ficar abaixo de 32 FPS e sobe gradualmente acima de 55 FPS, com escala entre 0,55 e 1.

Esses são mecanismos para buscar fluidez, não uma garantia de 30/60 FPS. Ainda é necessário medir Galaxy S24 Ultra e Galaxy A35 reais, inclusive aquecimento, consumo e uso prolongado. A emulação de toque em Chromium valida controles e layout, não o desempenho da GPU de um telefone.

## Arte provisória e modelos próprios

Lorenzo e Maria usam avatares fictícios estilizados em GLB, com cabelo, rosto, mãos, roupas e animações originais. Não representam a aparência real de pessoas. NPCs secundários mantêm manequins de estudo. Referências autorizadas são necessárias para personalização fiel. Não há vozes gravadas; o áudio usa síntese procedural. A escola usa materiais toon com três faixas de luz e materiais físicos para vidro e metal, sem pós-processamento pesado.

Veja [integração de GLB](docs/MODELOS-GLB.md), [análise da base e da branch experimental](docs/ANALISE-02.md) e [entrega e validação](docs/ENTREGA-02.md).

## Build e testes

```sh
npm run build
npm run preview
npm run test:unit
npx playwright install chromium
npm test
```

`dist/` contém a build estática. Testes de lógica cobrem entrada, movimento, colisão, câmera, capítulo e salvamento. Playwright usa Chromium, teclado/mouse e toques reais via protocolo do navegador para cobrir controles, portas, diálogos, coleta, persistência, pausa e orientação. Não são testes nos aparelhos Samsung físicos.

Para publicar em um subdiretório, configure `base` do Vite para esse caminho antes da build. Os arquivos GLB devem usar URLs compatíveis com esse caminho.
