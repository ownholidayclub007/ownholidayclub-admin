import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Pagination from "../components/Pagination";
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "admin",
    mobile: "",
    isActive: true
  });

  const roles = [
    { value: "super-admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "digital-marketing", label: "Digital Marketing" },
    { value: "developer", label: "Developer" }
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admins');
      setAdmins(response.data.admins || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch admins',
        confirmButtonColor: '#C8102E'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({
      ...newAdmin,
      [name]: name === 'isActive' ? value === 'true' : value
    });
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username.trim()) {
      Swal.fire({ icon: 'warning', title: 'Missing Field', text: 'Please enter a username', confirmButtonColor: '#C8102E' });
      return;
    }
    if (!newAdmin.password) {
      Swal.fire({ icon: 'warning', title: 'Missing Field', text: 'Please enter a password', confirmButtonColor: '#C8102E' });
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.post('/api/admins', newAdmin);

      if (response.status === 201) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Administrator created successfully',
          confirmButtonColor: '#C8102E',
          timer: 2000
        });

        setNewAdmin({
          username: "",
          password: "",
          role: "admin",
          mobile: "",
          isActive: true
        });

        fetchAdmins();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create admin',
        confirmButtonColor: '#C8102E'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async (admin, newStatus) => {
    try {
      const response = await api.put(`/api/admins/${admin._id}`, { isActive: newStatus });
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `@${admin.username}'s status changed to ${newStatus ? 'Active' : 'Inactive'}`,
          confirmButtonColor: '#C8102E',
          timer: 1500,
          showConfirmButton: false
        });
        fetchAdmins();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Could not update status',
        confirmButtonColor: '#C8102E'
      });
    }
  };

  const handleEditAdmin = async (admin) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Administrator',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input id="swal-username" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#C8102E] focus:outline-none" value="${admin.username}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select id="swal-role" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#C8102E] focus:outline-none">
              ${roles.map(r => `
                <option value="${r.value}" ${admin.role === r.value ? 'selected' : ''}>${r.label}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select id="swal-status" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#C8102E] focus:outline-none">
              <option value="true" ${admin.isActive ? 'selected' : ''}>Active</option>
              <option value="false" ${!admin.isActive ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
            <input id="swal-mobile" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#C8102E] focus:outline-none" value="${admin.mobile || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Password (optional)</label>
            <input id="swal-password" type="password" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#C8102E] focus:outline-none" placeholder="Leave blank to keep current">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Administrator',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'rounded-sm',
        confirmButton: 'px-6 py-3 font-semibold',
        cancelButton: 'px-6 py-3 font-semibold'
      },
      preConfirm: () => {
        return {
          username: document.getElementById('swal-username').value,
          role: document.getElementById('swal-role').value,
          isActive: document.getElementById('swal-status').value === 'true',
          mobile: document.getElementById('swal-mobile').value,
          password: document.getElementById('swal-password').value
        };
      }
    });

    if (formValues) {
      try {
        setIsSaving(true);
        const updateData = { ...formValues };
        if (!updateData.password) delete updateData.password;

        const response = await api.put(`/api/admins/${admin._id}`, updateData);

        if (response.status === 200) {
          await Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Administrator updated successfully',
            confirmButtonColor: '#C8102E',
            timer: 2000
          });
          fetchAdmins();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to update admin',
          confirmButtonColor: '#C8102E'
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteAdmin = async (admin) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `Do you want to delete <strong>@${admin.username}</strong>?<br><span class="text-red-600">This action cannot be undone!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-sm',
        confirmButton: 'px-6 py-3 font-semibold',
        cancelButton: 'px-6 py-3 font-semibold'
      }
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const response = await api.delete(`/api/admins/${admin._id}`);

        if (response.status === 200) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Administrator has been deleted successfully',
            confirmButtonColor: '#C8102E',
            timer: 2000
          });
          fetchAdmins();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete admin',
          confirmButtonColor: '#C8102E'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredAdmins = admins.filter(admin => {
    return (
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const columns = [
    {
      key: "sno",
      label: "S.NO",
      width: "80px",
      render: (_, index) => (
        <div className="font-bold text-gray-900">
          {startIndex + index + 1}
        </div>
      )
    },
    {
      key: "admin",
      label: "ADMIN INFO",
      render: (row) => (
        <div className="flex flex-col">
            <div className="font-medium text-[#C8102E]">@{row.username}</div>
        </div>
      )
    },
    {
      key: "role",
      label: "ROLE",
      render: (row) => (
        <div className="text-gray-900 font-medium capitalize">
            {row.role ? row.role.replace(/-/g, ' ') : '---'}
        </div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <select
          value={row.isActive ? "true" : "false"}
          onChange={(e) => handleStatusToggle(row, e.target.value === "true")}
          className={`px-3 py-1 rounded-sm text-xs font-bold border-2 cursor-pointer focus:outline-none transition-colors ${
            row.isActive
              ? "bg-green-50 text-green-700 border-green-200 hover:border-green-400"
              : "bg-red-50 text-red-700 border-red-200 hover:border-red-400"
          }`}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      )
    },
    {
      key: "createdAt",
      label: "CREATED ON",
      render: (row) => (
        <div className="text-gray-900">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <div className="bg-white p-6 shadow-md border-2 border-gray-200 mt-6 min-h-[calc(100vh-180px)] rounded-none">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#C8102E] uppercase tracking-tight">MANAGE ADMIN USERS</h1>
            <p className="text-gray-600 mt-1 text-lg">Manage admin users and their permissions</p>
        </div>

        <div className="space-y-6 mt-6">
          {/* CREATE SECTION */}
          <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg rounded-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <UserPlus className="w-4 h-4 text-[#C8102E]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Create New Admin</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={newAdmin.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  className="w-full h-[35px] px-3 border-2 border-gray-300 focus:outline-none focus:border-[#C8102E] transition-colors text-[12px] bg-white rounded-none placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full h-[35px] px-3 border-2 border-gray-300 focus:outline-none focus:border-[#C8102E] transition-colors text-[12px] pr-10 bg-white rounded-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={newAdmin.role}
                  onChange={handleInputChange}
                  className="w-full h-[35px] px-3 border-2 border-gray-300 focus:outline-none focus:border-[#C8102E] transition-colors text-[12px] bg-white rounded-none"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCreateAdmin}
                disabled={isSaving}
                className="w-full h-[35px] bg-[#C8102E] text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase tracking-wider text-[11px] disabled:opacity-50 disabled:cursor-not-allowed rounded-none hover:bg-[#a00d24]"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b bg-[#1e3a8a]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Admin List</h2>
                  <p className="text-sm text-blue-100 mt-0.5">
                    Showing {filteredAdmins.length} of {admins.length} admins
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-sm text-white placeholder-white/60 border-2 border-gray-300 focus:outline-none focus:border-white transition-colors bg-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Table
                  columns={[
                    {
                      key: "sno",
                      label: "S.NO",
                      width: "80px",
                      render: (_, index) => (
                        <div className="font-bold text-gray-900">
                          {startIndex + index + 1}
                        </div>
                      )
                    },
                    {
                      key: "username",
                      label: "USERNAME",
                      render: (row) => (
                        <div className="font-medium text-[#C8102E]">
                          {row.username}
                        </div>
                      )
                    },
                    {
                      key: "role",
                      label: "ROLE",
                      render: (row) => (
                        <div className="text-gray-900 font-medium capitalize">
                            {row.role ? row.role.replace(/-/g, ' ') : '---'}
                        </div>
                      )
                    },
                    {
                      key: "status",
                      label: "STATUS",
                      render: (row) => (
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 cursor-pointer transition-colors ${
                            row.isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                          onClick={() => handleStatusToggle(row, !row.isActive)}
                        >
                            {row.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {row.isActive ? "Active" : "Inactive"}
                        </div>
                      )
                    },
                    {
                      key: "createdAt",
                      label: "CREATED AT",
                      render: (row) => (
                        <div className="text-gray-900">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </div>
                      )
                    },
                    {
                        key: "lastLogin",
                        label: "LAST LOGIN",
                        render: (row) => (
                          <div className="text-gray-900 text-sm">
                            {row.lastLogin ? new Date(row.lastLogin).toLocaleString() : "Never"}
                          </div>
                        )
                    }
                  ]}
                  data={paginatedAdmins}
                  onEdit={handleEditAdmin}
                  onDelete={handleDeleteAdmin}
                  wrapperClassName="border-none shadow-none"
                />
              )}
            </div>

            <div className="bg-white px-4 py-4 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredAdmins.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                label="administrators"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;
