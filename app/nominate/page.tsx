import NominationForm from "./NominationForm";

const openCalls = [
  {
    name: "GAFW Young Designers Showcase",
    deadline: "30 September 2026",
    criteria: "Creativity, sustainability, craftsmanship, market potential",
  },
  {
    name: "Ghana Women of the Year Honours",
    deadline: "15 October 2026",
    criteria: "Impact, leadership, integrity, contribution to Ghana",
  },
  {
    name: "Glitz Style Awards — Reader Nomination",
    deadline: "Rolling",
    criteria: "Public vote across ten style categories",
  },
];

export default function NominatePage() {
  return (
    <div>
      <header className="container-editorial border-b border-ink/15 py-12 md:py-16">
        <p className="eyebrow mb-3">Open Calls</p>
        <h1 className="font-display text-5xl sm:text-6xl">Awards &amp; Nominations</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 md:text-base">
          Structured, transparent open calls for every designer showcase and
          honours process on the Glitz Africa calendar.
        </p>
      </header>

      <section className="container-editorial py-14">
        <div className="grid grid-cols-1 divide-y divide-ink/15 border-y border-ink/15 md:grid-cols-3 md:divide-x md:divide-y-0">
          {openCalls.map((call) => (
            <div key={call.name} className="py-6 md:px-8 md:py-8">
              <h3 className="font-display text-xl leading-snug">{call.name}</h3>
              <dl className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Deadline</dt>
                  <dd>{call.deadline}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Judging criteria</dt>
                  <dd className="mt-1">{call.criteria}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="hairline bg-smoke">
        <div className="container-editorial max-w-2xl py-16 md:py-20">
          <p className="eyebrow mb-3">Apply</p>
          <h2 className="mb-10 font-display text-4xl">Submit Your Application</h2>
          <NominationForm />
        </div>
      </section>
    </div>
  );
}
