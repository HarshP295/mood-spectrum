import { useEffect, useRef, useState } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

export interface MoodDetection {
  mood: string;
  confidence: number;
  suggestions: string[];
  emoji: string;
}

function inferMoodFromBlendshapes(blendshapes: Array<{ categoryName: string; score: number }>): { mood: string; confidence: number; emoji: string } {
  const score = (name: string) => blendshapes.find(c => c.categoryName === name)?.score || 0;
  // Basic heuristics using ARKit-like blendshapes
  const joy = (score('mouthSmileLeft') + score('mouthSmileRight')) / 2;
  const sad = (score('mouthFrownLeft') + score('mouthFrownRight')) / 2;
  const surprise = (score('jawOpen') + score('mouthFunnel') + score('browInnerUp')) / 3;
  const anger = (score('browDownLeft') + score('browDownRight') + score('mouthPressLeft') + score('mouthPressRight')) / 4;

  const candidates = [
    { key: 'Happy', val: joy, emoji: '😊' },
    { key: 'Sad', val: sad, emoji: '😞' },
    { key: 'Surprised', val: surprise, emoji: '😲' },
    { key: 'Angry', val: anger, emoji: '😠' },
  ];
  const top = candidates.reduce((a, b) => (b.val > a.val ? b : a), { key: 'Calm', val: 0.0, emoji: '😌' } as any);
  const confidence = Math.round(Math.min(1, Math.max(0.3, top.val)) * 100);
  if (top.val < 0.15) return { mood: 'Calm', confidence: 60, emoji: '😌' };
  return { mood: top.key, confidence, emoji: top.emoji };
}

export default function useMediapipeMoodDetector() {
  const [ready, setReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detection, setDetection] = useState<MoodDetection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const lastDetectAtRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recordedRowsRef = useRef<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        setStatus('loading models');
        const fileset = await FilesetResolver.forVisionTasks(
          // CDN hosts models & WASM
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          minFaceDetectionConfidence: 0.3,
          minFacePresenceConfidence: 0.3,
          minTrackingConfidence: 0.3,
        });
        landmarkerRef.current = landmarker;
        setReady(true);
        setStatus('ready');
      } catch (e) {
        console.error('[mediapipe] init failed', e);
        setError('Failed to initialize MediaPipe.');
        setStatus('error');
      }
    };
    init();
  }, []);

  const start = async () => {
    setError(null);
    try {
      setStatus('requesting camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        // Wait for metadata/canplay to ensure dimensions are available
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
          setTimeout(done, 1500);
        });
        try {
          await videoRef.current.play();
          setIsPlaying(true);
        } catch (e) {
          console.warn('[mediapipe] video.play() failed, waiting for user gesture');
          setIsPlaying(false);
        }
      }
      setIsDetecting(true);
      setStatus('detecting');
      const loop = () => {
        if (!videoRef.current || !landmarkerRef.current) return;
        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;
        if (!vw || !vh) {
          // video not ready yet; try again next frame
          animRef.current = requestAnimationFrame(loop);
          return;
        }
        const ts = performance.now();
        const result = landmarkerRef.current.detectForVideo(videoRef.current, ts);
        const landmarks = result.faceLandmarks as any[];
        const blend = (result.faceBlendshapes?.[0]?.categories || []) as Array<{ categoryName: string; score: number }>;
        if (landmarks && landmarks.length > 0) {
          lastDetectAtRef.current = ts;
          const mapped = inferMoodFromBlendshapes(blend);
          const suggestions = mapped.mood === 'Happy'
            ? ['Capture this moment in your journal']
            : ['Take a mindful pause'];
          setDetection({ mood: mapped.mood, confidence: mapped.confidence, emoji: mapped.emoji, suggestions });
          if (isRecording) {
            const vector = blend.map((c) => c.score.toFixed(4));
            if (recordedRowsRef.current.length === 0) {
              recordedRowsRef.current.push(['timestamp', ...blend.map((c) => c.categoryName), 'label'].join(','));
            }
            recordedRowsRef.current.push([Math.round(ts).toString(), ...vector, mapped.mood].join(','));
          }
        } else {
          // No face detected this frame
          const idleMs = ts - (lastDetectAtRef.current || ts);
          if (idleMs > 1500) {
            setDetection(null);
            setStatus('no face detected');
          }
        }
        animRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      console.error('[mediapipe] camera error', e);
      setError('Unable to access camera.');
      setIsDetecting(false);
      setStatus('error');
    }
  };

  const stop = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setIsDetecting(false);
    setCameraActive(false);
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const reset = () => { setDetection(null); setError(null); setStatus('ready'); };

  const resumePlayback = async () => {
    if (!videoRef.current) return;
    try {
      // Re-attach stream just in case the element lost it
      if (!videoRef.current.srcObject && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn('[mediapipe] resumePlayback failed', e);
      setIsPlaying(false);
      setError('Autoplay blocked. Please click the button again or disable Shields for this site.');
    }
  };

  const startRecording = () => { recordedRowsRef.current = []; setIsRecording(true); };
  const stopAndExportRecording = () => {
    setIsRecording(false);
    const csv = recordedRowsRef.current.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blendshapes_dataset.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return { ready, videoRef, detection, cameraActive, isDetecting, error, start, stop, reset, status, isPlaying, resumePlayback, isRecording, startRecording, stopAndExportRecording };
}


