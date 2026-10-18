import React from 'react';
import {
  Gauge,
  Fuel,
  Wrench,
  BellRing,
  AlertOctagon,
  TrendingUp,
  ArrowUpRight,
  Car,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  Vehicle,
  FuelLog,
  MaintenanceLog,
  ServiceReminder,
  TrafficFine,
  OtherExpense,
} from '../types/vehicle';
import {
  formatCurrency,
  formatKm,
  formatNumber,
  formatDate,
  calculateFuelMetrics,
  getReminderEvaluation,
  generateMonthlyStats,
  CATEGORY_LABELS,
  FINE_SEVERITY_META,
} from '../utils/calculations';
import { TabKey } from './Navigation';

interface DashboardViewProps {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
  reminders: ServiceReminder[];
  trafficFines: TrafficFine[];
  expenses: OtherExpense[];
  onNavigateTab: (tab: TabKey) => void;
  onOpenOdometerModal: () => void;
  onOpenAddFuelModal: () => void;
  onOpenAddMaintenanceModal: () => void;
  onOpenAddReminderModal: () => void;
  onOpenAddFineModal: () => void;
  onCompleteReminder: (reminder: ServiceReminder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicle,
  fuelLogs,
  maintenanceLogs,
  reminders,
  trafficFines,
  expenses,
  onNavigateTab,
  onOpenOdometerModal,
  onOpenAddFuelModal,
  onOpenAddMaintenanceModal,
  onOpenAddReminderModal,
  onOpenAddFineModal,
  onCompleteReminder,
}) => {
  const vFuelLogs = fuelLogs.filter((f) => f.vehicleId === vehicle.id);
  const vMaintLogs = maintenanceLogs.filter((m) => m.vehicleId === vehicle.id);
  const vReminders = reminders.filter((r) => r.vehicleId === vehicle.id && !r.isCompleted);
  const vFines = trafficFines.filter((f) => f.vehicleId === vehicle.id);
  const vExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);

  const computedFuelLogs = calculateFuelMetrics(vFuelLogs);
  const monthlyStats = generateMonthlyStats(vehicle.id, vFuelLogs, vMaintLogs, vExpenses, vFines);
  const currentMonthStats = monthlyStats[0];

  // Calculate overall average consumption
  const validConsumptionLogs = computedFuelLogs.filter((l) => l.consumptionKmPerL && l.consumptionKmPerL > 0);
  const avgConsumption =
    validConsumptionLogs.length > 0
      ? validConsumptionLogs.reduce((acc, c) => acc + (c.consumptionKmPerL || 0), 0) /
        validConsumptionLogs.length
      : 0;

  // Calculate overall cost per km
  const totalKmDriven = computedFuelLogs.reduce((acc, c) => acc + (c.distanceSinceLast || 0), 0);
  const totalAllSpend =
    vFuelLogs.reduce((acc, c) => acc + (c.totalCost || 0), 0) +
    vMaintLogs.reduce((acc, c) => acc + (c.cost || 0), 0) +
    vExpenses.reduce((acc, c) => acc + (c.cost || 0), 0) +
    vFines
      .filter((f) => f.status !== 'recurso_deferido')
      .reduce((acc, c) => acc + (c.discountedAmount && c.status === 'pago' ? c.discountedAmount : c.amount), 0);

  const costPerKm = totalKmDriven > 0 ? totalAllSpend / totalKmDriven : 0;

  // Reminders evaluated
  const evaluatedReminders = vReminders.map((r) => ({
    reminder: r,
    eval: getReminderEvaluation(r, vehicle.currentOdometer),
  }));

  const urgentAlerts = evaluatedReminders.filter(
    (item) => item.eval.status === 'overdue' || item.eval.status === 'warning'
  );

  // Estimated autonomy on full tank
  const estimatedAutonomyKm =
    avgConsumption > 0 && vehicle.tankCapacityLiters
      ? Math.round(avgConsumption * vehicle.tankCapacityLiters)
      : 0;

  // Accumulated fine points
  const activeFinePoints = vFines
    .filter((f) => f.status !== 'recurso_deferido')
    .reduce((acc, cur) => acc + cur.points, 0);

  // Recent 6 fuelings for mini sparkline chart
  const recentFuelForChart = [...computedFuelLogs].reverse().slice(-6);

  return (
    <div className="space-y-6">
      {/* Urgent Reminders / Oil Change Alerts Banner */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-2">
          {urgentAlerts.slice(0, 2).map(({ reminder, eval: rEval }) => (
            <div
              key={reminder.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ${
                rEval.status === 'overdue'
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200 shadow-rose-950/20'
                  : 'bg-amber-950/40 border-amber-800 text-amber-200 shadow-amber-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    rEval.status === 'overdue'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{reminder.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rEval.status === 'overdue'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {rEval.urgencyLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {reminder.targetOdometer && (
                      <span>Limite: {formatKm(reminder.targetOdometer)} </span>
                    )}
                    {reminder.targetDate && (
                      <span>• Data limite: {formatDate(reminder.targetDate)}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onCompleteReminder(reminder)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Marcar Realizado
                </button>
                <button
                  onClick={() => onNavigateTab('reminders')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Ver Lembretes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Hero Overview Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full ring-4 ring-slate-800"
                style={{ backgroundColor: vehicle.color || '#0284c7' }}
              />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {vehicle.name}
              </h2>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-800 text-amber-400 rounded-md border border-slate-700">
                {vehicle.plate}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {vehicle.brand} {vehicle.model} • Ano {vehicle.year} • Motor {vehicle.fuelType.toUpperCase()} • Tanque de {vehicle.tankCapacityLiters}L
            </p>
          </div>

          {/* Quick Metrics Bar on Card */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Quilometragem Atual</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  {formatNumber(vehicle.currentOdometer, 0)}
                </span>
                <span className="text-xs text-slate-500 font-mono font-bold">KM</span>
              </div>
              <button
                onClick={onOpenOdometerModal}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold mt-0.5 inline-block cursor-pointer underline underline-offset-2"
              >
                Atualizar odômetro
              </button>
            </div>

            {estimatedAutonomyKm > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Autonomia Estimada</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                    ~{estimatedAutonomyKm}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-bold">KM</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Com tanque cheio ({avgConsumption.toFixed(1)} km/l)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Consumo Médio */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Consumo Médio Geral</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {avgConsumption > 0 ? avgConsumption.toFixed(2) : '--'}
            </span>
            <span className="text-xs font-bold text-amber-400">KM / L</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {validConsumptionLogs.length} medições completas
            </span>
            <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Ver análise <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Custo Médio por KM */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Custo Total por Km</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {costPerKm > 0 ? formatCurrency(costPerKm) : 'R$ --'}
            </span>
            <span className="text-xs font-bold text-emerald-400">/ KM</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">{formatKm(totalKmDriven)} registrados</span>
            <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Detalhes <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: Gastos no Mês Atual */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">
              Gastos em {currentMonthStats ? currentMonthStats.monthLabel : 'Mês Atual'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {currentMonthStats ? formatCurrency(currentMonthStats.totalCost) : 'R$ 0,00'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Combustível: {currentMonthStats ? formatCurrency(currentMonthStats.totalFuelCost) : 'R$ 0'}
            </span>
            <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Relatório <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Multas & Pontos CNH */}
        <div
          onClick={() => onNavigateTab('fines')}
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Multas & CNH</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono ${activeFinePoints > 15 ? 'text-rose-400' : 'text-white'}`}>
              {activeFinePoints}
            </span>
            <span className="text-xs font-bold text-rose-400">PONTOS CNH</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">{vFines.length} infrações listadas</span>
            <span className="text-rose-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Gerenciar <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
          Ações Rápidas do Veículo
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenAddFuelModal}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <Fuel className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Abastecer</span>
              <span className="text-[11px] text-slate-400">Registrar bomba</span>
            </div>
          </button>

          <button
            onClick={onOpenAddMaintenanceModal}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 hover:bg-blue-500/10 border border-slate-800 hover:border-blue-500/30 transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Manutenção</span>
              <span className="text-[11px] text-slate-400">Serviço / revisão</span>
            </div>
          </button>

          <button
            onClick={onOpenAddReminderModal}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Novo Lembrete</span>
              <span className="text-[11px] text-slate-400">Troca de óleo / prazo</span>
            </div>
          </button>

          <button
            onClick={onOpenAddFineModal}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Nova Multa</span>
              <span className="text-[11px] text-slate-400">Infração & recurso</span>
            </div>
          </button>
        </div>
      </div>

      {/* Two Columns: Recent Consumption Mini Chart & Active Reminders Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Consumption Trend Chart Preview */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Evolução do Consumo (km/l)</h3>
                <p className="text-xs text-slate-400">Últimos abastecimentos registrados com tanque cheio</p>
              </div>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Ver gráficos detalhados
              </button>
            </div>

            {/* Sparkline / Bar visualization */}
            {recentFuelForChart.filter((f) => f.consumptionKmPerL).length > 0 ? (
              <div className="space-y-3 mt-4">
                <div className="h-36 flex items-end gap-3 pt-6 border-b border-slate-800 pb-2">
                  {recentFuelForChart.map((log) => {
                    const c = log.consumptionKmPerL || 0;
                    const maxScale = 16; // 16 km/l max scale
                    const heightPercent = Math.min(100, Math.max(15, (c / maxScale) * 100));
                    return (
                      <div key={log.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Hover tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] font-mono py-1 px-2 rounded-md shadow-lg border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                          {c > 0 ? `${c.toFixed(2)} km/l` : 'Parcial'} ({formatDate(log.date)})
                        </div>

                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all ${
                            c >= 12
                              ? 'bg-emerald-500 group-hover:bg-emerald-400'
                              : c >= 10
                              ? 'bg-amber-500 group-hover:bg-amber-400'
                              : 'bg-orange-500 group-hover:bg-orange-400'
                          }`}
                        />
                        <span className="text-[10px] text-slate-400 font-mono font-medium truncate max-w-full">
                          {c > 0 ? `${c.toFixed(1)}` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Abastecimentos anteriores</span>
                  <span>Último</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Cadastre pelo menos 2 abastecimentos com tanque cheio para calcular o histórico de consumo.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Melhor consumo registrado:</span>
            <span className="font-mono font-bold text-emerald-400">
              {validConsumptionLogs.length > 0
                ? `${Math.max(...validConsumptionLogs.map((l) => l.consumptionKmPerL || 0)).toFixed(2)} km/l`
                : '--'}
            </span>
          </div>
        </div>

        {/* Right: Active Service Reminders */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Lembretes & Trocas Preventivas</h3>
                <p className="text-xs text-slate-400">
                  Acompanhamento de óleo, filtros e componentes
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('reminders')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Gerenciar todos ({vReminders.length})
              </button>
            </div>

            <div className="space-y-3">
              {vReminders.slice(0, 3).map((r) => {
                const rEval = getReminderEvaluation(r, vehicle.currentOdometer);
                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{r.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rEval.status === 'overdue'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : rEval.status === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {rEval.urgencyLabel}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${rEval.progressPercent}%` }}
                        className={`h-full rounded-full transition-all ${
                          rEval.status === 'overdue'
                            ? 'bg-rose-500'
                            : rEval.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {r.targetOdometer ? `Meta: ${formatKm(r.targetOdometer)}` : ''}
                        {r.targetDate ? ` • ${formatDate(r.targetDate)}` : ''}
                      </span>
                      <button
                        onClick={() => onCompleteReminder(r)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] cursor-pointer"
                      >
                        Concluir serviço
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={onOpenAddReminderModal}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              Adicionar Novo Lembrete Automático
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Feed */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Últimos Registros do Veículo</h3>
            <p className="text-xs text-slate-400">Abastecimentos, serviços e infrações recentes</p>
          </div>
          <button
            onClick={() => onNavigateTab('fuel')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Ver histórico completo
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {computedFuelLogs.slice(0, 3).map((fuel) => (
            <div key={fuel.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Abastecimento • {formatNumber(fuel.liters, 1)}L {fuel.fuelType}
                    </span>
                    {fuel.consumptionKmPerL && (
                      <span className="px-1.5 py-0.2 rounded-sm bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                        {fuel.consumptionKmPerL.toFixed(1)} km/l
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {formatDate(fuel.date)} • {formatKm(fuel.odometer)} • {fuel.stationName || 'Posto'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono text-white block">
                  {formatCurrency(fuel.totalCost)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatCurrency(fuel.pricePerLiter)}/L
                </span>
              </div>
            </div>
          ))}

          {vMaintLogs.slice(0, 2).map((maint) => (
            <div key={maint.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{maint.title}</span>
                  <p className="text-[11px] text-slate-400">
                    {formatDate(maint.date)} • {formatKm(maint.odometer)} • {maint.workshop || 'Oficina'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono text-blue-400 block">
                  {formatCurrency(maint.cost)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
