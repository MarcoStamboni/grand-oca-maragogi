import { describe, expect, it } from 'vitest';

import {
  assuntoDoFormulario,
  CAMPO_ARMADILHA,
  camposDoFormulario,
  ehRobo,
  mensagemWhatsApp,
  validarFormulario,
} from './formulario';

const hoje = '2026-10-02';
const contatoValido = {
  nome: 'Maria Souza',
  email: 'maria@exemplo.com.br',
  telefone: '(11) 99999-9999',
  mensagem: 'Gostaria de saber sobre o Natal.',
};
const viagemValida = {
  ...contatoValido,
  mensagem: '',
  entrada: '2026-12-20',
  saida: '2026-12-27',
  adultos: '2',
  criancas: '1',
  idades: '5 anos',
};

describe('campos do formulário', () => {
  it('contato pede só o que o formulário oficial pede', () => {
    expect(camposDoFormulario('contato').map(({ nome }) => nome)).toEqual([
      'nome',
      'email',
      'telefone',
      'mensagem',
    ]);
  });

  it('cotações pedem datas, hóspedes e idades; o pacote também a origem', () => {
    const hospedagem = camposDoFormulario('hospedagem').map(({ nome }) => nome);
    expect(hospedagem).toEqual(expect.arrayContaining(['entrada', 'saida', 'adultos', 'idades']));
    expect(hospedagem).not.toContain('origem');
    const pacote = camposDoFormulario('pacote');
    expect(pacote.find(({ nome }) => nome === 'origem')?.obrigatorio).toBe(true);
    expect(pacote.find(({ nome }) => nome === 'entrada')?.rotulo).toBe('Data de ida');
  });

  it('não repete campos e tem assunto por tipo', () => {
    for (const tipo of ['contato', 'hospedagem', 'pacote'] as const) {
      const nomes = camposDoFormulario(tipo).map(({ nome }) => nome);
      expect(new Set(nomes).size).toBe(nomes.length);
      expect(assuntoDoFormulario(tipo, 'Resort Modelo')).toContain('Resort Modelo');
    }
  });
});

describe('validarFormulario', () => {
  it('aceita pedidos completos', () => {
    expect(validarFormulario('contato', contatoValido, hoje)).toEqual({});
    expect(validarFormulario('hospedagem', viagemValida, hoje)).toEqual({});
    expect(validarFormulario('pacote', { ...viagemValida, origem: 'Brasília' }, hoje)).toEqual({});
  });

  it('acusa obrigatórios vazios com mensagens por campo', () => {
    expect(validarFormulario('contato', {}, hoje)).toEqual({
      nome: 'Informe o seu nome.',
      email: 'Informe o seu e-mail.',
      telefone: 'Informe um telefone com DDD.',
      mensagem: 'Escreva a sua mensagem.',
    });
  });

  it('confere formato de e-mail e telefone', () => {
    const erros = validarFormulario(
      'contato',
      { ...contatoValido, email: 'maria@', telefone: '9999-9999' },
      hoje,
    );
    expect(erros.email).toMatch(/e-mail válido/);
    expect(erros.telefone).toMatch(/DDD/);
    expect(
      validarFormulario('contato', { ...contatoValido, telefone: '+55 81 3302-4446' }, hoje),
    ).toEqual({});
  });

  it('confere datas, hóspedes e idades', () => {
    const erros = validarFormulario(
      'hospedagem',
      {
        ...viagemValida,
        entrada: '2026-10-01',
        saida: '2026-09-30',
        adultos: '0',
        criancas: '2',
        idades: '',
      },
      hoje,
    );
    expect(erros).toEqual({
      entrada: 'A data não pode ser anterior a hoje.',
      saida: 'A data de saída precisa ser depois da data de entrada.',
      adultos: 'Informe de 1 a 20 adultos.',
      idades: 'Informe a idade de cada criança.',
    });
    expect(
      validarFormulario('pacote', { ...viagemValida, origem: 'Recife', saida: '2026-12-20' }, hoje)
        .saida,
    ).toBe('A data de volta precisa ser depois da data de ida.');
  });

  it('crianças em branco valem zero e não exigem idades', () => {
    expect(
      validarFormulario('hospedagem', { ...viagemValida, criancas: '', idades: '' }, hoje),
    ).toEqual({});
  });
});

describe('honeypot e WhatsApp', () => {
  it('identifica robôs pelo campo-armadilha', () => {
    expect(ehRobo(contatoValido)).toBe(false);
    expect(ehRobo({ ...contatoValido, [CAMPO_ARMADILHA]: 'spam' })).toBe(true);
  });

  it('monta a mensagem do WhatsApp sem e-mail nem telefone', () => {
    const texto = mensagemWhatsApp(
      'hospedagem',
      { ...viagemValida, acomodacao: 'Classic', mensagem: 'Vista para a piscina.' },
      'Summerville All Inclusive Resort',
    );
    expect(texto).toBe(
      'Olá! Quero uma cotação de hospedagem no Summerville All Inclusive Resort. Entrada: 20/12/2026. Saída: 27/12/2026. Adultos: 2. Crianças: 1 (5 anos). Acomodação: Classic. Vista para a piscina.',
    );
    expect(texto).not.toContain(viagemValida.email);
    expect(texto).not.toContain('99999');
  });

  it('no pacote, fala em ida, volta e origem', () => {
    const texto = mensagemWhatsApp(
      'pacote',
      { ...viagemValida, origem: 'Brasília', criancas: '0' },
      'X',
    );
    expect(texto).toContain('Origem: Brasília. Ida: 20/12/2026. Volta: 27/12/2026.');
    expect(texto).not.toContain('Crianças');
  });
});
