export enum UserRole {
  ADMIN = 'ADMIN',
  TECH = 'TECH',
  CLIENT = 'CLIENT',
}

export interface RouteItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredRoles: UserRole[];
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: UserRole;
  rif_cedula?: string;
  telefono?: string;
  created_at?: string;
}

export interface Equipment {
  id: number;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  serial_number: string;
  imagenes_url: string[];
  created_at: string;
}

export enum AppointmentStatus {
  RECEIVED = 'RECEIVED',
  DIAGNOSING = 'DIAGNOSING',
  WAITING_PARTS = 'WAITING_PARTS',
  FINISHED = 'FINISHED',
  DELIVERED = 'DELIVERED',
}

export interface Message {
  id: number;
  appointment_id: number;
  sender_id: number;
  mensaje: string;
  leido: boolean;
  created_at: string;
  sender?: Partial<User>;
}

export interface Appointment {
  id: number;
  client_id: number;
  tech_id?: number;
  equipment_id: number;
  descripcion_falla: string;
  status: AppointmentStatus;
  fecha_cita: string;
  notas_tecnicas?: string;
  created_at: string;
  client?: Partial<User>;
  tech?: Partial<User>;
  equipment?: Equipment;
  messages?: Message[];
}

export interface InventoryItem {
  id: number;
  sku: string;
  nombre_repuesto: string;
  cantidad: number;
  cantidad_minima: number;
  costo_unitario?: number;
  proveedor?: string;
  last_restock?: string;
}

export interface DashboardStats {
  appointmentsToday: number;
  appointmentsByStatus: { status: AppointmentStatus; count: number }[];
  usersByRole: { role: UserRole; count: number }[];
  lowStockItems: number;
}
export enum TransactionType {
  SALE = 'SALE',
  REPAIR_USE = 'REPAIR_USE',
  RESTOCK = 'RESTOCK'
}

export interface InventoryTransaction {
  id: number;
  inventory_id: number;
  appointment_id?: number;
  user_id: number;
  type: TransactionType;
  quantity: number;
  price_at_time?: number;
  created_at: string;
  inventory?: InventoryItem;
  user?: Partial<User>;
}

export interface InventoryRequest {
  id: number;
  inventory_id: number;
  tech_id: number;
  appointment_id?: number;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_at: string;
  resolved_at?: string;
  notes?: string;
  inventory?: InventoryItem;
  tech?: Partial<User>;
}
