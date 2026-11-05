import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export class AiService {
  /**
   * Generate a Hindi summary from scheme information using Gemini API.
   * Returns null if API key is not configured.
   */
  static async generateHindiSummary(schemeInfo: {
    nameEn: string;
    nameHi: string;
    descriptionEn: string;
    eligibility: any;
    benefits: string;
  }): Promise<string | null> {
    if (!config.geminiApiKey) {
      console.warn('Gemini API key not configured. Returning fallback summary.');
      return this.fallbackSummary(schemeInfo);
    }

    try {
      const prompt = `You are a helpful assistant for a women's welfare organization in Madhya Pradesh, India.
Generate a clear, simple Hindi summary (max 150 words) of this government welfare scheme.
Use simple Hindi that rural women can understand. Include key eligibility and benefits.

Scheme Name: ${schemeInfo.nameEn} (${schemeInfo.nameHi})
Description: ${schemeInfo.descriptionEn}
Eligibility: ${JSON.stringify(schemeInfo.eligibility)}
Benefits: ${schemeInfo.benefits}

Write ONLY the Hindi summary, nothing else.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error('Gemini API error:', response.status);
        return this.fallbackSummary(schemeInfo);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return this.fallbackSummary(schemeInfo);
      }

      return text.trim();
    } catch (error) {
      console.error('AI summary generation failed:', error);
      return this.fallbackSummary(schemeInfo);
    }
  }

  private static fallbackSummary(schemeInfo: {
    nameHi: string;
    descriptionEn: string;
    benefits: string;
  }): string {
    return `${schemeInfo.nameHi} — यह योजना महिलाओं के लिए उपलब्ध है। लाभ: ${schemeInfo.benefits}। अधिक जानकारी के लिए हेल्पलाइन पर कॉल करें।`;
  }
}
