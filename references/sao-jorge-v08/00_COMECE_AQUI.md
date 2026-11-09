# PROJECT AURORA 0.8 — Kit de execução para Codex

**Objetivo:** criar no Lorenzo & Maria 3D uma versão **ficcionalizada e reconhecível** do Colégio São Jorge de Ponta Grossa, inspirada nas plantas do usuário, com 3 pavimentos, interior explorável, identidade de cores, interações e uso em Android/Chromebook.

## Como usar este pacote

1. Envie este ZIP ao Codex ou extraia a pasta na raiz do repositório, em `references/sao-jorge-v08/`.
2. Cole o conteúdo de `01_PROMPT_CODEX.md` na tarefa Codex. Se anexar o ZIP, avise que ele contém os croquis e GLBs.
3. Exija que ele faça primeiro a **Etapa 1** (integração e navegação), teste e mostre capturas de tela antes de continuar decorando tudo.
4. Mantenha a 0.8 em branch própria, sem apagar trabalho existente das versões 0.7A/B/C.
5. Só integre o PR depois de testar em Chrome no Chromebook e no Android.

## O que realmente está confirmado

- O colégio, segundo o usuário, possui **três andares**.
- O **terceiro andar é um salão**.
- Os dois croquis são referências para a distribuição geral dos ambientes do primeiro e segundo andares.
- As fotografias de salas descritas anteriormente são representativas da escola, segundo o usuário.

## O que NÃO está comprovado

- Dimensões, coordenadas, números das salas, altura, orientação real, quantidade exata de carteiras, posição de portas e janelas.
- Palco, depósito e foyer do 3º andar: são conceitos propostos nas imagens, **não confirmações**.
- Paleta hex: é uma aproximação visual inspirada nas referências, não levantamento fotométrico.
- Os GLBs são **modelos conceituais**, não levantamento arquitetônico verificado.

Não transformar suposições em fatos; não inferir áreas sensíveis de uma escola real. O jogo pode reproduzir **ambientes típicos e identidade visual**, com corredores e acessos adaptados artisticamente para jogabilidade e segurança.

## Estrutura do ZIP

- `referencias/planta_usuario_1_andar.jpeg`: croqui fornecido pelo usuário.
- `referencias/planta_usuario_2_andar.jpeg`: croqui fornecido pelo usuário.
- `referencias/terceiro_andar_CONCEITUAL_nao_confirmado.png`: ilustração proposta.
- `modelos/*.glb`: maquetes de três andares e individuais, conceituais e reaproveitáveis.
- `visualizador/maquete_3_andares_android.html`: visualizador autossuficiente de referência.
- `dados/escola_v08_referencias.json`: inventário de ambientes com proveniência e paleta de cores.
- `documentos/*.md`: fonte de verdade, direção artística, implementação e critérios de aceite.

**Importante:** o ZIP é um material de desenvolvimento, não altera automaticamente o repositório do GitHub.
