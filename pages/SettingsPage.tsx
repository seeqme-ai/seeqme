import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/auth-context';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useTheme } from '../context/theme-context';
import { authService } from '../services/apiService';
import {
  Lock,
  User,
  Palette,
  Sun,
  Moon,
  Monitor,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('Password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-20 text-left">
        {/* Header Section */}
        <header>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Account Settings</h1>
          <p className="text-sm text-teal-600 font-medium">
            Manage your digital identity and security
          </p>
        </header>

        <div className="grid gap-8">
          {/* Identity Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <User className="w-5 h-5 text-teal-500" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Profile Details</h2>
            </div>
            <Card className="border-border bg-white shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center transition-all group-hover:border-teal-500/50">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
                        <p className="text-sm font-medium bg-[#F8FAFC] p-4 rounded-2xl border border-border/50">{user?.fullName}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                        <p className="text-sm font-medium bg-[#F8FAFC] p-4 rounded-2xl border border-border/50 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Security Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <Lock className="w-5 h-5 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Security</h2>
            </div>

            <Card className="border-border bg-card shadow-sm rounded-3xl">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-lg font-semibold tracking-tight">Security Credentials</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">
                Change Your Password
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" title="font-semibold text-xs text-muted-foreground">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="bg-[#F8FAFC] border-border rounded-2xl p-6 h-14 font-medium text-sm focus:ring-teal-500"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" title="font-semibold text-xs text-muted-foreground">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          className="bg-[#F8FAFC] border-border rounded-2xl p-6 h-14 font-medium text-sm focus:ring-teal-500"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword" title="font-semibold text-xs text-muted-foreground">Verify Password</Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          className="bg-[#F8FAFC] border-border rounded-2xl p-6 h-14 font-medium text-sm focus:ring-teal-500"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full md:w-auto h-14 px-12 bg-teal-600 text-white font-semibold text-sm rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-500/20 transition-all active:scale-[0.98]"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? <Loader className="w-5 h-5 animate-spin" /> : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Interface Section */}
          {/* <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Palette className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Interface Appearance</h2>
            </div>

            <Card className="border-border bg-white shadow-sm rounded-3xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { id: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
                    { id: 'dark', label: 'Dark', icon: Moon, color: 'text-blue-500' },
                    { id: 'system', label: 'System', icon: Monitor, color: 'text-teal-500' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setTheme(mode.id as any)}
                      className={`relative p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group overflow-hidden
                        ${theme === mode.id
                          ? 'border-teal-500 bg-teal-500/5 shadow-inner'
                          : 'border-border bg-[#F8FAFC]  hover:border-teal-500/30'}`}
                    >
                      {theme === mode.id && (
                        <motion.div
                          layoutId="active-theme"
                          className="absolute inset-0 bg-teal-500/5 z-0"
                        />
                      )}
                      <mode.icon className={`w-10 h-10 ${mode.color} transition-all group-hover:scale-110 relative z-10`} />
                      <span className={`text-sm font-semibold relative z-10 ${theme === mode.id ? 'text-teal-600' : 'text-muted-foreground'}`}>
                        {mode.label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section> */}

          {/* Destructive Section */}
          <section className="pt-8 border-t border-border/50">
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-lg font-bold tracking-tight text-rose-600 mb-1">Sign Out</h3>
                <p className="text-xs font-medium text-muted-foreground">End your current session across this device</p>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="h-14 px-12 border border-rose-500/20 text-rose-600 font-bold text-xs rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
              >
                Sign Out
              </Button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default React.memo(SettingsPage);
