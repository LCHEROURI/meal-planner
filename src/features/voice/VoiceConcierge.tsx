import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { MealPlanGenerationInput } from '../../schemas';
import { parseMealPlanTranscript } from './speech';
import { VoiceInputButton } from './VoiceInputButton';

interface VoiceConciergeProps {
  onPreferences: (preferences: Partial<MealPlanGenerationInput>, transcript: string) => void;
}

export function VoiceConcierge({ onPreferences }: VoiceConciergeProps) {
  const [transcript, setTranscript] = useState('');

  const handleTranscript = (spokenText: string) => {
    const nextTranscript = transcript ? `${transcript} ${spokenText}` : spokenText;
    setTranscript(nextTranscript);
    onPreferences(parseMealPlanTranscript(nextTranscript), nextTranscript);
  };

  return (
    <section className="voice-concierge" aria-labelledby="voice-concierge-title">
      <div className="voice-concierge-icon"><Sparkles aria-hidden="true" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="voice-concierge-title" className="text-2xl font-black tracking-tight text-text-primary">Tell me your week</h2>
          <span className="voice-availability">Voice concierge</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-text-secondary">Say what you need—days, servings, timing, dietary needs, and what is already in your kitchen.</p>
        <p className="mt-4 rounded-2xl bg-white/75 px-4 py-3 text-sm leading-6 text-text-primary shadow-sm">
          {transcript || '“I need five dinners for two, under 45 minutes. I have spinach and chicken.”'}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2">
        <VoiceInputButton label="Start voice concierge" onTranscript={handleTranscript} large />
        <span className="text-xs font-semibold text-text-secondary">Tap to speak</span>
      </div>
    </section>
  );
}
