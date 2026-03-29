export const BASE_URL = "https://rcbscaleapi.ticketgenie.in";
export const VENUE_CODE = 1;
export const TICKET_QTY = 2;

export const STANDS = {
  E_STAND: { name: "E Stand", code: 13 },
  BOAT_C: { name: "Boat C Stand", code: 12 },
  PUMA_SHANTA_B: { name: "Puma Shanta B Stand", code: 11 },
  CONFIRMTKT_H_UPPER: { name: "ConfirmTKT H Upper", code: 9 },
  SUN_PHARMA_A: { name: "Sun Pharma A Stand", code: 14 },
};

export const STAND_BATCHES = [
  [STANDS.E_STAND, STANDS.BOAT_C],
  [STANDS.PUMA_SHANTA_B],
  [STANDS.CONFIRMTKT_H_UPPER],
  [STANDS.SUN_PHARMA_A],
];
