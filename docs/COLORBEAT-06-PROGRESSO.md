# Colorbeat 0.6 — implementação inicial para revisão

Base: `main` no commit `5296a765693a4dff8e5a79d994cf4db700b50cba`.

## Entregue nesta branch

- Novo tema original de interface em `src/colorbeat.css`: paleta centralizada, tipografia Barlow Condensed/Atkinson Hyperlegible (Google Fonts com fallbacks), painéis de aparência gráfica, seleção, HUD, menus, configurações, diálogos, álbum, indicadores e controles móveis.
- Importado depois de `src/style.css` para preservar estilos e lógica anteriores; a implementação é predominantemente não destrutiva.
- Materiais opacos de `Resources` agora usam `MeshToonMaterial` com rampa compartilhada de três faixas e filtragem Nearest, enquanto materiais especiais de vidro e metal continuam usando `MeshStandardMaterial`.
- A rampa compartilhada tem descarte explícito no ciclo de vida de recursos. Não foram importados assets protegidos de Hi-Fi RUSH.

## O que precisa ser verificado

Não foi possível executar o jogo, `npm run build` nem Playwright neste ambiente de edição: o código foi alterado usando a conexão GitHub, e a cópia completa do projeto não estava disponível em um runtime com dependências instaladas. **Não considere a 0.6 concluída ou os testes aprovados por este documento.**

No ambiente local do Codex, antes de mesclar:

```sh
npm ci
npm run test:unit
npm test
npm run build
```

Inspecione screenshots desktop, Android emulado e o resultado das sombras nas três qualidades. Confirme que a rampa toon não descaracteriza folhas, detalhes da biblioteca, água ou superfícies emissivas. Confirme legibilidade do corpo de texto em retrato e paisagem e carregamento com fontes de fallback/offline.

## Ainda pendente da identidade visual 0.6

- Contornos 3D seletivos com orçamento por qualidade.
- Revisão dos modelos humanoides e silhuetas.
- Redesenho/retopologia de objetos que continuem visualmente simples.
- Efeitos de quadrinhos e transições com controle de movimento reduzido.
- Revisão visual lado a lado com as referências documentadas em `REFERENCIAS-HIFI-RUSH.md`.
- Validação real de desempenho em aparelhos Samsung.
- Auditoria visual final e relatório de entrega completo.

## Direção

Esta PR entrega a **base visual verificável e revisável**; mantenha o trabalho em branch até testar e ajustar. A intenção é evoluir em pequenos incrementos para não comprometer a campanha, os seis capítulos, as memórias e os controles.
