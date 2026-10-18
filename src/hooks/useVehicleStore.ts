import { useState, useEffect } from 'react';
import { Vehicle, FuelLog, MaintenanceLog, ServiceReminder, OtherExpense, TrafficFine } from '../types/vehicle';
import {
  INITIAL_VEHICLES,
  INITIAL_FUEL_LOGS,
  INITIAL_MAINTENANCE_LOGS,
  INITIAL_REMINDERS,
  INITIAL_OTHER_EXPENSES,
  INITIAL_TRAFFIC_FINES
} from '../utils/initialData';

const STORAGE_KEYS = {
  VEHICLES: 'autogestao_vehicles_v1',
  SELECTED_VEHICLE: 'autogestao_selected_vehicle_v1',
  FUEL_LOGS: 'autogestao_fuel_logs_v1',
  MAINTENANCE_LOGS: 'autogestao_maintenance_logs_v1',
  REMINDERS: 'autogestao_reminders_v1',
  EXPENSES: 'autogestao_expenses_v1',
  TRAFFIC_FINES: 'autogestao_traffic_fines_v1',
};

export function useVehicleStore() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_VEHICLE);
      if (saved && vehicles.some(v => v.id === saved)) return saved;
      return vehicles[0]?.id || 'veh-1';
    } catch {
      return vehicles[0]?.id || 'veh-1';
    }
  });

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_FUEL_LOGS;
    } catch {
      return INITIAL_FUEL_LOGS;
    }
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_LOGS;
    } catch {
      return INITIAL_MAINTENANCE_LOGS;
    }
  });

  const [reminders, setReminders] = useState<ServiceReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  });

  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_OTHER_EXPENSES;
    } catch {
      return INITIAL_OTHER_EXPENSES;
    }
  });

  const [trafficFines, setTrafficFines] = useState<TrafficFine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRAFFIC_FINES);
      return saved ? JSON.parse(saved) : INITIAL_TRAFFIC_FINES;
    } catch {
      return INITIAL_TRAFFIC_FINES;
    }
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_VEHICLE, selectedVehicleId);
  }, [selectedVehicleId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_LOGS, JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(otherExpenses));
  }, [otherExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRAFFIC_FINES, JSON.stringify(trafficFines));
  }, [trafficFines]);

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Actions
  const updateOdometer = (vehicleId: string, newOdometer: number) => {
    if (newOdometer <= 0) return;
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, currentOdometer: newOdometer } : v));
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVehicles(prev => [...prev, newVehicle]);
    setSelectedVehicleId(newVehicle.id);
    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    if (vehicles.length <= 1) return; // don't delete last vehicle
    setVehicles(prev => prev.filter(v => v.id !== id));
    setFuelLogs(prev => prev.filter(f => f.vehicleId !== id));
    setMaintenanceLogs(prev => prev.filter(m => m.vehicleId !== id));
    setReminders(prev => prev.filter(r => r.vehicleId !== id));
    setOtherExpenses(prev => prev.filter(e => e.vehicleId !== id));
    setTrafficFines(prev => prev.filter(f => f.vehicleId !== id));
    const remaining = vehicles.filter(v => v.id !== id);
    if (selectedVehicleId === id && remaining.length > 0) {
      setSelectedVehicleId(remaining[0].id);
    }
  };

  const addFuelLog = (log: Omit<FuelLog, 'id'>) => {
    const newLog: FuelLog = {
      ...log,
      id: `fuel-${Date.now()}`,
    };
    setFuelLogs(prev => [...prev, newLog]);
    if (activeVehicle && log.odometer > activeVehicle.currentOdometer) {
      updateOdometer(log.vehicleId, log.odometer);
    }
    return newLog;
  };

  const updateFuelLog = (id: string, updates: Partial<FuelLog>) => {
    setFuelLogs(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteFuelLog = (id: string) => {
    setFuelLogs(prev => prev.filter(item => item.id !== id));
  };

  const addMaintenanceLog = (
    log: Omit<MaintenanceLog, 'id'>,
    createReminder?: { intervalKm?: number; intervalMonths?: number }
  ) => {
    const newLog: MaintenanceLog = {
      ...log,
      id: `maint-${Date.now()}`,
    };
    setMaintenanceLogs(prev => [...prev, newLog]);

    if (activeVehicle && log.odometer > activeVehicle.currentOdometer) {
      updateOdometer(log.vehicleId, log.odometer);
    }

    if (createReminder && (createReminder.intervalKm || createReminder.intervalMonths)) {
      const targetOdometer = createReminder.intervalKm ? log.odometer + createReminder.intervalKm : undefined;
      let targetDate: string | undefined = undefined;

      if (createReminder.intervalMonths) {
        const d = new Date(log.date || new Date().toISOString().split('T')[0]);
        d.setMonth(d.getMonth() + createReminder.intervalMonths);
        targetDate = d.toISOString().split('T')[0];
      }

      const reminder: ServiceReminder = {
        id: `rem-${Date.now()}`,
        vehicleId: log.vehicleId,
        title: `Próxima: ${log.title}`,
        category: log.category,
        targetOdometer,
        targetDate,
        intervalKm: createReminder.intervalKm,
        intervalMonths: createReminder.intervalMonths,
        lastCompletedOdometer: log.odometer,
        lastCompletedDate: log.date,
        isCompleted: false,
        notes: `Criado automaticamente a partir da manutenção realizada em ${log.date}.`,
      };
      setReminders(prev => [...prev, reminder]);
    }

    return newLog;
  };

  const updateMaintenanceLog = (id: string, updates: Partial<MaintenanceLog>) => {
    setMaintenanceLogs(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMaintenanceLog = (id: string) => {
    setMaintenanceLogs(prev => prev.filter(m => m.id !== id));
  };

  const addReminder = (rem: Omit<ServiceReminder, 'id' | 'isCompleted'>) => {
    const newRem: ServiceReminder = {
      ...rem,
      id: `rem-${Date.now()}`,
      isCompleted: false,
    };
    setReminders(prev => [...prev, newRem]);
    return newRem;
  };

  const updateReminder = (id: string, updates: Partial<ServiceReminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const completeReminder = (
    reminderId: string,
    performedDate: string,
    odometer: number,
    cost?: number,
    workshop?: string
  ) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    if (cost !== undefined && cost > 0) {
      addMaintenanceLog({
        vehicleId: reminder.vehicleId,
        date: performedDate,
        odometer,
        category: reminder.category,
        title: reminder.title.replace('Próxima: ', ''),
        cost,
        workshop,
        notes: `Concluído a partir do lembrete agendado.`,
      });
    }

    if (reminder.intervalKm || reminder.intervalMonths) {
      const nextTargetKm = reminder.intervalKm ? odometer + reminder.intervalKm : undefined;
      let nextTargetDate: string | undefined = undefined;

      if (reminder.intervalMonths) {
        const d = new Date(performedDate);
        d.setMonth(d.getMonth() + reminder.intervalMonths);
        nextTargetDate = d.toISOString().split('T')[0];
      }

      setReminders(prev =>
        prev.map(r =>
          r.id === reminderId
            ? {
                ...r,
                targetOdometer: nextTargetKm,
                targetDate: nextTargetDate,
                lastCompletedOdometer: odometer,
                lastCompletedDate: performedDate,
              }
            : r
        )
      );
    } else {
      setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, isCompleted: true } : r));
    }

    if (activeVehicle && odometer > activeVehicle.currentOdometer) {
      updateOdometer(reminder.vehicleId, odometer);
    }
  };

  const addExpense = (exp: Omit<OtherExpense, 'id'>) => {
    const newExp: OtherExpense = {
      ...exp,
      id: `exp-${Date.now()}`,
    };
    setOtherExpenses(prev => [...prev, newExp]);
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setOtherExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Traffic Fines Actions
  const addTrafficFine = (fine: Omit<TrafficFine, 'id'>) => {
    const newFine: TrafficFine = {
      ...fine,
      id: `fine-${Date.now()}`,
    };
    setTrafficFines(prev => [newFine, ...prev]);
    return newFine;
  };

  const updateTrafficFine = (id: string, updates: Partial<TrafficFine>) => {
    setTrafficFines(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteTrafficFine = (id: string) => {
    setTrafficFines(prev => prev.filter(f => f.id !== id));
  };

  const markFineAsPaid = (id: string, paymentDate: string, amountPaid?: number) => {
    setTrafficFines(prev =>
      prev.map(f =>
        f.id === id
          ? {
              ...f,
              status: 'pago',
              paymentDate,
              discountedAmount: amountPaid !== undefined ? amountPaid : f.discountedAmount || f.amount,
            }
          : f
      )
    );
  };

  const resetToDemoData = () => {
    setVehicles(INITIAL_VEHICLES);
    setSelectedVehicleId('veh-1');
    setFuelLogs(INITIAL_FUEL_LOGS);
    setMaintenanceLogs(INITIAL_MAINTENANCE_LOGS);
    setReminders(INITIAL_REMINDERS);
    setOtherExpenses(INITIAL_OTHER_EXPENSES);
    setTrafficFines(INITIAL_TRAFFIC_FINES);
  };

  const exportAllData = () => {
    const data = {
      vehicles,
      selectedVehicleId,
      fuelLogs,
      maintenanceLogs,
      reminders,
      otherExpenses,
      trafficFines,
      exportedAt: new Date().toISOString(),
      version: '1.1',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autogestao-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.vehicles && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
        if (data.fuelLogs) setFuelLogs(data.fuelLogs);
        if (data.maintenanceLogs) setMaintenanceLogs(data.maintenanceLogs);
        if (data.reminders) setReminders(data.reminders);
        if (data.otherExpenses) setOtherExpenses(data.otherExpenses);
        if (data.trafficFines) setTrafficFines(data.trafficFines);
        if (data.selectedVehicleId) setSelectedVehicleId(data.selectedVehicleId);
        return { success: true };
      }
      return { success: false, error: 'Formato inválido' };
    } catch (e) {
      return { success: false, error: 'Arquivo JSON inválido' };
    }
  };

  return {
    vehicles,
    activeVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
    updateOdometer,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    fuelLogs,
    addFuelLog,
    updateFuelLog,
    deleteFuelLog,
    maintenanceLogs,
    addMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    otherExpenses,
    addExpense,
    deleteExpense,
    trafficFines,
    addTrafficFine,
    updateTrafficFine,
    deleteTrafficFine,
    markFineAsPaid,
    resetToDemoData,
    exportAllData,
    importData,
  };
}
