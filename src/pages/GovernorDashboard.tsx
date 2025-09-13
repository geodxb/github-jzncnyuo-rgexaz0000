import TradingPerformance from '../components/admin/TradingPerformance';
import GovernorSettings from '../components/governor/GovernorSettings';
import GovernorWithdrawalRequests from '../components/governor/GovernorWithdrawalRequests';
import AccountCreationRequests from '../components/governor/AccountCreationRequests';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings,
  LogOut,
  Shield,
  Crown,
  UserCheck
} from 'lucide-react';

const GovernorDashboard = () => {
  const menuItems = [
    { id: 'investors', label: 'Investor Management', icon: Users },
    { id: 'withdrawals', label: 'Withdrawal Requests', icon: DollarSign },
    { id: 'trading', label: 'Trading Performance', icon: TrendingUp },
    { id: 'account-requests', label: 'Account Requests', icon: UserCheck },
    { id: 'settings', label: 'Governor Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'withdrawals':
        return <GovernorWithdrawalRequests />;
      case 'trading':
        return <TradingPerformance />;
      case 'settings':
        return <GovernorSettings />;
      case 'account-requests':
        return <AccountCreationRequests />;
      default:
        return <OverviewDashboard />;
    }
  };
};