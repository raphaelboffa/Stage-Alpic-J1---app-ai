import "@/index.css";

import { useState } from "react";
import { useCallTool, useToolInfo } from "../helpers.js";
import { useLayout, useViewState } from "skybridge/web";
import {
  Calendar,
  MapPin,
  Car,
  ArrowLeft,
  XCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

type Reservation = {
  id: string;
  car: { id: string; brand: string; model: string; category: string };
  pickup_date: string;
  return_date: string;
  city: string;
  total_price: number;
  status: "confirmed" | "cancelled";
};

type Screen = "list" | "detail";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isUpcoming(date: string) {
  return new Date(date) >= new Date();
}

export default function MyReservations() {
  const { output, isPending, responseMetadata } = useToolInfo<"my-reservations">();
  const {
    callTool: cancelTool,
    isPending: isCancelling,
  } = useCallTool("cancel-reservation");
  const { theme } = useLayout();

  const [{ selectedId }, setViewState] = useViewState<{ selectedId: string | null }>({
    selectedId: null,
  });
  const [screen, setScreen] = useState<Screen>("list");
  const [justCancelledId, setJustCancelledId] = useState<string | null>(null);

  const isDark = theme === "dark";
  const base = `${isDark ? "dark" : ""} w-full bg-background text-foreground`;

  if (isPending) {
    return (
      <div className={`${base} flex items-center justify-center p-10`}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Car className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  const reservations: Reservation[] = output?.reservations ?? [];
  const images = (responseMetadata as { images?: Record<string, string> })?.images ?? {};

  const selected = reservations.find((r) => r.id === selectedId);

  // Detail screen
  if (screen === "detail" && selected) {
    const img = images[selected.car.id];
    const upcoming = isUpcoming(selected.pickup_date);
    const isCancelledRes = selected.status === "cancelled" || justCancelledId === selected.id;

    return (
      <div
        className={`${base}`}
        data-llm={`L'utilisateur consulte la réservation ${selected.id} : ${selected.car.brand} ${selected.car.model} à ${selected.city}, ${selected.pickup_date} → ${selected.return_date}, statut: ${selected.status}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button
            onClick={() => {
              setScreen("list");
              setViewState((prev) => ({ ...prev, selectedId: null }));
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Mes réservations
          </button>
        </div>

        <div className="p-5 space-y-5 mx-auto max-w-lg">
          {/* Car image */}
          {img && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-muted">
              <img
                src={img}
                alt={`${selected.car.brand} ${selected.car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title + status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {selected.car.brand} {selected.car.model}
              </h2>
              <p className="text-sm text-muted-foreground">{selected.car.category}</p>
            </div>
            <StatusBadge status={isCancelledRes ? "cancelled" : selected.status} />
          </div>

          {/* Details */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{selected.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>
                {formatDate(selected.pickup_date)} → {formatDate(selected.return_date)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Total payé</span>
              <span className="font-bold text-lg">{selected.total_price}€</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Ref : <span className="font-mono font-medium">{selected.id}</span>
            </div>
          </div>

          {/* Cancellation */}
          {!isCancelledRes && upcoming && (
            <button
              onClick={() => {
                cancelTool({ reservation_id: selected.id });
                setJustCancelledId(selected.id);
              }}
              disabled={isCancelling}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/50 text-destructive py-3 px-4 text-sm font-medium hover:bg-destructive/10 disabled:opacity-50 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              {isCancelling ? "Annulation…" : "Annuler cette réservation"}
            </button>
          )}

          {isCancelledRes && (
            <div className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>Réservation annulée avec succès.</span>
            </div>
          )}

          {!upcoming && !isCancelledRes && (
            <div className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Cette réservation est passée et ne peut plus être annulée.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List screen
  return (
    <div
      className={`${base}`}
      data-llm={`${reservations.length} réservation(s) au total. ${reservations.filter((r) => r.status === "confirmed").length} confirmée(s).`}
    >
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-base">Mes réservations</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {reservations.length === 0
            ? "Aucune réservation"
            : `${reservations.length} réservation${reservations.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
          <Car className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            Aucune réservation pour le moment.
          </p>
          <p className="text-xs text-muted-foreground">
            Demandez-moi de chercher une voiture disponible !
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {reservations.map((res) => {
            const img = images[res.car.id];
            const upcoming = isUpcoming(res.pickup_date);
            return (
              <button
                key={res.id}
                onClick={() => {
                  setViewState((prev) => ({ ...prev, selectedId: res.id }));
                  setScreen("detail");
                }}
                className="w-full text-left rounded-2xl border border-border hover:border-primary/50 overflow-hidden transition-all hover:shadow-sm flex"
              >
                {img && (
                  <div className="w-24 shrink-0 bg-muted overflow-hidden">
                    <img
                      src={img}
                      alt={`${res.car.brand} ${res.car.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm truncate">
                      {res.car.brand} {res.car.model}
                    </p>
                    <StatusBadge status={res.status} compact />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{res.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>
                      {formatDate(res.pickup_date)} → {formatDate(res.return_date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {res.id}
                    </span>
                    <span className="font-semibold text-sm">{res.total_price}€</span>
                  </div>
                </div>
                {!upcoming && res.status === "confirmed" && (
                  <div className="self-stretch flex items-center px-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  compact = false,
}: {
  status: "confirmed" | "cancelled";
  compact?: boolean;
}) {
  if (status === "cancelled") {
    return (
      <span
        className={`flex items-center gap-1 text-xs font-medium rounded-full shrink-0 ${compact ? "px-2 py-0.5" : "px-3 py-1"} bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`}
      >
        <XCircle className="h-3 w-3" />
        {!compact && "Annulée"}
      </span>
    );
  }
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium rounded-full shrink-0 ${compact ? "px-2 py-0.5" : "px-3 py-1"} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300`}
    >
      <CheckCircle2 className="h-3 w-3" />
      {!compact && "Confirmée"}
    </span>
  );
}
