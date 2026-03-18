"use client";
import { useState, useRef, useCallback, useEffect } from "react";

/**
 * React hook for Web Speech API voice input with multilingual support.
 *
 * Usage:
 *   const voice = useVoiceInput({ lang: "es-MX" });
 *   <button onClick={voice.isRecording ? voice.stopRecording : voice.startRecording}>
 *   {voice.transcript}
 *
 * @param {Object} opts
 * @param {string} opts.lang - BCP-47 language code (default "en-US"). Examples: "es-MX", "vi-VN"
 */
export function useVoiceInput({ lang = "en-US" } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef(""); // keep in sync for closure

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) setSupported(false);
  }, []);

  // Keep ref in sync with state
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  const startRecording = useCallback(() => {
    setError("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition not supported. Use Chrome or Safari.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    let finalTranscript = transcriptRef.current;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + t;
          setTranscript(finalTranscript);
        } else {
          interim += t;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      setError(`Mic error: ${event.error}. Check browser permissions.`);
      setIsRecording(false);
      clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      // Auto-restart if still recording (browser stops after ~60s of silence)
      if (recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  }, [lang]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      const r = recognitionRef.current;
      recognitionRef.current = null;
      r.stop();
    }
    setIsRecording(false);
    setInterimText("");
    clearInterval(timerRef.current);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimText("");
    setRecordingTime(0);
  }, []);

  const setManualTranscript = useCallback((text) => {
    setTranscript(text);
  }, []);

  return {
    isRecording,
    transcript,
    interimText,
    recordingTime,
    supported,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    setTranscript: setManualTranscript,
  };
}
