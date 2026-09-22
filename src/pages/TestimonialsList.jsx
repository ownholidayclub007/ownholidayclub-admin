import { useEffect, useState } from "react";
import { Edit, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../lib/api";
import PageHeader from "../components/PageHeader";

export default function TestimonialsList() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/testimonials/admin");
      setTestimonials(response.data.data || []);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to load testimonials", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.get("/api/testimonials/admin")
      .then((response) => {
        if (isMounted) setTestimonials(response.data.data || []);
      })
      .catch((error) => {
        if (isMounted) Swal.fire("Error", error.response?.data?.message || "Failed to load testimonials", "error");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const remove = async (testimonial) => {
    const result = await Swal.fire({ title: "Delete testimonial?", text: `Remove ${testimonial.name}'s testimonial?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#C8102E", confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/api/testimonials/${testimonial._id}`);
      loadTestimonials();
      Swal.fire({ icon: "success", title: "Deleted", timer: 1000, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to delete testimonial", "error");
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader title="Testimonials List" description="Review and manage the testimonials displayed on the home page.">
        <button onClick={() => navigate("/add-testimonials")} className="flex items-center gap-2 bg-[#C8102E] text-white px-5 py-3 uppercase tracking-wider text-sm font-bold"><Plus size={17} /> Add testimonial</button>
      </PageHeader>
      {isLoading ? <p className="py-10 text-center text-gray-500">Loading testimonials...</p> : testimonials.length === 0 ? <p className="py-10 text-center text-gray-500">No testimonials added yet.</p> : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {testimonials.map((testimonial) => (
            <article key={testimonial._id} className="border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between gap-4">
                <span className="bg-amber-50 text-amber-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{testimonial.tag}</span>
                <span className={testimonial.isActive ? "text-emerald-600 text-xs font-bold" : "text-gray-400 text-xs font-bold"}>{testimonial.isActive ? "ACTIVE" : "HIDDEN"}</span>
              </div>
              <div className="flex gap-1 mt-4 text-amber-600">{Array.from({ length: testimonial.rating || 5 }, (_, index) => <Star key={index} size={14} fill="currentColor" />)}</div>
              <p className="mt-3 text-gray-600 italic leading-relaxed">“{testimonial.quote}”</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {testimonial.image ? <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-[#0F6E56] text-white flex items-center justify-center font-bold">{testimonial.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>}
                  <div><p className="font-bold text-gray-800">{testimonial.name}</p><p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} /> {testimonial.location}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { localStorage.setItem("editTestimonial", JSON.stringify(testimonial)); navigate("/add-testimonials"); }} className="p-2 text-blue-600 hover:bg-blue-50" title="Edit"><Edit size={17} /></button>
                  <button onClick={() => remove(testimonial)} className="p-2 text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={17} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
