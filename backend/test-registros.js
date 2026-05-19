const API_URL = 'http://localhost:3001/api';

async function run() {
  console.log('--- Iniciando Test de Registros ---');

  // 1. Create ADMIN
  const adminRes = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Admin Test',
      email: `admin_${Date.now()}@test.com`,
      password: 'password123',
      role: 'ADMIN',
    }),
  });
  const admin = await adminRes.json();
  console.log('Admin creado:', admin.email);

  // 2. Login ADMIN
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: admin.email, password: 'password123' }),
  });
  const { access_token: adminToken } = await loginRes.json();

  // 3. Create TECH
  const techRes = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Tech Test',
      email: `tech_${Date.now()}@test.com`,
      password: 'password123',
      role: 'TECH',
    }),
  });
  const tech = await techRes.json();
  console.log('Tech creado:', tech.email);

  const loginTechRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: tech.email, password: 'password123' }),
  });
  const { access_token: techToken } = await loginTechRes.json();

  // 4. Create Reception (Appointment + Client + Equipment)
  const aptRes = await fetch(`${API_URL}/appointments/reception`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      clientName: 'Juan Perez',
      clientRif: `V-${Date.now()}`,
      clientPhone: '04121234567',
      serialNumber: `SN-${Date.now()}`,
      brand: 'Mindray',
      model: 'BC-5390',
      issueDescription: 'No enciende',
      notes: 'Llegó con cable de poder',
    }),
  });
  const appointment = await aptRes.json();
  console.log('Cita de recepción creada, ID:', appointment.id);

  // 5. Create Inventory item
  const invRes = await fetch(`${API_URL}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      sku: `SKU-${Date.now()}`,
      nombre_repuesto: 'Fuente de Poder Universal',
      cantidad: 10,
      cantidad_minima: 2,
      costo_unitario: 150.0,
      proveedor: 'MedTech Supplies',
    }),
  });
  const inventory = await invRes.json();
  console.log('Repuesto creado, ID:', inventory.id);

  // 6. Create Part Request as Tech
  const reqRes = await fetch(`${API_URL}/inventory/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${techToken}`,
    },
    body: JSON.stringify({
      inventory_id: inventory.id,
      appointment_id: appointment.id,
      quantity: 1,
    }),
  });
  const partReq = await reqRes.json();
  console.log('Solicitud de repuesto creada:', partReq);

  if (partReq.id) {
    // 7. Approve Part Request as Admin
    const approveRes = await fetch(`${API_URL}/inventory/requests/${partReq.id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const approvedReq = await approveRes.json();
    console.log('Solicitud aprobada:', approvedReq);
  } else {
    console.log('No se pudo aprobar porque no hay ID de solicitud');
  }

  // 8. Fetch Transactions
  const txRes = await fetch(`${API_URL}/inventory/transactions/all?appointmentId=${appointment.id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const transactions = await txRes.json();
  console.log('--- Transacciones de la Cita ---');
  console.log(JSON.stringify(transactions, null, 2));

  console.log('Test finalizado exitosamente.');
}

run().catch(console.error);
