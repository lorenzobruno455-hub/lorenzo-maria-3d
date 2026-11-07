# Lorenzo & Maria 3D — Primeiro sinal

Primeiro protótipo de exploração em terceira pessoa ambientado no fictício Colégio Aurora. Interface e diálogos em português. Feito com Three.js e Vite.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm ci
npm run dev
```

Abra o endereço exibido no terminal. Para gerar a versão estática: `npm run build`. O resultado fica em `dist/`.

## Jogabilidade

- WASD: andar; Shift: correr; setas esquerda/direita: girar câmera.
- E: conversar com Maria e recolher objetos próximos.
- Em telas pequenas, use os botões de movimento e E.
- Converse com Maria no pátio, encontre três lembranças e retorne a ela para concluir o capítulo.

## Mapa

O jogador começa no jardim ao sul. No centro ficam o pátio, a fonte e Maria. Ao norte há duas alas com portas abertas: literatura à esquerda e biblioteca à direita. As três lembranças ficam na sala, na biblioteca e no jardim. Há colisões com paredes, móveis e vegetação; os telhados desaparecem ao entrar nas salas.

## Direção de arte e limites

A proposta final é semirrealista. Esta versão usa geometria procedural simples, materiais foscos, luz de manhã e sombras para validar mapa e jogabilidade. Personagens ainda são representações provisórias; não há modelos humanos semirrealistas, animação esquelética, vozes, inventário persistente ou jogo completo. O som opcional é um sinal ao coletar objetos. Não são necessários arquivos de arte externos; as fontes do Google são opcionais e têm alternativas locais.

## Próximos passos

1. Validar com o autor o roteiro e a planta detalhada do planejamento original.
2. Substituir personagens provisórios por modelos GLB licenciados e animações.
3. Expandir escola, missões, acessibilidade e controles de câmera para celular.
4. Adicionar salvamento e otimização para aparelhos de entrada.

## Verificação

```sh
npx playwright install chromium
npm test
```

Os testes abrem o jogo em Chromium, verificam erros, navegação, conversa inicial e redimensionamento móvel.
