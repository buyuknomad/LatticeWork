// src/components/DeleteAccountModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasActiveSubscription: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ 
  isOpen, 
  onClose, 
  hasActiveSubscription 
}) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE' || !user || !session) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Step 1: Cancel Stripe subscription if active
      if (hasActiveSubscription) {
        console.log('Canceling active subscription before account deletion...');
        
        // Call edge function to cancel subscription immediately
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ immediate: true })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to cancel subscription');
        }
      }

      // Step 2: Delete user data from your tables
      // This should be done via an edge function for proper cascading deletes
      const deleteResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Step 3: Sign out the user
      await supabase.auth.signOut();

      // Step 4: Navigate to a goodbye page or home with success message
      navigate('/', { 
        state: { 
          message: 'Your account has been successfully deleted. We\'re sorry to see you go.' 
        } 
      });

    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError(error.message || 'Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setConfirmText('');
    setError(null);
    setStep('warning');
  };

  const handleClose = () => {
    if (!isDeleting) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#212327] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#333333]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {step === 'warning' ? 'Delete Account?' : 'Confirm Deletion'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="p-1.5 -mr-1.5 text-gray-400 hover:text-white hover:bg-[#333333] rounded-lg transition-all disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {step === 'warning' ? (
              /* Warning Step */
              <div>
                <div className="space-y-4 mb-6">
                  <p className="text-gray-300 text-sm sm:text-base">
                    This action <span className="text-red-400 font-semibold">cannot be undone</span>. 
                    Deleting your account will:
                  </p>
                  
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>Permanently delete all your queries and analysis history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>Remove all your personal information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>Cancel any active subscriptions immediately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>Revoke access to Mind Lattice permanently</span>
                    </li>
                  </ul>

                  {hasActiveSubscription && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-amber-500">
                          You have an active Premium subscription. It will be canceled immediately 
                          without any refund for the remaining period.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Confirmation Step */
              <div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-red-400">{error}</p>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <p className="text-gray-300 text-sm sm:text-base">
                    To confirm account deletion, please type <span className="font-mono font-bold text-red-400">DELETE</span> below:
                  </p>
                  
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="Type DELETE to confirm"
                    className="w-full bg-[#2A2D35] text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    disabled={isDeleting}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                  
                  <p className="text-xs sm:text-sm text-gray-500">
                    Account email: <span className="text-gray-400 break-all">{user?.email}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="p-5 sm:p-6 border-t border-[#333333] bg-[#212327]">
            {step === 'warning' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={() => setStep('confirm')}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors min-h-[44px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue with Deletion
                </motion.button>
                <motion.button
                  onClick={handleClose}
                  className="flex-1 bg-[#333333] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#404040] transition-colors min-h-[44px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleDelete}
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] order-2 sm:order-1"
                  whileHover={confirmText === 'DELETE' && !isDeleting ? { scale: 1.02 } : {}}
                  whileTap={confirmText === 'DELETE' && !isDeleting ? { scale: 0.98 } : {}}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete My Account'
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setStep('warning')}
                  disabled={isDeleting}
                  className="flex-1 bg-[#333333] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#404040] transition-colors disabled:opacity-50 min-h-[44px] order-1 sm:order-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Go Back
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteAccountModal;