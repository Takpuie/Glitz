"use client";

import { useState } from "react";
import type { BackendMagazineIssue } from "@/lib/backend";
import { useCart, type CartFormat } from "@/lib/cart-context";
import { editorialImage } from "@/lib/img";

function formatPrice(price: string) {
  return `GHS ${Math.round(parseFloat(price)).toLocaleString()}`;
}

export default function MagazineCheckout({
  issue,
  compact = false,
}: {
  issue: BackendMagazineIssue;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState<CartFormat | null>(null);

  const printAvailable = issue.is_print_available && !issue.print_sold_out;

  function handleAdd(format: CartFormat) {
    addItem({
      slug: issue.slug,
      title: issue.title,
      format,
      price: issue.price,
      image: issue.cover_image?.full_url ?? editorialImage(issue.slug, 1000, 1300),
    });
    setAdded(format);
    window.setTimeout(() => setAdded(null), 1800);
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${compact ? "mt-3" : "mt-8 gap-4"}`}>
      {printAvailable && (
        <button
          type="button"
          className={compact ? "btn-outline px-3 py-1.5 text-[10px]" : "btn-primary"}
          onClick={() => handleAdd("print")}
        >
          {added === "print" ? "Added to Bag ✓" : `Add Print — ${formatPrice(issue.price)}`}
        </button>
      )}
      {issue.is_digital_available && (
        <button
          type="button"
          className={compact ? "btn-outline px-3 py-1.5 text-[10px]" : "btn-outline"}
          onClick={() => handleAdd("digital")}
        >
          {added === "digital" ? "Added to Bag ✓" : `Add Digital — ${formatPrice(issue.price)}`}
        </button>
      )}
    </div>
  );
}
