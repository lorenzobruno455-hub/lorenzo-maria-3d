# Aurora 0.9.3 — desempenho

M1: medição opt-in (`?profile`), amostras limitadas, agregação somente sob demanda. Sem render loop extra; nenhum hook instalado no modo normal. Build de produção usado nos testes, com arquivos congelados para não interferir por HMR.

Primeira janela: campus, 60 s reais, Chromium/SwiftShader, viewport 915×412, Baixo, adaptativo/sombras desligados, NPCs ativos. Renderização por software limita o frame; não representa FPS Android.

{
  "JSON.stringify": {
    "count": 337,
    "p50": 0,
    "p95": 0,
    "p99": 0.10000000055879354,
    "max": 0.20000000018626451,
    "total": 1.5000000009313226
  },
  "frame": {
    "count": 91,
    "p50": 600,
    "p95": 1983.300000000003,
    "p99": 2333.199999999997,
    "max": 2333.199999999997,
    "total": 60047.6
  },
  "NPC.update": {
    "count": 91,
    "p50": 0.30000000074505806,
    "p95": 0.7000000001862645,
    "p99": 2.099999999627471,
    "max": 2.099999999627471,
    "total": 36.700000000186265
  },
  "HUD": {
    "count": 82,
    "p50": 0.20000000018626451,
    "p95": 0.6000000005587935,
    "p99": 3.7999999998137355,
    "max": 3.7999999998137355,
    "total": 23.40000000409782
  },
  "render": {
    "count": 91,
    "p50": 3.1000000005587935,
    "p95": 38.89999999944121,
    "p99": 44,
    "max": 44,
    "total": 584.0999999968335
  },
  "update": {
    "count": 91,
    "p50": 1.2999999998137355,
    "p95": 5.199999999254942,
    "p99": 6.300000000745058,
    "max": 6.300000000745058,
    "total": 157.30000000726432
  },
  "save": {
    "count": 8,
    "p50": 0.2999999998137355,
    "p95": 0.599999999627471,
    "p99": 0.599999999627471,
    "max": 0.599999999627471,
    "total": 2.499999998137355
  }
}

Salvamento/JSON não demonstraram custo de dezenas de ms neste cenário. Nenhuma mudança no autosave autorizada por evidência até aqui. Demais cenários e comparação final serão anexados no M6. Eventos longtask não comprovam GC; render mede submissão CPU, não tempo GPU.

## M6 — janelas comparáveis de 60 segundos

Doze janelas concluídas (seis antes/seis depois): campus, escola, escadas, quadra, quadra com rádio e campus com adaptativo. Viewport915×412, preset Baixo; resolução fixa nos cinco primeiros. A comparação final usa a mesma câmera mundial do registro inicial, para isolar a medição do afastamento implementado no M2. No cenário adaptativo a resolução varia por definição; ele diagnostica realocações, não compara FPS em resolução fixa. Os arquivos [CSV](performance/093/profile-summary.csv) e [JSON](performance/093/profile-summary.json) contêm P50/P95/P99, máximos, picos >33,3/>50ms, timestamps, operações e recursos.

| Cenário | NPC máximo antes → depois (ms) | Update P99 antes → depois (ms) | Draw calls antes → depois | Triângulos antes → depois |
|---|---:|---:|---:|---:|
| campus | 2.1 → 4.5 | 6.3 → 33.8 | 167 → 159 | 211202 → 198574 |
| school | 5.8 → 4.4 | 42.9 → 47.1 | 159 → 155 | 165848 → 165776 |
| stairs | 505.2 → 40.3 | 309.2 → 43.2 | 144 → 148 | 246446 → 253614 |
| court | 1548.6 → 5.4 | 41.6 → 36.6 | 50 → 67 | 74576 → 78864 |
| court-radio | 36.9 → 37.1 | 36.9 → 40.7 | 50 → 67 | 74576 → 78864 |
| campus-adaptive | 338.1 → 39.0 | 706.1 → 33.8 | 145 → 155 | 177458 → 191070 |

A quadra custa +17 draw calls e cerca de +5,7% de triângulos no mesmo enquadramento; isso corresponde aos equipamentos, redes e fechamento superior antes ausentes. A cena era uma quadra vazia. Não se declara ganho de FPS nessa cena; os frames em software continuam muito lentos. NPCs nas escadas ainda tiveram um pico isolado de40ms na thread principal: não foi atribuída causa de GC sem evidência.

O cenário adaptativo inicial apresentou três redimensionamentos na janela, com máximo959ms. O Three.js fazia resize dentro de setPixelRatio e novamente em setSize; agora a API pública setDrawingBufferSize aplica uma mudança atômica e a assinatura impede realocação idêntica. A redução calcula um alvo em vez de vários degraus de0,1; recuperação exige15s sustentados. Depois do aquecimento, a janela final não teve novos redimensionamentos; o ajuste inicial continua ativo e pode ter custo. O autosave não foi desativado.

A instrumentação de WebGL no harness final registra compilação/link, uploads de texturas e buffers; os primeiros cinco registros iniciais usam contagem de programas/recursos, sem esses hooks WebGL. Longtasks são observados, mas não provam GC. A renderização por software impede confirmar a frequência original de3–5s dos aparelhos ou atribuir todos os picos. **Gargalos de A* e realocação foram corrigidos; a eliminação completa dos engasgos no hardware permanece não comprovada.**
