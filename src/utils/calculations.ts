import { FuelLog, MaintenanceLog, OtherExpense, ServiceReminder, MonthlyStats, ReminderStatus, MaintenanceCategory, TrafficFine, FineSeverity, FineStatus } from '../types/vehicle';

export const FINE_SEVERITY_META: Record<FineSeverity, { label: string; points: number; baseValue: number; badgeColor: string }> = {
  leve: { label: 'Leve', points: 3, baseValue: 88.38, badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  media: { label: 'Média', points: 4, baseValue: 130.16, badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  grave: { label: 'Grave', points: 5, baseValue: 195.23, badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  gravissima: { label: 'Gravíssima', points: 7, baseValue: 293.47, badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export const FINE_STATUS_META: Record<FineStatus, { label: string; badgeColor: string }> = {
  pendente: { label: 'Aguardando Pagamento', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  pago: { label: 'Paga', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  em_recurso: { label: 'Em Recurso', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  recurso_deferido: { label: 'Recurso Deferido (Anulada)', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  recurso_indeferido: { label: 'Recurso Indeferido (Mantida)', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export const COMMON_VIOLATIONS = [
  { violationType: 'Velocidade superior à máxima permitida em até 20%', severity: 'media' as FineSeverity, points: 4, amount: 130.16, code: '745-5-0' },
  { violationType: 'Velocidade superior à máxima em mais de 20% até 50%', severity: 'grave' as FineSeverity, points: 5, amount: 195.23, code: '746-3-0' },
  { violationType: 'Velocidade superior à máxima permitida em mais de 50%', severity: 'gravissima' as FineSeverity, points: 7, amount: 880.41, code: '747-1-0' },
  { violationType: 'Avançar o sinal vermelho do semáforo ou parada obrigatória', severity: 'gravissima' as FineSeverity, points: 7, amount: 293.47, code: '605-0-1' },
  { violationType: 'Utilizar ou segurar telefone celular ao volante', severity: 'gravissima' as FineSeverity, points: 7, amount: 293.47, code: '763-8-2' },
  { violationType: 'Deixar o condutor ou passageiro de usar cinto de segurança', severity: 'grave' as FineSeverity, points: 5, amount: 195.23, code: '518-5-1' },
  { violationType: 'Estacionar em desacordo com a regulamentação / Faixa Amarela', severity: 'media' as FineSeverity, points: 4, amount: 130.16, code: '545-2-1' },
  { violationType: 'Estacionar sobre calçada, passeio ou faixa de pedestres', severity: 'grave' as FineSeverity, points: 5, amount: 195.23, code: '554-1-2' },
  { violationType: 'Transitar em faixa exclusiva para ônibus regulamentada', severity: 'gravissima' as FineSeverity, points: 7, amount: 293.47, code: '568-1-0' },
  { violationType: 'Dirigir veículo sem possuir CNH ou PPD', severity: 'gravissima' as FineSeverity, points: 7, amount: 880.41, code: '501-0-0' },
];

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
};

export const formatNumber = (val: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val || 0);
};

export const formatKm = (km: number): string => {
  return `${new Intl.NumberFormat('pt-BR').format(Math.round(km || 0))} km`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const getMonthName = (monthNum: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthNum - 1] || '';
};

export const formatMonthKey = (monthKey: string): string => {
  // input: '2026-03'
  const [year, month] = monthKey.split('-');
  const mIndex = parseInt(month, 10);
  return `${getMonthName(mIndex)} de ${year}`;
};

export const getDaysDifference = (targetDateStr: string, fromDateStr?: string): number => {
  const target = new Date(targetDateStr);
  const from = fromDateStr ? new Date(fromDateStr) : new Date();
  // reset time to midnight
  target.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateFuelMetrics = (logs: FuelLog[]): FuelLog[] => {
  // Sort ascending by odometer, then date
  const sorted = [...logs].sort((a, b) => {
    if (a.odometer !== b.odometer) return a.odometer - b.odometer;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const result: FuelLog[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = { ...sorted[i] };
    const prev = i > 0 ? sorted[i - 1] : null;

    if (prev && !current.missedPreviousLog) {
      const distance = current.odometer - prev.odometer;
      if (distance > 0) {
        current.distanceSinceLast = distance;
        // If current tank is full and previous tank was full, calculate exact consumption
        if (current.isFullTank && prev.isFullTank && current.liters > 0) {
          current.consumptionKmPerL = Number((distance / current.liters).toFixed(2));
          current.costPerKm = Number((current.totalCost / distance).toFixed(2));
        }
      }
    }

    result.push(current);
  }

  // Return sorted descending for UI lists (most recent first)
  return result.sort((a, b) => {
    if (b.odometer !== a.odometer) return b.odometer - a.odometer;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const getReminderEvaluation = (
  reminder: ServiceReminder,
  currentOdometer: number,
  todayStr: string = new Date().toISOString().split('T')[0]
): {
  status: ReminderStatus;
  remainingKm?: number;
  remainingDays?: number;
  progressPercent: number; // 0 to 100
  urgencyLabel: string;
} => {
  let remainingKm: number | undefined = undefined;
  let remainingDays: number | undefined = undefined;
  let isOverdue = false;
  let isWarning = false;
  let urgencyLabel = 'Em dia';

  if (reminder.targetOdometer) {
    remainingKm = reminder.targetOdometer - currentOdometer;
    if (remainingKm <= 0) {
      isOverdue = true;
    } else if (remainingKm <= 1000) {
      isWarning = true;
    }
  }

  if (reminder.targetDate) {
    remainingDays = getDaysDifference(reminder.targetDate, todayStr);
    if (remainingDays <= 0) {
      isOverdue = true;
    } else if (remainingDays <= 15) {
      isWarning = true;
    }
  }

  // Calculate progress percentage
  let progressPercent = 0;
  if (reminder.intervalKm && reminder.lastCompletedOdometer && reminder.targetOdometer) {
    const distanceTotal = reminder.intervalKm;
    const distanceUsed = currentOdometer - reminder.lastCompletedOdometer;
    progressPercent = Math.min(100, Math.max(0, Math.round((distanceUsed / distanceTotal) * 100)));
  } else if (remainingKm !== undefined && reminder.targetOdometer) {
    const estimatedSpan = 10000;
    const used = estimatedSpan - Math.max(0, remainingKm);
    progressPercent = Math.min(100, Math.max(0, Math.round((used / estimatedSpan) * 100)));
  }

  if (isOverdue) {
    if (remainingKm !== undefined && remainingKm <= 0) {
      urgencyLabel = `Vencido há ${Math.abs(remainingKm)} km`;
    } else if (remainingDays !== undefined && remainingDays <= 0) {
      urgencyLabel = `Vencido há ${Math.abs(remainingDays)} dias`;
    } else {
      urgencyLabel = 'Vencido';
    }
    return { status: 'overdue', remainingKm, remainingDays, progressPercent: 100, urgencyLabel };
  }

  if (isWarning) {
    if (remainingKm !== undefined && remainingKm <= 1000) {
      urgencyLabel = `Próximo: faltam ${remainingKm} km`;
    } else if (remainingDays !== undefined && remainingDays <= 15) {
      urgencyLabel = `Próximo: faltam ${remainingDays} dias`;
    } else {
      urgencyLabel = 'Atenção necessária';
    }
    return { status: 'warning', remainingKm, remainingDays, progressPercent, urgencyLabel };
  }

  if (remainingKm !== undefined && remainingDays !== undefined) {
    urgencyLabel = `Faltam ${formatKm(remainingKm)} ou ${remainingDays} dias`;
  } else if (remainingKm !== undefined) {
    urgencyLabel = `Faltam ${formatKm(remainingKm)}`;
  } else if (remainingDays !== undefined) {
    urgencyLabel = `Faltam ${remainingDays} dias`;
  }

  return { status: 'ok', remainingKm, remainingDays, progressPercent, urgencyLabel };
};

export const generateMonthlyStats = (
  vehicleId: string,
  fuelLogs: FuelLog[],
  maintenanceLogs: MaintenanceLog[],
  expenses: OtherExpense[],
  trafficFines: TrafficFine[] = []
): MonthlyStats[] => {
  const vFuel = fuelLogs.filter(f => f.vehicleId === vehicleId);
  const vMaint = maintenanceLogs.filter(m => m.vehicleId === vehicleId);
  const vExp = expenses.filter(e => e.vehicleId === vehicleId);
  const vFines = trafficFines.filter(fine => fine.vehicleId === vehicleId);

  // Group by 'YYYY-MM'
  const monthsMap = new Map<string, {
    fuelLogs: FuelLog[];
    maintenanceLogs: MaintenanceLog[];
    expenses: OtherExpense[];
    fines: TrafficFine[];
  }>();

  const getMonthKey = (dateStr: string) => dateStr.substring(0, 7);

  vFuel.forEach(f => {
    const k = getMonthKey(f.date);
    if (!monthsMap.has(k)) monthsMap.set(k, { fuelLogs: [], maintenanceLogs: [], expenses: [], fines: [] });
    monthsMap.get(k)!.fuelLogs.push(f);
  });

  vMaint.forEach(m => {
    const k = getMonthKey(m.date);
    if (!monthsMap.has(k)) monthsMap.set(k, { fuelLogs: [], maintenanceLogs: [], expenses: [], fines: [] });
    monthsMap.get(k)!.maintenanceLogs.push(m);
  });

  vExp.forEach(e => {
    const k = getMonthKey(e.date);
    if (!monthsMap.has(k)) monthsMap.set(k, { fuelLogs: [], maintenanceLogs: [], expenses: [], fines: [] });
    monthsMap.get(k)!.expenses.push(e);
  });

  vFines.forEach(fine => {
    const k = getMonthKey(fine.date);
    if (!monthsMap.has(k)) monthsMap.set(k, { fuelLogs: [], maintenanceLogs: [], expenses: [], fines: [] });
    monthsMap.get(k)!.fines.push(fine);
  });

  const sortedMonths = Array.from(monthsMap.keys()).sort().reverse();

  const computedLogs = calculateFuelMetrics(vFuel);
  const computedMap = new Map(computedLogs.map(l => [l.id, l]));

  return sortedMonths.map(monthKey => {
    const data = monthsMap.get(monthKey)!;
    const totalFuelCost = data.fuelLogs.reduce((acc, cur) => acc + (cur.totalCost || 0), 0);
    const totalFuelLiters = data.fuelLogs.reduce((acc, cur) => acc + (cur.liters || 0), 0);
    const totalMaintenanceCost = data.maintenanceLogs.reduce((acc, cur) => acc + (cur.cost || 0), 0);
    const totalOtherCost = data.expenses.reduce((acc, cur) => acc + (cur.cost || 0), 0);
    // Count fines that are paid or pending (excluding successfully annulled/deferido)
    const totalFinesCost = data.fines
      .filter(f => f.status !== 'recurso_deferido')
      .reduce((acc, cur) => acc + (cur.discountedAmount && cur.status === 'pago' ? cur.discountedAmount : cur.amount || 0), 0);

    const totalCost = totalFuelCost + totalMaintenanceCost + totalOtherCost + totalFinesCost;

    // Monthly distance and average consumption calculation
    let totalKmTraveled = 0;
    let validConsumptionSum = 0;
    let validConsumptionCount = 0;

    data.fuelLogs.forEach(log => {
      const computed = computedMap.get(log.id);
      if (computed?.distanceSinceLast) {
        totalKmTraveled += computed.distanceSinceLast;
      }
      if (computed?.consumptionKmPerL && computed.consumptionKmPerL > 0) {
        validConsumptionSum += computed.consumptionKmPerL;
        validConsumptionCount += 1;
      }
    });

    let averageConsumptionKmPerL = 0;
    if (validConsumptionCount > 0) {
      averageConsumptionKmPerL = Number((validConsumptionSum / validConsumptionCount).toFixed(2));
    } else if (totalKmTraveled > 0 && totalFuelLiters > 0) {
      averageConsumptionKmPerL = Number((totalKmTraveled / totalFuelLiters).toFixed(2));
    }

    const costPerKm = totalKmTraveled > 0 ? Number((totalCost / totalKmTraveled).toFixed(2)) : 0;

    return {
      monthKey,
      monthLabel: formatMonthKey(monthKey),
      totalFuelCost,
      totalFuelLiters: Number(totalFuelLiters.toFixed(2)),
      totalMaintenanceCost,
      totalFinesCost,
      totalOtherCost,
      totalCost,
      totalKmTraveled,
      averageConsumptionKmPerL,
      costPerKm,
      fuelFillCount: data.fuelLogs.length,
      maintenanceCount: data.maintenanceLogs.length,
      finesCount: data.fines.length,
    };
  });
};

export const CATEGORY_LABELS: Record<MaintenanceCategory, { label: string; icon: string; defaultIntervalKm: number; defaultIntervalMonths: number }> = {
  troca_oleo: { label: 'Troca de Óleo do Motor', icon: 'Droplets', defaultIntervalKm: 10000, defaultIntervalMonths: 12 },
  filtro_oleo: { label: 'Filtro de Óleo', icon: 'Filter', defaultIntervalKm: 10000, defaultIntervalMonths: 12 },
  filtro_ar: { label: 'Filtro de Ar do Motor', icon: 'Wind', defaultIntervalKm: 15000, defaultIntervalMonths: 12 },
  filtro_combustivel: { label: 'Filtro de Combustível', icon: 'Fuel', defaultIntervalKm: 15000, defaultIntervalMonths: 12 },
  filtro_cabine: { label: 'Filtro de Ar-Condicionado (Cabine)', icon: 'Fan', defaultIntervalKm: 15000, defaultIntervalMonths: 12 },
  pneus_rodizio: { label: 'Rodízio de Pneus', icon: 'RotateCw', defaultIntervalKm: 10000, defaultIntervalMonths: 6 },
  pneus_troca: { label: 'Troca de Pneus', icon: 'CircleDot', defaultIntervalKm: 50000, defaultIntervalMonths: 48 },
  alinhamento_balanceamento: { label: 'Alinhamento e Balanceamento', icon: 'Compass', defaultIntervalKm: 10000, defaultIntervalMonths: 6 },
  freios_pastilhas: { label: 'Pastilhas de Freio', icon: 'Disc', defaultIntervalKm: 25000, defaultIntervalMonths: 24 },
  freios_discos: { label: 'Discos de Freio', icon: 'Disc3', defaultIntervalKm: 50000, defaultIntervalMonths: 48 },
  fluido_freio: { label: 'Fluído de Freio (DOT 4)', icon: 'ShieldAlert', defaultIntervalKm: 20000, defaultIntervalMonths: 24 },
  correia_dentada: { label: 'Correia Dentada / Tensores', icon: 'Cog', defaultIntervalKm: 50000, defaultIntervalMonths: 48 },
  velas: { label: 'Velas de Ignição', icon: 'Zap', defaultIntervalKm: 40000, defaultIntervalMonths: 36 },
  bateria: { label: 'Bateria', icon: 'BatteryCharging', defaultIntervalKm: 45000, defaultIntervalMonths: 24 },
  suspensao: { label: 'Amortecedores e Suspensão', icon: 'Sliders', defaultIntervalKm: 40000, defaultIntervalMonths: 36 },
  ar_condicionado: { label: 'Higienização do Ar Condicionado', icon: 'Sparkles', defaultIntervalKm: 15000, defaultIntervalMonths: 12 },
  arrefecimento: { label: 'Fluído de Arrefecimento (Radiador)', icon: 'Thermometer', defaultIntervalKm: 30000, defaultIntervalMonths: 24 },
  revisao_geral: { label: 'Revisão Periódica Geral', icon: 'Wrench', defaultIntervalKm: 10000, defaultIntervalMonths: 12 },
  outros: { label: 'Outro Serviço', icon: 'FileText', defaultIntervalKm: 10000, defaultIntervalMonths: 12 },
};

export const FUEL_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  gasolina: { label: 'Gasolina', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  etanol: { label: 'Etanol', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  diesel: { label: 'Diesel', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  gnv: { label: 'GNV', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  flex: { label: 'Flex', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  eletrico: { label: 'Elétrico', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  hibrido: { label: 'Híbrido', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
};
