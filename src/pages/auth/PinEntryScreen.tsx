import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingScreen from '../../components/common/LoadingScreen';

interface PinEntryScreenProps {
  onAuthenticated: (targetPath?: string) => void;
}

const PinEntryScreen = ({ onAuthenticated }: PinEntryScreenProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [ipAccessDenied, setIpAccessDenied] = useState(false);
  const [clientIP, setClientIP] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'Interactive Brokers Security Terminal v2.1.0',
    'Copyright (c) 2025 Interactive Brokers LLC',
    'All rights reserved.',
    '',
    'System initialized...',
    'Security protocols active...',
    'Awaiting authentication...',
    ''
  ]);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Check for IP access denial on component mount
  useEffect(() => {
    // Check if IP access was denied by the server
    if (typeof window !== 'undefined' && (window as any).ipAccessDenied) {
      const denialInfo = (window as any).ipAccessDenied;
      setIpAccessDenied(true);
      setClientIP(denialInfo.ip);
      
      // Clear existing command history and show access denied
      setCommandHistory([
        'Interactive Brokers Security Terminal v2.1.0',
        'Copyright (c) 2025 Interactive Brokers LLC',
        'All rights reserved.',
        '',
        '[SECURITY] Initializing IP verification...',
        '[FIREWALL] Checking client IP address...',
        `[FIREWALL] Client IP: ${denialInfo.ip}`,
        '[FIREWALL] Consulting IP whitelist database...',
        '[FIREWALL] SELECT * FROM authorized_ips WHERE ip_address = ?',
        '[FIREWALL] Query returned 0 rows',
        '[SECURITY] IP verification FAILED',
        '[AUDIT] Logging unauthorized access attempt...',
        `[AUDIT] Event: UNAUTHORIZED_ACCESS, IP: ${denialInfo.ip}, Time: ${new Date().toISOString()}`,
        '[INTRUSION] Potential security breach detected',
        '[RESPONSE] Activating access denial protocol...',
        '',
        '████████████████████████████████████████████████████████████',
        '█                    ACCESS DENIED                         █',
        '████████████████████████████████████████████████████████████',
        '',
        `C:\\> Access Denied`,
        `Your IP (${denialInfo.ip}) is not authorized to access this system.`,
        'Please contact the administrator.',
        '',
        '[SECURITY] Connection terminated by firewall',
        '[SYSTEM] Session blocked - unauthorized IP detected',
        `[LOG] Incident ID: INC${Date.now().toString(36).toUpperCase()}`,
        '',
        'System access restricted.',
        ''
      ]);
      
      return;
    }
  }, []);
  
  useEffect(() => {
    // Focus input on mount
    if (inputRef.current && !ipAccessDenied) {
      inputRef.current.focus();
    }
    
    // Add blinking cursor effect
    const cursor = setInterval(() => {
      if (inputRef.current && !ipAccessDenied) {
        inputRef.current.style.borderRight = inputRef.current.style.borderRight === '2px solid #000' ? 'none' : '2px solid #000';
      }
    }, 500);
    
    return () => clearInterval(cursor);
  }, [ipAccessDenied]);
  
  useEffect(() => {
    // Auto-scroll to bottom when command history updates
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);
  
  const addToHistory = (text: string) => {
    setCommandHistory(prev => [...prev, text]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if IP is denied
    if (ipAccessDenied) {
      addToHistory('> ' + input);
      addToHistory('ERROR: Access denied - IP not authorized');
      addToHistory('Connection terminated by security system');
      setInput('');
      return;
    }
    
    if (isBlocked) {
      addToHistory('> ' + input);
      addToHistory('ERROR: Access temporarily blocked. Please wait...');
      setInput('');
      return;
    }
    
    addToHistory('> ' + input);
    
    if (input.trim() === 'crisdoraodxb') {
      // Start the processing sequence
      await startProcessingSequence('admin');
    } else if (input.trim() === 'allow-affiliate') {
      // Start the processing sequence
      await startProcessingSequence('affiliate');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      addToHistory('ERROR: Invalid authentication code');
      addToHistory(`Failed attempts: ${newAttempts}/3`);
      
      if (newAttempts >= 3) {
        addToHistory('WARNING: Maximum attempts exceeded');
        addToHistory('Access temporarily blocked for security');
        setIsBlocked(true);
        
        // Unblock after 30 seconds
        setTimeout(() => {
          setIsBlocked(false);
          setAttempts(0);
          addToHistory('');
          addToHistory('Security timeout expired. Access restored.');
          addToHistory('Enter authentication code:');
        }, 30000);
      } else {
        addToHistory('Enter authentication code:');
      }
    }
    
    setInput('');
  };
  
  const startProcessingSequence = async (userType: 'admin' | 'affiliate') => {
    const processingMessages = [
      'Authentication successful...',
      '[AUTH] Decrypting access token... 0x7F4A2B1C',
      '[AUTH] RSA-2048 key validation... PASSED',
      'Validating access code...',
      '[SEC] Running SHA-256 hash verification...',
      '[SEC] Hash: a7f5f35426b927411fc9231b56382173eacdc...',
      'Code validation complete.',
      '[SYS] Initializing secure memory allocation...',
      '[SYS] malloc(4096) -> 0x7fff5fbff000',
      '',
      'Initializing security protocols...',
      '[NET] Establishing TLS 1.3 handshake...',
      '[NET] Cipher: AES-256-GCM, ECDHE-RSA-AES256-GCM-SHA384',
      '[SEC] Certificate chain validation... OK',
      'Loading user profiles...',
      '[DB] SELECT * FROM users WHERE auth_token=? LIMIT 1',
      '[DB] Query executed in 0.023ms',
      '[CACHE] Loading user permissions from Redis...',
      'Loading system data...',
      '[API] GET /api/v2/system/config HTTP/1.1',
      '[API] Response: 200 OK (Content-Length: 2847)',
      '[JSON] Parsing configuration data...',
      'Loading server configuration...',
      '[CFG] Reading /etc/ibkr/server.conf',
      '[CFG] Loaded 47 configuration parameters',
      '[ENV] NODE_ENV=production, PORT=443',
      '',
      'Accessing Interactive Brokers server...',
      '[TCP] Opening socket connection to ibkr-prod-01.aws.com:443',
      '[TCP] Connection established (RTT: 12ms)',
      '[SSL] Negotiating SSL/TLS connection...',
      'Establishing secure connection...',
      '[CERT] Verifying server certificate...',
      '[CERT] CN=*.interactivebrokers.com, Valid until: 2025-12-31',
      '[HANDSHAKE] Client Hello -> Server Hello -> Certificate',
      'Authorizing IP address...',
      '[FIREWALL] Checking IP whitelist: ' + (Math.floor(Math.random() * 255) + 1) + '.' + 
        (Math.floor(Math.random() * 255) + 1) + '.' + 
        (Math.floor(Math.random() * 255) + 1) + '.' + 
        (Math.floor(Math.random() * 255) + 1),
      '[GEO] Location verified: ' + (userType === 'admin' ? 'Dubai, AE' : 'Unknown'),
      '[RATE_LIMIT] Checking request limits... PASSED',
      'IP authorization complete.',
      '[SESSION] Generating session token...',
      '[SESSION] Token: sess_' + Math.random().toString(36).substr(2, 16),
      '',
      'Verifying user permissions...',
      '[RBAC] Loading role-based access control...',
      '[RBAC] User role: ' + (userType === 'admin' ? 'ADMINISTRATOR' : 'AFFILIATE'),
      '[PERMS] Checking permissions matrix...',
      'Loading account data...',
      '[DB] EXEC sp_GetUserAccounts @userId=?, @includeRestricted=1',
      '[DB] Returned 1 row(s) in 0.045ms',
      '[CACHE] Caching user data (TTL: 3600s)',
      'Synchronizing with database...',
      '[SYNC] Connecting to primary database cluster...',
      '[SYNC] Master: ibkr-db-master-01 (Status: ONLINE)',
      '[SYNC] Replica: ibkr-db-replica-02 (Lag: 0.001s)',
      '[REDIS] Updating session store...',
      '',
      'Security check passed.',
      '[AUDIT] Logging authentication event...',
      '[AUDIT] Event ID: ' + Date.now().toString(36).toUpperCase(),
      '[MONITOR] Updating security metrics...',
      'Session initialized successfully.',
      '[JWT] Signing access token with RS256...',
      '[JWT] Token expires: ' + new Date(Date.now() + 3600000).toISOString(),
      '',
      userType === 'admin' ? 'Redirecting to admin portal...' : 'Redirecting to affiliate portal...',
      '[ROUTE] Preparing redirect to /' + (userType === 'admin' ? 'login' : 'affiliate-login'),
      '[CLEANUP] Clearing temporary variables...',
      '[SECURITY] Enabling session monitoring...',
      'Access granted.'
    ];
    
    // Add each message with a delay to simulate processing
    for (let i = 0; i < processingMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); // 200-500ms delay
      addToHistory(processingMessages[i]);
    }
    
    // Store PIN authentication in sessionStorage
    sessionStorage.setItem('pin_authenticated', 'true');
    
    if (userType === 'affiliate') {
      sessionStorage.setItem('login_redirect_path', '/affiliate-login');
    }
    
    setIsLoading(true);
    
    // Final delay before redirect
    setTimeout(() => {
      if (userType === 'admin') {
        onAuthenticated('/login');
      } else {
        window.location.href = '/affiliate-login';
      }
    }, 1000);
  };
  
  if (isLoading) {
    return <LoadingScreen message="Initializing secure session..." />;
  }
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Interactive Brokers Header */}
        <div className="text-center mb-8">
          <img 
            src="/Screenshot 2025-06-07 024813.png" 
            alt="Interactive Brokers" 
            className="h-12 w-auto object-contain mx-auto mb-4"
          />
          <div className="w-full h-1 bg-black mb-8"></div>
        </div>
        
        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-2 border-black shadow-lg"
        >
          {/* Terminal Header */}
          <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
            <span className="font-mono text-sm font-bold">INTERACTIVE BROKERS SECURITY TERMINAL</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white"></div>
              <div className="w-3 h-3 bg-white"></div>
              <div className="w-3 h-3 bg-white"></div>
            </div>
          </div>
          
          {/* Terminal Content */}
          <div className="p-6">
            <div 
              ref={terminalRef}
              className="bg-white border border-black p-4 h-96 overflow-y-auto font-mono text-sm"
            >
              {commandHistory.map((line, index) => (
                <div key={index} className="text-black whitespace-pre-wrap">
                  {line}
                </div>
              ))}
              
              {/* Current Input Line */}
              {!ipAccessDenied && (
                <form onSubmit={handleSubmit} className={`flex items-center mt-2 ${isBlocked ? 'opacity-50' : ''}`}>
                  <span className="text-black mr-2">&gt;</span>
                  <input
                    ref={inputRef}
                    type="password"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-black font-mono caret-black"
                    placeholder={isBlocked ? 'ACCESS BLOCKED...' : 'Enter authentication code'}
                    title="Enter 'crisdoraodxb' for admin access or 'allow-affiliate' for affiliate access"
                    disabled={isBlocked}
                    autoComplete="off"
                    spellCheck={false}
                    style={{ 
                      WebkitTextSecurity: 'disc',
                      textSecurity: 'disc'
                    }}
                  />
                </form>
              )}
            </div>
            
            {/* Terminal Footer */}
            <div className="mt-4 text-center">
              {ipAccessDenied ? (
                <div className="space-y-1">
                  <p className="font-mono text-xs text-red-600 font-bold">
                    SECURITY BREACH DETECTED - IP NOT AUTHORIZED
                  </p>
                  <p className="font-mono text-xs text-black">
                    Client IP: {clientIP} | Status: BLOCKED
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-mono text-xs text-black">
                    SECURE AUTHENTICATION REQUIRED
                  </p>
                  {isBlocked && (
                    <p className="font-mono text-xs text-red-600 mt-2">
                      SECURITY LOCKOUT ACTIVE - PLEASE WAIT 30 SECONDS
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
          
        {/* Footer */}
        <div className="text-center mt-8">
          {ipAccessDenied ? (
            <div className="space-y-2">
              <p className="font-mono text-xs text-black">
                Interactive Brokers LLC | Security System Active
              </p>
              <p className="font-mono text-xs text-red-600">
                UNAUTHORIZED ACCESS ATTEMPT LOGGED
              </p>
            </div>
          ) : (
            <p className="font-mono text-xs text-black">
              Interactive Brokers LLC | All Rights Reserved
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinEntryScreen;