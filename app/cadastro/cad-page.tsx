"use client";

import { useState } from "react";
import { cadastrar } from "../actions";

export default function CadastroPage() {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro(formData: FormData) {
    const senha = formData.get("senha_cliente") as string;
    const confirmarSenha = formData.get("confirmar_senha") as string;

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }

    setErro("");
    setCarregando(true);

    // se der certo, a action redireciona para o menu e nada abaixo roda
    const resultado = await cadastrar(formData);

    if (resultado?.erro) {
      setErro(resultado.erro);
      setCarregando(false);
    }
  }

  return (
    <main className="cadastro-container">
      <aside className="banner-lateral">
        <div className="banner-lateral-conteudo">
          <h1>Nakasawa Lanches</h1>
          <p>Faça parte da nossa comunidade</p>
        </div>
      </aside>

      <section className="cadastro-formulario">
        <h2>CADASTRO</h2>

        <form action={handleCadastro} className="cadastro">
          <input type="text" name="nome_cliente" placeholder="Nome" required />
          <input
            type="text"
            name="endereco_cliente"
            placeholder="Endereço"
            required
          />
          <input
            type="tel"
            name="telefone_cliente"
            placeholder="Telefone - ex (xx) xxxxx-xxxx"
            required
          />
          <input
            type="password"
            name="senha_cliente"
            placeholder="Senha"
            minLength={6}
            required
          />
          <input
            type="password"
            name="confirmar_senha"
            placeholder="Confirme sua senha"
            minLength={6}
            required
          />

          {erro && <p className="erro-cadastro">{erro}</p>}

          <button type="submit" disabled={carregando}>
            {carregando ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </section>
    </main>
  );
}