import React, { useState, useEffect } from 'react';
import { Car, X, Check } from 'lucide-react';
import { Vehicle, FuelType } from '../types/vehicle';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Vehicle;
  onSave: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => void;
  onUpdate?: (id: string, vehicle: Partial<Vehicle>) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  onUpdate,
}) => {
  const [name, setName] = useState<string>('Meu Carro');
  const [brand, setBrand] = useState<string>('Toyota');
  const [model, setModel] = useState<string>('Corolla');
  const [year, setYear] = useState<string>('2023');
  const [plate, setPlate] = useState<string>('ABC-1D23');
  const [fuelType, setFuelType] = useState<FuelType>('flex');
  const [tankCapacityLiters, setTankCapacityLiters] = useState<string>('50');
  const [currentOdometer, setCurrentOdometer] = useState<string>('0');
  const [color, setColor] = useState<string>('#0284c7');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setBrand(initialData.brand);
      setModel(initialData.model);
      setYear(initialData.year.toString());
      setPlate(initialData.plate);
      setFuelType(initialData.fuelType);
      setTankCapacityLiters(initialData.tankCapacityLiters.toString());
      setCurrentOdometer(initialData.currentOdometer.toString());
      setColor(initialData.color || '#0284c7');
      setNotes(initialData.notes || '');
    } else {
      setName('Novo Veículo');
      setBrand('');
      setModel('');
      setYear(new Date().getFullYear().toString());
      setPlate('');
      setFuelType('flex');
      setTankCapacityLiters('50');
      setCurrentOdometer('0');
      setColor('#0284c7');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !model.trim()) {
      alert('Por favor informe o nome, marca e modelo do automóvel.');
      return;
    }

    const payload: Omit<Vehicle, 'id' | 'createdAt'> = {
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year, 10) || new Date().getFullYear(),
      plate: plate.trim().toUpperCase(),
      fuelType,
      tankCapacityLiters: parseFloat(tankCapacityLiters) || 50,
      currentOdometer: parseInt(currentOdometer, 10) || 0,
      color,
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
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Veículo' : 'Cadastrar Veículo'}
              </h3>
              <p className="text-xs text-slate-400">Dados do automóvel para controle e relatórios</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Apelido do Veículo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corolla da Família, Moto Trabalho"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Marca / Fabricante
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: Toyota, VW, Chevrolet"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Modelo / Versão
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: Corolla Cross 2.0"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Ano de Fabricação / Mod.
              </label>
              <input
                type="number"
                min="1950"
                max="2035"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Placa (Mercosul ou antiga)
              </label>
              <input
                type="text"
                required
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="Ex: BRA2E19"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-mono uppercase text-white outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Combustível Principal
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              >
                <option value="flex">Flex (Gasolina / Etanol)</option>
                <option value="gasolina">Gasolina</option>
                <option value="etanol">Etanol</option>
                <option value="diesel">Diesel</option>
                <option value="gnv">GNV</option>
                <option value="hibrido">Híbrido</option>
                <option value="eletrico">Elétrico</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tanque (Litros)
              </label>
              <input
                type="number"
                step="1"
                min="5"
                value={tankCapacityLiters}
                onChange={(e) => setTankCapacityLiters(e.target.value)}
                placeholder="50"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Odômetro Inicial / Atual (km)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={currentOdometer}
              onChange={(e) => setCurrentOdometer(e.target.value)}
              placeholder="Ex: 48000"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden font-bold"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {initialData ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
