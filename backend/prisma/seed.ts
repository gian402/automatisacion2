// ============================================================
// HYTICON — Seed inicial
// Crea usuarios, catálogo base y clientes de prueba
// Ejecutar: npm run prisma:seed
// ============================================================

import {
  PrismaClient,
  Rol,
  CategoriaCatalogo,
  TipoItem,
  EstadoCotizacion,
  Moneda,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de HYTICON...\n');

  // ── Usuario Administrador ─────────────────────────────────
  const adminEmail = 'admin@hyticon.com';
  const adminPassword = 'Admin1234!';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (admin) {
    console.log(`ℹ️  El usuario administrador ya existe: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    admin = await prisma.user.create({
      data: {
        nombre:       'Administrador HYTICON',
        email:        adminEmail,
        passwordHash,
        rol:          Rol.ADMIN,
        activo:       true,
      },
    });
    console.log(`✅ Usuario ADMIN creado (${admin.email})`);
  }

  // ── Usuario Supervisor de prueba ──────────────────────────
  const supervisorEmail = 'supervisor@hyticon.com';
  const supervisorPassword = 'Super1234!';
  let supervisor = await prisma.user.findUnique({ where: { email: supervisorEmail } });

  if (supervisor) {
    console.log(`ℹ️  El supervisor ya existe: ${supervisorEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(supervisorPassword, 12);
    supervisor = await prisma.user.create({
      data: {
        nombre:       'Supervisor HYTICON',
        email:        supervisorEmail,
        passwordHash,
        rol:          Rol.SUPERVISOR,
        activo:       true,
      },
    });
    console.log(`✅ Usuario SUPERVISOR creado (${supervisor.email})`);
  }

  // ── Clientes Base ──────────────────────────────────────────
  const clientesData = [
    {
      nombre: 'Constructora e Inmobiliaria Los Andes S.A.C.',
      ruc: '20554123451',
      direccion: 'Av. Javier Prado Este 4200, Santiago de Surco, Lima',
      email: 'compras@inmobiliarialosandes.pe',
      telefono: '01 435-8900',
    },
    {
      nombre: 'Corporación Textil del Pacífico S.A.',
      ruc: '20498765432',
      direccion: 'Av. Argentina 2850, Callao, Lima',
      email: 'logistica@textilpacifico.com',
      telefono: '01 561-2240',
    },
    {
      nombre: 'Clínica San Gabriel S.A.C.',
      ruc: '20601234567',
      direccion: 'Av. La Marina 2955, San Miguel, Lima',
      email: 'sistemas@clinicasangabriel.com.pe',
      telefono: '01 614-2222',
    },
  ];

  for (const c of clientesData) {
    const existe = await prisma.cliente.findFirst({ where: { ruc: c.ruc } });
    if (!existe) {
      await prisma.cliente.create({ data: c });
      console.log(`✅ Cliente creado: ${c.nombre}`);
    }
  }

  // ── Catálogo de Productos y Servicios Base ─────────────────
  const catalogoData = [
    {
      codigo: 'CAM-IP-4MP',
      nombre: 'Cámara Domo IP 4MP IR 30m PoE Hikvision',
      descripcion: 'Lente 2.8mm, protección IP67, compresión H.265+, ranura MicroSD.',
      categoria: CategoriaCatalogo.HARDWARE,
      unidad: 'UND',
      precioReferencial: 285.00,
    },
    {
      codigo: 'NVR-16CH-4K',
      nombre: 'NVR 16 Canales 4K 2 HDD Hikvision',
      descripcion: 'Ancho de banda 160Mbps, salida HDMI 4K, soporte hasta 2 discos de 8TB.',
      categoria: CategoriaCatalogo.HARDWARE,
      unidad: 'UND',
      precioReferencial: 980.00,
    },
    {
      codigo: 'SW-POE-16G',
      nombre: 'Switch 16 Puertos Gigabit PoE+ Dahua',
      descripcion: '16 puertos PoE 10/100/1000Mbps + 2 Gigabit SFP, 135W potencia total.',
      categoria: CategoriaCatalogo.HARDWARE,
      unidad: 'UND',
      precioReferencial: 650.00,
    },
    {
      codigo: 'CAB-UTP-CAT6',
      nombre: 'Bobina Cable UTP Cat6 100% Cobre 305m Furukawa',
      descripcion: 'Chaqueta PVC gris, 4 pares trenzados 23 AWG, uso interior certificado.',
      categoria: CategoriaCatalogo.MATERIALES,
      unidad: 'ROL',
      precioReferencial: 480.00,
    },
    {
      codigo: 'SRV-INST-CAM',
      nombre: 'Instalación y canalización de punto de cámara / red',
      descripcion: 'Tendido de cable, conectorización RJ45, montaje y enfoque de cámara.',
      categoria: CategoriaCatalogo.MANO_OBRA,
      unidad: 'PTO',
      precioReferencial: 65.00,
    },
    {
      codigo: 'SRV-CONF-NVR',
      nombre: 'Configuración y puesta en marcha de NVR y app móvil',
      descripcion: 'Configuración de red, grabación continua/movimiento, apertura de puertos y app.',
      categoria: CategoriaCatalogo.SERVICIOS,
      unidad: 'SRV',
      precioReferencial: 250.00,
    },
  ];

  for (const item of catalogoData) {
    const existe = await prisma.catalogoItem.findUnique({ where: { codigo: item.codigo } });
    if (!existe) {
      await prisma.catalogoItem.create({ data: item });
      console.log(`✅ Catálogo creado: [${item.codigo}] ${item.nombre}`);
    }
  }

  // ── Cotizaciones de Ejemplo ───────────────────────────────
  const totalCotizaciones = await prisma.cotizacion.count();
  if (totalCotizaciones === 0 && admin && supervisor) {
    const cliente1 = await prisma.cliente.findFirst({ where: { ruc: '20554123451' } });
    const cliente2 = await prisma.cliente.findFirst({ where: { ruc: '20498765432' } });

    if (cliente1) {
      // Cotización 1: Aprobada
      await prisma.cotizacion.create({
        data: {
          numeroCotizacion: 'COT-2026-0001',
          clienteId: cliente1.id,
          responsableId: admin.id,
          creadoPorId: admin.id,
          proyecto: 'Sistema de CCTV para Edificio Corporativo - 8 Cámaras',
          fechaEmision: new Date('2026-08-05'),
          fechaVencimiento: new Date('2026-08-20'),
          tipoDocumento: 'COTIZACIÓN',
          moneda: Moneda.PEN,
          estado: EstadoCotizacion.APROBADA,
          valorVenta: 4500.00,
          igv: 810.00,
          total: 5310.00,
          terminosCondiciones: 'Validez de la oferta: 15 días calendario. Forma de pago: 50% adelanto, 50% contra entrega. Garantía: 1 año en equipos.',
          items: {
            create: [
              {
                tipoItem: TipoItem.PRODUCTO,
                descripcion: 'Cámara Domo IP 4MP IR 30m PoE Hikvision',
                cantidad: 8,
                precioUnitario: 285.00,
                subtotal: 2280.00,
                orden: 0,
              },
              {
                tipoItem: TipoItem.PRODUCTO,
                descripcion: 'NVR 16 Canales 4K 2 HDD Hikvision',
                cantidad: 1,
                precioUnitario: 980.00,
                subtotal: 980.00,
                orden: 1,
              },
              {
                tipoItem: TipoItem.MATERIAL,
                descripcion: 'Bobina Cable UTP Cat6 100% Cobre 305m Furukawa',
                cantidad: 1,
                precioUnitario: 480.00,
                subtotal: 480.00,
                orden: 2,
              },
              {
                tipoItem: TipoItem.SERVICIO,
                descripcion: 'Instalación y canalización de punto de cámara / red',
                cantidad: 8,
                precioUnitario: 65.00,
                subtotal: 520.00,
                orden: 3,
              },
              {
                tipoItem: TipoItem.SERVICIO,
                descripcion: 'Configuración y puesta en marcha de NVR y app móvil',
                cantidad: 1,
                precioUnitario: 240.00,
                subtotal: 240.00,
                orden: 4,
              },
            ],
          },
          historialEstados: {
            create: [
              {
                estadoNuevo: EstadoCotizacion.BORRADOR,
                cambiadoPorId: admin.id,
                nota: 'Creación de cotización inicial',
              },
              {
                estadoAnterior: EstadoCotizacion.BORRADOR,
                estadoNuevo: EstadoCotizacion.ENVIADA,
                cambiadoPorId: admin.id,
                nota: 'Enviada al cliente por WhatsApp',
              },
              {
                estadoAnterior: EstadoCotizacion.ENVIADA,
                estadoNuevo: EstadoCotizacion.APROBADA,
                cambiadoPorId: admin.id,
                nota: 'Cliente aprobó la propuesta comercial',
              },
            ],
          },
        },
      });
      console.log('✅ Cotización de ejemplo COT-2026-0001 (APROBADA) creada.');
    }

    if (cliente2) {
      // Cotización 2: Enviada
      await prisma.cotizacion.create({
        data: {
          numeroCotizacion: 'COT-2026-0002',
          clienteId: cliente2.id,
          responsableId: supervisor.id,
          creadoPorId: supervisor.id,
          proyecto: 'Ampliación de Cobertura Wi-Fi y Switch PoE Planta Industrial',
          fechaEmision: new Date('2026-08-15'),
          fechaVencimiento: new Date('2026-08-30'),
          tipoDocumento: 'COTIZACIÓN',
          moneda: Moneda.PEN,
          estado: EstadoCotizacion.ENVIADA,
          valorVenta: 2850.00,
          igv: 513.00,
          total: 3363.00,
          terminosCondiciones: 'Validez: 15 días. Pago al contado a la entrega de equipos.',
          items: {
            create: [
              {
                tipoItem: TipoItem.PRODUCTO,
                descripcion: 'Switch 16 Puertos Gigabit PoE+ Dahua',
                cantidad: 2,
                precioUnitario: 650.00,
                subtotal: 1300.00,
                orden: 0,
              },
              {
                tipoItem: TipoItem.MATERIAL,
                descripcion: 'Bobina Cable UTP Cat6 100% Cobre 305m Furukawa',
                cantidad: 2,
                precioUnitario: 480.00,
                subtotal: 960.00,
                orden: 1,
              },
              {
                tipoItem: TipoItem.SERVICIO,
                descripcion: 'Instalación y canalización de punto de cámara / red',
                cantidad: 9,
                precioUnitario: 65.00,
                subtotal: 585.00,
                orden: 2,
              },
            ],
          },
          historialEstados: {
            create: [
              {
                estadoNuevo: EstadoCotizacion.BORRADOR,
                cambiadoPorId: supervisor.id,
                nota: 'Creación de cotización',
              },
              {
                estadoAnterior: EstadoCotizacion.BORRADOR,
                estadoNuevo: EstadoCotizacion.ENVIADA,
                cambiadoPorId: supervisor.id,
                nota: 'Enviada al departamento de TI del cliente',
              },
            ],
          },
        },
      });
      console.log('✅ Cotización de ejemplo COT-2026-0002 (ENVIADA) creada.');
    }
  }

  console.log('\n🎉 Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
