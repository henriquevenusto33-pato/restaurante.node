"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createClient } from "@/utils/supabase/server";

/* ----------------------------- PEDIR (formulário) ----------------------------- */

export async function pedir(formData: FormData) {
  const supabase = await createClient();

  const { data: pedido, error: errorPedido } = await supabase
    .from("pedido")
    .insert({
      data: String(formData.get("data")),
      id_cliente: Number(formData.get("id_cliente")),
      id_entregador: Number(formData.get("id_entregador")),
      status_pedido: "preparando",
    })
    .select("id_pedido")
    .single();

  if (errorPedido || !pedido) {
    throw new Error(errorPedido?.message ?? "Falha ao criar o pedido");
  }

  const { error: errorItem } = await supabase.from("item_pedido").insert({
    id_pedido: pedido.id_pedido,
    id_cardapio: Number(formData.get("id_cardapio")),
    quantidade: Number(formData.get("quantidade")),
  });

  if (errorItem) throw new Error(errorItem.message);

  revalidatePath("/");
}

/* --------------------------------- CADASTRAR --------------------------------- */

export async function cadastrar(
  formData: FormData
): Promise<{ erro?: string }> {
  const nome_cliente = String(formData.get("nome_cliente") ?? "").trim();
  const endereco_cliente = String(formData.get("endereco_cliente") ?? "").trim();
  const telefone_cliente = String(formData.get("telefone_cliente") ?? "").trim();
  const senha = String(formData.get("senha_cliente") ?? "");
  const confirmar = String(formData.get("confirmar_senha") ?? "");

  // validações no servidor (o navegador pode ser burlado)
  if (!nome_cliente || !endereco_cliente || !telefone_cliente || !senha) {
    return { erro: "Preencha todos os campos." };
  }
  if (telefone_cliente.replace(/\D/g, "").length < 10) {
    return { erro: "Telefone inválido. Use o formato (xx) xxxxx-xxxx." };
  }
  if (senha.length < 6) {
    return { erro: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmar) {
    return { erro: "As senhas não coincidem!" };
  }

  const supabase = await createClient();
  const senha_cliente = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from("cliente")
    .insert({
      nome_cliente,
      endereco_cliente,
      telefone_cliente,
      senha_cliente,
    })
    .select("id_cliente")
    .single();

  if (error || !data) {
    console.error("Erro ao cadastrar cliente:", error?.message);
    return { erro: error?.message ?? "Não foi possível cadastrar." };
  }

  // guarda quem é o cliente para as próximas páginas (cardápio/pedido)
  (await cookies()).set("id_cliente", String(data.id_cliente), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  redirect("/"); // se o menu estiver em app/page.tsx, troque por "/"
}

/* ----------------------------- FINALIZAR PEDIDO ------------------------------ */

export async function finalizarPedido(
  itens: { id_cardapio: number; quantidade: number }[],
  id_cliente?: number
) {
  const supabase = await createClient();

  // usa o id recebido ou, se não vier, o do cookie criado no cadastro
  const idCliente =
    id_cliente ?? Number((await cookies()).get("id_cliente")?.value);

  if (!idCliente || Number.isNaN(idCliente)) {
    return { ok: false, erro: "Cliente não identificado. Faça o cadastro." };
  }
  if (!itens.length) {
    return { ok: false, erro: "O carrinho está vazio." };
  }

  const { data: pedido, error } = await supabase
    .from("pedido")
    .insert({
      data: new Date().toISOString().slice(0, 10),
      id_cliente: idCliente,
      status_pedido: "preparando",
    })
    .select("id_pedido")
    .single();

  if (error || !pedido) {
    return { ok: false, erro: error?.message ?? "Falha ao criar o pedido" };
  }

  const { error: erroItens } = await supabase.from("item_pedido").insert(
    itens.map((i) => ({
      id_pedido: pedido.id_pedido,
      id_cardapio: i.id_cardapio,
      quantidade: i.quantidade,
    }))
  );

  if (erroItens) return { ok: false, erro: erroItens.message };

  revalidatePath("/");
  return { ok: true };
}
export async function sair() {
  (await cookies()).delete("id_cliente");
  redirect("/");
}