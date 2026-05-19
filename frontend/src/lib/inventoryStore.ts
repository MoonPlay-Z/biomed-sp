import { InventoryItem, InventoryTransaction, InventoryRequest } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function getInventory(token: string): Promise<InventoryItem[]> {
  const res = await fetch(`${API_URL}/inventory`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener inventario');
  return res.json();
}

export async function getRequests(token: string): Promise<InventoryRequest[]> {
  const res = await fetch(`${API_URL}/inventory/requests/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener solicitudes');
  return res.json();
}

export async function getTransactions(token: string, appointmentId?: number): Promise<InventoryTransaction[]> {
  const url = appointmentId 
    ? `${API_URL}/inventory/transactions/all?appointmentId=${appointmentId}`
    : `${API_URL}/inventory/transactions/all`;
    
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener transacciones');
  return res.json();
}

export async function requestPart(token: string, data: { inventory_id: number; quantity: number; appointment_id?: number }) {
  const res = await fetch(`${API_URL}/inventory/requests`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al solicitar repuesto');
  }
  return res.json();
}

export async function approveRequest(token: string, requestId: number) {
  const res = await fetch(`${API_URL}/inventory/requests/${requestId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al aprobar solicitud');
  }
  return res.json();
}

export async function rejectRequest(token: string, requestId: number) {
  const res = await fetch(`${API_URL}/inventory/requests/${requestId}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al rechazar solicitud');
  }
  return res.json();
}
