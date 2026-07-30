import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Trash2,
    Plus,
    Type,
    Save,
    Edit,
    Star,
    Crown,
    Sparkles,
    Gem,
    CreditCard,
    CheckCircle,
    X,
    Info,
    CheckCircle2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ICON_OPTIONS = [
    { value: "star", label: "Star", icon: Star },
    { value: "crown", label: "Crown", icon: Crown },
    { value: "sparkles", label: "Sparkles", icon: Sparkles },
    { value: "gem", label: "Gem", icon: Gem },
];

const getBaseYears = (period) =>
    Number(String(period || "").match(/(\d+)/)?.[1] || 0);

const formatPeriodLabel = (period) => {
    const years = getBaseYears(period);
    return years > 0 ? `${years} YEARS ACCESS` : "";
};

const DEFAULT_PLAN = {
    name: "",
    price: "",
    priceType: "regular",
    actuallyPrice: "",
    adminFee: "Rs3,789",
    bonusYears: 0,
    period: "",
    description: "",
    features: ["", ""],
    icon: "star",
    buttonText: "",
    popular: false,
    invoiceTerms: ["", "", "", ""],
};

const ManageMembership = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // ID of the plan being edited
    const [planForm, setPlanForm] = useState(DEFAULT_PLAN);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/membership/tiers');
            setPlans(response.data.tiers || []);
        } catch (error) {
            console.error('Error fetching membership plans:', error);
            Swal.fire('Error', 'Failed to fetch membership plans', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePlans = async (updatedPlans, successMsg) => {
        setIsLoading(true);
        try {
            const response = await api.put('/api/membership/tiers', { tiers: updatedPlans });
            if (response.data) {
                setPlans(response.data.tiers || []);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: successMsg,
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-none border-2 border-gray-100 shadow-xl' }
                });
                resetForm();
            }
        } catch (error) {
            console.error('Save failed:', error);
            Swal.fire('Error', 'Failed to save membership plans', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!planForm.name || !planForm.price || !planForm.period) {
            Swal.fire('Warning', 'Name, Price and Period are required', 'warning');
            return;
        }

        const planToSave = {
            ...planForm,
            features: planForm.features.filter(f => f.trim() !== ""),
        };

        let updatedPlans;
        if (isEditing) {
            updatedPlans = plans.map(p => p.id === isEditing ? planToSave : p);
        } else {
            updatedPlans = [planToSave, ...plans];
        }

        await handleSavePlans(updatedPlans, isEditing ? 'Plan updated successfully' : 'Plan added successfully');
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Plan?',
            text: "This action cannot be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete',
            customClass: { popup: 'rounded-none' }
        });

        if (result.isConfirmed) {
            const updatedPlans = plans.filter(p => p.id !== id);
            await handleSavePlans(updatedPlans, 'Plan deleted successfully');
        }
    };

    const startEdit = (plan) => {
        setIsEditing(plan.id);
        setPlanForm({
            ...plan,
            priceType: plan.priceType || 'regular',
            actuallyPrice: plan.actuallyPrice || '',
            features: plan.features.length >= 2 ? plan.features : [...plan.features, ...Array(2 - plan.features.length).fill("")],
            invoiceTerms: plan.invoiceTerms?.length === 4 ? plan.invoiceTerms : ["", "", "", ""]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setPlanForm(DEFAULT_PLAN);
    };

    const addFeature = () => {
        setPlanForm({ ...planForm, features: [...planForm.features, ""] });
    };

    const updateFeature = (index, val) => {
        const newFeatures = [...planForm.features];
        newFeatures[index] = val;
        setPlanForm({ ...planForm, features: newFeatures });
    };

    const removeFeature = (index) => {
        setPlanForm({ ...planForm, features: planForm.features.filter((_, i) => i !== index) });
    };

    const updateInvoiceTerm = (index, val) => {
        const newTerms = [...planForm.invoiceTerms];
        newTerms[index] = val;
        setPlanForm({ ...planForm, invoiceTerms: newTerms });
    };

    return (
        <div className="w-full">
            <div className="space-y-6 bg-white p-8 border-2 border-gray-200 mt-6 rounded-none shadow-md">
                <PageHeader
                    title="MEMBERSHIP PLANS MANAGEMENT"
                    description="Configure and manage OHC membership tiers and pricing"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Section: Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-none">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#C8102E]">
                                {isEditing ? <Edit size={20} /> : <Plus size={20} />}
                                {isEditing ? 'EDIT MEMBERSHIP PLAN' : 'ADD NEW PLAN'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    {/* Basic Info */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan Name</label>
                                        <input
                                            type="text"
                                            value={planForm.name}
                                            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                            placeholder="e.g. OHC Privilege"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price Type</label>
                                        <select
                                            value={planForm.priceType || 'regular'}
                                            onChange={(e) => setPlanForm({ ...planForm, priceType: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                        >
                                            <option value="regular">Regular Price</option>
                                            <option value="offer">Offer / Discounted Price</option>
                                        </select>
                                    </div>

                                    {planForm.priceType !== 'offer' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                                                <input
                                                    type="text"
                                                    value={planForm.price}
                                                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                                    placeholder="Rs50,000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Fee</label>
                                                <input
                                                    type="text"
                                                    value={planForm.adminFee}
                                                    onChange={(e) => setPlanForm({ ...planForm, adminFee: e.target.value })}
                                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-red-500 uppercase mb-1">Original Price (Strike)</label>
                                                    <input
                                                        type="text"
                                                        value={planForm.actuallyPrice}
                                                        onChange={(e) => setPlanForm({ ...planForm, actuallyPrice: e.target.value })}
                                                        className="w-full px-3 py-2 border-2 border-red-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                                        placeholder="e.g. Rs80,000"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">Offer Price</label>
                                                    <input
                                                        type="text"
                                                        value={planForm.price}
                                                        onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                                                        className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                                        placeholder="e.g. Rs50,000"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Fee</label>
                                                <input
                                                    type="text"
                                                    value={planForm.adminFee}
                                                    onChange={(e) => setPlanForm({ ...planForm, adminFee: e.target.value })}
                                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Base Period (Years)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={getBaseYears(planForm.period) || ""}
                                                onChange={(e) => setPlanForm({ ...planForm, period: formatPeriodLabel(e.target.value) })}
                                                className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                                placeholder="e.g. 5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bonus Years</label>
                                            <input
                                                type="number"
                                                value={planForm.bonusYears}
                                                onChange={(e) => setPlanForm({ ...planForm, bonusYears: parseInt(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Description</label>
                                        <textarea
                                            value={planForm.description}
                                            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm rounded-none bg-white transition-all"
                                            rows="2"
                                            placeholder="Special introductory offer..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon</label>
                                            <select
                                                value={planForm.icon}
                                                onChange={(e) => setPlanForm({ ...planForm, icon: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                            >
                                                {ICON_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Text</label>
                                            <input
                                                type="text"
                                                value={planForm.buttonText}
                                                onChange={(e) => setPlanForm({ ...planForm, buttonText: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-semibold rounded-none bg-white transition-all"
                                                placeholder="BUY NOW"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100">
                                        <input
                                            type="checkbox"
                                            id="popular-check"
                                            checked={planForm.popular}
                                            onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                                            className="w-4 h-4 text-[#C8102E] border-gray-300 rounded focus:ring-[#C8102E]"
                                        />
                                        <label htmlFor="popular-check" className="text-xs font-bold uppercase text-orange-500 cursor-pointer">
                                            Mark as Most Popular
                                        </label>
                                    </div>

                                    {/* Dynamic Features */}
                                    <div className="pt-4 border-t-2 border-gray-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-bold text-gray-500 uppercase">
                                                Key Features
                                                <span className="block mt-1 text-[10px] text-red-500 font-normal normal-case">First 2 features determine holiday lengths (e.g. "3 Nights / 4 Days for 3 Years")</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addFeature}
                                                className="text-[10px] font-bold text-[#C8102E] uppercase tracking-widest hover:underline"
                                            >
                                                + Add Feature
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {planForm.features.map((feature, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={feature}
                                                        onChange={(e) => updateFeature(idx, e.target.value)}
                                                        className="flex-1 px-3 py-1.5 border-2 border-gray-300 rounded-none focus:border-[#C8102E] outline-none text-sm font-medium bg-white transition-all"
                                                        placeholder={
                                                            idx === 0 ? "e.g. 3 Nights / 4 Days for 3 Years (Required)" :
                                                            idx === 1 ? "e.g. 4 Nights / 5 Days for 2 Years (Required)" :
                                                            "Feature description..."
                                                        }
                                                        required={idx === 0 || idx === 1}
                                                    />
                                                    {planForm.features.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFeature(idx)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Invoice Terms */}
                                    <div className="pt-4 border-t-2 border-gray-50">
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Invoice Terms (Optional)</label>
                                        <div className="space-y-2">
                                            {planForm.invoiceTerms.map((term, idx) => (
                                                <input
                                                    key={idx}
                                                    type="text"
                                                    value={term}
                                                    onChange={(e) => updateInvoiceTerm(idx, e.target.value)}
                                                    className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-none focus:border-[#C8102E] outline-none text-sm font-medium bg-white transition-all"
                                                    placeholder={`Term Line ${idx + 1}...`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6 border-t-2 border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-3 bg-[#C8102E] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#a00d24] transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} /> {isEditing ? 'Update Plan' : 'Create Plan'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Section: Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border-2 border-gray-200 shadow-lg rounded-none overflow-hidden">
                            <div className="px-6 py-4 border-b-2 border-red-700 bg-[#C8102E]">
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <CreditCard size={18} className="text-white" />
                                    EXISTING MEMBERSHIP PLANS
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white text-gray-900 text-[11px] font-bold uppercase tracking-wider border-b-2 border-gray-100">
                                            <th className="px-6 py-4">No.</th>
                                            <th className="px-6 py-4">Icon</th>
                                            <th className="px-6 py-4">Tier Name</th>
                                            <th className="px-6 py-4">Price / Period</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {isLoading && plans.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-8 h-8 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fetching Plans...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : plans.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                                                    No membership plans found.
                                                </td>
                                            </tr>
                                        ) : (
                                            plans.map((plan, index) => {
                                                const IconComp = ICON_OPTIONS.find(o => o.value === plan.icon)?.icon || Star;
                                                return (
                                                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-bold text-[#C8102E]">
                                                                {String(index + 1).padStart(2, '0')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="w-10 h-10 bg-white border-2 border-gray-200 flex items-center justify-center text-[#C8102E] transition-all">
                                                                <IconComp size={20} />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-900 uppercase">
                                                                    {plan.name}
                                                                </span>
                                                                {plan.popular && (
                                                                    <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                                                                        <Sparkles size={10} /> POPULAR
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                {plan.priceType === 'offer' && plan.actuallyPrice ? (
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="text-xs font-semibold text-red-500 line-through tracking-tight">{plan.actuallyPrice}</span>
                                                                        <span className="text-sm font-bold text-emerald-600 tracking-tight">{plan.price}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm font-bold text-gray-900 tracking-tight">{plan.price}</span>
                                                                )}
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                                                    {plan.period}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center gap-3">
                                                                <button
                                                                    onClick={() => startEdit(plan)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                                                                    title="Edit Plan"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(plan.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                                                                    title="Delete Plan"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Features Summary Card */}
                        {isEditing && (
                            <div className="mt-8 bg-slate-50 p-6 border-2 border-dashed border-slate-200">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Info size={14} /> LIVE PREVIEW CONTENT
                                </h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Features:</p>
                                        <ul className="space-y-2">
                                            {planForm.features.filter(f => f.trim()).map((f, i) => (
                                                <li key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                                                    <CheckCircle2 size={14} className="text-green-500" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Invoice Terms Preview:</p>
                                        <div className="p-4 bg-white border border-slate-100 shadow-sm text-[10px] text-slate-600 leading-relaxed italic">
                                            {planForm.invoiceTerms.filter(t => t.trim()).map((t, i) => (
                                                <div key={i}>• {t}</div>
                                            )) || "Standard terms will be used."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageMembership;
