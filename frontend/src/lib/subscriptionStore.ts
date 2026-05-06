/**
 * Subscription Store — lightweight localStorage-backed state for plan requests and plan management.
 * Used across CLIENT, ADMIN and TECH roles.
 */

export type PlanTier = 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type PlanDuration = 1 | 3 | 6 | 12 | 24; // months

export interface PlanDefinition {
  id: string;
  name: string;
  tier: PlanTier;
  category: 'subscription' | 'service';
  price: number;
  discountPrice?: number; // Optional promotion price
  duration: number; // in months
  description: string;
  features: string[];
  active: boolean;
  badge?: string;
  isPromotion?: boolean;
}

export interface SubscriptionRequest {
  id: string;
  clientId: number;
  clientName: string;
  clientEmail: string;
  plan: PlanDefinition;
  status: SubscriptionStatus;
  requestedAt: string;
  resolvedAt?: string;
  techNote?: string;
  assignedTechId?: number;
  assignedTechName?: string;
  expiresAt?: string; // Calculated based on duration
}

const SUBS_KEY = 'jamechanic_subscriptions';
const PLANS_KEY = 'jamechanic_plans_v2'; // Versioned key for new schema

// Initial plans if none exist
export const INITIAL_PLANS: PlanDefinition[] = [
  {
    id: 'p1', name: 'Plan Básico', tier: 'basic', category: 'subscription', price: 50, duration: 1, active: true,
    description: 'Ideal para clínicas pequeñas con 1-3 equipos críticos.',
    features: ['Diagnóstico inicial gratuito', '1 reparación mensual incluida', 'Soporte por WhatsApp'],
  },
  {
    id: 'p2', name: 'Plan Profesional', tier: 'professional', category: 'subscription', price: 150, discountPrice: 120, duration: 12, active: true, badge: 'Oferta Anual', isPromotion: true,
    description: 'Para centros de salud medianos con equipos variados.',
    features: ['Diagnóstico inicial gratuito', '5 reparaciones mensuales', 'Prioridad de atención', 'Soporte 24/7'],
  },
  {
    id: 'p3', name: 'Plan Empresarial', tier: 'enterprise', category: 'subscription', price: 350, duration: 12, active: true, badge: 'Premium',
    description: 'Para hospitales y grandes centros médicos.',
    features: ['Diagnóstico integral trimestral', 'Reparaciones ilimitadas', 'Técnico dedicado', 'Soporte premium 24/7'],
  },
  {
    id: 'p4', name: 'Reparación Express', tier: 'basic', category: 'service', price: 30, duration: 0, active: true,
    description: 'Diagnóstico y reparación menor en menos de 24 horas.',
    features: ['Diagnóstico en 2 horas', 'Reparación garantizada', 'Certificado de servicio'],
  },
];

// PLAN MANAGEMENT
export function getPlans(): PlanDefinition[] {
  if (typeof window === 'undefined') return INITIAL_PLANS;
  try {
    const saved = localStorage.getItem(PLANS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  } catch {
    return INITIAL_PLANS;
  }
}

export function savePlans(plans: PlanDefinition[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function addOrUpdatePlan(plan: PlanDefinition) {
  const plans = getPlans();
  const index = plans.findIndex(p => p.id === plan.id);
  if (index >= 0) {
    plans[index] = plan;
  } else {
    plans.push(plan);
  }
  savePlans(plans);
}

export function deletePlan(id: string) {
  const plans = getPlans().filter(p => p.id !== id);
  savePlans(plans);
}

// SUBSCRIPTION MANAGEMENT
export function getSubscriptions(): SubscriptionRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SUBS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveSubscriptions(subs: SubscriptionRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
}

export function requestPlan(
  clientId: number,
  clientName: string,
  clientEmail: string,
  plan: PlanDefinition
): SubscriptionRequest {
  const subs = getSubscriptions();
  const updated = subs.map(s =>
    s.clientId === clientId && (s.status === 'pending' || s.status === 'approved')
      ? { ...s, status: 'cancelled' as SubscriptionStatus }
      : s
  );
  const newReq: SubscriptionRequest = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    clientId,
    clientName,
    clientEmail,
    plan,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };
  saveSubscriptions([...updated, newReq]);
  return newReq;
}

export function approveSubscription(
  id: string,
  assignedTechId?: number,
  assignedTechName?: string
) {
  const subs = getSubscriptions().map(s => {
    if (s.id === id) {
      const expiresAt = s.plan.duration > 0 
        ? new Date(new Date().setMonth(new Date().getMonth() + s.plan.duration)).toISOString()
        : undefined;
      return { 
        ...s, 
        status: 'approved' as SubscriptionStatus, 
        resolvedAt: new Date().toISOString(), 
        assignedTechId, 
        assignedTechName,
        expiresAt
      };
    }
    return s;
  });
  saveSubscriptions(subs);
}

export function rejectSubscription(id: string, techNote?: string) {
  const subs = getSubscriptions().map(s =>
    s.id === id
      ? { ...s, status: 'rejected' as SubscriptionStatus, resolvedAt: new Date().toISOString(), techNote }
      : s
  );
  saveSubscriptions(subs);
}

export function getClientActivePlan(clientId: number): SubscriptionRequest | null {
  const subs = getSubscriptions();
  return subs.find(s => s.clientId === clientId && s.status === 'approved') || null;
}

export function getClientPendingPlan(clientId: number): SubscriptionRequest | null {
  const subs = getSubscriptions();
  return subs.find(s => s.clientId === clientId && s.status === 'pending') || null;
}
