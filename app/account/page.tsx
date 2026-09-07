const orders = [
  { id: "GA-10432", item: "Issue 117 — The Bridal Issue", date: "Aug 2, 2026", status: "Delivered" },
  { id: "GA-10298", item: "Print + Digital Subscription — 1 Year", date: "Jun 14, 2026", status: "Active" },
];

const tickets = [
  { event: "GAFW 2026 — Full Festival Pass", date: "10–13 Nov 2026", status: "Upcoming" },
  { event: "Glitz Style Awards 2025", date: "Aug 2025", status: "Past" },
];

const saved = [
  "Inside the GAFW 2026 Lineup: Twenty Designers Redefining African Luxury",
  "Claudia Lumor on Building a Media House That Refuses to Choose One Lane",
];

export default function AccountPage() {
  return (
    <div className="container-editorial py-12 md:py-16">
      <header className="border-b border-ink/15 pb-8">
        <p className="eyebrow mb-3">My Account</p>
        <h1 className="font-display text-5xl sm:text-6xl">Welcome back, Ama</h1>
      </header>

      <div className="grid grid-cols-1 gap-14 py-12 md:grid-cols-3">
        <section>
          <p className="eyebrow mb-5">Subscription</p>
          <div className="border border-ink/15 p-6">
            <p className="font-display text-2xl">Print + Digital</p>
            <p className="mt-2 text-sm text-gray-600">Renews 14 Jun 2027</p>
            <button className="btn-outline mt-6 w-full">Manage Plan</button>
          </div>
        </section>

        <section>
          <p className="eyebrow mb-5">Order History</p>
          <ul className="divide-y divide-ink/15 border-y border-ink/15">
            {orders.map((o) => (
              <li key={o.id} className="py-4">
                <p className="text-sm font-medium">{o.item}</p>
                <p className="mt-1 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">
                  {o.id} &middot; {o.date} &middot; {o.status}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="eyebrow mb-5">My Tickets</p>
          <ul className="divide-y divide-ink/15 border-y border-ink/15">
            {tickets.map((t) => (
              <li key={t.event} className="py-4">
                <p className="text-sm font-medium">{t.event}</p>
                <p className="mt-1 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">
                  {t.date} &middot; {t.status}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="border-t border-ink/15 py-12">
        <p className="eyebrow mb-5">Saved Articles</p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {saved.map((s) => (
            <li key={s} className="border border-ink/15 p-5 font-display text-lg leading-snug">
              {s}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
