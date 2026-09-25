// Dispatch console mock data. No `trips`/`bookings` tables exist yet
// (everything through Phase 6 passes booking data via URL params) — this
// stands in until that real schema exists. See spec §Phase 7 for the plan.

export type TripOpsStatus =
  | "scheduled"
  | "boarding"
  | "in_transit"
  | "delayed"
  | "arrived"
  | "cancelled";

export type OpsTrip = {
  id: string;
  reference: string;
  destinationSlug: string;
  busPlate: string;
  driverName: string;
  driverPhone: string;
  departure: string; // display time
  seatsBooked: number;
  seatsTotal: number;
  status: TripOpsStatus;
  progressPercent: number; // for in-transit map placement
  note?: string;
};

export const OPS_TRIPS: OpsTrip[] = [
  {
    id: "t1",
    reference: "KJ-2609-B34",
    destinationSlug: "lekki",
    busPlate: "LND-284-KJ",
    driverName: "Emeka Obi",
    driverPhone: "+2348012345678",
    departure: "9:52 AM",
    seatsBooked: 22,
    seatsTotal: 24,
    status: "in_transit",
    progressPercent: 45,
  },
  {
    id: "t2",
    reference: "KJ-2609-C11",
    destinationSlug: "surulere",
    busPlate: "LND-119-KJ",
    driverName: "Tunde Bakare",
    driverPhone: "+2348023456789",
    departure: "10:00 AM",
    seatsBooked: 18,
    seatsTotal: 24,
    status: "in_transit",
    progressPercent: 22,
  },
  {
    id: "t3",
    reference: "KJ-2609-A02",
    destinationSlug: "ajah",
    busPlate: "LND-077-KJ",
    driverName: "Musa Ibrahim",
    driverPhone: "+2348034567890",
    departure: "9:30 AM",
    seatsBooked: 24,
    seatsTotal: 24,
    status: "delayed",
    progressPercent: 5,
    note: "Traffic on Lekki-Epe Expressway — holding at gate",
  },
  {
    id: "t4",
    reference: "KJ-2609-D08",
    destinationSlug: "maryland",
    busPlate: "LND-204-KJ",
    driverName: "Ifeoma Chukwu",
    driverPhone: "+2348045678901",
    departure: "2:00 PM",
    seatsBooked: 11,
    seatsTotal: 24,
    status: "boarding",
    progressPercent: 0,
  },
  {
    id: "t5",
    reference: "KJ-2609-F21",
    destinationSlug: "festac",
    busPlate: "LND-284-KJ",
    driverName: "Emeka Obi",
    driverPhone: "+2348012345678",
    departure: "7:00 AM",
    seatsBooked: 20,
    seatsTotal: 24,
    status: "arrived",
    progressPercent: 100,
  },
];

export const NEXT_STATUS: Record<TripOpsStatus, TripOpsStatus | null> = {
  scheduled: "boarding",
  boarding: "in_transit",
  in_transit: "arrived",
  delayed: "in_transit",
  arrived: null,
  cancelled: null,
};

export const STATUS_LABEL: Record<TripOpsStatus, string> = {
  scheduled: "Scheduled",
  boarding: "Boarding",
  in_transit: "In transit",
  delayed: "Delayed",
  arrived: "Arrived",
  cancelled: "Cancelled",
};

export const OPS_STATS = {
  activeTrips: OPS_TRIPS.filter((t) => t.status === "in_transit" || t.status === "delayed").length,
  seatsBookedToday: 187,
  revenueTodayNaira: 612400,
  openTickets: 3,
};
