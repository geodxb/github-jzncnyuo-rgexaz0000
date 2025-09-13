import WithdrawalRequests from '../components/admin/WithdrawalRequests';
import InvestorManagement from '../components/admin/InvestorManagement';
import TradingPerformance from '../components/admin/TradingPerformance';
import InvestorOnboardingFlow from '../components/onboarding/InvestorOnboardingFlow';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3,
  Users,
  DollarSign,
  Briefcase,
  TrendingUp,
  Settings,
  LogOut,
  UserPlus
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'investors', label: 'Investors', icon: Users },
    { id: 'withdrawals', label: 'Withdrawals', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <div>Overview Content</div>;
      case 'investors':
        return <InvestorManagement />;
      case 'withdrawals':
        return <WithdrawalRequests />;
      case 'performance':
        return <TradingPerformance />;
      case 'settings':
        return <div>Settings Content</div>;
      default:
        return <div>Overview Content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              Admin Dashboard
            </h1>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 uppercase tracking-wide">{user?.name}</span>
              
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wide font-medium"
              >
                <UserPlus size={16} />
                <span>New Investor</span>
              </button>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors uppercase tracking-wide"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wide ${
                      activeTab === tab.id
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Investor Onboarding Flow */}
      <InvestorOnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSuccess={() => {
          // Refresh data or show success message
          console.log('Investor onboarding completed successfully');
        }}
      />
    </div>
  );
};

export default AdminDashboard;