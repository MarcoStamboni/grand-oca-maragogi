declare namespace App {
  interface Locals {
    /**
     * Resposta direta da página interna (PaginaLayout), mostrada pela primeira Secao com título
     * logo abaixo da introdução, em vez de solta embaixo do topo. `usada` evita repetir.
     */
    respostaPendente?: { texto: string; usada: boolean };
    secoesComFoto?: number;
  }
}
