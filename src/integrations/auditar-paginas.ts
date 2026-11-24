/**
 * Integração de build: audita todas as páginas do dist/ (regras em src/lib/auditoria.ts).
 * Erros (H1, saltos de título, imagem sem alt, id repetido, link ou âncora quebrados, título,
 * descrição, resposta direta, data de atualização) derrubam o build; avisos só aparecem no log.
 * O relatório completo fica em reports/auditoria-paginas.md (fora do git).
 * Fica por último na lista de integrações, para enxergar os arquivos gerados pelas outras.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';

import { auditarPaginas, ENTIDADES_RESPOSTA, relatorioAuditoria } from '../lib/auditoria.ts';
import { operador } from '../site.config.ts';
import { lerDist } from './paginas-dist.ts';

export default function auditarPaginasIntegracao(): AstroIntegration {
  let raizProjeto = '';
  return {
    name: 'auditar-paginas',
    hooks: {
      'astro:config:done': ({ config }) => {
        raizProjeto = fileURLToPath(config.root);
      },
      'astro:build:done': async ({ dir, logger }) => {
        const { arquivos, paginas } = await lerDist(dir);
        const resultado = auditarPaginas(paginas, arquivos, [...ENTIDADES_RESPOSTA, operador.nome]);

        const pasta = path.join(raizProjeto, 'reports');
        await mkdir(pasta, { recursive: true });
        await writeFile(path.join(pasta, 'auditoria-paginas.md'), relatorioAuditoria(resultado));

        for (const aviso of resultado.avisos) logger.warn(aviso);
        if (resultado.erros.length > 0) {
          throw new Error(`Auditoria das páginas:\n${resultado.erros.join('\n')}`);
        }
        logger.info(
          `${paginas.length} página(s) auditada(s), ${resultado.avisos.length} aviso(s). Relatório: reports/auditoria-paginas.md`,
        );
      },
    },
  };
}
