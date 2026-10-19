"use client";

import { LoaderCircle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { BookingInput, BookingRecord } from "@/lib/types";

const empty: BookingInput = {
  name: "",
  contact: "",
  date: "",
  time: "",
  reason: "",
};

export function NewBookingDialog({
  open,
  onClose,
  onCreate,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: BookingInput) => Promise<BookingRecord>;
  onCreated: (booking: BookingRecord) => void;
}) {
  const [form, setForm] = useState<BookingInput>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof BookingInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const booking = await onCreate(form);
      onCreated(booking);
      setForm(empty);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the booking.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/35 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--muted)]">
              Appointment
            </p>
            <h2 className="mt-2 text-2xl font-semibold">New booking</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close new booking form"
          >
            <X className="size-4" />
          </Button>
        </div>
        <Field label="Name">
          <input
            id="booking-name"
            data-avatar-target="booking-name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            className={inputClass}
            required
            maxLength={80}
          />
        </Field>
        <Field label="Phone or email">
          <input
            id="booking-contact"
            data-avatar-target="booking-contact"
            value={form.contact}
            onChange={(event) => setField("contact", event.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date">
            <input
              id="booking-date"
              data-avatar-target="booking-date"
              type="date"
              value={form.date}
              onChange={(event) => setField("date", event.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Time">
            <input
              id="booking-time"
              data-avatar-target="booking-time"
              type="time"
              value={form.time}
              onChange={(event) => setField("time", event.target.value)}
              className={inputClass}
              required
            />
          </Field>
        </div>
        <Field label="Reason">
          <textarea
            id="booking-reason"
            data-avatar-target="booking-reason"
            value={form.reason}
            onChange={(event) => setField("reason", event.target.value)}
            className={`${inputClass} min-h-24 resize-y`}
            required
            maxLength={240}
          />
        </Field>
        {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}
        <Button
          id="submit-booking"
          data-avatar-target="submit-booking"
          type="submit"
          variant="accent"
          className="mt-6 w-full"
          disabled={saving}
        >
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Save booking
        </Button>
      </form>
    </div>
  );
}

const inputClass =
  "mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-3 font-normal outline-none focus:border-[var(--ink)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}
