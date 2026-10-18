import React, { useState, useEffect } from 'react';
import { BellRing, X, Check, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { Vehicle, ServiceReminder, MaintenanceCategory } from '../types/vehicle';
import { CATEGORY_LABELS } from '../utils/calculations';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  initialData?: ServiceReminder;
  onSave: (reminder: Omit<ServiceReminder, 'id' | 'isCompleted'>) => void;
  onUpdate?: (id: string, reminder: Partial<ServiceReminder>) => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  initialData,
  onSave,
  onUpdate,
}) => {
  const [title, setTitle] = useState<string>('Troca de Óleo e Filtro do Motor');
  const [category, setCategory] = useState<MaintenanceCategory>('troca_oleo');
  const [targetOdometer, setTargetOdometer] = useState<string>(
    (vehicle.currentOdometer + 10000).toString()
  );
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    return d.toISOString().split('T')[0];
  });
  const [intervalKm, setIntervalKm] = useState<string>('10000');
  const [intervalMonths, setIntervalMonths] = useState<string>('12');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setTargetOdometer(initialData.targetOdometer ? initialData.targetOdometer.toString() : '');
      setTargetDate(initialData.targetDate || '');
      setIntervalKm(initialData.intervalKm ? initialData.intervalKm.toString() : '');
      setIntervalMonths(initialData.intervalMonths ? initialData.intervalMonths.toString() : '');
      setNotes(initialData.notes || '');
    } else {
      setTitle('Troca de Óleo e Filtro do Motor');
      setCategory('troca_oleo');
      setTargetOdometer((vehicle.currentOdometer + 10000).toString());
      const d = new Date();
      d.setMonth(d.getMonth() + 12);
      setTargetDate(d.toISOString().split('T')[0]);
      setIntervalKm('10000');
      setIntervalMonths('12');
      setNotes('');
    }
  }, [initialData, vehicle, isOpen]);

  if (!isOpen) return null;

  const applyPreset = (presetCategory: MaintenanceCategory) => {
    const info = CATEGORY_LABELS[presetCategory];
    setCategory(presetCategory);
    setTitle(info.label);
    setIntervalKm(info.defaultIntervalKm.toString());
    setIntervalMonths(info.defaultIntervalMonths.toString());
    setTargetOdometer((vehicle.currentOdometer + info.defaultIntervalKm).toString());

    const d = new Date();
    d.setMonth(d.getMonth() + info.defaultIntervalMonths);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor informe o título do lembrete.');
      return;
    }

    const parsedTargetKm = parseInt(targetOdometer, 10);
    const parsedIntervalKm = parseInt(intervalKm, 10);
    const parsedIntervalMonths = parseInt(intervalMonths, 10);

    const payload: Omit<ServiceReminder, 'id' | 'isCompleted'> = {
      vehicleId: vehicle.id,
      title: title.trim(),
      category,
      targetOdometer: !isNaN(parsedTargetKm) && parsedTargetKm > 0 ? parsedTargetKm : undefined,
      targetDate: targetDate.trim() || undefined,
      intervalKm: !isNaN(parsedIntervalKm) && parsedIntervalKm > 0 ? parsedIntervalKm : undefined,
      intervalMonths: !isNaN(parsedIntervalMonths) && parsedIntervalMonths > 0 ? parsedIntervalMonths : undefined,
      lastCompletedOdometer: vehicle.currentOdometer,
      lastCompletedDate: new Date().toISOString().split('T')[0],
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
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Lembrete de Serviço' : 'Novo Lembrete de Revisão'}
              </h3>
              <p className="text-xs text-slate-400">
                Alerta automático por quilometragem e por data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Carousel */}
        {!initialData && (
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Lembretes Rápidos Recomendados:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('troca_oleo')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 transition-colors"
              >
                🛢️ Troca de Óleo (10.000 km)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('pneus_rodizio')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 transition-colors"
              >
                🔄 Rodízio de Pneus (5.000 km)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('freios_pastilhas')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 transition-colors"
              >
                🛑 Pastilhas de Freio (25.000 km)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('correia_dentada')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 transition-colors"
              >
                ⚙️ Correia Dentada (50.000 km)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('fluido_freio')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 transition-colors"
              >
                💧 Fluído de Freio (2 anos)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Título do Lembrete
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Troca de Óleo e Filtro"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
            >
              {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
                <option key={catKey} value={catKey}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-400">
                  Quilometragem Alvo (km)
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  Atual: {vehicle.currentOdometer.toLocaleString('pt-BR')} km
                </span>
              </div>
              <input
                type="number"
                step="100"
                min="0"
                value={targetOdometer}
                onChange={(e) => setTargetOdometer(e.target.value)}
                placeholder="Ex: 50000"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Data Alvo Limite
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Recorrência / Repetição Periódica (após conclusão)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Intervalo em Km
                </label>
                <input
                  type="number"
                  step="500"
                  value={intervalKm}
                  onChange={(e) => setIntervalKm(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Intervalo em Meses
                </label>
                <input
                  type="number"
                  min="1"
                  value={intervalMonths}
                  onChange={(e) => setIntervalMonths(e.target.value)}
                  placeholder="Ex: 12"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Observações / Especificação Técnica
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Óleo sintético 0W-20 API SP, trocar arruela de vedação do bujão."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-hidden resize-none"
            />
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
              {initialData ? 'Atualizar Lembrete' : 'Salvar Lembrete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
