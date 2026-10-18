import React, { useState } from 'react';
import {
  Fuel,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  TrendingUp,
  Droplets,
  DollarSign,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';
import { Vehicle, FuelLog, FuelType } from '../types/vehicle';
import {
  formatCurrency,
  formatNumber,
  formatKm,
  formatDate,
  calculateFuelMetrics,
  FUEL_TYPE_LABELS,
} from '../utils/calculations';

interface FuelLogsViewProps {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  onOpenAddModal: () => void;
  onEditLog: (log: FuelLog) => void;
  onDeleteLog: (id: string) => void;
}

export const FuelLogsView: React.FC<FuelLogsViewProps> = ({
  vehicle,
  fuelLogs,
  onOpenAddModal,
  onEditLog,
  onDeleteLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const vLogs = fuelLogs.filter((f) => f.vehicleId === vehicle.id);
  const computedLogs = calculateFuelMetrics(vLogs);

  // Filtered
  const filteredLogs = computedLogs.filter((log) => {
    const matchesSearch =
      (log.stationName && log.stationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.odometer.toString().includes(searchTerm);

    const matchesType = filterType === 'all' || log.fuelType === filterType;
    return matchesSearch && matchesType;
  });

  // KPI Calculations
  const validConsumptionLogs = computedLogs.filter((l) => l.consumptionKmPerL && l.consumptionKmPerL > 0);
  const avgConsumption =
    validConsumptionLogs.length > 0
      ? validConsumptionLogs.reduce((acc, c) => acc + (c.consumptionKmPerL || 0), 0) /
        validConsumptionLogs.length
      : 0;

  const bestConsumption =
    validConsumptionLogs.length > 0
      ? Math.max(...validConsumptionLogs.map((l) => l.consumptionKmPerL || 0))
      : 0;

  const totalFuelCost = vLogs.reduce((acc, cur) => acc + (cur.totalCost || 0), 0);
  const totalLiters = vLogs.reduce((acc, cur) => acc + (cur.liters || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Fuel className="w-6 h-6 text-amber-400" />
            Controle de Abastecimentos & Consumo
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro detalhado de cada abastecimento, cálculo automático de km/l e preço por quilômetro.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Novo Abastecimento
        </button>
      </div>

      {/* KPI ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Consumo Médio</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-white">
              {avgConsumption > 0 ? avgConsumption.toFixed(2) : '--'}
            </span>
            <span className="text-xs font-bold text-amber-400">km/l</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Melhor Consumo</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {bestConsumption > 0 ? bestConsumption.toFixed(2) : '--'}
            </span>
            <span className="text-xs font-bold text-emerald-400">km/l</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Total Litros</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-white">
              {formatNumber(totalLiters, 1)}
            </span>
            <span className="text-xs font-bold text-blue-400">L</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Investimento Total</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-white">
              {formatCurrency(totalFuelCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por posto, observação ou km..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-hidden focus:border-amber-500"
          >
            <option value="all">Todos os combustíveis</option>
            <option value="gasolina">Gasolina</option>
            <option value="etanol">Etanol</option>
            <option value="diesel">Diesel</option>
            <option value="gnv">GNV</option>
          </select>
        </div>
      </div>

      {/* Fuel Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Fuel className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Nenhum abastecimento encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Registre os abastecimentos na bomba para acompanhar o consumo do veículo.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Abastecimento
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const fuelBadge = FUEL_TYPE_LABELS[log.fuelType] || FUEL_TYPE_LABELS.gasolina;
            return (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left group */}
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 shrink-0 mt-0.5">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {formatKm(log.odometer)}
                      </span>
                      {log.distanceSinceLast && (
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          +{formatKm(log.distanceSinceLast)}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${fuelBadge.color}`}>
                        {fuelBadge.label}
                      </span>
                      {log.isFullTank && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          ⛽ Tanque Cheio
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(log.date)} • {log.stationName || 'Posto de Combustível'}
                    </p>

                    {log.notes && (
                      <p className="text-xs text-slate-400 italic mt-0.5">"{log.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Right metrics group & actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  {/* Consumption badge */}
                  {log.consumptionKmPerL ? (
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-lg font-black font-mono text-emerald-400">
                          {log.consumptionKmPerL.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">km/l</span>
                      </div>
                      {log.costPerKm && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          R$ {log.costPerKm.toFixed(2)} / km
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-right text-slate-500 text-xs">
                      <span className="block italic">Média pendente</span>
                      <span className="text-[10px]">Próximo tanque cheio</span>
                    </div>
                  )}

                  {/* Volume & Cost */}
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-white block">
                      {formatCurrency(log.totalCost)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono block">
                      {formatNumber(log.liters, 2)} L • {formatCurrency(log.pricePerLiter)}/L
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditLog(log)}
                      title="Editar"
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir este abastecimento?')) {
                          onDeleteLog(log.id);
                        }
                      }}
                      title="Excluir"
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
