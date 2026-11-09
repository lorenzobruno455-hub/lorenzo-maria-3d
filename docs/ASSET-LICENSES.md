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

## Atualização 0.7C

| Asset integrado | Origem | Licença |
| --- | --- | --- |
| `public/models/aurora/bia.glb` — 865.044 bytes | Gerador original `scripts/blender/build_aurora.py`, Blender 4.3.2 | CC0-1.0 |
| `public/models/aurora/caio.glb` — 733.912 bytes | Mesmo gerador original; faixa e roupa esportiva | CC0-1.0 |
| `public/models/aurora/helena.glb` — 892.036 bytes | Mesmo gerador original; óculos, coque e casaco | CC0-1.0 |
| `public/models/aurora/davi.glb` — 704.908 bytes | Mesmo gerador original; fones e mochila | CC0-1.0 |
| `public/models/aurora/lia.glb` — 869.756 bytes | Mesmo gerador original; avental e coque | CC0-1.0 |
| Estantes, livros, jardim, cantina e fachada | `library-garden07c.js`, geometria procedural original | CC0-1.0 |
| Novos efeitos e áudio | `visual-effects.js`, `colorbeat-effects.css`, `audio.js`; formas próprias e síntese WebAudio | CC0-1.0 |

Os cinco modelos foram gerados e efetivamente carregados pelo jogo, com 18 ossos e 16 animações cada; não são apenas scripts ou promessas de importação. São personagens fictícios, não retratos reais. Nenhum recurso externo, amostra comercial, API paga ou crédito de IA foi necessário. Fontes e narrativas mantêm as licenças anteriores. Dedicação da arte original: https://creativecommons.org/publicdomain/zero/1.0/ .

Para gerar apenas os NPCs:

```sh
blender --background --python scripts/blender/build_aurora.py -- bia caio helena davi lia
```

O comando sem nomes agora gera os sete personagens. A licença do Blender não é a licença dos modelos exportados.

`public/favicon.svg`: monograma geométrico original LM, CC0-1.0.

## Project Aurora 0.8 · pacote São Jorge / M1

| Recurso | Origem e uso | Licença/proveniência registrada |
| --- | --- | --- |
| Quatro GLBs conceituais, dois croquis JPEG, imagem conceitual e visualizador | ZIP `Projeto_Aurora_V08_Pacote_Codex.zip` fornecido pelo usuário, preservado em `references/sao-jorge-v08/` | Material fornecido com autorização explícita de aproveitamento neste projeto; o pacote não declara uma licença pública independente. Não é presumido CC0 nem medição arquitetônica oficial. |
| `public/models/sao-jorge/pavimento-{1,2,3}.glb` | Derivados dos GLBs fornecidos por `scripts/prepare-sao-jorge.py`, com SHA256 de origem nos metadados; três camadas, normais e cores por vértice | Mesma proveniência do pacote; alterações procedurais originais do projeto. Não se relicencia o material recebido. |
| Código de navegação/visita, materiais do pool e UI M1 | Implementação própria nesta etapa, sobre Three.js e componentes existentes | Licenças de código/dependências existentes mantidas; não inclui assets de catálogos externos. |

A ilustração conceitual de terceiro piso não foi usada como textura nem tomada como confirmação de palco, foyer ou depósito. Nenhuma fotografia de pessoa foi aplicada a modelos. Blender/serviços de geração não foram necessários no M1: a preparação foi feita com Python padrão, sem dependências pagas. Paleta é aproximação do guia fornecido, não identidade oficial certificada.
