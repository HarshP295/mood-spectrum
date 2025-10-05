import { useState, useEffect, useRef } from 'react';

export interface MoodDetection {
  mood: string;
  confidence: number;
  suggestions: string[];
  emoji: string;
}

const useFakeMoodDetector = () => {
  const [ready, setReady] = useState(false);
  const [detection, setDetection] = useState<MoodDetection | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('ready');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedRowsRef = useRef<string[]>([]);
  const detectionCountRef = useRef<number>(0);

  const possibleDetections: MoodDetection[] = [
    {
      mood: 'Happy',
      confidence: Math.floor(Math.random() * 10) + 10, // 70-100
      suggestions: ['Capture this moment in your journal', 'Share a compliment with yourself'],
      emoji: '😊'
    },
    {
      mood: 'Sad',
      confidence: Math.floor(Math.random() * 10) + 10,
      suggestions: ['Try a brief walk', 'Write one thing you\'re grateful for'],
      emoji: '😞'
    },
    {
      mood: 'Angry',
      confidence: Math.floor(Math.random() * 10) + 10,
      suggestions: ['Take deep breaths', 'Try some gentle stretching'],
      emoji: '😠'
    },
    {
      mood: 'Surprised',
      confidence: Math.floor(Math.random() * 10) + 10,
      suggestions: ['Take a moment to process', 'Write down what surprised you'],
      emoji: '😲'
    },
    {
      mood: 'Neutral',
      confidence: Math.floor(Math.random() * 10) + 10,
      suggestions: ['Take a mindful pause', 'Write how you feel in one sentence'],
      emoji: '😌'
    }
  ];

  // Initialize the fake detector (always ready)
  useEffect(() => {
    setReady(true);
    
    // Cleanup function
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Effect to ensure video gets stream when camera becomes active
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      console.log('Setting video srcObject from effect...');
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const start = async () => {
    setError(null);
    try {
      setStatus('requesting camera');
      console.log('Starting camera...');
      
      // Get camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;
      setCameraActive(true);
      setIsDetecting(false);
      
      // Wait a bit for the video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Setting video srcObject...');
          videoRef.current.srcObject = stream;
          
          // Set up event listeners
          const video = videoRef.current;
          
          const handleLoadedMetadata = () => {
            console.log('Video metadata loaded, attempting to play...');
            video.play().then(() => {
              console.log('Video autoplay successful');
              setIsPlaying(true);
              setStatus('ready');
            }).catch((e) => {
              console.log('Video autoplay failed, user interaction required:', e);
              setStatus('ready');
              // Don't set error, just wait for user interaction
            });
          };
          
          const handlePlay = () => {
            console.log('Video play event fired');
            setIsPlaying(true);
          };
          
          const handlePause = () => {
            console.log('Video pause event fired');
            setIsPlaying(false);
          };
          
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('play', handlePlay);
          video.addEventListener('pause', handlePause);
          
          // Also try to play immediately if metadata is already loaded
          if (video.readyState >= 1) {
            handleLoadedMetadata();
          }
        } else {
          console.error('Video ref is null after timeout');
        }
      }, 100);
      
    } catch (e) {
      console.error('[fake mood] camera error', e);
      setError('Unable to access camera. Please grant permission and try again.');
      setIsDetecting(false);
    }
  };

  const detectEmotion = () => {
    if (!cameraActive) return;
    
    setIsDetecting(true);
    setStatus('detecting');
    
    // Simulate processing time
    setTimeout(() => {
      let selectedDetection: MoodDetection;
      
      // First detection: Happy
      if (detectionCountRef.current === 0) {
        selectedDetection = {
          mood: 'Happy',
          confidence: Math.floor(Math.random() * 30) + 10, // 10-40%
          suggestions: ['Capture this moment in your journal', 'Share a compliment with yourself'],
          emoji: '😊'
        };
      }
      // Second detection: Neutral
      else if (detectionCountRef.current === 1) {
        selectedDetection = {
          mood: 'Neutral',
          confidence: Math.floor(Math.random() * 30) + 10, // 10-40%
          suggestions: ['Take a mindful pause', 'Write how you feel in one sentence'],
          emoji: '😌'
        };
      }
      // After that: Random
      else {
        const randomIndex = Math.floor(Math.random() * possibleDetections.length);
        selectedDetection = possibleDetections[randomIndex];
      }
      
      setDetection(selectedDetection);
      setIsDetecting(false);
      setStatus('ready');
      detectionCountRef.current++;
      
      // Record data if recording is active
      if (isRecording) {
        const timestamp = Date.now();
        if (recordedRowsRef.current.length === 0) {
          recordedRowsRef.current.push('timestamp,emotion,confidence');
        }
        recordedRowsRef.current.push(`${timestamp},${selectedDetection.mood},${selectedDetection.confidence}`);
      }
    }, 1500); // 1.5 second processing simulation
  };

  const stop = () => {
    setIsDetecting(false);
    setCameraActive(false);
    setDetection(null);
    detectionCountRef.current = 0; // Reset detection count
    
    if (videoRef.current) {
      try { 
        videoRef.current.pause(); 
        videoRef.current.srcObject = null;
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsPlaying(false);
  };

  const reset = () => { 
    setDetection(null); 
    setError(null); 
  };

  const resumePlayback = () => {
    console.log('Resume playback called');
    console.log('Video ref:', videoRef.current);
    console.log('Stream ref:', streamRef.current);
    console.log('Camera active:', cameraActive);
    
    if (!videoRef.current) {
      console.error('Video ref is null');
      return;
    }
    
    if (!streamRef.current) {
      console.error('Stream ref is null');
      return;
    }
    
    // Ensure the video has the stream
    if (!videoRef.current.srcObject) {
      console.log('Setting srcObject from stream ref...');
      videoRef.current.srcObject = streamRef.current;
    }
    
    console.log('Video srcObject:', videoRef.current.srcObject);
    console.log('Video readyState:', videoRef.current.readyState);
    
    videoRef.current.play().then(() => {
      console.log('Video playback started successfully');
      setIsPlaying(true);
    }).catch((e) => {
      console.error('Resume playback error:', e);
      // Try again after a short delay
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            console.log('Retry playback successful');
            setIsPlaying(true);
          }).catch((retryError) => {
            console.error('Retry playback failed:', retryError);
          });
        }
      }, 100);
    });
  };

  const startRecording = () => {
    setIsRecording(true);
    recordedRowsRef.current = [];
  };

  const stopAndExportRecording = () => {
    setIsRecording(false);
    if (recordedRowsRef.current.length > 0) {
      const csv = recordedRowsRef.current.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mood-data-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return {
    ready,
    videoRef,
    detection,
    cameraActive,
    isDetecting,
    error,
    status,
    isPlaying,
    resumePlayback,
    isRecording,
    startRecording,
    stopAndExportRecording,
    start,
    stop,
    reset,
    detectEmotion
  };
};

export default useFakeMoodDetector;