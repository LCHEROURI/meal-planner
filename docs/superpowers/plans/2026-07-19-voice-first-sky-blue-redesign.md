# Voice-First Sky-Blue Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a colourful, responsive meal-planning interface with guided voice capture and field-level dictation.

**Architecture:** A small speech utility owns browser feature detection, recognition lifecycle and conservative transcript extraction. Reusable `VoiceInputButton` and `VoiceConcierge` components consume that utility, while the existing React Hook Form screen remains the owner of meal-plan state. Shared Tailwind tokens and the authenticated layout implement the accepted sky-blue visual system.

**Tech Stack:** React 19, TypeScript, React Hook Form, Tailwind CSS v4, Lucide React, Vitest.

## Global Constraints

- Use only the browser Web Speech API; no new service, credential or dependency.
- Feature-detect `SpeechRecognition` and `webkitSpeechRecognition` before rendering an active control.
- Keep typed fields usable regardless of microphone availability or permission.
- Keep Firebase generation and Firestore persistence behavior intact.
- Use the approved sky-blue, navy, white, coral, mint, violet and lemon design system.

---

### Task 1: Speech parsing and recognition support

**Files:**
- Create: `src/features/voice/speech.ts`
- Create: `src/features/voice/speech.test.ts`

**Interfaces:**
- Produces: `isSpeechRecognitionSupported(): boolean`, `parseMealPlanTranscript(transcript: string): Partial<MealPlanGenerationInput>`, and `SpeechRecognitionConstructor`.
- Consumes: `MealPlanGenerationInput` from `src/schemas/index.ts`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { parseMealPlanTranscript } from './speech';

describe('parseMealPlanTranscript', () => {
  it('extracts direct scheduling preferences', () => {
    expect(parseMealPlanTranscript('I need five dinners for two, under 45 minutes, vegetarian.')).toMatchObject({
      planLength: '5', servings: 2, maxTotalTimeMinutes: 45, dietaryPattern: 'vegetarian',
    });
  });

  it('keeps ingredients and exclusions as editable lists', () => {
    expect(parseMealPlanTranscript('I have spinach and chicken. Avoid mushrooms and cilantro.')).toMatchObject({
      useSoonIngredients: ['spinach', 'chicken'], excludedIngredients: ['mushrooms', 'cilantro'],
    });
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/features/voice/speech.test.ts`

Expected: FAIL because `./speech` does not exist.

- [ ] **Step 3: Implement conservative browser speech helpers**

```ts
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}
```

Implement direct numeric, dietary, ingredient and exclusion phrase extraction. Return only known values; never throw for arbitrary transcripts.

- [ ] **Step 4: Run the focused test**

Run: `npx vitest run src/features/voice/speech.test.ts`

Expected: PASS.

### Task 2: Reusable speech controls

**Files:**
- Create: `src/features/voice/VoiceInputButton.tsx`
- Create: `src/features/voice/VoiceConcierge.tsx`
- Modify: `src/features/meal-plans/NewPlanForm.tsx`

**Interfaces:**
- Consumes: `SpeechRecognitionConstructor`, `isSpeechRecognitionSupported`, `parseMealPlanTranscript` from `src/features/voice/speech.ts`.
- Produces: field-level transcript callbacks and a meal-plan preference callback.

- [ ] **Step 1: Add an interaction-focused failing test**

```ts
it('renders a disabled typed fallback when speech recognition is unavailable', () => {
  render(<VoiceInputButton onTranscript={() => undefined} />);
  expect(screen.getByText(/speech input is unavailable/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/features/voice/VoiceInputButton.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the components**

Create an icon-only, labelled microphone button that toggles listening, exposes an `aria-pressed` state, announces status via a live region and calls the provided transcript callback. Create a concierge panel that keeps the full transcript and calls `onPreferences(parsed, transcript)` on final recognition. In `NewPlanForm`, use `setValue` to update form values and append dictated field text without replacing existing user input.

- [ ] **Step 4: Run focused tests**

Run: `npx vitest run src/features/voice`

Expected: PASS.

### Task 3: Approved visual system and navigation

**Files:**
- Modify: `src/index.css`
- Modify: `src/layouts/AppLayout.tsx`
- Modify: `src/features/meal-plans/Dashboard.tsx`
- Modify: `src/features/meal-plans/NewPlanForm.tsx`

**Interfaces:**
- Consumes: existing routes and `Button`, `Card` primitives.
- Produces: a responsive application shell with Home, Create plan and My plans navigation.

- [ ] **Step 1: Implement exact visual tokens and layout**

Define sky-blue background, navy text, coral primary buttons, white surfaces, mint voice state and high-contrast focus rings. Add a desktop navigation rail that collapses to a readable mobile bar. Reshape the dashboard and plan form around open space, the concierge panel and grouped form areas while keeping existing route paths.

- [ ] **Step 2: Run type check and build**

Run: `npm run build`

Expected: production build succeeds.

### Task 4: Rendered verification and fidelity pass

**Files:**
- Modify only if visual QA reveals a mismatch.

- [ ] **Step 1: Run the local app**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite reports a local URL.

- [ ] **Step 2: Verify desktop and mobile workflows**

Use the Browser plugin to load the local app, verify the app is non-blank and error-free, inspect the desktop form and a mobile viewport, activate the voice control, and confirm its visible listening or fallback state.

- [ ] **Step 3: Compare against the accepted concept**

Use `view_image` on the accepted concept and latest rendered screenshot. Compare at least navigation, palette, concierge placement, microphone affordances, form geometry and primary action; fix any material mismatch.

- [ ] **Step 4: Run final checks**

Run: `npx vitest run && npm run build && npm run lint`

Expected: all checks pass.
