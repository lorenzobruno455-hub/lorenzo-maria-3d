# Personagens provisórios e GLB

Não foram recebidas referências de aparência nem modelos licenciados de Lorenzo e Maria. Os dois personagens são manequins humanoides neutros feitos para este projeto: proporções humanas, torso torneado, articulações, mãos, calçados e roupas lisas. Cores diferenciam as silhuetas em jogo; não representam características físicas reais. Não são modelos humanos semirrealistas finais.

As animações procedurais combinam pesos suavizados de idle, walk, run, talk e interact. Caminhada e corrida articulam quadris, joelhos, ombros e cotovelos; espera inclui respiração; conversa inclui gestos e movimento de cabeça; interação estende os braços. O personagem gira gradualmente na direção do deslocamento. Partes que não se movem entre si são agrupadas por material.

Para usar personagens próprios:

1. Coloque arquivos licenciados em `public/models/lorenzo.glb` e `public/models/maria.glb`.
2. Configure as URLs em `src/character-assets.js` como `/models/lorenzo.glb` e `/models/maria.glb`.
3. Use eixo frontal +Z, eixo vertical +Y e origem no chão. O adaptador centraliza e normaliza a altura para 1,82 unidades de jogo (escala técnica provisória, sem inferir altura real).
4. Inclua clipes Idle, Walk, Run, Talk e Interact ou mapeie seus nomes na configuração.

GLTFLoader é carregado sob demanda. AnimationMixer executa os clipes e faz crossfade de 0,22 segundo nas mudanças de estado. Clipes ausentes usam Idle quando disponível. Se o carregamento falha, o manequim articulado continua jogável e a interface informa a falha. Não há retargeting automático de esqueletos ou geração de animações para GLB sem clipes; prepare os clipes no editor 3D.

Modelos são carregados da mesma origem por padrão; recursos externos precisam de CORS e licença adequados. Revise orçamento de polígonos, texturas, ossos e draw calls antes de testar no Android. Não há dependência de downloads de arte para jogar com os modelos provisórios.
