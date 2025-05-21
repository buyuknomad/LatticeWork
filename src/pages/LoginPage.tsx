import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // We'll implement Supabase auth here in the next step
    console.log('Login attempted with:', email, password);
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // We'll implement Google auth here in the next step
    console.log('Google login attempted');
    setIsLoading(false);
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
          Welcome Back to <span className="text-[#00FFFF]">Cognitive Cosmos</span>
        </h1>
        <p className="text-gray-400 mb-8">Sign in to continue your thinking journey</p>
        
        <form onSubmit={handleLogin}>
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-2">
            <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end mb-6">
            <a href="#" className="text-[#00FFFF] text-sm hover:underline">
              Forgot password?
            </a>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-[#4661E6] text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'} 
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
          onClick={handleGoogleLogin}
          className="w-full bg-[#2A2D35] text-white py-3 px-4 rounded-lg flex items-center justify-center gap-3 border border-gray-700 hover:border-gray-500 transition-colors"
          disabled={isLoading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </motion.button>
        
        <p className="mt-8 text-center text-gray-400">
          Don't have an account?{' '}
          <a href="#" className="text-[#00FFFF] hover:underline">
            Sign Up
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;