import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/firestoreService';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  CreditCard, 
  FileText, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  Eye,
  Download,
  Shield,
  Globe,
  DollarSign
} from 'lucide-react';

// Comprehensive country list
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia',
  'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
  'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
  'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone',
  'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste',
  'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

// Country-specific banking requirements
const bankingRequirements: Record<string, any> = {
  'Argentina': {
    fields: [
      { name: 'cbu', label: 'CBU (Clave Bancaria Uniforme)', type: 'text', required: true, maxLength: 22, pattern: /^\d{22}$/ },
      { name: 'alias', label: 'ALIAS', type: 'text', required: true, maxLength: 20 },
      { name: 'swiftCode', label: 'SWIFT Code', type: 'text', required: true, maxLength: 11 },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true }
    ],
    currency: 'ARS'
  },
  'Mexico': {
    fields: [
      { name: 'clabe', label: 'CUENTA CLABE', type: 'text', required: true, maxLength: 18, pattern: /^\d{18}$/ },
      { name: 'swiftCode', label: 'SWIFT Code', type: 'text', required: true, maxLength: 11 },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountHolder', label: 'Account Holder Name', type: 'text', required: true },
      { name: 'bankBranch', label: 'Bank Branch', type: 'text', required: false }
    ],
    currency: 'MXN'
  },
  'United Arab Emirates': {
    fields: [
      { name: 'iban', label: 'IBAN', type: 'text', required: true, maxLength: 23 },
      { name: 'swiftCode', label: 'SWIFT Code', type: 'text', required: true, maxLength: 11 },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true },
      { name: 'emiratesId', label: 'Emirates ID', type: 'text', required: true },
      { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true }
    ],
    currency: 'AED'
  },
  'France': {
    fields: [
      { name: 'iban', label: 'IBAN', type: 'text', required: true, maxLength: 34 },
      { name: 'bic', label: 'BIC/SWIFT Code', type: 'text', required: true, maxLength: 11 },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true }
    ],
    currency: 'EUR'
  },
  'Switzerland': {
    fields: [
      { name: 'iban', label: 'IBAN', type: 'text', required: true, maxLength: 21 },
      { name: 'bic', label: 'BIC/SWIFT Code', type: 'text', required: true, maxLength: 11 },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true }
    ],
    currency: 'CHF'
  },
  'Saudi Arabia': {
    fields: [
      { name: 'iban', label: 'IBAN', type: 'text', required: true, maxLength: 24 },
      { name: 'swiftCode', label: 'SWIFT Code', type: 'text', required: true, maxLength: 11 },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true },
      { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true }
    ],
    currency: 'SAR'
  }
};

interface InvestorOnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

const InvestorOnboardingFlow = ({ isOpen, onClose, onSuccess }: InvestorOnboardingFlowProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    initialDeposit: '',
    accountType: 'Standard',
    bankDetails: {} as Record<string, string>,
    selectedBank: ''
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      setError('Please upload only PDF, JPG, or PNG files under 10MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      for (const file of validFiles) {
        const mockUrl = `https://firebasestorage.googleapis.com/documents/${Date.now()}_${file.name}`;
        
        const uploadedDoc: UploadedDocument = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: mockUrl,
          uploadedAt: new Date()
        };

        setUploadedDocuments(prev => [...prev, uploadedDoc]);
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      setError('Failed to upload documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const validateStep = () => {
    setError('');
    switch (currentStep) {
      case 1: // Personal Information
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.country.trim() || !formData.city.trim()) {
          setError('All personal information fields are required.');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address.');
          return false;
        }
        break;
      case 2: // Financial Information
        const deposit = parseFloat(formData.initialDeposit);
        if (isNaN(deposit) || deposit < 1000) {
          setError('Initial deposit must be at least $1,000.');
          return false;
        }
        break;
      case 3: // Banking Information
        const countryBankReqs = bankingRequirements[formData.country];
        if (!countryBankReqs) {
          setError('Banking requirements not found for selected country. Please select a different country.');
          return false;
        }
        if (!formData.selectedBank) {
          setError('Please select your bank.');
          return false;
        }
        for (const field of countryBankReqs.fields) {
          if (field.required && !formData.bankDetails[field.name]?.trim()) {
            setError(`Bank ${field.label} is required.`);
            return false;
          }
          if (field.pattern && !new RegExp(field.pattern).test(formData.bankDetails[field.name])) {
            setError(`Invalid format for ${field.label}.`);
            return false;
          }
        }
        break;
      case 4: // Document Upload
        if (uploadedDocuments.length === 0) {
          setError('At least one verification document is required.');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    setError('');

    try {
      const investorId = `investor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const investorData = {
        id: investorId,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        location: formData.city,
        role: 'investor',
        joinDate: new Date().toISOString().split('T')[0],
        initialDeposit: parseFloat(formData.initialDeposit),
        currentBalance: parseFloat(formData.initialDeposit),
        accountType: formData.accountType,
        isActive: false, // Set to false, requires Governor approval
        accountStatus: 'Pending Governor Approval',
        uploadedDocuments: uploadedDocuments,
        bankDetails: {
          bankName: formData.selectedBank,
          ...formData.bankDetails,
          currency: bankingRequirements[formData.country]?.currency || 'USD'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create account creation request for Governor review
      await FirestoreService.addDoc('accountCreationRequests', {
        applicantName: investorData.name,
        applicantEmail: investorData.email,
        applicantPhone: investorData.phone,
        applicantCountry: investorData.country,
        requestedBy: user?.name || 'Admin',
        requestedAt: new Date(),
        status: 'pending',
        initialDeposit: investorData.initialDeposit,
        accountType: investorData.accountType,
        applicationData: investorData // Store full investor data for review
      });

      setIsSuccess(true);
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting onboarding:', err);
      setError('Failed to submit onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '', email: '', phone: '', country: '', city: '',
      initialDeposit: '', accountType: 'Standard', bankDetails: {}, selectedBank: ''
    });
    setUploadedDocuments([]);
    setCurrentStep(1);
    setError('');
    setIsSuccess(false);
    onClose();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText size={16} className="text-red-600" />;
    } else if (fileType.includes('image')) {
      return <FileText size={16} className="text-blue-600" />;
    }
    return <FileText size={16} className="text-gray-600" />;
  };

  const currentCountryBankingReqs = bankingRequirements[formData.country];

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="ONBOARDING COMPLETE">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
            INVESTOR APPLICATION SUBMITTED
          </h3>
          <p className="text-gray-700 mb-6 font-medium uppercase tracking-wide">
            {formData.fullName}'s application has been submitted for Governor review.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-800 text-sm font-medium uppercase tracking-wide">
              <strong>Next Steps:</strong> The Governor will review the application and documents. 
              You will be notified once the application is approved or rejected.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="mt-6 px-6 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors rounded-lg uppercase tracking-wide"
          >
            CLOSE
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="INVESTOR ONBOARDING FLOW" size="lg">
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex justify-between mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                currentStep > index ? 'bg-gray-900' : 'bg-gray-300'
              }`}>
                {index + 1}
              </div>
              <span className="text-xs mt-2 text-gray-600">Step {index + 1}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span className="font-medium uppercase tracking-wide">{error}</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">PERSONAL INFORMATION</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="">Select Country</option>
                    {countries.map(country => <option key={country} value={country}>{country}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">FINANCIAL INFORMATION</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Deposit (USD)</label>
                  <input type="number" name="initialDeposit" value={formData.initialDeposit} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1000" required />
                  <p className="text-xs text-gray-500 mt-1">Minimum initial deposit: $1,000</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <select name="accountType" value={formData.accountType} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="Standard">Standard</option>
                    <option value="Pro">Pro</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">BANKING INFORMATION</h3>
                {!currentCountryBankingReqs ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={16} />
                      <span>Banking requirements not found for {formData.country}. Please select a different country in Step 1.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <select name="selectedBank" value={formData.selectedBank} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                        <option value="">Select your bank</option>
                        {bankingRequirements[formData.country]?.fields.map((field: any) => (
                          field.name === 'bankName' && (
                            // Assuming bankName is a field in the bankingRequirements for selection
                            // This part needs to be dynamically populated based on actual banks in the country
                            // For now, it's a placeholder or needs a predefined list per country
                            <option key={field.name} value={field.name}>{field.label}</option>
                          )
                        ))}
                        {/* Placeholder for actual bank list */}
                        <option value="Example Bank">Example Bank (for {formData.country})</option>
                      </select>
                    </div>
                    {currentCountryBankingReqs.fields.map((field: any) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{field.label} {field.required && '*'}</label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData.bankDetails[field.name] || ''}
                          onChange={handleBankInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          maxLength={field.maxLength}
                          pattern={field.pattern}
                          required={field.required}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">VERIFICATION DOCUMENTS</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Identity Document (Passport/ID)</label>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isUploading} />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG (Max 10MB per file)</p>
                </div>
                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">Uploaded Documents:</h4>
                    {uploadedDocuments.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(doc.type)}
                          <span>{doc.name}</span>
                        </div>
                        <button type="button" onClick={() => removeDocument(doc.id)} className="text-red-500 hover:text-red-700">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {isUploading && <p className="text-sm text-gray-600">Uploading...</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
          )}
          {currentStep < totalSteps ? (
            <Button variant="primary" onClick={handleNext} disabled={isLoading}>
              Next <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} disabled={isLoading || isUploading}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InvestorOnboardingFlow;
</boltAction>
<boltAction type="file" filePath="src/components/governor/AccountCreationRequests.tsx" contentType="content">
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { FirestoreService } from '../../services/firestoreService';
import { GovernorService } from '../../services/governorService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  FileText, 
  Eye, 
  Download, 
  Shield,
  Clock
} from 'lucide-react';

interface AccountCreationRequestsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountCreationRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantCountry: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  initialDeposit: number;
  accountType: 'Standard' | 'Pro';
  applicationData: any; // Full investor data from onboarding
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  approvalConditions?: string[];
}

const AccountCreationRequests = ({ isOpen, onClose }: AccountCreationRequestsProps) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccountCreationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccountCreationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalConditions, setApprovalConditions] = useState('');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const fetchedRequests = await FirestoreService.getAccountCreationRequests();
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching account creation requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !user) return;

    setProcessingRequest(selectedRequest.id);
    try {
      await GovernorService.approveAccountCreation(
        selectedRequest.id,
        user.id,
        user.name,
        approvalConditions.split(',').map(cond => cond.trim()).filter(cond => cond)
      );
      setSelectedRequest(null);
      setApprovalConditions('');
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user || !rejectionReason.trim()) return;

    setProcessingRequest(selectedRequest.id);
    try {
      await FirestoreService.updateAccountCreationRequest(selectedRequest.id, {
        status: 'rejected',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason
      });
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText size={16} className="text-red-600" />;
    } else if (fileType.includes('image')) {
      return <FileText size={16} className="text-blue-600" />;
    }
    return <FileText size={16} className="text-gray-600" />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ACCOUNT CREATION REQUESTS" size="xl">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold uppercase tracking-wide">LOADING REQUESTS...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.filter(req => req.status === 'pending').length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">NO PENDING REQUESTS</h3>
              <p className="text-gray-500 uppercase tracking-wide text-sm">All account creation requests have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.filter(req => req.status === 'pending').map(request => (
                <div key={request.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 uppercase tracking-wide">{request.applicantName}</h4>
                      <p className="text-sm text-gray-600 uppercase tracking-wide">
                        {request.applicantCountry} | {request.accountType} Account
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Requested: {request.requestedAt.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Initial Deposit: ${request.initialDeposit.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        onClick={() => setSelectedRequest(request)}
                        disabled={processingRequest === request.id}
                      >
                        <Eye size={16} className="mr-2" /> Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedRequest && (
            <Modal
              isOpen={!!selectedRequest}
              onClose={() => setSelectedRequest(null)}
              title={`REVIEW APPLICATION: ${selectedRequest.applicantName}`}
              size="xl"
            >
              <div className="space-y-6">
                {/* Applicant Information */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-4 uppercase tracking-wide flex items-center">
                    <User size={16} className="mr-2" />
                    APPLICANT INFORMATION
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">FULL NAME</label>
                      <p className="text-gray-900 font-medium">{selectedRequest.applicantName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">EMAIL</label>
                      <p className="text-gray-900 font-medium">{selectedRequest.applicantEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">PHONE</label>
                      <p className="text-gray-900 font-medium">{selectedRequest.applicantPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">COUNTRY</label>
                      <p className="text-gray-900 font-medium">{selectedRequest.applicantCountry}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">INITIAL DEPOSIT</label>
                      <p className="text-gray-900 font-medium">${selectedRequest.initialDeposit.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">ACCOUNT TYPE</label>
                      <p className="text-gray-900 font-medium">{selectedRequest.accountType}</p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                {selectedRequest.applicationData?.uploadedDocuments && selectedRequest.applicationData.uploadedDocuments.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-4 uppercase tracking-wide flex items-center">
                      <FileText size={16} className="mr-2" />
                      UPLOADED DOCUMENTS ({selectedRequest.applicationData.uploadedDocuments.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedRequest.applicationData.uploadedDocuments.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between bg-white p-4 rounded border border-gray-300">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(doc.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB • 
                                Uploaded: {new Date(doc.uploadedAt.seconds * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(doc.url, '_blank')}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center space-x-1 uppercase tracking-wide"
                            >
                              <Eye size={12} />
                              <span>VIEW</span>
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.url;
                                link.download = doc.name;
                                link.click();
                              }}
                              className="px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors flex items-center space-x-1 uppercase tracking-wide"
                            >
                              <Download size={12} />
                              <span>DOWNLOAD</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approval Conditions (comma-separated)</label>
                  <textarea
                    value={approvalConditions}
                    onChange={(e) => setApprovalConditions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="e.g., KYC verification, additional document submission"
                  />
                  <p className="text-xs text-gray-500 mt-1">These conditions will be applied to the investor's account upon approval.</p>
                </div>

                {/* Rejection Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Provide a reason if rejecting the application"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    isLoading={processingRequest === selectedRequest.id}
                    disabled={processingRequest === selectedRequest.id || !rejectionReason.trim()}
                    className="flex-1"
                  >
                    <XCircle size={16} className="mr-2" /> Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleApprove}
                    isLoading={processingRequest === selectedRequest.id}
                    disabled={processingRequest === selectedRequest.id}
                    className="flex-1"
                  >
                    <CheckCircle size={16} className="mr-2" /> Approve
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AccountCreationRequests;
