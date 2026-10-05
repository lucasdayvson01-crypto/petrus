// Material de estudo do Petrus. Só afirma o que está no texto de lei do Vade Mecum (dados/leis). Vídeos: confira se ainda estão no ar.
// y = id de vídeo do YouTube; p = id de playlist. "47" = série do 47º Exame (a matéria base é a mesma; confira alterações recentes).
const Y = (t, y, n) => ({ t, y, n }), L = (id, n, t) => ({ id, n, t });
const CEISC = (t, y) => Y('CEISC: ' + t, y, 'estude em meia hora (visão geral)');
const QUENTES = (t, y) => Y('CEISC: ' + t, y, 'temas quentes (revisão perto da prova)');
window.C48_ESTUDO = {
  como: [
    ['1. Aula (25 a 40 min)', 'Assista à videoaula da unidade. Sem pausar toda hora: anote só o título de cada bloco.'],
    ['2. Lei seca (15 a 20 min)', 'Abra os artigos indicados no Vade Mecum, leia e marque com estrela o que a banca cobra: prazos, números, exceções.'],
    ['3. Esquema (10 min)', 'Na página da unidade, use o botão Esquema: Regra, Exceção, Pegadinha. Escreva com as suas palavras.'],
    ['4. Questões reais (20 min)', 'Treine 10 questões da matéria. Errou? Mande para o caderno de erros com o motivo.'],
    ['5. Revisão', 'D1, D2, D7, D14 e D30. O app agenda sozinho quando você marca a unidade como estudada.']
  ],
  mat: {
    etica: { aulas: [Y('47 · Advogados e Estagiários', 'HMhy0I4EhpE'), Y('47 · Raio-X da Ética', 'qEPo_eFzbNM'), Y('46 · Código de Ética: resumão', 'hAD0-fAFY8s'), Y('CEISC: Ética, temas quentes', 'rpE1EaLaYZ8')], leis: [L('estatuto', null, 'Estatuto da OAB'), L('regulamento', null, 'Regulamento Geral'), L('ced', null, 'Código de Ética')] },
    const: { aulas: [CEISC('Constitucional', 'Dj4MxP4ZQnY'), QUENTES('Constitucional', 'S2Fqh4Ek7PQ'), Y('Treino: Const. + ECA', 'iUN3cW93qJM', 'conferir')], leis: [L('cf', null, 'Constituição Federal')] },
    dh: { aulas: [CEISC('Direitos Humanos', 'ajSMocUPYx8'), Y('Treino: Adm + Int + DH', 'ltS9cJ1T90A', 'conferir')], leis: [] },
    civil: { aulas: [CEISC('Civil', 'ypxjsrzu4Rw'), QUENTES('Civil', 'u0BlZMJ8qeE'), Y('Treino: Civil + Eleitoral + Consumidor', 'q8jK_qBY3eY', 'conferir')], leis: [L('cc', null, 'Código Civil')] },
    pcivil: { aulas: [CEISC('Processo Civil', 'tZXKWwyK9Dw'), QUENTES('Processo Civil', '0FQv5TYrJ3s')], leis: [L('cpc', null, 'Código de Processo Civil')] },
    penal: { aulas: [CEISC('Penal', 't-_F8a-6fWU'), QUENTES('Penal (1)', 'OmgGomITnIU'), QUENTES('Penal (2)', 'I7Y8AATled4')], leis: [L('cp', null, 'Código Penal')] },
    ppenal: { aulas: [CEISC('Processo Penal', 'Bc-dkix5sCk'), QUENTES('Processo Penal', 'WBTc-AFnpoc'), Y('Treino: PP + Financeiro', 'la815fHLhKM', 'conferir')], leis: [L('cpp', null, 'Código de Processo Penal')] },
    adm: { aulas: [CEISC('Administrativo', '_0Vve7zkyCw'), QUENTES('Administrativo', 'Im_RBryJrL8'), Y('Treino: Adm + Int + DH', 'ltS9cJ1T90A', 'conferir')], leis: [] },
    trib: { aulas: [CEISC('Tributário', 'b0rEpUEBXR4'), QUENTES('Tributário', 'a_NIGMHmRaQ'), Y('Treino: Trib + Prev', 'F8KYPpG_a7o', 'conferir')], leis: [L('ctn', null, 'Código Tributário Nacional')] },
    trab: { aulas: [CEISC('Trabalho', 'KKGZAuRNWdY'), QUENTES('Trabalho', 'HizHwr0ZD-c')], leis: [L('clt', null, 'CLT')] },
    ptrab: { aulas: [CEISC('Processo do Trabalho', '2ep6dyHeNk8'), QUENTES('Processo do Trabalho', 'L2uIgCTk6RU')], leis: [L('clt', null, 'CLT')] },
    emp: { aulas: [CEISC('Empresarial', 'B06gFJ_3G38'), QUENTES('Empresarial', 'VnB1jueadSA'), Y('Treino: Empresarial + Filosofia', '0FO2R4wPRD8', 'conferir')], leis: [L('cc', null, 'Código Civil (livro de empresa)')] },
    cons: { aulas: [Y('Treino: Civil + Eleitoral + Consumidor', 'q8jK_qBY3eY', 'conferir')], leis: [L('cdc', null, 'CDC')] },
    eca: { aulas: [Y('Treino: Const. + ECA', 'iUN3cW93qJM', 'conferir')], leis: [L('eca', null, 'ECA')] },
    fil: { aulas: [Y('Treino: Empresarial + Filosofia', '0FO2R4wPRD8', 'conferir')], leis: [] },
    amb: { aulas: [Y('Treino: PC + Ambiental', 'X5zwu5VkRM0', 'conferir')], leis: [] },
    int: { aulas: [CEISC('Internacional', 'S5Q-MpKSNFU'), Y('Treino: Adm + Int + DH', 'ltS9cJ1T90A', 'conferir')], leis: [] },
    prev: { aulas: [Y('Treino: Trib + Prev', 'F8KYPpG_a7o', 'conferir')], leis: [] },
    elei: { aulas: [Y('Treino: Civil + Eleitoral + Consumidor', 'q8jK_qBY3eY', 'conferir')], leis: [] },
    fin: { aulas: [Y('Treino: PP + Financeiro', 'la815fHLhKM', 'conferir')], leis: [] }
  },
  un: {
    'etica:0': {
      aulas: [Y('47 · Advogados e Estagiários', 'HMhy0I4EhpE'), Y('Raio-X da Ética', 'qEPo_eFzbNM')],
      leis: [L('estatuto', '1', 'Atividades privativas (arts. 1º a 5º)'), L('estatuto', '8', 'Requisitos de inscrição (art. 8º)'), L('estatuto', '9', 'Estágio (art. 9º)')],
      pontos: ['O Estatuto lista as atividades privativas da advocacia no art. 1º. Habeas corpus pode ser impetrado por qualquer pessoa: não é privativo.', 'Atos privativos praticados por quem não é advogado são nulos (art. 4º). Leia o artigo.', 'O art. 5º trata do mandato: o advogado postula sem procuração em caso de urgência, com prazo para apresentá-la, e a renúncia tem prazo de responsabilidade depois da notificação. Confira os números no texto.', 'Inscrição: o art. 8º traz os requisitos (inclusive o Exame de Ordem e a idoneidade moral, com quórum qualificado para a recusa). Decore a lista.', 'Estágio: o art. 9º exige 2 anos e as regras do estagiário. Confira as hipóteses.'],
      peg: ['Dizer que HC é atividade privativa. Não é.', 'Trocar prazo do mandato urgente e prazo após renúncia. Leia o art. 5º com calma.'],
      auto: ['Cite três atividades privativas da advocacia.', 'Quem pode impetrar habeas corpus?', 'Quais são os requisitos de inscrição do art. 8º?']
    },
    'etica:1': {
      aulas: [Y('47 · Direitos dos Advogados', 'BUU5vRlrWrU')],
      leis: [L('estatuto', '7', 'Direitos do advogado (art. 7º)'), L('estatuto', '7-B', 'Violação de prerrogativas (art. 7º-B)')],
      pontos: ['O art. 7º concentra as prerrogativas: comunicar-se com o cliente preso, ter instalações condignas, sala de Estado-Maior, inviolabilidade do escritório, entre outras.', 'A busca em escritório tem regras e exige acompanhamento de representante da OAB (§ 6º). Leia o parágrafo inteiro.', 'O art. 7º-B tipifica como crime violar os direitos dos incisos II, III, IV e V do art. 7º, com pena de detenção de 2 a 4 anos e multa.'],
      peg: ['Confundir prerrogativa com privilégio pessoal. Ela existe para a defesa do cliente.', 'Esquecer a exigência de representante da OAB na busca.'],
      auto: ['O que é preciso para busca e apreensão em escritório de advocacia?', 'Qual a pena do art. 7º-B?', 'Onde o advogado pode ficar preso antes do trânsito em julgado?']
    },
    'etica:2': {
      aulas: [Y('47 · Espécies de Advogados e Honorários', 'jstI8K3rnhc'), Y('Nova Lei dos Honorários', 'XQfx9kdbY1I')],
      leis: [L('estatuto', '18', 'Advogado empregado (arts. 18 a 21)'), L('estatuto', '22', 'Honorários (arts. 22 a 26)')],
      pontos: ['Empregado: leia os arts. 18 a 21 para jornada (8h/40h, redação de 2022), adicional de hora extra (no mínimo 100%) e adicional noturno (25%).', 'Honorários: contratados, arbitrados e de sucumbência. Confira os percentuais e quem tem direito no art. 22 e seguintes.', 'Prescrição da cobrança de honorários: leia o art. 25.', 'A Lei 14.365/2022 alterou pontos do Estatuto. Confira sempre a versão atual no Vade Mecum.'],
      peg: ['Misturar honorários de sucumbência com contratuais.', 'Prazo prescricional: ler o termo inicial.'],
      auto: ['Quais são as três espécies de honorários?', 'Qual o prazo de prescrição da cobrança?', 'Qual a jornada máxima do advogado empregado em empresa (art. 20)?']
    },
    'etica:3': {
      aulas: [Y('47 · Incompatibilidade e Impedimento', '22GHtekIucg')],
      leis: [L('estatuto', '27', 'Incompatibilidades e impedimentos (arts. 27 a 30)')],
      pontos: ['Incompatibilidade proíbe totalmente o exercício da advocacia. Impedimento proíbe apenas parcialmente.', 'O art. 28 lista as incompatibilidades. O art. 30 lista os impedidos.', 'Memorize por categoria: Judiciário, MP, chefes do Executivo, forças de segurança, atividades de fiscalização tributária etc. Leia o rol completo.'],
      peg: ['Chamar de incompatibilidade o que é impedimento.', 'Esquecer o parágrafo único do art. 30 sobre docentes dos cursos jurídicos.'],
      auto: ['Qual a diferença entre incompatibilidade e impedimento?', 'Cite um cargo incompatível.', 'Qual o efeito do impedimento?']
    },
    'etica:4': {
      aulas: [Y('47 · Espécies de Advogados e Honorários', 'jstI8K3rnhc')],
      leis: [L('estatuto', '15', 'Sociedades de advogados (arts. 15 a 17-B)')],
      pontos: ['Sociedade simples de prestação de serviços, registro no Conselho Seccional, vedações de forma empresarial.', 'Responsabilidade subsidiária e ilimitada do sócio por danos causados a clientes (art. 17). Leia a redação atual.', 'Advocacia pública: leia no CED o art. 8º e no Estatuto as regras de impedimento.'],
      peg: ['Registrar sociedade na Junta Comercial.', 'Achar que a responsabilidade é só da sociedade.'],
      auto: ['Onde se registra a sociedade de advogados?', 'Como é a responsabilidade do sócio?']
    },
    'etica:5': {
      aulas: [Y('Raio-X da Ética', 'qEPo_eFzbNM')],
      leis: [L('regulamento', null, 'Regulamento Geral (leia por títulos, com atenção às notas de rodapé no meio do texto)')],
      pontos: ['O Regulamento Geral detalha o Estatuto: inscrição, atividades, conselhos, processo. Estude por títulos e não decore tudo.', 'Atenção: o texto vem de PDF e pode ter notas de rodapé misturadas. Confira na fonte quando houver dúvida.'],
      peg: ['Estudar o Regulamento antes do Estatuto. Faça o Estatuto primeiro.'],
      auto: ['Qual a relação entre Estatuto e Regulamento Geral?']
    },
    'etica:6': {
      aulas: [Y('46 · Código de Ética: resumão', 'hAD0-fAFY8s'), Y('47 · Publicidade', 'TGpUCXHveNE'), Y('Super Ética', '-LvBg2heTLI')],
      leis: [L('ced', '35', 'Sigilo (arts. 35 a 38)'), L('ced', '39', 'Publicidade (arts. 39 a 47-A)'), L('ced', '48', 'Honorários (arts. 48 a 54)'), L('ced', '9', 'Relações com o cliente (arts. 9º a 26)')],
      pontos: ['Sigilo (art. 36): é de ordem pública, independe de pedido do cliente. Cede só por justa causa: grave ameaça à vida ou à honra e defesa própria (art. 37). Advogado não é obrigado a depor sobre fatos sigilosos (art. 38).', 'Publicidade (art. 39): informativa, discreta e sóbria, sem captação de clientela nem mercantilização. O art. 40 lista os meios vedados, como rádio, cinema, TV e outdoors.', 'Honorários: cláusula quota litis em dinheiro (art. 50). Não se saca duplicata e fatura não vai a protesto (art. 52). Cartão de crédito é permitido (art. 53). Para cobrar honorários o advogado renuncia antes ao mandato (art. 54).', 'Cliente: não aceitar procuração de quem já tem patrono sem avisá-lo, salvo urgência (art. 14). Renúncia sem mencionar o motivo (art. 16). Defesa criminal sem juízo sobre a culpa (art. 23).'],
      peg: ['Achar que o sigilo cede por vontade do advogado. Só em justa causa.', 'Confundir o que a publicidade permite (informar) com o que vira captação.', 'Misturar quota litis (em pecúnia) com participação em bens (excepcional).'],
      auto: ['Quando o sigilo cede?', 'O que o art. 40 veda na publicidade?', 'O advogado pode sacar duplicata de honorários?']
    },
    'etica:7': {
      aulas: [Y('47 · Penalidades', '8T5goU-gvxs'), Y('47 · Processo Administrativo e Eleitoral', 'bizQQtCb3as')],
      leis: [L('estatuto', '34', 'Infrações (art. 34)'), L('estatuto', '35', 'Sanções (arts. 35 a 43)'), L('estatuto', '68', 'Processo disciplinar (arts. 68 a 77)'), L('ced', '55', 'Processo no Código de Ética (arts. 55 a 69)')],
      pontos: ['O art. 34 lista as infrações disciplinares em incisos. Leia todos e agrupe por tema: captação, sigilo, abandono, locupletamento.', 'Sanções: censura, suspensão, exclusão e multa. Cada infração aponta qual sanção (arts. 35 a 40).', 'Prescrição da pretensão disciplinar em 5 anos, com causas de interrupção (art. 43).', 'Defesa prévia no processo disciplinar: 15 dias (CED art. 59). TAC cabe para infração punível com censura, sem repercussão negativa (CED art. 58-A).', 'Denúncia anônima não é fonte idônea (CED art. 55, § 2º).'],
      peg: ['Errar as hipóteses de exclusão. Leia o art. 38 inteiro.', 'Prazo de 15 dias confundido com outro prazo.'],
      auto: ['Quais são as sanções disciplinares?', 'Qual o prazo de prescrição?', 'Quando cabe o termo de ajustamento de conduta?']
    },
    'etica:8': {
      aulas: [Y('47 · Órgãos da OAB', 'XapMwATamAQ'), Y('47 · Processo Administrativo e Eleitoral', 'bizQQtCb3as')],
      leis: [L('estatuto', '44', 'Finalidades e órgãos (arts. 44 a 67)')],
      pontos: ['Órgãos: Conselho Federal, Conselhos Seccionais, Subseções e Caixas de Assistência. Leia a competência de cada um.', 'Eleições: segunda quinzena de novembro, mandato de 3 anos (art. 63). Leia o texto.', 'A OAB é serviço público, com personalidade jurídica e forma federativa, sem vínculo funcional ou hierárquico com a Administração. Confira o art. 44 e o § 1º.'],
      peg: ['Achar que a OAB é autarquia comum. O Estatuto diz que não.', 'Trocar competências do Conselho Federal e do Seccional.'],
      auto: ['Quais são os órgãos da OAB?', 'Qual a duração do mandato e quando é a eleição?']
    }
  }
};

// Frase de foco de cada livro (introdução da matéria). Sem número de artigo nem promessa de peso: o peso real aparece no banco de questões.
window.C48_FOCO = {
  etica: 'Ética é a matéria em que o texto da lei vale mais que qualquer interpretação. Aqui o ganho vem de ler o Estatuto, o Regulamento Geral e o Código de Ética com atenção a prazos, quóruns e listas.',
  const: 'Constitucional mistura texto da Constituição com jurisprudência do STF. Comece pelos direitos fundamentais e pela organização do Estado, e estude sempre com o artigo ao lado.',
  dh: 'Direitos Humanos cobra tratados, sistemas de proteção e a relação deles com o direito brasileiro. É uma matéria curta e muito cobrada por nomes e órgãos.',
  civil: 'Civil é a maior matéria em volume. A estratégia é dominar a parte geral, obrigações e contratos, e revisar o resto com questões.',
  pcivil: 'Processo Civil gira em torno do CPC. Prazos, competência e recursos são o centro. Treine questões logo depois de ler cada bloco.',
  penal: 'Penal combina teoria do crime com crimes em espécie. Entenda a estrutura do crime e depois memorize tipos e penas lendo o Código Penal.',
  ppenal: 'Processo Penal exige entender o caminho do processo: inquérito, ação, provas, prisões e recursos. Prisões e provas costumam render questões.',
  adm: 'Administrativo cobra princípios, atos, licitações e responsabilidade do Estado. A lei e a jurisprudência convivem, então estude por tema e revise com questões.',
  trib: 'Tributário gira em torno da Constituição e do CTN. Competência, princípios e imunidades abrem o caminho para o resto.',
  trab: 'Trabalho é CLT e súmulas. Entenda relação de emprego, jornada e verbas rescisórias antes de partir para o direito coletivo.',
  ptrab: 'Processo do Trabalho aproveita a lógica do processo civil com regras próprias de prazo, recurso e execução.',
  emp: 'Empresarial cobra teoria da empresa, sociedades, títulos de crédito e falência. Sua aula de Societário e Falência ajuda aqui.',
  cons: 'Consumidor é matéria curta, baseada no CDC. Leia a lei inteira uma vez e treine questões.',
  eca: 'ECA é lei curta e muito literal. A leitura da lei seca resolve boa parte das questões.',
  fil: 'Filosofia do Direito pede reconhecer correntes e autores. É menos sobre decorar artigo e mais sobre associar ideia e nome.',
  amb: 'Ambiental cobra princípios, competência e licenciamento. Poucas unidades, bom custo-benefício.',
  int: 'Internacional cobra fontes, sujeitos, nacionalidade e cooperação. Estude por conceitos e revise com questões.',
  prev: 'Previdenciário trabalha com segurados, dependentes e benefícios. Sua aula atual ajuda e a tabela de benefícios organiza o estudo.',
  elei: 'Eleitoral cobra direitos políticos, elegibilidade e processo eleitoral. Estude em bloco curto e revise.',
  fin: 'Financeiro cobra orçamento e responsabilidade fiscal. É a matéria menor do edital: faça a leitura da lei e as questões.'
};

/* Videoaulas e leis por módulo (capítulo). Os vídeos vieram de pesquisa no YouTube pelo título e pelo assunto; o Petrus NÃO os assistiu.
   Confira se ainda estão no ar e se estão atualizados (vale a lei vigente em 21/09/2026). Se contradisserem a aula do caderno, vale a lei.
   b = buscas prontas no YouTube. Chave = matéria:índice do capítulo. */
const V = (t, y, n) => Y(t, y, n || 'aula gratuita; confira se está atualizada');
window.C48_ESTUDO.mod = {
  'etica:0': { v: [V('Ética para a OAB: tudo em uma aula (versão 2024)', '-Hvh4ycobzE'), V('Assuntos imprescindíveis de Ética para a 1ª fase', 'XN6GHommKtk'), V('Sistema OAB: Conselho Federal, Seccionais, Subseções e Caixas', 'U2j1iYD4LWg'), V('Raio-X da Ética (47º Exame)', 'qEPo_eFzbNM')], b: ['Ética OAB 1ª fase o que mais cai', 'Estatuto da Advocacia Regulamento Geral Código de Ética diferença'], leis: [L('estatuto', null, 'Estatuto da OAB'), L('regulamento', null, 'Regulamento Geral'), L('ced', null, 'Código de Ética')] },
  'etica:1': { v: [V('47º · Advogados e Estagiários', 'HMhy0I4EhpE'), V('Lei 8.906: arts. 8 a 17', 'AQO1P7GP1rg')], b: ['inscrição na OAB requisitos art. 8 Estatuto aula', 'estágio advocacia Regulamento Geral aula OAB'], leis: [L('estatuto', '8', 'Art. 8º: requisitos'), L('estatuto', '9', 'Art. 9º: estágio'), L('estatuto', '10', 'Art. 10: inscrição'), L('regulamento', '27', 'Regulamento Geral: estágio')] },
  'etica:2': { v: [V('Estatuto da OAB: arts. 1º ao 21 (atualizado 2024)', 'PkjYpX4IuoY'), V('Estatuto da OAB em áudio: arts. 1º a 33', 'hmZlKwti7PM', 'áudio, para ouvir')], b: ['atividades privativas da advocacia art. 1 Estatuto aula', 'mandato procuração art. 5 Estatuto OAB aula'], leis: [L('estatuto', '1', 'Art. 1º: privativas'), L('estatuto', '4', 'Art. 4º: nulidade'), L('estatuto', '5', 'Art. 5º: mandato')] },
  'etica:3': { v: [V('Dos Honorários Advocatícios (39º Exame)', '5o7M-t0CO5E'), V('Estatuto e Ética: honorários advocatícios', 'VSFCbfoc2Ak'), V('Honorários: 8 dias com Ética e Estatuto (38º Exame)', 'oC37OzdI-ts'), V('Tudo sobre honorários sucumbenciais', 'jd5CsyOMcRU')], b: ['honorários advocatícios OAB Estatuto aula', 'advogado empregado art. 18 Estatuto OAB aula'], leis: [L('estatuto', '22', 'Art. 22: honorários'), L('estatuto', '24', 'Art. 24'), L('estatuto', '18', 'Art. 18: advogado empregado'), L('ced', '48', 'Código de Ética: honorários')] },
  'etica:4': { v: [V('Aulão de Ética: direitos (prerrogativas) do advogado', 'KprM2nzEEGc'), V('Prerrogativas, art. 7º, I (aula 1)', 'T4YgtgR37fY'), V('Prerrogativas, art. 7º, IV (aula 4)', 'DwCrM42mVO0'), V('Art. 7º, incisos VI a VIII', 'BKLfUU8eTP0'), V('Art. 7º, incisos XI a XVI', '3_MzbK9NEGc'), V('Inviolabilidade da advocacia, art. 7º', 'jih-IiL2yow'), V('Art. 7º, § 2º-B (Lei 14.365/22)', 'GYPoAzQQqzA'), { t: 'Curso Estatuto da OAB (playlist)', p: 'PLdarqF3CDzWFsop--KXvtoJag0Z9O1mq7', n: 'playlist; confira se está atualizada' }], b: ['prerrogativas do advogado art. 7 Estatuto OAB aula', 'art. 7-A advogada gestante lactante prerrogativas OAB'], leis: [L('estatuto', '7', 'Art. 7º: direitos'), L('estatuto', '7-A', 'Art. 7º-A: advogada'), L('estatuto', '7-B', 'Art. 7º-B: crime'), L('estatuto', '13', 'Art. 13: identidade')] },
  'etica:5': { v: [V('Incompatibilidades e impedimentos I', 'VN-6aBOUXtE'), V('Incompatibilidade x impedimento: a diferença', '-fUB6DIWHyw'), V('Incompatibilidades e impedimentos', 'GZ6vbNvIVmM'), V('Incompatibilidades e impedimentos (outra aula)', 'O7183P-fepY')], b: ['incompatibilidades e impedimentos advocacia art. 28 30 Estatuto aula'], leis: [L('estatuto', '27', 'Art. 27'), L('estatuto', '28', 'Art. 28: incompatibilidades'), L('estatuto', '29', 'Art. 29'), L('estatuto', '30', 'Art. 30: impedimentos')] },
  'etica:6': { v: [V('Sociedade de advogados, art. 15 (aula 39)', '-bSMQIxRj3E'), V('Tudo sobre sociedade de advogados em 6 minutos', 'GaFyqDPNAYc'), V('Sociedade unipessoal de advocacia', 'd0wGrBRfZ2c')], b: ['sociedade de advogados art. 15 16 17 Estatuto aula', 'advogado associado art. 17-A 17-B Estatuto aula'], leis: [L('estatuto', '15', 'Art. 15'), L('estatuto', '16', 'Art. 16'), L('estatuto', '17', 'Art. 17: responsabilidade'), L('estatuto', '17-B', 'Art. 17-B: associação')] },
  'etica:7': { v: [V('Código de Ética: resumão (46º Exame)', 'hAD0-fAFY8s'), V('Publicidade, Código de Ética e Disciplina', 'z_cipJfcccE'), V('Sigilo profissional', 'lPdcyscjFEk'), V('Ética, processo disciplinar e sigilo', 'Min2ti0qC9Q'), V('Código de Ética e Estatuto em resumo', 'siTFWHnm6Ww')], b: ['publicidade advocacia Código de Ética art. 40 aula OAB', 'sigilo profissional advogado OAB aula'], leis: [L('ced', '2', 'CED art. 2º: deveres'), L('ced', '35', 'CED art. 35: sigilo'), L('ced', '39', 'CED art. 39: publicidade'), L('ced', '40', 'CED art. 40: vedações')] },
  'etica:8': { v: [V('Estatuto e Ética: infrações e sanções', 'QU4wr-QHXWc'), V('Infrações e sanções disciplinares (Prova da Ordem)', 'vMgIGaE6MrA'), V('Como acertar as questões de infrações e sanções', 'nBklPSGxoDY'), V('Revise infrações e sanções para a 1ª fase', '0ZuuQ_iZDRo'), V('Sanções disciplinares (Savio Chalita)', 'JghxannKsis'), V('Processo disciplinar completo', 'N5qmjNaTuNQ')], b: ['infrações e sanções disciplinares OAB art. 34 aula', 'processo disciplinar OAB Tribunal de Ética aula'], leis: [L('estatuto', '34', 'Art. 34: infrações'), L('estatuto', '35', 'Art. 35: sanções'), L('estatuto', '70', 'Art. 70: processo'), L('ced', '58-A', 'CED art. 58-A: TAC')] },
  'etica:9': { v: [V('Eleições e órgãos da OAB: Conselho Federal', 'A0ssmgE91Q8'), V('OAB Express: órgãos da OAB', 'vTmzCvd4vKU'), V('Sistema OAB', 'U2j1iYD4LWg')], b: ['órgãos da OAB Conselho Federal Seccional Subseção Caixa aula', 'eleições OAB mandato requisitos candidato art. 63 aula'], leis: [L('estatuto', '44', 'Art. 44'), L('estatuto', '54', 'Art. 54: Conselho Federal'), L('estatuto', '58', 'Art. 58: Seccional'), L('estatuto', '63', 'Art. 63: eleições')] },
  'etica:10': { v: [], b: ['Regulamento Geral da OAB 1ª fase aula', 'desagravo público advogado Regulamento Geral aula'], leis: [L('regulamento', null, 'Regulamento Geral'), L('regulamento', '18', 'RG art. 18: desagravo'), L('regulamento', '19', 'RG art. 19')] },
  'etica:11': { v: [V('CEISC: Ética, temas quentes', 'rpE1EaLaYZ8'), V('Raio-X da Ética (47º Exame)', 'qEPo_eFzbNM'), V('Ética para a OAB: tudo em uma aula (versão 2024)', '-Hvh4ycobzE')], b: ['Ética OAB revisão 1ª fase questões comentadas'], leis: [L('estatuto', null, 'Estatuto da OAB'), L('ced', null, 'Código de Ética')] },
  'penal:0': { v: [], b: ['Direito Penal OAB 1ª fase o que mais cai', 'Direito Penal OAB como estudar'], leis: [L('cp', null, 'Código Penal')] },
  'penal:1': { v: [V('Desistência voluntária, arrependimento eficaz e posterior', 'EwsD3UiZTyM'), V('Desistência voluntária e arrependimento eficaz', 'vRg-AYD1Dkw'), V('Desistência voluntária', 'q3GPGuEy4tA'), V('Iter criminis: tentativa perfeita e imperfeita', 'l0rLCP7vHSQ')], b: ['tentativa crime impossível arrependimento posterior art. 14 15 16 17 aula OAB'], leis: [L('cp', '14', 'Art. 14: tentativa'), L('cp', '15', 'Art. 15: desistência'), L('cp', '16', 'Art. 16: arrependimento posterior'), L('cp', '17', 'Art. 17: crime impossível')] },
  'penal:2': { v: [V('Lei penal no espaço: territorialidade e extraterritorialidade (aula 7)', 't_g2KtN3164'), V('Extraterritorialidade (Maximizando, aula 4)', 'F81eOqV_Nfo'), V('Lei penal no espaço', 'YZrTT4rCEpw'), V('Aplicação da lei penal no tempo e no espaço (aula 1)', 'wDWH2gcw9Kc'), V('Retroatividade e irretroatividade', '3ptW1qci9do'), V('Lei penal no espaço: mapa mental', '0yk7YlUtBjg')], b: ['lei penal no tempo abolitio criminis novatio legis aula OAB'], leis: [L('cp', '2', 'Art. 2º: lei no tempo'), L('cp', '5', 'Art. 5º: territorialidade'), L('cp', '6', 'Art. 6º: lugar do crime'), L('cp', '7', 'Art. 7º: extraterritorialidade')] },
  'penal:3': { v: [V('Coação irresistível e obediência hierárquica, art. 22', 'hoGKLFoqTNo'), V('Erro de tipo: tese que cai na OAB', 'gKeaPlpkgHI'), V('Erro de proibição direto e indireto', 'WpB7gXlS0fQ'), V('Erro de tipo ou erro de proibição?', '3tXUUg5dXRU'), V('Erro de tipo, erro de proibição e descriminantes putativas', 'XuQd60ooI0c'), V('Erro de tipo x erro de proibição', '5BFIcSsW7RQ')], b: ['estado de necessidade legítima defesa exclusão de ilicitude aula OAB'], leis: [L('cp', '20', 'Art. 20: erro de tipo'), L('cp', '21', 'Art. 21: erro de proibição'), L('cp', '22', 'Art. 22: coação e obediência'), L('cp', '24', 'Art. 24'), L('cp', '25', 'Art. 25')] },
  'penal:4': { v: [V('Penas restritivas de direito: conversão e reconversão', '05gIeq6xAP8'), V('Penas restritivas: substituição por uma ou duas', 'INF7I70asEA'), V('Substituição da pena privativa de liberdade (fixação de pena, aula 9)', 'rEB1HjXl6Xg'), V('Art. 44 do CP comentado', 'kmQ2R5wULY8'), V('Penas restritivas de direitos: arts. 43 a 52', '6aHSNz88bKk')], b: ['regime inicial de cumprimento de pena art. 33 CP aula OAB', 'medida de segurança remição de pena aula OAB'], leis: [L('cp', '33', 'Art. 33: regimes'), L('cp', '44', 'Art. 44: substituição'), L('cp', '59', 'Art. 59: pena-base'), L('l7210', '126', 'LEP art. 126: remição')] },
  'penal:5': { v: [], b: ['nexo causal concausas superveniência art. 13 CP aula OAB', 'dolo eventual culpa preterdolo aula OAB'], leis: [L('cp', '13', 'Art. 13: nexo causal'), L('cp', '18', 'Art. 18: dolo e culpa')] },
  'penal:6': { v: [V('Concurso de pessoas: requisitos, consequências e comunicabilidade', 'Y0Xhw3gzkXs'), V('Concurso de pessoas I: autoria e participação', 'xOCAlzRoF-M'), V('Concurso de pessoas: autoria', 'wvLjk0DOUXQ'), V('Concurso de pessoas (coautoria e participação)', 'dfGcMbSzUzk')], b: ['concurso de pessoas art. 29 30 31 CP aula OAB'], leis: [L('cp', '29', 'Art. 29'), L('cp', '30', 'Art. 30: incomunicabilidade'), L('cp', '31', 'Art. 31')] },
  'penal:7': { v: [V('Crimes contra a dignidade sexual: leitura dos arts. 213 a 234-C', 'UHAgbC64lQA'), V('Descumprimento de medida protetiva: o único crime da Lei Maria da Penha', 'XGJ3pTndaIE'), V('Descumprimento das medidas protetivas de urgência', 'Pg5pj26ivjI'), V('Lei Maria da Penha descomplicada: medidas protetivas em prova', 'WPrv8RB7ut8')], b: ['importunação sexual art. 215-A estupro aula OAB', 'perseguição stalking art. 147-A aula OAB'], leis: [L('cp', '213', 'Art. 213: estupro'), L('cp', '215-A', 'Art. 215-A: importunação'), L('cp', '147-A', 'Art. 147-A: perseguição')] },
  'penal:8': { v: [V('Escusa absolutória nos crimes patrimoniais', 'Lvmla9Klqwc'), V('Roubo com restrição da liberdade x sequestro relâmpago', '-nvW_q6AZBw'), V('Escusas absolutórias, relativas e inaplicáveis (arts. 181 a 183)', 'c27qWQ2zJtU'), V('Sequestro relâmpago e tipos penais assemelhados', 'LiO1NfAwN3o'), V('Roubo, extorsão e extorsão mediante sequestro', 'a5iwxQxfGYM'), V('Furto simples: aula completa e atualizada', 'ZWbLWf2Z2qA')], b: ['corrupção ativa passiva crime formal aula OAB', 'receptação apropriação indébita aula OAB'], leis: [L('cp', '155', 'Art. 155: furto'), L('cp', '157', 'Art. 157: roubo'), L('cp', '158', 'Art. 158: extorsão'), L('cp', '181', 'Art. 181: escusas')] },
  'penal:9': { v: [V('Calúnia, difamação e injúria (Prof. Túlio Vianna, UFMG)', 'hS9hsVQ-1nY'), V('Retratação na calúnia e difamação: só o perdão basta?', 'AGDkxLkYS6k'), V('Crimes contra a honra: calúnia, difamação e injúria', 'Bpk-pYz7tcc'), V('Crimes contra a honra: revisão completa e questões', 'YWXlcNzWdts')], b: ['crimes contra a honra ação penal perdão retratação aula OAB'], leis: [L('cp', '138', 'Art. 138: calúnia'), L('cp', '139', 'Art. 139: difamação'), L('cp', '140', 'Art. 140: injúria'), L('cp', '145', 'Art. 145: ação penal')] },
  'penal:10': { v: [], b: ['tráfico de drogas art. 33 Lei 11.343 aula OAB', 'Lei 9.099 Juizados Especiais Criminais suspensão condicional do processo aula OAB'], leis: [L('l11343', '33', 'Lei 11.343, art. 33'), L('l9099', '89', 'Lei 9.099, art. 89')] },
  'penal:11': { v: [], b: ['prescrição penal art. 109 110 115 117 aula OAB', 'extinção da punibilidade art. 107 aula OAB'], leis: [L('cp', '107', 'Art. 107'), L('cp', '109', 'Art. 109'), L('cp', '115', 'Art. 115'), L('cp', '117', 'Art. 117')] },
  'penal:12': { v: [], b: ['Direito Penal OAB revisão 1ª fase questões comentadas'], leis: [L('cp', null, 'Código Penal')] },
  'civil:0': { v: [], b: ['Direito Civil OAB 1ª fase o que mais cai', 'Direito Civil OAB como estudar'], leis: [L('cc', null, 'Código Civil')] },
  'civil:1': { v: [], b: ['filiação presunção de paternidade art. 1597 aula OAB', 'multiparentalidade socioafetividade aula OAB', 'poder familiar guarda compartilhada adoção ECA aula OAB'], leis: [L('cc', '1.596', 'Art. 1.596: igualdade dos filhos'), L('cc', '1.597', 'Art. 1.597: presunção'), L('cc', '1.601', 'Art. 1.601: contestação'), L('cc', '1.634', 'Art. 1.634: poder familiar'), L('eca', '41', 'ECA art. 41: adoção')] },
  'civil:2': { v: [], b: ['estado de perigo lesão defeitos do negócio jurídico aula OAB', 'nulidade anulabilidade simulação conversão aula OAB', 'prescrição e decadência Código Civil aula OAB'], leis: [L('cc', '108', 'Art. 108: escritura pública'), L('cc', '121', 'Art. 121: condição'), L('cc', '156', 'Art. 156: estado de perigo'), L('cc', '166', 'Art. 166: nulidade'), L('cc', '167', 'Art. 167: simulação'), L('cc', '178', 'Art. 178: decadência'), L('cc', '206', 'Art. 206: prescrição')] },
  'civil:3': { v: [], b: ['ordem de vocação hereditária art. 1829 aula OAB', 'colação doação inoficiosa indignidade aula OAB', 'substituição testamentária direito de acrescer aula OAB'], leis: [L('cc', '1.829', 'Art. 1.829: ordem'), L('cc', '1.837', 'Art. 1.837: cônjuge e ascendentes'), L('cc', '1.813', 'Art. 1.813: renúncia e credores'), L('cc', '1.815', 'Art. 1.815: indignidade'), L('cc', '1.947', 'Art. 1.947: substituição'), L('cc', '2.005', 'Art. 2.005: dispensa de colação')] },
  'civil:4': { v: [], b: ['obrigações solidárias e indivisíveis aula OAB', 'cessão de crédito cláusula penal vício redibitório aula OAB'], leis: [L('cc', '259', 'Art. 259: indivisível'), L('cc', '276', 'Art. 276: morte de devedor solidário'), L('cc', '290', 'Art. 290: cessão'), L('cc', '416', 'Art. 416: cláusula penal'), L('cc', '443', 'Art. 443: vício redibitório')] },
  'civil:5': { v: [], b: ['regime de bens casamento comunhão parcial separação obrigatória aula OAB', 'alimentos avós art. 1696 1698 aula OAB', 'tutela nomeação art. 1729 1731 aula OAB'], leis: [L('cf', '226', 'CF art. 226'), L('cc', '1.641', 'Art. 1.641: separação obrigatória'), L('cc', '1.660', 'Art. 1.660: comunhão parcial'), L('cc', '1.696', 'Art. 1.696: alimentos'), L('cc', '1.729', 'Art. 1.729: tutor nomeado'), L('cc', '1.731', 'Art. 1.731: ordem da tutela')] },
  'civil:6': { v: [], b: ['fiança benefício de ordem art. 827 828 aula OAB', 'locação Lei 8.245 prorrogação denúncia vazia aula OAB', 'mandato extinção art. 682 aula OAB', 'preempção direito de preferência art. 513 aula OAB'], leis: [L('cc', '828', 'Art. 828: fiança'), L('cc', '518', 'Art. 518: preempção'), L('cc', '682', 'Art. 682: fim do mandato'), L('l8245', '46', 'Lei 8.245, art. 46')] },
  'civil:7': { v: [], b: ['responsabilidade civil objetiva art. 932 933 938 aula OAB', 'abuso de direito art. 187 aula OAB'], leis: [L('cc', '186', 'Art. 186'), L('cc', '187', 'Art. 187: abuso de direito'), L('cc', '927', 'Art. 927'), L('cc', '932', 'Art. 932'), L('cc', '938', 'Art. 938')] },
  'civil:8': { v: [], b: ['LGPD Lei 13.709 OAB 1ª fase aula', 'LGPD bases legais dados sensíveis aula OAB'], leis: [] },
  'civil:9': { v: [], b: ['capacidade civil art. 3 4 5 emancipação aula OAB', 'direitos da personalidade imagem art. 20 aula OAB', 'benfeitorias art. 96 bem de família aula OAB'], leis: [L('cc', '5º', 'Art. 5º: emancipação'), L('cc', '20', 'Art. 20: imagem'), L('cc', '96', 'Art. 96: benfeitorias'), L('cpc', '833', 'CPC art. 833: impenhoráveis')] },
  'civil:10': { v: [], b: ['direito de superfície servidão usufruto aula OAB', 'direito real de laje arts. 1510-A aula OAB'], leis: [L('cc', '1.225', 'Art. 1.225: direitos reais'), L('cc', '1.373', 'Art. 1.373: superfície'), L('cc', '1.379', 'Art. 1.379: servidão'), L('cc', '1.410', 'Art. 1.410: usufruto'), L('cc', '1.510-A', 'Art. 1.510-A: laje')] },
  'civil:11': { v: [], b: ['usucapião art. 1238 1240 aula OAB', 'direito de vizinhança janelas art. 1301 1302 aula OAB', 'desapropriação judicial art. 1228 § 4º aula OAB'], leis: [L('cc', '1.228', 'Art. 1.228'), L('cc', '1.240', 'Art. 1.240: usucapião urbana'), L('cc', '1.301', 'Art. 1.301: janelas'), L('cc', '1.302', 'Art. 1.302: ano e dia')] },
  'civil:12': { v: [], b: ['Direito Civil OAB revisão 1ª fase questões comentadas'], leis: [L('cc', null, 'Código Civil')] }
};
