// Dicas e dados da prova da FGV. DONO: Estagiário 65 (só ele escreve aqui). O Petrus da tela inicial lê este arquivo.
// tipo: 'dado' = contado nas 640 questões reais (exames 40º a 47º) ou nos textos do edital; 'fonte' = vem de página pública citada em `fonte` (confira); 'opiniao' = leitura do Estagiário 65, marcada como tal.
// Nunca prometer aprovação. Nunca afirmar nada que não esteja nos dados, no edital ou numa fonte citada.
window.C48_FGVDICAS = {
  geradoEm: '2026-10-05',
  base: '640 questões reais dos exames 40º a 47º (4 anuladas), 80 por prova. A matéria de cada questão é inferida pela posição da questão no molde da prova.',
  molde: [
    ['Ética e Estatuto', '1 a 8', 8], ['Filosofia do Direito', '9 e 10', 2], ['Direito Constitucional', '11 a 16', 6], ['Direitos Humanos', '17 e 18', 2],
    ['Direito Eleitoral', '19 e 20', 2], ['Direito Internacional', '21 e 22', 2], ['Direito Financeiro', '23 e 24', 2], ['Direito Tributário', '25 a 29', 5],
    ['Direito Administrativo', '30 a 34', 5], ['Direito Ambiental', '35 e 36', 2], ['Direito Civil', '37 a 42', 6], ['ECA', '43 e 44', 2], ['Direito do Consumidor', '45 e 46', 2],
    ['Direito Empresarial', '47 a 50', 4], ['Processo Civil', '51 a 56', 6], ['Direito Penal', '57 a 62', 6], ['Processo Penal', '63 a 68', 6], ['Direito Previdenciário', '69 e 70', 2],
    ['Direito do Trabalho', '71 a 75', 5], ['Processo do Trabalho', '76 a 80', 5]
  ],
  dicas: [
    { tipo: 'dado', t: 'O molde da prova é fixo', x: 'Nas 8 provas analisadas, cada matéria ocupa as mesmas posições: Ética é da 1 à 8, Constitucional da 11 à 16, Civil da 37 à 42, Penal da 57 à 62, Processo do Trabalho da 76 à 80. Você sabe de antemão quantas questões cada matéria vale.' },
    { tipo: 'dado', t: 'Ética vale 8 de 80', x: 'É a matéria isolada de maior peso: 10% da prova, 8 questões em todas as provas analisadas. E é a mais literal: a alternativa certa quase sempre copia o Estatuto ou o Código de Ética.' },
    { tipo: 'dado', t: 'Seis matérias valem 6 questões cada', x: 'Constitucional, Civil, Processo Civil, Penal e Processo Penal valem cerca de 6 questões cada. Somadas à Ética, são cerca de 38 das 80 questões, quase metade da prova.' },
    { tipo: 'dado', t: 'Dez matérias valem só 2 questões', x: 'Filosofia, Direitos Humanos, Eleitoral, Internacional, Financeiro, Ambiental, ECA, Consumidor e Previdenciário valem 2 questões cada. Cada uma tem lei curta ou conteúdo limitado: bom custo-benefício para fechar pontos.' },
    { tipo: 'dado', t: 'Não existe letra mais provável', x: 'No gabarito das 636 questões válidas, A, B, C e D aparecem em proporção quase igual (A 158, B 161, C 158, D 159). Chutar sempre a mesma letra não tem base nenhuma.' },
    { tipo: 'dado', t: 'Quase nenhuma questão é anulada', x: 'Foram 4 anuladas em 640 (menos de 1%): duas de Ética, uma de Trabalho e uma de Empresarial. Não conte com anulação para fechar a nota.' },
    { tipo: 'dado', t: 'As mesmas regras voltam em casos novos', x: 'Na Ética, a vedação de divulgar advocacia junto com outra atividade apareceu em quatro provas, e depor sobre fato de cliente ou ex-cliente em três. A FGV troca a história e repete a regra.' },
    { tipo: 'dado', t: 'O corte é 40 de 80', x: 'O edital (item 4.1.3) exige o mínimo de 50% de acertos, ou seja, nota igual ou superior a 40 pontos, e cada questão vale 1 ponto (item 4.1.2). Não há nota por matéria: dá para ir mal em uma e passar nas outras, desde que o total chegue a 40.' },
    { tipo: 'dado', t: 'A prova dura 5 horas', x: 'São 80 questões em 5 horas (13h às 18h): em média 3 minutos e 45 segundos por questão. Treine o ritmo com o simulado completo do app.' },
    { tipo: 'fonte', t: 'Comece pelo comando da questão', x: 'Leia primeiro o que a questão pede (a última linha antes das alternativas) e só depois volte ao enunciado procurando as informações necessárias. Reduz o risco de se perder em enunciado longo.', fonte: 'oab.estrategia.com (estratégias para a 1ª fase); confira' },
    { tipo: 'fonte', t: 'A FGV cobra a literalidade da lei', x: 'Enunciados longos, alternativas muito próximas e forte cobrança do texto da lei. Por isso a leitura da lei seca e a resolução de provas anteriores pesam tanto quanto o resumo.', fonte: 'oab.estrategia.com (como evitar pegadinhas da FGV); confira' },
    { tipo: 'fonte', t: 'Revisar é parte do estudo', x: 'Resolver muitas questões e ler a teoria não basta sem tempo reservado para revisar: é a revisão que fixa o conteúdo. O app agenda as revisões e as questões vencidas para você.', fonte: 'oab.estrategia.com e ceisc.com.br (estratégias de estudo); confira' },
    { tipo: 'opiniao', t: 'Na prova, faça duas passadas', x: 'Primeira passada: responda o que você tem certeza e marque as dúvidas no caderno. Segunda passada: volte às dúvidas com o tempo que sobrou. O edital (itens 4.1.2 e 4.1.3) dá 1 ponto por questão e soma os pontos obtidos, sem prever desconto por erro; por isso não deixe nenhuma em branco no fim.' },
    { tipo: 'opiniao', t: 'Que matéria estudar primeiro', x: 'Comece por Ética (8 questões, literal), depois as matérias de 6 questões, e use as de 2 questões como "pontos rápidos" ao longo da semana. A ordem exata deve levar em conta o seu desempenho: o Estagiário 65 vai ajustá-la com os seus dados.' },
    { tipo: 'opiniao', t: 'Seu alvo de 45', x: 'Para chegar a 45 de 80 sem depender de sorte, Ética perto de tudo e as seis matérias grandes acima de 60% sustentam a conta. Treine no simulado completo e olhe o quadro por matéria.' }
  ]
};
