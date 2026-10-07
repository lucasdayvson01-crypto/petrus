// Rotina fixa da semana do Lucas (0 = domingo ... 6 = sábado). Fonte: memoria/horarios.md (aulas 2026/2, estágio, treino).
// k: aula | estagio | treino | estudo | sim. so:'sim' = só aparece em dia de simulado.
// Os blocos de estudo são a proposta do Petrus (esboço até o Lucas aprovar). Edite os horários aqui.
window.C48_ROTINA = {
  0: [ { h: '09:00', f: '13:00', t: 'Estudo', k: 'estudo' }, { h: '13:00', f: '18:00', t: 'Simulado cronometrado', k: 'sim', so: 'sim' } ],
  1: [ { h: '08:00', f: '09:00', t: 'Treino', k: 'treino' }, { h: '10:00', f: '13:00', t: 'Estudo', k: 'estudo' },
       { h: '18:00', f: '20:00', t: 'Falência e Recuperação Judicial', k: 'aula' }, { h: '20:00', f: '22:00', t: 'Tópicos Esp. de Direito Público', k: 'aula' } ],
  2: [ { h: '08:00', f: '09:00', t: 'Treino', k: 'treino' }, { h: '10:00', f: '13:00', t: 'Estudo', k: 'estudo' },
       { h: '18:00', f: '20:00', t: 'Tributos em Espécie', k: 'aula' }, { h: '20:00', f: '22:00', t: 'Trabalho Monográfico II', k: 'aula' } ],
  3: [ { h: '10:10', f: '12:10', t: 'Direito Societário e Títulos de Crédito', k: 'aula' }, { h: '12:00', f: '16:00', t: 'Estágio na Defensoria', k: 'estagio' },
       { h: '19:00', f: '20:00', t: 'Treino', k: 'treino' }, { h: '20:30', f: '22:30', t: 'Estudo', k: 'estudo' } ],
  4: [ { h: '08:00', f: '09:00', t: 'Treino', k: 'treino' }, { h: '09:30', f: '11:30', t: 'Estudo', k: 'estudo' },
       { h: '12:00', f: '16:00', t: 'Estágio na Defensoria', k: 'estagio' }, { h: '18:00', f: '20:00', t: 'Teoria da Empresa', k: 'aula' } ],
  5: [ { h: '08:00', f: '10:00', t: 'Direito Previdenciário (virtual)', k: 'aula' }, { h: '10:30', f: '11:30', t: 'Treino', k: 'treino' },
       { h: '14:00', f: '17:00', t: 'Estudo', k: 'estudo' }, { h: '18:00', f: '20:00', t: 'Optativa II (virtual)', k: 'aula' } ],
  6: [ { h: '09:00', f: '13:00', t: 'Estudo', k: 'estudo' }, { h: '19:00', f: '20:00', t: 'Treino', k: 'treino' } ]
};
