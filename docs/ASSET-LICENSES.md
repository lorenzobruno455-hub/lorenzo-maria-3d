# Origem e licenças dos assets

Inventário da 0.7A, 7 de novembro de 2026. Nenhuma API paga, assinatura, crédito de geração ou asset comercial foi usado.

| Recurso integrado | Origem | Licença / observação |
|---|---|---|
| `public/models/aurora/lorenzo.glb` | Original, gerado localmente por `scripts/blender/build_aurora.py`, Blender 4.3.2 | CC0-1.0; avatar fictício, não representa aparência real |
| `public/models/aurora/maria.glb` | Mesmo script; malha, cabelo, rig e clips próprios | CC0-1.0; avatar fictício personalizável |
| Malhas e animações originais geradas pelo script | Modelagem bpy, perfis, curvas e pesos autorais desta implementação | CC0-1.0, inclusive malhas/rig/clips exportados |
| Mobiliário, mochilas, cortinas, quadro, cartazes e texturas procedurais 0.7A | `classroom.js`, `prop-library.js`, `resources.js` | Arte gerada original CC0-1.0; código mantém a licença do projeto |
| Brasão geométrico dos uniformes | Desenho original de um A/sol, criado pelo script | CC0-1.0; não é logotipo de escola real |
| Barlow Condensed Bold e ExtraBold Italic | Google Fonts, autores registrados nos arquivos OFL | SIL OFL 1.1; `public/fonts/barlowcondensed-OFL.txt` |
| Atkinson Hyperlegible Regular e Bold | Google Fonts / Braille Institute; autores na licença | SIL OFL 1.1; `public/fonts/atkinsonhyperlegible-OFL.txt` |
| Textos e memórias da campanha existente | Conteúdo anterior do repositório / usuário | Preservados; não abrangidos pela dedicação CC0 da arte nova |

## Dedicação da arte nova

Na medida permitida pela lei, os direitos sobre os modelos, rigs, animações, texturas e desenhos originais listados acima são dedicados ao domínio público por **CC0 1.0 Universal**: https://creativecommons.org/publicdomain/zero/1.0/ . Esta declaração não relicencia dependências, fontes nem conteúdo narrativo anterior.

## Ferramentas e catálogos gratuitos considerados

- [Blender](https://www.blender.org/): executado de fato; versão 4.3.2. [Licença da ferramenta](https://docs.blender.org/manual/en/latest/getting_started/about/license.html). A licença do software não é a licença da arte exportada.
- [Poly Haven / licença](https://polyhaven.com/license): catálogo CC0 consultado; nenhum HDRI ou textura baixado/integrado. Optou-se por luzes e texturas originais menores.
- [Quaternius](https://quaternius.com/): catálogo consultado; nenhum modelo externo importado. A licença de um pack futuro deverá ser verificada individualmente.
- [Kenney assets](https://kenney.nl/assets): acesso automatizado retornou HTTP 403; nenhum arquivo utilizado ou licença de pack presumida.
- [ambientCG / licença](https://docs.ambientcg.com/license/): documentação consultada; nenhum arquivo utilizado. Texturas de alta resolução seriam custo desnecessário para este cel shading móvel.

Hi-Fi RUSH, Bomb Rush Cyberfunk e Dungeons of Hinterberg são referências de linguagem artística, não fornecedores de assets. Nenhum personagem, logotipo, textura, áudio ou fonte proprietária desses jogos foi copiado.

## Reprodução

```sh
blender --background --python scripts/blender/build_aurora.py
```

O comando gera os **dois GLBs efetivamente usados pelo jogo**. Cores estão em `PALETTES`; em execução, `src/character-assets.js` permite substituir URL, altura e cores por nome de material. Não é necessário Blender no aparelho do jogador.

## Atualização 0.7B

Os mesmos dois GLBs foram efetivamente regenerados no Blender com 16 clips originais cada, incluindo Accelerate, Decelerate, Point, Pickup e OpenBook; Stand ganhou transição própria. Licença CC0 da arte original mantida. Mixamo não foi baixado nem necessário: o esqueleto permanece o mesmo. A nova fotografia cenográfica usa a geometria procedural original e é identificada como ambientação fictícia. Nenhum áudio externo foi adicionado; a aventura musical reutiliza a síntese e as melodias originais já presentes no projeto.
