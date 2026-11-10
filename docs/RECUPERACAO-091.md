# 0.9.1 — posição segura sem apagar progresso

A restauração do São Jorge verificava a posição antes de carregar os colisores do acabamento atual. Um save em (-6.5,-7.9), livre no layout inicial, podia terminar dentro de um móvel carregado depois. A restauração agora aguarda o piso e valida a posição contra as colisões atuais, inclusive as mundiais do térreo.

**Pausa → Voltar ao ponto seguro** retorna ao pátio central do campus, em (0,10), ao sul da fonte. A posição e os controles são restaurados; campanha, inventário, missões, memórias e modo de exploração são preservados. O botão não reinicia capítulo e não altera o formato v04. Durante uma cena narrativa, conclua ou pule a cena antes de usá-lo.

O resgate é uma ação manual explícita, independente da passagem normal pela porta. Também cancela uma restauração pendente, impedindo um retorno tardio à escola quando o carregamento termina. A posição final é salva após o retorno ao pátio.

Verificação: teste de save obstruído reproduzido antes da correção; retorno de piso superior por toque Android, preservação de progresso, recarga e movimento; oito direções livres em torno do ponto central; cancelamento de carga pendente. Os testes também conservam a travessia normal da porta e o botão de tela inteira. Sem dependências novas, reset de saves ou merge na main. A regressão completa acompanha o PR #12.
