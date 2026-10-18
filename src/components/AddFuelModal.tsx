import React, { useState, useEffect } from 'react';
import { Fuel, X, Check, Info, Calculator } from 'lucide-react';
import { Vehicle, FuelLog, FuelType } from '../types/vehicle';
import { formatCurrency, formatKm } from '../utils/calculations';

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  lastFuelLog?: FuelLog;
  initialData?: FuelLog;
  onSave: (log: Omit<FuelLog, 'id'>) => void;
  onUpdate?: (id: string, log: Partial<FuelLog>) => void;
}

export const AddFuelModal: React.FC<AddFuelModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  lastFuelLog,
  initialData,
  onSave,
  onUpdate,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<string>(vehicle.currentOdometer.toString());
  const [fuelType, setFuelType] = useState<FuelType>(vehicle.fuelType === 'flex' ? 'gasolina' : vehicle.fuelType);
  const [pricePerLiter, setPricePerLiter] = useState<string>('6.19');
  const [liters, setLiters] = useState<string>('40.0');
  const [totalCost, setTotalCost] = useState<string>('247.60');
  const [isFullTank, setIsFullTank] = useState<boolean>(true);
  const [missedPreviousLog, setMissedPreviousLog] = useState<boolean>(false);
  const [stationName, setStationName] = useState<string>('Posto Shell');
  const [notes, setNotes] = useState<string>('');
  const [lastEditedField, setLastEditedField] = useState<'liters' | 'total'>('liters');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setOdometer(initialData.odometer.toString());
      setFuelType(initialData.fuelType);
      setPricePerLiter(initialData.pricePerLiter.toString());
      setLiters(initialData.liters.toString());
      setTotalCost(initialData.totalCost.toString());
      setIsFullTank(initialData.isFullTank);
      setMissedPreviousLog(!!initialData.missedPreviousLog);
      setStationName(initialData.stationName || '');
      setNotes(initialData.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setOdometer(vehicle.currentOdometer.toString());
      setIsFullTank(true);
      setNotes('');
    }
  }, [initialData, vehicle, isOpen]);

  if (!isOpen) return null;

  // Handle bidirectional calculation
  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    const p = parseFloat(val);
    if (!isNaN(p) && p > 0) {
      if (lastEditedField === 'liters') {
        const l = parseFloat(liters);
        if (!isNaN(l) && l > 0) {
          setTotalCost((l * p).toFixed(2));
        }
      } else {
        const t = parseFloat(totalCost);
        if (!isNaN(t) && t > 0) {
          setLiters((t / p).toFixed(2));
        }
      }
    }
  };

  const handleLitersChange = (val: string) => {
    setLiters(val);
    setLastEditedField('liters');
    const l = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    if (!isNaN(l) && !isNaN(p) && p > 0) {
      setTotalCost((l * p).toFixed(2));
    }
  };

  const handleTotalCostChange = (val: string) => {
    setTotalCost(val);
    setLastEditedField('total');
    const t = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    if (!isNaN(t) && !isNaN(p) && p > 0) {
      setLiters((t / p).toFixed(2));
    }
  };

  const parsedOdometer = parseInt(odometer, 10) || 0;
  const previousKm = lastFuelLog ? lastFuelLog.odometer : vehicle.currentOdometer;
  const kmDifference = parsedOdometer - (lastFuelLog?.odometer || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLiters = parseFloat(liters);
    const parsedPrice = parseFloat(pricePerLiter);
    const parsedTotal = parseFloat(totalCost);

    if (parsedOdometer <= 0 || isNaN(parsedOdometer)) {
      alert('Por favor informe a quilometragem do odômetro.');
      return;
    }
    if (isNaN(parsedLiters) || parsedLiters <= 0) {
      alert('Por favor informe a quantidade de litros abastecida.');
      return;
    }
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      alert('Por favor informe o valor total do abastecimento.');
      return;
    }

    const payload: Omit<FuelLog, 'id'> = {
      vehicleId: vehicle.id,
      date,
      odometer: parsedOdometer,
      fuelType,
      liters: parsedLiters,
      pricePerLiter: parsedPrice || (parsedTotal / parsedLiters),
      totalCost: parsedTotal,
      isFullTank,
      missedPreviousLog,
      stationName: stationName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (initialData && onUpdate) {
      onUpdate(initialData.id, payload);
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Abastecimento' : 'Registrar Abastecimento'}
              </h3>
              <p className="text-xs text-slate-400">{vehicle.name} • {vehicle.plate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Data do Abastecimento
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tipo de Combustível
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              >
                <option value="gasolina">Gasolina Comum / Aditivada</option>
                <option value="etanol">Etanol (Álcool)</option>
                <option value="diesel">Diesel S10 / Comum</option>
                <option value="gnv">GNV (Gás Natural)</option>
                <option value="eletrico">Elétrico (kWh)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-400">
                Odômetro Atual (km)
              </label>
              {lastFuelLog && (
                <span className="text-[11px] text-slate-500 font-mono">
                  Último: {formatKm(lastFuelLog.odometer)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-base font-bold font-mono text-white outline-hidden"
                placeholder="Ex: 48850"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                KM
              </span>
            </div>
            {lastFuelLog && kmDifference > 0 && (
              <p className="text-xs text-emerald-400 mt-1 font-mono">
                +{formatKm(kmDifference)} rodados desde o último registro
              </p>
            )}
          </div>

          {/* Pricing & Liters 3-column group */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                Cálculo Automático
              </span>
              <span className="text-[11px] text-slate-500">
                Altere litros ou valor total livremente
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Preço / Litro (R$)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  value={pricePerLiter}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-2 text-sm font-mono text-white outline-hidden"
                  placeholder="6.19"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Litros (L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={liters}
                  onChange={(e) => handleLitersChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-2 text-sm font-mono text-white outline-hidden font-bold"
                  placeholder="40.0"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-amber-400 mb-1 font-semibold">
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={totalCost}
                  onChange={(e) => handleTotalCostChange(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-500/50 focus:border-amber-500 rounded-lg px-2.5 py-2 text-sm font-mono text-amber-300 font-bold outline-hidden"
                  placeholder="247.60"
                />
              </div>
            </div>
          </div>

          {/* Full tank toggle */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800 cursor-pointer hover:bg-slate-950/80 transition-colors">
              <input
                type="checkbox"
                checked={isFullTank}
                onChange={(e) => setIsFullTank(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-white block">
                  Encheu o tanque completamente? (Tanque Cheio)
                </span>
                <span className="text-slate-400 block mt-0.5 leading-relaxed">
                  Permite o cálculo exato do consumo médio (km/l) entre dois abastecimentos completos consecutivos.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={missedPreviousLog}
                onChange={(e) => setMissedPreviousLog(e.target.checked)}
                className="rounded-sm border-slate-700 text-amber-500"
              />
              <span>Esqueci de registrar um abastecimento anterior (não calcular média nesta etapa)</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Posto / Bandeira
              </label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="Ex: Posto Shell, Ipiranga..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Observações
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Ar ligado, estrada..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {initialData ? 'Atualizar Abastecimento' : 'Salvar Abastecimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
