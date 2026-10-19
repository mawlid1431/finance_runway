"use client";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { BookingRecord, BookingStatus } from "@/lib/types";

const tones: Record<BookingStatus, "warning" | "positive" | "danger"> = {
  requested: "warning",
  confirmed: "positive",
  cancelled: "danger",
};

export function BookingsTable({
  bookings,
  onBookingClick,
  onStatusChange,
}: {
  bookings: BookingRecord[];
  onBookingClick: (booking: BookingRecord) => void;
  onStatusChange: (booking: BookingRecord, status: BookingStatus) => Promise<void>;
}) {
  return (
    <Card id="bookings-table" data-avatar-target="bookings-table" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--line)] font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--muted)]">
              <th className="px-6 py-3.5 font-medium">Booking</th>
              <th className="px-4 py-3.5 font-medium">Who</th>
              <th className="px-4 py-3.5 font-medium">When</th>
              <th className="px-4 py-3.5 font-medium">Reason</th>
              <th className="px-6 py-3.5 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-sm text-[var(--muted)]">
                  No bookings yet. Ask Malitos for one, or add it here.
                </td>
              </tr>
            ) : null}
            {bookings.map((booking) => (
              <tr
                key={booking.bookingId}
                id={`booking-row-${booking.bookingId}`}
                data-avatar-target={`booking-row-${booking.bookingId}`}
                tabIndex={0}
                role="button"
                className="cursor-pointer border-b border-[var(--line)] text-sm transition last:border-0 hover:bg-[var(--surface-raised)]"
                onClick={() => onBookingClick(booking)}
                onKeyDown={(event) => {
                  if (event.currentTarget !== event.target) return;
                  if (event.key === "Enter" || event.key === " ") onBookingClick(booking);
                }}
              >
                <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--muted)]">
                  #{booking.bookingId}
                </td>
                <td className="px-4 py-4">
                  <span className="block font-medium">{booking.name}</span>
                  <span className="text-[var(--muted)]">{booking.contact}</span>
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  {booking.date} {booking.time}
                </td>
                <td className="max-w-[280px] px-4 py-4 font-medium">
                  <span className="line-clamp-1">{booking.reason}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <label className="inline-flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                    <StatusPill tone={tones[booking.status]}>{booking.status}</StatusPill>
                    <select
                      id={`booking-status-${booking.bookingId}`}
                      data-avatar-target={`booking-status-${booking.bookingId}`}
                      aria-label={`Status for booking ${booking.bookingId}`}
                      value={booking.status}
                      className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs"
                      onChange={(event) =>
                        onStatusChange(booking, event.target.value as BookingStatus)
                      }
                    >
                      <option value="requested">requested</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
