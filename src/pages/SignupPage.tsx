import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AuthError } from '@supabase/supabase-js';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setConfirmPassword(e.target.value);
  };

  const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFullName(e.target.value);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user?.identities && data.user.identities.length === 0) {
        // User already exists
        setErrorMessage('An account with this email already exists.');
        setIsLoading(false);
        return;
      }
      
      // Check if email confirmation is required
      if (data.session) {
        // Auto-confirmed, immediately navigate to dashboard
        console.log('Account created with session, redirecting to dashboard');
        navigate('/dashboard');
      } else {
        // Email confirmation required
        console.log('Account created, email confirmation required');
        navigate('/signup-success', { 
          state: { email: email } 
        });
      }
    } catch (error) {
      console.error('Error signing up:', error);
      const authError = error as AuthError;
      setErrorMessage(authError.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      // No need to navigate here as OAuth will redirect automatically
    } catch (error) {
      console.error('Error with Google signup:', error);
      const authError = error as AuthError;
      setErrorMessage(authError.message || 'Failed to sign up with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const navigateToLogin = (): void => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#212327] rounded-2xl p-8 md:p-10"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Join <span className="text-[#00FFFF]">Cognitive Cosmos</span>
        </h1>
        <p className="text-gray-400 mb-8">Create an account to start your thinking journey</p>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-sm">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSignup}>
          <div className="mb-6">
            <label htmlFor="fullName" className="block text-gray-300 mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                id="fullName"
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                placeholder="Your full name"
                value={fullName}
                onChange={handleFullNameChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                id="email"
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                placeholder="your.email@example.com"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                placeholder="Create a password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-[#00FFFF] text-[#1A1A1A] font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'} 
            {!isLoading && <span>→</span>}
          </motion.button>
        </form>
        
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-4 text-gray-400">or continue with</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleSignup}
          className="w-full bg-[#2A2D35] text-white py-3 px-4 rounded-lg flex items-center justify-center gap-3 border border-gray-700 hover:border-gray-500 transition-colors"
          disabled={isLoading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </motion.button>
        
        <p className="mt-8 text-center text-gray-400">
          Already have an account?{' '}
          <button
            onClick={navigateToLogin}
            className="text-[#00FFFF] hover:underline"
            type="button"
          >
            Log In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;