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
