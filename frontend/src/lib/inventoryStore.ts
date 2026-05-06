import { InventoryItem, InventoryTransaction, TransactionType, InventoryRequest } from '@/types';

/**
 * Inventory Store — manages stock, transactions and technician requests.
 */

const INV_KEY = 'jamechanic_inventory_v2';
const TRANS_KEY = 'jamechanic_transactions';
const REQ_KEY = 'jamechanic_inventory_requests';

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, sku: 'REP-001', nombre_repuesto: 'Sensor de Presión O2', cantidad: 15, cantidad_minima: 5, costo_unitario: 120 },
  { id: 2, sku: 'REP-002', nombre_repuesto: 'Batería de Respaldo 12V', cantidad: 8, cantidad_minima: 3, costo_unitario: 45 },
  { id: 3, sku: 'REP-003', nombre_repuesto: 'Kit de Sellos Hidráulicos', cantidad: 25, cantidad_minima: 10, costo_unitario: 15 },
  { id: 4, sku: 'REP-004', nombre_repuesto: 'Pantalla LCD 7"', cantidad: 4, cantidad_minima: 2, costo_unitario: 210 },
  { id: 5, sku: 'REP-005', nombre_repuesto: 'Cable de ECG 5 puntas', cantidad: 12, cantidad_minima: 5, costo_unitario: 35 },
];

export function getInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return INITIAL_INVENTORY;
  try {
    const saved = localStorage.getItem(INV_KEY);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  } catch {
    return INITIAL_INVENTORY;
  }
}

export function saveInventory(items: InventoryItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INV_KEY, JSON.stringify(items));
}

export function getTransactions(): InventoryTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(TRANS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveTransactions(trans: InventoryTransaction[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRANS_KEY, JSON.stringify(trans));
}

export function getRequests(): InventoryRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(REQ_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRequests(reqs: InventoryRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REQ_KEY, JSON.stringify(reqs));
}

/**
 * Technician requests a part for a repair
 */
export function requestPart(request: Omit<InventoryRequest, 'id' | 'status' | 'requestedAt'>) {
  const reqs = getRequests();
  const newReq: InventoryRequest = {
    ...request,
    id: `req_${Date.now()}`,
    status: 'pending',
    requestedAt: new Date().toISOString()
  };
  saveRequests([...reqs, newReq]);
  return newReq;
}

/**
 * Approve a part request and create a transaction
 */
export function approveRequest(reqId: string, techName: string, clientName?: string, clientId?: number) {
  const reqs = getRequests();
  const req = reqs.find(r => r.id === reqId);
  if (!req) return;

  const inventory = getInventory();
  const item = inventory.find(i => i.id === req.itemId);
  if (!item || item.cantidad < req.quantity) return;

  // 1. Deduct stock
  item.cantidad -= req.quantity;
  saveInventory(inventory);

  // 2. Create Transaction (Ficha de Reparación / Factura)
  const transactions = getTransactions();
  const newTrans: InventoryTransaction = {
    id: `inv_${Date.now()}`,
    itemId: req.itemId,
    itemName: req.itemName,
    type: TransactionType.REPAIR_USE,
    quantity: req.quantity,
    price: item.costo_unitario || 0,
    total: (item.costo_unitario || 0) * req.quantity,
    appointmentId: req.appointmentId,
    techId: req.techId,
    techName: techName,
    clientId,
    clientName,
    createdAt: new Date().toISOString()
  };
  saveTransactions([...transactions, newTrans]);

  // 3. Mark request as approved
  const updatedReqs = reqs.map(r => r.id === reqId ? { ...r, status: 'approved' as const } : r);
  saveRequests(updatedReqs);
}

/**
 * Get all transactions for a specific repair (Ficha de Reparación)
 */
export function getRepairTransactions(appointmentId: number): InventoryTransaction[] {
  return getTransactions().filter(t => t.appointmentId === appointmentId);
}
