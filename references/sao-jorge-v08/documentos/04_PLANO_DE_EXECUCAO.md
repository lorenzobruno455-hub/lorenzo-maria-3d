# Plano eficiente, por entregas verificáveis

## M1 — Estrutura (prioridade absoluta)
- Conferir branch base e mudanças pendentes.
- Abrir os 4 GLBs, verificar escala e geometria; separação por andar.
- Escolher uma arquitetura de importação que reusa Three.js, `world`, `story`, `physics` e `progress`.
- Fazer um modo de visita/inspeção com seleção de andares; restaurar a exploração em terceira pessoa.
- Validar colisões, câmera e passagem entre pisos.
- Commit + testes + 3 capturas (um por pavimento).

## M2 — Identidade e objetos
- Melhorar materialização da escola, mobiliário essencial por ambiente, cores e iluminação.
- Garantir contato de objetos com superfícies.
- Revisar contagem de draw calls e compatibilidade móvel.
- Commit + capturas comparativas.

## M3 — Integração com a história
- Manter NPCs, missões existentes, biblioteca de seis livros e minijogos acessíveis.
- Posicionar interações em ambientes apropriados à adaptação fictícia.
- Atualizar navegação, objetivos e persistência.
- Commit + fluxo jogável do início até conclusão de três missões.

## M4 — Validação
- Testes unitários, Playwright, build, preview, teclado/mouse e emulação touch.
- Inspeção visual de clipping, flutuação, luz, LOD, teto e escadas.
- Capturas de tela em retrato e paisagem.
- Documentação de desempenho, limitações e origem dos recursos.
- PR. Nunca fazer merge na main sem autorização.

## Regra de prioridade

**Navegação e campanha > fidelidade visual > densidade de objetos > expansão do mapa.** O modelo precisa ser bonito, mas também jogável e testável.

## Não fazer

- Não adicionar pessoas reais ou dados pessoais da escola.
- Não substituir mapa real por croqui imaginado e afirmar que é “exato”.
- Não criar dezenas de ambientes inacessíveis só para aumentar contagem.
- Não usar texturas/assets pagos.
- Não sobrescrever alterações ainda não publicadas de 0.7C.
