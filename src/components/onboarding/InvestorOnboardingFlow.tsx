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
          setError('Banking requirements not found for selected country. Please select a different country in Step 1.');
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
