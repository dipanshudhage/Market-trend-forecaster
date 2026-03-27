import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProfile, updateProfile, updatePassword, uploadAvatar, uploadBanner } from "../services/authService";
import {
  Camera,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Key,
  LogOut,
  ChevronRight,
  TrendingUp,
  Clock,
  User,
  Mail,
  Calendar,
  Lock,
  Loader2
} from "lucide-react";

/**
 * Helper to calculate profile completion percentage.
 */
const getProfileCompletion = (profile) => {
  let score = 0;
  const total = 5; // Added avatar as a completion criteria
  if (profile.name) score++;
  if (profile.username) score++;
  if (profile.email) score++;
  if (profile.avatar_url) score++;
  if (profile.stats && profile.stats.forecasts > 0) score++;
  return Math.round((score / total) * 100);
};

const Profile = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ type: "", message: "" });

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    avatar_url: "",
    banner_url: "",
    joinedDate: "",
    stats: { forecasts: 0, accuracy: "0%", lastLogin: "" }
  });
  const [formData, setFormData] = useState({ name: "", username: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFormData({ name: data.name, username: data.username });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (updateStatus.message) {
      const timer = setTimeout(() => setUpdateStatus({ type: "", message: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [updateStatus]);

  const handleEditClick = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setFormData({ name: profile.name, username: profile.username });
    setIsEditing(true);
    // Focus the first editable field (name) after render
    setTimeout(() => {
      if (nameInputRef.current) nameInputRef.current.focus();
    }, 10);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setUpdateStatus({ type: "", message: "" });
    try {
      await updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      setUpdateStatus({ type: "success", message: "Profile updated successfully!" });
    } catch (error) {
      console.error("Failed to update profile", error);
      const msg = error.response?.data?.detail || "Failed to update profile";
      setUpdateStatus({ type: "error", message: msg });
      if (error.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setUpdateStatus({ type: "error", message: "Please fill in all password fields" });
      return;
    }

    setIsSaving(true);
    setUpdateStatus({ type: "", message: "" });
    try {
      await updatePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      setPasswordData({ currentPassword: "", newPassword: "" });
      setShowPasswordFields(false);
      setUpdateStatus({ type: "success", message: "Password updated successfully!" });
    } catch (error) {
      console.error("Failed to update password", error);
      const msg = error.response?.data?.detail || "Failed to update password";
      setUpdateStatus({ type: "error", message: msg });
      if (error.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const response = await uploadAvatar(file);
      setProfile({ ...profile, avatar_url: response.avatar_url });
      setUpdateStatus({ type: "success", message: "Avatar updated successfully!" });
    } catch (error) {
      console.error("Failed to upload avatar", error);
      setUpdateStatus({ type: "error", message: "Failed to upload avatar" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const response = await uploadBanner(file);
      setProfile({ ...profile, banner_url: response.banner_url });
      setUpdateStatus({ type: "success", message: "Banner updated successfully!" });
    } catch (error) {
      console.error("Failed to upload banner", error);
      setUpdateStatus({ type: "error", message: "Failed to upload banner" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const completion = getProfileCompletion(profile);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-inter relative overflow-x-hidden">
      <Navbar />

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleBannerChange}
      />

      {/* 🔔 STATUS NOTIFICATION */}
      {updateStatus.message && (
        <div className={`fixed top-24 right-6 z-[60] px-6 py-3 rounded-xl border backdrop-blur-md animate-in slide-in-from-right-10 duration-300 shadow-2xl flex items-center gap-3 ${updateStatus.type === "success"
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
          {updateStatus.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-bold tracking-wide">{updateStatus.message}</span>
        </div>
      )}

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          <div className="glass-card overflow-hidden relative border border-white/10">
            {/* Banner Section */}
            <div className="absolute top-0 left-0 w-full h-40 overflow-hidden">
              {profile.banner_url ? (
                <div className="relative w-full h-full">
                  <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-slate-950/80" />
                </div>
              ) : (
                <div className="w-full h-full relative bg-slate-900/40">
                  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-primary/30 blur-[100px] rounded-full animate-pulse" />
                  <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[150%] bg-secondary/30 blur-[100px] rounded-full animate-pulse delay-700" />
                  <div className="absolute top-[20%] left-[30%] w-[30%] h-[100%] bg-accent/20 blur-[80px] rounded-full animate-pulse delay-1000" />
                  {/* Mesh-like texture overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                </div>
              )}
              {/* Overlay for Banner Upload Icon */}
              <button
                onClick={() => bannerInputRef.current.click()}
                disabled={uploadingBanner}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all group"
              >
                {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              </button>
            </div>

            <div className="relative pt-12 pb-10 px-8 flex flex-col items-center">
              {/* Profile Avatar with Glowing Ring */}
              <div className="relative group mb-6 mt-16 sm:mt-8">
                <div className="absolute -inset-1.5 bg-linear-to-tr from-primary to-secondary rounded-full opacity-40 blur-sm group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                <div className="w-32 h-32 rounded-full border-4 border-slate-950 bg-slate-900 flex items-center justify-center overflow-hidden shadow-2xl relative z-10 transition-transform group-hover:scale-105 duration-300">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-gradient">{profile.name ? profile.name.charAt(0) : "U"}</span>
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-1 right-1 z-20 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-xl border-4 border-slate-950 transform hover:scale-110 transition-all duration-300 disabled:opacity-50"
                >
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-2">
                  {profile.name}
                  <CheckCircle className="w-5 h-5 text-accent" />
                </h1>
                <p className="text-slate-500 font-medium">@{profile.username}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                  <Shield className="w-3 h-3" />
                  PRO ANALYST
                </div>
              </div>

              <div className="w-full max-w-sm mb-10 space-y-2">
                <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Profile Completion</span>
                  <span className="text-primary">{completion}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-1000 ease-out"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 w-full mb-10 border-y border-white/5 py-8">
                <div className="text-center group">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <p className="text-3xl font-black text-slate-100 tracking-tight group-hover:text-primary transition-colors">{profile.stats?.forecasts || 0}</p>
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Forecasts</p>
                </div>
                <div className="text-center group border-x border-white/5">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <p className="text-3xl font-black text-slate-100 tracking-tight group-hover:text-secondary transition-colors">{profile.stats?.accuracy || "0%"}</p>
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Accuracy</p>
                </div>
                <div className="text-center group">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-black text-slate-300 truncate">{profile.stats?.lastLogin || 'N/A'}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last Activity</p>
                </div>
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3" /> Full Name
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        disabled={!isEditing}
                        value={isEditing ? formData.name : profile.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full bg-slate-950/50 border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all ${isEditing
                          ? "border-primary/50 ring-2 ring-primary/10 shadow-[0_0_20px_rgba(56,189,248,0.1)] opacity-100"
                          : "border-white/10 opacity-40"
                          }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Username
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={isEditing ? formData.username : profile.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={`w-full bg-slate-950/50 border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all ${isEditing
                          ? "border-primary/50 ring-2 ring-primary/10 shadow-[0_0_20px_rgba(56,189,248,0.1)] opacity-100"
                          : "border-white/10 opacity-40"
                          }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Email Address
                      </label>
                      <div className="relative">
                        <input type="email" disabled value={profile.email} className="w-full bg-slate-950/30 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed outline-none w-full" />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Account Created
                      </label>
                      <div className="relative">
                        <input type="text" disabled value={profile.joinedDate} className="w-full bg-slate-950/30 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed outline-none w-full" />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={handleEditClick}
                          className="btn-primary flex-1 py-4 text-sm tracking-wide transition-all group active:scale-[0.98]"
                        >
                          Edit Profile Details
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={handleSave}
                            className="btn-primary flex-1 py-4 text-sm shadow-[0_8px_32px_rgba(56,189,248,0.2)] flex items-center justify-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save All Changes
                          </button>
                          <button type="button" onClick={() => { setIsEditing(false); setFormData({ name: profile.name, username: profile.username }); }} disabled={isSaving} className="btn-secondary flex-1 py-4 text-sm text-center">
                            Discard Changes
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 bg-white/2">
                  <button onClick={() => setShowPasswordFields(!showPasswordFields)} className="w-full px-6 py-4 flex items-center justify-between text-sm font-semibold text-slate-400 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-primary" />
                      <span>Security & Password</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showPasswordFields ? 'rotate-180' : ''}`} />
                  </button>

                  {showPasswordFields && (
                    <form onSubmit={handlePasswordUpdate} className="px-6 pb-6 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                        <input type="password" placeholder="••••••••" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                        <input type="password" placeholder="••••••••" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50" />
                      </div>
                      <button type="submit" disabled={isSaving} className="w-full btn-primary py-3 text-xs tracking-widest font-bold flex items-center justify-center gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Update Password
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/dashboard/chatbot')} className="glass-card p-6 flex flex-col items-start gap-4 hover:bg-primary/5 transition-all group border border-white/5 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Activity className="w-5 h-5" /></div>
              <div><h3 className="text-sm font-bold text-slate-200">AI Assistant</h3><p className="text-xs text-slate-500 mt-1">Get real-time market answers</p></div>
              <ChevronRight className="ml-auto w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
            </button>
            <button onClick={() => navigate('/dashboard/reports')} className="glass-card p-6 flex flex-col items-start gap-4 hover:bg-secondary/5 transition-all group border border-white/5 text-left">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><Calendar className="w-5 h-5" /></div>
              <div><h3 className="text-sm font-bold text-slate-200">My Reports</h3><p className="text-xs text-slate-500 mt-1">Access saved insights</p></div>
              <ChevronRight className="ml-auto w-4 h-4 text-slate-600 group-hover:text-secondary transition-colors" />
            </button>
            <button onClick={() => navigate('/dashboard/alerts')} className="glass-card p-6 flex flex-col items-start gap-4 hover:bg-accent/5 transition-all group border border-white/5 text-left">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><Shield className="w-5 h-5" /></div>
              <div><h3 className="text-sm font-bold text-slate-200">Security Log</h3><p className="text-xs text-slate-500 mt-1">Recent account activity</p></div>
              <ChevronRight className="ml-auto w-4 h-4 text-slate-600 group-hover:text-accent transition-colors" />
            </button>
          </div>

          <div className="glass-card border border-red-500/10 p-8">
            <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500"><AlertTriangle className="w-5 h-5" /></div><div><h2 className="text-lg font-bold text-slate-200 tracking-tight">Danger Zone</h2><p className="text-xs text-slate-500">Irreversible account actions</p></div></div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
              <div className="text-center sm:text-left"><h4 className="text-sm font-bold text-slate-300">Sign out of session</h4><p className="text-xs text-slate-500 mt-1">Log out of your current device securely</p></div>
              <button onClick={handleLogout} className="btn-secondary w-full sm:w-auto px-8 flex items-center justify-center gap-2 group hover:border-red-500/50 hover:text-red-400"><LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />Sign Out</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
