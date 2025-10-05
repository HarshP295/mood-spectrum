import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export interface MoodDetection {
  mood: string;
  confidence: number;
  suggestions: string[];
  emoji: string;
}

const BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || '/';
const LOCAL_MODEL_URL = BASE_URL.replace(/\/$/, '') + '/models/face';
const FALLBACK_CDN = 'https://justadudewhohacks.github.io/face-api.js/models';

function moodFromExpressions(expr: faceapi.FaceExpressions): { mood: string; confidence: number; emoji: string } {
  const entries = Object.entries(expr) as Array<[keyof faceapi.FaceExpressions, number]>;
  const [top, score] = entries.reduce<[string, number]>((acc, [k, v]) => (v > acc[1] ? [k as string, v] : acc), ['', 0]);
  const map: Record<string, { mood: string; emoji: string }> = {
    happy: { mood: 'Happy', emoji: '😊' },
    neutral: { mood: 'Calm', emoji: '😌' },
    sad: { mood: 'Sad', emoji: '😞' },
    angry: { mood: 'Angry', emoji: '😠' },
    fearful: { mood: 'Anxious', emoji: '😨' },
    disgusted: { mood: 'Disgust', emoji: '🤢' },
    surprised: { mood: 'Surprised', emoji: '😲' },
  };
  const found = map[top] || map['neutral'];
  return { mood: found.mood, confidence: Math.round(score * 100), emoji: found.emoji };
}

export default function useRealMoodDetector() {
  const [ready, setReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detection, setDetection] = useState<MoodDetection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Try local models first
        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(LOCAL_MODEL_URL),
          ]);
        } catch (e) {
          console.warn('[mood] Local models not found, falling back to CDN:', FALLBACK_CDN);
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(FALLBACK_CDN),
            faceapi.nets.faceExpressionNet.loadFromUri(FALLBACK_CDN),
          ]);
        }
        setReady(true);
      } catch (e) {
        console.error('[mood] model load failed', e);
        setError('Failed to load face detection models. Please ensure files exist in /models/face.');
      }
    };
    load();
  }, []);

  const start = async () => {
    if (!ready) return;
    setError(null);
    try {
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('[mood] getUserMedia requires HTTPS in production.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS/Safari compatibility
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        videoRef.current.autoplay = true as any;
        // Wait for metadata or canplay, whichever comes first
        await new Promise<void>((resolve) => {
          const v = videoRef.current!;
          if (v.readyState >= 2) return resolve();
          const done = () => {
            v.removeEventListener('loadedmetadata', done);
            v.removeEventListener('canplay', done);
            resolve();
          };
          v.addEventListener('loadedmetadata', done);
          v.addEventListener('canplay', done);
          // Fallback timeout
          setTimeout(done, 1500);
        });
        try {
          await videoRef.current.play();
        } catch (e: any) {
          console.warn('[mood] video.play() failed, retrying after user gesture', e?.name || e);
        }
      }
      setIsDetecting(true);
      const detect = async () => {
        if (!videoRef.current) return;
        const result = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          )
          .withFaceExpressions();
        if (result && result.expressions) {
          const mapped = moodFromExpressions(result.expressions);
          const suggestions = mapped.mood === 'Happy'
            ? ['Capture this moment in your journal', 'Share a compliment with yourself']
            : mapped.mood === 'Sad'
            ? ['Try a brief walk', 'Write one thing you’re grateful for']
            : mapped.mood === 'Anxious'
            ? ['Deep breathing: 4-7-8 for 1 minute', 'Note your thoughts without judgment']
            : ['Take a mindful pause', 'Write how you feel in one sentence'];
          setDetection({ mood: mapped.mood, confidence: mapped.confidence, emoji: mapped.emoji, suggestions });
        }
      };
      // Throttle detection to ~5fps
      timerRef.current = window.setInterval(detect, 200) as any;
    } catch (e) {
      console.error('[mood] camera start failed', e);
      setError('Unable to access camera. Please grant permission and try again.');
      setIsDetecting(false);
    }
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setIsDetecting(false);
    setCameraActive(false);
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const reset = () => { setDetection(null); setError(null); };

  return { ready, videoRef, detection, cameraActive, isDetecting, error, start, stop, reset };
}


