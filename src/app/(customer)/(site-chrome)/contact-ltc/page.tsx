"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import CustomerStaticPage from "@/src/app/(customer)/_components/CustomerStaticPage";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { LTTTextarea } from "@/src/@core/component/LTTShadcnUI/LTTTextarea";

const channels = [
  {
    icon: Phone,
    title: "Hotline",
    value: "1900 6017",
    note: "Daily 8:00 – 23:00",
  },
  {
    icon: Mail,
    title: "Email",
    value: "support@ltc-cinema.vn",
    note: "Reply within 24 hours",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    value: "Open chat",
    note: "On the LTC mobile app",
  },
  {
    icon: MapPin,
    title: "Head Office",
    value: "227 Nguyễn Văn Cừ, Q.5, TP.HCM",
    note: "Mon – Fri 9:00 – 18:00",
  },
];

export default function ContactLTCPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent", {
      description: "Our team will reach out within 24 hours.",
    });
    setForm({ name: "", email: "", phone: "", topic: "", message: "" });
  };

  return (
    <CustomerStaticPage
      title="Contact LTC"
      subtitle="We are here to help with bookings, refunds, partnerships and feedback."
      contentMaxWidth="wide"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((c) => (
          <div key={c.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <c.icon className="h-5 w-5 text-primary-shadcn" />
            <div className="font-heading mt-2 text-sm font-semibold">{c.title}</div>
            <div className="mt-0.5 text-sm font-medium">{c.value}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground-shadcn">
              <Clock className="h-3 w-3" /> {c.note}
            </div>
          </div>
        ))}
      </div>

      <h2>Send us a message</h2>
      <form
        onSubmit={submit}
        className="max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2 my-3">
          <div className="space-y-1.5">
            <LTTLabel htmlFor="contact-name">Full name</LTTLabel>
            <LTTInput
              id="contact-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <LTTLabel htmlFor="contact-phone">Phone</LTTLabel>
            <LTTInput
              id="contact-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 my-3">
          <div className="space-y-1.5">
            <LTTLabel htmlFor="contact-email">Email</LTTLabel>
            <LTTInput
              id="contact-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <LTTLabel htmlFor="contact-topic">Topic</LTTLabel>
            <LTTInput
              id="contact-topic"
              placeholder="Booking, refund, feedback…"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5 my-3">
          <LTTLabel htmlFor="contact-message">Message</LTTLabel>
          <LTTTextarea
            id="contact-message"
            rows={5}
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
        <LTTButton type="submit" className="w-full sm:w-auto">
          Send message
        </LTTButton>
      </form>
    </CustomerStaticPage>
  );
}
