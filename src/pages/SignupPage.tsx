import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AuthError } from '@supabase/supabase-js';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
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
      console.log('Attempting to sign up user:', email);
      
      // Extract username from email (everything before @)
      const username = email.split('@')[0];
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });
      
      if (error) throw error;
      
      console.log('Signup response:', data);
      
      // Check if the user already exists
      if (data.user?.identities && data.user.identities.length === 0) {
        setErrorMessage('An account with this email already exists.');
        setIsLoading(false);
        return;
      }
      
      // Check if there is a session (auto-confirmation)
      if (data.session) {
        console.log('Account created and auto-confirmed with active session, navigating to dashboard');
        
        // Small timeout to ensure auth state updates
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        // Supabase is likely configured for email confirmation
        console.log('Account created but requires email confirmation');
        navigate('/signup-success', { 
          state: { email },
          replace: true
        });
      }
    } catch (error) {
      console.error('Error during signup:', error);
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
      console.log('Attempting Google signup');
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
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-3">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-[#212327] rounded-xl p-5 sm:p-6"
      >
        <h1 className="text-2xl font-bold text-white mb-1">
          Join <span className="text-[#00FFFF]">Mind Lattice</span>
        </h1>
        <p className="text-gray-400 text-sm mb-4">Create your account</p>
        
        {errorMessage && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-xs">
            {errorMessage}
          </div>
        )}
        
        {/* Google Sign Up Button - Moved to top */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleSignup}
          className="w-full bg-[#2A2D35] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 transition-colors text-sm"
          disabled={isLoading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
          Sign up with Google
        </motion.button>
        
        {/* OR Divider */}
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-2 text-gray-400 text-xs uppercase">or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="email"
                id="email"
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
                placeholder="your.email@example.com"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
                placeholder="Create a password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-300 text-sm mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
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
            className="w-full bg-[#00FFFF] text-[#1A1A1A] font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'} 
            {!isLoading && <span>→</span>}
          </motion.button>
        </form>
        
        <p className="mt-4 text-center text-gray-400 text-xs">
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