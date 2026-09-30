import SubmissionForm from "@/components/SubmissionForm";

const inputClass = "mt-2 block w-full border-b border-ink bg-transparent py-3 text-sm";

export default function EnquiryForm({ kind = "general", event, events = [] }: {
  kind?: "general" | "event" | "sponsorship";
  event?: { slug: string; name: string };
  events?: { slug: string; name: string }[];
}) {
  return (
    <SubmissionForm kind="enquiries" buttonLabel={kind === "event" ? "Register interest" : "Send enquiry"}>
      <input type="hidden" name="kind" value={kind} />
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm">Full name<input name="full_name" required maxLength={150} autoComplete="name" className={inputClass} /></label>
        <label className="block text-sm">Email<input name="email" required type="email" maxLength={254} autoComplete="email" className={inputClass} /></label>
      </div>
      {kind === "sponsorship" && <label className="block text-sm">Company<input name="company" required maxLength={200} autoComplete="organization" className={inputClass} /></label>}
      {event ? <><input type="hidden" name="event" value={event.slug} /><p className="text-sm">Event: {event.name}</p></> : kind === "sponsorship" && events.length > 0 ? (
        <label className="block text-sm">Event (optional)<select name="event" defaultValue="" className={inputClass}><option value="">General partnership</option>{events.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
      ) : null}
      <label className="block text-sm">{kind === "sponsorship" ? "Tell us about your partnership requirements" : kind === "event" ? "Message (optional)" : "Message"}<textarea name="message" required={kind !== "event"} maxLength={10000} rows={5} className={inputClass} /></label>
    </SubmissionForm>
  );
}
