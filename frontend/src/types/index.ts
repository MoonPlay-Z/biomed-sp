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
