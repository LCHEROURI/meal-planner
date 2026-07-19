import { describe, expect, it } from 'vitest';
import { parseMealPlanTranscript } from './speech';

describe('parseMealPlanTranscript', () => {
  it('extracts direct scheduling preferences from a spoken summary', () => {
    expect(
      parseMealPlanTranscript('I need five dinners for two, under 45 minutes, vegetarian.')
    ).toMatchObject({
      planLength: '5',
      servings: 2,
      maxTotalTimeMinutes: 45,
      dietaryPattern: 'vegetarian',
    });
  });

  it('keeps spoken ingredients and exclusions as editable lists', () => {
    expect(
      parseMealPlanTranscript('I have spinach and chicken. Avoid mushrooms and cilantro.')
    ).toMatchObject({
      useSoonIngredients: ['spinach', 'chicken'],
      excludedIngredients: ['mushrooms', 'cilantro'],
    });
  });

  it('does not discard an ambiguous transcript', () => {
    expect(parseMealPlanTranscript('Something colourful and quick, please.')).toEqual({
      freeTextNotes: 'Something colourful and quick, please.',
    });
  });
});
