"use client";

import { useState } from "react";
import { cadastrar } from "../actions"

export default function CadastroPage () {
    const [erro, setErro] = useState("");

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
            
            <form action={cadastrar} className="cadastro" 
            onSubmit={(e) => {
                const senha = (e.currentTarget.elements.namedItem("senha_cliente") as HTMLInputElement
            ).value;
            const confirmarSenha = (
                            e.currentTarget.elements.namedItem("confirmar_senha") as HTMLInputElement
                        ).value;

            if (senha !== confirmarSenha) {
                e.preventDefault();
                setErro("As senhas não coincidem!");
                return;
            }

            setErro("");

            }}
            >
                <input type="text" name="nome_cliente" placeholder="Nome" required/>
                <input type="text" name="endereco_cliente" placeholder="Endereço" required/>
                <input type="text" name="telefone_cliente" placeholder="Telefone - ex (xx) xxxxx-xxxx" required/>
                <input type="password" name="senha_cliente" placeholder="Senha" required/>
                <input type="password" name="confirmar_senha" placeholder="Confirme sua senha" required/>
                {erro && <p className="erro-cadastro">{erro}</p>}
                <button type="submit">Cadastrar</button>
            </form>
        </section>
        </main>
        
    )
}