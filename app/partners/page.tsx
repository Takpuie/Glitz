const packages = [
  { tier: "Media Partner", detail: "Print + digital placements across issues, editorial integrations, newsletter sponsorship." },
  { tier: "Event Sponsor", detail: "Branding across a chosen event edition — logo placement, stage presence, delegate bags." },
  { tier: "Title Partner", detail: "Presenting-sponsor status for a full event property, year-round brand alignment." },
];

const stats = [
  { value: "1M+", label: "Audience across print, digital & events" },
  { value: "5", label: "Flagship annual events" },
  { value: "27", label: "Years of Glitz Africa" },
];

export default function PartnersPage() {
  return (
    <div>
      <header className="container-editorial border-b border-ink/12 py-12 md:py-16">
        <p className="eyebrow mb-3">For Brands &amp; Agencies</p>
        <h1 className="font-display text-5xl sm:text-6xl">Advertise &amp; Partner</h1>
      </header>

      <section className="hairline">
        <div className="container-editorial grid grid-cols-1 divide-y divide-ink/15 py-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="py-8 text-center sm:px-6">
              <p className="font-display text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial py-16 md:py-20">
        <div className="mb-10 border-b border-ink/15 pb-5">
          <p className="eyebrow mb-2">Partnership Tiers</p>
          <h2 className="font-display text-4xl sm:text-5xl">Ways to Work With Us</h2>
        </div>
        <div className="divide-y divide-ink/15 border-y border-ink/15">
          {packages.map((p) => (
            <div key={p.tier} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-xl">{p.tier}</h3>
              <p className="max-w-md text-sm text-gray-600">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 text-center md:py-20">
          <p className="eyebrow mb-3">Media Kit</p>
          <h2 className="font-display text-3xl sm:text-4xl">Download the 2026 Rate Card &amp; Media Kit</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-gray-600">
            Audience demographics, ad specs, event sponsorship inventory and
            pricing — everything a media buyer needs.
          </p>
          <button className="btn-primary mt-8">Download Media Kit (PDF)</button>
        </div>
      </section>
    </div>
  );
}
