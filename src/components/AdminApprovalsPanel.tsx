import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Building,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Users,
  Search,
  Filter,
  Sprout
} from 'lucide-react';
import { UserAccount } from '../types';

interface AdminApprovalsPanelProps {
  currentAdminUser: UserAccount;
}

export const AdminApprovalsPanel: React.FC<AdminApprovalsPanelProps> = ({
  currentAdminUser
}) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved_officials' | 'farmers' | 'manual_add'>('pending');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Add Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'official' | 'agronomist'>('official');
  const [newDepartment, setNewDepartment] = useState('Department of Agriculture');
  const [newDesignation, setNewDesignation] = useState('Agricultural Surveillance Officer');
  const [newOfficialId, setNewOfficialId] = useState('GOV-AGRI-' + Math.floor(1000 + Math.random() * 9000));
  const [newDistrict, setNewDistrict] = useState('Nashik');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Fetch users list
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show status notification
  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  // Handler: Approve user
  const handleApprove = async (user: UserAccount) => {
    try {
      const res = await fetch(`/api/auth/users/${user.id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Email approved! ${user.name} (${user.email}) is now an accredited ${user.role}.`);
        fetchUsers();
      } else {
        notify(data.error || 'Failed to approve user', 'error');
      }
    } catch (err) {
      notify('Network error approving user', 'error');
    }
  };

  // Handler: Reject user
  const handleReject = async (user: UserAccount) => {
    try {
      const res = await fetch(`/api/auth/users/${user.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Accreditation declined by Administrator' })
      });
      if (res.ok) {
        notify(`Application for ${user.email} was declined.`, 'error');
        fetchUsers();
      }
    } catch (err) {
      notify('Network error rejecting user', 'error');
    }
  };

  // Handler: Revoke access
  const handleRevoke = async (user: UserAccount) => {
    try {
      const res = await fetch(`/api/auth/users/${user.id}/revoke`, {
        method: 'PUT'
      });
      if (res.ok) {
        notify(`Access privileges revoked for ${user.email}. User set to pending approval.`);
        fetchUsers();
      }
    } catch (err) {
      notify('Error revoking access', 'error');
    }
  };

  // Handler: Delete user
  const handleDelete = async (user: UserAccount) => {
    if (!window.confirm(`Delete account for ${user.name} (${user.email})?`)) return;
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        notify(`User ${user.email} deleted.`);
        fetchUsers();
      }
    } catch (err) {
      notify('Error deleting user', 'error');
    }
  };

  // Handler: Manual add pre-approved official
  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingManual(true);

    try {
      // Create account
      const res = await fetch('/api/auth/request-official-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          department: newDepartment,
          designation: newDesignation,
          officialId: newOfficialId,
          district: newDistrict
        })
      });

      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'Failed to create user', 'error');
        setIsSubmittingManual(false);
        return;
      }

      // Automatically approve immediately since Admin is creating it
      if (data.user && data.user.id) {
        await fetch(`/api/auth/users/${data.user.id}/approve`, {
          method: 'PUT'
        });
      }

      notify(`Accredited ${newRole} account created and approved for ${newEmail}!`);
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setActiveSubTab('approved_officials');
      fetchUsers();
    } catch (err) {
      notify('Error creating user account', 'error');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Filter users
  const pendingRequests = users.filter(
    (u) =>
      u.status === 'pending_approval' &&
      (u.role === 'official' || u.role === 'agronomist')
  );

  const approvedOfficials = users.filter(
    (u) =>
      u.status === 'approved' &&
      (u.role === 'official' || u.role === 'agronomist' || u.role === 'admin')
  );

  const farmersList = users.filter((u) => u.role === 'farmer');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Official & Agronomist Accreditation Console
            </h2>
            <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300">
              Admin: devp3987@gmail.com
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review email registration requests, grant official surveillance powers, and manage accredited plant pathologists
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            title="Refresh user list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual_add')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Official</span>
          </button>
        </div>
      </div>

      {/* Status notification toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-xs animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'pending'
              ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Email Approvals</span>
          {pendingRequests.length > 0 && (
            <span className="bg-stone-900 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('approved_officials')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'approved_officials'
              ? 'bg-emerald-700 text-white font-black shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Accredited Officials & Agronomists</span>
          <span className="bg-emerald-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {approvedOfficials.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('farmers')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'farmers'
              ? 'bg-emerald-700 text-white font-black shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Registered Farmers</span>
          <span className="bg-stone-200 text-stone-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {farmersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('manual_add')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'manual_add'
              ? 'bg-emerald-700 text-white font-black shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Manual Pre-Approval</span>
        </button>
      </div>

      {/* SUB-TAB 1: PENDING APPROVAL REQUESTS */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-amber-900">
                Official Access Governance Protocol
              </h4>
              <p className="text-stone-700 text-[11px] mt-0.5 leading-relaxed">
                When someone registers as an Official or Agronomist, their access is held in a security queue until you, as Administrator (<strong className="font-mono text-stone-900">devp3987@gmail.com</strong>), approve their email address. Once approved, the user can log in with their password and access the Official Surveillance Dashboard and clinical queues.
              </p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
              <UserCheck className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
              <h3 className="text-sm font-extrabold text-stone-800">
                No Pending Email Approvals
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                All submitted official and agronomist registration requests have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-xs space-y-4 transition hover:border-amber-400"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            req.role === 'official'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-purple-100 text-purple-900 border border-purple-300'
                          }`}
                        >
                          {req.role === 'official' ? '🏛️ Official Request' : '🔬 Agronomist Request'}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                          ⏳ Awaiting Approval
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-stone-900 mt-1">
                        {req.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span>{req.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-700">
                    <div>
                      <span className="text-stone-400 block text-[10px] font-bold uppercase">
                        Department / Org
                      </span>
                      <span className="font-semibold">{req.department || 'Dept of Agriculture'}</span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px] font-bold uppercase">
                        Designation
                      </span>
                      <span className="font-semibold">{req.designation || 'Specialist'}</span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px] font-bold uppercase">
                        Jurisdiction / District
                      </span>
                      <span className="font-semibold">{req.district || 'State-wide'}</span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px] font-bold uppercase">
                        Official ID
                      </span>
                      <span className="font-mono font-semibold">{req.officialId || 'REQ-ID'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleApprove(req)}
                      className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve & Grant Official Access</span>
                    </button>

                    <button
                      onClick={() => handleReject(req)}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition"
                      title="Decline request"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ACCREDITED OFFICIALS & AGRONOMISTS */}
      {activeSubTab === 'approved_officials' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-stone-700">
              Active Authorized Personnel ({approvedOfficials.length})
            </span>
          </div>

          <div className="divide-y divide-stone-200 text-xs">
            {approvedOfficials.map((user) => (
              <div
                key={user.id}
                className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-stone-50/80 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-stone-900 text-sm">{user.name}</h4>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : user.role === 'official'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Approved</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-stone-500 text-[11px]">
                    <span className="font-mono text-stone-700">{user.email}</span>
                    {user.department && <span>• {user.department}</span>}
                    {user.district && <span>• District: {user.district}</span>}
                    {user.approvedBy && (
                      <span className="text-emerald-800 font-medium">
                        • Verified by {user.approvedBy}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.email.toLowerCase() !== 'devp3987@gmail.com' && (
                    <>
                      <button
                        onClick={() => handleRevoke(user)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-xs transition"
                        title="Lock account back to pending"
                      >
                        Revoke Access
                      </button>

                      <button
                        onClick={() => handleDelete(user)}
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete user"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REGISTERED FARMERS */}
      {activeSubTab === 'farmers' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200">
            <h4 className="text-xs font-bold text-stone-700">
              Registered Farmers Roster ({farmersList.length})
            </h4>
          </div>

          <div className="divide-y divide-stone-200 text-xs">
            {farmersList.map((f) => (
              <div
                key={f.id}
                className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-stone-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-stone-900">{f.name}</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                      🌱 Active Kisan Profile
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-stone-500 text-[11px]">
                    <span className="flex items-center gap-1 font-mono text-stone-700">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{f.phone || 'No phone'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>
                        {f.village}, {f.district}, {f.state}
                      </span>
                    </span>
                    {f.landSizeAcres && <span>• Land: {f.landSizeAcres} Acres</span>}
                  </div>
                  {f.primaryCrops && f.primaryCrops.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Crops:</span>
                      {f.primaryCrops.map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => handleDelete(f)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Remove farmer"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MANUAL PRE-APPROVAL (Admin directly adds official) */}
      {activeSubTab === 'manual_add' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-stone-900">
              Directly Provision & Pre-Approve Personnel
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              As Administrator, you can directly create and activate an Official or Agronomist without requiring them to wait in the approval queue.
            </p>
          </div>

          <form onSubmit={handleManualAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Vijay Joshi"
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  <option value="official">🏛️ Department Official</option>
                  <option value="agronomist">🔬 Agronomist / Plant Pathologist</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Official Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="officer@gov.agri.in"
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Initial Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create temporary password"
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Designation</label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">District</label>
                <input
                  type="text"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingManual}
                className="py-3 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmittingManual ? 'Saving...' : 'Pre-Approve & Save Account'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
