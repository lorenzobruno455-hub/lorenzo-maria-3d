# Aurora 0.7C · ambiente

A biblioteca ganha madeira mel, papel creme e capas verdes, castanhas e lilases.
Três estantes estreitas acompanham a parede leste com 120 livros volumétricos,
alturas variadas e faixas nas lombadas. Pilhas de leitura, passadeira com filete,
luminárias suspensas por cabos e faces claras das luminárias de mesa valorizam
a área de estudo sem acrescentar luzes dinâmicas. Os seis livros de memória
continuam no console original com os mesmos IDs, capas articuladas, ordem,
travas, títulos e progresso.

No pátio, bordas claras e flores preenchem os canteiros existentes; encaixes
enriquecem os bancos. Relevos rasos dão ritmo às fachadas sem cruzar portas.
A cantina ganha bandejas, canecas e nervuras de cobertura; a quadra ganha
linhas do garrafão e alvo no painel. As novas estantes têm limites de colisão
correspondentes à geometria; nenhum destino ou objeto de missão foi criado.

Toda decoração é geometria procedural original sob CC0, sem recursos externos
ou pagos. As formas usam world.resources e a paleta existente. A decoração
entra nos lotes estáticos; ao terminar a construção da história, lotes inkStatic
na cena ou seus grupos imediatos são reunidos por material. Qualquer ancestral
inkDynamic, placement ou inkActor impede essa consolidação. Objetos interativos,
folhas instanciadas, placas, portas e telhados permanecem independentes.
Geometrias resultantes pertencem à história e são liberadas por seu dispose;
geometrias de origem continuam sob responsabilidade dos respectivos donos.

O teste de decoração verifica mais de 400 peças, somente quatro formas
compartilhadas e no máximo 14 lotes para a paleta combinada. Os testes locais
relevantes são environment07c.test.js, environment07b.test.js e spatial.test.js.
Orçamentos finais de renderização exigem medição da cena completa no navegador.
