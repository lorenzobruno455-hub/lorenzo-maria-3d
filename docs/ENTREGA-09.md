# Aurora 0.9 — mundo contínuo

Base: `9132f87` da branch `feat/aurora-082-living-school`, depois da M4 e do botão de tela inteira. Branch própria: `feat/aurora-09-continuous-world`; [PR #12](https://github.com/lorenzobruno455-hub/lorenzo-maria-3d/pull/12) sobre a 0.8.2. O campus e os dados narrativos permanecem na posição original. Não publica uma nova versão no Sites nem integra automaticamente à main.

## Localização e percurso

O São Jorge ocupa X=49…71, Z=-19…19. Porta central em (60,19), vão de 2,6 unidades. A faixa navegável em Z=20 liga o pavimento existente à escola pela lateral leste; árvores, bancos e postes novos ficam fora dos limites antigos. Limites físicos: X=-38…82, Z=-27…29. Essas são coordenadas fictícias do jogo, não dimensões reais.

Siga para a lateral direita do campus e continue pelo caminho até a placa São Jorge. A porta abre por aproximação após o carregamento. Entre e saia andando. Os botões de visita foram removidos; “Saída a pé” apenas explica o caminho. A cena, controles, câmera e motor de colisão são os mesmos. Não há fade ou reposicionamento mundial ao atravessar a entrada.

Escadas conservam os patamares interativos e as transições entre pavimentos já existentes, com colisões somente no piso ativo. Esta entrega torna contínuo o percurso externo e a porta; não reconstrói a escadaria.

## Coordenadas e compatibilidade

`mundo = local + (60,0,0)`, sem rotação ou espelhamento. Layout, mobiliário, pontos de missão e saves internos continuam locais. Avatar e câmera mudam de referencial usando `Object3D.attach`, preservando suas poses mundiais. Os vetores interpolados da câmera recebem a mesma transformação. Projeções de marcadores, enquadramentos narrativos e contornos usam o referencial correto.

A entrada antiga `lorenzo-maria-v04`, seus backups e a versão do formato permanecem. A posição externa aceita os limites ampliados; `schoolVisit` continua usando coordenadas locais e o piso salvo. A porta nova é transitória e não altera os dois estados de portas legados. A restauração inicial de um save dentro da escola é distinta da travessia durante o jogo.

As missões, seis livros de memória, textos/datas, sete personagens e recompensas reutilizam M3. O adaptador narrativo existente empresta os mesmos atores e objetos para a escola durante a permanência e restaura os elementos do campus na saída; não se duplicam personagens ou progressos.

## Recursos e colisões

A fachada simplificada é visível de longe. O térreo é pré-carregado a menos de 18 unidades da porta; seus detalhes aparecem na proximidade. Uma barreira física temporária impede atravessar antes do carregamento, mantendo o campus utilizável. Falha de rede permite nova tentativa, sem bloquear menus ou controles. Pisos superiores conservam o carregamento existente por patamar/inspeção; restaurar um save nesses pisos não pré-carrega o térreo.

Os GLBs originais permanecem intactos. Só o buffer da parede frontal da instância recebe um vão; laterais e verga são preservadas e o descarte restaura o buffer emprestado. Colisão de caminhada ignora a verga acima da cabeça; a câmera mantém a altura completa dos obstáculos. Elementos estáticos são agrupados, materiais compartilhados; postes não acrescentam luzes dinâmicas.

Paredes internas ocultam o campus distante enquanto o jogador está no interior; a visibilidade é restaurada antes da porta. Proxies dos pisos não detalhados continuam compondo o exterior. A luz direcional acompanha a região explorada, sem aumentar o orçamento de sombras. Objetos externos usam culling por distância; os proxies usam frustum culling por suas caixas mundiais. O preset escolhido também controla os objetos do campus.

## Verificação e evidência

- 152 testes unitários passaram; build Vite 0.9.0 aprovado. O aviso de tamanho do bundle Three.js continua existente.
- Caminhada real por teclado, porta de ida/volta com posições mundiais registradas quadro a quadro, botão de saída sem viagem e preservação de campanha.
- Save/reload no caminho externo e travessia com multitouch Android: joystick mantido durante a mudança de referencial, sem perda do movimento.
- Prólogo com três objetos em vários pisos e retorno a pé ao campus aprovado.
- Revisão independente do diff sem defeitos concretos encontrados; revisão estática, não substitui os testes.
- Regressão completa de navegador: 80/80 passaram, em quatro partes de 20, sem skips ou falhas. [Execução final aprovada](https://github.com/lorenzobruno455-hub/lorenzo-maria-3d/actions/runs/42800589931), fonte `833806c67685ca083c9a4c9d92ad913aecb5f889`. Os commits posteriores de evidências/documentação não alteram o código validado.

Os testes antigos de visita mantêm seus cenários e agora chegam/saem andando com comandos reais. O auxiliar lê colisores sem modificar o estado do jogo. A CI usa quatro partes disjuntas, um worker por parte, porque o percurso físico substitui a viagem instantânea. Replays narrativos completos têm cinco minutos de orçamento em SwiftShader, incluindo a volta a pé, mantendo todas as verificações funcionais e os limites gráficos originais.

[Capturas e métricas reais](captures/09/metrics.json): [campus](captures/09/campus.jpg), [caminho](captures/09/path.jpg), [porta](captures/09/entrance.jpg), [interior](captures/09/inside.jpg), [segundo piso](captures/09/floor-2.jpg), [terceiro piso](captures/09/floor-3.jpg). Chromium/SwiftShader 960×600, Médio, sombras ligadas, adaptação desligada. Capturas registram enquadramentos reais, não FPS de dispositivos físicos.

| Vista | Draw calls | Triângulos | Geometrias | Texturas |
|---|---:|---:|---:|---:|
| campus | 241 | 245248 | 123 | 41 |
| path | 53 | 145374 | 118 | 10 |
| entrance | 107 | 199180 | 117 | 12 |
| inside | 152 | 162920 | 163 | 39 |
| floor-2 | 83 | 89568 | 169 | 41 |
| floor-3 | 70 | 54656 | 143 | 30 |

O campus mantém seus objetos originais; esta contagem inclui a nova conexão quando visível. Pisos detalhados não visíveis ficam fora da renderização, mas os recursos carregados podem permanecer no cache existente. Os enquadramentos desta entrega não constituem uma comparação controlada de FPS com versões anteriores.

Reprodução: `npm ci`, `npm run test:unit`, `npm run build`, `npm test`. Capturas: Vite em 5173 e `node scripts/capture-continuous09.mjs`; `CHROMIUM_PATH` permite apontar um Chromium local. Android físico e sessões térmicas longas precisam de ensaio no dispositivo.
