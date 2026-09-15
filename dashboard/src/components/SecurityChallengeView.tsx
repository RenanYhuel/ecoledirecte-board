import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-900">
      <div className="w-full max-w-xl bg-white border-2 border-slate-200 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                Sécurité ÉcoleDirecte
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Vérification d'accès
              </h1>
            </div>
          </div>
          <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <Lock className="w-3.5 h-3.5" />
            <span>Code 250</span>
          </div>
        </div>

        <div className="text-sm text-slate-600 leading-relaxed">
          Une vérification de sécurité est requise par ÉcoleDirecte pour autoriser cet appareil. Veuillez sélectionner la réponse correspondant à votre dossier scolaire :
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Question de contrôle
            </span>
            <p className="text-base font-bold text-slate-900">
              {question}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Choisissez votre réponse
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {propositions.map((prop, idx) => {
                const isSelected = selectedChoice === prop;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedChoice(prop)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                    }`}
                  >
                    <span className="font-bold text-sm sm:text-base">
                      {prop}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 group-hover:border-slate-400 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Réponse validée avec succès. Redirection vers le tableau de bord...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedChoice || isLoading}
            className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
              selectedChoice && !isLoading
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{isLoading ? 'Vérification en cours...' : 'Valider la réponse'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {onResetTest && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={onResetTest}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline underline-offset-4 transition-colors"
            >
              Basculer vers le tableau de bord normal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
