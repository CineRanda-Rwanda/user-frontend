import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Wallet from '../components/wallet/Wallet';
import { toast } from 'react-toastify';
import '../styles/animations.css';

type ExperienceQuality = 'auto' | 'hd' | 'sd';

interface ExperiencePrefs {
  quality: ExperienceQuality;
  autoplayNext: boolean;
  showPreviews: boolean;
}

interface NotificationPrefs {
  emailUpdates: boolean;
  smsUpdates: boolean;
}

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'account' | 'wallet' | 'activity' | 'settings'>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [experiencePrefs, setExperiencePrefs] = useState<ExperiencePrefs>({
    quality: 'auto',
    autoplayNext: true,
    showPreviews: true,
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    emailUpdates: true,
    smsUpdates: false,
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredLanguage: 'english' as 'english' | 'french' | 'kinyarwanda',
    theme: 'dark' as 'dark' | 'light',
  });
  const purchasedCount = user?.purchasedContent?.length || 0;
  const activeSessions = (user as any)?.activeSessions ?? 1;
  const qualityLabels: Record<ExperienceQuality, string> = {
    auto: 'Auto Detect',
    hd: 'HD 1080p',
    sd: 'Data Saver',
  };

  // Update formData when user data becomes available or changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        preferredLanguage: user.preferredLanguage || 'english',
        theme: user.theme || 'dark',
      });
    }
  }, [user]);

  useEffect(() => {
    if (location.hash === '#settings') {
      setActiveTab('settings');
    }
  }, [location.hash]);

  useEffect(() => {
    try {
      const storedExperience = localStorage.getItem('cineranda-experience');
      const storedNotifications = localStorage.getItem('cineranda-notifications');
      if (storedExperience) {
        setExperiencePrefs(JSON.parse(storedExperience));
      }
      if (storedNotifications) {
        setNotificationPrefs(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error('Failed to load saved preferences', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cineranda-experience', JSON.stringify(experiencePrefs));
  }, [experiencePrefs]);

  useEffect(() => {
    localStorage.setItem('cineranda-notifications', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  const updateQuality = (quality: ExperienceQuality) => {
    setExperiencePrefs((prev) => ({ ...prev, quality }));
  };

  const toggleExperience = (key: keyof Omit<ExperiencePrefs, 'quality'>) => {
    setExperiencePrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-yellow-500 via-yellow-600 to-red-500 rounded-2xl p-8 mb-8 overflow-hidden shadow-2xl animate-fade-in-up">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-xl ring-4 ring-white/30 transition-transform hover:scale-105">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              {user.isActive && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-lg"></div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.username || 'User'}
              </h1>
              <p className="text-white/90 font-medium mb-3">@{user.username || 'user'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  {user.email || user.phoneNumber || 'N/A'}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  {user.location === 'international' ? 'International' : 'Rwanda'}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  Joined {user.createdAt ? formatDate(user.createdAt).split(',')[0] : 'Recently'}
                </span>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-2xl font-bold text-white">{user.loginCount || 0}</p>
                  <p className="text-xs text-white/80 font-medium">Total Logins</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-2xl font-bold text-white">{user.purchasedContent?.length || 0}</p>
                  <p className="text-xs text-white/80 font-medium">Purchases</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-2xl font-bold text-white">{user.isTwoFactorEnabled ? '✓' : '✗'}</p>
                  <p className="text-xs text-white/80 font-medium">2FA Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900 p-2 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
            Account
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Activity
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-800 shadow-xl">
                  <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      Profile Control Center
                    </h2>
                    <button
                      onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : isEditing ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                          </svg>
                          Save Changes
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                          </svg>
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 text-white/80">
                      {user.isActive ? 'Active Member' : 'Inactive'}
                    </span>
                    <span className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white/80">
                      {user.location === 'international' ? 'Global Plan' : 'Rwanda Plan'}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-full text-xs font-semibold ${
                        user.isTwoFactorEnabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {user.isTwoFactorEnabled ? '2FA Enabled' : '2FA Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Username</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-500">@</span>
                        <input
                          type="text"
                          value={user.username || ''}
                          disabled
                          className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-500 rounded-xl cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={user.phoneNumber || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-500 rounded-xl cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Preferred Language</p>
                      <p className="text-white font-semibold">{formData.preferredLanguage}</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Theme</p>
                      <p className="text-white font-semibold">{formData.theme === 'dark' ? 'Dark' : 'Light'}</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Region</p>
                      <p className="text-white font-semibold">{user.location === 'international' ? 'International' : 'Rwanda'}</p>
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          preferredLanguage: user.preferredLanguage || 'english',
                          theme: user.theme || 'dark',
                        });
                      }}
                      className="mt-6 w-full px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition font-medium"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                      </svg>
                      Account Pulse
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700">
                          <p className="text-xs text-gray-400 uppercase">Total Logins</p>
                          <p className="text-2xl font-bold text-white">{user.loginCount || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700">
                          <p className="text-xs text-gray-400 uppercase">Purchases</p>
                          <p className="text-2xl font-bold text-white">{purchasedCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                        <span className="text-gray-400 font-medium">Email Verified</span>
                        <span className={`text-lg ${user.isEmailVerified ? 'text-green-400' : 'text-yellow-500'}`}>
                          {user.isEmailVerified ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                        <span className="text-gray-400 font-medium">Phone Verified</span>
                        <span className={`text-lg ${user.phoneVerified ? 'text-green-400' : 'text-yellow-500'}`}>
                          {user.phoneVerified ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                        <span className="text-gray-400 font-medium">2FA</span>
                        <span className={`text-lg ${user.isTwoFactorEnabled ? 'text-green-400' : 'text-gray-500'}`}>
                          {user.isTwoFactorEnabled ? 'Enabled' : 'Off'}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('activity')}
                        className="w-full mt-2 px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 hover:border-yellow-500 transition"
                      >
                        View detailed activity log
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Session Health</h3>
                      <span className="text-xs uppercase tracking-widest text-gray-400">Real-time</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Last Active</p>
                          <p className="text-white font-semibold">{user.lastActive ? formatDate(user.lastActive) : 'Just now'}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80">
                          Secure
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Active Devices</p>
                          <p className="text-white font-semibold">{activeSessions} device(s)</p>
                        </div>
                        <button
                          onClick={() => toast.info('Remote sign-out coming soon')}
                          className="text-sm text-yellow-400 hover:text-yellow-200"
                        >
                          Sign out others
                        </button>
                      </div>
                      <div className="border-t border-gray-800 pt-4">
                        <p className="text-sm text-gray-400 mb-3">Need to move your collection?</p>
                        <button
                          onClick={() => navigate('/wallet')}
                          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold"
                        >
                          Manage billing & wallets
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-500/10 via-yellow-600/10 to-red-500/10 rounded-2xl p-6 border border-yellow-900/40 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-yellow-200 uppercase tracking-widest">Library Spotlight</p>
                      <p className="text-3xl font-black text-white">{purchasedCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-black/30 flex items-center justify-center text-yellow-400 text-2xl">
                      🎬
                    </div>
                  </div>
                  <p className="text-white/80 mb-4">Your owned titles are always synced and ready. Resume instantly across devices.</p>
                  <div className="flex flex-wrap gap-3 mb-6 text-sm text-white/70">
                    <span className="px-3 py-1 rounded-full bg-black/30">Continue Watching</span>
                    <span className="px-3 py-1 rounded-full bg-black/30">Downloads</span>
                    <span className="px-3 py-1 rounded-full bg-black/30">Purchased</span>
                  </div>
                  <button
                    onClick={() => navigate('/my-library')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:translate-x-1 transition"
                  >
                    Open My Library
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-widest">Concierge</p>
                      <p className="text-2xl font-bold text-white">Profile & Devices</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-300">Priority</span>
                  </div>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>Primary Device</span>
                      <span className="text-white font-medium">Web App</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Backup Device</span>
                      <span className="text-white/70">Add via mobile</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Support Channel</span>
                      <span className="text-white font-medium">24/7 Chat</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 text-white hover:border-yellow-500 transition"
                    >
                      Update streaming devices
                    </button>
                    <button
                      onClick={() => toast.info('Opening support desk...')}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-800 shadow-xl">
              <Wallet />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
                Viewing Activity
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{user.purchasedContent?.length || 0}</p>
                      <p className="text-sm text-gray-400">Content Owned</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-sm text-gray-400">Hours Watched</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-sm text-gray-400">Reviews Given</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400 text-lg">No activity yet</p>
                <p className="text-gray-500 text-sm mt-2">Start watching content to see your activity</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div id="settings" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-800 shadow-xl">
                  <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
                        </svg>
                        Experience Preferences
                      </h2>
                      <p className="text-sm text-gray-400">Tune playback, localization, and previews for every device.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-300">Synced</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Language</label>
                      <select
                        value={formData.preferredLanguage}
                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value as any })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                      >
                        <option value="english">English</option>
                        <option value="french">Français</option>
                        <option value="kinyarwanda">Kinyarwanda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Theme</label>
                      <select
                        value={formData.theme}
                        onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                      >
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-400 mb-3">Streaming Quality</p>
                    <div className="flex flex-wrap gap-3">
                      {(Object.keys(qualityLabels) as ExperienceQuality[]).map((quality) => (
                        <button
                          key={quality}
                          onClick={() => updateQuality(quality)}
                          className={`flex-1 min-w-[140px] px-4 py-3 rounded-2xl border transition text-left ${
                            experiencePrefs.quality === quality
                              ? 'border-yellow-500 bg-yellow-500/10 text-white'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-yellow-500'
                          }`}
                        >
                          <span className="block font-semibold">{qualityLabels[quality]}</span>
                          <small className="text-xs text-gray-400">
                            {quality === 'auto' && 'Adapts to bandwidth'}
                            {quality === 'hd' && 'Prioritize highest fidelity'}
                            {quality === 'sd' && 'Reduce data usage'}
                          </small>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => toggleExperience('autoplayNext')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                        experiencePrefs.autoplayNext ? 'border-yellow-500 bg-yellow-500/10 text-white' : 'border-gray-700 bg-gray-800 text-gray-300'
                      }`}
                    >
                      <span>Autoplay next episodes</span>
                      <span className="text-sm font-semibold">{experiencePrefs.autoplayNext ? 'On' : 'Off'}</span>
                    </button>
                    <button
                      onClick={() => toggleExperience('showPreviews')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                        experiencePrefs.showPreviews ? 'border-yellow-500 bg-yellow-500/10 text-white' : 'border-gray-700 bg-gray-800 text-gray-300'
                      }`}
                    >
                      <span>Show hover previews</span>
                      <span className="text-sm font-semibold">{experiencePrefs.showPreviews ? 'On' : 'Off'}</span>
                    </button>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:shadow-lg hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Language & Theme'}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
                    <p className="text-sm text-gray-400">Stay informed on releases, purchases, and security.</p>
                    <div className="space-y-3 mt-6">
                      <button
                        onClick={() => toggleNotification('emailUpdates')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                          notificationPrefs.emailUpdates ? 'border-yellow-500 bg-yellow-500/10 text-white' : 'border-gray-700 bg-gray-800 text-gray-300'
                        }`}
                      >
                        <span>Email updates</span>
                        <span className="text-sm font-semibold">{notificationPrefs.emailUpdates ? 'Enabled' : 'Muted'}</span>
                      </button>
                      <button
                        onClick={() => toggleNotification('smsUpdates')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                          notificationPrefs.smsUpdates ? 'border-yellow-500 bg-yellow-500/10 text-white' : 'border-gray-700 bg-gray-800 text-gray-300'
                        }`}
                      >
                        <span>SMS alerts</span>
                        <span className="text-sm font-semibold">{notificationPrefs.smsUpdates ? 'Enabled' : 'Muted'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Security Shortcuts</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                        <div>
                          <p className="text-white font-semibold">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-400">Protects logins with a second step</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isTwoFactorEnabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <button
                        onClick={() => toast.info('2FA management coming soon')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-700 text-white hover:border-yellow-500 transition"
                      >
                        Manage Two-Factor
                      </button>
                      <button
                        onClick={() => toast.info('PIN change coming soon')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-700 text-white hover:border-yellow-500 transition"
                      >
                        Change PIN
                      </button>
                      <button
                        onClick={() => toast.error('Please contact support to delete your account')}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
