import React, { useState, useEffect } from 'react';
import { Wrench, X, Check, BellRing, Calendar } from 'lucide-react';
import { Vehicle, MaintenanceLog, MaintenanceCategory } from '../types/vehicle';
import { CATEGORY_LABELS } from '../utils/calculations';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  initialData?: MaintenanceLog;
  onSave: (
    log: Omit<MaintenanceLog, 'id'>,
    createReminder?: { intervalKm?: number; intervalMonths?: number }
  ) => void;
  onUpdate?: (id: string, log: Partial<MaintenanceLog>) => void;
}

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  initialData,
  onSave,
  onUpdate,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<string>(vehicle.currentOdometer.toString());
  const [category, setCategory] = useState<MaintenanceCategory>('troca_oleo');
  const [title, setTitle] = useState<string>('Troca de Óleo do Motor e Filtros');
  const [description, setDescription] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [workshop, setWorkshop] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Auto reminder creation
  const [createAutoReminder, setCreateAutoReminder] = useState<boolean>(true);
  const [intervalKm, setIntervalKm] = useState<number>(10000);
  const [intervalMonths, setIntervalMonths] = useState<number>(12);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setOdometer(initialData.odometer.toString());
      setCategory(initialData.category);
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCost(initialData.cost ? initialData.cost.toString() : '');
      setWorkshop(initialData.workshop || '');
      setInvoiceNumber(initialData.invoiceNumber || '');
      setNotes(initialData.notes || '');
      setCreateAutoReminder(false);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setOdometer(vehicle.currentOdometer.toString());
      setCategory('troca_oleo');
      setTitle('Troca de Óleo do Motor e Filtros');
      setDescription('');
      setCost('');
      setWorkshop('');
      setInvoiceNumber('');
      setNotes('');
      setCreateAutoReminder(true);
      setIntervalKm(CATEGORY_LABELS.troca_oleo.defaultIntervalKm);
      setIntervalMonths(CATEGORY_LABELS.troca_oleo.defaultIntervalMonths);
    }
  }, [initialData, vehicle, isOpen]);

  // Update default interval and title when category changes
  const handleCategoryChange = (cat: MaintenanceCategory) => {
    setCategory(cat);
    const catMeta = CATEGORY_LABELS[cat];
    if (catMeta) {
      if (!initialData) {
        setTitle(catMeta.label);
        setIntervalKm(catMeta.defaultIntervalKm);
        setIntervalMonths(catMeta.defaultIntervalMonths);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedKm = parseInt(odometer, 10);
    const parsedCost = parseFloat(cost) || 0;

    if (isNaN(parsedKm) || parsedKm < 0) {
      alert('Por favor informe a quilometragem do serviço.');
      return;
    }

    if (!title.trim()) {
      alert('Por favor informe o título ou descrição do serviço.');
      return;
    }

    const payload: Omit<MaintenanceLog, 'id'> = {
      vehicleId: vehicle.id,
      date,
      odometer: parsedKm,
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      cost: parsedCost,
      workshop: workshop.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      nextScheduledKm: createAutoReminder && intervalKm ? parsedKm + intervalKm : undefined,
      notes: notes.trim() || undefined,
    };

    if (initialData && onUpdate) {
      onUpdate(initialData.id, payload);
    } else {
      onSave(payload, createAutoReminder ? { intervalKm, intervalMonths } : undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Manutenção' : 'Registrar Manutenção / Revisão'}
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
                Data do Serviço
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
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
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden font-bold"
                placeholder="48850"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Categoria do Serviço
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as MaintenanceCategory)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
            >
              {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
                <option key={catKey} value={catKey}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Título / Descrição Curta
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Troca de Óleo 0W-20 Sintético + Filtro"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Ex: 480.00"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 font-bold outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Oficina / Mecânica
              </label>
              <input
                type="text"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                placeholder="Ex: Concessionária / Oficina X"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Nº Nota Fiscal / O.S. (opcional)
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ex: NF-12938"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Detalhes das Peças / Marca
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Filtro Mann, Óleo Motul"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
          </div>

          {/* Automatic Reminder Section */}
          {!initialData && (
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAutoReminder}
                  onChange={(e) => setCreateAutoReminder(e.target.checked)}
                  className="rounded-sm border-blue-500 text-blue-500 focus:ring-blue-400"
                />
                <span className="text-xs font-semibold text-blue-200 flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-blue-400" />
                  Criar lembrete automático para a próxima troca / revisão
                </span>
              </label>

              {createAutoReminder && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Repetir a cada (km)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={intervalKm}
                      onChange={(e) => setIntervalKm(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Próxima aos {parseInt(odometer, 10) ? (parseInt(odometer, 10) + (intervalKm || 0)).toLocaleString('pt-BR') : 0} km
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Ou a cada (meses)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={intervalMonths}
                      onChange={(e) => setIntervalMonths(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      O que ocorrer primeiro
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

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
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {initialData ? 'Atualizar Manutenção' : 'Salvar Manutenção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
