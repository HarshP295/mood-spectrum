import { Camera, Play, Square, RefreshCw, Zap } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
// Using fake mood detector for random emotion detection
import useFakeMoodDetector from '../hooks/useFakeMoodDetector';
import { useAuth } from '@/contexts/AuthContext';

const MoodDetector = () => {
  const { state } = useAuth();
  const { ready, videoRef, detection, isDetecting, cameraActive, error, start, stop, reset, status, isPlaying, resumePlayback, isRecording, startRecording, stopAndExportRecording, detectEmotion } = useFakeMoodDetector();

  const saveToJournal = async () => {
    if (!detection) return;
    const token = localStorage.getItem('mindflow_token');
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({
        title: `Mood snapshot: ${detection.mood}`,
        content: `Detected mood: ${detection.mood} (${detection.confidence}% confidence).`,
        mood: detection.mood,
      }),
    });
    if (!res.ok) {
      console.warn('Failed to save journal entry');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-primary rounded-full mb-4 therapeutic-pulse">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">AI Mood Detection</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Use advanced facial recognition technology to understand your current emotional state and get personalized recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <Card variant="default" className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Live Camera Feed</h3>
              <p className="text-muted-foreground text-sm">
                Your privacy is protected - all processing happens locally
              </p>
            </div>

            {/* Live Camera View */}
            <div className="relative bg-gradient-to-br from-muted to-secondary rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
              {!cameraActive ? (
                /* Camera Off State */
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Camera is off</p>
                    <p className="text-sm text-muted-foreground mt-2">Click "Start Detection" to begin</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover bg-black" 
                    muted 
                    playsInline 
                    autoPlay
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
                      <button 
                        onClick={resumePlayback} 
                        className="px-4 py-3 text-sm rounded-lg bg-white/30 text-white backdrop-blur hover:bg-white/40 transition-colors cursor-pointer"
                      >
                        Tap to start video
                      </button>
                    </div>
                  )}
                  {isDetecting && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none z-10">
                      <div className="text-center text-white">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-medium">Analyzing facial expressions...</p>
                        <p className="text-xs opacity-80 mt-1">{status}</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <p className="font-semibold">{error}</p>
                        <p className="text-xs opacity-80 mt-1">Ensure camera permission and face models are present.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex space-x-3">
              {!cameraActive ? (
                <Button
                  onClick={start}
                  variant="therapeutic"
                  size="lg"
                  className="flex-1"
                  disabled={!ready || isDetecting}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button
                    onClick={detectEmotion}
                    variant="therapeutic"
                    size="lg"
                    className="flex-1"
                    disabled={isDetecting}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    {isDetecting ? 'Detecting...' : 'Detect Emotion'}
                  </Button>
                  <Button
                    onClick={stop}
                    variant="secondary"
                    size="lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Camera
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {detection ? (
              /* Detection Results */
              <>
                <Card variant="gradient" className="p-6 text-center">
                  <div className="text-6xl mb-4">{detection.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    You look {detection.mood.toLowerCase()} today!
                  </h3>
                  <div className="flex items-center justify-center space-x-2 text-white/80">
                    <Zap className="w-4 h-4" />
                    <span>{detection.confidence}% confidence</span>
                  </div>
                </Card>

                <Card variant="default" className="p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4">Personalized Suggestions</h4>
                  <div className="space-y-3">
                    {detection.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-medium">{index + 1}</span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                  {state.isAuthenticated && (
                    <div className="mt-4">
                      <Button variant="therapeutic" onClick={saveToJournal}>Save mood to Journal</Button>
                    </div>
                  )}
                </Card>
              </>
            ) : (
              /* No Results State */
              <Card variant="default" className="p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground mb-6">
                  Start the camera to detect your current mood and receive personalized wellness recommendations.
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>100% private - no data is stored</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>AI-powered facial expression analysis</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow rounded-full"></div>
                    <span>Instant personalized recommendations</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Privacy Notice */}
            <Card variant="therapeutic" className="p-6">
              <h4 className="text-lg font-semibold text-white mb-2">Privacy</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Processing runs locally in your browser. No camera frames are uploaded.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDetector;