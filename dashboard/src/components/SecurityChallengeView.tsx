import React, { useState } from 'react';
import { ShieldAlert, Check, ArrowRight, AlertCircle, HelpCircle, Lock, KeyRound, Clock } from 'lucide-react';

export interface SecurityChallengeViewProps {
  question: string;
  propositions: string[];
  onSubmit: (choice: string) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onResetTest?: () => void;
}

export const SecurityChallengeView: React.FC<SecurityChallengeViewProps> = ({
  question,
  propositions,
  onSubmit,
  isLoading = false,
  errorMessage = null,
  onResetTest,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const currentDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChoice || isLoading) return;

    try {
      await onSubmit(selectedChoice);
      setIsSuccess(true);
    } catch {
      setIsSuccess(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-3.5 bg-[#f1f5f9] select-none box-border font-sans relative">
      <div className="flex-none flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-black text-xs">
            ÉcoleDirecte Cockpit
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-700" />
            <span>Double Authentification Requise</span>
          </div>
        </div>

        {onResetTest && (
          <button
            type="button"
            onClick={onResetTest}
            className="px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs border-2 border-slate-200 transition-colors"
          >
            Fermer l'aperçu 2FA
          </button>
        )}
      </div>

      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-3.5 min-h-0">
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 flex flex-col justify-between flex-none">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900">
              Horloge & Système
            </div>
            <div className="font-number text-3xl font-black tracking-tight text-slate-950 mt-2 leading-none">
              {currentTime}
            </div>
            <div className="text-xs font-semibold text-slate-500 capitalize mt-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDate}</span>
            </div>
          </div>

          <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Statut de Sécurité</span>
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black">
                  Code 250
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
                <p>
                  Le serveur ÉcoleDirecte a détecté une connexion nécessitant une confirmation d'identité.
                </p>
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 space-y-1.5 text-[11px]">
                  <div className="font-bold text-amber-900">Pourquoi cette étape ?</div>
                  <div className="text-slate-600">
                    Cette vérification survient lors d'une première connexion ou d'un changement d'adresse réseau.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Session en attente de validation</span>
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Question de Contrôle</span>
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dossier Scolaire
                </span>
              </div>

              <div className="text-xs text-slate-600 font-medium">
                Veuillez lire attentivement la question ci-dessous et sélectionner votre réponse dans la colonne de droite :
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                  Question transmise par l'établissement
                </span>
                <p className="text-base font-black text-slate-950 leading-snug">
                  {question}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-semibold text-center">
              Sélectionnez une option pour déverrouiller la synchronisation
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-950">
                  Propositions ({propositions.length})
                </h2>
                <span className="text-[10px] font-bold text-blue-700">
                  Choix unique
                </span>
              </div>

              <div className="space-y-2">
                {propositions.map((prop, idx) => {
                  const isSelected = selectedChoice === prop;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedChoice(prop)}
                      className={`w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-950'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="font-extrabold text-xs leading-snug">
                        {prop}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-emerald-700 text-xs font-bold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Réponse validée avec succès.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedChoice || isLoading}
                className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
                  selectedChoice && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{isLoading ? 'Validation en cours...' : 'Valider la réponse'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
