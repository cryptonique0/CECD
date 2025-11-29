// Client-side translation utility for Nigerian languages
// This is a simplified implementation - in production, you'd use a proper translation API

interface TranslationResult {
  translatedText: string;
  detectedLanguage: 'yoruba' | 'hausa' | 'igbo' | 'english' | 'unknown';
  confidence: number;
}

// Common words/phrases for language detection
const languagePatterns = {
  yoruba: ['ẹ', 'ọ', 'ṣ', 'bawo', 'ẹ se', 'mo', 'ni', 'ti', 'wa', 'fun'],
  hausa: ['ina', 'yaya', 'kai', 'ki', 'da', 'ba', 'na', 'ta', 'sa', 'allah'],
  igbo: ['kedu', 'ndi', 'nke', 'na', 'bu', 'ga', 'nwa', 'unu', 'anyi', 'ọ'],
};

// Simple keyword-based translation dictionary (for demo purposes)
const translationDict: Record<string, Record<string, string>> = {
  yoruba: {
    'ina': 'fire',
    'ọkọ': 'vehicle',
    'ile': 'house',
    'omi': 'water',
    'ẹjẹ': 'blood',
    'aisan': 'disease',
    'ole': 'thief',
    'ikun': 'flood',
    'ewu': 'danger',
    'ipalara': 'accident',
    'kokoro': 'disease',
    'iku': 'death',
  },
  hausa: {
    'wuta': 'fire',
    'mota': 'vehicle',
    'gida': 'house',
    'ruwa': 'water',
    'jini': 'blood',
    'cuta': 'disease',
    'barawo': 'thief',
    'ambaliya': 'flood',
    'hadari': 'danger',
    'hatsari': 'accident',
  },
  igbo: {
    'ọkụ': 'fire',
    'ụgbọala': 'vehicle',
    'ụlọ': 'house',
    'mmiri': 'water',
    'ọbara': 'blood',
    'ọrịa': 'disease',
    'onye ohi': 'thief',
    'iju mmiri': 'flood',
    'ihe egwu': 'danger',
    'ihe mberede': 'accident',
  },
};

export function detectLanguage(text: string): TranslationResult['detectedLanguage'] {
  const lowerText = text.toLowerCase();
  
  // Count pattern matches for each language
  const scores = {
    yoruba: 0,
    hausa: 0,
    igbo: 0,
  };

  for (const [lang, patterns] of Object.entries(languagePatterns)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        scores[lang as keyof typeof scores]++;
      }
    }
  }

  // Find language with highest score
  const maxScore = Math.max(scores.yoruba, scores.hausa, scores.igbo);
  
  if (maxScore === 0) {
    return 'english'; // Default to English if no patterns match
  }

  if (scores.yoruba === maxScore) return 'yoruba';
  if (scores.hausa === maxScore) return 'hausa';
  if (scores.igbo === maxScore) return 'igbo';
  
  return 'unknown';
}

export function translateToEnglish(text: string): TranslationResult {
  const detectedLanguage = detectLanguage(text);
  
  if (detectedLanguage === 'english' || detectedLanguage === 'unknown') {
    return {
      translatedText: text,
      detectedLanguage,
      confidence: detectedLanguage === 'english' ? 95 : 50,
    };
  }

  // Simple word-by-word translation for demo
  let translatedText = text;
  const dict = translationDict[detectedLanguage];
  
  if (dict) {
    for (const [original, translation] of Object.entries(dict)) {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      translatedText = translatedText.replace(regex, translation);
    }
  }

  // Calculate confidence based on how many words were translated
  const originalWords = text.split(/\s+/).length;
  const changedWords = text.split(/\s+/).filter((word, i) => {
    const translatedWord = translatedText.split(/\s+/)[i];
    return word !== translatedWord;
  }).length;
  
  const confidence = Math.min(95, 60 + (changedWords / originalWords) * 35);

  return {
    translatedText,
    detectedLanguage,
    confidence: Math.round(confidence),
  };
}

export function needsTranslation(text: string): boolean {
  const lang = detectLanguage(text);
  return lang !== 'english' && lang !== 'unknown';
}

