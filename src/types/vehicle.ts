export type FuelType = 'gasolina' | 'etanol' | 'diesel' | 'gnv' | 'flex' | 'eletrico' | 'hibrido';

export type MaintenanceCategory =
  | 'troca_oleo'
  | 'filtro_oleo'
  | 'filtro_ar'
  | 'filtro_combustivel'
  | 'filtro_cabine'
  | 'pneus_rodizio'
  | 'pneus_troca'
  | 'alinhamento_balanceamento'
  | 'freios_pastilhas'
  | 'freios_discos'
  | 'fluido_freio'
  | 'correia_dentada'
  | 'velas'
  | 'bateria'
  | 'suspensao'
  | 'ar_condicionado'
  | 'arrefecimento'
  | 'revisao_geral'
  | 'outros';

export type ExpenseCategory = 
  | 'ipva'
  | 'seguro'
  | 'licenciamento'
  | 'pedagio'
  | 'estacionamento'
  | 'lavagem'
  | 'multa'
  | 'acessorios'
  | 'outros';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  fuelType: FuelType;
  tankCapacityLiters: number;
  currentOdometer: number;
  color?: string;
  notes?: string;
  avatarIcon?: string;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string; // ISO YYYY-MM-DD
  odometer: number;
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  isFullTank: boolean;
  missedPreviousLog?: boolean; // if missed a tank, do not compute relative to prior
  stationName?: string;
  notes?: string;
  // Computed on the fly or cached
  distanceSinceLast?: number;
  consumptionKmPerL?: number;
  costPerKm?: number;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  date: string; // ISO YYYY-MM-DD
  odometer: number;
  category: MaintenanceCategory;
  title: string;
  description?: string;
  cost: number;
  workshop?: string;
  invoiceNumber?: string;
  nextScheduledKm?: number;
  nextScheduledDate?: string;
  reminderCreated?: boolean;
  notes?: string;
}

export type ReminderStatus = 'ok' | 'warning' | 'overdue';

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  title: string;
  category: MaintenanceCategory;
  targetOdometer?: number;
  targetDate?: string; // ISO YYYY-MM-DD
  intervalKm?: number;
  intervalMonths?: number;
  lastCompletedOdometer?: number;
  lastCompletedDate?: string;
  isCompleted: boolean;
  notes?: string;
}

export interface OtherExpense {
  id: string;
  vehicleId: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  cost: number;
  notes?: string;
}

export type FineSeverity = 'leve' | 'media' | 'grave' | 'gravissima';
export type FineStatus = 'pendente' | 'pago' | 'em_recurso' | 'recurso_deferido' | 'recurso_indeferido';

export interface TrafficFine {
  id: string;
  vehicleId: string;
  date: string; // ISO YYYY-MM-DD
  time?: string; // HH:mm
  amount: number; // Fine amount in R$
  discountedAmount?: number; // e.g., 20% or 40% discount via SNE
  violationType: string; // Description of the violation
  severity: FineSeverity; // leve, media, grave, gravissima
  points: number; // 3, 4, 5, 7
  code?: string; // e.g., "745-5-0"
  aitNumber?: string; // Auto de Infração de Trânsito
  issuingAuthority?: string; // e.g., "DETRAN-SP", "DSV / CET", "PRF"
  location?: string; // Location of the infraction
  status: FineStatus;
  dueDate?: string; // Due date for payment or appeal
  paymentDate?: string;
  notes?: string;
  // Section for appeals / recurso
  appealStatus?: 'nenhum' | 'defesa_previa' | 'jari_primeira_instancia' | 'cetran_segunda_instancia' | 'deferido' | 'indeferido';
  appealProtocol?: string;
  appealDate?: string;
  appealNotes?: string;
}

export interface MonthlyStats {
  monthKey: string; // '2026-03'
  monthLabel: string; // 'Março 2026'
  totalFuelCost: number;
  totalFuelLiters: number;
  totalMaintenanceCost: number;
  totalFinesCost: number;
  totalOtherCost: number;
  totalCost: number;
  totalKmTraveled: number;
  averageConsumptionKmPerL: number;
  costPerKm: number;
  fuelFillCount: number;
  maintenanceCount: number;
  finesCount: number;
}

