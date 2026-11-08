# Entrega visual — Aurora Comic

> Registro da etapa visual anterior. Personagens, contornos GLB e verificações atuais estão em [ENTREGA-07A.md](ENTREGA-07A.md).

Direção aprovada a partir de [REFERENCIAS-HIFI-RUSH.md](REFERENCIAS-HIFI-RUSH.md). Implementação na base de jogo 0.5, mantendo a campanha e a chave de salvamento v04.

## Mudanças efetivas

- **Mundo 3D:** materiais MeshToonMaterial, rampa compartilhada de três faixas, revisão das cores e texturas locais, céu e luz. Placas e capas usam a nova tipografia e são redesenhadas quando as fontes locais terminam de carregar. Recursos são descartados sem invalidar geometria compartilhada.
- **Contornos:** arestas arquitetônicas agrupadas em uma chamada de desenho; silhuetas acompanham os pivôs reais dos personagens. Baixa limita a tinta do protagonista a cabeça e corpo. Média/Alta acrescentam partes do protagonista e silhuetas centrais de NPCs próximos, sem novos mapas de sombra. Objetos móveis e coletáveis são excluídos da tinta permanente.
- **Interface:** componentes próprios ComicPanel e ActionRibbon aplicados a menu principal, pausa, diálogos, escolhas e coleções. HUD, prompt, joystick, corrida e interação recebem a mesma paleta. Textos permanecem retos e legíveis dentro dos painéis angulares.
- **Tipografia:** Barlow Condensed e Atkinson Hyperlegible, quatro arquivos WOFF locais, cerca de 166 kB no total. Avisos e licenças OFL acompanham os arquivos em public/fonts. Nenhuma dependência de serviços de fontes durante o jogo.
- **Configurações:** navegação por seções Gráficos/Som/Controles leva aos controles reais e mantém os campos acessíveis em uma página rolável. É uma adaptação da composição em abas, preservando a edição existente.
- **Movimento e narrativa:** entrada curta de painéis, seleção com cor/contraste e destaque gráfico nos avisos reais de descoberta. A câmera aproxima-se gradualmente do livro e retorna à exploração. Movimento reduzido elimina transições decorativas e corta diretamente os enquadramentos narrativos, preservando a câmera responsiva na exploração.

As fontes e os grafismos são próprios desta adaptação. Não se copiaram screenshots, personagens, logotipos, ícones, modelos ou trilhas de Hi-Fi RUSH para os recursos do jogo.

## Preservação e correções verificadas

Missões, diálogos, seis memórias, datas, títulos, recompensas, minijogos, escolhas, prólogo, rotinas, LocalStorage, portas e controles permanecem integrados.

A implementação revelou três problemas e os corrigiu com reprodução em teste: o controle de sombras dos NPCs podia reativar sombras das cascas; contornos de coletáveis podiam ficar desenhados depois da coleta; o botão de diálogo em hover tinha contraste de 3,81:1. As cascas agora mantêm castShadow falso, as raízes móveis são excluídas do agrupamento de tinta, e o hover usa Tinta/Sol com contraste calculado de 12,42:1. O teste de contraste desliga transições para medir o estado final, evitando um falso positivo durante a interpolação.

## Verificação

A etapa anterior teve 30 testes unitários e 38 cenários de navegador aprovados. A verificação ampliada e os arquivos centrais da 0.7A estão registrados em [ENTREGA-07A.md](ENTREGA-07A.md).

Os novos testes cobrem rampas compartilhadas, descarte de geometria, qualidade sem realocação, movimento de juntas, ausência de tinta permanente de itens móveis, câmera com movimento reduzido, fontes locais, foco de teclado, orçamento gráfico Baixo, Android horizontal, retrato, navegação real das configurações e contraste final de leitura.

## Capturas inspecionadas

Capturas reais de Chromium/SwiftShader; são evidência de apresentação e integração, não benchmark de Samsung físico.

| Tela | Captura |
| --- | --- |
| Menu principal | [main-menu.png](captures/comic/main-menu.png) |
| Exploração e HUD — Baixa | [exploration.png](captures/comic/exploration.png) |
| Livro aberto — Android horizontal | [android-memory.png](captures/comic/android-memory.png) |
| Álbum — Android retrato | [portrait-album.png](captures/comic/portrait-album.png) |
| Sala — Média com sombras | [classroom-medium.png](captures/comic/classroom-medium.png) |
| Biblioteca — Média com sombras | [library-medium.png](captures/comic/library-medium.png) |
| Jardim — Média com sombras | [garden-medium.png](captures/comic/garden-medium.png) |
| Pátio — Média com sombras | [courtyard-medium.png](captures/comic/courtyard-medium.png) |

Para repetir ambientes, inicie Vite e execute `node scripts/capture-comic.mjs medium`; aceita também low/high. As fixtures definem posição inicial em um salvamento isolado. Capturas de ambiente ocultam o HUD após pausar, para inspecionar proporções e materiais.

## Limites e próximos passos

- A influência está na linguagem visual e na integração. Este renderer leve de Three.js não reproduz o renderer deferred customizado da UE4 usado por Hi-Fi RUSH.
- Humanoides continuam manequins procedurais articulados. Não há referências autorizadas de aparência, novas expressões faciais ou IK. Modelos definitivos e animação de maior qualidade continuam necessários para elevar a fidelidade artística.
- Contornos seletivos são uma escolha de desempenho. Modelos GLB personalizados, especialmente SkinnedMesh, precisam de uma adaptação específica de contorno e revisão de materiais antes de serem considerados parte do novo acabamento.
- Rampas e limites de tinta são compartilhados, mas os aparelhos Galaxy A35/S24 Ultra não foram medidos fisicamente. Sombras e resolução adaptativa continuam configuráveis.
- O feedback gráfico usa eventos reais de descoberta; não foi introduzida uma nova mecânica obrigatória de ritmo, sincronização global do mundo à música ou pós-processamento pesado.
- Próximas prioridades: referências dos protagonistas, silhuetas e poses mais expressivas, teste físico de GPU/temperatura, revisão artística de vegetação e integração validada de GLBs. Manter o mapa compacto.
