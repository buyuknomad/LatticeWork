// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  User, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Crown,
  CreditCard,
  Calendar,
  XCircle,
  ExternalLink,
  Loader,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BRAND } from '../constants/brand';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { products } from '../stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

const Settings: React.FC = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Subscription states
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [userTier, setUserTier] = useState<string>(user?.user_metadata?.tier || 'free');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      
      // Initialize username from user metadata or from email
      if (user.user_metadata?.username) {
        setUsername(user.user_metadata.username);
      } else if (user.email) {
        setUsername(user.email.split('@')[0]);
      }
      
      // Set user tier
      setUserTier(user.user_metadata?.tier || 'free');
      
      // Check email verification status
      checkEmailStatus();
      
      // Fetch subscription data if premium
      if (user.user_metadata?.tier === 'premium') {
        fetchSubscriptionData();
      }
      
      setIsLoading(false);
    }
  }, [user]);

  // Handle upgrade success redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('upgrade') === 'success') {
      setMessage({
        text: '🎉 Welcome to Premium! Your subscription is now active.',
        type: 'success'
      });
      
      // Clean up the URL
      window.history.replaceState({}, '', '/settings');
      
      // Update user tier to premium
      setUserTier('premium');
      
      // Refresh subscription data
      fetchSubscriptionData();
      
      // Refresh user data to get updated tier
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          // Update the user tier if it's in the metadata
          if (user.user_metadata?.tier === 'premium') {
            setUserTier('premium');
          }
        }
      });
      
      // Also refresh the session to ensure auth context is updated
      supabase.auth.refreshSession();
    }
  }, [location.search]);

  // Initialize cooldown from localStorage
  React.useEffect(() => {
    if (user?.email) {
      const savedCooldownEnd = localStorage.getItem(`resend_cooldown_${user.email}`);
      if (savedCooldownEnd) {
        const endTime = parseInt(savedCooldownEnd);
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
        setResendCooldown(remainingSeconds);
      }
    }
  }, [user?.email]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (user?.email) {
      // Clear localStorage when cooldown ends
      localStorage.removeItem(`resend_cooldown_${user.email}`);
    }
  }, [resendCooldown, user?.email]);

  const checkEmailStatus = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      setEmailVerified(!!currentUser.email_confirmed_at);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email || resendCooldown > 0) return;

    setIsResendingVerification(true);
    setResendMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        }
      });

      if (error) {
        // Handle Supabase rate limit error
        if (error.message.includes('rate limit') || error.message.includes('60')) {
          setResendMessage('Please wait 60 seconds between resend attempts.');
          // Try to sync with Supabase's cooldown
          const cooldownSeconds = 60;
          setResendCooldown(cooldownSeconds);
          localStorage.setItem(
            `resend_cooldown_${user.email}`, 
            (Date.now() + cooldownSeconds * 1000).toString()
          );
        } else {
          throw error;
        }
        return;
      }

      setResendMessage('Verification email sent! Check your inbox.');
      
      // Set cooldown and save to localStorage
      const cooldownSeconds = 60;
      setResendCooldown(cooldownSeconds);
      localStorage.setItem(
        `resend_cooldown_${user.email}`, 
        (Date.now() + cooldownSeconds * 1000).toString()
      );
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setResendMessage(null);
      }, 5000);

    } catch (error: any) {
      console.error('Error resending verification:', error);
      setResendMessage('Failed to send email. Please try again later.');
    } finally {
      setIsResendingVerification(false);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .single();
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

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

  const handleUpgradeClick = async () => {
    setCheckoutError(null);
    
    if (!session) {
      navigate('/login');
      return;
    }

    setIsLoadingCheckout(true);

    try {
      // Get the premium product from config
      const premiumProduct = products[0]; // Using first product as premium
      
      if (!premiumProduct || !premiumProduct.priceId) {
        throw new Error('Premium product not configured');
      }

      // Call the Stripe checkout edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: premiumProduct.priceId,
          mode: premiumProduct.mode,
          success_url: `${window.location.origin}/settings?upgrade=success`,
          cancel_url: `${window.location.origin}/settings`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'Failed to start checkout. Please try again.');
      setIsLoadingCheckout(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;
    
    setIsLoadingPortal(true);
    
    try {
      // Call edge function to create Stripe portal session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          return_url: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
      
    } catch (error) {
      console.error('Error opening customer portal:', error);
      setMessage({
        text: 'Failed to open subscription management. Please try again.',
        type: 'error'
      });
      setIsLoadingPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }
    
    setIsCanceling(true);
    
    try {
      // In a real implementation, you would call an edge function to cancel via Stripe API
      // For now, we'll redirect to the customer portal
      await handleManageSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setMessage({
        text: 'Failed to cancel subscription. Please try again.',
        type: 'error'
      });
      setIsCanceling(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionStatusBadge = () => {
    if (!subscription) return null;
    
    if (subscription.cancel_at_period_end) {
      return (
        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
          Canceling at period end
        </span>
      );
    }
    
    switch (subscription.subscription_status) {
      case 'active':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
            Active
          </span>
        );
      case 'trialing':
        return (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium">
            Trial
          </span>
        );
      case 'past_due':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
            Past Due
          </span>
        );
      default:
        return null;
    }
  };

  // Check if user has active subscription
  const hasActiveSubscription = subscription && 
    (subscription.subscription_status === 'active' || 
     subscription.subscription_status === 'trialing') &&
    !subscription.cancel_at_period_end;

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
              
              {/* Email field with verification status */}
              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2">
                  Email Address
                  {emailVerified ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-400">
                      <AlertCircle className="h-3 w-3" />
                      Unverified
                    </span>
                  )}
                </label>
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
                
                {/* Resend verification section */}
                {!emailVerified && (
                  <div className="mt-3">
                    {resendMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-sm mb-2 ${
                          resendMessage.includes('sent') ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {resendMessage}
                      </motion.p>
                    )}
                    
                    <motion.button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification || resendCooldown > 0}
                      className="text-sm text-[#00FFFF] hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                    >
                      {isResendingVerification ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Sending...
                        </>
                      ) : resendCooldown > 0 ? (
                        <>
                          <Mail className="h-3 w-3" />
                          Resend in {resendCooldown}s
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3" />
                          Resend verification email
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
                
                <p className="mt-2 text-sm text-gray-400">
                  {emailVerified 
                    ? "Your email is verified and secure." 
                    : "Please verify your email to secure your account."}
                </p>
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
          
          {/* Subscription section */}
          <div className="mt-12 pt-8 border-t border-[#333333]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Crown className="h-5 w-5 text-[#8B5CF6]" />
              Subscription
            </h2>
            
            {userTier === 'free' ? (
              /* Free Tier Display */
              <div className="bg-[#252525] rounded-lg p-6 border border-[#333333]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-300 font-medium text-lg">Free Plan</p>
                    <p className="text-sm text-gray-400 mt-1">1 analysis per day • Limited features</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
                </div>
                
                <div className="pt-4 border-t border-[#333333]/50">
                  <motion.button
                    onClick={handleUpgradeClick}
                    disabled={isLoadingCheckout}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isLoadingCheckout ? { scale: 1.02 } : {}}
                    whileTap={!isLoadingCheckout ? { scale: 0.98 } : {}}
                  >
                    {isLoadingCheckout ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Starting checkout...
                      </>
                    ) : (
                      <>
                        <Crown className="h-5 w-5" />
                        Upgrade to Premium
                      </>
                    )}
                  </motion.button>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Get unlimited analyses, advanced features, and more
                  </p>
                </div>
                
                {checkoutError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400">{checkoutError}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Premium Tier Display */
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#252525] to-[#2A2A2A] rounded-lg p-6 border border-[#8B5CF6]/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-medium text-lg flex items-center gap-2">
                        Premium Plan
                        {getSubscriptionStatusBadge()}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        ${BRAND.pricing.premium.price}/month • Unlimited everything
                      </p>
                    </div>
                    <Crown className="h-8 w-8 text-[#8B5CF6]" />
                  </div>
                  
                  {subscription && (
                    <div className="space-y-3 pt-4 border-t border-[#333333]/50">
                      {/* Payment Method */}
                      {subscription.payment_method_brand && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Method
                          </span>
                          <span className="text-gray-300 capitalize">
                            {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                          </span>
                        </div>
                      )}
                      
                      {/* Next Billing Date */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {subscription.cancel_at_period_end ? 'Access Until' : 'Next Billing Date'}
                        </span>
                        <span className="text-gray-300">
                          {formatDate(subscription.current_period_end)}
                        </span>
                      </div>
                      
                      {/* Cancellation Notice */}
                      {subscription.cancel_at_period_end && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-500 text-sm flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            Your subscription will end on {formatDate(subscription.current_period_end)}. 
                            You'll retain Premium access until then.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <motion.button
                      onClick={handleManageSubscription}
                      className="flex-1 bg-[#333333] text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#404040] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoadingPortal}
                    >
                      {isLoadingPortal ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Manage Subscription
                        </>
                      )}
                    </motion.button>
                    
                    {subscription && !subscription.cancel_at_period_end && (
                      <motion.button
                        onClick={handleCancelSubscription}
                        className="flex-1 text-red-400 hover:text-red-300 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 border border-red-400/30 hover:border-red-400/50 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isCanceling}
                      >
                        {isCanceling ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Cancel Subscription
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Manage billing, update payment method, or download invoices
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Account Management Section */}
          <div className="mt-12 pt-8 border-t border-[#333333]">
            <h2 className="text-xl font-semibold mb-6">Account Management</h2>
            
            <div className="space-y-4">
              {/* Export Data */}
              <div className="flex items-center justify-between p-4 bg-[#252525] rounded-lg">
                <div>
                  <p className="text-gray-300 font-medium">Export Your Data</p>
                  <p className="text-sm text-gray-500">Download all your queries and analyses</p>
                </div>
                <button className="text-[#00FFFF] hover:text-[#00FFFF]/80 text-sm font-medium">
                  Coming Soon
                </button>
              </div>
              
              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 bg-[#252525] rounded-lg border border-[#333333] hover:border-red-500/30 transition-colors">
                <div>
                  <p className="text-gray-300 font-medium">Delete Account</p>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <motion.button 
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-red-500/10 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        hasActiveSubscription={!!hasActiveSubscription}
      />
    </div>
  );
};

export default Settings;