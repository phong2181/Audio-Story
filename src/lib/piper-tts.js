/* eslint-disable no-undef */

import { processTextForTTS, chunkText, loadConfig, isDebugEnabled, debugLog } from '../utils/text-cleaner.js';
import Str from 'normalize-vietnamese';

// Merge phonemizer output (which may be an array of clause strings) into a single
// string while preserving clause separators (commas/semicolons/colons) from the
// original text. This lets the model \"see\" punctuation and pause naturally.
function mergePhonemizerOutputPreservePunct(text, phonemes) {
  // Simple case: phonemizer already returned a single string
  if (typeof phonemes === 'string') {
    return phonemes;
  }

  // Handle object outputs (e.g., { text, phonemes })
  if (phonemes && typeof phonemes === 'object' && !Array.isArray(phonemes)) {
    const maybeText = phonemes.text || phonemes.phonemes;
    if (typeof maybeText === 'string') {
      return maybeText;
    }
    return String(maybeText ?? phonemes);
  }

  // Fallback for null/undefined and non-array cases
  if (!Array.isArray(phonemes)) {
    return String(phonemes ?? '');
  }

  // Collect clause separators from original text (commas/semicolon/colon)
  const separators = Array.from(text.matchAll(/[,;:]/g), (m) => m[0]);

  let result = '';
  let sepIdx = 0;

  for (let i = 0; i < phonemes.length; i++) {
    const rawPart = phonemes[i];
    if (!rawPart) continue;

    const part = String(rawPart).trim();
    if (!part) continue;

    if (result) {
      // Insert the matching separator if available; otherwise default to comma + space
      const sep = separators[sepIdx] || ',';
      result += `${sep} `;
      sepIdx++;
    }

    result += part;
  }

  return result;
}

// Text splitting stream to break text into chunks
export class TextSplitterStream {
  constructor() {
    this.chunks = [];
    this.closed = false;
  }

  async chunkText(text) {
    // Process the text (clean + replace words), then chunk it
    const processedText = await processTextForTTS(text);
    return createNaturalPiperChunks(processedText);
  }

  async push(text) {
    // Simple sentence splitting for now
    const sentences = await this.chunkText(text) || [text];
    this.chunks.push(...sentences);
  }

  close() {
    this.closed = true;
  }

  async *[Symbol.asyncIterator]() {
    for (const chunk of this.chunks) {
      yield chunk;
    }
  }
}

// RawAudio class to handle audio data
export class RawAudio {
  constructor(audio, sampling_rate) {
    this.audio = audio;
    this.sampling_rate = sampling_rate;
  }

  get length() {
    return this.audio.length;
  }

  toBlob() {
    // Convert Float32Array to WAV blob
    const buffer = this.encodeWAV(this.audio, this.sampling_rate);
    return new Blob([buffer], { type: 'audio/wav' });
  }

  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + samples.length * 2, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, samples.length * 2, true);

    this.floatTo16BitPCM(view, 44, samples);

    return buffer;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }
}

export function normalizeTextForPiper(text) {
  if (typeof text !== 'string') return '';

  const asciiMap = {
    'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'đ': 'd', 'Đ': 'd'
  };

  const normalized = Str.normalize(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\r?\n/g, ' ')
    .replace(/([,;:])(?=\S)/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return normalized
    .replace(/[ăắằẳẵặâấầẩẫậêếềểễệôốồổỗộơớờởỡợưứừửữựđĐ]/g, (char) => asciiMap[char] || char)
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([.?!])(?=[A-Za-z0-9])/g, '$1 ')
    .replace(/[^a-z0-9\s.,;:?!()'"-]/g, '');
}

/**
 * Convert Vietnamese text to approximate IPA phonemes supported by Piper Vietnamese models.
 * 
 * CRITICAL BUG FIX: The original code called Str.normalize() first which converted 
 * Vietnamese chars (đ→d, ê→e, ô→o) BEFORE the IPA replacement array could map them.
 * Then the final cleanup regex /[^a-z0-9]/ stripped all IPA symbols (ɗ, ŋ, ʃ, ʈ, etc.).
 * 
 * FIX 1 (đ→ɗ): đ→d in phoneme_id_map has ID 17 (dental stop /d/). But Vietnamese 
 *   'đ' is actually a voiced implosive /ɗ/ (ID 57). Map đ→ɗ for correct pronunciation.
 * FIX 2 (IPA preserved): Map Vietnamese chars to IPA BEFORE Str.normalize() would
 *   destroy them. Keep IPA Extended range (U+0250-U+02AF) in the final cleanup.
 */
function vietnameseTextToApproxPhonemes(text) {
  if (typeof text !== 'string') return '';

  // STEP 1: Basic cleanup - do NOT use Str.normalize() yet, it destroys đ, ê, ô, ơ, ư
  let phonetic = text
    .replace(/[“”]/g, ' ')
    .replace(/[’]/g, "'")
    .replace(/\r?\n/g, ' ')
    .toLowerCase()
    .trim();

  if (!phonetic) return '';

  // STEP 2: Map ALL Vietnamese chars (base + all 5 tone variants) to IPA BEFORE NFKD.
  // NFKD decomposes đ→d+U+0335, ê→e+U+0302, ô→o+U+0302, ơ→o+U+031B, ư→u+U+031B.
  // Stripping combining marks turns them to plain ASCII (d, e, o, o, u) which
  // simple regex like /ê/g, /đ/g can NO LONGER match.
  // Solution: use character classes that include base + ALL tone variants.
  phonetic = phonetic
    .replace(/[đ]/g, 'ɗ')
    .replace(/[êềếểễệ]/g, 'ɛ')
    .replace(/[ôồốổỗộ]/g, 'ɔ')
    .replace(/[ơờớởỡợ]/g, 'ɤ')
    .replace(/[ưừứửữự]/g, 'ɯ');

  // STEP 3: Remove tone marks via NFKD normalization - BUT preserve combining tilde (U+0303).
  // At this point đ→ɗ, ê→ɛ, ô→ɔ, ơ→ɤ, ư→ɯ are already mapped to IPA.
  // IPA chars (U+0250-U+02AF: ɗ, ɛ, ɔ, ɤ, ɯ) survive NFKD.
  // The model's phoneme_id_map has combining tilde (̃, U+0303) with ID 141, so dấu ngã
  // (ã, ễ, ẫ, ỗ, ỡ, ữ) can be preserved as combining tilde after the IPA vowel.
  // Other tone marks (grave U+0300, acute U+0301, hook U+0309, dot U+0323) are NOT in
  // the model's phoneme_id_map, so they are still stripped.
  // This improves pronunciation for common ngã words like: đã, nghĩ, mã, cũ, vẫn, đẫm, etc.
  phonetic = phonetic
    .normalize('NFKD')
    .replace(/[\u0300-\u0302\u0304-\u0308\u030a-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!phonetic) return '';

  // STEP 4: Cleanup - KEEP IPA Extended range (U+0250-U+02AF) plus hyphen
  // The hyphen is important because transliteration uses it (e.g. "xin-ga-po")
  phonetic = phonetic
    .replace(/[^a-z0-9\u0250-\u02af\s.,;:?!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!phonetic) return '';

  // STEP 5: Apply consonant cluster IPA mappings
  // Order matters: longer matches before shorter ones to avoid partial matches
  phonetic = phonetic
    .replace(/qu/g, 'kw')
    .replace(/gi/g, 'ji')
    .replace(/gh/g, 'g')
    .replace(/kh/g, 'x')
    .replace(/ph/g, 'f')
    .replace(/th/g, 'θ')
    .replace(/ng/g, 'ŋ')
    .replace(/nh/g, 'ɲ')
    .replace(/ch/g, 'ʃ')
    .replace(/tr/g, 'ʈ')
    .replace(/x/g, 'ʂ');

  // STEP 6: Vowel and diphthong IPA mappings
  phonetic = phonetic
    .replace(/oa/g, 'wa')
    .replace(/oe/g, 'we')
    .replace(/uy/g, 'ui')
    .replace(/ai/g, 'aj')
    .replace(/ao/g, 'aw')
    .replace(/au/g, 'aw')
    .replace(/oi/g, 'ɔi')
    .replace(/eu/g, 'ɛu')
    .replace(/ia/g, 'iə')
    .replace(/ua/g, 'wa')
    .replace(/ui/g, 'ui')
    .replace(/eo/g, 'ew')
    .replace(/iu/g, 'iw');

  // STEP 7: Final single-character cleanups
  // c→k (Vietnamese /k/ at syllable onset)
  // y→i (final y as vowel)
  // q→k (rare, mostly in qu→kw already handled above)
  phonetic = phonetic
    .replace(/q/g, 'k')
    .replace(/c/g, 'k')
    .replace(/y/g, 'i')
    .replace(/\s+/g, ' ')
    .trim();

  return phonetic;
}

export function createNaturalPiperChunks(text, options = {}) {
  const { maxChars = 140 } = options;

  if (typeof text !== 'string') return [];

  // IMPORTANT: Use basic normalization that PRESERVES Vietnamese characters
  // (đ, ê, ô, ơ, ư) so that vietnameseTextToApproxPhonemes() can map them to IPA.
  // normalizeTextForPiper() strips these to ASCII (đ→d, ê→e) which breaks the IPA mapping.
  const normalized = text
    .normalize()
    .toLowerCase()
    .replace(/\r?\n/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/([,;:])(?=\S)/g, '$1 ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .trim();

  if (!normalized) return [];

  const fragments = normalized
    .split(/(?<=[.?!])\s+|(?<=[,;:])\s+/)
    .map((fragment) => fragment.trim())
    .filter(Boolean);

  const chunks = [];
  let current = '';

  fragments.forEach((fragment) => {
    const candidate = current ? `${current} ${fragment}` : fragment;
    const isStrongBoundary = /[.!?]$/.test(current) || /[.!?]$/.test(fragment);

    if (!current) {
      current = fragment;
      return;
    }

    if (candidate.length <= maxChars && !isStrongBoundary) {
      current = candidate;
    } else {
      chunks.push(current.trim());
      current = fragment;
    }
  });

  if (current) chunks.push(current.trim());

  return chunks.filter(Boolean);
}

// Piper TTS class for local model
export class PiperTTS {
  constructor(voiceConfig = null, session = null) {
    this.voiceConfig = voiceConfig;
    this.session = session;
    this.phonemeIdMap = null;
  }

  static async from_pretrained(modelPath, configPath) {
    try {
      // Import ONNX Runtime Web and caching utility
      const ort = await import('onnxruntime-web');
      const { cachedFetch } = await import('../utils/model-cache.js');

      // Use local files in public directory with threading enabled
      ort.env.wasm.wasmPaths = `${globalThis.location.origin}/onnx-runtime/`;

      // Load model and config
      const [modelResponse, configResponse] = await Promise.all([
        cachedFetch(modelPath),
        cachedFetch(configPath)
      ]);

      const [modelBuffer, voiceConfig] = await Promise.all([
        modelResponse.arrayBuffer(),
        configResponse.json()
      ]);

      // Create ONNX session with WASM execution provider
      const session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: [{
          name: 'wasm',
          simd: true
        }]
      });

      return new PiperTTS(voiceConfig, session);
    } catch (error) {
      console.error('Error loading Piper model:', error);
      throw error;
    }
  }

  // Convert text to phonemes using the phonemizer package
  async textToPhonemes(text) {
    const config = await loadConfig();

    if (isDebugEnabled(config)) {
      console.log(`[TEXT TO PHONEMES] Input text: ${JSON.stringify(text)}`);
    }

    const sourceText = String(text || '').trim();
    if (!sourceText) return [];

const voice = this.voiceConfig?.espeak?.voice || 'vi';
console.log(voice);

    // BUG FIX 2 (Critical): Vietnamese voice check must come BEFORE phoneme_type: "text" check.
    // Although Vietnamese models have phoneme_type: "text", the phoneme_id_map contains
    // full IPA symbols (ɗ=57, ɛ=61, ɔ=54, ɤ=69, ɯ=79, ŋ=44, ɲ=82, ʃ=96, ʈ=98, ʂ=95, θ=126).
    // Using normalizeTextForPiper() produces pure ASCII like "xin chao ban" which the model
    // reads with English phonemes — NOT Vietnamese.
    // vietnameseTextToApproxPhonemes() produces IPA phonemes like "ʃiŋ ɲɯɤ˧" which the model
    // reads with proper Vietnamese pronunciation because it was trained on these IPA tokens.
    if (voice && /^vi/i.test(String(voice))) {
      const phoneticText = vietnameseTextToApproxPhonemes(sourceText);
      const sentences = phoneticText
        .split(/(?<=[.?!])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

      const result = sentences.length > 0
        ? sentences.map((sentence) => Array.from(sentence))
        : [Array.from(phoneticText)];

      if (isDebugEnabled(config)) {
        console.log(`[VIETNAMESE PHONEME MODE] Phonetic text:`, phoneticText);
      }

      return result;
    }

    // Some Piper models are already trained for direct text phonemes. In that case,
    // we should feed normalized ASCII characters directly instead of going through
    // the phonemizer layer, which is not available for Vietnamese in this runtime.
    if (this.voiceConfig?.phoneme_type === 'text') {
      const normalized = normalizeTextForPiper(sourceText);
      const sentences = normalized
        .split(/(?<=[.?!])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

      const result = sentences.length > 0
        ? sentences.map((sentence) => Array.from(sentence))
        : [Array.from(normalized)];

      if (isDebugEnabled(config)) {
        console.log(`[TEXT MODE] Normalized text characters:`, normalized);
      }

      return result;
    }

    try {
      const { phonemize } = await import('phonemizer');
      const phonemeOutput = await phonemize(sourceText, voice);

      let phonemeText = '';
      if (typeof phonemeOutput === 'string') {
        phonemeText = phonemeOutput;
      } else if (Array.isArray(phonemeOutput)) {
        phonemeText = phonemeOutput.join(' ');
      } else if (phonemeOutput && typeof phonemeOutput === 'object') {
        phonemeText = phonemeOutput.text || phonemeOutput.phonemes || String(phonemeOutput);
      } else {
        phonemeText = String(phonemeOutput || sourceText);
      }

      const sentences = phonemeText
        .split(/(?<=[.?!])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

      const result = sentences.length > 0
        ? sentences.map((sentence) => Array.from(sentence.normalize('NFD')))
        : [[...sourceText.normalize('NFD')]];

      if (isDebugEnabled(config)) {
        console.log(`[PHONEMIZER MODE] Phoneme text:`, phonemeText);
      }

      return result;
    } catch (error) {
      console.warn('Phonemizer unavailable, falling back to ASCII normalization:', error);

      const normalized = normalizeTextForPiper(sourceText);
      const words = normalized.split(/\s+/).filter(Boolean);
      const result = [words];

      if (isDebugEnabled(config)) {
        console.log(`[TEXT MODE] Normalized words:`, words);
      }

      return result;
    }
  }

  // Convert phonemes to IDs using the phoneme ID map
  async phonemesToIds(textPhonemes) {
    if (!this.voiceConfig || !this.voiceConfig.phoneme_id_map) {
      throw new Error('Phoneme ID map not available');
    }

    const idMap = this.voiceConfig.phoneme_id_map;
    const BOS = "^";
    const EOS = "$";
    const PAD = "_";

    let phonemeIds = [];

    for (let sentenceIdx = 0; sentenceIdx < textPhonemes.length; sentenceIdx++) {
      const words = textPhonemes[sentenceIdx];

      phonemeIds.push(idMap[BOS]);
      phonemeIds.push(idMap[PAD]);

      for (let w = 0; w < words.length; w++) {
        const word = words[w];

        for (let char of word) {
          const normalizedChar = String(char).toLowerCase();
          if (normalizedChar in idMap) {
            phonemeIds.push(idMap[normalizedChar]);
            phonemeIds.push(idMap[PAD]);
          }
        }

        if (w < words.length - 1 && " " in idMap) {
          phonemeIds.push(idMap[" "]);
          phonemeIds.push(idMap[PAD]);
        }
      }

      phonemeIds.push(idMap[EOS]);
    }

    return phonemeIds;
  }

  async *stream(textStreamer, options = {}) {
    const { speakerId = 0, lengthScale = 1.0, noiseScale = 0.667, noiseWScale = 0.8 } = options;

    const config = await loadConfig();
    let chunkIdx = 0;

    // Process the text stream
    for await (const text of textStreamer) {
      if (text.trim()) {
        try {
          if (this.session && this.voiceConfig) {
            chunkIdx++;

            if (isDebugEnabled(config)) {
              console.log(`[CHUNK ${chunkIdx}] Processing text: ${JSON.stringify(text)}`);
            }

            // Convert text to phonemes then to IDs
            const textPhonemes = await this.textToPhonemes(text);
            const phonemeIds = await this.phonemesToIds(textPhonemes);

            // Prepare tensors for Piper model
            const ort = await import('onnxruntime-web');

            const inputs = {
              'input': new ort.Tensor('int64', new BigInt64Array(phonemeIds.map(id => BigInt(id))), [1, phonemeIds.length]),
              'input_lengths': new ort.Tensor('int64', BigInt64Array.from([BigInt(phonemeIds.length)]), [1]),
              'scales': new ort.Tensor('float32', Float32Array.from([noiseScale, lengthScale, noiseWScale]), [3])
            };

            // Add speaker ID for multi-speaker models
            if (this.voiceConfig.num_speakers > 1) {
              inputs['sid'] = new ort.Tensor('int64', BigInt64Array.from([BigInt(speakerId)]), [1]);
              // console.log('🎤 Added speaker ID tensor:', speakerId);
            } else {
              // console.log('⚠️ Model has only 1 speaker - speaker ID ignored');
            }

            const results = await this.session.run(inputs);

            // Extract audio data
            const audioOutput = results.output;
            const audioData = audioOutput.data;

            // Use the sample rate from config
            const sampleRate = this.voiceConfig.audio.sample_rate;

            // Clean up audio data
            const finalAudioData = new Float32Array(audioData);

            yield {
              text,
              audio: new RawAudio(finalAudioData, sampleRate)
            };
          }
        } catch (error) {
          console.error('Error generating audio:', error);
          // Yield silence in case of error
          yield {
            text,
            audio: new RawAudio(new Float32Array(22050), 22050)
          };
        }
      }
    }
  }

  // Get available speakers for multi-speaker models
  getSpeakers() {
    if (!this.voiceConfig || this.voiceConfig.num_speakers <= 1) {
      return [{ id: 0, name: 'Voice 1' }];
    }

    const speakerIdMap = this.voiceConfig.speaker_id_map || {};
    return Object.entries(speakerIdMap)
      .sort(([, a], [, b]) => a - b) // Sort by speaker ID (0, 1, 2, ...)
      .map(([originalId, id]) => ({
        id,
        name: `Voice ${id + 1}`,
        originalId
      }));
  }
}

