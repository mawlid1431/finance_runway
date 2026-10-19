export type RevenueRange = "7d" | "30d" | "90d";
export type TicketFilter = "all" | "open" | "billing";
export type TicketStatus = "open" | "closed";
export type TicketTeam = "Billing" | "Support" | "Product";
export type BookingStatus = "requested" | "confirmed" | "cancelled";
export type BookingFilter = "all" | "requested" | "confirmed";

export interface RevenuePoint {
  date: string;
  amount: number;
  refunded: boolean;
}

export interface RevenueSummaryPoint {
  date: string;
  amount: number;
}

export interface RevenueResult {
  total: number;
  changePct: number;
  dailyAverage: number;
  peakDay: RevenueSummaryPoint | null;
  refundCount: number;
  dip: RevenuePoint | null;
  series: RevenuePoint[];
}

export interface BookingRecord {
  bookingId: number;
  name: string;
  contact: string;
  date: string;
  time: string;
  reason: string;
  status: BookingStatus;
  createdAt: number;
}

export interface BookingInput {
  name: string;
  contact: string;
  date: string;
  time: string;
  reason: string;
}

export interface TicketRecord {
  ticketId: number;
  subject: string;
  team: TicketTeam;
  status: TicketStatus;
  createdAt: number;
}

export interface TicketTeamCount {
  team: TicketTeam;
  count: number;
}

export interface TicketInsights {
  total: number;
  open: number;
  closed: number;
  byTeam: TicketTeamCount[];
  topTeam: TicketTeamCount | null;
  latestTicket: TicketRecord | null;
}

export interface InfoPanelState {
  title: string;
  body: string;
}
