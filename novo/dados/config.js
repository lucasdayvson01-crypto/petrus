// Datas, fases e prazos do 48º Exame de Ordem.
// Fonte do exame: edital de abertura de 21/09/2026 (resumo em E-OAB/README.md). Confira sempre no edital.
window.C48_CFG = {
  prova: '2027-01-10T13:00:00',
  inscricaoFim: '2026-10-05T17:00:00',
  segundaFase: '2027-02-28T13:00:00',
  minimoDiaMin: 120,                 // meta mínima de estudo por dia, em minutos (no "dia leve" vale 30)
  // Ficha de estudo ABCD (como a ficha de treino): os dias giram A, B, C, D. Ética aparece em dois treinos por ser a mais fraca e obrigatória.
  fichas: [
    { id: 'A', nome: 'Treino A', foco: 'Ética e Administrativo',                     mats: ['etica', 'adm'] },
    { id: 'B', nome: 'Treino B', foco: 'Trabalho e Processo do Trabalho',            mats: ['trab', 'ptrab'] },
    { id: 'C', nome: 'Treino C', foco: 'Ética e Processo Penal',                     mats: ['etica', 'ppenal'] },
    { id: 'D', nome: 'Treino D', foco: 'Matérias leves: Previdenciário, Ambiental, Internacional, Eleitoral e Financeiro', mats: ['prev', 'amb', 'int', 'elei', 'fin'] }
  ],
  revisoes: [1, 2, 7, 14, 30],       // D1, D2, D7, D14, D30 (convenção de cursinho)

  // mult = fração do tempo de estudo disponível; novo = fração desse tempo para conteúdo novo
  fases: [
    { id: '0',  nome: 'Arranque leve',          ini: '2026-10-03', fim: '2026-10-20', mult: 1,   novo: 0.5,
      foco: 'Ética (lei seca) e montar o caderno. O TCC manda até 20/10: se apertar, as 2h viram revisões e Ética.' },
    { id: 'A',  nome: 'Base e lei seca',        ini: '2026-10-21', fim: '2026-11-25', mult: 1,   novo: 0.6,
      foco: 'Conteúdo novo em ciclos, 10 questões por dia, primeiro simulado.' },
    { id: 'P2', nome: 'Semana de P2 (leve)',    ini: '2026-11-26', fim: '2026-12-02', mult: 1,   novo: 0,
      foco: 'Só revisões D1/D2/D7 e 10 questões. Sem conteúdo novo.' },
    { id: 'A2', nome: 'Base e questões',        ini: '2026-12-03', fim: '2026-12-09', mult: 1,   novo: 0.6,
      foco: 'Recuperar o atraso da P2.' },
    { id: 'P3', nome: 'Semana de P3 (leve)',    ini: '2026-12-10', fim: '2026-12-16', mult: 1,   novo: 0,
      foco: 'Só revisões e 10 questões. Sem conteúdo novo.' },
    { id: 'B',  nome: 'Questões e revisão',     ini: '2026-12-17', fim: '2027-01-03', mult: 1,   novo: 0.3,
      foco: 'Baterias diárias, simulados, caderno de erros, fechar lacunas.' },
    { id: 'C',  nome: 'Reta final',             ini: '2027-01-04', fim: '2027-01-09', mult: 1,   novo: 0,
      foco: 'Sem conteúdo novo. Resumos de uma página, lista de pegadinhas, sono e logística.' }
  ],

  // Prazos fixos. fonte: edital | faculdade | pessoal
  prazos: [
    { d: '2026-10-05', h: '17h', t: 'Fim das inscrições do 48º Exame (oab.fgv.br)', tag: 'OAB',       fonte: 'edital' },
    { d: '2026-10-20', h: '',    t: 'Entrega do TCC',                               tag: 'FACULDADE', fonte: 'faculdade' },
    { d: '2026-11-16', h: '',    t: 'Seminário',                                    tag: 'FACULDADE', fonte: 'faculdade' },
    { d: '2026-11-26', h: '',    t: 'Início da semana de P2 (até 02/12)',           tag: 'FACULDADE', fonte: 'faculdade' },
    { d: '2026-12-04', h: '17h', t: 'Último dia para reimprimir e pagar o boleto',  tag: 'OAB',       fonte: 'edital' },
    { d: '2026-12-04', h: '',    t: 'Limite para requerer as horas PAC (200h)',     tag: 'FACULDADE', fonte: 'faculdade' },
    { d: '2026-12-10', h: '',    t: 'Início da semana de P3 (até 16/12)',           tag: 'FACULDADE', fonte: 'faculdade' },
    { d: '2026-11-15', h: '',    t: 'Compromisso de família (avô): mini-simulado fica para o fim do dia ou vira revisão', tag: 'PESSOAL', fonte: 'pessoal' },
    { d: '2026-11-25', h: '',    t: 'Seu aniversário (véspera da semana de P2): dia leve',        tag: 'PESSOAL',   fonte: 'pessoal' },
    { d: '2026-12-18', h: '',    t: 'Compromisso de família (tio): dia leve',                     tag: 'PESSOAL',   fonte: 'pessoal' },
    { d: '2026-12-22', h: '',    t: 'Fim do semestre letivo',                       tag: 'FACULDADE', fonte: 'faculdade' },
    { d: '2026-12-24', h: '',    t: 'Natal (24 e 25/12): estudo reduzido, só revisões',           tag: 'PESSOAL',   fonte: 'pessoal' },
    { d: '2026-12-28', h: '',    t: 'Compromisso de família (tia): dia leve',                     tag: 'PESSOAL',   fonte: 'pessoal' },
    { d: '2026-12-31', h: '',    t: 'Réveillon (31/12 e 01/01): estudo reduzido, só revisões',    tag: 'PESSOAL',   fonte: 'pessoal' },
    { d: '2027-01-04', h: '',    t: 'Divulgação dos locais da prova objetiva',      tag: 'OAB',       fonte: 'edital' },
    { d: '2027-01-10', h: '13h', t: '1ª FASE: prova objetiva (13h às 18h). Portões fecham às 12h30', tag: 'OAB', fonte: 'edital' },
    { d: '2027-01-12', h: '',    t: 'Recurso contra o gabarito preliminar (12 a 14/01)', tag: 'OAB',  fonte: 'edital' },
    { d: '2027-01-27', h: '',    t: 'Gabarito definitivo e resultado preliminar',   tag: 'OAB',       fonte: 'edital' },
    { d: '2027-02-10', h: '',    t: 'Resultado final da 1ª fase',                   tag: 'OAB',       fonte: 'edital' },
    { d: '2027-02-28', h: '13h', t: '2ª FASE: prova prático-profissional (13h às 18h)', tag: 'OAB',  fonte: 'edital' }
  ],

  // O que preciso até a prova (marcável)
  checklist: [
    { id: 'ck1', d: '2026-10-05', t: 'Pagar o boleto da inscrição (só boleto; sem PIX, cartão ou agendamento)' },
    { id: 'ck2', d: '2026-10-12', t: 'Conferir no site da FGV se a inscrição aparece como confirmada (leva cerca de 5 dias úteis)' },
    { id: 'ck3', d: '2026-10-20', t: 'Entregar o TCC e voltar o foco para a OAB' },
    { id: 'ck4', d: '2026-10-25', t: 'Fazer o primeiro simulado com prova oficial baixada em oab.fgv.br' },
    { id: 'ck5', d: '2026-11-25', t: 'Terminar a leitura da lei seca de Ética (Estatuto, Regulamento Geral, Código de Ética)' },
    { id: 'ck6', d: '2026-12-04', t: 'Confirmar as 200h de PAC (limite da faculdade) e que o boleto está pago' },
    { id: 'ck7', d: '2027-01-03', t: 'Último simulado completo, com correção e caderno de erros em dia' },
    { id: 'ck8', d: '2027-01-04', t: 'Conferir o local da prova e planejar o trajeto' },
    { id: 'ck9', d: '2027-01-09', t: 'Separar: documento ORIGINAL com foto e caneta esferográfica transparente azul ou preta' },
    { id: 'ck10', d: '2027-01-10', t: 'Chegar com 1 hora de antecedência. Sem celular, relógio, boné, óculos escuros, lápis, borracha ou corretivo' }
  ]
};
