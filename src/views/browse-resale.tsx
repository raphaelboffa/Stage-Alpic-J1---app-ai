import "@/index.css";

import { useState } from "react";
import { useCallTool, useToolInfo } from "../helpers.js";
import { useDisplayMode, useLayout, useViewState } from "skybridge/web";
import {
  Car,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Fuel,
  Settings2,
  Gauge,
  Calendar,
  Tag,
  Star,
  Zap,
  PackageCheck,
} from "lucide-react";

type ResaleVehicle = {
  id: string;
  brand: string;
  model: string;
  category: string;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  price: number;
  color: string;
  rentalHistory: string;
};

type Screen = "list" | "detail" | "confirmed";

const CATEGORY_COLORS: Record<string, string> = {
  Citadine: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Berline: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  SUV: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Berline Premium": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Utilitaire: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function formatPrice(p: number) {
  return p.toLocaleString("fr-FR") + " €";
}

function formatMileage(km: number) {
  return km.toLocaleString("fr-FR") + " km";
}

export default function BrowseResale() {
  const { output, isPending, responseMetadata } = useToolInfo<"browse-resale">();
  const {
    callTool: buyTool,
    data: buyData,
    isPending: isBuying,
    isSuccess: isBought,
  } = useCallTool("buy-vehicle");
  const { theme } = useLayout();
  const [displayMode, setDisplayMode] = useDisplayMode();
  const isFullscreen = displayMode === "fullscreen";

  const [{ selectedId }, setViewState] = useViewState<{ selectedId: string | null }>({
    selectedId: null,
  });
  const [screen, setScreen] = useState<Screen>("list");

  const isDark = theme === "dark";
  const base = `${isDark ? "dark" : ""} w-full bg-background text-foreground`;

  if (isPending) {
    return (
      <div className={`${base} flex items-center justify-center p-10`}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Car className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Chargement du catalogue…</p>
        </div>
      </div>
    );
  }

  const vehicles: ResaleVehicle[] = output?.vehicles ?? [];
  const images = (responseMetadata as { images?: Record<string, string> })?.images ?? {};
  const features = (responseMetadata as { features?: Record<string, string[]> })?.features ?? {};

  const selected = vehicles.find((v) => v.id === selectedId);

  // Purchase confirmed screen
  if (isBought && buyData) {
    const res = buyData.structuredContent;
    return (
      <div
        className={`${base} p-6`}
        data-llm={`Achat confirmé : ${res.vehicle?.brand} ${res.vehicle?.model} ${res.vehicle?.year}, ${res.price?.toLocaleString("fr-FR")}€, ID: ${res.purchase_id}`}
      >
        <div className="mx-auto max-w-lg flex flex-col items-center gap-6 text-center">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-4">
            <PackageCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Achat confirmé !</h2>
            <p className="text-muted-foreground mt-1">
              Félicitations pour votre acquisition
            </p>
          </div>
          <div className="w-full rounded-2xl border border-border bg-card p-5 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">
                {res.vehicle?.brand} {res.vehicle?.model}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {res.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Année {res.vehicle?.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 flex-shrink-0" />
                <span>{res.vehicle?.mileage?.toLocaleString("fr-FR")} km</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Prix d'achat</span>
              <span className="text-xl font-bold text-primary">
                {res.price?.toLocaleString("fr-FR")} €
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Référence : <span className="font-mono font-medium">{res.purchase_id}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Notre équipe vous contactera pour finaliser les formalités.
          </p>
        </div>
      </div>
    );
  }

  // Detail screen
  if (screen === "detail" && selected) {
    const img = images[selected.id];
    const carFeatures = features[selected.id] ?? [];

    return (
      <div
        className={`${base} ${isFullscreen ? "min-h-screen" : ""}`}
        data-llm={`L'utilisateur consulte : ${selected.brand} ${selected.model} ${selected.year}, ${formatMileage(selected.mileage)}, ${formatPrice(selected.price)}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={() => {
              setScreen("list");
              setViewState((prev) => ({ ...prev, selectedId: null }));
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Catalogue
          </button>
          <button
            onClick={() => setDisplayMode(isFullscreen ? "inline" : "fullscreen")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="p-5 space-y-5 mx-auto max-w-lg">
          {/* Image */}
          {img && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-muted">
              <img
                src={img}
                alt={`${selected.brand} ${selected.model}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {selected.brand} {selected.model}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[selected.category] ?? "bg-muted text-muted-foreground"}`}
                >
                  {selected.category}
                </span>
                <span className="text-xs text-muted-foreground">{selected.color}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{formatPrice(selected.price)}</div>
              <div className="text-xs text-muted-foreground">Prix de vente</div>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{selected.year}</span>
              <span className="text-xs text-muted-foreground">Année</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatMileage(selected.mileage)}</span>
              <span className="text-xs text-muted-foreground">Kilométrage</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center">
              {selected.fuel === "Hybride" || selected.fuel === "Électrique" ? (
                <Zap className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Fuel className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{selected.fuel}</span>
              <span className="text-xs text-muted-foreground">Carburant</span>
            </div>
          </div>

          {/* Transmission + history */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{selected.transmission}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Tag className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{selected.rentalHistory}</span>
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

          {/* Buy button */}
          <button
            onClick={() => buyTool({ vehicle_id: selected.id })}
            disabled={isBuying}
            className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 px-4 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isBuying
              ? "Traitement en cours…"
              : `Acheter pour ${formatPrice(selected.price)}`}
          </button>
        </div>
      </div>
    );
  }

  // List screen
  return (
    <div
      className={`${base} ${isFullscreen ? "min-h-screen" : ""}`}
      data-llm={`${vehicles.length} véhicule(s) disponible(s) à la vente`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold">Véhicules à vendre</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} disponible{vehicles.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setDisplayMode(isFullscreen ? "inline" : "fullscreen")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
          <Car className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">Aucun véhicule ne correspond à vos critères.</p>
        </div>
      ) : (
        <div className={`p-4 grid gap-3 ${isFullscreen ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
          {vehicles.map((v) => {
            const img = images[v.id];
            return (
              <button
                key={v.id}
                onClick={() => {
                  setViewState((prev) => ({ ...prev, selectedId: v.id }));
                  setScreen("detail");
                }}
                className="text-left rounded-2xl border border-border hover:border-primary/50 overflow-hidden transition-all hover:shadow-md"
              >
                {img && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={img}
                      alt={`${v.brand} ${v.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {v.brand} {v.model}
                      </p>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[v.category] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {v.category}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm">{formatPrice(v.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {v.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" /> {formatMileage(v.mileage)}
                    </span>
                    <span className="flex items-center gap-1">
                      {v.fuel === "Hybride" || v.fuel === "Électrique" ? (
                        <Zap className="h-3 w-3" />
                      ) : (
                        <Fuel className="h-3 w-3" />
                      )}
                      {v.fuel}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
