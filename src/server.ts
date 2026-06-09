import { McpServer } from "skybridge/server";
import { z } from "zod";

// ── Mock data ──────────────────────────────────────────────────────────────────

const CARS = [
  {
    id: "car-1",
    brand: "Renault",
    model: "Clio",
    category: "Citadine",
    pricePerDay: 45,
    seats: 5,
    transmission: "Manuelle",
    fuel: "Essence",
    features: ["Bluetooth", "Climatisation", "GPS"],
  },
  {
    id: "car-2",
    brand: "Peugeot",
    model: "308",
    category: "Berline",
    pricePerDay: 59,
    seats: 5,
    transmission: "Automatique",
    fuel: "Diesel",
    features: ["Bluetooth", "Climatisation", "GPS", "Caméra de recul"],
  },
  {
    id: "car-3",
    brand: "Volkswagen",
    model: "T-Roc",
    category: "SUV",
    pricePerDay: 79,
    seats: 5,
    transmission: "Automatique",
    fuel: "Essence",
    features: ["Bluetooth", "Climatisation", "GPS", "Toit panoramique", "AWD"],
  },
  {
    id: "car-4",
    brand: "Toyota",
    model: "Yaris",
    category: "Citadine",
    pricePerDay: 39,
    seats: 5,
    transmission: "Manuelle",
    fuel: "Hybride",
    features: ["Bluetooth", "Climatisation"],
  },
  {
    id: "car-5",
    brand: "BMW",
    model: "Série 3",
    category: "Berline Premium",
    pricePerDay: 99,
    seats: 5,
    transmission: "Automatique",
    fuel: "Diesel",
    features: ["Bluetooth", "Climatisation", "GPS", "Sièges chauffants", "Caméra 360°"],
  },
  {
    id: "car-6",
    brand: "Citroën",
    model: "Berlingo",
    category: "Monospace",
    pricePerDay: 65,
    seats: 7,
    transmission: "Manuelle",
    fuel: "Diesel",
    features: ["Bluetooth", "Climatisation", "Grande capacité de chargement"],
  },
];

const CAR_IMAGES: Record<string, string> = {
  "car-1": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop",
  "car-2": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop",
  "car-3": "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&auto=format&fit=crop",
  "car-4": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop",
  "car-5": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop",
  "car-6": "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop",
};

// ── Resale fleet ───────────────────────────────────────────────────────────────

const RESALE_VEHICLES = [
  {
    id: "sale-1",
    brand: "Renault",
    model: "Clio",
    category: "Citadine",
    year: 2021,
    mileage: 42000,
    fuel: "Essence",
    transmission: "Manuelle",
    price: 9900,
    color: "Gris Platine",
    rentalHistory: "3 ans en flotte, entretien complet effectué",
    features: ["Bluetooth", "Climatisation", "Régulateur de vitesse"],
  },
  {
    id: "sale-2",
    brand: "Peugeot",
    model: "2008",
    category: "SUV",
    year: 2022,
    mileage: 31500,
    fuel: "Hybride",
    transmission: "Automatique",
    price: 19500,
    color: "Blanc Nacré",
    rentalHistory: "2 ans en flotte, 1 propriétaire",
    features: ["Bluetooth", "Climatisation", "GPS", "Caméra de recul", "Chargeur sans fil"],
  },
  {
    id: "sale-3",
    brand: "Volkswagen",
    model: "Golf",
    category: "Berline",
    year: 2020,
    mileage: 67000,
    fuel: "Diesel",
    transmission: "Manuelle",
    price: 14200,
    color: "Bleu Horizon",
    rentalHistory: "4 ans en flotte, carnet d'entretien complet",
    features: ["Bluetooth", "Climatisation", "GPS"],
  },
  {
    id: "sale-4",
    brand: "Toyota",
    model: "C-HR",
    category: "SUV",
    year: 2023,
    mileage: 18000,
    fuel: "Hybride",
    transmission: "Automatique",
    price: 24900,
    color: "Rouge Intense",
    rentalHistory: "1 an en flotte, comme neuf",
    features: ["Bluetooth", "Climatisation", "GPS", "Lane assist", "Caméra 360°"],
  },
  {
    id: "sale-5",
    brand: "Mercedes",
    model: "Classe A",
    category: "Berline Premium",
    year: 2021,
    mileage: 38000,
    fuel: "Essence",
    transmission: "Automatique",
    price: 27500,
    color: "Noir Obsidienne",
    rentalHistory: "3 ans en flotte premium, entretien Mercedes",
    features: ["Bluetooth", "Climatisation", "GPS", "Sièges chauffants", "MBUX", "Caméra 360°"],
  },
  {
    id: "sale-6",
    brand: "Ford",
    model: "Transit Custom",
    category: "Utilitaire",
    year: 2020,
    mileage: 89000,
    fuel: "Diesel",
    transmission: "Manuelle",
    price: 18900,
    color: "Blanc Arctic",
    rentalHistory: "5 ans en flotte utilitaire, révisé",
    features: ["Bluetooth", "Climatisation", "Attelage", "Grande capacité"],
  },
];

const RESALE_IMAGES: Record<string, string> = {
  "sale-1": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop",
  "sale-2": "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&auto=format&fit=crop",
  "sale-3": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop",
  "sale-4": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop",
  "sale-5": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop",
  "sale-6": "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop",
};

const purchasesStore = new Map<string, { id: string; vehicle: (typeof RESALE_VEHICLES)[number]; price: number; created_at: string }>();
let purchaseCounter = 2000;

function generatePurchaseId(): string {
  return `ACH-${++purchaseCounter}`;
}

// ── In-memory reservations store ───────────────────────────────────────────────

interface Reservation {
  id: string;
  car: (typeof CARS)[number];
  pickup_date: string;
  return_date: string;
  city: string;
  total_price: number;
  status: "confirmed" | "cancelled";
  created_at: string;
}

const reservationsStore = new Map<string, Reservation>();
let counter = 1000;

function calculateDays(pickup: string, returnDate: string): number {
  const a = new Date(pickup);
  const b = new Date(returnDate);
  const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

function generateId(): string {
  return `RES-${++counter}`;
}

// ── MCP Server ─────────────────────────────────────────────────────────────────

const server = new McpServer(
  { name: "car-rental", version: "1.0.0" },
  { capabilities: {} },
)
  .registerTool(
    {
      name: "search-cars",
      description:
        "Search for available rental cars. Call this when the user wants to find, browse, or compare cars for a specific city and date range.",
      inputSchema: {
        pickup_date: z
          .string()
          .date()
          .describe("Pickup date in YYYY-MM-DD format"),
        return_date: z
          .string()
          .date()
          .describe("Return date in YYYY-MM-DD format"),
        city: z.string().min(1).describe("Pickup city"),
        vehicle_type: z
          .string()
          .optional()
          .describe(
            "Optional vehicle type filter: citadine, berline, SUV, monospace, premium",
          ),
      },
      outputSchema: {
        city: z.string(),
        pickup_date: z.string(),
        return_date: z.string(),
        days: z.number(),
        cars: z.array(
          z.object({
            id: z.string(),
            brand: z.string(),
            model: z.string(),
            category: z.string(),
            pricePerDay: z.number(),
            totalPrice: z.number(),
            seats: z.number(),
            transmission: z.string(),
            fuel: z.string(),
          }),
        ),
      },
      annotations: {
        title: "Rechercher des voitures disponibles",
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Recherche des voitures disponibles…",
        "openai/toolInvocation/invoked": "Voitures trouvées.",
      },
      view: {
        component: "search-cars",
        domain: "https://skybridge.tech",
        description: "Résultats de recherche de voitures",
        csp: {
          resourceDomains: [
            "https://images.unsplash.com",
            "https://fonts.googleapis.com",
            "https://fonts.gstatic.com",
          ],
        },
      },
    },
    async ({ pickup_date, return_date, city, vehicle_type }) => {
      if (new Date(return_date) <= new Date(pickup_date)) {
        return {
          structuredContent: {
            city,
            pickup_date,
            return_date,
            days: 0,
            cars: [],
          },
          content: [
            {
              type: "text",
              text: `La date de retour (${return_date}) doit être postérieure à la date de départ (${pickup_date}).`,
            },
          ],
          isError: true,
        };
      }

      let filtered = CARS;
      if (vehicle_type) {
        const term = vehicle_type.toLowerCase();
        filtered = CARS.filter(
          (c) =>
            c.category.toLowerCase().includes(term) ||
            c.model.toLowerCase().includes(term) ||
            c.brand.toLowerCase().includes(term),
        );
        if (filtered.length === 0) filtered = CARS;
      }

      const days = calculateDays(pickup_date, return_date);

      const structuredContent = {
        city,
        pickup_date,
        return_date,
        days,
        cars: filtered.map(({ id, brand, model, category, pricePerDay, seats, transmission, fuel }) => ({
          id,
          brand,
          model,
          category,
          pricePerDay,
          totalPrice: pricePerDay * days,
          seats,
          transmission,
          fuel,
        })),
      };

      const _meta = {
        images: Object.fromEntries(
          filtered.map((c) => [c.id, CAR_IMAGES[c.id]]),
        ),
        features: Object.fromEntries(filtered.map((c) => [c.id, c.features])),
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: `${filtered.length} voiture(s) disponible(s) à ${city} du ${pickup_date} au ${return_date} (${days} jour${days > 1 ? "s" : ""}).`,
          },
        ],
        _meta,
      };
    },
  )
  .registerTool(
    {
      name: "book-car",
      description: "Confirm a car rental reservation.",
      inputSchema: {
        car_id: z.string().min(1).describe("The car ID to book"),
        pickup_date: z
          .string()
          .date()
          .describe("Pickup date in YYYY-MM-DD format"),
        return_date: z
          .string()
          .date()
          .describe("Return date in YYYY-MM-DD format"),
        city: z.string().min(1).describe("Pickup city"),
      },
      outputSchema: {
        reservation_id: z.string(),
        car: z.object({
          id: z.string(),
          brand: z.string(),
          model: z.string(),
          category: z.string(),
        }),
        pickup_date: z.string(),
        return_date: z.string(),
        city: z.string(),
        days: z.number(),
        total_price: z.number(),
        status: z.literal("confirmed"),
      },
      annotations: {
        title: "Réserver la voiture",
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Confirmation de la réservation…",
        "openai/toolInvocation/invoked": "Réservation confirmée.",
      },
    },
    async ({ car_id, pickup_date, return_date, city }) => {
      if (new Date(return_date) <= new Date(pickup_date)) {
        return {
          structuredContent: {
            reservation_id: "",
            car: { id: "", brand: "", model: "", category: "" },
            pickup_date,
            return_date,
            city,
            days: 0,
            total_price: 0,
            status: "confirmed" as const,
          },
          content: [
            {
              type: "text",
              text: `La date de retour (${return_date}) doit être postérieure à la date de départ (${pickup_date}).`,
            },
          ],
          isError: true,
        };
      }

      const car = CARS.find((c) => c.id === car_id);
      if (!car) {
        return {
          structuredContent: { error: "Voiture introuvable." },
          content: [{ type: "text", text: "Erreur : voiture introuvable." }],
          isError: true,
        };
      }

      const days = calculateDays(pickup_date, return_date);
      const total_price = car.pricePerDay * days;
      const reservation: Reservation = {
        id: generateId(),
        car,
        pickup_date,
        return_date,
        city,
        total_price,
        status: "confirmed",
        created_at: new Date().toISOString(),
      };

      reservationsStore.set(reservation.id, reservation);

      return {
        structuredContent: {
          reservation_id: reservation.id,
          car: { id: car.id, brand: car.brand, model: car.model, category: car.category },
          pickup_date,
          return_date,
          city,
          days,
          total_price,
          status: "confirmed",
        },
        content: [
          {
            type: "text",
            text: `Réservation ${reservation.id} confirmée : ${car.brand} ${car.model} à ${city} du ${pickup_date} au ${return_date}. Total : ${total_price}€.`,
          },
        ],
      };
    },
  )
  .registerTool(
    {
      name: "my-reservations",
      description:
        "Show the user's rental reservations. Call this when the user wants to see, manage or review their bookings.",
      inputSchema: {},
      outputSchema: {
        count: z.number(),
        reservations: z.array(
          z.object({
            id: z.string(),
            car: z.object({
              id: z.string(),
              brand: z.string(),
              model: z.string(),
              category: z.string(),
            }),
            pickup_date: z.string(),
            return_date: z.string(),
            city: z.string(),
            total_price: z.number(),
            status: z.enum(["confirmed", "cancelled"]),
          }),
        ),
      },
      annotations: {
        title: "Mes réservations",
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Chargement des réservations…",
        "openai/toolInvocation/invoked": "Réservations chargées.",
      },
      view: {
        component: "my-reservations",
        domain: "https://skybridge.tech",
        description: "Mes réservations de voitures",
        csp: {
          resourceDomains: [
            "https://images.unsplash.com",
            "https://fonts.googleapis.com",
            "https://fonts.gstatic.com",
          ],
        },
      },
    },
    async () => {
      const reservations = Array.from(reservationsStore.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      const structuredContent = {
        count: reservations.length,
        reservations: reservations.map(({ id, car, pickup_date, return_date, city, total_price, status }) => ({
          id,
          car: { id: car.id, brand: car.brand, model: car.model, category: car.category },
          pickup_date,
          return_date,
          city,
          total_price,
          status,
        })),
      };

      const _meta = {
        images: Object.fromEntries(
          reservations.map((r) => [r.car.id, CAR_IMAGES[r.car.id]]),
        ),
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text:
              reservations.length === 0
                ? "Aucune réservation pour le moment."
                : `${reservations.length} réservation(s) trouvée(s).`,
          },
        ],
        _meta,
      };
    },
  )
  .registerTool(
    {
      name: "cancel-reservation",
      description: "Cancel a car rental reservation by ID.",
      inputSchema: {
        reservation_id: z.string().describe("The reservation ID to cancel"),
      },
      outputSchema: {
        success: z.boolean(),
        reservation_id: z.string(),
      },
      annotations: {
        title: "Annuler une réservation",
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Annulation en cours…",
        "openai/toolInvocation/invoked": "Réservation annulée.",
      },
    },
    async ({ reservation_id }) => {
      const reservation = reservationsStore.get(reservation_id);
      if (!reservation) {
        return {
          structuredContent: { success: false, error: "Réservation introuvable." },
          content: [{ type: "text", text: "Réservation introuvable." }],
          isError: true,
        };
      }

      reservation.status = "cancelled";
      reservationsStore.set(reservation_id, reservation);

      return {
        structuredContent: { success: true, reservation_id },
        content: [
          {
            type: "text",
            text: `Réservation ${reservation_id} annulée avec succès.`,
          },
        ],
      };
    },
  )
  .registerTool(
    {
      name: "browse-resale",
      description:
        "Browse vehicles available for purchase from the rental fleet. Call this when the user wants to buy a used car, see available vehicles for sale, or explore the resale catalog.",
      inputSchema: {
        budget_max: z
          .number()
          .positive()
          .optional()
          .describe("Maximum budget in euros"),
        category: z
          .string()
          .optional()
          .describe("Vehicle category: citadine, berline, SUV, utilitaire, premium"),
        fuel: z
          .string()
          .optional()
          .describe("Fuel type: essence, diesel, hybride, électrique"),
        km_max: z
          .number()
          .positive()
          .optional()
          .describe("Maximum mileage in km"),
      },
      outputSchema: {
        total: z.number(),
        vehicles: z.array(
          z.object({
            id: z.string(),
            brand: z.string(),
            model: z.string(),
            category: z.string(),
            year: z.number(),
            mileage: z.number(),
            fuel: z.string(),
            transmission: z.string(),
            price: z.number(),
            color: z.string(),
            rentalHistory: z.string(),
          }),
        ),
      },
      annotations: {
        title: "Véhicules disponibles à la vente",
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Recherche des véhicules disponibles…",
        "openai/toolInvocation/invoked": "Catalogue chargé.",
      },
      view: {
        component: "browse-resale",
        domain: "https://skybridge.tech",
        description: "Véhicules de la flotte disponibles à la vente",
        csp: {
          resourceDomains: [
            "https://images.unsplash.com",
            "https://fonts.googleapis.com",
            "https://fonts.gstatic.com",
          ],
        },
      },
    },
    async ({ budget_max, category, fuel, km_max }) => {
      let filtered = RESALE_VEHICLES;

      if (budget_max) {
        filtered = filtered.filter((v) => v.price <= budget_max);
      }
      if (category) {
        const term = category.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.category.toLowerCase().includes(term) ||
            v.model.toLowerCase().includes(term),
        );
        if (filtered.length === 0) filtered = RESALE_VEHICLES;
      }
      if (fuel) {
        const term = fuel.toLowerCase();
        filtered = filtered.filter((v) =>
          v.fuel.toLowerCase().includes(term),
        );
        if (filtered.length === 0) filtered = RESALE_VEHICLES;
      }
      if (km_max) {
        filtered = filtered.filter((v) => v.mileage <= km_max);
      }

      const structuredContent = {
        total: filtered.length,
        vehicles: filtered.map(
          ({ id, brand, model, category, year, mileage, fuel, transmission, price, color, rentalHistory }) => ({
            id, brand, model, category, year, mileage, fuel, transmission, price, color, rentalHistory,
          }),
        ),
      };

      const _meta = {
        images: Object.fromEntries(filtered.map((v) => [v.id, RESALE_IMAGES[v.id]])),
        features: Object.fromEntries(filtered.map((v) => [v.id, v.features])),
      };

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: `${filtered.length} véhicule(s) disponible(s) à la vente.`,
          },
        ],
        _meta,
      };
    },
  )
  .registerTool(
    {
      name: "buy-vehicle",
      description: "Confirm the purchase of a resale vehicle from the fleet.",
      inputSchema: {
        vehicle_id: z.string().min(1).describe("The resale vehicle ID to purchase"),
      },
      outputSchema: {
        purchase_id: z.string(),
        vehicle: z.object({
          id: z.string(),
          brand: z.string(),
          model: z.string(),
          category: z.string(),
          year: z.number(),
          mileage: z.number(),
          price: z.number(),
        }),
        price: z.number(),
        status: z.literal("confirmed"),
      },
      annotations: {
        title: "Confirmer l'achat",
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        "openai/toolInvocation/invoking": "Confirmation de l'achat…",
        "openai/toolInvocation/invoked": "Achat confirmé.",
      },
    },
    async ({ vehicle_id }) => {
      const vehicle = RESALE_VEHICLES.find((v) => v.id === vehicle_id);
      if (!vehicle) {
        return {
          structuredContent: {
            purchase_id: "",
            vehicle: { id: "", brand: "", model: "", category: "", year: 0, mileage: 0, price: 0 },
            price: 0,
            status: "confirmed" as const,
          },
          content: [{ type: "text", text: "Véhicule introuvable." }],
          isError: true,
        };
      }

      const purchase = {
        id: generatePurchaseId(),
        vehicle,
        price: vehicle.price,
        created_at: new Date().toISOString(),
      };
      purchasesStore.set(purchase.id, purchase);

      return {
        structuredContent: {
          purchase_id: purchase.id,
          vehicle: {
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            category: vehicle.category,
            year: vehicle.year,
            mileage: vehicle.mileage,
            price: vehicle.price,
          },
          price: vehicle.price,
          status: "confirmed" as const,
        },
        content: [
          {
            type: "text",
            text: `Achat ${purchase.id} confirmé : ${vehicle.brand} ${vehicle.model} ${vehicle.year} pour ${vehicle.price.toLocaleString("fr-FR")}€.`,
          },
        ],
      };
    },
  );

export default await server.run();
export type AppType = typeof server;
