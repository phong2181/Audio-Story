/* eslint-disable no-restricted-globals */
import { PiperTTS, TextSplitterStream } from "../lib/piper-tts.js";
import { getModelBaseUrl } from "../config.js";

let tts = null;

// Initialize the model
async function initializeModel(modelName = null, lang = 'vi') {
  try {
    const defaultModel = 'ngochuyen';
    const model = modelName || defaultModel;

    // Construct paths using getModelBaseUrl (same logic as nghitts-main)
    const base = getModelBaseUrl(lang);
    let modelPath = `${base}${model}.onnx`;
    let configPath = `${base}${model}.onnx.json`;

    // Fallback logic: check if the path is accessible
    try {
      const response = await fetch(configPath, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Config not found at ${configPath}`);
      }
    } catch (e) {
      console.warn("Falling back to /tts-model/vi/ for ONNX model:", e);
      modelPath = `/tts-model/vi/${model}.onnx`;
      configPath = `/tts-model/vi/${model}.onnx.json`;
    }

    tts = await PiperTTS.from_pretrained(modelPath, configPath);

    // Get available speakers
    const speakers = tts.getSpeakers();

    self.postMessage({ status: "ready", voices: speakers });
  } catch (e) {
    console.error("Error loading model:", e);
    self.postMessage({ status: "error", data: e.message });
  }
}

// Handle voice preview
async function handlePreview(text, voice, speed) {
  try {
    const streamer = new TextSplitterStream();
    await streamer.push(text);
    streamer.close();

    const speakerId = typeof voice === 'number' ? voice : parseInt(voice) || 0;
    const lengthScale = 1.0 / (speed || 1.0);

    const stream = tts.stream(streamer, {
      speakerId,
      lengthScale
    });

    const chunks = [];
    for await (const { audio } of stream) {
      chunks.push(audio);
    }

    let audioBlob;
    if (chunks.length > 0) {
      const originalSamplingRate = chunks[0].sampling_rate;
      const length = chunks.reduce((sum, chunk) => sum + chunk.audio.length, 0);
      let waveform = new Float32Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        waveform.set(chunk.audio, offset);
        offset += chunk.audio.length;
      }

      normalizePeak(waveform, 1.0);

      // @ts-expect-error - constructor is RawAudio
      const audio = new chunks[0].constructor(waveform, originalSamplingRate);
      audioBlob = audio.toBlob();
    }

    if (audioBlob) {
      self.postMessage({ status: "preview", audio: audioBlob });
    } else {
      self.postMessage({ status: "error", data: "Could not generate preview" });
    }
  } catch (error) {
    console.error('Error generating preview:', error);
    self.postMessage({ status: "error", data: error.message });
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (e) => {
  const { type, text, voice, speed, model, lang } = e.data;

  // Handle initialization
  if (type === 'init') {
    await initializeModel(model, lang || 'vi');
    return;
  }

  // Handle TTS generation
  if (!tts) {
    self.postMessage({ status: "error", data: "Model not initialized" });
    return;
  }

  // Handle voice preview
  if (type === 'preview') {
    await handlePreview(text, voice, speed);
    return;
  }

  const streamer = new TextSplitterStream();

  await streamer.push(text);
  streamer.close();

  // Convert voice from voice ID to speaker ID
  const speakerId = typeof voice === 'number' ? voice : parseInt(voice) || 0;

  // Convert speed to lengthScale (inverse relationship: higher speed = lower lengthScale)
  const lengthScale = (1.0 / (speed || 1.0)) * 1.05;

  const stream = tts.stream(streamer, {
    speakerId,
    lengthScale
  });
  const chunks = [];

  try {
    for await (const { text: chunkText, audio } of stream) {
      self.postMessage({
        status: "stream",
        chunk: {
          audio: audio.toBlob(),
          text: chunkText,
        },
      });
      chunks.push(audio);
    }
  } catch (error) {
    console.error("Error during streaming:", error);
    self.postMessage({ status: "error", data: error.message });
    return;
  }

  // Merge chunks
  let audio;
  if (chunks.length > 0) {
    try {
      const originalSamplingRate = chunks[0].sampling_rate;
      const length = chunks.reduce((sum, chunk) => sum + chunk.audio.length, 0);
      let waveform = new Float32Array(length);
      let offset = 0;
      for (const { audio: a } of chunks) {
        waveform.set(a, offset);
        offset += a.length;
      }

      // Normalize peaks & trim silence
      normalizePeak(waveform, 1.0);
      waveform = trimSilence(waveform, 0.0015, Math.floor(originalSamplingRate * 0.01));

      // @ts-expect-error - constructor is RawAudio
      audio = new chunks[0].constructor(waveform, originalSamplingRate);
    } catch (error) {
      console.error("Error processing audio chunks:", error);
      self.postMessage({ status: "error", data: error.message });
      return;
    }
  }

  self.postMessage({ status: "complete", audio: audio?.toBlob() });
});

function normalizePeak(f32, target = 0.9) {
  if (!f32?.length) return;
  let max = 1e-9;
  for (let i = 0; i < f32.length; i++) max = Math.max(max, Math.abs(f32[i]));
  const g = Math.min(4, target / max);
  if (g < 1) {
    for (let i = 0; i < f32.length; i++) f32[i] *= g;
  }
}

function trimSilence(f32, thresh = 0.002, minSamples = 480) {
  let s = 0;
  let e = f32.length - 1;
  while (s < e && Math.abs(f32[s]) < thresh) s++;
  while (e > s && Math.abs(f32[e]) < thresh) e--;
  s = Math.max(0, s - minSamples);
  e = Math.min(f32.length, e + minSamples);
  return f32.slice(s, e);
}
