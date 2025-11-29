import { GoogleGenAI, Modality } from "@google/genai";
import type { Transaction, Goal, Account } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to summarize data for the context window
const summarizeContext = (transactions: Transaction[], goals: Goal[], accounts: Account[]) => {
  const recentTx = transactions.slice(0, 20); // Last 20 transactions
  
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const topCategories = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const top3Categories = Object.entries(topCategories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k, v]) => `${k}: $${v.toFixed(0)}`)
    .join(', ');

  const goalSummary = goals.map(g => `${g.name} (${Math.round((g.currentAmount/g.targetAmount)*100)}%)`).join(', ');
  const accountSummary = accounts.map(a => `${a.name}: $${a.balance}`).join(', ');

  return `
    Current Date: ${new Date().toISOString().split('T')[0]}
    Accounts: ${accountSummary}
    Goals: ${goalSummary}
    Total Income (Last 90 days): $${totalIncome.toFixed(2)}
    Total Expense (Last 90 days): $${totalExpense.toFixed(2)}
    Top Spending Categories: ${top3Categories}
    Recent Transactions:
    ${recentTx.map(t => `- ${t.date}: ${t.description} ($${t.amount}) [${t.category}]`).join('\n')}
  `;
};

export const getFinancialAdvice = async (
  userMessage: string, 
  transactions: Transaction[], 
  goals: Goal[], 
  accounts: Account[],
  useThinking: boolean = false
) => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  const context = summarizeContext(transactions, goals, accounts);

  const systemPrompt = `
    You are FinLume Coach, an empathetic, smart financial assistant for a gig worker/freelancer with irregular income.
    Your goal is to help them save money, reduce debt, and plan for the future without using complex jargon.
    
    User Context:
    ${context}

    Guidelines:
    1. Be concise and actionable.
    2. Explain *why* you are giving advice (Explainable AI).
    3. If income is irregular, emphasize the importance of an emergency fund.
    4. Use the provided data to point out specific spending habits (e.g., "You spent $200 on coffee").
    5. Be encouraging but realistic.
    6. Format key numbers in bold.
  `;

  try {
    const model = 'gemini-3-pro-preview';
    let config: any = {
      systemInstruction: systemPrompt,
    };

    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    } else {
      config.temperature = 0.7;
    }

    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble analyzing your finances right now. Please try again later.";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
   const ai = getAiClient();
   if (!ai) return null;

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash-preview-tts',
       contents: { parts: [{ text }] },
       config: {
         responseModalities: [Modality.AUDIO],
         speechConfig: {
           voiceConfig: {
             prebuiltVoiceConfig: { voiceName: 'Kore' },
           },
         },
       },
     });
     
     return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
   } catch (e) {
     console.error("TTS Error", e);
     return null;
   }
}

export const generateInsights = async (transactions: Transaction[]) => {
   const ai = getAiClient();
  if (!ai) return [];

  const context = summarizeContext(transactions, [], []);
  
  // Using JSON mode for structured insights
  const prompt = `
    Analyze the user's recent financial data and provide 3 actionable insights/tips to save money.
    Focus on: Overspending, Recurring subscriptions, or Income volatility.
    Return JSON format: { "insights": [{ "title": string, "description": string, "impact": "high" | "medium" | "low" }] }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `Data: ${context}`,
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "{}";
    const data = JSON.parse(text);
    return data.insights || [];
  } catch (error) {
    console.error("Insight Generation Error:", error);
    return [];
  }
}