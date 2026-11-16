import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import Cardapio from "../Cardapio";

async function Dados() {
  const supabase = await createClient();

  const { data: cliente, error: erroCliente } = await supabase
    .from("cliente")
    .select("id_cliente, nome_cliente");
  const { data: cardapio, error: erroCardapio } = await supabase
    .from("cardapio")
    .select("id_cardapio, prato, acompanhamento, preco, categoria");

  if (erroCliente) console.error("ERRO CLIENTE:", erroCliente.message);
  if (erroCardapio) console.error("ERRO CARDAPIO:", erroCardapio.message);

  return <Cardapio itens={cardapio ?? []} clientes={cliente ?? []} />;
}

export default function CardapioPage() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <Dados />
    </Suspense>
  );
}