import React from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import type { AudioReadProps } from "../interfaces/audioRead";

const AudioRead: React.FC<AudioReadProps> = ({ text, label = 'Ouvir', style }) => {
  const speak = () => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'pt-BR';
      window.speechSynthesis.speak(utter);
    } else {
      alert('Seu navegador não suporta leitura de texto por áudio.');
    }
  };
  if (!(window as any).__audioAccessibilityEnabled) return null;
  return (
    <button onClick={speak} title={label} style={{ marginLeft: 6, ...style }}>
      <FaVolumeUp />
    </button>
  );
};

export default AudioRead;
