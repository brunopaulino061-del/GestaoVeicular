import React, { useState } from 'react';
import { CheckCircle2, X, Check, Wrench } from 'lucide-react';
import { Vehicle, ServiceReminder } from '../types/vehicle';
import { formatKm } from '../utils/calculations';

interface CompleteReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: ServiceReminder | null;
  vehicle: Vehicle;
  onComplete: (
    reminderId: string,
    performedDate: string,
    odometer: number,
    cost?: number,
    workshop?: string
  ) => void;
}

export const CompleteReminderModal: React.FC<CompleteReminderModalProps> = ({
  isOpen,
  onClose,
  reminder,
  vehicle,
  onComplete,
}) => {
  if (!isOpen || !reminder) return null;

  const [performedDate, setPerformedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [odometer, setOdometer] = useState<string>(
    vehicle.currentOdometer.toString()
  );
  const [cost, setCost] = useState<string>('');
  const [workshop, setWorkshop] = useState<string>('');
  const [recordMaintenance, setRecordMaintenance] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedKm = parseInt(odometer, 10);
    const parsedCost = parseFloat(cost);

    if (isNaN(parsedKm) || parsedKm <= 0) {
      alert('Por favor informe a quilometragem em que o serviço foi realizado.');
      return;
    }

    onComplete(
      reminder.id,
      performedDate,
      parsedKm,
      recordMaintenance && !isNaN(parsedCost) ? parsedCost : undefined,
      recordMaintenance ? workshop.trim() || undefined : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Concluir Serviço</h3>
              <p className="text-xs text-slate-400">{reminder.title}</p>
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
                Data Realizada
              </label>
              <input
                type="date"
                required
                value={performedDate}
                onChange={(e) => setPerformedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Quilometragem (km)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden font-bold"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={recordMaintenance}
                onChange={(e) => setRecordMaintenance(e.target.checked)}
                className="rounded-sm border-emerald-500 text-emerald-500 focus:ring-emerald-400"
              />
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                Registrar automaticamente no Histórico de Manutenções
              </span>
            </label>

            {recordMaintenance && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Valor Pago (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Ex: 350.00"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-300 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Oficina / Local
                  </label>
                  <input
                    type="text"
                    value={workshop}
                    onChange={(e) => setWorkshop(e.target.value)}
                    placeholder="Ex: Concessionária / Centro Automotivo"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {reminder.intervalKm || reminder.intervalMonths ? (
            <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              🔄 <strong>Próximo ciclo automático:</strong> O lembrete será recalculado para mais{' '}
              {reminder.intervalKm ? `${reminder.intervalKm.toLocaleString('pt-BR')} km` : ''}
              {reminder.intervalKm && reminder.intervalMonths ? ' ou ' : ''}
              {reminder.intervalMonths ? `${reminder.intervalMonths} meses` : ''}.
            </p>
          ) : null}

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
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Confirmar Conclusão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
