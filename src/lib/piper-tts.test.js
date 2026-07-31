import { PiperTTS, normalizeTextForPiper, createNaturalPiperChunks } from './piper-tts.js';

jest.mock('phonemizer', () => ({
  phonemize: jest.fn(async () => 'mock-phonemes')
}));

describe('normalizeTextForPiper', () => {
  it('removes Vietnamese diacritics and converts to ASCII-safe text for Piper models', () => {
    const normalized = normalizeTextForPiper('Chào bạn, hôm nay trời đẹp!');

    expect(normalized).toBe('chao ban hom nay troi dep');
    expect(normalized).not.toContain('à');
    expect(normalized).not.toContain('ạ');
    expect(normalized).not.toContain('ố');
  });

  it('groups text into natural phrase chunks for smoother TTS reading', () => {
    const chunks = createNaturalPiperChunks('Chao ban hom nay troi dep. Chuyen nay rat thu vi va day moi me.');

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toContain('chao');
    expect(chunks[0]).toContain('dep');
  });
});

describe('PiperTTS', () => {
  it('uses Vietnamese IPA phoneme conversion for vi/espeak voices', async () => {
    // Vietnamese models have espeak.voice: "vi", so textToPhonemes uses
    // vietnameseTextToApproxPhonemes() which generates IPA symbols (ɗ, ɛ, ɔ, ɤ, ɯ, ʃ, ʈ, ʂ, θ, ŋ, ɲ)
    // that exist in the model's phoneme_id_map for proper Vietnamese pronunciation.
    const piper = new PiperTTS({ espeak: { voice: 'vi' } });
    const result = await piper.textToPhonemes('Xin chào');

    // ch → ʃ (STEP 5 consonant cluster), ao → aw (STEP 6 diphthong)
    expect(result[0]).toContain('ʃ');
    expect(result[0]).toContain('w');
  });

  it('uses normalizeTextForPiper for non-Vietnamese text-mode models', async () => {
    const piper = new PiperTTS({ phoneme_type: 'text' });
    const { phonemize } = await import('phonemizer');

    const result = await piper.textToPhonemes('Chào bạn, hôm nay trời đẹp!');

    expect(result).toEqual([Array.from('chao ban hom nay troi dep')]);
    expect(phonemize).not.toHaveBeenCalled();
  });
});
