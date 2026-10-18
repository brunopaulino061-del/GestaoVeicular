import React, { useState, useEffect } from 'react';
import { AlertOctagon, X, Check, ShieldAlert, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { Vehicle, TrafficFine, FineSeverity, FineStatus } from '../types/vehicle';
import { FINE_SEVERITY_META, COMMON_VIOLATIONS, formatCurrency } from '../utils/calculations';

interface AddTrafficFineModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  initialData?: TrafficFine;
  onSave: (fine: Omit<TrafficFine, 'id'>) => void;
  onUpdate?: (id: string, fine: Partial<TrafficFine>) => void;
}

export const AddTrafficFineModal: React.FC<AddTrafficFineModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  initialData,
  onSave,
  onUpdate,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('12:00');
  const [amount, setAmount] = useState<string>('130.16');
  const [discountedAmount, setDiscountedAmount] = useState<string>('78.10');
  const [violationType, setViolationType] = useState<string>('Transitar em velocidade superior à máxima permitida em até 20%');
  const [severity, setSeverity] = useState<FineSeverity>('media');
  const [points, setPoints] = useState<number>(4);
  const [code, setCode] = useState<string>('745-5-0');
  const [aitNumber, setAitNumber] = useState<string>('');
  const [issuingAuthority, setIssuingAuthority] = useState<string>('DETRAN');
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<FineStatus>('pendente');
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Appeal fields
  const [showAppealSection, setShowAppealSection] = useState<boolean>(false);
  const [appealStatus, setAppealStatus] = useState<TrafficFine['appealStatus']>('nenhum');
  const [appealProtocol, setAppealProtocol] = useState<string>('');
  const [appealDate, setAppealDate] = useState<string>('');
  const [appealNotes, setAppealNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setTime(initialData.time || '');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setDiscountedAmount(initialData.discountedAmount ? initialData.discountedAmount.toString() : '');
      setViolationType(initialData.violationType);
      setSeverity(initialData.severity);
      setPoints(initialData.points);
      setCode(initialData.code || '');
      setAitNumber(initialData.aitNumber || '');
      setIssuingAuthority(initialData.issuingAuthority || 'DETRAN');
      setLocation(initialData.location || '');
      setStatus(initialData.status);
      setDueDate(initialData.dueDate || '');
      setPaymentDate(initialData.paymentDate || '');
      setNotes(initialData.notes || '');

      setAppealStatus(initialData.appealStatus || 'nenhum');
      setAppealProtocol(initialData.appealProtocol || '');
      setAppealDate(initialData.appealDate || '');
      setAppealNotes(initialData.appealNotes || '');
      if (initialData.appealStatus && initialData.appealStatus !== 'nenhum') {
        setShowAppealSection(true);
      }
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setTime('10:30');
      const def = COMMON_VIOLATIONS[0];
      setViolationType(def.violationType);
      setSeverity(def.severity);
      setPoints(def.points);
      setAmount(def.amount.toString());
      setDiscountedAmount((def.amount * 0.6).toFixed(2)); // 40% discount
      setCode(def.code);
      setAitNumber('');
      setIssuingAuthority('DETRAN');
      setLocation('');
      setStatus('pendente');
      setDueDate('');
      setPaymentDate('');
      setNotes('');
      setShowAppealSection(false);
      setAppealStatus('nenhum');
      setAppealProtocol('');
      setAppealDate('');
      setAppealNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSelectCommonViolation = (idx: number) => {
    const item = COMMON_VIOLATIONS[idx];
    if (item) {
      setViolationType(item.violationType);
      setSeverity(item.severity);
      setPoints(item.points);
      setAmount(item.amount.toString());
      setDiscountedAmount((item.amount * 0.6).toFixed(2));
      setCode(item.code);
    }
  };

  const handleSeverityChange = (newSev: FineSeverity) => {
    setSeverity(newSev);
    const meta = FINE_SEVERITY_META[newSev];
    setPoints(meta.points);
    if (!initialData) {
      setAmount(meta.baseValue.toString());
      setDiscountedAmount((meta.baseValue * 0.6).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor informe um valor válido para a multa.');
      return;
    }
    if (!violationType.trim()) {
      alert('Por favor informe a tipificação da infração.');
      return;
    }

    const payload: Omit<TrafficFine, 'id'> = {
      vehicleId: vehicle.id,
      date,
      time: time.trim() || undefined,
      amount: parsedAmount,
      discountedAmount: parseFloat(discountedAmount) || undefined,
      violationType: violationType.trim(),
      severity,
      points: points || FINE_SEVERITY_META[severity].points,
      code: code.trim() || undefined,
      aitNumber: aitNumber.trim() || undefined,
      issuingAuthority: issuingAuthority.trim() || undefined,
      location: location.trim() || undefined,
      status,
      dueDate: dueDate.trim() || undefined,
      paymentDate: status === 'pago' ? (paymentDate || date) : undefined,
      notes: notes.trim() || undefined,
      appealStatus: showAppealSection ? appealStatus : undefined,
      appealProtocol: showAppealSection ? appealProtocol.trim() || undefined : undefined,
      appealDate: showAppealSection ? appealDate.trim() || undefined : undefined,
      appealNotes: showAppealSection ? appealNotes.trim() || undefined : undefined,
    };

    if (initialData && onUpdate) {
      onUpdate(initialData.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Multa de Trânsito' : 'Registrar Multa / Infração'}
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

        {/* Quick presets from CTB */}
        {!initialData && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Infrações Frequentes do CTB (Preencher rápido):
            </label>
            <select
              onChange={(e) => {
                if (e.target.value !== '') {
                  handleSelectCommonViolation(parseInt(e.target.value, 10));
                }
              }}
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-hidden focus:border-rose-500"
            >
              <option value="" disabled>Selecione uma infração para preenchimento automático...</option>
              {COMMON_VIOLATIONS.map((item, idx) => (
                <option key={idx} value={idx}>
                  {item.code} - {item.violationType} ({FINE_SEVERITY_META[item.severity].label} - {item.points} pts - R$ {item.amount.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Data da Infração
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Hora (aproximada)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Tipificação da Infração (Descrição)
            </label>
            <input
              type="text"
              required
              value={violationType}
              onChange={(e) => setViolationType(e.target.value)}
              placeholder="Ex: Transitar em velocidade superior à máxima permitida em até 20%"
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Gravidade
              </label>
              <select
                value={severity}
                onChange={(e) => handleSeverityChange(e.target.value as FineSeverity)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden font-medium"
              >
                <option value="leve">Leve (3 pts)</option>
                <option value="media">Média (4 pts)</option>
                <option value="grave">Grave (5 pts)</option>
                <option value="gravissima">Gravíssima (7 pts)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Pontos na CNH
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Código Enquadramento
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: 745-5-0"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                Valor Nominal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm font-mono text-rose-400 font-bold outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Valor com Desconto SNE (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discountedAmount}
                onChange={(e) => setDiscountedAmount(e.target.value)}
                placeholder="Ex: 20% ou 40% desc."
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 font-bold outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Status da Multa
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FineStatus)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              >
                <option value="pendente">Aguardando Pagamento</option>
                <option value="pago">Paga</option>
                <option value="em_recurso">Em Recurso / Julgamento</option>
                <option value="recurso_deferido">Recurso Deferido (Cancelada / Anulada)</option>
                <option value="recurso_indeferido">Recurso Indeferido (Mantida)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Data Limite / Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Auto de Infração (Nº AIT)
              </label>
              <input
                type="text"
                value={aitNumber}
                onChange={(e) => setAitNumber(e.target.value)}
                placeholder="Ex: AIT-1234567"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Órgão Autuador
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="Ex: DETRAN-SP, DSV/CET, PRF, DNIT"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Local da Ocorrência
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Av. das Nações Unidas, km 12 - São Paulo/SP"
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-hidden"
            />
          </div>

          {/* Section for Appeals / Recursos */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowAppealSection(!showAppealSection)}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                Seção de Recurso & Defesa Prévia (Opcional)
                {appealStatus && appealStatus !== 'nenhum' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-normal">
                    Ativo
                  </span>
                )}
              </span>
              {showAppealSection ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAppealSection && (
              <div className="p-4 pt-1 border-t border-slate-800/80 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Fase do Recurso
                    </label>
                    <select
                      value={appealStatus}
                      onChange={(e) => {
                        const val = e.target.value as TrafficFine['appealStatus'];
                        setAppealStatus(val);
                        if (val && val !== 'nenhum' && status === 'pendente') {
                          setStatus('em_recurso');
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 outline-hidden focus:border-purple-500"
                    >
                      <option value="nenhum">Nenhum recurso interposto</option>
                      <option value="defesa_previa">Defesa Prévia (Órgão Autuador)</option>
                      <option value="jari_primeira_instancia">JARI - 1ª Instância</option>
                      <option value="cetran_segunda_instancia">CETRAN / CONTRAN - 2ª Instância</option>
                      <option value="deferido">Recurso Deferido (Anulada)</option>
                      <option value="indeferido">Recurso Indeferido (Mantida)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Protocolo do Recurso
                    </label>
                    <input
                      type="text"
                      value={appealProtocol}
                      onChange={(e) => setAppealProtocol(e.target.value)}
                      placeholder="Ex: REC-2026-991823"
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Data do Protocolo
                    </label>
                    <input
                      type="date"
                      value={appealDate}
                      onChange={(e) => setAppealDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Argumentos, Fundamentação Legal e Anotações do Recurso
                  </label>
                  <textarea
                    rows={3}
                    value={appealNotes}
                    onChange={(e) => setAppealNotes(e.target.value)}
                    placeholder="Ex: Defesa fundamentada no Art. 280 do CTB por ausência de foto nítida e laudo de calibração do Inmetro vencido há mais de 12 meses..."
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 outline-hidden focus:border-purple-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Observações Gerais
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Condutor infrator já indicado ou pago pelo aplicativo do banco."
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-hidden"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {initialData ? 'Atualizar Multa' : 'Salvar Multa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
