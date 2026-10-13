/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API definitions for browsers that support it
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseVoiceAssistantOptions {
  lang?: string;
  continuous?: boolean;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const { lang = "es-US", continuous = false, onTranscript, onError } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [waveBars, setWaveBars] = useState<number[]>([15, 30, 20, 45, 25, 35, 18]);

  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  const isMutedRef = useRef(isMuted);
  const animFrameRef = useRef<number | null>(null);

  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;
  isMutedRef.current = isMuted;

  // Check support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as IWindowWithSpeech;
      const hasSpeech = Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
      setIsSupported(hasSpeech);
    }
  }, []);

  // Audio wave visualization simulation when listening or speaking
  useEffect(() => {
    if (!isListening && !isSpeaking) {
      setWaveBars([10, 10, 10, 10, 10, 10, 10]);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let t = 0;
    const updateWaves = () => {
      t += 0.15;
      const newBars = [
        Math.max(12, Math.sin(t) * 45 + 50),
        Math.max(15, Math.cos(t * 1.3) * 60 + 55),
        Math.max(10, Math.sin(t * 0.9) * 50 + 45),
        Math.max(20, Math.cos(t * 1.7) * 75 + 65),
        Math.max(15, Math.sin(t * 1.2) * 55 + 50),
        Math.max(12, Math.cos(t * 0.8) * 40 + 45),
        Math.max(10, Math.sin(t * 1.5) * 35 + 40),
      ];
      setWaveBars(newBars);
      animFrameRef.current = requestAnimationFrame(updateWaves);
    };

    animFrameRef.current = requestAnimationFrame(updateWaves);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening, isSpeaking]);

  // Clean up recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(
    (onDirectResult?: (finalText: string) => void) => {
      if (typeof window === "undefined") return;

      const win = window as IWindowWithSpeech;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        const msg =
          "Tu navegador no soporta reconocimiento de voz nativo (Web Speech API). Puedes usar el teclado para escribir comandos.";
        setError(msg);
        onErrorRef.current?.(msg);
        return;
      }

      setError(null);

      // Stop previous instance if running
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      // Stop any ongoing speech output while listening
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      try {
        const recognition = new SpeechRecognitionClass();
        recognitionRef.current = recognition;

        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const item = event.results[i];
            const transcriptText = item?.[0]?.transcript ?? "";
            if (item?.isFinal) {
              final += transcriptText;
            } else {
              interim += transcriptText;
            }
          }

          if (interim) {
            setInterimTranscript(interim);
            onTranscriptRef.current?.(interim, false);
          }

          if (final) {
            const trimmed = final.trim();
            setTranscript(trimmed);
            setInterimTranscript("");
            onTranscriptRef.current?.(trimmed, true);
            if (onDirectResult) {
              onDirectResult(trimmed);
            }
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          let userMsg = "Error en el reconocimiento de voz.";
          if (event.error === "not-allowed") {
            userMsg =
              "Permiso de micrófono denegado. Habilítalo en tu navegador para usar comandos de voz.";
          } else if (event.error === "no-speech") {
            userMsg = "No se detectó voz. Vuelve a pulsar el micrófono cuando estés listo.";
          } else if (event.error === "network") {
            userMsg = "Problema de conexión con el servicio de reconocimiento de voz.";
          }
          setError(userMsg);
          setIsListening(false);
          onErrorRef.current?.(userMsg);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
        };

        recognition.start();
      } catch (err) {
        const msg = (err as Error)?.message || "No se pudo iniciar el micrófono.";
        setError(msg);
        setIsListening(false);
        onErrorRef.current?.(msg);
      }
    },
    [continuous, lang],
  );

  const toggleListening = useCallback(
    (onDirectResult?: (finalText: string) => void) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(onDirectResult);
      }
    },
    [isListening, startListening, stopListening],
  );

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((textToSpeak: string, speakLang = "es-ES") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isMutedRef.current || !textToSpeak.trim()) return;

    // Cancel previous utterance
    window.speechSynthesis.cancel();

    // Clean markdown tags or bullets so the speech sounds conversational and pleasant
    const cleanText = textToSpeak
      .replace(/[*_#`[\]()]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\n+/g, ". ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = speakLang;
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    // Select Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice =
      voices.find((v) => v.lang.startsWith("es-") || v.lang === "es") ||
      voices.find((v) => v.lang.includes("es"));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  return {
    isSupported,
    isListening,
    isSpeaking,
    isMuted,
    transcript,
    interimTranscript,
    error,
    waveBars,
    startListening,
    stopListening,
    toggleListening,
    speak,
    cancelSpeech,
    toggleMute,
    setTranscript,
  };
}
