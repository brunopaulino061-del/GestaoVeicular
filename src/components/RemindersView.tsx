import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Gauge,
  Calendar,
  Trash2,
  Edit2,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { Vehicle, ServiceReminder, MaintenanceCategory } from '../types/vehicle';
import {
  formatKm,
  formatDate,
  getReminderEvaluation,
  CATEGORY_LABELS,
} from '../utils/calculations';

interface RemindersViewProps {
  vehicle: Vehicle;
  reminders: ServiceReminder[];
  onOpenAddModal: () => void;
  onEditReminder: (reminder: ServiceReminder) => void;
  onDeleteReminder: (id: string) => void;
  onCompleteReminder: (reminder: ServiceReminder) => void;
  onQuickPreset: (category: MaintenanceCategory) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  vehicle,
  reminders,
  onOpenAddModal,
  onEditReminder,
  onDeleteReminder,
  onCompleteReminder,
  onQuickPreset,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'urgent' | 'ok' | 'completed'>('all');

  const vReminders = reminders.filter((r) => r.vehicleId === vehicle.id);

  // Evaluate each reminder
  const evaluated = vReminders.map((r) => ({
    reminder: r,
    evaluation: getReminderEvaluation(r, vehicle.currentOdometer),
  }));

  const overdueList = evaluated.filter((e) => !e.reminder.isCompleted && e.evaluation.status === 'overdue');
  const warningList = evaluated.filter((e) => !e.reminder.isCompleted && e.evaluation.status === 'warning');
  const okList = evaluated.filter((e) => !e.reminder.isCompleted && e.evaluation.status === 'ok');
  const completedList = evaluated.filter((e) => e.reminder.isCompleted);

  const displayedList =
    filterTab === 'urgent'
      ? [...overdueList, ...warningList]
      : filterTab === 'ok'
      ? okList
      : filterTab === 'completed'
      ? completedList
      : [...overdueList, ...warningList, ...okList];

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-amber-400" />
            Lembretes Automáticos de Revisão & Troca de Óleo
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle preventivo inteligente calculado por quilometragem percorrida e datas limites.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Novo Lembrete
        </button>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Ativar Lembretes Recomendados em 1 Clique:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onQuickPreset('troca_oleo')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-950 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            🛢️ Troca de Óleo e Filtro (a cada 10.000 km)
          </button>
          <button
            onClick={() => onQuickPreset('pneus_rodizio')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-950 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            🔄 Rodízio de Pneus (a cada 5.000 km)
          </button>
          <button
            onClick={() => onQuickPreset('freios_pastilhas')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-950 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            🛑 Pastilhas de Freio (a cada 25.000 km)
          </button>
          <button
            onClick={() => onQuickPreset('correia_dentada')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-950 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            ⚙️ Correia Dentada (a cada 50.000 km)
          </button>
          <button
            onClick={() => onQuickPreset('fluido_freio')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-950 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            💧 Fluído de Freio (a cada 24 meses)
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filterTab === 'all'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Todos ({overdueList.length + warningList.length + okList.length})
        </button>
        <button
          onClick={() => setFilterTab('urgent')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            filterTab === 'urgent'
              ? 'bg-rose-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          Atenção & Vencidos ({overdueList.length + warningList.length})
        </button>
        <button
          onClick={() => setFilterTab('ok')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filterTab === 'ok'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Em Dia ({okList.length})
        </button>
        {completedList.length > 0 && (
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterTab === 'completed'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Concluídos ({completedList.length})
          </button>
        )}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Nenhum lembrete nesta categoria</p>
            <p className="text-xs text-slate-400 mt-1">
              Todos os serviços do seu veículo estão em dia ou não há lembretes configurados.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Lembrete
            </button>
          </div>
        ) : (
          displayedList.map(({ reminder, evaluation: rEval }) => {
            const isOverdue = rEval.status === 'overdue';
            const isWarning = rEval.status === 'warning';
            const isCompleted = reminder.isCompleted;

            return (
              <div
                key={reminder.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : isOverdue
                    ? 'bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/10'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-800/80 shadow-lg shadow-amber-950/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-base">{reminder.title}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-slate-800 text-slate-400'
                            : isOverdue
                            ? 'bg-rose-500 text-white'
                            : isWarning
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isCompleted ? 'Concluído' : rEval.urgencyLabel}
                      </span>
                      {reminder.intervalKm && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                          <RotateCw className="w-3 h-3 text-amber-400" />
                          A cada {reminder.intervalKm.toLocaleString('pt-BR')} km
                        </span>
                      )}
                    </div>

                    {/* Targets row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      {reminder.targetOdometer && (
                        <span className="flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          Meta de Km:{' '}
                          <strong className="font-mono text-white">
                            {formatKm(reminder.targetOdometer)}
                          </strong>
                          {rEval.remainingKm !== undefined && !isCompleted && (
                            <span
                              className={`text-[11px] font-mono ${
                                rEval.remainingKm <= 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
                              }`}
                            >
                              ({rEval.remainingKm > 0 ? `restam ${rEval.remainingKm} km` : `${Math.abs(rEval.remainingKm)} km atrasado`})
                            </span>
                          )}
                        </span>
                      )}

                      {reminder.targetDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Prazo Data:{' '}
                          <strong className="text-white">{formatDate(reminder.targetDate)}</strong>
                          {rEval.remainingDays !== undefined && !isCompleted && (
                            <span
                              className={`text-[11px] ${
                                rEval.remainingDays <= 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
                              }`}
                            >
                              ({rEval.remainingDays > 0 ? `faltam ${rEval.remainingDays} dias` : `${Math.abs(rEval.remainingDays)} dias vencido`})
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {!isCompleted && (
                      <div className="space-y-1 pt-1 max-w-md">
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${rEval.progressPercent}%` }}
                            className={`h-full rounded-full transition-all ${
                              isOverdue
                                ? 'bg-rose-500'
                                : isWarning
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>
                            Última: {reminder.lastCompletedOdometer ? formatKm(reminder.lastCompletedOdometer) : 'Início'}
                          </span>
                          <span>Odômetro atual: {formatKm(vehicle.currentOdometer)}</span>
                        </div>
                      </div>
                    )}

                    {reminder.notes && (
                      <p className="text-xs text-slate-400 italic pt-0.5">"{reminder.notes}"</p>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    {!isCompleted && (
                      <button
                        onClick={() => onCompleteReminder(reminder)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        Realizar Serviço
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditReminder(reminder)}
                        title="Editar"
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir este lembrete?')) {
                            onDeleteReminder(reminder.id);
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
