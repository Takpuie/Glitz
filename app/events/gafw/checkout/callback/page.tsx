import Link from "next/link";
import CheckoutStatus from "./CheckoutStatus";

export default function GafwCheckoutCallbackPage({
  searchParams,
}: {
  searchParams: { reference?: string };
}) {
  const reference = searchParams.reference;

  return (
    <div className="container-editorial max-w-xl py-20 text-center">
      {reference ? (
        <CheckoutStatus reference={reference} />
      ) : (
        <>
          <p className="eyebrow mb-3">Checkout</p>
          <h1 className="font-display text-4xl">No order reference found.</h1>
        </>
      )}
      <Link href="/events/gafw" className="btn-outline mt-10 inline-flex">
        Back to GAFW
      </Link>
    </div>
  );
}
