export type SpeechState = 'idle' | 'speaking' | 'paused';

type Listener = (state: SpeechState) => void;

let state: SpeechState = 'idle';
let currentText: string | null = null;
const listeners = new Set<Listener>();

const emit = () => {
  for (const l of listeners) l(state);
};

const setState = (next: SpeechState) => {
  state = next;
  emit();
};

export const getSpeechState = () => state;
export const getCurrentSpeechText = () => currentText;

export const subscribeSpeechState = (listener: Listener) => {
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
};

export const isSpeechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export const speakText = (text: string, lang: string = 'pt-BR') => {
  if (!isSpeechSupported()) return false;

  // Evita fila infinita de falas
  window.speechSynthesis.cancel();

  currentText = text;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = lang;

  utter.onstart = () => {
    setState('speaking');
  };
  utter.onend = () => {
    currentText = null;
    setState('idle');
  };
  utter.onerror = () => {
    currentText = null;
    setState('idle');
  };

  // Alguns navegadores só disparam onstart após speak; então setamos speaking aqui também
  setState('speaking');
  window.speechSynthesis.speak(utter);
  return true;
};

export const pauseSpeech = () => {
  if (!isSpeechSupported()) return;
  // Só pausa quando estiver falando
  if (state !== 'speaking') return;
  window.speechSynthesis.pause();
  setState('paused');
};

export const resumeSpeech = () => {
  if (!isSpeechSupported()) return;
  if (state !== 'paused') return;
  window.speechSynthesis.resume();
  setState('speaking');
};

export const stopSpeech = () => {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  currentText = null;
  setState('idle');
};

// Segurança extra: se a aba perder o foco, para o áudio.
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && state !== 'idle') {
      stopSpeech();
    }
  });
}
