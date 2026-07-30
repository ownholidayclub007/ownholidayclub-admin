import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';

const ChangePassword = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [strength, setStrength] = useState(0);

    const checkStrength = (pass) => {
        let score = 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setStrength(score);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'newPassword') checkStrength(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all password fields',
                confirmButtonColor: '#C8102E'
            });
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Mismatch',
                text: 'New password and confirmation do not match',
                confirmButtonColor: '#C8102E'
            });
            return;
        }

        if (form.newPassword.length < 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Weak Password',
                text: 'New password must be at least 6 characters long',
                confirmButtonColor: '#C8102E'
            });
            return;
        }

        try {
            setIsSaving(true);
            await api.post('/api/cms/auth/change-password', {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword
            });

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Your password has been changed successfully',
                timer: 2000,
                showConfirmButton: false
            });
            
            setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setStrength(0);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to change password',
                confirmButtonColor: '#C8102E'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400', 'bg-emerald-500'];

    return (
        <div className="w-full">
            <div className="bg-white p-6 shadow-md border-2 border-gray-200 mt-6 min-h-[calc(100vh-180px)] rounded-none">
                <PageHeader 
                    title="SECURITY SETTINGS" 
                    description="Update your administrative password and manage account security"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                    {/* Left: Illustration/Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border-2 border-gray-200 p-8 shadow-lg rounded-none relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                            
                            <div className="w-16 h-16 bg-red-50 rounded-none flex items-center justify-center mb-8 border border-red-100">
                                <Lock size={32} className="text-[#C8102E]" />
                            </div>
                            
                            <h3 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-tight">Security Guidelines</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-8">
                                We recommend using a strong password that you don't use elsewhere. Regular password updates help keep your administrative portal safe.
                            </p>
                            
                            <div className="space-y-4 border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 size={12} className="text-green-600" />
                                    </div>
                                    <span>Minimum 6 characters</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 size={12} className="text-green-600" />
                                    </div>
                                    <span>Mix of letters and numbers</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 size={12} className="text-green-600" />
                                    </div>
                                    <span>Special characters recommended</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1e3a8a]/5 border-2 border-[#1e3a8a]/10 p-6 rounded-none flex gap-4 shadow-sm">
                            <AlertCircle className="text-[#1e3a8a] shrink-0" size={20} />
                            <div>
                                <p className="text-xs font-black text-[#1e3a8a] uppercase mb-2 tracking-widest">Session Security</p>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    You might be required to log in again after updating your password to ensure all your devices are updated and sessions are secure.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Change Password Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white border-2 border-gray-200 shadow-xl rounded-none overflow-hidden">
                            <div className="px-8 py-5 border-b-2 border-gray-100 bg-gray-50 flex items-center gap-3">
                                <div className="p-2 bg-white border border-gray-200 rounded-none shadow-sm">
                                    <ShieldCheck className="text-[#C8102E]" size={18} />
                                </div>
                                <h2 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Update Password Form</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="group">
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-3 tracking-[0.2em] group-focus-within:text-[#C8102E] transition-colors">
                                            Current Password <span className="text-[#C8102E]">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-gray-50 border-r border-gray-200 text-gray-400 group-focus-within:bg-red-50 group-focus-within:text-[#C8102E] group-focus-within:border-red-200 transition-all">
                                                <Key size={16} />
                                            </div>
                                            <input
                                                type="password"
                                                name="oldPassword"
                                                value={form.oldPassword}
                                                onChange={handleInputChange}
                                                placeholder="Enter your current password"
                                                className="w-full pl-16 pr-4 py-4 bg-white border-2 border-gray-200 rounded-none focus:outline-none focus:border-[#C8102E] transition-all text-sm font-semibold placeholder:font-normal placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-8 border-t-2 border-gray-50">
                                        <div className="group">
                                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-3 tracking-[0.2em] group-focus-within:text-[#C8102E] transition-colors">
                                                New Password <span className="text-[#C8102E]">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-gray-50 border-r border-gray-200 text-gray-400 group-focus-within:bg-red-50 group-focus-within:text-[#C8102E] group-focus-within:border-red-200 transition-all">
                                                    <Lock size={16} />
                                                </div>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={form.newPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Create a strong new password"
                                                    className="w-full pl-16 pr-4 py-4 bg-white border-2 border-gray-200 rounded-none focus:outline-none focus:border-[#C8102E] transition-all text-sm font-semibold placeholder:font-normal placeholder:text-gray-300 shadow-sm"
                                                />
                                            </div>
                                            
                                            {form.newPassword && (
                                                <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-none animate-fadeIn">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-2">
                                                        <span className="text-slate-400">Password Strength</span>
                                                        <span className={`${strengthColors[strength].replace('bg-', 'text-')} px-2 py-0.5 bg-white border border-current rounded-none`}>
                                                            {strengthLabels[strength]}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white border border-gray-200 rounded-none overflow-hidden flex gap-0.5 p-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div 
                                                                key={i} 
                                                                className={`h-full flex-1 transition-all duration-500 ${i < strength ? strengthColors[strength] : 'bg-gray-100'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-3 tracking-[0.2em] group-focus-within:text-[#C8102E] transition-colors">
                                                Confirm New Password <span className="text-[#C8102E]">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-gray-50 border-r border-gray-200 text-gray-400 group-focus-within:bg-red-50 group-focus-within:text-[#C8102E] group-focus-within:border-red-200 transition-all">
                                                    <ShieldCheck size={16} />
                                                </div>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={form.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Repeat the new password"
                                                    className="w-full pl-16 pr-4 py-4 bg-white border-2 border-gray-200 rounded-none focus:outline-none focus:border-[#C8102E] transition-all text-sm font-semibold placeholder:font-normal placeholder:text-gray-300 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-[#C8102E] text-white font-black py-5 rounded-none hover:bg-[#a00d24] transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-red-500/10 active:scale-[0.99] uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isSaving ? (
                                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={18} className="group-hover:scale-110 transition-transform" />
                                                <span>Confirm & Update Password</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
