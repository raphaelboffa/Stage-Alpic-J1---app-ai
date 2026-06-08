import "@/index.css";

import { useState } from "react";
import { useCallTool, useToolInfo } from "../helpers.js";
import { useDisplayMode, useLayout, useViewState } from "skybridge/web";
import {
  Car,
  Calendar,
  MapPin,
  Users,
  Fuel,
  Settings2,
  CheckCircle2,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Zap,
  Star,
} from "lucide-react";

type Screen = "results" | "detail" | "confirmed";

const CATEGORY_COLORS: Record<string, string> = {
  Citadine: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Berline: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  SUV: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Berline Premium": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Monospace: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SearchCars() {
  const { input, output, isPending, responseMetadata } =
    useToolInfo<"search-cars">();
  const { callTool, data: bookData, isPending: isBooking, isSuccess: isBooked } =
    useCallTool("book-car");
  const { theme } = useLayout();
  const [displayMode, setDisplayMode] = useDisplayMode();
  const isFullscreen = displayMode === "fullscreen";

  // Persisted: LLM can see which car is selected
  const [{ selectedCarId }, setViewState] = useViewState<{
    selectedCarId: string | null;
  }>({ selectedCarId: null });

  // Ephemeral: screen navigation
  const [screen, setScreen] = useState<Screen>("results");

  const isDark = theme === "dark";
  const base = `${isDark ? "dark" : ""} w-full bg-background text-foreground`;

  if (isPending) {
    return (
      <div className={`${base} flex items-center justify-center p-10`}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Car className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Recherche en cours…</p>
        </div>
      </div>
    );
  }

  const cars = output?.cars ?? [];
  const city = output?.city ?? input?.city ?? "";
  const pickupDate = output?.pickup_date ?? input?.pickup_date ?? "";
  const returnDate = output?.return_date ?? input?.return_date ?? "";
  const days = output?.days ?? 1;
  const images = (responseMetadata as { images?: Record<string, string> })?.images ?? {};
  const features = (responseMetadata as { features?: Record<string, string[]> })?.features ?? {};

  const selectedCar = cars.find((c) => c.id === selectedCarId);

  // After booking confirmed
  if (isBooked && bookData) {
    const res = bookData.structuredContent;
    const carBrand = res.car?.brand ?? "";
    const carModel = res.car?.model ?? "";
    const resCity = res.city ?? city;
    const resPickup = res.pickup_date ?? pickupDate;
    const resReturn = res.return_date ?? returnDate;
    const resDays = res.days ?? days;
    return (
      <div
        className={`${base} ${isFullscreen ? "min-h-screen" : ""} p-6`}
        data-llm={`Réservation confirmée : ${carBrand} ${carModel}, ${resCity}, ${resPickup} → ${resReturn}, ${res.total_price}€ total, ID: ${res.reservation_id}`}
      >
        <div className="mx-auto max-w-lg flex flex-col items-center gap-6 text-center">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Réservation confirmée !</h2>
            <p className="text-muted-foreground mt-1">
              Votre voiture vous attend à {resCity}
            </p>
          </div>
          <div className="w-full rounded-2xl border border-border bg-card p-5 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">
                {carBrand} {carModel}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {res.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{resCity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  {formatDate(resPickup)} → {formatDate(resReturn)}{" "}
                  ({resDays} jour{resDays > 1 ? "s" : ""})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{res.total_price}€</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Référence : <span className="font-mono font-medium">{res.reservation_id}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Demandez-moi de voir "mes réservations" pour gérer cette location.
          </p>
        </div>
      </div>
    );
  }

  // Detail screen
  if (screen === "detail" && selectedCar) {
    const img = images[selectedCar.id];
    const carFeatures = features[selectedCar.id] ?? [];
    return (
      <div
        className={`${base} ${isFullscreen ? "min-h-screen" : ""}`}
        data-llm={`L'utilisateur consulte : ${selectedCar.brand} ${selectedCar.model} (${selectedCar.category}), ${selectedCar.pricePerDay}€/jour, total ${selectedCar.totalPrice}€ pour ${days} jour(s)`}
      >
        <div className="mx-auto max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button
              onClick={() => setScreen("results")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <button
              onClick={() => setDisplayMode(isFullscreen ? "inline" : "fullscreen")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Car image */}
            {img && (
              <div className="rounded-2xl overflow-hidden aspect-video bg-muted">
                <img
                  src={img}
                  alt={`${selectedCar.brand} ${selectedCar.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCar.brand} {selectedCar.model}
                </h2>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${CATEGORY_COLORS[selectedCar.category] ?? "bg-muted text-muted-foreground"}`}
                >
                  {selectedCar.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {selectedCar.pricePerDay}€
                </div>
                <div className="text-xs text-muted-foreground">/ jour</div>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedCar.seats}</span>
                <span className="text-xs text-muted-foreground">Places</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedCar.transmission}</span>
                <span className="text-xs text-muted-foreground">Boîte</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center">
                {selectedCar.fuel === "Hybride" ? (
                  <Zap className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{selectedCar.fuel}</span>
                <span className="text-xs text-muted-foreground">Carburant</span>
              </div>
            </div>

            {/* Features */}
            {carFeatures.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Équipements</h3>
                <div className="flex flex-wrap gap-2">
                  {carFeatures.map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-1 text-xs bg-muted rounded-full px-3 py-1"
                    >
                      <Star className="h-3 w-3 text-amber-500" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trip summary */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h3 className="text-sm font-medium">Récapitulatif du trajet</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{city}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  {formatDate(pickupDate)} → {formatDate(returnDate)} ({days} jour{days > 1 ? "s" : ""})
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCar.pricePerDay}€ × {days} jour{days > 1 ? "s" : ""}
                </span>
                <span className="font-bold text-lg">{selectedCar.totalPrice}€</span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={() =>
                callTool({
                  car_id: selectedCar.id,
                  pickup_date: pickupDate,
                  return_date: returnDate,
                  city,
                })
              }
              disabled={isBooking}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 px-4 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isBooking ? "Confirmation en cours…" : `Confirmer pour ${selectedCar.totalPrice}€`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  return (
    <div
      className={`${base} ${isFullscreen ? "min-h-screen" : ""}`}
      data-llm={`${cars.length} voiture(s) disponible(s) à ${city} du ${pickupDate} au ${returnDate} (${days} jour(s))`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold">{city}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(pickupDate)} → {formatDate(returnDate)} • {days} jour{days > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{cars.length} résultat{cars.length > 1 ? "s" : ""}</span>
          <button
            onClick={() => setDisplayMode(isFullscreen ? "inline" : "fullscreen")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Car grid */}
      <div className={`p-4 grid gap-3 ${isFullscreen ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
        {cars.map((car) => {
          const img = images[car.id];
          const isSelected = car.id === selectedCarId;
          return (
            <button
              key={car.id}
              onClick={() => {
                setViewState((prev) => ({ ...prev, selectedCarId: car.id }));
                setScreen("detail");
              }}
              className={`relative text-left rounded-2xl border overflow-hidden transition-all hover:shadow-md ${
                isSelected
                  ? "border-primary shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {img && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={img}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {car.brand} {car.model}
                    </p>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[car.category] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {car.category}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">{car.pricePerDay}€</p>
                    <p className="text-xs text-muted-foreground">/jour</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {car.seats}
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings2 className="h-3 w-3" /> {car.transmission}
                  </span>
                  <span className="flex items-center gap-1">
                    {car.fuel === "Hybride" ? (
                      <Zap className="h-3 w-3" />
                    ) : (
                      <Fuel className="h-3 w-3" />
                    )}
                    {car.fuel}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total {days}j</span>
                  <span className="text-sm font-semibold">{car.totalPrice}€</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
