import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft, CheckCircle, XCircle, Printer, AlertCircle, User, Download, FileText
} from "lucide-react";
import api from "../lib/api";
import Swal from "sweetalert2";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const fmtDate = (val) => {
    if (!val) return "—";
    const d = new Date(String(val));
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const safe = (v) => (v != null && String(v).trim() ? String(v) : "—");

const getInitials = (name) =>
    name ? name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

/* ─── Shared cell styles ───────────────────────────────────────────────────── */
const LC = {
    width: "14%",
    padding: "8px 12px",
    fontWeight: 700,
    fontSize: 11,
    color: "#374151",
    background: "#fafafa",
    borderRight: "1px solid #d1d5db",
    whiteSpace: "normal",
    wordBreak: "break-word",
    verticalAlign: "middle",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
};

const VC = {
    padding: "8px 12px",
    fontSize: 12,
    color: "#111827",
    background: "#ffffff",
    verticalAlign: "middle",
    wordBreak: "break-word",
    fontWeight: 500,
};

const VCD = { ...VC, borderRight: "1px solid #d1d5db" };

/* ─── Layout Rows ──────────────────────────────────────────────────────────── */
function TR3({ l1, v1, l2, v2, l3, v3 }) {
    return (
        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
            <td style={LC}>{l1}</td>
            <td style={VCD}>{v1}</td>
            <td style={LC}>{l2}</td>
            <td style={VCD}>{v2}</td>
            <td style={LC}>{l3}</td>
            <td style={VC}>{v3}</td>
        </tr>
    );
}

function TR2({ l1, v1, l2, v2 }) {
    return (
        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
            <td style={LC}>{l1}</td>
            <td colSpan={2} style={VCD}>{v1}</td>
            <td style={LC}>{l2}</td>
            <td colSpan={2} style={VC}>{v2}</td>
        </tr>
    );
}

function TR1({ label, value }) {
    return (
        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
            <td style={LC}>{label}</td>
            <td colSpan={5} style={VC}>{value}</td>
        </tr>
    );
}

/* ─── Section card ─────────────────────────────────────────────────────────── */
function Section({ title, children, className = "" }) {
    return (
        <div className={`print-section ${className}`.trim()} style={{ marginBottom: 32 }}>
            <div style={{
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10
            }}>
                <div style={{ width: 4, height: 18, background: "#C8102E", borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontWeight: 800, fontSize: 13, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {title}
                </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db", tableLayout: "fixed" }}>
                <colgroup>
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "19.333%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "19.333%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "19.333%" }} />
                </colgroup>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

const MemberProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchMemberDetails();
    }, [id]);

    const fetchMemberDetails = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/members/${id}`);
            setMember(response.data.member);
        } catch (error) {
            console.error("Error fetching member:", error);
            Swal.fire({ icon: "error", title: "Error", text: "Failed to load member profile" });
            navigate("/members-list");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#0f2d52] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!member) return null;

    const name = safe(member.name);
    const membershipId = safe(member.membershipId);

    return (
        <div className="print-bg-white" style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Inter', sans-serif" }}>
            
            {/* ══ TOP NAV BAR (Navy Blue) ══ */}
            <div className="no-print relative z-[30]" style={{ background: "#0f2d52", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => navigate(-1)} style={{ color: "white", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13 }}>
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                    <span style={{ opacity: 0.3 }}>/</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Members Management</span>
                    <span style={{ opacity: 0.3 }}>/</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{name}</span>
                        {(() => {
                            const payment = member.payments && member.payments.length > 0 ? member.payments[0] : null;
                            const status = payment?.status?.toLowerCase() || "pending";
                            let displayStatus = "PAYMENT PENDING";
                            let color = "#F59E0B"; // Yellow

                            if (status === "captured") {
                                displayStatus = "PAYMENT COMPLETE";
                                color = "#10B981"; // Green
                            } else if (status === "failed" || status === "rejected") {
                                displayStatus = "PAYMENT REJECTED";
                                color = "#EF4444"; // Red
                            }

                            return (
                                <span style={{ 
                                    background: color, 
                                    color: "white", 
                                    fontSize: "10px", 
                                    fontWeight: 800, 
                                    padding: "2px 8px", 
                                    borderRadius: "4px",
                                    letterSpacing: "0.05em",
                                    marginLeft: "4px"
                                }}>
                                    {displayStatus}
                                </span>
                            );
                        })()}
                    </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => window.print()} style={{ background: "white", color: "#0f2d52", border: "none", padding: "6px 16px", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        <Printer size={14} /> PRINT PROFILE
                    </button>
                </div>
            </div>

            {/* ══ MAIN PROFILE BODY ══ */}
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px" }}>
                <div style={{ background: "white", padding: "32px", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                    
                    {/* ── MEMBER OVERVIEW ────────────────────────────────── */}
                    <Section title="Member Overview">
                        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                            <td style={LC}>Full Name</td>
                            <td style={{ ...VCD, fontWeight: 700, color: "#C8102E", fontSize: 14 }}>{name}</td>
                            <td style={LC}>Payment Status</td>
                            <td style={VCD}>
                                {(() => {
                                    const payment = member.payments && member.payments.length > 0 ? member.payments[0] : null;
                                    const status = payment?.status?.toLowerCase() || "pending";
                                    let displayStatus = "PENDING";
                                    let color = "#F59E0B";

                                    if (status === "captured") {
                                        displayStatus = "COMPLETE";
                                        color = "#10B981";
                                    } else if (status === "failed" || status === "rejected") {
                                        displayStatus = "REJECTED";
                                        color = "#EF4444";
                                    }

                                    return (
                                        <span style={{ 
                                            background: color, 
                                            color: "white", 
                                            fontSize: "9px", 
                                            fontWeight: 800, 
                                            padding: "2px 6px", 
                                            borderRadius: "3px",
                                            letterSpacing: "0.05em"
                                        }}>
                                            {displayStatus}
                                        </span>
                                    );
                                })()}
                            </td>
                            <td style={LC}>Profile Image</td>
                            <td style={VC}>
                                <div style={{ width: 44, height: 44, borderRadius: 4, background: "#f3f4f6", border: "1px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                    {member.documents?.profileImage?.url ? (
                                        <img src={member.documents.profileImage.url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: 18, fontWeight: 900, color: "#9ca3af" }}>{getInitials(name)}</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                        <TR3 l1="Member ID" v1={membershipId} l2="Date of Birth" v2={fmtDate(member.dob)} l3="Gender" v3={safe(member.gender)} />
                        <TR3 l1="Mobile Number" v1={safe(member.mobile)} l2="Email Address" v2={safe(member.email)} l3="Occupation" v3={safe(member.occupation)} />
                        <TR3 l1="Marital Status" v1={safe(member.maritalStatus)} l2="Anniversary" v2={fmtDate(member.anniversary)} l3="Joined Date" v3={fmtDate(member.createdAt)} />
                    </Section>

                    {/* ── MEMBERSHIP & PAYMENTS ───────────────────────────── */}
                    <Section title="Membership & Payment Details">
                        <TR2 l1="Current Plan" v1={safe(member.membership?.name)} l2="Duration" v2={safe(member.membership?.duration)} />
                        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                            <td style={LC}>Payment History</td>
                            <td colSpan={5} style={{ padding: 0 }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #d1d5db" }}>
                                            <th style={{ ...LC, fontSize: 10, width: "25%" }}>Transaction ID</th>
                                            <th style={{ ...LC, fontSize: 10, width: "20%" }}>Amount</th>
                                            <th style={{ ...LC, fontSize: 10, width: "25%" }}>Date</th>
                                            <th style={{ ...LC, fontSize: 10, width: "30%", borderRight: "none" }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {member.payments?.length > 0 ? (
                                            member.payments.map((p, i) => (
                                                <tr key={i} style={{ borderBottom: i === member.payments.length - 1 ? "none" : "1px solid #eee" }}>
                                                    <td style={VCD}>{p.paymentId}</td>
                                                    <td style={VCD}>₹{p.amount / 100}</td>
                                                    <td style={VCD}>{new Date(p.paidAt).toLocaleString()}</td>
                                                    <td style={{ ...VC, fontWeight: 700, color: p.status === 'captured' ? 'green' : 'orange' }}>{p.status?.toUpperCase()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{ ...VC, textAlign: "center", fontStyle: "italic", color: "#999" }}>No payment records found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </Section>

                    {/* ── ADDRESS DETAILS ─────────────────────────────────── */}
                    <Section title="Address Information">
                        <TR1 label="Permanent Address" value={[
                            safe(member.residenceAddress?.houseNo),
                            safe(member.residenceAddress?.addressLine),
                            safe(member.residenceAddress?.city),
                            safe(member.residenceAddress?.state),
                            safe(member.residenceAddress?.country),
                            member.residenceAddress?.pin ? `PIN: ${member.residenceAddress.pin}` : null
                        ].filter(v => v && v !== '—').join(', ') || '—'} />
                        <TR1 label="Correspondence Address" value={[
                            safe(member.correspondenceAddress?.houseNo),
                            safe(member.correspondenceAddress?.addressLine),
                            safe(member.correspondenceAddress?.city),
                            safe(member.correspondenceAddress?.state),
                            safe(member.correspondenceAddress?.country),
                            member.correspondenceAddress?.pin ? `PIN: ${member.correspondenceAddress.pin}` : null
                        ].filter(v => v && v !== '—').join(', ') || '—'} />
                        <TR1 label="Office Address" value={[
                            safe(member.officeAddress?.houseNo),
                            safe(member.officeAddress?.addressLine),
                            safe(member.officeAddress?.city),
                            safe(member.officeAddress?.state),
                            safe(member.officeAddress?.country),
                            member.officeAddress?.pin ? `PIN: ${member.officeAddress.pin}` : null
                        ].filter(v => v && v !== '—').join(', ') || '—'} />
                    </Section>

                    {/* ── FAMILY DETAILS ─────────────────────────────────── */}
                    <Section title="Family & Spouse Details">
                        <TR3 l1="Spouse Name" v1={safe(member.spouse?.name)} l2="Spouse DOB" v2={fmtDate(member.spouse?.dob)} l3="Spouse Contact" v3={safe(member.spouse?.mobile)} />
                        <TR2 l1="Spouse Email" v1={safe(member.spouse?.email)} l2="Total Children" v2={String(member.familyMembers?.length || member.familyDetails?.children?.length || member.children?.length || 0)} />
                        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                            <td style={LC}>Children</td>
                            <td colSpan={5} style={{ padding: 0 }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #d1d5db" }}>
                                            <th style={{ ...LC, fontSize: 10, width: "10%" }}>#</th>
                                            <th style={{ ...LC, fontSize: 10, width: "40%" }}>Name</th>
                                            <th style={{ ...LC, fontSize: 10, width: "25%" }}>DOB</th>
                                            <th style={{ ...LC, fontSize: 10, width: "25%", borderRight: "none" }}>Gender</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(member.familyMembers || member.familyDetails?.children || member.children || []).length > 0 ? (
                                            (member.familyMembers || member.familyDetails?.children || member.children || []).map((ch, i) => (
                                                <tr key={i} style={{ borderBottom: i === (member.familyMembers || member.familyDetails?.children || member.children || []).length - 1 ? "none" : "1px solid #eee" }}>
                                                    <td style={VCD}>{i + 1}</td>
                                                    <td style={VCD}>{safe(ch.name)}</td>
                                                    <td style={VCD}>{fmtDate(ch.dob)}</td>
                                                    <td style={{ ...VC }}>{safe(ch.gender)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{ ...VC, textAlign: "center", fontStyle: "italic", color: "#999" }}>No children added</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </Section>

                    {/* ── DOCUMENTS ─────────────────────────────────────── */}
                    <Section title="Identity Documents Submitted">
                        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                            <td style={LC}>ID Proof (Aadhaar/PAN)</td>
                            <td colSpan={2} style={VCD}>
                                {member.documents?.idProof?.url ? (
                                    <a href={member.documents.idProof.url} target="_blank" rel="noreferrer" style={{ color: "#C8102E", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                                        <FileText size={14} /> VIEW DOCUMENT ({safe(member.documents.idProof.proofType || 'ID Proof')})
                                    </a>
                                ) : "NOT SUBMITTED"}
                            </td>
                            <td style={LC}>Address Proof</td>
                            <td colSpan={2} style={VC}>
                                {member.documents?.addressProof?.url ? (
                                    <a href={member.documents.addressProof.url} target="_blank" rel="noreferrer" style={{ color: "#C8102E", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                                        <FileText size={14} /> VIEW DOCUMENT ({safe(member.documents.addressProof.proofType || 'Address Proof')})
                                    </a>
                                ) : "NOT SUBMITTED"}
                            </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                            <td style={LC}>Spouse ID Proof</td>
                            <td colSpan={2} style={VCD}>
                                {member.documents?.spouseId?.url ? (
                                    <a href={member.documents.spouseId.url} target="_blank" rel="noreferrer" style={{ color: "#C8102E", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                                        <FileText size={14} /> VIEW DOCUMENT ({safe(member.documents.spouseId.proofType || 'Spouse ID')})
                                    </a>
                                ) : "NOT SUBMITTED"}
                            </td>
                            <td style={LC}>Profile Image</td>
                            <td colSpan={2} style={VC}>
                                {member.documents?.profileImage?.url ? (
                                    <a href={member.documents.profileImage.url} target="_blank" rel="noreferrer" style={{ color: "#C8102E", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                                        <FileText size={14} /> VIEW PROFILE IMAGE
                                    </a>
                                ) : "NOT SUBMITTED"}
                            </td>
                        </tr>
                    </Section>

                    {/* ── HOLIDAY BOOKINGS ─────────────────────────────── */}
                    <Section title="Holiday Booked">
                        <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                            <td colSpan={6} style={{ padding: 0 }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #d1d5db" }}>
                                            <th style={{ ...LC, fontSize: 10, width: "25%" }}>Destination</th>
                                            <th style={{ ...LC, fontSize: 10, width: "25%" }}>Dates & Guests</th>
                                            <th style={{ ...LC, fontSize: 10, width: "25%" }}>Requested On</th>
                                            <th style={{ ...LC, fontSize: 10, width: "25%", borderRight: "none" }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {member.holidayBookings?.length > 0 ? (
                                            member.holidayBookings.map((bk, i) => {
                                                const statusStr = (bk.status || "pending").toLowerCase();
                                                let badgeColor = "#F59E0B"; // pending (amber)
                                                let displayStatus = "PENDING";
                                                if (statusStr === "approved" || statusStr === "booked" || statusStr === "booking") {
                                                    badgeColor = "#10B981"; // emerald
                                                    displayStatus = "APPROVED";
                                                } else if (statusStr === "rejected") {
                                                    badgeColor = "#EF4444"; // red
                                                    displayStatus = "REJECTED";
                                                }

                                                return (
                                                    <tr key={i} style={{ borderBottom: i === member.holidayBookings.length - 1 ? "none" : "1px solid #eee" }}>
                                                        <td style={VCD}>
                                                            <div style={{ fontWeight: 700, color: "#1e3a5f" }}>{bk.place}</div>
                                                            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "capitalize" }}>{bk.region || "Domestic"}</div>
                                                        </td>
                                                        <td style={VCD}>
                                                            <div style={{ fontSize: 11 }}>
                                                                <span style={{ color: "#6b7280" }}>IN:</span> {fmtDate(bk.checkIn)} <br />
                                                                <span style={{ color: "#6b7280" }}>OUT:</span> {fmtDate(bk.checkOut)}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: "#1e3a5f", marginTop: 4, fontWeight: 600 }}>
                                                                {bk.adults} Adults / {bk.kids} Kids
                                                            </div>
                                                        </td>
                                                        <td style={VCD}>
                                                            <div style={{ fontSize: 11, fontWeight: 600, color: "#1e3a5f" }}>{fmtDate(bk.requestedAt)}</div>
                                                            <div style={{ fontSize: 10, color: "#6b7280" }}>{new Date(bk.requestedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </td>
                                                        <td style={{ ...VC, borderRight: "none" }}>
                                                            <span style={{ 
                                                                display: "inline-block",
                                                                border: `1px solid ${badgeColor}`,
                                                                color: badgeColor, 
                                                                fontSize: "9px", 
                                                                fontWeight: 800, 
                                                                padding: "4px 8px", 
                                                                borderRadius: "4px",
                                                                letterSpacing: "0.05em",
                                                                marginBottom: bk.adminMessage ? "6px" : "0"
                                                            }}>
                                                                {displayStatus}
                                                            </span>
                                                            {bk.adminMessage && (
                                                                <div style={{
                                                                    marginTop: 2,
                                                                    padding: "4px 8px",
                                                                    background: "#f3f4f6",
                                                                    borderRadius: 4,
                                                                    fontSize: 10,
                                                                    color: "#111827",
                                                                    display: "block"
                                                                }}>
                                                                    <strong style={{ color: "#374151" }}>Admin Note:</strong> "{bk.adminMessage}"
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{ ...VC, textAlign: "center", fontStyle: "italic", color: "#999" }}>No holiday bookings found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </Section>

                    {/* ── FOOTER ───────────────────────────────────────────── */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40, borderTop: "1px solid #eee", pt: 20 }}>
                        <p style={{ fontSize: 11, color: "#1e3a5f", margin: 0, fontWeight: 600, letterSpacing: "0.02em" }}>
                            <span style={{ color: "#6b7280" }}>MEMBER ID:</span> <span style={{ color: "#C8102E", fontWeight: 800 }}>{membershipId}</span> 
                            <span style={{ color: "#d1d5db", margin: "0 8px" }}>|</span> 
                            <span style={{ color: "#6b7280" }}>GENERATED ON:</span> <span style={{ color: "#10B981", fontWeight: 800 }}>{new Date().toLocaleDateString()}</span>
                        </p>
                        <p style={{ fontSize: 11, color: "#0f2d52", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
                            OWN HOLIDAY CLUB
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    body { background: white !important; margin: 0 !important; }
                    .no-print { display: none !important; }
                    .print-bg-white { background: white !important; }
                    .print-section { page-break-inside: avoid !important; }
                    table td, table th { border: 1px solid #d1d5db !important; }
                }
            `}</style>
        </div>
    );
};

export default MemberProfile;
