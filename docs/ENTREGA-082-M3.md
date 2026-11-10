# Living School 0.8.2 — M3

Continuação autorizada após M1/M2, cuja regressão CI 42751490760 aprovou 76/76 cenários de navegador, unitários e build. Não se repetiram seus testes durante esta etapa, salvo os afetados pela integração dos novos volumes.

## Implementação

`school-living-details.js` usa Resources, os materiais Colorbeat e batchMeshes existentes. Não substitui as fábricas M1/M2. Agrupa todo o mobiliário/props complementares de cada piso em no máximo quatro malhas por material, com sombras adicionais apenas em Alta. É criado/destruído no mesmo ciclo de carregamento por pavimento do SchoolVisit.

- Recepção, direção, secretaria e coordenação: superfícies de trabalho onde faltavam, computador, teclado, telefone, impressora e documentos genéricos. A mesa já existente da secretaria permanece; o novo conjunto evita móveis, portas e pontos narrativos existentes.
- Professores: mesa coletiva, cadeira complementar, pastas, papelaria, copo e organizador. Assentos/estantes anteriores permanecem.
- Ciências e laboratório: microscópios esquemáticos apoiados nas bancadas existentes, lâminas, modelos didáticos de célula e recipientes de observação decorativos. Sem substâncias, equipamento ou atividades funcionais.
- Cinema: assentos e tela preservados; conteúdo curto na tela existente e mesa reversível com projetor decorativo, sem luz dinâmica extra.
- Murais próprios no atlas existente dão identidade às áreas administrativas e científicas, sem dados pessoais nem textos narrativos novos.

## Validação afetada

Novos volumes sólidos possuem colisão, são contidos nas salas e rejeitados se interceptarem sólidos anteriores, portas ou pontos narrativos/abordagens. Os props complementares respeitam o apoio real, os detalhes M1/M2 e uma reserva de 0,27 junto aos pontos narrativos na mesma altura. Recursos emprestados não são descartados.

Dez testes focados de integração/arquitetura/navegação passaram. O teste novo de rotas encontrou a mesa da direção obstruindo o centro da sala pequena: profundidade, afastamento e cadeira desse conjunto foram ajustados; os centros originais de sala, portas, escadas e abordagens/rotas narrativas passaram novamente, sem mudar navegação ou paredes.

Capturas: laboratório, recepção, professores, cinema, ciências, secretaria, direção e coordenação. Evidências comparativas e métricas consolidadas com M4 na entrega final. A regressão completa é executada uma vez depois do M4, sem repetir M1/M2 separadamente.
