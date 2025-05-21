import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      
      // Initialize username from user metadata or from email
      if (user.user_metadata?.username) {
        setUsername(user.user_metadata.username);
      } else if (user.email) {
        setUsername(user.email.split('@')[0]);
      }
      
      setIsLoading(false);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          username: username.trim()
        }
      });
      
      if (error) throw error;
      
      setMessage({
        text: 'Profile updated successfully!',
        type: 'success'
      });
      
      // Wait a moment before clearing the success message
      setTimeout(() => {
        setMessage(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        text: 'Failed to update profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-[#00FFFF] hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-[#212327] rounded-xl p-6 md:p-8 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            Profile Settings
          </h1>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-900/20 border border-green-700/50 text-green-200' 
                : 'bg-red-900/20 border border-red-700/50 text-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}
          
          <form onSubmit={handleSaveProfile}>
            <div className="space-y-6">
              {/* Username field */}
              <div>
                <label htmlFor="username" className="block text-gray-300 mb-2">Display Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    placeholder="Your display name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-400">This is how you'll appear in the app.</p>
              </div>
              
              {/* Email field (read-only) */}
              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="bg-[#2A2D35] text-white/60 rounded-lg block w-full pl-10 pr-3 py-3 focus:outline-none cursor-not-allowed"
                    value={email}
                    readOnly
                    disabled
                  />
                </div>
                <p className="mt-2 text-sm text-gray-400">Your email cannot be changed.</p>
              </div>
              
              {/* Save button */}
              <div className="pt-4">
                <motion.button
                  type="submit"
                  className="bg-[#00FFFF] text-[#1A1A1A] font-medium py-3 px-6 rounded-lg w-full md:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </form>
          
          {/* Account settings section */}
          <div className="mt-12 pt-8 border-t border-[#333333]">
            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
            
            {/* Subscription information */}
            <div className="bg-[#252525] rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300 font-medium">Current Plan: <span className="text-white">Free</span></p>
                  <p className="text-sm text-gray-400 mt-1">2 queries per day, limited access</p>
                </div>
                <motion.button
                  className="bg-[#8B5CF6] text-white py-2 px-4 rounded-lg hover:bg-[#8B5CF6]/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Upgrade
                </motion.button>
              </div>
            </div>
            
            {/* Delete account button */}
            <div className="mt-8">
              <button className="text-red-400 hover:text-red-300 text-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;