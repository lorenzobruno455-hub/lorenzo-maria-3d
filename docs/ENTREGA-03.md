# Lorenzo & Maria 3D — Entrega 0.3: Memórias de Uma História

## Conteúdo original e importação

O HTML fornecido foi lido integralmente. `reference/color-source.txt` guarda a referência original, sem executá-la. `scripts/import-color.py` interpreta apenas literais de dados, sem executar JavaScript ou scripts do documento. Execute `python3 scripts/import-color.py reference/color-source.txt` para reproduzir a importação.

Os JSONs em `src/data/` contêm 64 falas LL, 63 MM, 27 NN (154 no total), seis memórias, oito minijogos, seis perguntas originais do quiz, 12 vales, cinco composições chiptune e a carta final integral. Textos LL/MM/NN são marcados como ficção criativa; MO é identificado como memória relatada pelo autor. IDs e metadados foram acrescentados sem reescrever os textos. Mensagens originais adicionais de conclusão e recompensa foram extraídas em rewards.json com IDs próprios. A integridade das falas e da carta é comparada ao HTML nos testes.

Divergência encontrada: AC contém **17** entradas, sendo **16 comuns e uma secreta** (`egg`), em vez de apenas 16. Todas foram preservadas. Nenhuma data das seis memórias foi alterada. A carta cita “2 anos e 2 meses” e “primeiro mês”; a data de referência dessa carta deve ser confirmada pelo autor. As falas humorísticas não são apresentadas como citações reais das pessoas. Os títulos dos minijogos mantêm a grafia em maiúsculas do HTML.

## Experiência jogável

O prólogo da 0.2, com Maria e as três lembranças, permanece disponível. Ao concluí-lo, o indicador passa para a campanha. São seis capítulos curtos, sequenciais:

| Data | Memória | Ambiente 3D |
| --- | --- | --- |
| 19/08/2024 | Quando a gente começou | Sala de história, na ala da literatura |
| 19/05/2025 | Se fomos babau | Jardim |
| 17/08/2025 | Um dos dias mais importantes da minha vida | Espaço de reflexão |
| 31/03/2026 | O meu primeiro beijo | Pátio |
| 05/09/2026 | O último dia (que não foi) | Jardim das flores |
| 21/09/2026 | Finalmente | Biblioteca |

Cada capítulo exige visitar o local, cumprir a conversa quando indicada e interagir com o objeto de memória. Conversas de capítulo são cumpridas ao terminar uma conversa temática com Maria, não ao sair antes do fim. O objeto inicia uma sequência de título/data e descrição original, com câmera próxima, iluminação local e a cena 3D visível. A carta e um vale virtual são entregues somente ao concluir a sequência. A carta final depende das seis memórias, sem exigir conquistas de atividades planejadas.

O álbum está no menu e em um livro físico na biblioteca. Tem cartas bloqueadas, raridades, datas, descrição, filtros e releitura. O inventário reúne cartas/memórias, objetos especiais, conquistas e vales virtuais. Os vales não realizam compras, pagamentos ou transações reais.

Maria oferece oito temas: cotidiano, humor, filosofia, música, escola, fé, memórias e especiais. O gerenciador tem texto progressivo, aceleração, identificação de origem, respostas/temas, encerramento, gestos e câmera aproximada. As falas são escolhidas do conteúdo original, evitando repetição consecutiva; não se afirmam como transcrições factuais.

## Três minijogos reais

- **MEMÓRIA DE VOCÊS**, na biblioteca: seis pares, cartas interativas, contagem de jogadas, bloqueio durante comparação, resultado e conquista.
- **QUIZ: QUEM CONHECE MAIS**, na sala de história: seis perguntas e alternativas originais, ordem embaralhada, placar e conquista a partir de cinco acertos.
- **NO COMPASSO DO CORAÇÃO**, no novo pavilhão de música: dez notas, entrada por toque/botão/Espaço, janelas de precisão, pontuação e conquista com 12 pontos. Usa síntese das composições originais.

Os outros cinco permanecem no catálogo, identificados como planejados e sem botão de jogar. O catálogo oferece localização para os três implementados; iniciar exige o objeto físico correspondente na escola. Missões secundárias são as três atividades opcionais, com objetivos, resultados persistentes e conquistas. Não bloqueiam a campanha.

## Conquistas, salvamento e desempenho

As condições implementadas incluem primeiro contato, vinte falas, narrador, dupla dinâmica, seis cartas, memória, quiz, ritmo e segredo da lua. As oito conquistas ligadas a batalhas, troca de jogador ou minijogos não implementados estão sinalizadas como indisponíveis. Desbloqueios recebem data de obtenção, são idempotentes e geram notificação.

O esquema v03 conserva posição, portas, câmera, preferências e prólogo; acrescenta capítulos, passos, memórias, conquistas, vales, itens e melhores resultados. Se v03 não existe ou está corrompido, a carga tenta v02. O registro v02 não é apagado ou sobrescrito. Nova campanha exige confirmação e reinicia apenas a campanha narrativa; o prólogo e as configurações permanecem. Reiniciar o prólogo também preserva a campanha narrativa.

São mantidos joystick multitouch, corrida, câmera relativa/colisões, portas, os três presets, resolução adaptativa, batching e GLB da 0.2. As 154 falas carregam sob demanda; objetos de memória aparecem conforme a campanha avança, e as interfaces são construídas ao abrir. Minijogos não criam loops ou listeners extras por partida: ao fechar, a instância e o DOM são liberados. As músicas são sintetizadas no AudioContext existente e os nós são desconectados ao terminar. Nenhum áudio comercial foi adicionado.

## Testes

Os resultados finais constam ao final deste relatório. A cobertura inclui importação e integridade literal, datas, requisitos sequenciais, cartas, conquistas, vales, três minijogos, persistência/migração, continuidade do prólogo e controles Android emulados. Os testes dos capítulos no navegador começam de estados persistidos válidos para isolar cada descoberta; a progressão sequencial integral também é exercitada nos testes de lógica. Não são testes contínuos de uma campanha inteira caminhando entre todos os locais.

## Limitações

- Não houve medição em S24 Ultra ou A35 físicos. Emulação Chromium valida entrada/layout, sem prometer FPS real.
- Os humanoides articulados continuam provisórios; não foram recebidos novos modelos ou referências. O adaptador GLB permanece disponível.
- As memórias usam pequenos enquadramentos e luz no ambiente, sem reencenações complexas ou fatos biográficos inventados.
- Os diálogos são agrupados por tema; a escolha temática não altera os acontecimentos relatados.
- Cinco minijogos, batalhas e troca de protagonista ainda não foram implementados. Suas conquistas não bloqueiam cartas ou campanha.
- Salvamento é local por navegador/origem, sem nuvem ou transferência automática entre dispositivos.
- O bundle do motor Three.js ainda gera o aviso de chunk acima de 500 kB do Vite. Falas e GLTFLoader carregam separadamente; não há erro de build.

## Executar e publicar

```sh
npm ci
npm run dev
# Chrome: http://localhost:5173
npm run test:unit
npx playwright install chromium
npm test
npm run build
npm run preview
```

Para atualizar no Chromebook: pare o servidor com Ctrl+C, execute `git pull --ff-only`, `npm ci` e `npm run dev`. Para Android na mesma rede, use `http://IP-DO-COMPUTADOR:5173`, com encaminhamento da porta no Linux do Chromebook quando necessário.

Para publicar, envie a pasta `dist/` para uma hospedagem estática. Em subdiretório, configure `base` no Vite antes da build. HTTPS é recomendado para hospedagem pública. Esta entrega atualiza o código no GitHub; não configura hospedagem nem publica um site automaticamente.

## Arquivos

Alterados: `index.html`, `package.json`, `package-lock.json`, `README.md`, `src/main.js`, `src/style.css`, `src/systems/audio.js`, `src/systems/camera.js`, `src/systems/progress.js`, `tests/game.spec.js`.

Adicionados: `reference/color-source.txt`, `scripts/import-color.py`; os JSONs `src/data/dialogues.json`, `memories.json`, `achievements.json`, `minigames.json`, `chapters.json`, `rewards.json`, `quiz.json`, `music.json`, `import-report.json`; os sistemas `dialogue.js`, `quests.js`, `achievements.js`, `minigames.js`, `story.js`, `story-world.js`; `tests/story.spec.js`, `tests/unit/story.test.js`; este relatório `docs/ENTREGA-03.md`.

## Resultado final de validação

- `npm run test:unit`: **17 aprovados**, incluindo comparação literal das 154 falas e da carta com a referência HTML, seis capítulos, recompensas, conquistas, minijogos, salvamento e migração.
- Regressão Playwright da 0.2: **11 cenários aprovados**.
- Playwright da narrativa 0.3: **10 cenários aprovados**, exercitando cada uma das seis descobertas/recompensas/persistência, carta final, quiz, cartas, navegação Android, ritmo e escolhas/encerramento de diálogo.
- Após refinamentos, os seis capítulos, quiz e reinício do prólogo foram novamente verificados; a checagem final cobre filtros do álbum e HUD da campanha.
- `npm run build`: passou, com carregamento separado das falas (aproximadamente 34 kB, 8 kB gzip) e GLTFLoader. O aviso de tamanho do motor continua documentado.
- A captura do quiz foi inspecionada visualmente. Não houve teste em celulares Samsung físicos nem publicação em hospedagem.

A campanha usa cenários fictícios para apresentar as memórias fornecidas; não afirma que o Colégio Aurora tenha sido o local real de todos os acontecimentos. A referência preservada permite revisar qualquer dado importado.

Checagem final concluída: **3/3 cenários aprovados** para conclusão do prólogo/HUD, sexto capítulo/carta final e filtros por data/raridade com navegação Android. `git diff --check` também passou.
