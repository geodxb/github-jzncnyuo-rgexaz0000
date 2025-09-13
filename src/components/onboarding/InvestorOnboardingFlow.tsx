import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { CheckCircle } from 'lucide-react';

interface InvestorOnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const InvestorOnboardingFlow = ({ isOpen, onClose, onSuccess }: InvestorOnboardingFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="INVESTOR ONBOARDING"
      size="lg"
    >
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-gray-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
          ONBOARDING FLOW PLACEHOLDER
        </h3>
        <p className="text-gray-700 mb-6 font-medium uppercase tracking-wide">
          This is a placeholder for the investor onboarding flow.
        </p>
        <Button
          variant="primary"
          onClick={handleComplete}
          isLoading={isLoading}
        >
          Complete Onboarding
        </Button>
      </div>
    </Modal>
  );
};

export default InvestorOnboardingFlow;