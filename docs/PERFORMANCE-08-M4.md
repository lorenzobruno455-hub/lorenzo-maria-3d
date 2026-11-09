# São Jorge 0.8 M4 — desempenho medido

Ambiente: Chromium headless com SwiftShader (renderização por software), Linux do workspace. Android foi emulado. Todas as instâncias GLB dos personagens estavam carregadas antes de coletar dados. Presets Baixa, Média e Alta foram medidos nos mesmos pontos e viewports do M3 e do M4, com resolução adaptativa desligada para comparação.

## Contadores de renderização

| Cena / viewport | Baixa M3 → M4 | Média M3 → M4 | Alta M3 → M4 |
| --- | --- | --- | --- |
| Corredor / 844×390 | 119 → 101 | 124 → 124 | 124 → 124 |
| Biblioteca / 390×844 | 74 → 74 | 83 → 83 | 83 → 83 |
| Ciências / 960×600 | 53 → 53 | 58 → 58 | 58 → 58 |
| Salão / 960×600 | 48 → 48 | 57 → 57 | 57 → 57 |

Valores são chamadas de desenho de `renderer.info.render`. No corredor em Baixa, os triângulos passaram de 114.794 para 83.966. A redução nessa cena vem da exclusão de NPCs distantes; nas demais cenas, os atores próximos continuam visíveis e os contadores principais permaneceram iguais. Não se afirma que todas as cenas ficaram mais rápidas.

O M4 deixa NPCs distantes sem atualizar animação em Baixa, mas continua avançando suas rotinas. NPCs só projetam sombras em Alta e a menos de 15 unidades do jogador, seguindo o orçamento já usado no campus anterior. Posição e orientação do jogador agora são fornecidas corretamente às rotinas locais. Consultas de missão e obstáculos são compartilhadas entre os atores de uma atualização; o cache de sombras reconhece modelos GLB carregados depois.

Os contadores não certificam todos os passes de sombra e **não são uma medição de FPS em Galaxy S24 Ultra, A35 ou Chromebook**. Nenhum ganho percentual de FPS é declarado. Os presets e a resolução adaptativa existentes foram preservados.

## Recursos e estabilidade

No cenário automatizado de três visitas consecutivas com inspeção dos três pisos e retorno ao campus, cada ciclo terminou com **166 geometrias e 29 texturas** reportadas pelo renderer. Não houve crescimento entre os ciclos. Isso cobre o fluxo exercitado; não prova ausência de todo vazamento possível em uma sessão de horas. Esses números usam outra fixture/preset e não devem ser confundidos com os totais dos enquadramentos acima.

Dados brutos e configuração: [PERFORMANCE-08-M4.json](PERFORMANCE-08-M4.json). Reprodução: `CHROMIUM_PATH=/caminho/chromium CAPTURE_URL=http://localhost:5173 node scripts/capture-sao-jorge-m4.mjs after`. O parâmetro `before` foi executado sobre snapshot imutável M3, árvore `2399465d32bb4ebd4c23a04282c94aa241050f7a`.

## Validação física pendente

Em aparelho real, verificar sessão de pelo menos alguns minutos nos três presets, troca de orientação, temperatura, estabilidade da resolução adaptativa e controles durante as três aventuras. Registrar modelo, navegador, preset e ferramenta de medição. Até isso ocorrer, as metas de 60/30 FPS permanecem metas, não resultados.
