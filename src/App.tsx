/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVehicleStore } from './hooks/useVehicleStore';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { FuelLogsView } from './components/FuelLogsView';
import { MaintenanceView } from './components/MaintenanceView';
import { RemindersView } from './components/RemindersView';
import { TrafficFinesView } from './components/TrafficFinesView';
import { MonthlyReportsView } from './components/MonthlyReportsView';
import { VehiclesView } from './components/VehiclesView';

// Modals
import { OdometerModal } from './components/OdometerModal';
import { AddFuelModal } from './components/AddFuelModal';
import { AddMaintenanceModal } from './components/AddMaintenanceModal';
import { AddReminderModal } from './components/AddReminderModal';
import { CompleteReminderModal } from './components/CompleteReminderModal';
import { AddTrafficFineModal } from './components/AddTrafficFineModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { InstallAppGuideModal } from './components/InstallAppGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import {
  Vehicle,
  FuelLog,
  MaintenanceLog,
  ServiceReminder,
  TrafficFine,
  MaintenanceCategory,
} from './types/vehicle';
import { getReminderEvaluation, CATEGORY_LABELS } from './utils/calculations';

export default function App() {
  const store = useVehicleStore();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Modals state
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [isAddFuelModalOpen, setIsAddFuelModalOpen] = useState(false);
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLog | undefined>(undefined);

  const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] = useState(false);
  const [editingMaintenanceLog, setEditingMaintenanceLog] = useState<MaintenanceLog | undefined>(undefined);

  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ServiceReminder | undefined>(undefined);

  const [completingReminder, setCompletingReminder] = useState<ServiceReminder | null>(null);

  const [isAddFineModalOpen, setIsAddFineModalOpen] = useState(false);
  const [editingFine, setEditingFine] = useState<TrafficFine | undefined>(undefined);

  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);

  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  const currentVehicle = store.activeVehicle || store.vehicles[0];

  // Calculate pending counts for badges
  const pendingRemindersCount = store.reminders
    .filter((r) => r.vehicleId === currentVehicle?.id && !r.isCompleted)
    .filter((r) => {
      const evaluation = getReminderEvaluation(r, currentVehicle?.currentOdometer || 0);
      return evaluation.status === 'overdue' || evaluation.status === 'warning';
    }).length;

  const pendingFinesCount = store.trafficFines.filter(
    (f) => f.vehicleId === currentVehicle?.id && f.status === 'pendente'
  ).length;

  // Last fuel log for current vehicle
  const vehicleFuelLogs = store.fuelLogs
    .filter((f) => f.vehicleId === currentVehicle?.id)
    .sort((a, b) => b.odometer - a.odometer);
  const lastFuelLog = vehicleFuelLogs[0];

  const handleQuickPresetReminder = (category: MaintenanceCategory) => {
    const info = CATEGORY_LABELS[category];
    if (!currentVehicle) return;

    store.addReminder({
      vehicleId: currentVehicle.id,
      title: info.label,
      category,
      targetOdometer: currentVehicle.currentOdometer + info.defaultIntervalKm,
      intervalKm: info.defaultIntervalKm,
      intervalMonths: info.defaultIntervalMonths,
      lastCompletedOdometer: currentVehicle.currentOdometer,
      lastCompletedDate: new Date().toISOString().split('T')[0],
      notes: `Lembrete automático para ${info.label}.`,
    });
    alert(`Lembrete para "${info.label}" ativado com sucesso!`);
  };

  if (!currentVehicle) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold text-slate-400">Nenhum veículo cadastrado.</p>
          <button
            onClick={() => {
              setEditingVehicle(undefined);
              setIsAddVehicleModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Cadastrar Primeiro Veículo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        vehicles={store.vehicles}
        activeVehicle={currentVehicle}
        onSelectVehicle={store.setSelectedVehicleId}
        onOpenOdometerModal={() => setIsOdometerModalOpen(true)}
        onOpenAddFuelModal={() => {
          setEditingFuelLog(undefined);
          setIsAddFuelModalOpen(true);
        }}
        onOpenAddMaintenanceModal={() => {
          setEditingMaintenanceLog(undefined);
          setIsAddMaintenanceModalOpen(true);
        }}
        onOpenAddReminderModal={() => {
          setEditingReminder(undefined);
          setIsAddReminderModalOpen(true);
        }}
        onOpenAddFineModal={() => {
          setEditingFine(undefined);
          setIsAddFineModalOpen(true);
        }}
        onOpenAddVehicleModal={() => {
          setEditingVehicle(undefined);
          setIsAddVehicleModalOpen(true);
        }}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
      />

      {/* Tabs Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingRemindersCount={pendingRemindersCount}
        pendingFinesCount={pendingFinesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            vehicle={currentVehicle}
            fuelLogs={store.fuelLogs}
            maintenanceLogs={store.maintenanceLogs}
            reminders={store.reminders}
            trafficFines={store.trafficFines}
            expenses={store.otherExpenses}
            onNavigateTab={setActiveTab}
            onOpenOdometerModal={() => setIsOdometerModalOpen(true)}
            onOpenAddFuelModal={() => {
              setEditingFuelLog(undefined);
              setIsAddFuelModalOpen(true);
            }}
            onOpenAddMaintenanceModal={() => {
              setEditingMaintenanceLog(undefined);
              setIsAddMaintenanceModalOpen(true);
            }}
            onOpenAddReminderModal={() => {
              setEditingReminder(undefined);
              setIsAddReminderModalOpen(true);
            }}
            onOpenAddFineModal={() => {
              setEditingFine(undefined);
              setIsAddFineModalOpen(true);
            }}
            onCompleteReminder={(r) => setCompletingReminder(r)}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelLogsView
            vehicle={currentVehicle}
            fuelLogs={store.fuelLogs}
            onOpenAddModal={() => {
              setEditingFuelLog(undefined);
              setIsAddFuelModalOpen(true);
            }}
            onEditLog={(log) => {
              setEditingFuelLog(log);
              setIsAddFuelModalOpen(true);
            }}
            onDeleteLog={store.deleteFuelLog}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceView
            vehicle={currentVehicle}
            maintenanceLogs={store.maintenanceLogs}
            onOpenAddModal={() => {
              setEditingMaintenanceLog(undefined);
              setIsAddMaintenanceModalOpen(true);
            }}
            onEditLog={(log) => {
              setEditingMaintenanceLog(log);
              setIsAddMaintenanceModalOpen(true);
            }}
            onDeleteLog={store.deleteMaintenanceLog}
            onQuickCreateReminder={handleQuickPresetReminder}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            vehicle={currentVehicle}
            reminders={store.reminders}
            onOpenAddModal={() => {
              setEditingReminder(undefined);
              setIsAddReminderModalOpen(true);
            }}
            onEditReminder={(r) => {
              setEditingReminder(r);
              setIsAddReminderModalOpen(true);
            }}
            onDeleteReminder={store.deleteReminder}
            onCompleteReminder={(r) => setCompletingReminder(r)}
            onQuickPreset={handleQuickPresetReminder}
          />
        )}

        {activeTab === 'fines' && (
          <TrafficFinesView
            vehicle={currentVehicle}
            trafficFines={store.trafficFines}
            onOpenAddModal={() => {
              setEditingFine(undefined);
              setIsAddFineModalOpen(true);
            }}
            onEditFine={(fine) => {
              setEditingFine(fine);
              setIsAddFineModalOpen(true);
            }}
            onDeleteFine={store.deleteTrafficFine}
            onMarkAsPaid={store.markFineAsPaid}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReportsView
            vehicle={currentVehicle}
            fuelLogs={store.fuelLogs}
            maintenanceLogs={store.maintenanceLogs}
            expenses={store.otherExpenses}
            trafficFines={store.trafficFines}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesView
            vehicles={store.vehicles}
            activeVehicleId={currentVehicle.id}
            onSelectVehicle={store.setSelectedVehicleId}
            onOpenAddModal={() => {
              setEditingVehicle(undefined);
              setIsAddVehicleModalOpen(true);
            }}
            onEditVehicle={(veh) => {
              setEditingVehicle(veh);
              setIsAddVehicleModalOpen(true);
            }}
            onDeleteVehicle={store.deleteVehicle}
            onExportData={store.exportAllData}
            onImportData={store.importData}
            onResetDemoData={store.resetToDemoData}
          />
        )}
      </main>

      {/* Global Modals */}
      <OdometerModal
        isOpen={isOdometerModalOpen}
        onClose={() => setIsOdometerModalOpen(false)}
        vehicle={currentVehicle}
        onUpdate={store.updateOdometer}
      />

      <AddFuelModal
        isOpen={isAddFuelModalOpen}
        onClose={() => {
          setIsAddFuelModalOpen(false);
          setEditingFuelLog(undefined);
        }}
        vehicle={currentVehicle}
        lastFuelLog={lastFuelLog}
        initialData={editingFuelLog}
        onSave={store.addFuelLog}
        onUpdate={store.updateFuelLog}
      />

      <AddMaintenanceModal
        isOpen={isAddMaintenanceModalOpen}
        onClose={() => {
          setIsAddMaintenanceModalOpen(false);
          setEditingMaintenanceLog(undefined);
        }}
        vehicle={currentVehicle}
        initialData={editingMaintenanceLog}
        onSave={store.addMaintenanceLog}
        onUpdate={store.updateMaintenanceLog}
      />

      <AddReminderModal
        isOpen={isAddReminderModalOpen}
        onClose={() => {
          setIsAddReminderModalOpen(false);
          setEditingReminder(undefined);
        }}
        vehicle={currentVehicle}
        initialData={editingReminder}
        onSave={store.addReminder}
        onUpdate={store.updateReminder}
      />

      <CompleteReminderModal
        isOpen={!!completingReminder}
        onClose={() => setCompletingReminder(null)}
        reminder={completingReminder}
        vehicle={currentVehicle}
        onComplete={store.completeReminder}
      />

      <AddTrafficFineModal
        isOpen={isAddFineModalOpen}
        onClose={() => {
          setIsAddFineModalOpen(false);
          setEditingFine(undefined);
        }}
        vehicle={currentVehicle}
        initialData={editingFine}
        onSave={store.addTrafficFine}
        onUpdate={store.updateTrafficFine}
      />

      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => {
          setIsAddVehicleModalOpen(false);
          setEditingVehicle(undefined);
        }}
        initialData={editingVehicle}
        onSave={store.addVehicle}
        onUpdate={store.updateVehicle}
      />

      <InstallAppGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />

      <OfflineIndicator />
    </div>
  );
}
