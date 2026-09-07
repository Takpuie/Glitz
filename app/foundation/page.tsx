const programmes = [
  { title: "Designer Mentorship", copy: "Pairing emerging talent from the Young Designers Showcase with established mentors for a full year." },
  { title: "Girls in Business", copy: "Workshops and micro-grants for young women launching their first ventures across Ghana." },
  { title: "Scholarship Fund", copy: "Tuition support for students pursuing fashion, design and media studies." },
];

export default function FoundationPage() {
  return (
    <div>
      <header className="container-editorial border-b border-ink/12 py-12 md:py-16">
        <p className="eyebrow mb-3">Kollage Media</p>
        <h1 className="font-display text-5xl sm:text-6xl">Glitz Africa Care Foundation</h1>
        <p className="mt-4 max-w-lg text-sm text-gray-600 md:text-base">
          The philanthropic arm behind the brand — investing in the next
          generation of African designers, founders and storytellers.
        </p>
      </header>

      <section className="container-editorial py-16 md:py-20">
        <div className="mb-10 border-b border-ink/15 pb-5">
          <p className="eyebrow mb-2">Programmes</p>
          <h2 className="font-display text-4xl sm:text-5xl">Where the Support Goes</h2>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {programmes.map((p) => (
            <div key={p.title}>
              <h3 className="font-display text-2xl">{p.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{p.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 text-center md:py-20">
          <p className="eyebrow mb-3">Get Involved</p>
          <h2 className="font-display text-3xl sm:text-4xl">Support the Foundation</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-gray-600">
            Every subscription and ticket purchase contributes a portion to the
            Foundation&rsquo;s programmes.
          </p>
          <button className="btn-primary mt-8">Donate</button>
        </div>
      </section>
    </div>
  );
}
