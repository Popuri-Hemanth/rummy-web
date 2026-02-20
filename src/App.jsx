import React from 'react';
import { BASE_URL } from './config';

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Rummy – 13 & 21 Card</h1>
        <p className="mt-2 text-gray-400">Web client. Backend: {BASE_URL}</p>
      </div>
    </div>
  );
}
