import EnquiryForm from "@/components/EnquiryForm";

export default function ContactPage() {
  return (
    <div className="container-editorial max-w-2xl py-16">
      <p className="eyebrow mb-3">Get in touch</p>
      <h1 className="mb-5 font-display text-5xl">Contact Glitz Africa</h1>
      <p className="mb-10 text-sm text-gray-600">Send your question or message to our team.</p>
      <EnquiryForm />
    </div>
  );
}
