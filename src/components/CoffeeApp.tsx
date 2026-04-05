"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Order, CoffeeType, COFFEE_TYPES } from "@/types";

const KNOWN_NAMES = [
  "Ana", "Bruno", "Carlos", "Diana", "Eduardo",
  "Filipa", "Gonçalo", "Helena", "Inês", "João",
  "Luísa", "Miguel", "Nuno", "Olga", "Paulo",
  "Rita", "Sara", "Tiago", "Vera", "Xavier",
];

const COFFEE_EMOJIS: Record<CoffeeType, string> = {
  Curto: "☕",
  Longo: "🍵",
  Normal: "☕",
  Descafeinado: "🌿",
  Outro: "✨",
};

export default function CoffeeApp() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCoffee, setSelectedCoffee] = useState<CoffeeType | null>(null);
  const [customCoffee, setCustomCoffee] = useState("");
  const [personName, setPersonName] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"pedir" | "lista">("pedir");
  const [isLoading, setIsLoading] = useState(true);
  const [allNames, setAllNames] = useState<string[]>(KNOWN_NAMES);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setOrders(data as Order[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => { loadOrders(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadOrders]);

  useEffect(() => {
    const namesFromOrders = orders.map((o) => o.person_name).filter(Boolean);
    const combined = Array.from(new Set([...KNOWN_NAMES, ...namesFromOrders])).sort();
    setAllNames(combined);
  }, [orders]);

  const handleNameInput = (value: string) => {
    setPersonName(value);
    if (value.trim().length > 0) {
      const filtered = allNames.filter((name) =>
        name.toLowerCase().startsWith(value.toLowerCase())
      );
      setNameSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectName = (name: string) => {
    setPersonName(name);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!selectedCoffee || !personName.trim()) return;
    if (selectedCoffee === "Outro" && !customCoffee.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("orders").insert([{
      coffee_type: selectedCoffee,
      custom_coffee: selectedCoffee === "Outro" ? customCoffee.trim() : null,
      person_name: personName.trim(),
      status: "pendente",
    }]);

    if (!error) {
      setSelectedCoffee(null);
      setCustomCoffee("");
      setPersonName("");
      setShowSuggestions(false);
      setActiveTab("lista");
    }
    setIsSubmitting(false);
  };

  const handleMarkReady = async (orderId: string) => {
    await supabase.from("orders").update({ status: "pronto" }).eq("id", orderId);
  };

  const handleDeleteOrder = async (orderId: string) => {
    await supabase.from("orders").delete().eq("id", orderId);
  };

  const pendingOrders = orders.filter((o) => o.status === "pendente");
  const readyOrders = orders.filter((o) => o.status === "pronto");

  const getCoffeeLabel = (order: Order) => {
    if (order.coffee_type === "Outro" && order.custom_coffee) {
      return order.custom_coffee;
    }
    return order.coffee_type;
  };

  const isFormValid =
    selectedCoffee !== null &&
    personName.trim().length > 0 &&
    (selectedCoffee !== "Outro" || customCoffee.trim().length > 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="text-white py-4 px-6 shadow-lg" style={{ background: "var(--coffee-brown)" }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="text-3xl">☕</span>
          <div>
            <h1 className="text-xl font-bold tracking-wide">CafeCounter Pro</h1>
            <p className="text-xs opacity-80">Gestão de pedidos de café</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs opacity-70">Sincronizado</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex rounded-xl overflow-hidden shadow-sm border border-amber-200">
          <button
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === "pedir" ? "text-white" : "text-amber-800 hover:bg-amber-50"
            }`}
            style={activeTab === "pedir" ? { background: "var(--coffee-brown)" } : { background: "var(--coffee-cream)" }}
            onClick={() => setActiveTab("pedir")}
          >
            ➕ Novo Pedido
          </button>
          <button
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === "lista" ? "text-white" : "text-amber-800 hover:bg-amber-50"
            }`}
            style={activeTab === "lista" ? { background: "var(--coffee-brown)" } : { background: "var(--coffee-cream)" }}
            onClick={() => setActiveTab("lista")}
          >
            📋 Lista de Pedidos
            {pendingOrders.length > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {activeTab === "pedir" && (
          <div className="space-y-5">
            {/* Coffee Type */}
            <div className="rounded-2xl p-5 shadow-sm border border-amber-100 bg-white">
              <h2 className="text-base font-bold mb-4" style={{ color: "var(--coffee-brown)" }}>
                Tipo de Café
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {COFFEE_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => { setSelectedCoffee(type); if (type !== "Outro") setCustomCoffee(""); }}
                    className={`py-4 px-3 rounded-xl border-2 font-semibold text-sm transition-all flex flex-col items-center gap-1 ${
                      selectedCoffee === type
                        ? "border-amber-600 text-white shadow-md scale-105"
                        : "border-amber-100 text-amber-900 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                    style={selectedCoffee === type ? { background: "var(--coffee-brown)" } : { background: "white" }}
                  >
                    <span className="text-2xl">{COFFEE_EMOJIS[type]}</span>
                    <span>{type}</span>
                  </button>
                ))}
              </div>
              {selectedCoffee === "Outro" && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Qual tipo de café?"
                    value={customCoffee}
                    onChange={(e) => setCustomCoffee(e.target.value)}
                    className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    style={{ background: "var(--coffee-cream)" }}
                  />
                </div>
              )}
            </div>

            {/* Person Name */}
            <div className="rounded-2xl p-5 shadow-sm border border-amber-100 bg-white">
              <h2 className="text-base font-bold mb-4" style={{ color: "var(--coffee-brown)" }}>
                Para quem?
              </h2>
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Nome da pessoa..."
                  value={personName}
                  onChange={(e) => handleNameInput(e.target.value)}
                  onFocus={() => { if (nameSuggestions.length > 0) setShowSuggestions(true); }}
                  onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); }}
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  style={{ background: "var(--coffee-cream)" }}
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {nameSuggestions.map((name) => (
                      <button
                        key={name}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        onClick={() => selectName(name)}
                      >
                        👤 {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all shadow-md text-white ${
                isFormValid && !isSubmitting
                  ? "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  : "opacity-40 cursor-not-allowed"
              }`}
              style={{ background: "var(--coffee-brown)" }}
            >
              {isSubmitting ? "A registar..." : "☕ Registar Pedido"}
            </button>
          </div>
        )}

        {activeTab === "lista" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-amber-700">
                <div className="text-4xl mb-3">⏳</div>
                <p>A carregar pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-amber-700">
                <div className="text-5xl mb-3">☕</div>
                <p className="font-semibold">Nenhum pedido ainda</p>
                <p className="text-sm mt-1 opacity-70">Faz um novo pedido para começar!</p>
              </div>
            ) : (
              <>
                {pendingOrders.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--coffee-brown)" }}>
                      <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                      Pendentes ({pendingOrders.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          getCoffeeLabel={getCoffeeLabel}
                          onMarkReady={handleMarkReady}
                          onDelete={handleDeleteOrder}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {readyOrders.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--coffee-brown)" }}>
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                      Prontos ({readyOrders.length})
                    </h3>
                    <div className="space-y-2">
                      {readyOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          getCoffeeLabel={getCoffeeLabel}
                          onMarkReady={handleMarkReady}
                          onDelete={handleDeleteOrder}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  getCoffeeLabel,
  onMarkReady,
  onDelete,
}: {
  order: Order;
  getCoffeeLabel: (order: Order) => string;
  onMarkReady: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isPending = order.status === "pendente";
  const emoji = COFFEE_EMOJIS[order.coffee_type] || "☕";

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm transition-all ${
        isPending ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50 opacity-70"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>
          {getCoffeeLabel(order)}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">👤 {order.person_name}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isPending ? (
          <button
            onClick={() => onMarkReady(order.id)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors"
          >
            ✓ Pronto
          </button>
        ) : (
          <span className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-green-500">
            ✓ Entregue
          </span>
        )}
        <button
          onClick={() => onDelete(order.id)}
          className="text-xs px-2 py-1.5 rounded-lg font-semibold text-red-400 hover:bg-red-50 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
