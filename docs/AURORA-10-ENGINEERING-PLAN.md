# Aurora 1.0 — engenharia, desempenho e estabilidade

Base: `53dc1c9` / PR #23 / `feat/aurora-definitive-script-v1`. Branch: `perf/aurora-10-engineering-stability`.

## Entregas incrementais

- [x] M1 — auditoria, inventário de invariantes e instrumentação opt-in; build congelado, medições antes das correções.
- [x] M2 — corrigir somente custos demonstrados pelo profiling e falhas reproduzidas; testes específicos e commits separados.
- [x] M3 — controles/ciclo de vida, saves, retomada, worker e cutscenes; preservar APIs e conteúdo.
- [x] M4 — regressão unitária completa, integração/navegação, seis capítulos/memórias e sete aventuras; toque/teclado e capturas; comparações de desempenho e build final.

## Invariantes

Não alterar narrativa, datas, títulos, IDs de missões/NPCs/recompensas, rádios, músicas, arquitetura ou layout sem evidência. Manter mundo contínuo e escadas físicas, presets e carregamento por proximidade. Não reduzir qualidade para melhorar números. Não realizar merge nem deploy.

## Método de evidência

Instrumentação existente estendida apenas no modo `?profile`. Build de produção congelado, câmeras/cenários/preset/resolução iguais, janelas de 60 s. Reportar tempos CPU, percentis, picos, draw calls, triângulos e recursos. Chromium/SwiftShader não é benchmark de Galaxy. Anotações de alocação/GC só com evidência; longtask não prova GC.

## Revisão

Verificar compatibilidade de saves, reinício explícito de campanha, recompensas idempotentes, escadas/portões e retorno de controles após interrupção. Testes antigos de navegação/aventuras usam coordenadas anteriores: adaptá-los aos pontos reais atuais mantendo as mesmas asserções funcionais. Nenhum teste será enfraquecido.
