import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Scale,
  Calendar,
  MapPin,
  Clock,
  ShieldAlert,
  FileText,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Vehicle, TrafficFine, FineStatus } from '../types/vehicle';
import {
  formatCurrency,
  formatDate,
  FINE_SEVERITY_META,
  FINE_STATUS_META,
} from '../utils/calculations';

interface TrafficFinesViewProps {
  vehicle: Vehicle;
  trafficFines: TrafficFine[];
  onOpenAddModal: () => void;
  onEditFine: (fine: TrafficFine) => void;
  onDeleteFine: (id: string) => void;
  onMarkAsPaid: (id: string, paymentDate: string, amountPaid?: number) => void;
}

export const TrafficFinesView: React.FC<TrafficFinesViewProps> = ({
  vehicle,
  trafficFines,
  onOpenAddModal,
  onEditFine,
  onDeleteFine,
  onMarkAsPaid,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedAppealId, setExpandedAppealId] = useState<string | null>(null);

  const vFines = trafficFines
    .filter((f) => f.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredFines = vFines.filter((fine) => {
    const matchesSearch =
      fine.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fine.aitNumber && fine.aitNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fine.location && fine.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fine.code && fine.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fine.appealProtocol && fine.appealProtocol.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || fine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Analytics
  const totalPaid = vFines
    .filter((f) => f.status === 'pago')
    .reduce((acc, cur) => acc + (cur.discountedAmount || cur.amount), 0);

  const totalPending = vFines
    .filter((f) => f.status === 'pendente')
    .reduce((acc, cur) => acc + cur.amount, 0);

  const totalPoints = vFines
    .filter((f) => f.status !== 'recurso_deferido')
    .reduce((acc, cur) => acc + cur.points, 0);

  const activeAppealsCount = vFines.filter((f) => f.status === 'em_recurso').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
            Controle de Multas, Infrações & Recursos (CTB)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de autuações, acompanhamento de pontuação na CNH, prazos de pagamento e defesas jurídicas.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Registrar Multa
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* KPI 1: Pontos CNH */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Pontos Ativos CNH</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-black font-mono ${totalPoints >= 20 ? 'text-rose-400' : 'text-white'}`}>
              {totalPoints}
            </span>
            <span className="text-xs font-bold text-slate-400">pontos</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {totalPoints >= 20 ? '⚠️ Risco de suspensão (CTB)' : 'Abaixo do limite de 40 pts'}
          </span>
        </div>

        {/* KPI 2: Total Pago */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Total Pago em Multas</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {vFines.filter((f) => f.status === 'pago').length} multas quitadas
          </span>
        </div>

        {/* KPI 3: Em Aberto */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Aguardando Pagamento</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-amber-400">
              {formatCurrency(totalPending)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {vFines.filter((f) => f.status === 'pendente').length} pendentes
          </span>
        </div>

        {/* KPI 4: Recursos Ativos */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Recursos em Andamento</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-purple-400">
              {activeAppealsCount}
            </span>
            <span className="text-xs font-bold text-slate-400">processos</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Defesa Prévia / JARI / CETRAN
          </span>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição da infração, AIT, local, protocolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-hidden focus:border-rose-500"
          >
            <option value="all">Todos os status</option>
            <option value="pendente">Aguardando Pagamento</option>
            <option value="pago">Pagas</option>
            <option value="em_recurso">Em Recurso</option>
            <option value="recurso_deferido">Recurso Deferido (Anulada)</option>
            <option value="recurso_indeferido">Recurso Indeferido</option>
          </select>
        </div>
      </div>

      {/* Fines List */}
      <div className="space-y-3">
        {filteredFines.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Nenhuma infração registrada</p>
            <p className="text-xs text-slate-400 mt-1">
              Excelente! Seu veículo não possui multas pendentes ou registradas neste filtro.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Registrar Infração
            </button>
          </div>
        ) : (
          filteredFines.map((fine) => {
            const sevMeta = FINE_SEVERITY_META[fine.severity] || FINE_SEVERITY_META.media;
            const statMeta = FINE_STATUS_META[fine.status] || FINE_STATUS_META.pendente;
            const hasAppeal = !!fine.appealNotes || !!fine.appealProtocol || fine.status === 'em_recurso';
            const isAppealExpanded = expandedAppealId === fine.id;

            return (
              <div
                key={fine.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left content */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-base">
                        {fine.violationType}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sevMeta.badgeColor}`}>
                        {sevMeta.label} ({fine.points} pts)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statMeta.badgeColor}`}>
                        {statMeta.label}
                      </span>
                      {fine.code && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          Cód. {fine.code}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(fine.date)} {fine.time ? `às ${fine.time}` : ''}
                      </span>
                      {fine.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {fine.location}
                        </span>
                      )}
                      {fine.issuingAuthority && (
                        <span className="text-slate-400">
                          Órgão: <strong className="text-slate-300">{fine.issuingAuthority}</strong>
                        </span>
                      )}
                      {fine.aitNumber && (
                        <span className="font-mono text-slate-500">
                          AIT: {fine.aitNumber}
                        </span>
                      )}
                    </div>

                    {fine.dueDate && fine.status !== 'pago' && (
                      <p className="text-xs text-amber-400/90 font-medium">
                        ⏰ Data limite para pagamento / recurso: {formatDate(fine.dueDate)}
                      </p>
                    )}

                    {fine.paymentDate && fine.status === 'pago' && (
                      <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pago em {formatDate(fine.paymentDate)}
                      </p>
                    )}

                    {fine.notes && (
                      <p className="text-xs text-slate-300 italic pt-0.5">
                        "{fine.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Amounts & Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-xl font-black font-mono text-rose-400 block">
                        {formatCurrency(fine.amount)}
                      </span>
                      {fine.discountedAmount && (
                        <span className="text-xs font-mono text-emerald-400 font-semibold block">
                          Com desconto SNE: {formatCurrency(fine.discountedAmount)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {fine.status === 'pendente' && (
                        <button
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            onMarkAsPaid(fine.id, today, fine.discountedAmount || fine.amount);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Marcar Paga
                        </button>
                      )}

                      <button
                        onClick={() => onEditFine(fine)}
                        title="Editar multa ou recurso"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir este registro de multa?')) {
                            onDeleteFine(fine.id);
                          }
                        }}
                        title="Excluir"
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appeals Details Dropdown / Box */}
                {hasAppeal && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setExpandedAppealId(isAppealExpanded ? null : fine.id)}
                      className="flex items-center justify-between w-full text-left text-xs text-purple-300 hover:text-purple-200 py-1 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Scale className="w-3.5 h-3.5 text-purple-400" />
                        Detalhes do Recurso / Defesa Prévia
                        {fine.appealProtocol && (
                          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.2 rounded border border-purple-800/60">
                            Protocolo: {fine.appealProtocol}
                          </span>
                        )}
                      </span>
                      {isAppealExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isAppealExpanded && (
                      <div className="mt-2 p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-slate-200 space-y-2 animate-in fade-in duration-100">
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-purple-300">
                          {fine.appealStatus && (
                            <span>
                              Instância: <strong>{fine.appealStatus.replace('_', ' ').toUpperCase()}</strong>
                            </span>
                          )}
                          {fine.appealDate && (
                            <span>
                              Data de Entrada: <strong>{formatDate(fine.appealDate)}</strong>
                            </span>
                          )}
                        </div>

                        {fine.appealNotes && (
                          <div>
                            <span className="font-semibold text-purple-200 block mb-0.5">
                              Fundamentação & Argumentos da Defesa:
                            </span>
                            <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-purple-900/30 whitespace-pre-wrap">
                              {fine.appealNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
