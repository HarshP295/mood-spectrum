import { Link } from 'react-router-dom';
import { Heart, Brain, Users, Music, Camera, BookOpen } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const Home = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Daily Journaling',
      description: 'Express your thoughts and track your emotional journey with guided prompts.',
      link: '/journal'
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get personalized tips and suggestions based on your mood patterns.',
      link: '/dashboard'
    },
    {
      icon: Users,
      title: 'Peer Support',
      description: 'Connect anonymously with others who understand your experiences.',
      link: '/chat'
    },
    {
      icon: Music,
      title: 'Mood Playlists',
      description: 'Discover music that matches and improves your current emotional state.',
      link: '/playlist'
    },
    {
      icon: Camera,
      title: 'Mood Detection',
      description: 'Advanced AI technology to understand your emotions through facial analysis.',
      link: '/mood-detector'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-therapeutic">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="therapeutic-pulse inline-block p-4 bg-white/20 rounded-full mb-8">
              <Heart className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Mental Health Journey
              <br />
              <span className="bg-gradient-to-r from-yellow to-peach bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Track your emotions, discover insights, and build healthier habits with our 
              comprehensive mental wellness platform designed just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/journal">
                <Button variant="therapeutic" size="lg" className="w-full sm:w-auto">
                  Start Tracking Today
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/20 border-white text-white hover:bg-white hover:text-primary">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to support your mental health journey with science-backed approaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, link }, index) => (
              <Link key={title} to={link}>
                <Card 
                  variant="therapeutic" 
                  className="p-8 h-full group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white/20 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
                    <p className="text-white/80 leading-relaxed">{description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Begin Your Wellness Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join thousands of others who have transformed their mental health with MindFlow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/journal">
              <Button variant="therapeutic" size="lg">
                Start Your First Entry
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;