import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Save,
    Image,
    Layout,
    Phone,
    Mail,
    MapPin,
    Map,
    Clock,
    Globe,
    Info,
    Link as LinkIcon,
    Plus,
    X,
    FileText,
    Edit3
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Settings = () => {
    const companyTitleRef = useRef(null);
    const experienceTitleRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState({
        logo: "",
        footerDescription: "",
        companyLinksTitle: "Company Links",
        experienceLinksTitle: "Experience Links",
        companyLinks: [],
        experienceLinks: [],
        officeAddress: "",
        contactPhone: "",
        contactEmail: "",
        workingHours: "",
        globalPresence: "",
        mapIframe: "",
        footerBgImage: "",
        topBarEmail: "info@ownholidayclub.com",
        topBarPhone: "+91 98765 43210",
        topBarMarquee: [],
        footerContact: [],
        membershipQuoteTitle: "",
        membershipQuoteMain: "",
        membershipQuoteDescription: "",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/settings');
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            Swal.fire('Error', 'Failed to fetch website settings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.put('/api/settings', settings);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Settings Saved',
                    text: 'Website configuration has been updated successfully',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-none border-2 border-gray-100 shadow-xl' }
                });
            }
        } catch (error) {
            console.error('Save failed:', error);
            Swal.fire('Error', 'Failed to save settings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const addLink = (type) => {
        const newLinks = [...settings[type], { label: "", path: "" }];
        setSettings({ ...settings, [type]: newLinks });
    };

    const updateLink = (type, index, field, val) => {
        const newLinks = [...settings[type]];
        newLinks[index][field] = val;
        setSettings({ ...settings, [type]: newLinks });
    };

    const removeLink = (type, index) => {
        const newLinks = settings[type].filter((_, i) => i !== index);
        setSettings({ ...settings, [type]: newLinks });
    };

    const updateMarqueeItem = (index, val) => {
        const newMarquee = [...settings.topBarMarquee];
        newMarquee[index] = val;
        setSettings({ ...settings, topBarMarquee: newMarquee });
    };

    const addMarqueeItem = () => {
        setSettings({ ...settings, topBarMarquee: [...settings.topBarMarquee, ""] });
    };

    const removeMarqueeItem = (index) => {
        const newMarquee = settings.topBarMarquee.filter((_, i) => i !== index);
        setSettings({ ...settings, topBarMarquee: newMarquee });
    };

    const addFooterContact = () => {
        setSettings({ ...settings, footerContact: [...settings.footerContact, { label: "", content: "" }] });
    };

    const updateFooterContact = (index, field, val) => {
        const newContact = [...settings.footerContact];
        newContact[index][field] = val;
        setSettings({ ...settings, footerContact: newContact });
    };

    const removeFooterContact = (index) => {
        const newContact = settings.footerContact.filter((_, i) => i !== index);
        setSettings({ ...settings, footerContact: newContact });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFooterBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, footerBgImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full pb-20">
            <div className="space-y-6 bg-white p-8 border-2 border-gray-200 mt-6 rounded-none shadow-md">
                <PageHeader
                    title="WEBSITE GLOBAL SETTINGS"
                    description="Manage your website logo, footer content, and global contact information"
                />

                <form onSubmit={handleSave} className="space-y-8">
                    {/* SECTION: BRANDING */}
                    <div className="bg-white border-2 border-gray-100 shadow-sm rounded-none overflow-hidden">
                        <div className="px-6 py-4 bg-[#C8102E] text-white flex items-center gap-2">
                            <Image size={18} className="text-white" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-white">Branding & Identity</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Website Logo</label>
                                <div className="flex flex-col gap-4">
                                    <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                        {settings.logo ? (
                                            <img src={settings.logo} alt="Logo Preview" className="max-h-full max-w-full object-contain p-4" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Logo Uploaded</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-[#C8102E] file:text-white hover:file:bg-[#a00d24] cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Footer Background</label>
                                <div className="flex flex-col gap-4">
                                    <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                        {settings.footerBgImage ? (
                                            <img src={settings.footerBgImage} alt="Footer BG Preview" className="max-h-full max-w-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Default Image</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFooterBgUpload}
                                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-[#C8102E] file:text-white hover:file:bg-[#a00d24] cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Footer Tagline / Description</label>
                                <textarea
                                    value={settings.footerDescription}
                                    onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#C8102E] outline-none text-sm font-medium rounded-none h-32 bg-white transition-all"
                                    placeholder="Enter short description for footer..."
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* SECTION: TOP BAR CONFIGURATION */}
                    <div className="bg-white border-2 border-gray-100 shadow-sm rounded-none overflow-hidden">
                        <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center gap-2">
                            <Globe size={18} className="text-white" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-white">Top Bar Configuration</h2>
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                        <Mail size={14} className="text-[#0f172a]" /> Top Bar Email
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.topBarEmail}
                                        onChange={(e) => setSettings({ ...settings, topBarEmail: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#0f172a] outline-none text-sm font-bold bg-white rounded-none"
                                        placeholder="info@ownholidayclub.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                        <Phone size={14} className="text-[#0f172a]" /> Top Bar Contact
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.topBarPhone}
                                        onChange={(e) => setSettings({ ...settings, topBarPhone: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#0f172a] outline-none text-sm font-bold bg-white rounded-none"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} className="text-[#0f172a]" /> Marquee Announcements
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={addMarqueeItem}
                                        className="text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-3 py-1.5 transition-all text-[#0f172a]"
                                    >
                                        + Add Announcement
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {settings.topBarMarquee.map((text, idx) => (
                                        <div key={idx} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                                            <input
                                                type="text"
                                                value={text}
                                                onChange={(e) => updateMarqueeItem(idx, e.target.value)}
                                                placeholder="Enter marquee text..."
                                                className="flex-1 px-4 py-2 border-2 border-gray-200 focus:border-[#0f172a] outline-none text-xs font-bold bg-white"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeMarqueeItem(idx)} 
                                                className="p-2 text-red-500 hover:bg-red-50"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {settings.topBarMarquee.length === 0 && (
                                        <div className="py-8 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-40">
                                            <Globe size={32} className="text-slate-300 mb-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No announcements active</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: FOOTER CONTACT INFORMATION */}
                    <div className="bg-white border-2 border-gray-100 shadow-sm rounded-none overflow-hidden">
                        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Phone size={18} className="text-white" />
                                <h2 className="text-xs font-bold uppercase tracking-widest text-white">Footer Contact Information</h2>
                            </div>
                            <button 
                                type="button" 
                                onClick={addFooterContact}
                                className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1 transition-all"
                            >
                                + Add Contact Info
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {settings.footerContact.map((contact, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start border-b border-gray-50 pb-4 last:border-0">
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Label (e.g. New Delhi Office)</label>
                                        <input
                                            type="text"
                                            value={contact.label}
                                            onChange={(e) => updateFooterContact(idx, 'label', e.target.value)}
                                            placeholder="Label"
                                            className="w-full px-3 py-2 border-2 border-gray-200 focus:border-slate-800 outline-none text-xs font-bold bg-white"
                                        />
                                    </div>
                                    <div className="flex-1 flex gap-2 items-end">
                                        <div className="flex-1">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Content (e.g. Address or Phone)</label>
                                            <textarea
                                                value={contact.content}
                                                onChange={(e) => updateFooterContact(idx, 'content', e.target.value)}
                                                placeholder="Content"
                                                rows="2"
                                                className="w-full px-3 py-2 border-2 border-gray-200 focus:border-slate-800 outline-none text-xs font-medium bg-white resize-none"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeFooterContact(idx)} className="p-2 text-red-500 hover:bg-red-50 mb-1">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {settings.footerContact.length === 0 && (
                                <p className="text-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-2 border-dashed border-gray-100">No footer contact info added</p>
                            )}
                        </div>
                    </div>

                    {/* SECTION: FOOTER QUICK LINKS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Company Links */}
                        <div className="bg-white border-2 border-gray-100 shadow-sm rounded-none overflow-hidden">
                            <div className="px-6 py-4 bg-[#1e3a8a] text-white flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                    <LinkIcon size={16} />
                                    <div className="relative flex items-center gap-2 w-full">
                                        <input
                                            ref={companyTitleRef}
                                            type="text"
                                            value={settings.companyLinksTitle}
                                            onChange={(e) => setSettings({ ...settings, companyLinksTitle: e.target.value })}
                                            className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 w-full"
                                            placeholder="Company Links Title"
                                        />
                                        <Edit3 
                                            size={12} 
                                            className="text-white cursor-pointer hover:scale-110 transition-transform" 
                                            onClick={() => companyTitleRef.current?.focus()}
                                        />
                                    </div>
                                </div>
                                <button type="button" onClick={() => addLink('companyLinks')} className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1 transition-all whitespace-nowrap ml-4">
                                    + Add Link
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {settings.companyLinks.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => updateLink('companyLinks', idx, 'label', e.target.value)}
                                            placeholder="Label (e.g. About Us)"
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 focus:border-[#1e3a8a] outline-none text-xs font-bold bg-white"
                                        />
                                        <input
                                            type="text"
                                            value={link.path}
                                            onChange={(e) => updateLink('companyLinks', idx, 'path', e.target.value)}
                                            placeholder="Path (e.g. /about)"
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 focus:border-[#1e3a8a] outline-none text-xs font-medium bg-white"
                                        />
                                        <button type="button" onClick={() => removeLink('companyLinks', idx)} className="p-2 text-red-500 hover:bg-red-50">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {settings.companyLinks.length === 0 && (
                                    <p className="text-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-2 border-dashed border-gray-100">No links added</p>
                                )}
                            </div>
                        </div>

                        {/* Experience Links */}
                        <div className="bg-white border-2 border-gray-100 shadow-sm rounded-none overflow-hidden">
                            <div className="px-6 py-4 bg-[#1e3a8a] text-white flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                    <Layout size={16} />
                                    <div className="relative flex items-center gap-2 w-full">
                                        <input
                                            ref={experienceTitleRef}
                                            type="text"
                                            value={settings.experienceLinksTitle}
                                            onChange={(e) => setSettings({ ...settings, experienceLinksTitle: e.target.value })}
                                            className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 w-full"
                                            placeholder="Experience Links Title"
                                        />
                                        <Edit3 
                                            size={12} 
                                            className="text-white cursor-pointer hover:scale-110 transition-transform" 
                                            onClick={() => experienceTitleRef.current?.focus()}
                                        />
                                    </div>
                                </div>
                                <button type="button" onClick={() => addLink('experienceLinks')} className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1 transition-all whitespace-nowrap ml-4">
                                    + Add Link
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {settings.experienceLinks.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => updateLink('experienceLinks', idx, 'label', e.target.value)}
                                            placeholder="Label (e.g. Luxury Resorts)"
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 focus:border-[#1e3a8a] outline-none text-xs font-bold bg-white"
                                        />
                                        <input
                                            type="text"
                                            value={link.path}
                                            onChange={(e) => updateLink('experienceLinks', idx, 'path', e.target.value)}
                                            placeholder="Path (e.g. /destinations)"
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 focus:border-[#1e3a8a] outline-none text-xs font-medium bg-white"
                                        />
                                        <button type="button" onClick={() => removeLink('experienceLinks', idx)} className="p-2 text-red-500 hover:bg-red-50">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {settings.experienceLinks.length === 0 && (
                                    <p className="text-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-2 border-dashed border-gray-100">No links added</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION: CONTACT INFO */}
                    <div className="bg-white border-2 border-gray-100 shadow-sm rounded-none overflow-hidden">
                        <div className="px-6 py-4 bg-orange-600 text-white flex items-center gap-2">
                            <Phone size={18} className="text-white" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-white">Global Contact Information</h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="col-span-full">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                    <MapPin size={14} className="text-orange-600" /> Office Address
                                </label>
                                <textarea
                                    value={settings.officeAddress}
                                    onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-orange-600 outline-none text-sm font-semibold bg-white rounded-none"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                    <Phone size={14} className="text-orange-600" /> Concierge Phone
                                </label>
                                <input
                                    type="text"
                                    value={settings.contactPhone}
                                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-orange-600 outline-none text-sm font-bold bg-white rounded-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                    <Mail size={14} className="text-orange-600" /> Support Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-orange-600 outline-none text-sm font-bold bg-white rounded-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                    <Clock size={14} className="text-orange-600" /> Working Hours
                                </label>
                                <input
                                    type="text"
                                    value={settings.workingHours}
                                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-orange-600 outline-none text-sm font-bold bg-white rounded-none"
                                />
                            </div>
                            <div className="col-span-full lg:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                    <Map size={14} className="text-orange-600" /> Google Maps Iframe (Embed Tag)
                                </label>
                                <textarea
                                    value={settings.mapIframe}
                                    onChange={(e) => setSettings({ ...settings, mapIframe: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-orange-600 outline-none text-[11px] font-mono bg-slate-50 rounded-none h-24"
                                    placeholder='Paste <iframe src="..." ...></iframe> here'
                                />
                                <p className="mt-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest italic">Go to Google Maps → Share → Embed a map → Copy HTML</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: MEMBERSHIP SIGNATURE QUOTE */}
                    <div className="bg-white border-2 border-gray-100 shadow-sm rounded-none overflow-hidden">
                        <div className="px-6 py-4 bg-amber-600 text-white flex items-center gap-2">
                            <FileText size={18} className="text-white" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-white">Membership Page Signature Quote</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quote Title</label>
                                <input
                                    type="text"
                                    value={settings.membershipQuoteTitle || ""}
                                    onChange={(e) => setSettings({ ...settings, membershipQuoteTitle: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-amber-600 outline-none text-sm font-bold bg-white rounded-none"
                                    placeholder="Signature Thought"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quote Main Text</label>
                                <input
                                    type="text"
                                    value={settings.membershipQuoteMain || ""}
                                    onChange={(e) => setSettings({ ...settings, membershipQuoteMain: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-amber-600 outline-none text-sm font-bold bg-white rounded-none"
                                    placeholder="Babumoshai zindagi badi honi chahiye, lambi nahi..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quote Description / Subtext</label>
                                <textarea
                                    value={settings.membershipQuoteDescription || ""}
                                    onChange={(e) => setSettings({ ...settings, membershipQuoteDescription: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 focus:border-amber-600 outline-none text-sm font-medium rounded-none h-24 bg-white transition-all"
                                    placeholder="Surely yes, and to make your life king-size..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-64 py-4 bg-[#C8102E] text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-[#a00d24] transition-all shadow-xl hover:shadow-red-500/20 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={18} /> SAVE ALL SETTINGS
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* HELP INFO */}
                <div className="mt-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Info size={14} /> Global Configuration Info
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Changes saved here will reflect immediately across your entire website including the Navbar logo and the detailed Footer section. 
                        Ensure all links are valid paths (e.g. starting with /) and contact details are accurate for member trust.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
