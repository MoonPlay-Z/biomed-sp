import { PrismaClient, user_role, appointment_status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding...');

  // 1. Limpiar datos previos
  await prisma.messages.deleteMany();
  await prisma.appointments.deleteMany();
  await prisma.equipments.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.users.deleteMany();

  const password_hash = await bcrypt.hash('admin123', 10);

  // 2. Crear Usuarios
  const admin = await prisma.users.create({
    data: {
      nombre: 'Administrador JaMechanic',
      email: 'admin@jamechanic.com',
      password_hash,
      role: user_role.ADMIN,
      rif_cedula: 'J-12345678-9',
      telefono: '0414-1234567',
    },
  });

  const tech = await prisma.users.create({
    data: {
      nombre: 'Juan Técnico',
      email: 'tech@jamechanic.com',
      password_hash,
      role: user_role.TECH,
      rif_cedula: 'V-20123456',
      telefono: '0412-7654321',
    },
  });

  const client = await prisma.users.create({
    data: {
      nombre: 'Clínica Acarigua',
      email: 'contacto@clinica.com',
      password_hash,
      role: user_role.CLIENT,
      rif_cedula: 'J-99999999-0',
      telefono: '0255-6667788',
    },
  });

  console.log('✅ Usuarios creados');

  // 3. Crear Inventario inicial
  await prisma.inventory.createMany({
    data: [
      { sku: 'BAT-MON-01', nombre_repuesto: 'Batería Monitor Mindray', cantidad: 5, cantidad_minima: 2, costo_unitario: 45.5, proveedor: 'AliExpress' },
      { sku: 'SEN-SPO2-02', nombre_repuesto: 'Sensor SpO2 Universal', cantidad: 10, cantidad_minima: 5, costo_unitario: 12.0, proveedor: 'Alibaba' },
      { sku: 'BOM-INF-03', nombre_repuesto: 'Motor Bomba Infusión', cantidad: 1, cantidad_minima: 2, costo_unitario: 89.0, proveedor: 'MedTech' },
    ],
  });

  console.log('✅ Inventario creado');

  // 4. Crear Equipo y Cita de ejemplo
  const equipment = await prisma.equipments.create({
    data: {
      tipo_equipo: 'Monitor Multiparámetro',
      marca: 'Mindray',
      modelo: 'UMEC 12',
      serial_number: 'SN-987654321',
      imagenes_url: ['https://picsum.photos/400/300', 'https://picsum.photos/400/301', 'https://picsum.photos/400/302'],
    },
  });

  await prisma.appointments.create({
    data: {
      client_id: client.id,
      tech_id: tech.id,
      equipment_id: equipment.id,
      descripcion_falla: 'El equipo no enciende tras falla eléctrica.',
      fecha_cita: new Date(),
      status: appointment_status.DIAGNOSING,
      notas_tecnicas: 'Se requiere revisión de la fuente de poder interna.',
    },
  });

  console.log('✅ Cita de prueba creada');
  console.log('🚀 Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
