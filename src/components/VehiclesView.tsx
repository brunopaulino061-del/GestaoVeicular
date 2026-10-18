import React, { useRef } from 'react';
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  Gauge,
  Fuel,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import { formatKm } from '../utils/calculations';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  activeVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onOpenAddModal: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => { success: boolean; error?: string };
  onResetDemoData: () => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onOpenAddModal,
  onEditVehicle,
  onDeleteVehicle,
  onExportData,
  onImportData,
  onResetDemoData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = onImportData(content);
        if (res.success) {
          alert('Dados importados com sucesso!');
        } else {
          alert(`Erro ao importar: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Car className="w-6 h-6 text-amber-400" />
            Meus Veículos & Gerenciamento de Dados
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre carros, motos ou utilitários para gerenciar frotas ou veículos familiares.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Cadastrar Veículo
        </button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((v) => {
          const isActive = v.id === activeVehicleId;
          return (
            <div
              key={v.id}
              className={`p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: v.color || '#0284c7' }}
                  />
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {v.name}
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                          Veículo Ativo
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {v.brand} {v.model} • Ano {v.year}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditVehicle(v)}
                    title="Editar veículo"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {vehicles.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente remover o veículo "${v.name}" e todos os seus registros?`)) {
                          onDeleteVehicle(v.id);
                        }
                      }}
                      title="Excluir veículo"
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Vehicle specs chips */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Placa</span>
                  <span className="text-xs font-mono font-bold text-white">{v.plate}</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Odômetro</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{formatKm(v.currentOdometer)}</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tanque</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">{v.tankCapacityLiters} Litros</span>
                </div>
              </div>

              {v.notes && (
                <p className="text-xs text-slate-400 italic mt-3">"{v.notes}"</p>
              )}

              {!isActive && (
                <button
                  onClick={() => onSelectVehicle(v.id)}
                  className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Selecionar Este Veículo
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Backup, Import & Export Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Backup e Exportação de Dados</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Seus dados são salvos no armazenamento local do navegador. Faça backup em JSON para manter seus registros seguros.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Fazer Backup (Exportar JSON)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            Restaurar Backup (Importar JSON)
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja recarregar os dados de demonstração? Isso substituirá os dados atuais pelo exemplo pré-configurado.')) {
                onResetDemoData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            Recarregar Dados de Demonstração
          </button>
        </div>
      </div>
    </div>
  );
};
