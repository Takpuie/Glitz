import Link from "next/link";
import OrderStatus from "./OrderStatus";

export default function MagazineCheckoutCallbackPage({
  searchParams,
}: {
  searchParams: { reference?: string };
}) {
  const reference = searchParams.reference;

  return (
    <div className="container-editorial max-w-xl py-20 text-center">
      {reference ? (
        <OrderStatus reference={reference} />
      ) : (
        <>
          <p className="eyebrow mb-3">Checkout</p>
          <h1 className="font-display text-4xl">No order reference found.</h1>
        </>
      )}
      <Link href="/magazine" className="btn-outline mt-10 inline-flex">
        Back to Glitz Magazine
      </Link>
    </div>
  );
}
