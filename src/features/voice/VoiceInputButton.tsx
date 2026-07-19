import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../components/common/Button';
import { getSpeechRecognitionConstructor, isSpeechRecognitionSupported, type SpeechRecognitionLike } from './speech';

interface VoiceInputButtonProps {
  label: string;
  onTranscript: (transcript: string) => void;
  className?: string;
  large?: boolean;
}

export function VoiceInputButton({ label, onTranscript, className, large = false }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const supported = isSpeechRecognitionSupported();

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const stopListening = () => recognitionRef.current?.stop();

  const startListening = () => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor || isListening) return;

    const recognition = new Constructor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      if (transcript && Array.from(event.results).slice(event.resultIndex).some((result) => result.isFinal)) {
        onTranscript(transcript);
        setStatus('Added your spoken text.');
      }
    };
    recognition.onerror = (event) => {
      setStatus(event.error === 'not-allowed' ? 'Microphone permission was not granted. You can type instead.' : 'Speech input was interrupted. You can try again or type instead.');
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setStatus('Listening… speak when you are ready.');
    setIsListening(true);
    recognition.start();
  };

  if (!supported) {
    return (
      <span className="inline-flex items-center" title="Speech input is unavailable in this browser">
        <button type="button" aria-label={label} disabled className={cn('voice-button', large && 'voice-button-large', className)}>
          <Mic aria-hidden="true" />
        </button>
        <span className="sr-only">Speech input is unavailable in this browser. You can type instead.</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        aria-label={isListening ? `Stop ${label.toLowerCase()}` : label}
        aria-pressed={isListening}
        className={cn('voice-button', isListening && 'voice-button-listening', large && 'voice-button-large', className)}
        onClick={isListening ? stopListening : startListening}
      >
        {isListening ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">{status}</span>
    </span>
  );
}
