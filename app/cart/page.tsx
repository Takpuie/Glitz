import Link from "next/link";

export default function CartPage() {
  return (
    <div className="container-editorial py-12 md:py-16">
      <header className="border-b border-ink/12 pb-8">
        <p className="eyebrow mb-3">Glitz Shop</p>
        <h1 className="font-display text-5xl sm:text-6xl">Your Bag</h1>
      </header>

      <div className="max-w-md py-16">
        <div className="border border-ink/15 p-8 text-center">
          <p className="text-sm text-gray-600">Your bag is empty.</p>
          <Link href="/magazine" className="btn-primary mt-6 inline-flex">
            Browse Magazines
          </Link>
        </div>
      </div>
    </div>
  );
}
