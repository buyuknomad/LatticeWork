// src/components/dashboard/LearnMoreModal.tsx
import { Dialog, Transition } from '@headlessui/react';

interface LearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: RecommendedTool | null;
}

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({ isOpen, onClose, tool }) => {
  if (!tool) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-[#212327] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-bold text-white mb-4">
                  {tool.name}
                </Dialog.Title>
                
                {/* Modal content */}
                <div className="space-y-4">
                  <Badge className={tool.type === 'mental_model' ? 'bg-[#00FFFF]/10 text-[#00FFFF]' : 'bg-amber-500/10 text-amber-400'}>
                    {tool.category} - {tool.type === 'mental_model' ? 'Mental Model' : 'Cognitive Bias'}
                  </Badge>
                  
                  <p className="text-gray-300">{tool.summary}</p>
                  
                  {tool.explanation && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">How it applies:</h4>
                      <p className="text-gray-300">{tool.explanation}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={() => {/* Copy to clipboard */}}>
                    Copy Summary
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};