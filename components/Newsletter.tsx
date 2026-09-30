import SubmissionForm from "@/components/SubmissionForm";

export default function Newsletter({ dark = false }: { dark?: boolean }) {
  return (
    <SubmissionForm kind="newsletter" buttonLabel="Join" successMessage="Thank you. Your newsletter signup has been recorded." className={`mt-5 max-w-[300px] ${dark ? "text-paper" : "text-ink"}`}>
      <label className="block text-sm">Email address
        <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Your email address" className="mt-2 w-full border-b border-current bg-transparent py-2 text-sm" />
      </label>
    </SubmissionForm>
  );
}
