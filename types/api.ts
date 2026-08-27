export type ApiErrors = Record<string, string[] | string>;

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta: Record<string, unknown>;
  errors?: ApiErrors;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  user_type: 'S' | 'O';
  roles: string[];
  permissions: string[];
}

export type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];
export type ResourceRecord = Record<string, RecordValue> & { id: number };

export interface ResourceField {
  label: string;
  type?: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'datetime-local' | 'boolean' | 'file';
  rules?: string | string[];
  readonly?: boolean;
  help?: string;
  stores_as?: string;
  has_options?: boolean;
}

export interface ResourceSchema {
  resource: string;
  label: string;
  singular: string;
  columns: Record<string, string>;
  fields: Record<string, ResourceField>;
  lookups: Record<string, Record<string, string>>;
  actions: Record<string, string>;
  capabilities?: { create: boolean; update: boolean; delete: boolean };
}

export interface ResourceListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  filters?: Record<string, unknown>;
}

export interface DashboardCard {
  label: string;
  value: string | number;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface DashboardTable {
  title: string;
  columns: string[];
  rows: Array<Record<string, unknown> | unknown[]>;
}

export interface DashboardPayload {
  cards: DashboardCard[];
  table?: DashboardTable;
  resource_tables?: DashboardTable[];
  filters?: Record<string, string>;
}
