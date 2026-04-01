export interface PlanLimits {
  max_menu_items: number
  max_tables: number
  max_staff: number
  max_orders_month: number
  has_online_ordering: boolean
  has_upselling: boolean
  has_crm: boolean
  has_loyalty: boolean
  has_custom_branding: boolean
  has_analytics: boolean
  has_whatsapp: boolean
}

export const PLAN_FEATURES: Record<string, { label: string; icon: string; description: string }[]> = {
  starter: [
    { label: 'Carta digital + QR', icon: '📱', description: 'Hasta 30 platos' },
    { label: '8 mesas', icon: '🪑', description: 'Gestión básica de mesas' },
    { label: '2 usuarios', icon: '👤', description: 'Owner + 1 staff' },
    { label: '300 pedidos/mes', icon: '📋', description: 'Pedidos en sala' },
  ],
  pro: [
    { label: 'Todo de Starter', icon: '✅', description: 'Sin límites molestos' },
    { label: '100 platos + 25 mesas', icon: '🍽️', description: 'Para restaurantes medianos' },
    { label: 'Pedidos online', icon: '🌐', description: 'Tu propio canal sin comisiones' },
    { label: 'Upselling inteligente', icon: '🧠', description: 'Sube el ticket medio un 15%' },
    { label: 'CRM básico', icon: '👥', description: 'Conoce a tus clientes' },
    { label: 'Analytics', icon: '📊', description: 'Métricas de tu negocio' },
  ],
  premium: [
    { label: 'Todo de Pro', icon: '✅', description: 'Sin límites' },
    { label: 'Platos y mesas ilimitados', icon: '♾️', description: 'Escala sin freno' },
    { label: 'Fidelización + puntos', icon: '🏆', description: 'Programa de recompensas' },
    { label: 'Branding personalizado', icon: '🎨', description: 'Tu marca, tus colores' },
    { label: 'WhatsApp integrado', icon: '💬', description: 'Notificaciones automáticas' },
    { label: '20 usuarios', icon: '👥', description: 'Equipo completo' },
  ],
}

export const PLAN_PRICES = {
  starter: { monthly: 29, yearly: 290 },
  pro: { monthly: 79, yearly: 790 },
  premium: { monthly: 149, yearly: 1490 },
}
