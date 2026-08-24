import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
  Bot,
  User,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantTab: React.FC = () => {
  const {
    t,
    totalBalance,
    monthIncome,
    monthExpense,
    netSavings,
    savingsRate,
    expenseByCategory,
    budgetSummaries,
    goals,
    debts,
    activeLanguage,
    formatMoney,
  } = useFinance();

  // Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    score: number;
    rating: string;
    summary: string;
    strengths: string[];
    warnings: string[];
    tips: string[];
  } | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        activeLanguage === 'ky'
          ? 'Саламатсызбы! Мен сиздин AI жеке каржылык кеңешчиңизмин. Киреше-чыгымдарыңызды талдап, акча үнөмдөө же максаттарыңызга тезирээк жетүү боюнча кеңеш берүүгө даярмын. Сурооңузду бериңиз же төмөнкү даяр темаларды тандаңыз.'
          : activeLanguage === 'ru'
          ? 'Здравствуйте! Я ваш персональный финансовый советник. Готов проанализировать доходы и расходы, предложить пути экономии и помочь быстрее достичь финансовых целей.'
          : 'Hello! I am your personal AI financial advisor. Ready to analyze your finances, optimize spending, and help you achieve your financial targets.',
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading]);

  // Run AI Financial Audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditError(null);

    const financeData = {
      totalBalance,
      monthIncome,
      monthExpense,
      netSavings,
      savingsRate,
      topExpenses: expenseByCategory.map((e) => ({
        category: e.category.name,
        amount: e.amount,
        percentage: e.percentage,
      })),
      budgets: budgetSummaries.map((b) => ({
        category: b.category.name,
        limit: b.limit,
        spent: b.spent,
        isExceeded: b.isExceeded,
      })),
      goalsCount: goals.length,
      debtsCount: debts.length,
    };

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financeData, language: activeLanguage }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Анализ жүргүзүүдө ката кетти');
      }

      setAuditResult(data.data);
    } catch (err: any) {
      setAuditError(err.message || 'Ката кетти');
    } finally {
      setIsAuditing(false);
    }
  };

  // Send Chat message
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsChatLoading(true);

    const financeData = {
      totalBalance,
      monthIncome,
      monthExpense,
      netSavings,
      savingsRate,
      categories: expenseByCategory.map((e) => `${e.category.name}: ${e.amount}`),
    };

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          financeContext: financeData,
          language: activeLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI жооп берүүдө ката чыкты');
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Кечиресиз, сурооңузду иштетүүдө ката чыкты: ${err.message}`,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const starterQuestions = [
    'Кантип 6 айда 100,000 сом үнөмдөп топтосом болот?',
    'Менин чыгымдарымдын кайсынысын биринчи азайтуу керек?',
    '50/30/20 эрежеси менин азыркы кирешеме туура келеби?',
    'Кыргызстанда каржылык коопсуздук жаздыгын (подушка) кантип түзсө болот?',
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 w-full max-w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>{t.aiAdvisor.title}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">{t.aiAdvisor.subtitle}</p>
      </div>

      {/* AI Financial Health Audit Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Экспресс Аудит</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              Каржылык абалыңыздын ден-соолук индексин текшериңиз
            </h3>
            <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
              Gemini AI бюджетиңизди, топтоо пайызыңызды жана чыгымдарыңызды автоматтык түрдө эсептеп баа берет.
            </p>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-6 py-3 rounded-2xl bg-white text-purple-950 font-black text-xs sm:text-sm hover:bg-purple-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg active:scale-95 self-start md:self-auto"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Талдоодо...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{t.aiAdvisor.analyzeMyFinances}</span>
              </>
            )}
          </button>
        </div>

        {/* Audit Results Card */}
        {auditResult && (
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 animate-in fade-in space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xl flex items-center justify-center">
                  {auditResult.score}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-purple-200">Каржылык Баа</div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>{auditResult.rating}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/20 font-normal">
                      {auditResult.score}/100 упай
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-purple-200">
                Сактык көрсөткүчү: <b className="text-white">{savingsRate}%</b>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
              {auditResult.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {/* Strengths */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Күчтүү жактары</span>
                </div>
                <ul className="text-[11px] text-emerald-100 space-y-1 pl-1">
                  {auditResult.strengths?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Тобокелдиктер</span>
                </div>
                <ul className="text-[11px] text-amber-100 space-y-1 pl-1">
                  {auditResult.warnings?.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span>Сунушталган кадамдар</span>
                </div>
                <ul className="text-[11px] text-blue-100 space-y-1 pl-1">
                  {auditResult.tips?.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {auditError && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-xs">
            {auditError}
          </div>
        )}
      </div>

      {/* Interactive Financial Chat Consultant */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Каржы Кеңешчиси менен Чат
              </h4>
              <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Онлайн
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  role: 'assistant',
                  content: 'Чат жаңыланды. Кандай сурооңуз бар?',
                  timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Тазалоо"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-1">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isUser ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isChatLoading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>AI жоопту даярдап жатат...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Chips */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {starterQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={t.aiAdvisor.chatPlaceholder}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isChatLoading || !chatInput.trim()}
            className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-semibold text-xs sm:text-sm hover:bg-purple-500 disabled:opacity-50 shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Жөнөтүү</span>
          </button>
        </form>
      </div>
    </div>
  );
};
