import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client safely
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check API
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Transaction Parser Endpoint
app.post("/api/ai/parse-transaction", async (req: Request, res: Response) => {
  try {
    const { text, language = "ky" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "AI кызматынын ачкычы (API key) табылган жок. Кол менен толтуруңуз.",
      });
    }

    const systemPrompt = `You are a specialized financial assistant that extracts structured transaction details from user statements in Kyrgyz, Russian, or English.
Current Date: ${new Date().toISOString().split("T")[0]}.

Categories for expense:
- 'food': Тамак-аш & Азык-түлүк (Groceries, Cafe, Restaurant, Market)
- 'transport': Транспорт (Taxi, Bus, Fuel/Gas, Car maintenance, Yandex)
- 'housing': Турак-жай & Коммуналдык (Rent, Utilities, Internet, Electricity)
- 'health': Ден-соолук & Дары-дармек (Pharmacy, Doctor, Fitness)
- 'shopping': Кийим & Соода (Clothes, Shoes, Gadgets, Household items)
- 'education': Билим берүү & Курстар (Courses, Books, Tuition)
- 'entertainment': Көңүл ачуу & Эс алуу (Cinema, Games, Hobbies, Travel)
- 'family': Үй-бүлө & Балдар (Kids, Family gifts)
- 'bills': Салык & Кредиттер (Loan payments, Taxes, Fees)
- 'other_expense': Башка чыгымдар (General expense)

Categories for income:
- 'salary': Айлык акы (Salary, Wages, Main Job)
- 'business': Бизнес & Соода (Sales, Trade, Store profit)
- 'freelance': Фриланс & Кошумча (Freelance, Side gig, Delivery, Bonus)
- 'investment': Инвестиция & Пассивдүү (Dividends, Crypto, Interest)
- 'gift': Белек & Жардам (Gift, Aid, Cash prize)
- 'other_income': Башка киреше (Other income)

Return ONLY valid JSON matching this structure:
{
  "amount": number,
  "type": "expense" | "income",
  "category": string (one of the category keys above),
  "title": string (short clean name in ${language === 'ru' ? 'Russian' : language === 'en' ? 'English' : 'Kyrgyz'}),
  "account": "cash" | "card" | "savings",
  "confidence": number (0 to 1),
  "note": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Parse this transaction: "${text}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error("AI Parse Transaction Error:", error);
    return res.status(500).json({
      error: "Транзакцияны таанууда ката чыкты: " + (error?.message || "Белгисиз ката"),
    });
  }
});

// AI Financial Advice and Analysis Endpoint
app.post("/api/ai/analyze", async (req: Request, res: Response) => {
  try {
    const { summary, transactions, budgets, goals, currency = "KGS", language = "ky" } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "AI API ачкычы табылган жок.",
      });
    }

    const langInstructions = {
      ky: "Кыргыз тилинде жаз. Абдан сылык, түшүнүктүү, кесипкөй жана так кеңештерди бер.",
      ru: "Пиши на русском языке. Будь вежливым, точным и давай практичные финансовые советы.",
      en: "Write in English. Provide clear, polite, and actionable financial advice.",
    };

    const prompt = `
Төмөнкү финансылык маалыматтарды анализдеп, колдонуучуга терең жана пайдалуу анализ + кеңештерди бериңиз:

Валюта: ${currency}
Жалпы баланс: ${summary.totalBalance} ${currency}
Бул айдагы киреше: ${summary.totalIncome} ${currency}
Бул айдагы чыгым: ${summary.totalExpense} ${currency}
Таза үнөмдөө: ${summary.netSavings} ${currency} (Үнөмдөө коэффициенти: ${summary.savingsRate}%)

Эң көп чыгым болгон категориялар:
${JSON.stringify(summary.topExpenseCategories, null, 2)}

Бюджеттердин абалы:
${JSON.stringify(budgets, null, 2)}

Максаттар (Топтоо):
${JSON.stringify(goals, null, 2)}

Акыркы 15 транзакция:
${JSON.stringify(transactions?.slice(0, 15), null, 2)}

Жоопту төмөнкү JSON структурасында кайтарыңыз:
{
  "healthScore": number (0 to 100),
  "healthStatus": string (e.g., "Абдан жакшы" / "Орточо" / "Көңүл буруу керек"),
  "summaryInsight": string (1-2 sentences highlighting main financial status),
  "strengths": string[] (2-3 strong points of their financial management),
  "warnings": string[] (1-3 warnings or overspending alerts if any),
  "actionableTips": string[] (3-4 specific actionable steps to save or invest better),
  "recommendedBudgetAdjustment": string (1 actionable budget recommendation)
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert Certified Financial Planner (CFP) analyzing personal finances. ${langInstructions[language as keyof typeof langInstructions] || langInstructions.ky} Output strictly valid JSON.`,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({
      error: "Финансылык анализ жасоодо ката кетти: " + (error?.message || "Ката"),
    });
  }
});

// AI Financial Chat Assistant
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const { messages, context, language = "ky" } = req.body;
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "AI API ачкычы табылган жок.",
      });
    }

    const systemInstruction = `You are "Акылдуу Финансист" (Smart Financial Advisor), an intelligent personal finance mentor.
Language context: ${language === "ru" ? "Russian" : language === "en" ? "English" : "Kyrgyz"}.
User financial context:
${JSON.stringify(context || {}, null, 2)}

Provide helpful, encouraging, realistic, and practical financial advice regarding budgeting, saving money, getting out of debt, 50/30/20 rule, emergency funds (коопсуздук жаздыгы), and smart spending in Kyrgyzstan and Central Asia. Use clean formatting with bullet points when appropriate.`;

    const formattedContents = (messages || []).map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return res.json({
      success: true,
      reply: response.text || "Кечиресиз, жоопту түзүү мүмкүн болбоду.",
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      error: "AI менен байланышууда ката: " + (error?.message || "Ката"),
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Finance Web App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
