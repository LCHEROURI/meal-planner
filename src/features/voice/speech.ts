import type { MealPlanGenerationInput } from '../../schemas';

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechWindow = Window & typeof globalThis & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionConstructor());
}

const dietaryPatterns: Array<[RegExp, MealPlanGenerationInput['dietaryPattern']]> = [
  [/gluten[- ]free/i, 'gluten_free'],
  [/dairy[- ]free/i, 'dairy_free'],
  [/lower[- ]carb/i, 'lower_carb'],
  [/pescatarian/i, 'pescatarian'],
  [/vegetarian/i, 'vegetarian'],
  [/vegan/i, 'vegan'],
  [/halal/i, 'halal_friendly'],
  [/kosher/i, 'kosher_style'],
];

function splitIngredients(value: string): string[] {
  return value
    .replace(/[.?!]/g, '')
    .split(/,|\band\b/gi)
    .map((item) => item.trim().replace(/^(some |a |an )/i, ''))
    .filter(Boolean);
}

function captureIngredients(transcript: string, expression: RegExp): string[] | undefined {
  const match = transcript.match(expression);
  return match?.[1] ? splitIngredients(match[1]) : undefined;
}

export function parseMealPlanTranscript(transcript: string): Partial<MealPlanGenerationInput> {
  const preferences: Partial<MealPlanGenerationInput> = {
    freeTextNotes: transcript.trim(),
  };
  const normalized = transcript.toLowerCase();
  const planLength = normalized.match(/\b(three|five|seven|3|5|7)\s+(?:dinners?|days?|nights?)/);
  const servings = normalized.match(/\bfor\s+(one|two|three|four|five|six|\d+)\b/);
  const maxTime = normalized.match(/\b(?:under|within|less than|max(?:imum)?\s+of?)\s+(\d+)\s+minutes?/);

  const planLengthMap: Record<string, '3' | '5' | '7'> = {
    three: '3', '3': '3', five: '5', '5': '5', seven: '7', '7': '7',
  };
  if (planLength) preferences.planLength = planLengthMap[planLength[1]];
  const servingMap: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  };
  if (servings) preferences.servings = servingMap[servings[1]] ?? Number(servings[1]);
  if (maxTime) preferences.maxTotalTimeMinutes = Number(maxTime[1]);

  const dietary = dietaryPatterns.find(([expression]) => expression.test(transcript));
  if (dietary) preferences.dietaryPattern = dietary[1];

  const useSoonIngredients = captureIngredients(transcript, /(?:i have|use(?: up)?|use soon)\s+([^.!?]+)(?=[.!?]|$)/i);
  const excludedIngredients = captureIngredients(transcript, /(?:avoid|exclude|no)\s+([^.!?]+)(?=[.!?]|$)/i);
  if (useSoonIngredients?.length) preferences.useSoonIngredients = useSoonIngredients;
  if (excludedIngredients?.length) preferences.excludedIngredients = excludedIngredients;

  return preferences;
}
