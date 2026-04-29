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
}
