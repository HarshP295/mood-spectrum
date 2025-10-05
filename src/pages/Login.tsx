import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, state: authState, clearError } = useAuth();
  const { addNotification } = useApp();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    clearError();
    
    try {
      if (mode === 'register') {
        await register(formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      
      addNotification({
        type: 'success',
        title: mode === 'register' ? 'Account created!' : 'Welcome back!',
        message: mode === 'register' ? 'Your account has been created.' : 'You have been successfully logged in.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary rounded-full mb-4 therapeutic-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{mode === 'register' ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-muted-foreground">{mode === 'register' ? 'Sign up to start your wellness journey' : 'Sign in to continue your wellness journey'}</p>
        </div>

        {/* Login Form */}
        <Card variant="default" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-therapeutic w-full pl-10 ${
                    errors.email ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-therapeutic w-full pl-10 pr-10 ${
                    errors.password ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive animate-fade-in">{errors.password}</p>
              )}
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`input-therapeutic w-full pl-10 pr-10 ${
                      errors.confirmPassword ? 'border-destructive focus:border-destructive' : ''
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive animate-fade-in">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="sr-only" />
                <div className="w-4 h-4 border-2 border-border rounded bg-card mr-2"></div>
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link to="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="therapeutic"
              size="lg"
              className="w-full"
              disabled={authState.loading}
            >
              {authState.loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {mode === 'register' ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                (mode === 'register' ? 'Create Account' : 'Sign In')
              )}
            </Button>
          </form>

          {authState.error && (
            <div className="mt-4">
              <p className="text-sm text-destructive animate-fade-in text-center">
                {authState.error}
              </p>
            </div>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            {mode === 'register' ? (
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrors({}); }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrors({}); }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create one here
                </button>
              </p>
            )}
          </div>
        </Card>

        {/* Info Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            {mode === 'register' ? 'Create your account to get started.' : 'Enter your credentials to sign in.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;