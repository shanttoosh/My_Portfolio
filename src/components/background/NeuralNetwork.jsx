import React from 'react';
import { useNeuralNetwork } from '../../hooks/useNeuralNetwork';

export default function NeuralNetwork({ isThinking = false }) {
  const { canvasRef } = useNeuralNetwork(isThinking);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
