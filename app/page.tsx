import Link from "next/link";

export default function Home() {
  return (
    <div className="home">
      <header className="home-topo">
        <nav>
          <div className="eita">
            <h2 className="japones">Nakasawa Lanches</h2>
          </div>
          <Link href="/" className="ativo">HOME</Link>
          <Link href="/cardapio">CARDÁPIO</Link>
          <Link href="/quem-somos">QUEM SOMOS</Link>
          <Link href="/cadastro" className="home-entrar">ENTRAR</Link>
        </nav>
      </header>

      <section className="home-hero">
        <p>Seja bem vindo ao</p>
        <h1>NAKASAWA LANCHES</h1>
      </section>

      <section className="home-prsomos">
        <div className="promo">
          <h2>Combo Especial Sushi + Temaki</h2>
          <p>O combo perfeito para compartilhar! Com 10% de desconto.</p>
          <Link href="/cardapio">Garanta já! →</Link>
        </div>

        <div className="promo">
          <h2>Novo no nosso cardápio: Korean Fried Chicken</h2>
          <p>Crocante por fora, irresistível por dentro!</p>
          <Link href="/cardapio">Peça agora →</Link>
        </div>
      </section>
    </div>
  );
}