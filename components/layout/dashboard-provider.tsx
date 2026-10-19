"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { createContext, useCallback, useContext, useState } from "react";

import { api } from "@/convex/_generated/api";
import { getTicketInsights, summarizeRevenue } from "@/lib/demo-data";
import type {
  BookingFilter,
  BookingInput,
  BookingRecord,
  BookingStatus,
  InfoPanelState,
  RevenueRange,
  RevenueResult,
  TicketFilter,
  TicketInsights,
  TicketRecord,
  TicketStatus,
  TicketTeam,
} from "@/lib/types";

type DashboardContextValue = {
  range: RevenueRange;
  setRange: (range: RevenueRange) => void;
  ticketFilter: TicketFilter;
  setTicketFilter: (filter: TicketFilter) => void;
  // True until the first live result arrives from Convex.
  loading: boolean;
  tickets: TicketRecord[];
  ticketInsights: TicketInsights;
  getRevenue: (range: RevenueRange) => RevenueResult;
  createTicket: (input: {
    subject: string;
    team: TicketTeam;
  }) => Promise<TicketRecord>;
  updateTicketStatus: (input: {
    ticketId: number;
    status: TicketStatus;
  }) => Promise<TicketRecord>;
  // Data is live, so this only exists for the Refresh button and Malitos's tool.
  refreshTickets: () => Promise<void>;
  bookingFilter: BookingFilter;
  setBookingFilter: (filter: BookingFilter) => void;
  bookings: BookingRecord[];
  createBooking: (input: BookingInput) => Promise<BookingRecord>;
  updateBookingStatus: (input: {
    bookingId: number;
    status: BookingStatus;
  }) => Promise<BookingRecord>;
  refreshBookings: () => Promise<void>;
  panel: InfoPanelState | null;
  openPanel: (panel: InfoPanelState) => void;
  closePanel: () => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [range, setRange] = useState<RevenueRange>("90d");
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>("all");
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [panel, setPanel] = useState<InfoPanelState | null>(null);

  // Live subscriptions: any change in Convex — from this tab, another user,
  // or Malitos — re-renders the dashboard immediately.
  const { isAuthenticated } = useConvexAuth();
  const liveTickets = useQuery(api.tickets.listLive, isAuthenticated ? {} : "skip");
  const liveRevenue = useQuery(api.revenue.listLive, isAuthenticated ? {} : "skip");
  const liveBookings = useQuery(api.bookings.listLive, isAuthenticated ? {} : "skip");
  const createLive = useMutation(api.tickets.createLive);
  const updateStatusLive = useMutation(api.tickets.updateStatusLive);
  const createBookingLive = useMutation(api.bookings.createLive);
  const updateBookingStatusLive = useMutation(api.bookings.updateStatusLive);

  const tickets = liveTickets ?? EMPTY;
  const bookings = liveBookings ?? EMPTY_BOOKINGS;
  const ticketInsights = getTicketInsights(tickets);
  const getRevenue = useCallback(
    (selected: RevenueRange) => summarizeRevenue(liveRevenue ?? [], selected),
    [liveRevenue],
  );

  const createTicket = useCallback(
    (input: { subject: string; team: TicketTeam }) => createLive(input),
    [createLive],
  );
  const updateTicketStatus = useCallback(
    (input: { ticketId: number; status: TicketStatus }) =>
      updateStatusLive(input),
    [updateStatusLive],
  );
  const refreshTickets = useCallback(async () => {}, []);
  const createBooking = useCallback(
    (input: BookingInput) => createBookingLive(input),
    [createBookingLive],
  );
  const updateBookingStatus = useCallback(
    (input: { bookingId: number; status: BookingStatus }) =>
      updateBookingStatusLive(input),
    [updateBookingStatusLive],
  );
  const refreshBookings = useCallback(async () => {}, []);

  return (
    <DashboardContext.Provider
      value={{
        range,
        setRange,
        ticketFilter,
        setTicketFilter,
        loading:
          liveTickets === undefined ||
          liveRevenue === undefined ||
          liveBookings === undefined,
        tickets,
        ticketInsights,
        getRevenue,
        createTicket,
        updateTicketStatus,
        refreshTickets,
        bookingFilter,
        setBookingFilter,
        bookings,
        createBooking,
        updateBookingStatus,
        refreshBookings,
        panel,
        openPanel: setPanel,
        closePanel: () => setPanel(null),
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

const EMPTY: TicketRecord[] = [];
const EMPTY_BOOKINGS: BookingRecord[] = [];

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider.");
  }
  return context;
}
