import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  Receipt,
  FileCheck,
  BellRing,
  HelpCircle,
} from 'lucide-react';
import { Vehicle, MaintenanceLog, MaintenanceCategory } from '../types/vehicle';
import {
  formatCurrency,
  formatKm,
  formatDate,
  CATEGORY_LABELS,
} from '../utils/calculations';

interface MaintenanceViewProps {
  vehicle: Vehicle;
  maintenanceLogs: MaintenanceLog[];
  onOpenAddModal: () => void;
  onEditLog: (log: MaintenanceLog) => void;
  onDeleteLog: (id: string) => void;
  onQuickCreateReminder: (category: MaintenanceCategory) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  vehicle,
  maintenanceLogs,
  onOpenAddModal,
  onEditLog,
  onDeleteLog,
  onQuickCreateReminder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showGuide, setShowGuide] = useState(false);

  const vLogs = maintenanceLogs
    .filter((m) => m.vehicleId === vehicle.id)
    .sort((a, b) => {
      if (b.odometer !== a.odometer) return b.odometer - a.odometer;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const filteredLogs = vLogs.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.workshop && m.workshop.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.invoiceNumber && m.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.odometer.toString().includes(searchTerm);

    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalMaintenanceCost = vLogs.reduce((acc, cur) => acc + (cur.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-blue-400" />
            Manutenções & Revisões Preventivas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Histórico completo de oficinas, peças trocadas, notas fiscais e garantia.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-3 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Guia Preventivo
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nova Manutenção
          </button>
        </div>
      </div>

      {/* Preventative Guide Accordion */}
      {showGuide && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-900/40 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-400" />
              Tabela de Prazos de Manutenção Preventiva Recomendada
            </span>
            <span className="text-[11px] text-slate-400">Clique para criar lembrete rápido</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { cat: 'troca_oleo' as MaintenanceCategory, name: 'Óleo & Filtro', km: '10.000 km / 12 meses', tip: 'Essencial para a longevidade do motor' },
              { cat: 'pneus_rodizio' as MaintenanceCategory, name: 'Rodízio & Alinhamento', km: '10.000 km / 6 meses', tip: 'Evita desgaste irregular da banda' },
              { cat: 'filtro_ar' as MaintenanceCategory, name: 'Filtro de Ar & Cabine', km: '15.000 km / 12 meses', tip: 'Melhora o consumo e a saúde do ar' },
              { cat: 'freios_pastilhas' as MaintenanceCategory, name: 'Pastilhas de Freio', km: '20.000 - 30.000 km', tip: 'Segurança primária e frenagem' },
              { cat: 'fluido_freio' as MaintenanceCategory, name: 'Fluído de Freio DOT 4', km: '20.000 km / 24 meses', tip: 'Evita perda de pressão por umidade' },
              { cat: 'correia_dentada' as MaintenanceCategory, name: 'Correia Dentada', km: '50.000 km / 48 meses', tip: 'Crítico: rompimento danifica o motor' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{item.name}</span>
                  <span className="text-[11px] text-amber-400 font-mono block">{item.km}</span>
                  <span className="text-[10px] text-slate-500 block">{item.tip}</span>
                </div>
                <button
                  onClick={() => onQuickCreateReminder(item.cat)}
                  title="Criar lembrete para este serviço"
                  className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs shrink-0 cursor-pointer"
                >
                  <BellRing className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Total Investido em Manutenção</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-blue-400">
              {formatCurrency(totalMaintenanceCost)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Serviços Executados</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-white">{vLogs.length}</span>
            <span className="text-xs font-bold text-slate-400">registros</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Último Serviço Registrado</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-bold text-white truncate">
              {vLogs[0] ? vLogs[0].title : 'Nenhum'}
            </span>
          </div>
          {vLogs[0] && (
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
              {formatDate(vLogs[0].date)} • {formatKm(vLogs[0].odometer)}
            </span>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por serviço, oficina, peças, NF ou km..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
              <option key={catKey} value={catKey}>
                {info.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Maintenance Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Nenhuma manutenção encontrada</p>
            <p className="text-xs text-slate-500 mt-1">
              Guarde aqui todas as revisões, trocas de óleo, pastilhas e notas fiscais do automóvel.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeira Manutenção
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const catInfo = CATEGORY_LABELS[log.category] || CATEGORY_LABELS.outros;
            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 shrink-0 mt-0.5">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {catInfo.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                        {formatKm(log.odometer)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(log.date)}
                      </span>
                      {log.workshop && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {log.workshop}
                        </span>
                      )}
                      {log.invoiceNumber && (
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Receipt className="w-3.5 h-3.5 text-slate-500" />
                          {log.invoiceNumber}
                        </span>
                      )}
                    </div>

                    {log.description && (
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {log.description}
                      </p>
                    )}

                    {log.nextScheduledKm && (
                      <p className="text-[11px] text-amber-400/90 font-mono mt-1">
                        Próxima revisão recomendada aos {formatKm(log.nextScheduledKm)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-blue-400 block">
                      {log.cost ? formatCurrency(log.cost) : 'R$ 0,00'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Custo total
                    </span>
                  </div>

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
                        if (confirm('Deseja excluir esta manutenção?')) {
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
