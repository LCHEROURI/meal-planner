import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VoiceInputButton } from './VoiceInputButton';

describe('VoiceInputButton', () => {
  it('keeps typed input usable when browser speech recognition is unavailable', () => {
    render(<VoiceInputButton label="Speak ingredients" onTranscript={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Speak ingredients' })).toBeDisabled();
    expect(screen.getByText(/speech input is unavailable/i)).toBeInTheDocument();
  });
});
