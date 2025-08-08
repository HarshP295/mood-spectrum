import { Camera, Play, Square, RefreshCw, Zap } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import useFakeMoodDetector from '../hooks/useFakeMoodDetector';

const MoodDetector = () => {
  const { 
    detection, 
    isDetecting, 
    cameraActive, 
    startDetection, 
    stopCamera, 
    resetDetection 
  } = useFakeMoodDetector();

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

            {/* Mock Camera View */}
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
                /* Camera Active State */
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20">
                  <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                    {/* Face Detection Frame */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-32 h-40 border-2 border-primary rounded-lg animate-pulse">
                        <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recording Indicator */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Recording</span>
                  </div>

                  {/* Processing Overlay */}
                  {isDetecting && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-medium">Analyzing facial expressions...</p>
                        <p className="text-sm opacity-80 mt-1">Please stay still</p>
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
                  onClick={startDetection}
                  variant="therapeutic"
                  size="lg"
                  className="flex-1"
                  disabled={isDetecting}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Detection
                </Button>
              ) : (
                <>
                  <Button
                    onClick={stopCamera}
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Camera
                  </Button>
                  {detection && (
                    <Button
                      onClick={resetDetection}
                      variant="outline"
                      size="lg"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </Button>
                  )}
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

            {/* Demo Notice */}
            <Card variant="therapeutic" className="p-6">
              <h4 className="text-lg font-semibold text-white mb-2">Demo Mode</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                This is a simulated mood detection system. In a real implementation, this would use computer vision 
                and machine learning to analyze facial expressions and micro-expressions for accurate mood detection.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDetector;