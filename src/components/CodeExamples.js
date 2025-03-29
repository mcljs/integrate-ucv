/**
 * Componente para mostrar ejemplos de código R con estilo y resaltado adecuado
 */
import React from 'react';
import { Code } from 'lucide-react';
import { RCodeBlock } from '@/utils/r-syntax-highlighter';

export function CodeExample({ example, index }) {
  if (!example) return null;
  
  return (
    <div key={index} className="my-6">
      <h3 className="font-medium text-gray-700 mb-2 flex items-center">
        <Code className="h-4 w-4 mr-2 text-[#F5A623]" />
        {example.title}
      </h3>
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <RCodeBlock code={example.code} />
      </div>
      <p className="mt-2 text-gray-600 text-sm">{example.explanation}</p>
    </div>
  );
}

export function CodeSolution({ code, isVisible }) {
  if (!code || !isVisible) return null;
  
  return (
    <div className="h-full">
      <RCodeBlock code={code} />
    </div>
  );
}