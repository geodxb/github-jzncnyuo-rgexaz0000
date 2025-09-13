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
      { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true },
      { name: 'bankBranch', label: 'Bank Branch', type: 'text', required: false }
    ],
    currency: 'MXN'
  },
  'United Arab Emirates': {
    fields: [
      { name: 'iban', label: 'IBAN', type: 'text', required: true, maxLength: 23, pattern: /^AE\d{21}$/ },
      { name: 'swiftCode', label: 'SWIFT Code', type: 'text', required: true, maxLength: 11 },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true },
      { name: 'emiratesId', label: 'Emirates ID', type: 'text', required: true }
    ],
    currency: 'AED'
  },
  // Default for other countries
  'default': {
    fields: [
      { name: 'accountNumber', label: 'Account Number', type: 'text', required: true },
      { name: 'swiftCode', label: 'SWIFT Code', type: 'text', required: true, maxLength: 11 },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', required: true },
      { name: 'iban', label: 'IBAN (if applicable)', type: 'text', required: false },
      { name: 'routingNumber', label: 'Routing Number (if applicable)', type: 'text', required: false }
    ],
    currency: 'USD'
  }
};

interface OnboardingData {
  personalDetails: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
  };
  bankDetails: Record<string, string>;
  identityVerification: {
    documentType: 'id_card' | 'passport';
    documentFile: File | null;
    documentBase64: string;
  };
  proofOfDeposit: {
    files: File[];
    filesBase64: string[];
  };
  agreementAccepted: boolean;
}

interface InvestorOnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const InvestorOnboardingFlow = ({ isOpen, onClose, onSuccess }: InvestorOnboardingFlowProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalDetails: {
      fullName: '',
      email: '',
      phone: '',
      country: ''
    },
    bankDetails: {},
    identityVerification: {
      documentType: 'id_card',
      documentFile: null,
      documentBase64: ''
    },
    proofOfDeposit: {
      files: [],
      filesBase64: []
    },
    agreementAccepted: false
  });

  // ADCB Bank Details (from admin profile)
  const adcbBankDetails = {
    accountHolderName: 'Cristian Rolando Dorao',
    bankName: 'ADCB (Abu Dhabi Commercial Bank)',
    bankAddress: 'Al Reem Island, Abu Dhabi, United Arab Emirates',
    accountNumber: '13*********0001',
    iban: 'AE68003001*********0001',
    swiftCode: 'ADCBAEAAXXX',
    routingCode: 'ADCB033001',
    branchCode: '001',
    currency: 'AED',
    additionalInstructions: 'Reference: Interactive Brokers Investment - [Investor Name]'
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload for identity verification
  const handleIdentityUpload = async (file: File) => {
    try {
      const base64 = await convertToBase64(file);
      setOnboardingData(prev => ({
        ...prev,
        identityVerification: {
          ...prev.identityVerification,
          documentFile: file,
          documentBase64: base64
        }
      }));
    } catch (error) {
      console.error('Error converting file to base64:', error);
      setError('Failed to process document. Please try again.');
    }
  };

  // Handle file upload for proof of deposit
  const handleProofOfDepositUpload = async (files: FileList) => {
    try {
      const fileArray = Array.from(files);
      const base64Array: string[] = [];
      
      for (const file of fileArray) {
        const base64 = await convertToBase64(file);
        base64Array.push(base64);
      }
      
      setOnboardingData(prev => ({
        ...prev,
        proofOfDeposit: {
          files: fileArray,
          filesBase64: base64Array
        }
      }));
    } catch (error) {
      console.error('Error converting files to base64:', error);
      setError('Failed to process documents. Please try again.');
    }
  };

  // Scroll detection for agreement
  const handleAgreementScroll = () => {
    if (agreementRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = agreementRef.current;
      const scrolledToEnd = scrollTop + clientHeight >= scrollHeight - 10;
      setHasScrolledToEnd(scrolledToEnd);
    }
  };

  // Get banking fields for selected country
  const getBankingFields = () => {
    const country = onboardingData.personalDetails.country;
    return bankingRequirements[country] || bankingRequirements['default'];
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const { fullName, email, phone, country } = onboardingData.personalDetails;
        return !!(fullName.trim() && email.trim() && phone.trim() && country);
      case 2:
        const bankingFields = getBankingFields();
        return bankingFields.fields.every((field: any) => 
          !field.required || onboardingData.bankDetails[field.name]?.trim()
        );
      case 3:
        return !!(onboardingData.identityVerification.documentFile && onboardingData.identityVerification.documentBase64);
      case 4:
        return onboardingData.proofOfDeposit.files.length > 0;
      case 5:
        return hasScrolledToEnd && onboardingData.agreementAccepted;
      default:
        return false;
    }
  };

  // Submit application
  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      // Create account creation request for governor review
      const applicationData = {
        applicantName: onboardingData.personalDetails.fullName,
        applicantEmail: onboardingData.personalDetails.email,
        applicantPhone: onboardingData.personalDetails.phone,
        applicantCountry: onboardingData.personalDetails.country,
        bankDetails: onboardingData.bankDetails,
        identityDocument: {
          type: onboardingData.identityVerification.documentType,
          base64: onboardingData.identityVerification.documentBase64,
          fileName: onboardingData.identityVerification.documentFile?.name
        },
        proofOfDeposit: {
          files: onboardingData.proofOfDeposit.filesBase64.map((base64, index) => ({
            base64,
            fileName: onboardingData.proofOfDeposit.files[index]?.name
          }))
        },
        requestedBy: user.id,
        requestedByName: user.name,
        requestedAt: new Date(),
        status: 'pending',
        initialDeposit: 1000, // Default minimum
        accountType: 'Standard',
        submittedAt: new Date()
      };

      // Store in Firebase
      await FirestoreService.addDoc('accountCreationRequests', applicationData);

      setCurrentStep(6);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate agreement document
  const generateAgreement = () => {
    const { fullName, email, phone, country } = onboardingData.personalDetails;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
INVESTMENT AND OPERATION AGREEMENT

This Investment and Operation Agreement ("Agreement") is entered into on ${currentDate} by and between:

TRADER: Cristian Rolando Dorao, residing at Le Park II, Villa No. 9, Jumeirah Village Circle, Dubai, hereinafter referred to as the "Trader".

INVESTOR DATA:
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Country: ${country}
Registration Date: ${currentDate}

CONSIDERATIONS

The Trader operates a portfolio using the capital provided by the Investor to trade in the Forex and cryptocurrency markets.
The Trader uses InteractiveBrokers, a highly regulated trading platform, to execute trades.
The Investor agrees to provide the funds and comply with the terms and conditions set forth in this document.
By virtue of the following clauses and mutual agreements, the parties agree as follows:

1. DEFINITIONS

1.1 Minimum Investment: USD 1,000 or its equivalent in local currency.
1.2 Trading Instruments:
• Forex: Gold/USD (XAUUSD) and major currency pairs.
• Cryptocurrencies: Bitcoin (BTC), Ethereum (ETH), and other major cryptocurrencies.
1.3 Trading Strategy: The Trader employs fundamental analysis, trend analysis, and liquidity swaps to identify trading opportunities.

2. INVESTMENT PERIOD

2.1 Cryptocurrency Trading: Operated for 30 calendar days.
2.2 Forex Trading: Operated for 20 business days.
2.3 The Investor may request withdrawals in accordance with Section 5.

3. OBLIGATIONS OF THE INVESTOR

3.1 The Investor must provide valid documentation and undergo thorough verification to comply with anti-fraud and anti-money laundering regulations.
3.2 The Investor agrees to transfer a minimum of USD 1,000 to the Trader's account for trading purposes.
3.3 The Trader guarantees that the initial investment amount will remain safe during the term of the contract.

4. TRADER'S COMPENSATION

4.1 The Trader is entitled to 15% of the net profits generated through trading, as regulated by InteractiveBrokers.
4.2 No additional fees or charges shall be applied to the Investor by the Trader.

5. WITHDRAWALS

5.1 Monthly Withdrawals: The Investor may withdraw profits monthly while maintaining the minimum deposit of USD 1,000.
5.2 Full Balance Withdrawal: The Investor must follow the account closure process, which may take up to 60 calendar days.
5.3 Withdrawals must be made to a bank account matching the name and address provided at registration.

6. TERM AND TERMINATION

6.1 This Agreement has no fixed term and shall remain in effect until terminated by mutual agreement.

7. REGULATORY COMPLIANCE

7.1 This Agreement is governed by the laws of the UAE.
7.2 Both parties agree to comply with applicable laws, including anti-money laundering and fraud regulations.

8. REPRESENTATIONS AND WARRANTIES

8.1 Investor's Representations:
• The Investor possesses the necessary funds and understands the risks associated with trading.
• The Investor acknowledges that profits are not guaranteed.

8.2 Trader's Representations:
• The Trader will execute trades professionally and diligently.
• The Trader will not request compensation beyond the agreed profit percentage.

9. INDEMNIFICATION AND LIABILITY

9.1 The Trader shall not be liable for losses arising from market fluctuations or unforeseen economic events.
9.2 The Investor agrees to indemnify the Trader against any claim arising from the Investor's breach of this Agreement.

10. DISPUTE RESOLUTION

10.1 Any dispute arising from this Agreement shall be resolved amicably.
10.2 If unresolved, the dispute shall be submitted to arbitration under UAE law.

11. EXECUTION AND VALIDATION

11.1 This Agreement enters into force once signed by both parties and validated by InteractiveBrokers.

SIGNATURES

Trader:
Name: Cristian Rolando Dorao
Signature: ______________________
Date: ${currentDate}

Investor:
Name: ${fullName}
Signature: ______________________
Date: ${currentDate}
    `;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Personal Information
              </h2>
              <p className="text-gray-600 uppercase tracking-wide text-sm">
                Please provide your personal details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  <User size={16} className="inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={onboardingData.personalDetails.fullName}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, fullName: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 font-medium"
                  placeholder="Enter your full legal name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  <Mail size={16} className="inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={onboardingData.personalDetails.email}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, email: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 font-medium"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  <Phone size={16} className="inline mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={onboardingData.personalDetails.phone}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, phone: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 font-medium"
                  placeholder="Enter your phone number with country code"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  <Globe size={16} className="inline mr-1" />
                  Country of Residence *
                </label>
                <select
                  value={onboardingData.personalDetails.country}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, country: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 font-medium"
                  required
                >
                  <option value="">Select your country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        const bankingFields = getBankingFields();
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Bank Account Details
              </h2>
              <p className="text-gray-600 uppercase tracking-wide text-sm">
                Banking information for {onboardingData.personalDetails.country}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Building size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 uppercase tracking-wide">Banking Requirements</h4>
                  <p className="text-blue-700 text-sm mt-1 uppercase tracking-wide">
                    Please provide your banking details for withdrawal processing. 
                    All information must match your official bank records.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {bankingFields.fields.map((field: any) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    <CreditCard size={16} className="inline mr-1" />
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={onboardingData.bankDetails[field.name] || ''}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      bankDetails: { ...prev.bankDetails, [field.name]: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 font-medium"
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    maxLength={field.maxLength}
                    required={field.required}
                  />
                  {field.pattern && (
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                      Format: {field.maxLength} digits
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2 uppercase tracking-wide">Currency Information</h4>
              <p className="text-gray-700 text-sm uppercase tracking-wide">
                Withdrawals will be processed in {bankingFields.currency}. 
                Exchange rates will be applied at the time of transfer.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Identity Verification
              </h2>
              <p className="text-gray-600 uppercase tracking-wide text-sm">
                Upload your identification document
              </p>
            </div>

            <div className="space-y-6">
              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                  Document Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setOnboardingData(prev => ({
                      ...prev,
                      identityVerification: { ...prev.identityVerification, documentType: 'id_card' }
                    }))}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      onboardingData.identityVerification.documentType === 'id_card'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <FileText size={24} className="mx-auto mb-2 text-gray-600" />
                      <p className="font-medium text-gray-900 uppercase tracking-wide">ID Card</p>
                      <p className="text-sm text-gray-600 uppercase tracking-wide">National ID or Driver's License</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnboardingData(prev => ({
                      ...prev,
                      identityVerification: { ...prev.identityVerification, documentType: 'passport' }
                    }))}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      onboardingData.identityVerification.documentType === 'passport'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <FileText size={24} className="mx-auto mb-2 text-gray-600" />
                      <p className="font-medium text-gray-900 uppercase tracking-wide">Passport</p>
                      <p className="text-sm text-gray-600 uppercase tracking-wide">International Passport</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Upload {onboardingData.identityVerification.documentType === 'id_card' ? 'ID Card' : 'Passport'} *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleIdentityUpload(file);
                      }
                    }}
                    className="hidden"
                    id="identity-upload"
                  />
                  <label htmlFor="identity-upload" className="cursor-pointer">
                    <Upload size={32} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 font-medium uppercase tracking-wide">
                      Click to upload your {onboardingData.identityVerification.documentType === 'id_card' ? 'ID card' : 'passport'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide">
                      Supported formats: JPG, PNG, PDF (Max 10MB)
                    </p>
                  </label>
                </div>

                {/* Preview uploaded document */}
                {onboardingData.identityVerification.documentBase64 && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle size={20} className="text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900 uppercase tracking-wide">Document Uploaded</p>
                        <p className="text-sm text-gray-600 uppercase tracking-wide">
                          {onboardingData.identityVerification.documentFile?.name}
                        </p>
                      </div>
                    </div>
                    {onboardingData.identityVerification.documentBase64.startsWith('data:image/') && (
                      <div className="mt-3">
                        <img 
                          src={onboardingData.identityVerification.documentBase64}
                          
                          alt="Identity Document Preview"
                          className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield size={20} className="text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 uppercase tracking-wide">Security Notice</h4>
                    <p className="text-yellow-700 text-sm mt-1 uppercase tracking-wide">
                      Your document will be securely transmitted to our verification team. 
                      All personal information is encrypted and protected according to international standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Proof of Deposit
              </h2>
              <p className="text-gray-600 uppercase tracking-wide text-sm">
                Bank transfer details and deposit confirmation
              </p>
            </div>

            {/* ADCB Bank Details */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center">
                <Building size={20} className="mr-2" />
                Bank Transfer Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700 uppercase tracking-wide">Account Holder Name:</p>
                  <p className="text-gray-900 font-medium">{adcbBankDetails.accountHolderName}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700 uppercase tracking-wide">Bank Name:</p>
                  <p className="text-gray-900 font-medium">{adcbBankDetails.bankName}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700 uppercase tracking-wide">Bank Address:</p>
                  <p className="text-gray-900 font-medium">{adcbBankDetails.bankAddress}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700 uppercase tracking-wide">Account Number:</p>
                  <p className="text-gray-900 font-medium font-mono">{adcbBankDetails.accountNumber}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700 uppercase tracking-wide">IBAN:</p>
                  <p className="text-gray-900 font-medium font-mono">{adcbBankDetails.iban}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700 uppercase tracking-wide">SWIFT Code:</p>
                  <p className="text-gray-900 font-medium font-mono">{adcbBankDetails.swiftCode}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700 uppercase tracking-wide">Routing Code:</p>
                  <p className="text-gray-900 font-medium font-mono">{adcbBankDetails.routingCode}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700 uppercase tracking-wide">Branch Code:</p>
                  <p className="text-gray-900 font-medium font-mono">{adcbBankDetails.branchCode}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-700 uppercase tracking-wide">Currency:</p>
                  <p className="text-gray-900 font-medium">{adcbBankDetails.currency} (United Arab Emirates Dirham)</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-700 uppercase tracking-wide">Transfer Reference:</p>
                  <p className="text-gray-900 font-medium">{adcbBankDetails.additionalInstructions.replace('[Investor Name]', onboardingData.personalDetails.fullName)}</p>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <DollarSign size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 uppercase tracking-wide">Minimum Deposit</h4>
                    <p className="text-blue-700 text-sm mt-1 uppercase tracking-wide">
                      The minimum initial deposit is USD 1,000 or equivalent in your local currency.
                      Please include your full name in the transfer reference.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Proof of Deposit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Upload Proof of Deposit *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleProofOfDepositUpload(files);
                    }
                  }}
                  className="hidden"
                  id="deposit-upload"
                />
                <label htmlFor="deposit-upload" className="cursor-pointer">
                  <Upload size={32} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium uppercase tracking-wide">
                    Click to upload bank transfer receipt
                  </p>
                  <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide">
                    Multiple files supported: JPG, PNG, PDF (Max 10MB each)
                  </p>
                </label>
              </div>

              {/* Preview uploaded files */}
              {onboardingData.proofOfDeposit.files.length > 0 && (
                <div className="mt-4 space-y-3">
                  {onboardingData.proofOfDeposit.files.map((file, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle size={20} className="text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 uppercase tracking-wide">File {index + 1} Uploaded</p>
                          <p className="text-sm text-gray-600 uppercase tracking-wide">{file.name}</p>
                        </div>
                      </div>
                      {onboardingData.proofOfDeposit.filesBase64[index]?.startsWith('data:image/') && (
                        <div className="mt-3">
                          <img 
                            src={onboardingData.proofOfDeposit.filesBase64[index]}
                            alt={`Deposit Proof ${index + 1}`}
                            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Investment Agreement
              </h2>
              <p className="text-gray-600 uppercase tracking-wide text-sm">
                Please review and accept the terms and conditions
              </p>
            </div>

            {/* Agreement Document */}
            <div 
              ref={agreementRef}
              onScroll={handleAgreementScroll}
              className="bg-white border border-gray-300 rounded-lg p-6 h-96 overflow-y-auto text-sm leading-relaxed"
            >
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800">
                {generateAgreement()}
              </pre>
            </div>

            {/* Scroll indicator */}
            {!hasScrolledToEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle size={20} className="text-yellow-600" />
                  <p className="text-yellow-700 font-medium uppercase tracking-wide">
                    Please scroll to the end of the agreement to continue
                  </p>
                </div>
              </div>
            )}

            {/* Agreement Checkbox */}
            <div className={`transition-opacity ${hasScrolledToEnd ? 'opacity-100' : 'opacity-50'}`}>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onboardingData.agreementAccepted}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    agreementAccepted: e.target.checked
                  }))}
                  disabled={!hasScrolledToEnd}
                  className="mt-1 h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-300"
                />
                <span className="text-sm text-gray-700 font-medium uppercase tracking-wide">
                  By clicking you agree to all terms and conditions in the agreement
                </span>
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-8">
              <img 
                src="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop"
                alt="Interactive Brokers"
                className="h-24 w-auto opacity-40"
              />
            </div>
            
            <div className="space-y-4">
              <CheckCircle size={64} className="mx-auto text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                Application Submitted Successfully
              </h2>
              <p className="text-gray-600 max-w-md mx-auto uppercase tracking-wide">
                Your application has been sent to management for review and may take up to 48 hours to complete
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-medium text-gray-900 mb-2 uppercase tracking-wide">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left uppercase tracking-wide">
                <li>• Document verification (24-48 hours)</li>
                <li>• Account setup and activation</li>
                <li>• Welcome email with login details</li>
                <li>• Initial trading consultation</li>
              </ul>
            </div>

            <button
              onClick={() => {
                onClose();
                onSuccess?.();
              }}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Close
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide">Investor Onboarding</h1>
              <p className="text-gray-300 text-sm uppercase tracking-wide">
                Step {currentStep} of 6
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium uppercase tracking-wide">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep < 6 && (
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide font-medium"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6].map(step => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step === currentStep ? 'bg-gray-900' : 
                    step < currentStep ? 'bg-gray-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {currentStep < 5 ? (
              <button
                onClick={() => {
                  if (validateStep(currentStep)) {
                    setCurrentStep(prev => prev + 1);
                    setError('');
                  } else {
                    setError('Please complete all required fields before continuing.');
                  }
                }}
                className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wide font-medium"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(5) || isLoading}
                className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <CheckCircle size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorOnboardingFlow;