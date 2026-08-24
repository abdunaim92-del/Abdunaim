import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const DataExportModal: React.FC = () => {
  const {
    t,
    isDataModalOpen,
    setIsDataModalOpen,
    exportDataJSON,
    importDataJSON,
    exportToCSV,
    loadDemoData,
    resetAllData,
  } = useFinance();

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isDataModalOpen) return null;

  const handleDownloadJSON = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDataJSON(importText);
    if (ok) {
      setImportStatus('success');
      setTimeout(() => {
        setIsDataModalOpen(false);
        setImportStatus('idle');
        setImportText('');
      }, 1200);
    } else {
      setImportStatus('error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 transition-all pb-safe">
        {/* Mobile handle */}
        <div className="sm:hidden pt-2.5 pb-1">
          <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Маалыматтарды башкаруу жана Көчүрүү
          </h3>
          <button
            onClick={() => setIsDataModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Export Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Экспорт жана Көчүрмө алуу (Backup)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold text-left transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div>Резервдик көчүрмө (JSON)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Бардык эсептерди сактоо</div>
                </div>
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold text-left transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div>Excel / CSV көчүрүү</div>
                  <div className="text-[10px] text-slate-500 font-normal">Таблица түрүндө ачуу</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Калыбына келтирүү (Импорт)
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-300">Файлды тандаңыз же JSON коюңуз:</span>
                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300">
                  Файл тандоо
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='JSON резервдик көчүрмө текстин бул жерге коюңуз...'
                className="w-full text-xs font-mono p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-between">
                {importStatus === 'success' && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Ийгиликтүү калыбына келди!
                  </span>
                )}
                {importStatus === 'error' && (
                  <span className="text-xs text-red-500 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Файл форматы туура эмес!
                  </span>
                )}
                {importStatus === 'idle' && <span />}

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Импорттоо</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset Actions: Demo Data & Reset */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Баштапкы абалга келтирүү
            </h4>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  loadDemoData();
                  setIsDataModalOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold transition-all border border-purple-200 dark:border-purple-800"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{t.common.demoData} жүктө</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Бардык эсеп жана жазууларды тазалоого ишенесизби?')) {
                    resetAllData();
                    setIsDataModalOpen(false);
                  }
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 hover:bg-red-100 text-xs font-semibold transition-all border border-red-200 dark:border-red-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.common.reset}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
