"use client";

import { useState, useTransition } from "react";
import { finalizarPedido } from "./actions";
import Link from "next/link";

type Item = {
  id_cardapio: number;
  prato: string;
  acompanhamento: string | null;
  preco: number;
  categoria: string | null;
};
type Cliente = { id_cliente: number; nome_cliente: string };

const CATEGORIAS = ["Pratos quentes", "Pratos frios", "Sushis", "Temakis", "Combos"];

const reais = (v: number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Cardapio({ itens, clientes }: { itens: Item[]; clientes: Cliente[] }) {
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [busca, setBusca] = useState("");
  const [qtd, setQtd] = useState<Record<number, number>>({});
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [aberto, setAberto] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [pendente, startTransition] = useTransition();

  const visiveis = itens.filter((i) =>
    busca
      ? i.prato.toLowerCase().includes(busca.toLowerCase())
      : i.categoria === categoria
  );

  const totalItens = Object.values(carrinho).reduce((a, b) => a + b, 0);
  const totalValor = Object.entries(carrinho).reduce((soma, [id, q]) => {
    const item = itens.find((i) => i.id_cardapio === Number(id));
    return soma + (item ? Number(item.preco) * q : 0);
  }, 0);

  function mudarQtd(id: number, delta: number) {
    setQtd((q) => ({ ...q, [id]: Math.max(1, (q[id] ?? 1) + delta) }));
  }

  function adicionar(id: number) {
    const n = qtd[id] ?? 1;
    setCarrinho((c) => ({ ...c, [id]: (c[id] ?? 0) + n }));
    setQtd((q) => ({ ...q, [id]: 1 }));
    setMensagem("");
  }

  function remover(id: number) {
    setCarrinho((c) => {
      const novo = { ...c };
      delete novo[id];
      return novo;
    });
  }

  function enviar() {
    if (!clienteId) return setMensagem("Selecione o cliente.");
    if (totalItens === 0) return setMensagem("O carrinho está vazio.");

    const lista = Object.entries(carrinho).map(([id, quantidade]) => ({
      id_cardapio: Number(id),
      quantidade,
    }));

    startTransition(async () => {
      const res = await finalizarPedido(lista, Number(clienteId));
      if (res.ok) {
        setCarrinho({});
        setMensagem("Pedido feito com sucesso!");
      } else {
        setMensagem("Erro: " + res.erro);
      }
    });
  }

  return (
    <div className="loja">
      <header className="loja-topo">
        <h1>
            <Link href="/">Nakasawa Lanches</Link>
        </h1>
        <input
          className="loja-busca"
          placeholder="Yakisoba, Onigiri, etc..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
         {logado ? (
            <form action={sair}>
              <button type="submit" className="home-entrar">SAIR</button>
            </form>
          ) : (
            <Link href="/cadastro" className="home-entrar">ENTRAR</Link>
          )}
        <button className="loja-icone" title="Carrinho" onClick={() => setAberto(!aberto)}>
          🛍️ {totalItens > 0 && <span className="loja-badge">{totalItens}</span>}
        </button>
      </header>

      <section className="home-hero2">
        <div className="banner-conteudo">
        <p>Seja bem vindo ao</p>
        <h1>Cardapio</h1>
        </div>
      </section>
      <div className="loja-corpo">
        <nav className="loja-menu">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              className={c === categoria && !busca ? "ativo" : ""}
              onClick={() => { setCategoria(c); setBusca(""); }}
            >
              {c}
            </button>
          ))}
        </nav>

        <div className="loja-conteudo">
        <main className="loja-principal">
          <h2 className="loja-titulo">{busca ? "Resultados da busca" : categoria}</h2>

          <div className="loja-grade">
            {visiveis.length === 0 && <p>Nenhum item encontrado.</p>}
            {visiveis.map((i) => (
              <div key={i.id_cardapio} className="card">
                <div className="card-foto" />
                <strong>{i.prato}</strong>
                {i.acompanhamento && <span>{i.acompanhamento}</span>}
                <span className="card-preco">{reais(i.preco)}</span>

                <div className="card-qtd">
                  <button onClick={() => mudarQtd(i.id_cardapio, -1)}>−</button>
                  <span>{qtd[i.id_cardapio] ?? 1}</span>
                  <button onClick={() => mudarQtd(i.id_cardapio, 1)}>+</button>
                </div>

                <button className="card-add" onClick={() => adicionar(i.id_cardapio)}>
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </main>

        {aberto && (
          <aside className="loja-carrinho">
            <h2>Carrinho</h2>

            {totalItens === 0 && <p>Nenhum item ainda.</p>}
            {Object.entries(carrinho).map(([id, q]) => {
              const item = itens.find((i) => i.id_cardapio === Number(id));
              return (
                <div key={id} className="carrinho-linha">
                  <span>
                    {q}x {item?.prato}
                    {item && ` — ${reais(Number(item.preco) * q)}`}
                  </span>
                  <button onClick={() => remover(Number(id))}>✕</button>
                </div>
              );
            })}

            {totalItens > 0 && <strong>Total: {reais(totalValor)}</strong>}

            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Selecione o cliente</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nome_cliente}</option>
              ))}
            </select>

            <button className="card-add" onClick={enviar} disabled={pendente}>
              {pendente ? "Enviando..." : "Fazer pedido"}
            </button>
            {mensagem && <p>{mensagem}</p>}
          </aside>
        )}
      </div>
    </div>
  </div>
  );
}