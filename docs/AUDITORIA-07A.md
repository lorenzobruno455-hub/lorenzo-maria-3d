# Auditoria Project Aurora 0.7A

Data: 7 de novembro de 2026. Base remota: `06a21652` (Colorbeat 0.6). Branch de trabalho: `feat/aurora-07a`.

## Estado encontrado

- Three.js 0.181, Vite 7, JavaScript modular; mundo métrico com colisores AABB, portas móveis e câmera orbital com contração por oclusão.
- Lorenzo e Maria usam `Character`, manequins articulados procedurais. `CHARACTER_ASSETS` tem URLs nulas. Há um adaptador GLB básico que normaliza altura, mas não compartilha instâncias, não preserva materiais toon nem resolve substituições concorrentes.
- Colorbeat 0.6 remoto acrescentou um segundo sistema de contornos e efeitos DOM. O trabalho visual anterior local usa InkOutlines, paleta própria e fontes locais OFL. Integração preserva os efeitos e mantém apenas um sistema de contornos ativo.
- Materiais opacos usam MeshToonMaterial, rampa compartilhada; vidro/metal conservam materiais físicos. Contornos antigos não acompanham SkinnedMesh. Sombras apresentam faixas de auto-oclusão em paredes; serão corrigidas e verificadas com renderização real.
- Sala 01 tem seis carteiras duplas de 2,5 × 1,2 m, cadeiras, livros, quadro e mesa de professor. Está subdetalhada e a composição não diferencia a frente de aula das janelas.
- Missões, diálogos, minijogos, livro narrativo, álbum, NPCs e saves têm suites existentes; não entram no escopo de expansão narrativa.
- Baixa desliga sombras e reduz contornos; Média usa mapa 1024; Alta 2048. Orçamento de regressão Baixa: menos de 160 draws e 110 geometrias. Manter estes limites.
- Blender 4.3.2 está disponível como executável local, sem MCP Blender instalado. Não serão usados serviços de geração, créditos ou assets pagos.

## Decisão de implementação

Gerar dois avatares fictícios originais no Blender, exportar GLBs de verdade com armature e clips, integrar por carregamento assíncrono com fallback. Aparência e cores são parâmetros, sem pretender representar as pessoas reais. Remodelar a sala por superfícies coerentes, mobiliário detalhado, quadro em parede sólida, mochilas, armários, janelas emolduradas e iluminação sem novos mapas de sombra. Não adicionar missões.

## Evidências

Capturas antes/depois e resultados finais estão em `ENTREGA-07A.md`. Na entrada, os 32 testes unitários existentes e a build passaram. Rodadas intermediárias de browser encontraram problemas de integração, descritos na entrega; a verificação final usa o código estabilizado. A base local visual ainda não estava publicada. Novos móveis também exigiram recuperação de posição salva nas proximidades, preservando o acesso ao caderno de estudos em vez de reiniciar a exploração no pátio.
