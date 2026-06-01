import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  User as UserIcon, Camera, Trash2, ArrowLeft,
  Loader2, Save, AlertTriangle, Lock, Home, LogIn, LogOut,
  Link2, ExternalLink, Globe, Mail, Eye, EyeOff
} from 'lucide-react';
import { useClerk } from '@clerk/react';
import api from '@/lib/axios';
import useAuthStore from '@/stores/authStore';
import ImageCropModal from '@/components/ui/ImageCropModal';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const clerk = useClerk();

  const handleLogout = async () => {
    await logout();
    await clerk.signOut();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const [name, setName] = useState(user?.name || '');
  const [localImage, setLocalImage] = useState(user?.profilePicture || null);
  const [isImageModified, setIsImageModified] = useState(false);
  const [selectedCropImage, setSelectedCropImage] = useState(null);

  const [github, setGithub] = useState(user?.github || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [portfolio, setPortfolio] = useState(user?.portfolio || '');



  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchFreshUser = async () => {
      try {
        const res = await api.get('/user/me');
        if (res.data.success && res.data.data) {
          updateUser(res.data.data);
          setName(res.data.data.name || '');
          setLocalImage(res.data.data.profilePicture || null);
          setGithub(res.data.data.github || '');
          setLinkedin(res.data.data.linkedin || '');
          setPortfolio(res.data.data.portfolio || '');
        }
      } catch (err) {
        console.error('Failed to fetch fresh user details:', err);
      }
    };
    fetchFreshUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.put('/user/profile', data),
    onSuccess: (res) => {
      updateUser(res.data.data.user);
      setIsImageModified(false);
      toast.success('Profile saved successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    }
  });





  const deleteAccountMutation = useMutation({
    mutationFn: (password) => api.delete('/user/account', { data: { password } }),
    onSuccess: async () => {
      setShowDeleteModal(false);
      try {
        await clerk.signOut();
      } catch (err) {
        console.error('Failed to sign out from Clerk:', err);
      }
      logout();
      navigate('/account-deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  });

  const handleMasterSave = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const payload = { name, github: github || null, linkedin: linkedin || null, portfolio: portfolio || null };
    if (isImageModified) {
      payload.profilePicture = localImage;
    }

    updateProfileMutation.mutate(payload);
  };





  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedCropImage(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const hasUnsavedProfileChanges = name !== user?.name || isImageModified
    || (github || '') !== (user?.github || '')
    || (linkedin || '') !== (user?.linkedin || '')
    || (portfolio || '') !== (user?.portfolio || '');

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(deletePassword || '');
  };



  return (
    <div className="min-h-screen bg-neu-bg pb-12">
      <header className="px-4 py-4 flex flex-row items-center justify-between max-w-[1000px] mx-auto gap-4 sticky top-0 z-40 bg-neu-bg/90 backdrop-blur-md pb-6 mb-2">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center justify-center w-10 h-10 border-2 border-neu-border hover:border-neu-primary bg-neu-bg-panel hover:bg-neu-primary/10 text-neu-text-light hover:text-neu-primary transition-all duration-200 rounded-lg shadow-sm hover:shadow-[0_0_12px_rgba(139,92,246,0.3)]"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-xl">Advanced Profile Editor</h1>
            <p className="text-xs text-neu-text-muted">Manage your personal information</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-3.5 py-0 sm:py-2 flex items-center justify-center gap-2 border border-neu-border hover:border-red-500/60 bg-neu-bg-panel hover:bg-red-500/[0.08] text-neu-text-light hover:text-red-500 rounded-lg sm:rounded-md transition-all duration-200 font-bold tracking-tight shadow-sm flex-shrink-0 whitespace-nowrap"
          id="profile-logout-btn"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      <main className="max-w-[800px] mx-auto px-4 space-y-8 animate-slide-up">

        <section className="space-y-6">
          <h2 className="font-display font-bold text-sm text-neu-text-muted uppercase tracking-wider pl-2">
            Base Profile Settings
          </h2>

          <div className="neu-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-neu-bg neu-inset flex items-center justify-center p-1">
                {localImage ? (
                  <img
                    src={localImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-neu-primary to-neu-secondary flex items-center justify-center text-white text-4xl font-bold font-display shadow-inner">
                    {name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-10 h-10 neu-btn flex items-center justify-center rounded-full p-0 group-hover:bg-neu-primary group-hover:text-white transition-colors"
                title="Change Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={onFileChange}
              />
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <label className="block text-xs font-bold text-neu-text-light uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neu-input max-w-sm w-full mb-4"
                placeholder="Enter your name"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="neu-btn px-4 py-2 text-sm flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Upload Photo
                </button>
                {localImage && (
                  <button
                    onClick={() => {
                      setLocalImage(null);
                      setIsImageModified(true);
                    }}
                    className="neu-btn px-4 py-2 text-sm text-neu-danger hover:bg-red-50"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="neu-card p-6 md:p-8">
            <label className="block text-xs font-bold text-neu-text-light uppercase tracking-wider mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-neu-primary" />
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="neu-input w-full opacity-60 cursor-not-allowed"
              title="Email is linked to your login and cannot be changed here"
              id="profile-email-display"
            />
            <p className="text-[11px] text-neu-text-muted mt-2">This email is tied to your login account and is automatically set.</p>
          </div>

          <div className="neu-card p-6 md:p-8 space-y-5">
            <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-neu-primary" />
              Social & Professional Links
            </h3>
            <p className="text-[11px] text-neu-text-muted -mt-3 mb-3">These links will be pre-filled when you create a new resume.</p>

            <div>
              <label className="block text-xs font-bold text-neu-text-light uppercase tracking-wider mb-2 flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5" />
                GitHub
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="neu-input w-full"
                placeholder="Your Github profile"
                id="profile-github-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neu-text-light uppercase tracking-wider mb-2 flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                LinkedIn
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="neu-input w-full"
                placeholder="Your LinkedIn profile"
                id="profile-linkedin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neu-text-light uppercase tracking-wider mb-2 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                Portfolio / Website
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="neu-input w-full"
                placeholder="Your Portfolio link"
                id="profile-portfolio-input"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleMasterSave}
              disabled={updateProfileMutation.isPending || !hasUnsavedProfileChanges}
              className={`px-8 py-3.5 text-sm flex items-center gap-2 transition-all ${hasUnsavedProfileChanges ? 'neu-btn-primary animate-pulse-soft' : 'neu-btn opacity-50 cursor-not-allowed'
                }`}
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {hasUnsavedProfileChanges ? 'Save Unsaved Changes' : 'Profile Up-To-Date'}
            </button>
          </div>
        </section>


        <section className="space-y-6 pt-6">
          <h2 className="font-display font-bold text-sm text-neu-text-muted uppercase tracking-wider pl-2">
            Security & Account
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div className="neu-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-neu-border bg-gradient-to-br from-neu-bg-panel to-neu-bg/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-neu-primary/10 border border-neu-primary/20 flex items-center justify-center flex-shrink-0 text-neu-primary mt-1 shadow-inner">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base mb-1">
                    Manage Authentication & Security
                  </h3>
                  <p className="text-xs text-neu-text-muted leading-relaxed max-w-md">
                    Your account security and login credentials are powered and protected by **Clerk**. You can update your password, enable Multi-Factor Authentication (MFA), link social profiles, and view active sessions securely.
                  </p>
                </div>
              </div>
              <button
                onClick={() => clerk.openUserProfile()}
                className="neu-btn-primary px-5 py-3 text-xs font-bold tracking-wider uppercase flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 transition-all duration-200"
                id="open-clerk-profile-btn"
              >
                <ExternalLink className="w-4 h-4" />
                Manage Security on Clerk
              </button>
            </div>
          </div>
        </section>

        <section className="pt-6 pb-4">
          <div className="neu-card border border-red-200 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 neu-circle !shadow-red-200">
                <AlertTriangle className="w-5 h-5 text-neu-danger" />
              </div>
              <h2 className="font-display font-bold text-lg text-neu-danger">Danger Zone</h2>
            </div>

            <div className="max-w-2xl">
              <h3 className="font-bold text-sm mb-1">Delete Account</h3>
              <p className="text-sm text-neu-text-light mb-4">
                Permanently delete your account and all your resumes. This action is irreversible. All generated ATS reports and customized resumes will be lost forever.
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="neu-btn-danger px-4 py-2 text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </section>

      </main>

      {selectedCropImage && (
        <ImageCropModal
          imageSrc={selectedCropImage}
          onClose={() => setSelectedCropImage(null)}
          onSave={(croppedImg) => {
            setLocalImage(croppedImg);
            setIsImageModified(true);
            setSelectedCropImage(null);
          }}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fade-in">
          <div className="neu-card bg-neu-bg w-full max-w-sm animate-scale-in">
            <div className="w-12 h-12 neu-circle mx-auto mb-4 border-2 border-neu-danger bg-red-50">
              <AlertTriangle className="w-6 h-6 text-neu-danger" />
            </div>
            <h3 className="font-display font-bold text-lg text-center mb-2">Delete Account?</h3>
            <p className="text-sm text-neu-text-light text-center mb-6 leading-relaxed">
              This action is <span className="text-neu-danger font-semibold">permanent and cannot be undone</span>. All your resumes and data will be erased forever.
            </p>

            {user?.hasPassword && (
              <div className="mb-6 text-left">
                <label className="block text-xs font-bold text-neu-text-light uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="neu-input w-full pr-4 text-sm"
                  placeholder="Enter your password to confirm"
                  id="delete-account-password-input"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="neu-btn flex-1 text-sm py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending || (user?.hasPassword ? !deletePassword : false)}
                className={`flex-1 text-sm py-2 ${
                  deleteAccountMutation.isPending || (user?.hasPassword ? !deletePassword : false)
                    ? 'neu-btn opacity-50 cursor-not-allowed'
                    : 'neu-btn-danger'
                }`}
              >
                {deleteAccountMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
