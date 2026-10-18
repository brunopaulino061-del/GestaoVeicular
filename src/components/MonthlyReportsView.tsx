import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Fuel,
  Wrench,
  AlertOctagon,
  TrendingUp,
  Printer,
  Calculator,
  ArrowRight,
  Car,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import {
  Vehicle,
  FuelLog,
  MaintenanceLog,
  OtherExpense,
  TrafficFine,
  MonthlyStats,
} from '../types/vehicle';
import {
  formatCurrency,
  formatNumber,
  formatKm,
  formatDate,
  generateMonthlyStats,
  calculateFuelMetrics,
} from '../utils/calculations';

interface MonthlyReportsViewProps {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
  expenses: OtherExpense[];
  trafficFines: TrafficFine[];
}

export const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({
  vehicle,
  fuelLogs,
  maintenanceLogs,
  expenses,
  trafficFines,
}) => {
  const vFuelLogs = fuelLogs.filter((f) => f.vehicleId === vehicle.id);
  const vMaintLogs = maintenanceLogs.filter((m) => m.vehicleId === vehicle.id);
  const vExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);
  const vFines = trafficFines.filter((f) => f.vehicleId === vehicle.id);

  const monthlyStats = generateMonthlyStats(
    vehicle.id,
    vFuelLogs,
    vMaintLogs,
    vExpenses,
    vFines
  );

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    monthlyStats[0]?.monthKey || ''
  );

  // Trip Calculator State
  const [tripDistanceKm, setTripDistanceKm] = useState<string>('350');
  const [tripFuelPrice, setTripFuelPrice] = useState<string>('6.19');

  const activeMonthStats =
    monthlyStats.find((m) => m.monthKey === selectedMonthKey) || monthlyStats[0];

  // Previous month stats for comparison
  const activeMonthIndex = monthlyStats.findIndex((m) => m.monthKey === selectedMonthKey);
  const prevMonthStats = activeMonthIndex >= 0 ? monthlyStats[activeMonthIndex + 1] : undefined;

  let consumptionChangePercent: number | null = null;
  if (
    activeMonthStats &&
    prevMonthStats &&
    activeMonthStats.averageConsumptionKmPerL > 0 &&
    prevMonthStats.averageConsumptionKmPerL > 0
  ) {
    consumptionChangePercent = Number(
      (
        ((activeMonthStats.averageConsumptionKmPerL - prevMonthStats.averageConsumptionKmPerL) /
          prevMonthStats.averageConsumptionKmPerL) *
        100
      ).toFixed(1)
    );
  }

  // Filter logs for this specific month
  const computedAllFuel = calculateFuelMetrics(vFuelLogs);
  const monthFuelLogs = computedAllFuel.filter(
    (f) => f.date.substring(0, 7) === selectedMonthKey
  );
  const monthMaintLogs = vMaintLogs.filter(
    (m) => m.date.substring(0, 7) === selectedMonthKey
  );
  const monthFines = vFines.filter(
    (f) => f.date.substring(0, 7) === selectedMonthKey
  );

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Calculator logic
  const parsedTripDist = parseFloat(tripDistanceKm) || 0;
  const parsedTripPrice = parseFloat(tripFuelPrice) || 0;
  const refConsumption = activeMonthStats?.averageConsumptionKmPerL || 11.5;
  const estimatedTripLiters = refConsumption > 0 ? parsedTripDist / refConsumption : 0;
  const estimatedTripCost = estimatedTripLiters * parsedTripPrice;

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 no-print">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Relatórios Mensais & Consumo Médio Detalhado
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Análise aprofundada de eficiência energética (km/l), custo por quilômetro e despesas consolidadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector Dropdown */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-2 outline-hidden focus:border-amber-500"
            >
              {monthlyStats.map((ms) => (
                <option key={ms.monthKey} value={ms.monthKey}>
                  {ms.monthLabel}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Printable Report Header (visible on print or as top bar) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 print-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Relatório Executivo Mensal
            </span>
            <h3 className="text-2xl font-black text-white mt-0.5">
              {activeMonthStats?.monthLabel || 'Mês Selecionado'}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Veículo: <strong className="text-white">{vehicle.name}</strong> • {vehicle.brand} {vehicle.model} ({vehicle.year}) • Placa {vehicle.plate}
            </p>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gasto Total no Mês</span>
              <span className="text-2xl font-black font-mono text-white">
                {formatCurrency(activeMonthStats?.totalCost || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Scorecard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print-card">
        {/* Metric 1: Consumo Médio km/l */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Consumo Médio (km/l)</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {activeMonthStats?.averageConsumptionKmPerL
                ? activeMonthStats.averageConsumptionKmPerL.toFixed(2)
                : '--'}
            </span>
            <span className="text-xs font-bold text-slate-400">km/l</span>
          </div>
          {consumptionChangePercent !== null && (
            <span
              className={`text-[10px] font-mono font-bold block mt-1 ${
                consumptionChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {consumptionChangePercent >= 0 ? `+${consumptionChangePercent}% mais eficiente` : `${consumptionChangePercent}% vs mês anterior`}
            </span>
          )}
        </div>

        {/* Metric 2: Distância Percorrida */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Distância Percorrida</span>
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {activeMonthStats?.totalKmTraveled
                ? activeMonthStats.totalKmTraveled.toLocaleString('pt-BR')
                : '0'}
            </span>
            <span className="text-xs font-bold text-slate-400">KM</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {activeMonthStats?.fuelFillCount || 0} abastecimentos realizados
          </span>
        </div>

        {/* Metric 3: Custo por Km */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Custo Total por Km</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {activeMonthStats?.costPerKm ? formatCurrency(activeMonthStats.costPerKm) : 'R$ --'}
            </span>
            <span className="text-xs font-bold text-emerald-400">/ km</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Combustível + peças + encargos
          </span>
        </div>

        {/* Metric 4: Volume de Combustível */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Litros Abastecidos</span>
            <Fuel className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {activeMonthStats?.totalFuelLiters ? activeMonthStats.totalFuelLiters.toFixed(1) : '0'}
            </span>
            <span className="text-xs font-bold text-cyan-400">L</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Total em combustível: {formatCurrency(activeMonthStats?.totalFuelCost || 0)}
          </span>
        </div>
      </div>

      {/* Visual Charts: Monthly Efficiency Trend & Spend Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-card">
        {/* Monthly Consumption Evolution Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-white">Consumo Médio Mês a Mês (km/l)</h4>
              <p className="text-xs text-slate-400">Histórico de eficiência ao longo do tempo</p>
            </div>
          </div>

          <div className="h-48 flex items-end gap-3 pt-6 border-b border-slate-800 pb-2">
            {[...monthlyStats].reverse().map((stat) => {
              const c = stat.averageConsumptionKmPerL || 0;
              const maxScale = 16;
              const heightPercent = Math.min(100, Math.max(15, (c / maxScale) * 100));
              const isSelected = stat.monthKey === selectedMonthKey;

              return (
                <div
                  key={stat.monthKey}
                  onClick={() => setSelectedMonthKey(stat.monthKey)}
                  className="flex-1 flex flex-col items-center gap-1 group cursor-pointer relative"
                >
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] font-mono py-1 px-2 rounded-md shadow-lg border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                    {stat.monthLabel}: {c > 0 ? `${c.toFixed(2)} km/l` : 'Sem dados'}
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      isSelected
                        ? 'bg-amber-400 ring-2 ring-amber-300'
                        : c >= 12
                        ? 'bg-emerald-500 group-hover:bg-emerald-400'
                        : 'bg-amber-500/80 group-hover:bg-amber-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono truncate max-w-full ${
                      isSelected ? 'text-amber-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {stat.monthKey.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2">
            <span>Meses anteriores</span>
            <span>Atual</span>
          </div>
        </div>

        {/* Category Expenses Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              Composição de Gastos em {activeMonthStats?.monthLabel}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Distribuição proporcional de combustível, manutenção, multas e encargos
            </p>

            {activeMonthStats && activeMonthStats.totalCost > 0 ? (
              <div className="space-y-3">
                {/* Fuel bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5" />
                      Combustível ({((activeMonthStats.totalFuelCost / activeMonthStats.totalCost) * 100).toFixed(0)}%)
                    </span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(activeMonthStats.totalFuelCost)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{
                        width: `${(activeMonthStats.totalFuelCost / activeMonthStats.totalCost) * 100}%`,
                      }}
                      className="bg-amber-500 h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Maintenance bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-blue-400 font-semibold flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      Manutenções ({((activeMonthStats.totalMaintenanceCost / activeMonthStats.totalCost) * 100).toFixed(0)}%)
                    </span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(activeMonthStats.totalMaintenanceCost)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{
                        width: `${(activeMonthStats.totalMaintenanceCost / activeMonthStats.totalCost) * 100}%`,
                      }}
                      className="bg-blue-500 h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Fines bar */}
                {activeMonthStats.totalFinesCost > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Multas & Infrações ({((activeMonthStats.totalFinesCost / activeMonthStats.totalCost) * 100).toFixed(0)}%)
                      </span>
                      <span className="font-mono text-white font-bold">
                        {formatCurrency(activeMonthStats.totalFinesCost)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{
                          width: `${(activeMonthStats.totalFinesCost / activeMonthStats.totalCost) * 100}%`,
                        }}
                        className="bg-rose-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Other Expenses bar */}
                {activeMonthStats.totalOtherCost > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-purple-400 font-semibold flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" />
                        Outras Despesas ({((activeMonthStats.totalOtherCost / activeMonthStats.totalCost) * 100).toFixed(0)}%)
                      </span>
                      <span className="font-mono text-white font-bold">
                        {formatCurrency(activeMonthStats.totalOtherCost)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{
                          width: `${(activeMonthStats.totalOtherCost / activeMonthStats.totalCost) * 100}%`,
                        }}
                        className="bg-purple-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                Sem despesas registradas para este mês.
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Total Consolidado:</span>
            <span className="text-sm font-black font-mono text-white">
              {formatCurrency(activeMonthStats?.totalCost || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Trip & Travel Autonomy Simulator */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 no-print">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              Planejador de Viagem & Estimativa de Combustível
            </h4>
            <p className="text-xs text-slate-400">
              Calcule quanto combustível e dinheiro gastará com base no consumo real do seu veículo ({refConsumption.toFixed(1)} km/l)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Distância do Percurso (km)
            </label>
            <input
              type="number"
              min="1"
              value={tripDistanceKm}
              onChange={(e) => setTripDistanceKm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Preço Médio do Litro (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={tripFuelPrice}
              onChange={(e) => setTripFuelPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden font-bold"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Litros Necessários</span>
            <span className="text-xl font-black font-mono text-cyan-400">
              {estimatedTripLiters.toFixed(1)} L
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col justify-center">
            <span className="text-[10px] text-amber-400 uppercase font-semibold">Custo Estimado da Viagem</span>
            <span className="text-xl font-black font-mono text-amber-400">
              {formatCurrency(estimatedTripCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Table of the Selected Month */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 print-card">
        <h4 className="text-sm font-bold text-white mb-3">
          Detalhamento de Todos os Registros do Mês ({activeMonthStats?.monthLabel})
        </h4>

        {monthFuelLogs.length === 0 && monthMaintLogs.length === 0 && monthFines.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            Nenhum registro encontrado para este período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Descrição / Posto / Serviço</th>
                  <th className="py-2.5 px-3">Quilometragem</th>
                  <th className="py-2.5 px-3">Consumo / Eficiência</th>
                  <th className="py-2.5 px-3 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {monthFuelLogs.map((fuel) => (
                  <tr key={fuel.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">{formatDate(fuel.date)}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-amber-400 font-sans font-bold">⛽ Abastecimento</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {fuel.stationName || 'Posto'} ({fuel.liters.toFixed(1)}L {fuel.fuelType})
                    </td>
                    <td className="py-2.5 px-3">{formatKm(fuel.odometer)}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {fuel.consumptionKmPerL ? `${fuel.consumptionKmPerL.toFixed(2)} km/l` : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white font-bold">
                      {formatCurrency(fuel.totalCost)}
                    </td>
                  </tr>
                ))}

                {monthMaintLogs.map((maint) => (
                  <tr key={maint.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">{formatDate(maint.date)}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-blue-400 font-sans font-bold">🔧 Manutenção</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {maint.title} {maint.workshop ? `(${maint.workshop})` : ''}
                    </td>
                    <td className="py-2.5 px-3">{formatKm(maint.odometer)}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">Revisão preventiva</td>
                    <td className="py-2.5 px-3 text-right text-blue-400 font-bold">
                      {formatCurrency(maint.cost)}
                    </td>
                  </tr>
                ))}

                {monthFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">{formatDate(fine.date)}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-rose-400 font-sans font-bold">🚨 Multa</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {fine.violationType} ({fine.points} pts)
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">--</td>
                    <td className="py-2.5 px-3 font-sans text-rose-400">{fine.status.toUpperCase()}</td>
                    <td className="py-2.5 px-3 text-right text-rose-400 font-bold">
                      {formatCurrency(fine.discountedAmount || fine.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
