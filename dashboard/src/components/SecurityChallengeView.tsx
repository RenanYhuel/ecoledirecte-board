import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';

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

          {onResetTest && (
            <button
              type="button"
              onClick={onResetTest}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          )}
        </div>

        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
            Question posée
          </div>
          <div className="text-xs font-bold text-slate-900">
            {question}
          </div>
        </div>

        <div className="space-y-2">
          {propositions.map((prop, idx) => {
            const isSelected = selectedChoice === prop;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedChoice(prop)}
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
                  <span className="text-xs font-bold truncate">{prop}</span>
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
            <span>Réponse validée. Redirection...</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedChoice || isLoading}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            selectedChoice && !isLoading
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <span>{isLoading ? 'Validation...' : 'Valider la réponse'}</span>
        </button>
      </div>
    </div>
  );
};
