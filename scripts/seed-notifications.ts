#!/usr/bin/env npx tsx

import { prisma } from './lib/prisma'

async function main() {
  try {
    console.log('Creando notificaciones de prueba...')

    // Obtener el primer usuario
    const usuario = await prisma.usuario.findFirst()
    
    if (!usuario) {
      console.log('No hay usuarios en la base de datos. Crea un usuario primero.')
      return
    }

    console.log(`Creando notificaciones para usuario: ${usuario.nombre} (ID: ${usuario.id})`)

    // Crear notificaciones de prueba
    const notificaciones = await prisma.notificacion.createMany({
      data: [
        {
          usuario_id: usuario.id,
          tipo: 'info',
          titulo: 'Bienvenida',
          mensaje: 'Bienvenido al sistema CMMS. Las notificaciones están funcionando correctamente.',
          leida: false,
        },
        {
          usuario_id: usuario.id,
          tipo: 'warning',
          titulo: 'Mantenimiento Próximo',
          mensaje: 'El equipo XYZ requiere mantenimiento preventivo en 3 días.',
          leida: false,
        },
        {
          usuario_id: usuario.id,
          tipo: 'error',
          titulo: 'Equipo Fuera de Servicio',
          mensaje: 'El monitor de presión ha sido marcado como fuera de servicio.',
          leida: false,
        },
        {
          usuario_id: usuario.id,
          tipo: 'success',
          titulo: 'Mantenimiento Completado',
          mensaje: 'El mantenimiento preventivo del ventilador ha sido completado exitosamente.',
          leida: true,
        },
      ],
    })

    console.log(`✓ Se crearon ${notificaciones.count} notificaciones de prueba`)

    // Mostrar las notificaciones creadas
    const todas = await prisma.notificacion.findMany({
      where: { usuario_id: usuario.id },
      orderBy: { created_at: 'desc' },
    })

    console.log('\nNotificaciones en la base de datos:')
    todas.forEach((notif) => {
      const estado = notif.leida ? '✓ Leída' : '✗ Sin leer'
      console.log(`  - [${notif.tipo}] ${notif.titulo} (${estado})`)
    })

    console.log('\n✓ Notificaciones listas para usar')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
