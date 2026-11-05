import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import api from "../lib/api";

const initialForm = {
  name: "",
  codeMode: "existing",
  code: "",
  referralCodeIds: [],
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export default function ManageInfluencers() {
  const [accounts, setAccounts] = useState([]);
  const [unassignedCodes, setUnassignedCodes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [editCodeIds, setEditCodeIds] = useState([]);
  const [passwordAccountId, setPasswordAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const assignedCodes = useMemo(
    () => editing?.referralCodes || [],
    [editing],
  );
  const editableCodes = useMemo(() => {
    const codesById = new Map();
    [...assignedCodes, ...unassignedCodes].forEach((code) =>
      codesById.set(code._id, code),
    );
    return Array.from(codesById.values());
  }, [assignedCodes, unassignedCodes]);

  const fetchData = useCallback(async () => {
    const [accountsResponse, codesResponse] = await Promise.all([
      api.get("/api/influencers/accounts"),
      api.get("/api/influencers/unassigned-codes"),
    ]);
    return {
      accounts: accountsResponse.data.data || [],
      unassignedCodes: codesResponse.data.data || [],
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchData();
      setAccounts(data.accounts);
      setUnassignedCodes(data.unassignedCodes);
    } catch (error) {
      console.error("Failed to load influencer accounts:", error);
      await Swal.fire(
        "Unable to load",
        getErrorMessage(error, "Influencer accounts could not be loaded."),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    let isCurrent = true;
    fetchData()
      .then(({ accounts: fetchedAccounts, unassignedCodes: fetchedCodes }) => {
        if (isCurrent) {
          setAccounts(fetchedAccounts);
          setUnassignedCodes(fetchedCodes);
        }
      })
      .catch(async (error) => {
        console.error("Failed to load influencer accounts:", error);
        if (isCurrent) {
          await Swal.fire(
            "Unable to load",
            getErrorMessage(error, "Influencer accounts could not be loaded."),
            "error",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      await Swal.fire("Missing details", "Name is required.", "warning");
      return;
    }
    if (
      form.codeMode === "existing" &&
      form.referralCodeIds.length !== 1
    ) {
      await Swal.fire("Select a code", "Choose one existing unassigned code.", "warning");
      return;
    }
    if (form.codeMode === "new" && !form.code.trim()) {
      await Swal.fire("Enter a code", "Enter the new referral code to create.", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        ...(form.codeMode === "new"
          ? { code: form.code.trim().toUpperCase() }
          : { referralCodeIds: form.referralCodeIds }),
      };
      const response = await api.post("/api/influencers/accounts", payload);
      setForm(initialForm);
      await loadData();
      await Swal.fire({
        icon: "success",
        title: "Created",
        text: `Influencer login is ready. Password: ${response.data.data.password}.`,
        confirmButtonColor: "#C8102E",
      });
    } catch (error) {
      console.error("Create influencer account failed:", error);
      await Swal.fire("Error", getErrorMessage(error, "Could not create influencer account."), "error");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (account) => {
    setEditing({
      _id: account._id,
      name: account.name,
      isActive: account.isActive,
      referralCodes: account.referralCodes || [],
    });
    setEditCodeIds((account.referralCodes || []).map((code) => code._id));
    setPasswordAccountId("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/influencers/accounts/${editing._id}`, {
        name: editing.name.trim(),
        isActive: editing.isActive,
        referralCodeIds: editCodeIds,
      });
      setEditing(null);
      await loadData();
      await Swal.fire("Saved", "Influencer account changes were saved.", "success");
    } catch (error) {
      console.error("Update influencer account failed:", error);
      await Swal.fire("Error", getErrorMessage(error, "Could not update influencer account."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async (accountId) => {
    setSaving(true);
    try {
      const response = await api.patch(
        `/api/influencers/accounts/${accountId}/password`,
        {},
      );
      setPasswordAccountId("");
      await Swal.fire({
        icon: "success",
        title: "Password updated",
        text: `New password: ${response.data.password}.`,
        confirmButtonColor: "#C8102E",
      });
    } catch (error) {
      console.error("Reset influencer password failed:", error);
      await Swal.fire("Error", getErrorMessage(error, "Could not update the password."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account) => {
    const confirmation = await Swal.fire({
      title: "Delete influencer login?",
      text: `This removes ${account.name}'s login only. Referral codes and membership counts will be preserved and become unassigned.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C8102E",
      confirmButtonText: "Delete login",
    });
    if (!confirmation.isConfirmed) return;

    try {
      await api.delete(`/api/influencers/accounts/${account._id}`);
      await loadData();
      await Swal.fire("Deleted", "The login was deleted; referral records were preserved.", "success");
    } catch (error) {
      console.error("Delete influencer account failed:", error);
      await Swal.fire("Error", getErrorMessage(error, "Could not delete the login."), "error");
    }
  };

  return (
    <div className="space-y-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Influencer accounts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage influencer logins and their assigned referral codes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleCreate} className="space-y-5 border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Plus className="text-[#C8102E]" size={20} />
          <h2 className="text-lg font-bold text-gray-900">Create influencer login</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-1">
          <label className="text-sm font-medium text-gray-700">
            Influencer name
            <input
              required
              maxLength={100}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="mt-1 w-full border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-800">Referral code setup</legend>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={form.codeMode === "existing"}
                onChange={() => setForm({ ...form, codeMode: "existing", code: "" })}
              />
              Link one existing unassigned code
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={form.codeMode === "new"}
                onChange={() => setForm({ ...form, codeMode: "new", referralCodeIds: [] })}
              />
              Create a new code
            </label>
          </div>
          {form.codeMode === "existing" ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {unassignedCodes.length === 0 ? (
                <p className="text-sm text-gray-500">There are no unassigned referral codes.</p>
              ) : (
                unassignedCodes.map((code) => (
                  <label key={code._id} className="flex items-center gap-2 border border-gray-200 p-3 text-sm">
                    <input
                      type="radio"
                      name="new-influencer-code"
                      checked={form.referralCodeIds[0] === code._id}
                      onChange={() =>
                        setForm({ ...form, referralCodeIds: [code._id] })
                      }
                    />
                    <span className="font-semibold">{code.code}</span>
                    <span className="ml-auto text-gray-500">
                      {Number(code.membershipCount || 0)} memberships
                    </span>
                  </label>
                ))
              )}
            </div>
          ) : (
            <label className="block max-w-sm text-sm font-medium text-gray-700">
              New referral code (letters/initials + two digits)
              <input
                required
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                placeholder="DS17"
                className="mt-1 w-full border border-gray-300 px-3 py-2 uppercase"
              />
            </label>
          )}
        </fieldset>
        <button
          type="submit"
          disabled={saving || loading}
          className="bg-[#C8102E] px-5 py-2.5 font-semibold text-white hover:bg-[#a00d24] disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create account"}
        </button>
      </form>

      <section className="border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
          <Users className="text-[#C8102E]" size={20} />
          <h2 className="text-lg font-bold text-gray-900">Current accounts</h2>
        </div>
        {loading ? (
          <p className="p-5 text-gray-500">Loading influencer accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="p-5 text-gray-500">No influencer accounts have been created.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Influencer</th>
                  <th className="px-5 py-3">Referral codes</th>
                  <th className="px-5 py-3">Memberships</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accounts.map((account) => (
                  <tr key={account._id}>
                    <td className="px-5 py-4 font-semibold text-gray-900">{account.name}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {account.referralCodes?.[0]?.code || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {(account.referralCodes || []).reduce(
                        (total, code) => total + Number(code.membershipCount || 0),
                        0,
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${account.isActive ? "text-green-700" : "text-gray-500"}`}>
                        {account.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          title="Edit account and assigned codes"
                          onClick={() => startEditing(account)}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          title="Reset password"
                          onClick={() => {
                            setPasswordAccountId(
                              passwordAccountId === account._id ? "" : account._id,
                            );
                          }}
                          className="text-amber-700 hover:text-amber-900"
                        >
                          <KeyRound size={18} />
                        </button>
                        <button
                          type="button"
                          title="Delete login without deleting referral codes"
                          onClick={() => handleDelete(account)}
                          className="text-red-700 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {passwordAccountId === account._id && (
                        <form
                          className="mt-3 flex min-w-64 gap-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            handlePasswordReset(account._id);
                          }}
                        >
                          <span className="flex-1 self-center text-xs text-gray-500">
                            Generate a unique password for this referral code.
                          </span>
                          <button
                            disabled={saving}
                            className="bg-gray-800 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Save
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <form
            onSubmit={handleUpdate}
            className="my-auto max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900">Edit influencer account</h2>
            <div className="grid gap-4">
              <label className="text-sm font-medium text-gray-700">
                Name
                <input
                  required
                  maxLength={100}
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                  className="mt-1 w-full border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={editing.isActive}
                onChange={(event) => setEditing({ ...editing, isActive: event.target.checked })}
              />
              Account enabled
            </label>
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-gray-800">
                Assigned referral codes (membership history stays with each code)
              </legend>
              {editableCodes.length === 0 ? (
                <p className="text-sm text-gray-500">No codes are available to assign.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {editableCodes.map((code) => (
                    <label key={code._id} className="flex items-center gap-2 border border-gray-200 p-3 text-sm">
                      <input
                        type="radio"
                        name="edit-influencer-code"
                        checked={editCodeIds[0] === code._id}
                        onChange={() => setEditCodeIds([code._id])}
                      />
                      <span className="font-semibold">{code.code}</span>
                      <span className="ml-auto text-gray-500">
                        {Number(code.membershipCount || 0)} memberships
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="border border-gray-300 px-4 py-2 font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#C8102E] px-5 py-2 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
