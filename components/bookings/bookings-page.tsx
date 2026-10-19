"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";

import { BookingsTable } from "@/components/bookings/bookings-table";
import { NewBookingDialog } from "@/components/bookings/new-booking-dialog";
import { useDashboard } from "@/components/layout/dashboard-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

export function BookingsPage() {
  const {
    bookingFilter,
    bookings,
    createBooking,
    openPanel,
    refreshBookings,
    setBookingFilter,
    updateBookingStatus,
  } = useDashboard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const visible = bookings.filter((booking) => {
    if (bookingFilter === "requested") return booking.status === "requested";
    if (bookingFilter === "confirmed") return booking.status === "confirmed";
    return true;
  });

  return (
    <div id="bookings-page" data-avatar-target="bookings-page">
      <PageHeader
        eyebrow="Appointments"
        title="Book a time."
        description="Ask Malitos for a booking, or add one here. Saved appointments stay in the database."
      />

      <section
        id="bookings-actions"
        data-avatar-target="bookings-actions"
        className="mb-5 flex flex-col gap-3 rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div id="bookings-filters" data-avatar-target="bookings-filters" className="flex gap-1">
          {(["all", "requested", "confirmed"] as const).map((value) => (
            <button
              key={value}
              id={`booking-filter-${value}`}
              data-avatar-target={`booking-filter-${value}`}
              aria-pressed={bookingFilter === value}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold capitalize",
                bookingFilter === value
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-raised)]",
              )}
              onClick={() => setBookingFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            id="bookings-refresh"
            data-avatar-target="bookings-refresh"
            variant="outline"
            onClick={async () => {
              await refreshBookings();
              openPanel({
                title: "Bookings are live",
                body: "Appointments update from the database. A booking Malitos saves shows up in this list.",
              });
            }}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button
            id="new-booking"
            data-avatar-target="new-booking"
            variant="accent"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="size-4" />
            New booking
          </Button>
        </div>
      </section>

      <BookingsTable
        bookings={visible}
        onBookingClick={(booking) =>
          openPanel({
            title: `Booking #${booking.bookingId}`,
            body: `${booking.name} (${booking.contact}) is ${booking.status} on ${booking.date} at ${booking.time}. Reason: ${booking.reason}.`,
          })
        }
        onStatusChange={async (booking, status: BookingStatus) => {
          await updateBookingStatus({ bookingId: booking.bookingId, status });
          openPanel({
            title: `Booking #${booking.bookingId} updated`,
            body: `${booking.name} is now ${status}.`,
          });
        }}
      />

      <NewBookingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={createBooking}
        onCreated={(booking) =>
          openPanel({
            title: `Booking #${booking.bookingId} saved`,
            body: `${booking.name} is requested for ${booking.date} at ${booking.time}.`,
          })
        }
      />
    </div>
  );
}
