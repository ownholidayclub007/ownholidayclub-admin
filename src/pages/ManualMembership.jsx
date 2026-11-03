import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import api from "../lib/api";
import PageHeader from "../components/PageHeader";

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const toRupees = (value) => {
  const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

const initialForm = {
  fullName: "",
  email: "",
  mobile: "",
  dob: "",
  gender: "",
  occupation: "",
  maritalStatus: "",
  anniversary: "",
  spouse: {
    name: "",
    dob: "",
    email: "",
    mobile: "",
  },
  idProofType: "Aadhaar Card",
  addressProofType: "",
  documents: {
    profileImage: null,
    idProof: null,
    addressProof: null,
    spouseId: null,
  },
  children: [],
  tierId: "",
  paidAmountRupees: "",
  paymentMethod: "cash",
  razorpayOrderId: "",
  razorpayPaymentId: "",
  paidAt: today(),
  houseNo: "",
  addressLine: "",
  city: "",
  state: "",
  pin: "",
  correspondenceAddress: {
    houseNo: "",
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pin: "",
    phone: "",
  },
  officeAddress: {
    houseNo: "",
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pin: "",
    phone: "",
  },
};

const fieldClass =
  "w-full rounded border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#C8102E]";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600";
const MAX_FILE_SIZE = 1.5 * 1024 * 1024;
const allowedDocumentTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const addressProofOptions = [
  "Aadhaar Card",
  "Passport",
  "Government Employee ID",
  "PAN Card",
  "Driving Licence",
  "Voter ID",
];
const idProofOptions = [
  "Aadhaar Card",
  "PAN Card",
  "Passport",
  "Voter ID",
  "Driving Licence",
];
const optionalAddressFields = [
  ["houseNo", "House / Flat"],
  ["addressLine", "Address"],
  ["city", "City"],
  ["state", "State"],
  ["country", "Country"],
  ["pin", "PIN / Postal code"],
  ["phone", "Phone"],
];

export default function ManualMembership() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [tiers, setTiers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/membership/tiers")
      .then(({ data }) => setTiers(data.tiers || []))
      .catch((error) => {
        console.error("Could not load membership plans:", error);
        Swal.fire("Error", "Could not load membership plans.", "error");
      });
  }, []);

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.id === form.tierId),
    [tiers, form.tierId],
  );

  const updateField = (field, value) => {
    setForm((current) => {
      if (field === "maritalStatus" && value === "Single") {
        return {
          ...current,
          maritalStatus: value,
          anniversary: "",
          spouse: initialForm.spouse,
          documents: { ...current.documents, spouseId: null },
          children: [],
        };
      }
      return { ...current, [field]: value };
    });
  };

  const updateSpouse = (field, value) => {
    setForm((current) => ({
      ...current,
      spouse: { ...current.spouse, [field]: value },
    }));
  };

  const updateAddress = (addressType, field, value) => {
    setForm((current) => ({
      ...current,
      [addressType]: { ...current[addressType], [field]: value },
    }));
  };

  const updateChild = (index, field, value) => {
    setForm((current) => ({
      ...current,
      children: current.children.map((child, childIndex) =>
        childIndex === index ? { ...child, [field]: value } : child,
      ),
    }));
  };

  const handleFile = (documentType, file) => {
    if (!file) return;
    if (!allowedDocumentTypes.has(file.type)) {
      Swal.fire("Unsupported file", "Upload a PDF, JPEG, PNG, or WebP file.", "warning");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      Swal.fire("File is too large", "Each document must be 1.5 MB or smaller.", "warning");
      return;
    }
    setForm((current) => ({
      ...current,
      documents: { ...current.documents, [documentType]: file },
    }));
  };

  const toBase64Document = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: String(reader.result || ""),
      });
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(file);
    });

  const addChild = () => {
    setForm((current) => ({
      ...current,
      children: [...current.children, { name: "", dob: "", gender: "" }],
    }));
  };

  const removeChild = (index) => {
    setForm((current) => ({
      ...current,
      children: current.children.filter((_, childIndex) => childIndex !== index),
    }));
  };

  const handleTierChange = (tierId) => {
    const tier = tiers.find((item) => item.id === tierId);
    const defaultAmount = tier ? toRupees(tier.price) + toRupees(tier.adminFee) : "";
    setForm((current) => ({
      ...current,
      tierId,
      paidAmountRupees: defaultAmount ? String(defaultAmount) : "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const documents = {};
      for (const [documentType, file] of Object.entries(form.documents)) {
        if (file) documents[documentType] = await toBase64Document(file);
      }

      const { data } = await api.post("/api/members/manual-memberships", {
        fullName: form.fullName,
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.replace(/\D/g, ""),
        dob: form.dob,
        gender: form.gender,
        occupation: form.occupation.trim(),
        maritalStatus: form.maritalStatus,
        anniversary: form.maritalStatus === "Single" ? "" : form.anniversary,
        spouse: form.maritalStatus === "Single"
          ? { name: "", dob: "", email: "", mobile: "" }
          : {
              ...form.spouse,
              email: form.spouse.email.trim().toLowerCase(),
              mobile: form.spouse.mobile.replace(/\D/g, ""),
            },
        familyMembers: form.maritalStatus === "Single" ? [] : form.children
          .map((child) => ({ ...child, name: child.name.trim() }))
          .filter((child) => child.name || child.dob || child.gender),
        tierId: form.tierId,
        paidAmountRupees: Number(form.paidAmountRupees),
        paymentMethod: form.paymentMethod,
        razorpayOrderId: form.razorpayOrderId.trim(),
        razorpayPaymentId: form.razorpayPaymentId.trim(),
        paidAt: form.paidAt,
        city: form.city.trim(),
        state: form.state.trim(),
        residenceAddress: {
          houseNo: form.houseNo.trim(),
          addressLine: form.addressLine.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: "India",
          phone: form.mobile.replace(/\D/g, ""),
          pin: form.pin.trim(),
        },
        correspondenceAddress: form.correspondenceAddress,
        officeAddress: form.officeAddress,
        documents: {
          ...documents,
          idProofType: form.idProofType,
          addressProofType: form.addressProofType,
        },
      });
      if (data.emailSent) {
        await Swal.fire("Membership created", data.message, "success");
      } else {
        await Swal.fire("Membership created; email not sent", data.emailError || data.message, "warning");
      }
      navigate(`/member-profile/${data.userId}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "";
      if (errorMessage.includes("MEMBER_DOCUMENTS_ENCRYPTION_KEY")) {
        Swal.fire(
          "Document encryption is not configured",
          "The membership and selected files were not saved. Configure MEMBER_DOCUMENTS_ENCRYPTION_KEY in the backend environment, then submit again. To continue without files, remove the selected documents and resubmit.",
          "error",
        );
        return;
      }
      Swal.fire(
        "Could not create membership",
        errorMessage || "Please check the details and retry.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderOptionalAddress = (addressType, title) => (
    <section className="space-y-4 rounded border border-slate-200 p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-[#C8102E]">{title} (Optional)</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {optionalAddressFields.map(([field, label]) => (
          <label key={field}>
            <span className={labelClass}>{label}</span>
            <input
              className={fieldClass}
              type={field === "phone" || field === "pin" ? "tel" : "text"}
              inputMode={field === "phone" || field === "pin" ? "numeric" : undefined}
              value={form[addressType][field]}
              onChange={(event) => updateAddress(addressType, field, event.target.value)}
            />
          </label>
        ))}
      </div>
    </section>
  );

  const renderDocument = (documentType, title, accept = ".pdf,image/jpeg,image/png,image/webp") => (
    <div className="rounded border border-slate-200 p-3">
      <label className="block">
        <span className={labelClass}>{title} (optional)</span>
        <input
          className="w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold"
          type="file"
          accept={accept}
          onChange={(event) => handleFile(documentType, event.target.files?.[0])}
        />
        <span className="mt-1 block text-xs text-slate-500">
          {form.documents[documentType]?.name || "PDF, JPEG, PNG, or WebP · max 1.5 MB"}
        </span>
      </label>
      {form.documents[documentType] && (
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-rose-700 hover:underline"
          onClick={() => setForm((current) => ({
            ...current,
            documents: { ...current.documents, [documentType]: null },
          }))}
        >
          Remove selected file
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <div className="mt-6 space-y-6 border-2 border-gray-200 bg-white p-5 shadow-md sm:p-8">
        <PageHeader
          title="Manual Membership"
          description="Add the member, record their payment, and send the invoice."
        />
        <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <ShieldCheck className="mt-0.5 shrink-0" size={18} />
          <p>No OTP or email verification is used. No documents are collected and no Razorpay checkout is used.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#C8102E]">Member Details</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className={labelClass}>Full name</span>
                <input className={fieldClass} value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} required minLength={2} />
              </label>
              <label>
                <span className={labelClass}>Email address</span>
                <input className={fieldClass} type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
              </label>
              <label>
                <span className={labelClass}>Mobile number</span>
                <input className={fieldClass} type="tel" inputMode="numeric" value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} required />
              </label>
              <label>
                <span className={labelClass}>Date of birth (optional)</span>
                <input className={fieldClass} type="date" max={today()} value={form.dob} onChange={(e) => updateField("dob", e.target.value)} />
              </label>
              <label>
                <span className={labelClass}>Gender (optional)</span>
                <select className={fieldClass} value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                <span className={labelClass}>Occupation (optional)</span>
                <input className={fieldClass} value={form.occupation} onChange={(e) => updateField("occupation", e.target.value)} />
              </label>
              <label>
                <span className={labelClass}>Marital status (optional)</span>
                <select className={fieldClass} value={form.maritalStatus} onChange={(e) => updateField("maritalStatus", e.target.value)}>
                  <option value="">Select marital status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Separated">Separated</option>
                </select>
              </label>
              {(form.maritalStatus === "Married" || form.maritalStatus === "Separated") && (
                <>
                  <label>
                    <span className={labelClass}>Anniversary date (optional)</span>
                    <input className={fieldClass} type="date" value={form.anniversary} onChange={(e) => updateField("anniversary", e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>Spouse name (optional)</span>
                    <input className={fieldClass} value={form.spouse.name} onChange={(e) => updateSpouse("name", e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>Spouse date of birth (optional)</span>
                    <input className={fieldClass} type="date" max={today()} value={form.spouse.dob} onChange={(e) => updateSpouse("dob", e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>Spouse email (optional)</span>
                    <input className={fieldClass} type="email" value={form.spouse.email} onChange={(e) => updateSpouse("email", e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>Spouse mobile (optional)</span>
                    <input className={fieldClass} type="tel" inputMode="numeric" value={form.spouse.mobile} onChange={(e) => updateSpouse("mobile", e.target.value)} />
                  </label>
                </>
              )}
              <label className="md:col-span-2 lg:col-span-3">
                <span className={labelClass}>House / Flat number (optional)</span>
                <input className={fieldClass} value={form.houseNo} onChange={(e) => updateField("houseNo", e.target.value)} />
              </label>
              <label className="md:col-span-2 lg:col-span-3">
                <span className={labelClass}>Permanent address</span>
                <input className={fieldClass} value={form.addressLine} onChange={(e) => updateField("addressLine", e.target.value)} required />
              </label>
              <label>
                <span className={labelClass}>City</span>
                <input className={fieldClass} value={form.city} onChange={(e) => updateField("city", e.target.value)} required />
              </label>
              <label>
                <span className={labelClass}>State</span>
                <input className={fieldClass} value={form.state} onChange={(e) => updateField("state", e.target.value)} required />
              </label>
              <label>
                <span className={labelClass}>PIN / Postal code</span>
                <input className={fieldClass} inputMode="numeric" value={form.pin} onChange={(e) => updateField("pin", e.target.value)} required />
              </label>
            </div>
          </section>

          {form.maritalStatus !== "Single" && (
            <section className="space-y-4 rounded border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#C8102E]">Children (Optional)</h3>
                <button type="button" onClick={addChild} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Add child
                </button>
              </div>
              {form.children.length === 0 && <p className="text-sm text-slate-500">No children added.</p>}
              <div className="space-y-3">
                {form.children.map((child, index) => (
                  <div key={index} className="grid gap-3 md:grid-cols-4">
                    <label>
                      <span className={labelClass}>Child {index + 1} name (optional)</span>
                      <input className={fieldClass} value={child.name} onChange={(e) => updateChild(index, "name", e.target.value)} />
                    </label>
                    <label>
                      <span className={labelClass}>Date of birth (optional)</span>
                      <input className={fieldClass} type="date" max={today()} value={child.dob} onChange={(e) => updateChild(index, "dob", e.target.value)} />
                    </label>
                    <label>
                      <span className={labelClass}>Gender (optional)</span>
                      <select className={fieldClass} value={child.gender} onChange={(e) => updateChild(index, "gender", e.target.value)}>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <div className="flex items-end">
                      <button type="button" onClick={() => removeChild(index)} className="mb-0.5 rounded border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {renderOptionalAddress("correspondenceAddress", "Correspondence address")}
          {renderOptionalAddress("officeAddress", "Office address")}

          <section className="space-y-4 rounded border border-slate-200 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#C8102E]">Documents (Optional)</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {renderDocument("profileImage", "Profile image", "image/jpeg,image/png,image/webp")}
              <div className="rounded border border-slate-200 p-3">
                <label>
                  <span className={labelClass}>ID proof type (optional)</span>
                  <select
                    className={fieldClass}
                    value={form.idProofType}
                    onChange={(event) => updateField("idProofType", event.target.value)}
                  >
                    {idProofOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                {renderDocument("idProof", "ID proof")}
              </div>
              <div className="rounded border border-slate-200 p-3">
                <label>
                  <span className={labelClass}>Address proof type (optional)</span>
                  <select
                    className={fieldClass}
                    value={form.addressProofType}
                    onChange={(event) => updateField("addressProofType", event.target.value)}
                  >
                    <option value="">Select proof type</option>
                    {addressProofOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                {renderDocument("addressProof", "Address proof")}
              </div>
              {(form.maritalStatus === "Married" || form.maritalStatus === "Separated") &&
                renderDocument("spouseId", "Spouse ID")}
            </div>
            <p className="text-xs text-slate-500">Files are optional and encrypted before they are stored. The backend encryption key must be configured to save uploaded files.</p>
          </section>

          <section className="space-y-4 rounded border border-slate-200 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#C8102E]">Membership & Payment</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className={labelClass}>Membership plan</span>
                <select className={fieldClass} value={form.tierId} onChange={(e) => handleTierChange(e.target.value)} required>
                  <option value="">Select a plan</option>
                  {tiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.name} — {tier.price} ({tier.period})</option>)}
                </select>
              </label>
              <label><span className={labelClass}>Payment amount (₹)</span><input className={fieldClass} type="number" min="1" step="0.01" value={form.paidAmountRupees} onChange={(e) => updateField("paidAmountRupees", e.target.value)} required /></label>
              <label><span className={labelClass}>Payment method</span><select className={fieldClass} value={form.paymentMethod} onChange={(e) => updateField("paymentMethod", e.target.value)} required><option value="cash">Cash</option><option value="bank transfer">Bank transfer</option><option value="upi">UPI</option><option value="cheque">Cheque</option><option value="card">Card</option><option value="other">Other</option></select></label>
              <label><span className={labelClass}>Payment date</span><input className={fieldClass} type="date" max={today()} value={form.paidAt} onChange={(e) => updateField("paidAt", e.target.value)} required /></label>
              <label className="md:col-span-2"><span className={labelClass}>Razorpay Order ID <span className="font-normal normal-case">(optional)</span></span><input className={fieldClass} value={form.razorpayOrderId} onChange={(e) => updateField("razorpayOrderId", e.target.value)} placeholder="order_..." /></label>
              <label className="md:col-span-2"><span className={labelClass}>Razorpay Payment ID <span className="font-normal normal-case">(optional)</span></span><input className={fieldClass} value={form.razorpayPaymentId} onChange={(e) => updateField("razorpayPaymentId", e.target.value)} placeholder="pay_..." /></label>
            </div>
          </section>

          {selectedTier && <p className="text-sm text-slate-500">Selected plan: <strong>{selectedTier.name}</strong>. The invoice is sent as a PDF attachment.</p>}
          <div className="flex justify-end border-t border-slate-200 pt-5">
            <button type="submit" disabled={saving} className="bg-[#C8102E] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#a00d24] disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Saving membership..." : "Record Payment & Send Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
