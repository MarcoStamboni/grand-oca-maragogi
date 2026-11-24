/**
 * Endpoint de TESTE do formulário (só localhost:4330), para conferir o envio sem serviço externo.
 * Uso: `npm run formulario:mock` e um .env local com
 *   PUBLIC_FORM_ENDPOINT=http://localhost:4330/enviar
 * depois `npm run build` + `npm run preview -- --port 4322`. Apague o .env no fim.
 * Cada envio é gravado em reports/envios-formulario.json (fora do git); /falhar responde 500.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const PORTA = 4330;
const ORIGEM_PERMITIDA = 'http://localhost:4322';
const pasta = path.resolve('reports');
const arquivo = path.join(pasta, 'envios-formulario.json');

interface Envio {
  caminho: string;
  tipo: string;
  corpo: string;
}

const envios: Envio[] = [];
mkdirSync(pasta, { recursive: true });
writeFileSync(arquivo, '[]');

createServer((pedido, resposta) => {
  resposta.setHeader('Access-Control-Allow-Origin', ORIGEM_PERMITIDA);
  resposta.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');
  if (pedido.method !== 'POST') {
    resposta.writeHead(pedido.method === 'OPTIONS' ? 204 : 200).end();
    return;
  }
  let corpo = '';
  pedido.on('data', (parte: Buffer) => (corpo += parte.toString('utf8')));
  pedido.on('end', () => {
    envios.push({
      caminho: pedido.url ?? '',
      tipo: pedido.headers['content-type'] ?? '',
      corpo,
    });
    writeFileSync(arquivo, JSON.stringify(envios, null, 2));
    const falhar = pedido.url === '/falhar';
    resposta
      .writeHead(falhar ? 500 : 200, { 'Content-Type': 'application/json' })
      .end(JSON.stringify({ ok: !falhar }));
  });
}).listen(PORTA, () => {
  console.log(
    `Endpoint de teste do formulário em http://localhost:${PORTA} (envios em ${arquivo})`,
  );
});
