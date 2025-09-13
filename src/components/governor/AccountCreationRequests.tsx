import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FirestoreService } from '../../services/firestoreService';
import { 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Calendar,
  DollarSign,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface AccountCreationRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantCountry: string;
  bankDetails: Record<string, string>;
  identityDocument: {
    type: 'id_card' | 'passport';
    base64: string;
    fileName: string;
  };
  proofOfDeposit: {
    files: Array<{
      base64: string;
      fileName: string;
    }>;
  };
  requestedBy: string;
  requestedByName: string;
  requestedAt: any;
  status: 'pending' | 'approved' | 'rejected';
  initialDeposit: number;
  accountType: string;
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  reviewNotes?: string;
}

const AccountCreationRequests = () => {
  const [requests, setRequests] = useState<AccountCreationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AccountCreationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await FirestoreService.getCollection('accountCreationRequests');
      const sortedData = data.sort((a, b) => {
        const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
        const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
        return dateB.getTime() - dateA.getTime();
      });
      setRequests(sortedData);
    } catch (error) {
      console.error('Error loading account creation requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      setIsProcessing(true);
      
      await FirestoreService.updateDoc('accountCreationRequests', requestId, {
        status,
        reviewedAt: new Date(),
        reviewedBy: 'Governor', // You can get this from auth context
        reviewNotes: notes || ''
      });

      // If approved, create the actual investor account
      if (status === 'approved' && selectedRequest) {
        const investorData = {
          name: selectedRequest.applicantName,
          email: selectedRequest.applicantEmail,
          phone: selectedRequest.applicantPhone,
          country: selectedRequest.applicantCountry,
          bankDetails: selectedRequest.bankDetails,
          accountType: selectedRequest.accountType,
          initialDeposit: selectedRequest.initialDeposit,
          status: 'active',
          createdAt: new Date(),
          createdBy: 'Governor',
          documents: {
            identity: selectedRequest.identityDocument,
            proofOfDeposit: selectedRequest.proofOfDeposit
          }
        };

        await FirestoreService.addDoc('investors', investorData);
      }

      await loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users size={24} className="text-gray-900" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Account Creation Requests
            </h1>
            <p className="text-gray-600 uppercase tracking-wide text-sm">
              Review and approve new investor applications
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: requests.length },
            { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium uppercase tracking-wide transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2 uppercase tracking-wide">
              No Requests Found
            </h3>
            <p className="text-gray-600 uppercase tracking-wide">
              {filter === 'all' ? 'No account creation requests yet.' : `No ${filter} requests found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deposit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                          {request.applicantName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.applicantEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase tracking-wide">
                      {request.applicantCountry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${request.initialDeposit?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase tracking-wide">
                      {formatDate(request.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-gray-900 hover:text-gray-700 flex items-center space-x-1 uppercase tracking-wide"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gray-900 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wide">
                    Account Creation Request
                  </h2>
                  <p className="text-gray-300 text-sm uppercase tracking-wide">
                    {selectedRequest.applicantName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center">
                  <User size={20} className="mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Full Name</label>
                    <p className="text-gray-900 font-medium">{selectedRequest.applicantName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Email</label>
                    <p className="text-gray-900 font-medium">{selectedRequest.applicantEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Phone</label>
                    <p className="text-gray-900 font-medium">{selectedRequest.applicantPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Country</label>
                    <p className="text-gray-900 font-medium">{selectedRequest.applicantCountry}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center">
                  <Building size={20} className="mr-2" />
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedRequest.bankDetails).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-gray-900 font-medium font-mono">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identity Document */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center">
                  <Shield size={20} className="mr-2" />
                  Identity Document
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Document Type</label>
                    <p className="text-gray-900 font-medium capitalize">
                      {selectedRequest.identityDocument.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">Document Image</label>
                    {selectedRequest.identityDocument.base64 && (
                      <div className="border border-gray-300 rounded-lg p-4 bg-white">
                        <img 
                          src={selectedRequest.identityDocument.base64}
                          alt="Identity Document"
                          className="max-w-full h-auto max-h-96 rounded-lg shadow-sm"
                        />
                        <p className="text-sm text-gray-600 mt-2 uppercase tracking-wide">
                          {selectedRequest.identityDocument.fileName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Proof of Deposit */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center">
                  <DollarSign size={20} className="mr-2" />
                  Proof of Deposit
                </h3>
                <div className="space-y-4">
                  {selectedRequest.proofOfDeposit.files.map((file, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
                      <p className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                        Document {index + 1}: {file.fileName}
                      </p>
                      {file.base64.startsWith('data:image/') && (
                        <img 
                          src={file.base64}
                          alt={`Proof of Deposit ${index + 1}`}
                          className="max-w-full h-auto max-h-64 rounded-lg shadow-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center">
                  <FileText size={20} className="mr-2" />
                  Request Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Initial Deposit</label>
                    <p className="text-gray-900 font-medium">${selectedRequest.initialDeposit?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Account Type</label>
                    <p className="text-gray-900 font-medium">{selectedRequest.accountType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Submitted At</label>
                    <p className="text-gray-900 font-medium">{formatDate(selectedRequest.submittedAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Current Status</label>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span>{selectedRequest.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {selectedRequest.status === 'pending' && (
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide font-medium"
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide font-medium"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  <span>Approve</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountCreationRequests;