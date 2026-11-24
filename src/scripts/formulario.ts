/**
 * Formulário de cotação/contato (componente FormularioCotacao).
 * - Valida com as mesmas regras do build (src/lib/formulario.ts), mostra o erro ao lado de
 *   cada campo (aria-invalid + aria-describedby) e leva o foco ao primeiro erro.
 * - Envia por fetch para o endpoint do `action` (Formspree, Web3Forms ou API própria que
 *   aceite FormData e responda 2xx).
 * - Honeypot preenchido: finge sucesso e não envia.
 * - Falha no envio: mantém os dados e oferece continuar pelo WhatsApp com a viagem já descrita.
 * - Sucesso: dispara o evento interno do site, que o analytics só registra com consentimento.
 */
import { type DetalheEvento, EVENTO_SITE } from '@/lib/analytics';
import {
  camposDoFormulario,
  type DadosFormulario,
  ehRobo,
  mensagemWhatsApp,
  type TipoFormulario,
  validarFormulario,
} from '@/lib/formulario';

const TIPOS: readonly TipoFormulario[] = ['contato', 'hospedagem', 'pacote'];

/** Data local de hoje no formato AAAA-MM-DD. */
function hoje(): string {
  const agora = new Date();
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0');
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

function dadosDo(formulario: HTMLFormElement): DadosFormulario {
  const dados: DadosFormulario = {};
  for (const [chave, valor] of new FormData(formulario)) {
    if (typeof valor === 'string') dados[chave as keyof DadosFormulario] = valor;
  }
  return dados;
}

function iniciar(formulario: HTMLFormElement): void {
  const tipo = formulario.dataset.formulario as TipoFormulario;
  if (!TIPOS.includes(tipo)) return;
  const status = formulario.querySelector<HTMLElement>('[data-formulario-status]');
  const botao = formulario.querySelector<HTMLButtonElement>('[data-formulario-enviar]');
  const campos = camposDoFormulario(tipo);
  const prefixo = formulario.id;

  // A validação do script substitui a do navegador (mensagens em português, por campo).
  formulario.noValidate = true;
  for (const nome of ['entrada', 'saida']) {
    const data = formulario.querySelector<HTMLInputElement>(`#${prefixo}-${nome}`);
    if (data) data.min = hoje();
  }

  const mostrarErros = (erros: Partial<Record<string, string>>): HTMLElement | null => {
    let primeiro: HTMLElement | null = null;
    for (const campo of campos) {
      const entrada = formulario.querySelector<HTMLElement>(`#${prefixo}-${campo.nome}`);
      const erro = formulario.querySelector<HTMLElement>(`#${prefixo}-${campo.nome}-erro`);
      const mensagem = erros[campo.nome];
      if (!entrada || !erro) continue;
      erro.textContent = mensagem ?? '';
      erro.hidden = !mensagem;
      if (mensagem) entrada.setAttribute('aria-invalid', 'true');
      else entrada.removeAttribute('aria-invalid');
      if (mensagem && !primeiro) primeiro = entrada;
    }
    return primeiro;
  };

  const informar = (html: string) => {
    if (status) status.innerHTML = html;
  };

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = dadosDo(formulario);
    const primeiroErro = mostrarErros(validarFormulario(tipo, dados, hoje()));
    if (primeiroErro) {
      informar('');
      primeiroErro.focus();
      return;
    }
    if (ehRobo(dados)) {
      formulario.reset();
      informar('<p class="text-verde-800 font-semibold">Pedido enviado. Obrigado!</p>');
      return;
    }

    if (botao) botao.disabled = true;
    informar('<p class="text-tinta-suave">Enviando…</p>');
    fetch(formulario.action, {
      method: 'POST',
      body: new FormData(formulario),
      headers: { Accept: 'application/json' },
    })
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        formulario.reset();
        informar(
          '<p class="text-verde-800 font-semibold">Pedido enviado. A nossa equipe responde em breve pelo e-mail ou telefone informado.</p>',
        );
        const detalhe: DetalheEvento = { nome: 'envio_formulario', tipo };
        document.dispatchEvent(new CustomEvent(EVENTO_SITE, { detail: detalhe }));
      })
      .catch(() => {
        const texto = mensagemWhatsApp(tipo, dados, formulario.dataset.resort ?? '');
        const link = `https://wa.me/${formulario.dataset.whatsapp ?? ''}?text=${encodeURIComponent(texto)}`;
        const paragrafo = document.createElement('p');
        paragrafo.className = 'text-coral-700 font-semibold';
        paragrafo.textContent =
          'Não foi possível enviar agora. Os dados continuam no formulário: tente de novo ou ';
        const atalho = document.createElement('a');
        atalho.href = link;
        atalho.target = '_blank';
        atalho.rel = 'noopener noreferrer';
        atalho.dataset.evento = 'clique_whatsapp';
        atalho.textContent = 'continue pelo WhatsApp (abre em nova aba)';
        paragrafo.append(atalho, '.');
        if (status) status.replaceChildren(paragrafo);
      })
      .finally(() => {
        if (botao) botao.disabled = false;
      });
  });
}

for (const formulario of document.querySelectorAll<HTMLFormElement>('form[data-formulario]')) {
  iniciar(formulario);
}
