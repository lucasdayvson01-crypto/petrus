// Biblioteca: cada matéria é um livro; cada unidade é um tópico de estudo (cerca de 60 a 75 min).
// Os títulos são temas gerais. Nenhum número de artigo, súmula ou tema foi citado de propósito:
// o Lucas preenche com a lei seca na mão. Confira a lista e os pesos no edital.
// grupo: 'min15' = entra no mínimo de 15% do edital | 'principal' | 'leve'
// ciclo: ordem sugerida de estudo (0 = primeiro). Reordenado em 03/10/2026 pelo diagnóstico: Ética e matérias fracas primeiro, fortes por último (esboço até o Lucas aprovar).
window.C48_MAT = [
  { id: 'etica', nome: 'Ética e Estatuto da Advocacia', cor: '#2F8F6B', grupo: 'min15', ciclo: 0, unid: [
    'Introdução à Ética da OAB: o mapa da matéria', 'Ser advogado: inscrição, identidade e estágio', 'O que só o advogado faz: atividades privativas, mandato e consultoria', 'Honorários e advogado empregado',
    'Prerrogativas: os direitos do advogado', 'Incompatibilidades e impedimentos', 'Sociedade de advogados e advocacia pública',
    'Código de Ética: deveres, sigilo, publicidade e responsabilidade', 'Infrações, sanções e processo disciplinar', 'A OAB por dentro: órgãos, eleições e mandatos',
    'Regulamento Geral: o que ele acrescenta', 'Revisão e simulado de Ética' ] },
  { id: 'const', nome: 'Direito Constitucional', cor: '#F5C542', grupo: 'principal', ciclo: 4, unid: [
    'Teoria da Constituição e princípios fundamentais', 'Direitos e garantias fundamentais', 'Remédios constitucionais',
    'Nacionalidade e direitos políticos', 'Organização do Estado', 'Poder Legislativo e processo legislativo', 'Poder Executivo',
    'Poder Judiciário e funções essenciais à Justiça', 'Controle de constitucionalidade', 'Ordem econômica e social', 'Defesa do Estado e das instituições' ] },
  { id: 'dh', nome: 'Direitos Humanos', cor: '#9CC3E8', grupo: 'min15', ciclo: 6, unid: [
    'Teoria geral e dimensões dos direitos humanos', 'Sistema global (ONU)', 'Sistema interamericano',
    'Tratados e seu status no direito brasileiro', 'Grupos vulneráveis e temas especiais' ] },
  { id: 'civil', nome: 'Direito Civil', cor: '#A8D98B', grupo: 'principal', ciclo: 6, unid: [
    'Introdução e mapa de Direito Civil', 'Filiação, parentalidade e poder familiar', 'Negócio jurídico: condição, defeitos, invalidade e prescrição', 'Sucessões', 'Obrigações e contratos em geral',
    'Casamento, regime de bens, alimentos e tutela', 'Contratos em espécie', 'Responsabilidade civil', 'Proteção de dados pessoais (LGPD)', 'Pessoas, direitos da personalidade e bens',
    'Direitos reais sobre coisa alheia', 'Posse e propriedade', 'Revisão e simulado de Direito Civil' ] },
  { id: 'pcivil', nome: 'Processo Civil', cor: '#E9A6A0', grupo: 'principal', ciclo: 6, unid: [
    'Normas fundamentais, jurisdição e competência', 'Partes, procuradores e litisconsórcio', 'Atos processuais e prazos', 'Tutela provisória',
    'Procedimento comum: da petição inicial à sentença', 'Provas', 'Sentença e coisa julgada', 'Recursos', 'Cumprimento de sentença e execução', 'Procedimentos especiais' ] },
  { id: 'penal', nome: 'Direito Penal', cor: '#BBA8E8', grupo: 'principal', ciclo: 4, unid: [
    'Introdução e mapa de Direito Penal', 'Tentativa, desistência, arrependimento e crime impossível', 'Lei penal no tempo e no espaço; princípios', 'Erro, coação e inexigibilidade de conduta diversa',
    'Penas, substituição, medida de segurança e remição', 'Fato típico: nexo causal, dolo e culpa', 'Concurso de pessoas', 'Crimes sexuais, violência doméstica e perseguição',
    'Crimes contra o patrimônio e a administração pública', 'Crimes contra a honra', 'Drogas e Juizados Especiais', 'Extinção da punibilidade e prescrição', 'Revisão e simulado de Direito Penal' ] },
  { id: 'ppenal', nome: 'Processo Penal', cor: '#2F8F6B', grupo: 'principal', ciclo: 2, unid: [
    'Princípios, inquérito e ação penal', 'Competência', 'Provas', 'Prisões e medidas cautelares', 'Procedimentos: comum, júri e especiais',
    'Sentença', 'Recursos e ações autônomas', 'Juizados e legislação processual especial' ] },
  { id: 'adm', nome: 'Direito Administrativo', cor: '#F5C542', grupo: 'principal', ciclo: 1, unid: [
    'Princípios e organização administrativa', 'Poderes administrativos', 'Atos administrativos', 'Licitações e contratos', 'Serviços públicos e concessões',
    'Agentes públicos', 'Responsabilidade civil do Estado', 'Bens públicos e intervenção na propriedade', 'Controle da administração e improbidade' ] },
  { id: 'trib', nome: 'Direito Tributário', cor: '#9CC3E8', grupo: 'principal', ciclo: 5, unid: [
    'Sistema tributário e competência', 'Princípios e imunidades', 'Obrigação e crédito tributário', 'Suspensão, extinção e exclusão do crédito',
    'Responsabilidade e garantias', 'Impostos em espécie', 'Processo administrativo e judicial tributário' ] },
  { id: 'trab', nome: 'Direito do Trabalho', cor: '#A8D98B', grupo: 'principal', ciclo: 1, unid: [
    'Relação de emprego e sujeitos', 'Contrato de trabalho: alteração, suspensão e interrupção', 'Jornada, descansos e férias', 'Remuneração e salário',
    'Extinção do contrato e verbas rescisórias', 'Estabilidades e proteção especial', 'Direito coletivo do trabalho' ] },
  { id: 'ptrab', nome: 'Processo do Trabalho', cor: '#E9A6A0', grupo: 'principal', ciclo: 2, unid: [
    'Competência e partes', 'Procedimentos e prazos', 'Provas e sentença', 'Recursos', 'Execução trabalhista' ] },
  { id: 'emp', nome: 'Direito Empresarial', cor: '#BBA8E8', grupo: 'principal', ciclo: 6, nota: 'Você cursa Societário, Títulos, Falência e Teoria da Empresa agora: aula e OAB se ajudam.', unid: [
    'Teoria da empresa e empresário', 'Sociedades', 'Títulos de crédito', 'Contratos mercantis', 'Recuperação e falência', 'Propriedade industrial' ] },
  { id: 'cons', nome: 'Direito do Consumidor', cor: '#2F8F6B', grupo: 'leve', ciclo: 6, unid: [
    'Relação de consumo', 'Responsabilidade pelo fato e pelo vício', 'Contratos e práticas abusivas', 'Proteção processual e sanções' ] },
  { id: 'eca', nome: 'ECA', cor: '#F5C542', grupo: 'leve', ciclo: 5, unid: [
    'Direitos fundamentais da criança e do adolescente', 'Política de atendimento', 'Medidas de proteção e ato infracional', 'Conselho Tutelar e acesso à Justiça' ] },
  { id: 'fil', nome: 'Filosofia do Direito', cor: '#9CC3E8', grupo: 'min15', ciclo: 5, unid: [
    'Jusnaturalismo, positivismo e outras correntes', 'Justiça e teorias da justiça', 'Autores clássicos e contemporâneos', 'Hermenêutica e argumentação' ] },
  { id: 'amb', nome: 'Direito Ambiental', cor: '#A8D98B', grupo: 'leve', ciclo: 3, unid: [
    'Princípios e competência', 'Licenciamento e responsabilidade ambiental', 'Unidades de conservação e tutela do patrimônio' ] },
  { id: 'int', nome: 'Direito Internacional', cor: '#E9A6A0', grupo: 'leve', ciclo: 3, unid: [
    'Fontes e sujeitos', 'Nacionalidade, estrangeiros e extradição', 'Competência e cooperação internacional' ] },
  { id: 'prev', nome: 'Direito Previdenciário', cor: '#BBA8E8', grupo: 'leve', ciclo: 3, nota: 'Você cursa Previdenciário agora: aula e OAB se ajudam.', unid: [
    'Seguridade social e custeio', 'Benefícios do regime geral', 'Segurados e dependentes' ] },
  { id: 'elei', nome: 'Direito Eleitoral', cor: '#2F8F6B', grupo: 'leve', ciclo: 3, unid: [
    'Direitos políticos e partidos', 'Elegibilidade e inelegibilidade', 'Processo eleitoral' ] },
  { id: 'fin', nome: 'Direito Financeiro', cor: '#F5C542', grupo: 'leve', ciclo: 3, unid: [
    'Orçamento público', 'Receitas, despesas e responsabilidade fiscal' ] }
];
