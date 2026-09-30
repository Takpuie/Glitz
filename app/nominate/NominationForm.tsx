import SubmissionForm from "@/components/SubmissionForm";

const inputClass = "mt-2 block w-full border-b border-ink bg-transparent py-3 text-sm";

export default function NominationForm() {
  return (
    <SubmissionForm kind="nominations" buttonLabel="Submit application" successMessage="Thank you. Your application has been saved for review. Keep your reference number for any follow-up.">
      <label className="block text-sm">Which open call?
        <select name="open_call" required defaultValue="" className={inputClass}>
          <option value="">Select an open call</option>
          <option value="designers">GAFW Young Designers Showcase</option>
          <option value="honours">Ghana Women of the Year — Nominate an Honouree</option>
          <option value="style">Glitz Style Awards — Reader Nomination</option>
        </select>
      </label>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm">Full name<input name="full_name" required maxLength={150} autoComplete="name" className={inputClass} /></label>
        <label className="block text-sm">Email<input name="email" type="email" required maxLength={254} autoComplete="email" className={inputClass} /></label>
      </div>
      <label className="block text-sm">Portfolio / press link (optional)<input name="portfolio_link" type="url" maxLength={200} placeholder="https://" className={inputClass} /></label>
      <label className="block text-sm">Portfolio upload (optional)
        <input name="portfolio_file" type="file" accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg" className="mt-3 block w-full text-sm" />
        <span className="mt-2 block text-xs text-gray-600">One PDF or JPG, up to 20 MB. Accessible only to authorised staff.</span>
      </label>
      <label className="block text-sm">Written statement<textarea name="statement" required maxLength={10000} rows={5} placeholder="Tell us about your work and why this opportunity matters to you." className={inputClass} /></label>
    </SubmissionForm>
  );
}
