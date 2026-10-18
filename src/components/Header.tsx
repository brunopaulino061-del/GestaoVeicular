import React, { useState } from 'react';
import {
  Car,
  Gauge,
  Fuel,
  Wrench,
  BellRing,
  AlertOctagon,
  Plus,
  ChevronDown,
  Edit3,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import { formatKm } from '../utils/calculations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  onSelectVehicle: (id: string) => void;
  onOpenOdometerModal: () => void;
  onOpenAddFuelModal: () => void;
  onOpenAddMaintenanceModal: () => void;
  onOpenAddReminderModal: () => void;
  onOpenAddFineModal: () => void;
  onOpenAddVehicleModal: () => void;
  onOpenInstallGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onOpenOdometerModal,
  onOpenAddFuelModal,
  onOpenAddMaintenanceModal,
  onOpenAddReminderModal,
  onOpenAddFineModal,
  onOpenAddVehicleModal,
  onOpenInstallGuide,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/90 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
              <Car className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">AutoGestão</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Controle de Veículos & Consumo Médio
              </p>
            </div>
          </div>

          {/* Vehicle Selector & Odometer Ribbon */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end sm:justify-center max-w-xl">
            {/* Vehicle Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-700/80 text-left transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: activeVehicle.color || '#0284c7' }}
                />
                <div className="truncate max-w-[130px] sm:max-w-[200px]">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {activeVehicle.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono leading-none">
                    {activeVehicle.plate} • {activeVehicle.model}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Meus Veículos
                  </div>
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => onSelectVehicle(v.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                        v.id === activeVehicle.id
                          ? 'bg-amber-500/15 text-amber-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: v.color || '#0284c7' }}
                        />
                        <div className="truncate">
                          <p className="truncate text-white font-medium">{v.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {v.plate} • {formatKm(v.currentOdometer)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={onOpenAddVehicleModal}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Cadastrar Novo Veículo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Odometer Quick Chip */}
            <button
              onClick={onOpenOdometerModal}
              title="Clique para atualizar a quilometragem atual"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700/80 transition-colors group cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-none font-medium">Odômetro</span>
                <span className="text-xs font-bold font-mono text-white leading-tight">
                  {formatKm(activeVehicle.currentOdometer)}
                </span>
              </div>
              <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors ml-0.5" />
            </button>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-2">
            <PWAInstallButton onOpenFullGuide={onOpenInstallGuide} />

            {/* Quick Add Menu */}
            <div className="relative">
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Novo Registro</span>
              </button>

            {isQuickActionsOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsQuickActionsOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Adicionar Registro
                </div>
                <button
                  onClick={onOpenAddFuelModal}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors"
                >
                  <Fuel className="w-4 h-4 text-amber-400" />
                  Abastecimento
                </button>
                <button
                  onClick={onOpenAddMaintenanceModal}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-blue-300 transition-colors"
                >
                  <Wrench className="w-4 h-4 text-blue-400" />
                  Manutenção / Revisão
                </button>
                <button
                  onClick={onOpenAddReminderModal}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                >
                  <BellRing className="w-4 h-4 text-emerald-400" />
                  Lembrete de Troca de Óleo
                </button>
                <button
                  onClick={onOpenAddFineModal}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-rose-300 transition-colors"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  Multa / Infração de Trânsito
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </header>
  );
};
