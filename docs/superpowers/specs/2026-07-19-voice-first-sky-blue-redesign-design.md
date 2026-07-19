# Voice-First Sky-Blue Redesign

## Accepted direction

Implement the hybrid voice experience approved by the user: a colourful, sky-blue meal-planning workspace that supports both a guided spoken summary and direct dictation into every applicable free-text field.

## Visual reference

- Accepted desktop concept: `/Users/laredjchehrouri/.codex/generated_images/019f7bb6-5684-7a71-8f90-ab84a0225cc3/exec-754a9c1b-1fbe-4fa6-a8e4-8b3f2a51fa3d.png`
- Background: light sky blue with quiet organic shapes.
- Surfaces: white, rounded, gently elevated.
- Ink: deep navy; accents: coral, lemon, violet and mint.
- Navigation: clear Home, Create plan and My plans destinations, with a compact responsive rail.

## Required experience

1. The authenticated application uses the new navigational shell and responsive sky-blue visual system.
2. The new-plan screen includes an immediately discoverable “Tell me your week” voice concierge.
3. The concierge records a transcript and extracts practical values for plan length, servings, maximum cooking time, dietary pattern, ingredients to use soon, excluded ingredients and notes. The extracted values remain editable before generation.
4. Every free-text meal-plan input exposes an accessible microphone control that appends dictated text.
5. The experience must work without speech recognition: typed inputs remain first-class and an unavailable/denied microphone has a clear non-blocking explanation.
6. Speech controls announce their state, expose an obvious stop action, prevent duplicate concurrent recognition sessions and respect keyboard interaction.
7. Existing form validation, Firebase generation and Firestore persistence remain unchanged.

## Implementation constraints

- Use the browser Web Speech API only; do not add a server-side speech service or new credentials.
- Feature-detect `SpeechRecognition` and `webkitSpeechRecognition` at runtime.
- Keep transcript parsing intentionally conservative: recognize direct phrases such as “five dinners”, “for two”, “under 45 minutes”, “vegetarian”, “I have spinach and chicken”, and “avoid mushrooms”. Retain the full transcript in notes rather than discard ambiguous language.
- Use React, TypeScript, Tailwind v4 and existing Lucide icons.
- Add focused tests for speech support/parsing rather than provider calls.

