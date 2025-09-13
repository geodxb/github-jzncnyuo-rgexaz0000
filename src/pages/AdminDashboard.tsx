@@ .. @@
 import WithdrawalRequests from '../components/admin/WithdrawalRequests';
 import InvestorManagement from '../components/admin/InvestorManagement';
 import TradingPerformance from '../components/admin/TradingPerformance';
+import InvestorOnboardingFlow from '../components/onboarding/InvestorOnboardingFlow';
 import { useLanguage } from '../contexts/LanguageContext';
 import { useAuth } from '../contexts/AuthContext';
 import { 
@@ .. @@
   Briefcase,
   TrendingUp,
   Settings,
-  LogOut
+  LogOut,
+  UserPlus
 } from 'lucide-react';
 
 const AdminDashboard = () => {
   const { t } = useLanguage();
   const { user, logout } = useAuth();
   const [activeTab, setActiveTab] = useState('overview');
+  const [showOnboarding, setShowOnboarding] = useState(false);
 
   const tabs = [
     { id: 'overview', label: t('overview'), icon: BarChart3 },
@@ .. @@
           <div className="flex items-center space-x-4">
             <span className="text-gray-600 uppercase tracking-wide">{user?.name}</span>
             
+            <button
+              onClick={() => setShowOnboarding(true)}
+              className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wide font-medium"
+            >
+              <UserPlus size={16} />
+              <span>New Investor</span>
+            </button>
+            
             <button
               onClick={logout}
               className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors uppercase tracking-wide"
@@ .. @@
           {renderContent()}
         </div>
       </div>
+
+      {/* Investor Onboarding Flow */}
+      <InvestorOnboardingFlow
+        isOpen={showOnboarding}
+        onClose={() => setShowOnboarding(false)}
+        onSuccess={() => {
+          // Refresh data or show success message
+          console.log('Investor onboarding completed successfully');
+        }}
+      />
     </div>
   );
 };