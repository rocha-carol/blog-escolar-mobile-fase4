import React from 'react';
import { FaPause, FaPlay, FaVolumeUp } from 'react-icons/fa';
import type { AudioReadProps } from "../interfaces/audioRead";
import {
  isSpeechSupported,
  pauseSpeech,
  resumeSpeech,
  speakText,
  stopSpeech,
  subscribeSpeechState,
  type SpeechState,
} from '../utils/speechController';

const AudioRead: React.FC<AudioReadProps> = ({ text, label = 'Ouvir', style }) => {
  const [speechState, setSpeechState] = React.useState<SpeechState>('idle');
  const [audioEnabled, setAudioEnabled] = React.useState<boolean>(() => Boolean((window as any).__audioAccessibilityEnabled));

  React.useEffect(() => {
    return subscribeSpeechState(setSpeechState);
  }, []);

  React.useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ enabled?: boolean }>;
      setAudioEnabled(Boolean(e.detail?.enabled));
    };
    window.addEventListener('accessibility:audio', handler);
    return () => window.removeEventListener('accessibility:audio', handler);
  }, []);

  const onClick = () => {
    if (!isSpeechSupported()) {
      alert('Seu navegador não suporta leitura de texto por áudio.');
      return;
    }

    if (speechState === 'speaking') {
      pauseSpeech();
      return;
    }
    if (speechState === 'paused') {
      resumeSpeech();
      return;
    }

    speakText(text, 'pt-BR');
  };

  const onDoubleClick = () => {
    // Atalho para parar totalmente sem adicionar mais botões na tela.
    stopSpeech();
  };

  const title =
    speechState === 'speaking'
      ? 'Pausar leitura'
      : speechState === 'paused'
        ? 'Retomar leitura'
        : `${label} (duplo clique para parar)`;

  const Icon =
    speechState === 'speaking' ? FaPause : speechState === 'paused' ? FaPlay : FaVolumeUp;

  if (!audioEnabled) return null;
  return (
    <button onClick={onClick} onDoubleClick={onDoubleClick} title={title} style={{ marginLeft: 6, ...style }}>
      <Icon />
    </button>
  );
};

export default AudioRead;
