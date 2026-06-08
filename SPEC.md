# App de Location de Voiture — CarRental GPT

## Value Proposition

Permettre aux clients de rechercher, comparer et réserver une voiture en langage naturel directement dans ChatGPT. Pain actuel : naviguer entre des menus et filtres sur un site web est lent et impersonnel. Ici, on décrit son besoin en une phrase et l'IA trouve les meilleures options.

**Core actions**: Rechercher une voiture disponible, comparer et réserver, gérer ses réservations.

## Why LLM?

**Conversational win**: "Une SUV pas chère pour ce week-end à Lyon" = une phrase au lieu de plusieurs écrans de filtres.
**LLM adds**: Interprétation du besoin naturel (type de véhicule, budget implicite, durée), conseils personnalisés (meilleure catégorie selon le trajet, le nombre de passagers…).
**What LLM lacks**: Inventaire véhicules, disponibilités, tarifs → fournis par le serveur (mock pour la démo).

## UI Overview

**First view**: Invite conversationnelle — l'utilisateur décrit son besoin, le LLM invoque `search_cars`.
**Browsing**: Cartes véhicule (photo, nom, catégorie, prix/jour, caractéristiques clés). L'utilisateur compare et clique sur une carte pour voir le détail et un formulaire de confirmation.
**Checkout**: Récapitulatif de la réservation (véhicule, dates, lieu, prix total) avec bouton de confirmation.
**Manage**: Vue `my_reservations` liste les réservations de l'utilisateur avec possibilité d'annuler.

## Product Context

- **Existing products**: Aucun (projet de démo)
- **API**: Mock data (pas d'API externe)
- **Auth**: OAuth (compte utilisateur) — les réservations sont liées à l'utilisateur connecté
- **Constraints**: Paiement non inclus dans cette version (confirmation seulement)

---

## UX Flows

### Rechercher & Réserver une voiture

1. L'utilisateur décrit son besoin (ville, dates, type de véhicule)
2. Le LLM invoque `search_cars` avec les paramètres extraits
3. La vue affiche les voitures disponibles sous forme de cartes
4. L'utilisateur sélectionne une voiture → fiche détail + formulaire de confirmation
5. L'utilisateur confirme → la vue appelle `book_car` → récapitulatif de réservation

### Gérer mes réservations

1. L'utilisateur demande à voir ses réservations
2. Le LLM invoque `my_reservations`
3. La vue liste les réservations actives
4. L'utilisateur peut annuler une réservation → la vue appelle `cancel_reservation`

---

## Tools and Views

**View: search_cars**
- **Input**: `{ pickup_date: string, return_date: string, city: string, vehicle_type?: string }`
- **Output**: `{ cars[], search_params }`
- **Views**: résultats (grille de cartes), détail voiture + formulaire, confirmation réservation
- **Behavior**: gère la sélection et l'état du formulaire localement, appelle `book_car` pour confirmer

**Tool: book_car**
- **Input**: `{ car_id: string, pickup_date: string, return_date: string, pickup_city: string }`
- **Output**: `{ reservation_id, car, pickup_date, return_date, pickup_city, total_price, status }`

**View: my_reservations**
- **Input**: `{}`
- **Output**: `{ reservations[] }`
- **Views**: liste des réservations, détail d'une réservation, confirmation d'annulation
- **Behavior**: appelle `cancel_reservation` pour annuler

**Tool: cancel_reservation**
- **Input**: `{ reservation_id: string }`
- **Output**: `{ success: boolean, reservation_id: string }`
