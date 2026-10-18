import React from 'react';
import {
  LayoutDashboard,
  Fuel,
  Wrench,
  BellRing,
  AlertOctagon,
  BarChart3,
  Car,
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'fuel'
  | 'maintenance'
  | 'reminders'
  | 'fines'
  | 'reports'
  | 'vehicles';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingRemindersCount: number;
  pendingFinesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingRemindersCount,
  pendingFinesCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabKey,
      label: 'Painel Geral',
      icon: LayoutDashboard,
    },
    {
      id: 'fuel' as TabKey,
      label: 'Abastecimentos',
      icon: Fuel,
    },
    {
      id: 'maintenance' as TabKey,
      label: 'Manutenções',
      icon: Wrench,
    },
    {
      id: 'reminders' as TabKey,
      label: 'Lembretes',
      icon: BellRing,
      badge: pendingRemindersCount > 0 ? pendingRemindersCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'fines' as TabKey,
      label: 'Multas & Recursos',
      icon: AlertOctagon,
      badge: pendingFinesCount > 0 ? pendingFinesCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'reports' as TabKey,
      label: 'Relatórios Mensais',
      icon: BarChart3,
    },
    {
      id: 'vehicles' as TabKey,
      label: 'Veículos & Dados',
      icon: Car,
    },
  ];

  return (
    <nav className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 no-print">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-slate-950 text-amber-400' : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
