import React, { useState } from 'react';
import { Gauge, X, Check, ArrowRight } from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import { formatKm } from '../utils/calculations';

interface OdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onUpdate: (vehicleId: string, newOdometer: number) => void;
}

export const OdometerModal: React.FC<OdometerModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onUpdate,
}) => {
  const [odometerValue, setOdometerValue] = useState<string>(vehicle.currentOdometer.toString());
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const current = vehicle.currentOdometer;
  const parsed = parseInt(odometerValue, 10);
  const diff = !isNaN(parsed) ? parsed - current : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(parsed) || parsed <= 0) {
      setError('Por favor, insira uma quilometragem válida maior que zero.');
      return;
    }
    if (parsed < current) {
      if (!confirm(`A quilometragem informada (${formatKm(parsed)}) é menor que a atual (${formatKm(current)}). Deseja confirmar mesmo assim?`)) {
        return;
      }
    }
    onUpdate(vehicle.id, parsed);
    onClose();
  };

  const handleQuickAdd = (kmToAdd: number) => {
    const updated = (isNaN(parsed) ? current : parsed) + kmToAdd;
    setOdometerValue(updated.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Atualizar Odômetro</h3>
            <p className="text-xs text-slate-400">{vehicle.name} • {vehicle.plate}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Quilometragem anterior</span>
              <span className="font-mono text-slate-300">{formatKm(current)}</span>
            </div>
            {diff !== 0 && !isNaN(parsed) && (
              <div className="flex items-center gap-2 text-xs font-medium mt-1">
                <span className="text-slate-400">Diferença:</span>
                <span className={diff > 0 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                  {diff > 0 ? `+${formatKm(diff)} rodados` : `${formatKm(diff)}`}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Nova Quilometragem Atual (km)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                autoFocus
                value={odometerValue}
                onChange={(e) => {
                  setOdometerValue(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-xl font-bold font-mono text-white placeholder-slate-600 outline-hidden transition-all"
                placeholder="Ex: 48950"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                KM
              </span>
            </div>
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          {/* Quick increments */}
          <div>
            <span className="text-xs text-slate-500 block mb-1.5">Atalhos rápidos de percurso:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(50)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                +50 km
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(100)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                +100 km
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(250)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                +250 km
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(500)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                +500 km
              </button>
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
              Salvar Odômetro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
