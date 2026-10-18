import React from 'react';
import {
  Smartphone,
  X,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppGuideModal: React.FC<InstallAppGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Como Transformar em App no seu Celular
              </h3>
              <p className="text-xs text-slate-400">
                PWA pronto para instalação instantânea no Android, iPhone ou PC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Quick Install Action if browser supports beforeinstallprompt */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  Seu navegador suporta instalação direta!
                </span>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  Toque no botão para adicionar o ícone à sua tela inicial agora.
                </span>
              </div>
              <button
                onClick={async () => {
                  const res = await install();
                  if (res) onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Instalar Agora
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>O app já está instalado e rodando em modo aplicativo independente!</span>
            </div>
          )}

          {/* Method 1: Android / Chrome */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">
                1
              </span>
              <span>No Android (Google Chrome):</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 pl-7 list-decimal leading-relaxed">
              <li>Abra o link do aplicativo no navegador <strong>Google Chrome</strong> no celular.</li>
              <li>Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito.</li>
              <li>Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
              <li>Pronto! Ele terá ícone próprio, abrirá em tela cheia e funcionará offline.</li>
            </ol>
          </div>

          {/* Method 2: iPhone / Safari */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px]">
                2
              </span>
              <span>No iPhone / iPad (Safari):</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 pl-7 list-decimal leading-relaxed">
              <li>Abra o link do aplicativo no navegador <strong>Safari</strong> do iOS.</li>
              <li>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" />).</li>
              <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-blue-400" />).</li>
              <li>Toque em <strong>Adicionar</strong> no canto superior direito. O app aparecerá junto com seus outros aplicativos.</li>
            </ol>
          </div>

          {/* Method 3: Google Play Store / Apple Store (Native Packaging) */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Deseja publicar nas lojas (Google Play / Apple Store)?</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Como o código foi construído em React + Vite moderno, ele pode ser empacotado em menos de 5 minutos como aplicativo nativo usando <strong>Capacitor</strong> ou <strong>Bubblewrap (TWA)</strong> para gerar o arquivo <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">.apk / .aab</code> para a Play Store.
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Entendi, Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
