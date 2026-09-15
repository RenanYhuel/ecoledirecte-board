import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { QcmChallenge, QcmProposition } from '../services/api';

export interface SecurityChallengeViewProps {
  challenge: QcmChallenge;
  onSubmit: (choiceRaw: string) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const SecurityChallengeView: React.FC<SecurityChallengeViewProps> = ({
  challenge,
  onSubmit,
  isLoading = false,
  errorMessage = null,
}) => {
  const [selectedProp, setSelectedProp] = useState<QcmProposition | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProp || isLoading) return;

    try {
      await onSubmit(selectedProp.raw);
      setIsSuccess(true);
    } catch {
      setIsSuccess(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 bg-[#f1f5f9] select-none box-border font-sans">
      <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 flex flex-col w-full max-w-lg overflow-hidden gap-3">
        <div className="flex items-center justify-between pb-2 flex-none gap-2 border-b border-indigo-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex-none">
              Double Authentification
            </h2>
            <div className="flex items-center bg-indigo-50 p-0.5 rounded-lg border border-indigo-200 text-[11px] px-2 py-0.5 font-bold text-indigo-900">
              Code 250
            </div>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
            Question de sécurité ÉcoleDirecte
          </div>
          <div className="text-xs font-bold text-slate-900">
            {challenge.question_decoded || 'Veuillez répondre à la question suivante :'}
          </div>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {challenge.propositions.map((prop, idx) => {
            const isSelected = selectedProp?.raw === prop.raw;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedProp(prop)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-1.5 h-6 rounded-full flex-none ${
                      isSelected ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-xs font-bold truncate">{prop.decoded}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center flex-none ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center gap-2 text-rose-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-emerald-700 text-xs font-bold">
            <Check className="w-4 h-4 shrink-0" />
            <span>Réponse validée. Connexion en cours...</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedProp || isLoading}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            selectedProp && !isLoading
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <span>{isLoading ? 'Vérification en cours...' : 'Valider la réponse'}</span>
        </button>
      </div>
    </div>
  );
};
