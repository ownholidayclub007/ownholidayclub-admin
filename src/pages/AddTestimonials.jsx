import { useState } from "react";
import { Image as ImageIcon, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../lib/api";
import PageHeader from "../components/PageHeader";

const initialForm = {
  tag: "",
  quote: "",
  name: "",
  location: "",
  rating: 5,
  image: "",
  order: 0,
  isActive: true,
};

export default function AddTestimonials() {
  const navigate = useNavigate();
  const [initialEdit] = useState(() => {
    const saved = localStorage.getItem("editTestimonial");
    if (!saved) return null;
    localStorage.removeItem("editTestimonial");
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [form, setForm] = useState(() => ({ ...initialForm, ...(initialEdit || {}) }));
  const [editId] = useState(initialEdit?._id || null);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const uploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setIsLoading(true);
        const response = await api.post("/api/testimonials/images", {
          file: { name: file.name, type: file.type, size: file.size, dataUrl: reader.result },
        });
        setForm((current) => ({ ...current, image: response.data.data.url }));
      } catch (error) {
        Swal.fire("Error", error.response?.data?.message || "Failed to upload image", "error");
      } finally {
        setIsLoading(false);
        event.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.tag.trim() || !form.quote.trim() || !form.name.trim() || !form.location.trim()) {
      Swal.fire("Missing fields", "Tag, quote, name and location are required.", "warning");
      return;
    }
    try {
      setIsLoading(true);
      const response = editId
        ? await api.put(`/api/testimonials/${editId}`, form)
        : await api.post("/api/testimonials", form);
      if (response.data.success) {
        await Swal.fire({ icon: "success", title: editId ? "Updated" : "Saved", text: "Testimonial saved successfully", timer: 1300, showConfirmButton: false });
        navigate("/testimonials-list");
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to save testimonial", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader title={editId ? "Edit Testimonial" : "Add Testimonial"} description="Manage the stories shown in Real Stories, Real Journeys." />
      <form onSubmit={submit} className="max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            ["tag", "Tag / Category", "Family Travel"],
            ["name", "Traveller name", "Neha Arora"],
            ["location", "Location", "Delhi"],
          ].map(([name, label, placeholder]) => (
            <label key={name} className="block text-sm font-semibold text-gray-700">
              {label}
              <input name={name} value={form[name]} onChange={updateField} placeholder={placeholder} className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#C8102E]" />
            </label>
          ))}
          <label className="block text-sm font-semibold text-gray-700">
            Rating
            <select name="rating" value={form.rating} onChange={updateField} className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#C8102E]">
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold text-gray-700">
          Testimonial quote
          <textarea name="quote" value={form.quote} onChange={updateField} rows={5} placeholder="Every trip used to feel overwhelming..." className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#C8102E]" />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          <label className="block text-sm font-semibold text-gray-700">
            Traveller image <span className="font-normal text-gray-400">(optional)</span>
            <div className="mt-2 border-2 border-dashed border-gray-300 p-5 text-center">
              {form.image ? <img src={form.image} alt="Traveller preview" className="mx-auto h-24 w-24 rounded-full object-cover" /> : <ImageIcon className="mx-auto text-gray-400" size={30} />}
              <input type="file" accept="image/*" onChange={uploadImage} className="mt-3 w-full text-xs" />
            </div>
          </label>
          <div className="space-y-5">
            <label className="block text-sm font-semibold text-gray-700">
              Display order
              <input type="number" name="order" min="0" value={form.order} onChange={updateField} className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#C8102E]" />
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={updateField} className="h-4 w-4 accent-[#C8102E]" />
              Show on website
            </label>
          </div>
        </div>
        <div className="flex gap-3">
          <button disabled={isLoading} className="flex items-center gap-2 bg-[#C8102E] text-white px-6 py-3 uppercase tracking-wider text-sm font-bold disabled:opacity-60"><Save size={17} /> {isLoading ? "Saving..." : editId ? "Update testimonial" : "Save testimonial"}</button>
          <button type="button" onClick={() => navigate("/testimonials-list")} className="border border-gray-300 px-6 py-3 text-sm font-bold uppercase tracking-wider">Cancel</button>
        </div>
      </form>
    </div>
  );
}
