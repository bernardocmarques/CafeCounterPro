export type CoffeeType = "Curto" | "Longo" | "Normal" | "Descafeinado" | "Outro";

export const COFFEE_TYPES: CoffeeType[] = [
  "Curto",
  "Longo",
  "Normal",
  "Descafeinado",
  "Outro",
];

export type OrderStatus = "pendente" | "pronto";

export interface Order {
  id: string;
  coffee_type: CoffeeType;
  custom_coffee?: string;
  person_name: string;
  status: OrderStatus;
  created_at: string;
}
