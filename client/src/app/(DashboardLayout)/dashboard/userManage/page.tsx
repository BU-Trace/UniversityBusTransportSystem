"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Upload,
  Search,
  ShieldCheck,
  FileText,
  Bus,
  Clock,
  BadgeCheck,
} from "lucide-react";

import {
  MdDashboard,
  MdDirectionsBus,
  MdPeople,
  MdMap,
  MdNotifications,
  MdLogout,
  MdMenu,
  MdClose,
  MdEdit,
} from "react-icons/md";

type UserRole = "student" | "driver" | "admin";

interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  studentId?: string;
  licenseNumber?: string;

  photoUrl?: string;
  approvalLetterUrl?: string;

  assignedBusId?: string;
  assignedBusName?: string;

  createdAt?: string;
}

interface IBusLite {
  id: string;
  name: string;
  plateNumber: string;
}

interface IPendingRequest {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  studentId?: string;
  licenseNumber?: string;

  photoUrl?: string;
  approvalLetterUrl?: string;

  createdAt?: string;
}

async function apiFetch<T>(
  pathOrUrl: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const isFullUrl = /^https?:\/\//i.test(pathOrUrl);
  const url = isFullUrl ? pathOrUrl : `${BASE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json as T;
}



const CLOUD_NAME = "dpiofecgs";
const UPLOAD_PRESET = "butrace";

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Cloudinary error:", data);
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }
  return data.secure_url;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const API = {
  buses: `${BASE_URL}/bus/get-all-buses`,

  usersAll: `${BASE_URL}/user/get-all-users`,
  userAdd: `${BASE_URL}/user/add-user`,
  userUpdate: (id: string) => `${BASE_URL}/user/update-user/${id}`,
  userDelete: (id: string) => `${BASE_URL}/user/delete-user/${id}`,

  pendingAll: `${BASE_URL}/auth/get-pending-registrations`,
  approvePending: (id: string) => `${BASE_URL}/auth/approve-registration/${id}`,
  rejectPending: (id: string) => `${BASE_URL}/auth/reject-registration/${id}`,
};

function prettyRole(role: UserRole) {
  if (role === "student") return "Student";
  if (role === "driver") return "Driver";
  return "Admin";
}

function formatDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

function safeOpen(url?: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </motion.div>
  );
}

function HeaderModal({
  title,
  onClose,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="p-6 border-b border-gray-100 flex justify-between items-start gap-4 sticky top-0 bg-white z-10">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>
        ) : null}
      </div>
      <button
        onClick={onClose}
        className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}

export default function UserManagementPage() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken as string | undefined;


  // sidebar
  const [isOpen, setIsOpen] = useState(false);

  // tabs
  const [activeTab, setActiveTab] = useState<UserRole>("student");

  // data
  const [users, setUsers] = useState<IUser[]>([]);
  const [buses, setBuses] = useState<IBusLite[]>([]);

  // pending
  const [pendingOpen, setPendingOpen] = useState(false);
  const [pending, setPending] = useState<IPendingRequest[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // search
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const roleUsers = users.filter((u) => u.role === activeTab);
    if (!q) return roleUsers;

    return roleUsers.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studentId || "").toLowerCase().includes(q) ||
        (u.licenseNumber || "").toLowerCase().includes(q) ||
        (u.assignedBusName || "").toLowerCase().includes(q)
      );
    });
  }, [users, activeTab, query]);

  // modal add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<IUser>>({
    role: "student",
    name: "",
    email: "",
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLetter, setUploadingLetter] = useState(false);
  const photoRef = useRef<HTMLInputElement | null>(null);
  const letterRef = useRef<HTMLInputElement | null>(null);

  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalItem, setApprovalItem] = useState<IPendingRequest | null>(null);

  const [assignBusOpen, setAssignBusOpen] = useState(false);
  const [assignBusId, setAssignBusId] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const lock = isOpen || isModalOpen || pendingOpen || approvalOpen || assignBusOpen;
    document.body.style.overflow = lock ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isModalOpen, pendingOpen, approvalOpen, assignBusOpen]);

  const admin = { name: "Admin 1", role: "Admin" };

  const menuItems = [
    { label: "Dashboard Overview", href: "/dashboard", icon: MdDashboard },
    { label: "Bus Management", href: "/dashboard/busManage", icon: MdDirectionsBus },
    { label: "User Management", href: "/dashboard/userManage", icon: MdPeople },
    { label: "Route Management", href: "/dashboard/routeManage", icon: MdMap },
    { label: "Notice Publish", href: "/dashboard/notice", icon: MdNotifications },
  ];

  const loadBuses = async () => {
    try {
      const { data } = await apiFetch<BusResponse[]>("/bus/get-all-buses");
      const busList = (data || []).map((b) => ({
        id: b._id,
        name: b.name,
        plateNumber: b.plateNumber,
      }));
      setBuses(busList);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to load buses'));
    }
  };


  const loadUsers = async () => {
    try {
      const res = await fetch(API.usersAll);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to load users");

      const list: IUser[] = (json?.data || []).map((u: any) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        studentId: u.studentId,
        licenseNumber: u.licenseNumber,
        photoUrl: u.photoUrl || u.photo,
        approvalLetterUrl: u.approvalLetterUrl || u.approvalLetter,
        assignedBusId: u.assignedBusId,
        assignedBusName: u.assignedBusName,
        createdAt: u.createdAt,
      }));

      setUsers(list);
    } catch (e: any) {
      toast.error(e?.message || "Could not load users");
    }
  };

  useEffect(() => {
    if (!mounted) return;
    loadBuses();
    loadUsers();
  }, [mounted]);

  const openAdd = () => {
    setModalType("add");
    setSelectedId(null);
    setForm({
      role: activeTab,
      name: "",
      email: "",
      studentId: "",
      licenseNumber: "",
      photoUrl: "",
      approvalLetterUrl: "",
      assignedBusId: "",
      assignedBusName: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (u: IUser) => {
    setModalType("edit");
    setSelectedId(u.id);
    setForm({ ...u });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user permanently?")) return;

    try {
      const res = await fetch(API.userDelete(id), { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Delete failed");

      setUsers((prev) => prev.filter((x) => x.id !== id));
      toast.success("User deleted successfully.");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed.");
    }
  };

  const requireDocs = form.role === "admin" || form.role === "driver";

  const pickPhoto = () => photoRef.current?.click();
  const pickLetter = () => letterRef.current?.click();

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      toast.message("Uploading photo...");
      const url = await uploadToCloudinary(file);
      setForm((p) => ({ ...p, photoUrl: url }));
      toast.success("Photo uploaded.");
    } catch (err: any) {
      toast.error(err?.message || "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const onLetterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLetter(true);
      toast.message("Uploading approval letter...");
      const url = await uploadToCloudinary(file);
      setForm((p) => ({ ...p, approvalLetterUrl: url }));
      toast.success("Approval letter uploaded.");
    } catch (err: any) {
      toast.error(err?.message || "Letter upload failed.");
    } finally {
      setUploadingLetter(false);
      e.target.value = "";
    }
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.role) return toast.error("Role is required.");
    if (!form.name?.trim()) return toast.error("Name is required.");
    if (!form.email?.trim()) return toast.error("Email is required.");

    if (form.role === "student" && !form.studentId?.trim()) {
      return toast.error("Student ID is required for students.");
    }

    if (form.role === "driver" && !form.licenseNumber?.trim()) {
      return toast.error("License number is required for drivers.");
    }

    if (modalType === "add" && requireDocs) {
      if (!form.photoUrl) return toast.error("Photo is mandatory for admin/driver.");
      if (!form.approvalLetterUrl) return toast.error("Approval letter is mandatory for admin/driver.");
    }

    if (form.role === "driver" && !form.assignedBusId) {
      return toast.error("Please assign a bus to this driver.");
    }

    if (uploadingPhoto || uploadingLetter) return toast.error("Wait for uploads to finish.");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,

      studentId: form.role === "student" ? form.studentId?.trim() : undefined,
      licenseNumber: form.role === "driver" ? form.licenseNumber?.trim() : undefined,

      photoUrl: requireDocs ? form.photoUrl || undefined : undefined,
      approvalLetterUrl: requireDocs ? form.approvalLetterUrl || undefined : undefined,

      assignedBusId: form.role === "driver" ? form.assignedBusId : undefined,
    };

    try {
      toast.message("Saving to server...");

      if (modalType === "edit") {
        const res = await fetch(API.userUpdate(selectedId as string), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Update failed");

        const updated: IUser = {
          id: json?.data?._id || json?.data?.id || (selectedId as string),
          name: json?.data?.name,
          email: json?.data?.email,
          role: json?.data?.role,
          studentId: json?.data?.studentId,
          licenseNumber: json?.data?.licenseNumber,
          photoUrl: json?.data?.photoUrl || json?.data?.photo,
          approvalLetterUrl: json?.data?.approvalLetterUrl || json?.data?.approvalLetter,
          assignedBusId: json?.data?.assignedBusId,
          assignedBusName: json?.data?.assignedBusName,
          createdAt: json?.data?.createdAt,
        };

        setUsers((prev) => prev.map((x) => (x.id === selectedId ? updated : x)));
        toast.success("User updated successfully.");
      } else {
        const res = await fetch(API.userAdd, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Create failed");

        const created: IUser = {
          id: json?.data?._id || json?.data?.id,
          name: json?.data?.name,
          email: json?.data?.email,
          role: json?.data?.role,
          studentId: json?.data?.studentId,
          licenseNumber: json?.data?.licenseNumber,
          photoUrl: json?.data?.photoUrl || json?.data?.photo,
          approvalLetterUrl: json?.data?.approvalLetterUrl || json?.data?.approvalLetter,
          assignedBusId: json?.data?.assignedBusId,
          assignedBusName: json?.data?.assignedBusName,
          createdAt: json?.data?.createdAt,
        };

        setUsers((prev) => [...prev, created]);
        toast.success("User added successfully.");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Save failed.");
    }
  };

  const loadPending = async () => {
  setPendingLoading(true);
  try {
    const json = await apiFetch<any>("/auth/get-pending-registrations", {}, accessToken);
    setPending(
      (json?.data || []).map((r: any) => ({
        id: r._id,
        name: r.name,
        email: r.email,
        role: r.role,
        studentId: r.clientInfo?.rollNumber || r.studentId,
        licenseNumber: r.clientInfo?.licenseNumber || r.licenseNumber,
        photoUrl: r.profileImage || r.photoUrl,
        approvalLetterUrl: r.approvalLetter || r.approvalLetterUrl,
        createdAt: r.createdAt,
      }))
    );
  } catch (e: any) {
    toast.error(e.message);
  } finally {
    setPendingLoading(false);
  }
};


  const openPending = async () => {
    setPendingOpen(true);
    await loadPending();
  };

  const startApprove = (item: IPendingRequest) => {
    setApprovalItem(item);
    setApprovalOpen(true);
  };

  const confirmApprove = async () => {
    if (!approvalItem) return;

    if (approvalItem.role === "driver") {
      setAssignBusId("");
      setAssignBusOpen(true);
      return;
    }

    await finalizeApprove({});
  };

  const finalizeApprove = async (extra: { assignedBusId?: string }) => {
    if (!approvalItem) return;

    try {
      toast.message("Approving...");

      const { data } = await apiFetch<RawUser>(`/auth/approve-registration/${approvalItem.id}`, {
        method: "POST",
        body: JSON.stringify({
          assignedBusId: approvalItem.role === "driver" ? extra.assignedBusId : undefined,
        }),
      });

      const created = data;
      setUsers((prev) => [...prev, {
        id: created._id,
        name: created.name,
        email: created.email,
        role: created.role,
        licenseNumber: created.clientInfo?.licenseNumber,
        studentId: created.clientInfo?.rollNumber,
        photoUrl: created.photoUrl || created.photo,
        approvalLetterUrl: created.approvalLetterUrl || created.approvalLetter,
        assignedBusId: created.assignedBusId,
        assignedBusName: created.assignedBusName,
        createdAt: created.createdAt,
      }]);

      setPending((prev) => prev.filter((p) => p.id !== approvalItem.id));
      toast.success("Approved and added to users.");

      setAssignBusOpen(false);
      setApprovalOpen(false);
      setApprovalItem(null);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Approval failed'));
    }
  };


  const rejectPending = async (id: string) => {
    if (!window.confirm("Reject this registration request?")) return;

    try {
      await apiFetch<null>(`/auth/reject-registration/${id}`, { method: "DELETE" });
      setPending((prev) => prev.filter((p) => p.id !== id));
      toast.success("Request rejected.");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Rejection failed'));
    }
  };


  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative font-sans text-gray-800">
      { }
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#E31E24] text-white rounded-xl shadow-lg"
        >
          <MdMenu size={24} />
        </button>
      )}

      { }
      <AnimatePresence>
        {(isOpen || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed lg:sticky top-0 left-0 z-50 bg-[#E31E24] text-white flex flex-col shadow-2xl w-full lg:w-72 h-screen overflow-hidden"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-4 left-4 p-2 rounded-md bg-white/20"
            >
              <MdClose size={24} />
            </button>

            <div className="p-6 flex flex-col items-center border-b border-white/10 mt-12 lg:mt-0">
              <h1 className="text-xl font-black mb-6 tracking-tight italic">
                CAMPUS<span className="text-white/70">CONNECT</span>
              </h1>
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold italic opacity-50">ADMIN</span>
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white text-[#E31E24] rounded-full shadow-md">
                  <MdEdit size={12} />
                </button>
              </div>
              <h2 className="font-bold text-base uppercase tracking-widest">{admin.name}</h2>
            </div>

            <nav className="flex-1 mt-4 px-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                    pathname === item.href
                      ? "bg-white text-[#E31E24] shadow-md"
                      : "hover:bg-white/10 text-white/90"
                  }`}
                >
                  <item.icon size={20} /> <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-white/10 mb-4 lg:mb-0">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-4 w-full px-18.5 py-3 hover:bg-white/10 rounded-xl font-bold transition-colors"
              >
                <MdLogout size={20} /> <span className="text-sm">Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      { }
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full max-w-7xl mx-auto">
          { }
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                User Management
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Manage Students, Drivers and Admins.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name / email / id / bus..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>

              <button
                onClick={openAdd}
                className="bg-[#E31E24] text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} /> Add User
              </button>

              <button
                onClick={openPending}
                className="bg-white border border-gray-200 px-5 py-3 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <Clock size={18} className="text-[#E31E24]" /> Pending Requests
              </button>
            </div>
          </div>

          { }
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8 flex flex-wrap gap-2">
            {[
              { id: "student", label: "Students", icon: Users },
              { id: "driver", label: "Drivers", icon: Bus },
              { id: "admin", label: "Admins", icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as UserRole)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-[#E31E24] text-white shadow-lg shadow-red-200"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          { }
          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden min-h-[520px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <MdPeople className="text-[#E31E24]" /> {prettyRole(activeTab)} List
              </h3>
              <div className="text-xs font-black text-gray-400">
                Total: <span className="text-gray-700">{filteredUsers.length}</span>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <Users className="text-[#E31E24]" />
                  </div>
                  <h4 className="mt-4 font-black text-gray-900">No users found</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Add a new user or approve a pending request.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-4">Name</th>
                      <th className="pb-4">Email</th>
                      <th className="pb-4">Role Details</th>
                      {activeTab === "driver" && <th className="pb-4">Assigned Bus</th>}
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-gray-50 hover:bg-red-50/30 transition-colors"
                      >
                        <td className="py-4 font-black text-gray-900">{u.name}</td>
                        <td className="py-4 text-gray-600">{u.email}</td>
                        <td className="py-4 text-xs text-gray-600">
                          {u.role === "student" && (
                            <div className="font-semibold">
                              Student ID:{" "}
                              <span className="font-black">{u.studentId || "—"}</span>
                            </div>
                          )}
                          {u.role === "driver" && (
                            <div className="font-semibold">
                              License:{" "}
                              <span className="font-black">{u.licenseNumber || "—"}</span>
                            </div>
                          )}
                          {u.role === "admin" && (
                            <div className="font-black text-red-600">System Admin</div>
                          )}

                          {(u.photoUrl || u.approvalLetterUrl) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {u.photoUrl ? (
                                <button
                                  type="button"
                                  onClick={() => safeOpen(u.photoUrl)}
                                  className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                >
                                  <Users size={12} /> Photo
                                </button>
                              ) : null}
                              {u.approvalLetterUrl ? (
                                <button
                                  type="button"
                                  onClick={() => safeOpen(u.approvalLetterUrl)}
                                  className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                >
                                  <FileText size={12} /> Letter
                                </button>
                              ) : null}
                            </div>
                          )}
                        </td>

                        {activeTab === "driver" && (
                          <td className="py-4 text-xs text-gray-600">
                            <span className="font-black text-blue-600">
                              {u.assignedBusName || "Not Assigned"}
                            </span>
                          </td>
                        )}

                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      { }
      <AnimatePresence>
        {isModalOpen && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.96, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white rounded-[2.2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <HeaderModal
                title={`${modalType === "add" ? "Add" : "Update"} ${prettyRole(form.role as UserRole) || "User"}`}
                subtitle="Fill the same fields as registration. Admin/Driver require documents."
                onClose={() => setIsModalOpen(false)}
              />

              <form onSubmit={saveUser} className="p-8 space-y-6">
                { }
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;
                      setForm((p) => ({
                        ...p,
                        role,
                        studentId: role === "student" ? p.studentId : "",
                        licenseNumber: role === "driver" ? p.licenseNumber : "",
                        assignedBusId: role === "driver" ? p.assignedBusId : "",
                        assignedBusName: role === "driver" ? p.assignedBusName : "",
                      }));
                    }}
                    className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white font-black"
                  >
                    <option value="student">Student</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                { }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name || ""}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email || ""}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {}
                {form.role === "student" && (
                  <div>
                    <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                      Student ID
                    </label>
                    <input
                      type="text"
                      required
                      value={form.studentId || ""}
                      onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                      className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                    />
                  </div>
                )}

                {form.role === "driver" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                        License Number
                      </label>
                      <input
                        type="text"
                        required
                        value={form.licenseNumber || ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, licenseNumber: e.target.value }))
                        }
                        className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                        Assign Bus
                      </label>
                      <select
                        value={form.assignedBusId || ""}
                        onChange={(e) => {
                          const id = e.target.value;
                          const bus = buses.find((b) => b.id === id);
                          setForm((p) => ({
                            ...p,
                            assignedBusId: id || undefined,
                            assignedBusName: bus ? `${bus.name} (${bus.plateNumber})` : undefined,
                          }));
                        }}
                        className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-white font-black"
                      >
                        <option value="">-- Select a Bus --</option>
                        {buses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.plateNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {}
                {(form.role === "admin" || form.role === "driver") && (
                  <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-black uppercase text-gray-700 flex items-center gap-2">
                          <BadgeCheck size={16} className="text-[#E31E24]" />
                          Required Documents
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {modalType === "add"
                            ? "Photo and approval letter are mandatory."
                            : "You can keep existing documents or upload new ones."}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      { }
                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black uppercase text-gray-600">
                            Photo {modalType === "add" ? "(Mandatory)" : "(Optional)"}
                          </div>
                          <button
                            type="button"
                            onClick={pickPhoto}
                            disabled={uploadingPhoto}
                            className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                              uploadingPhoto
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#E31E24] text-white hover:bg-red-700 shadow-lg shadow-red-200"
                            }`}
                          >
                            <Upload size={16} /> {uploadingPhoto ? "Uploading..." : "Upload"}
                          </button>
                          <input
                            ref={photoRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onPhotoChange}
                          />
                        </div>

                        <div className="mt-3">
                          {form.photoUrl ? (
                            <button
                              type="button"
                              onClick={() => safeOpen(form.photoUrl)}
                              className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                            >
                              <div className="text-sm font-black text-gray-900">Photo Ready</div>
                              <div className="text-xs text-gray-500 break-all">{form.photoUrl}</div>
                            </button>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {modalType === "add"
                                ? "Upload a photo to continue."
                                : "No photo selected."}
                            </div>
                          )}
                        </div>
                      </div>

                      { }
                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black uppercase text-gray-600">
                            Approval Letter {modalType === "add" ? "(Mandatory)" : "(Optional)"}
                          </div>
                          <button
                            type="button"
                            onClick={pickLetter}
                            disabled={uploadingLetter}
                            className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                              uploadingLetter
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#E31E24] text-white hover:bg-red-700 shadow-lg shadow-red-200"
                            }`}
                          >
                            <Upload size={16} /> {uploadingLetter ? "Uploading..." : "Upload"}
                          </button>
                          <input
                            ref={letterRef}
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={onLetterChange}
                          />
                        </div>

                        <div className="mt-3">
                          {form.approvalLetterUrl ? (
                            <button
                              type="button"
                              onClick={() => safeOpen(form.approvalLetterUrl)}
                              className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                            >
                              <div className="text-sm font-black text-gray-900">Letter Ready</div>
                              <div className="text-xs text-gray-500 break-all">
                                {form.approvalLetterUrl}
                              </div>
                            </button>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {modalType === "add"
                                ? "Upload an approval letter to continue."
                                : "No letter selected."}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                { }
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingPhoto || uploadingLetter}
                    className={`flex-1 py-4 rounded-2xl font-black text-white transition-colors shadow-lg flex justify-center items-center gap-2 ${
                      uploadingPhoto || uploadingLetter
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#E31E24] hover:bg-red-700"
                    }`}
                  >
                    <Save size={18} />
                    {modalType === "add" ? "Save User" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>

      { }
      <AnimatePresence>
        {pendingOpen && (
          <Overlay onClose={() => setPendingOpen(false)}>
            <motion.div
              initial={{ scale: 0.96, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white rounded-[2.2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <HeaderModal
                title="Pending Registration Requests"
                subtitle="New users requesting for registration."
                onClose={() => setPendingOpen(false)}
              />

              <div className="p-6">
                {pendingLoading ? (
                  <div className="py-16 text-center text-gray-500 font-bold">
                    Loading requests...
                  </div>
                ) : pending.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                      <Clock className="text-[#E31E24]" />
                    </div>
                    <h4 className="mt-4 font-black text-gray-900">No pending requests</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      New registration requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pending.map((p) => (
                      <div
                        key={p.id}
                        className="border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-black text-gray-900 flex items-center gap-2">
                              {p.name}
                              <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 border border-gray-200 font-black text-gray-600 uppercase">
                                {prettyRole(p.role)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 truncate">{p.email}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Submitted: {formatDate(p.createdAt)}
                            </div>

                            <div className="mt-2 text-xs text-gray-600">
                              {p.role === "student" && (
                                <span className="font-semibold">
                                  Student ID: <span className="font-black">{p.studentId || "—"}</span>
                                </span>
                              )}
                              {p.role === "driver" && (
                                <span className="font-semibold">
                                  License: <span className="font-black">{p.licenseNumber || "—"}</span>
                                </span>
                              )}
                            </div>

                            {(p.photoUrl || p.approvalLetterUrl) && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {p.photoUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => safeOpen(p.photoUrl)}
                                    className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                  >
                                    <Users size={12} /> Photo
                                  </button>
                                ) : null}
                                {p.approvalLetterUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => safeOpen(p.approvalLetterUrl)}
                                    className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                  >
                                    <FileText size={12} /> Letter
                                  </button>
                                ) : null}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => startApprove(p)}
                              className="px-4 py-2 rounded-xl font-black text-sm bg-[#E31E24] text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2"
                            >
                              <BadgeCheck size={18} /> Review & Approve
                            </button>

                            <button
                              onClick={() => rejectPending(p.id)}
                              className="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                              <Trash2 size={18} className="text-red-600" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={loadPending}
                    className="px-4 py-2 rounded-xl font-black text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>

      { }
      <AnimatePresence>
        {approvalOpen && approvalItem && (
          <Overlay
            onClose={() => {
              setApprovalOpen(false);
              setApprovalItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white rounded-[2.2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <HeaderModal
                title="Confirm Approval"
                subtitle="Review all data carefully before approving."
                onClose={() => {
                  setApprovalOpen(false);
                  setApprovalItem(null);
                }}
              />

              <div className="p-6 space-y-4">
                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                  <div className="font-black text-gray-900 text-lg">{approvalItem.name}</div>
                  <div className="text-sm text-gray-600">{approvalItem.email}</div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white border border-gray-200 font-black text-gray-600 uppercase">
                      {prettyRole(approvalItem.role)}
                    </span>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white border border-gray-200 font-black text-gray-600">
                      Submitted: {formatDate(approvalItem.createdAt)}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    {approvalItem.role === "student" && (
                      <div>
                        Student ID:{" "}
                        <span className="font-black">{approvalItem.studentId || "—"}</span>
                      </div>
                    )}
                    {approvalItem.role === "driver" && (
                      <div>
                        License Number:{" "}
                        <span className="font-black">{approvalItem.licenseNumber || "—"}</span>
                      </div>
                    )}
                    {approvalItem.role === "admin" && (
                      <div className="font-black text-red-600">
                        Admin requires documents verification.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {approvalItem.photoUrl ? (
                      <button
                        type="button"
                        onClick={() => safeOpen(approvalItem.photoUrl)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 font-black text-sm"
                      >
                        <Users size={18} /> View Photo
                      </button>
                    ) : null}

                    {approvalItem.approvalLetterUrl ? (
                      <button
                        type="button"
                        onClick={() => safeOpen(approvalItem.approvalLetterUrl)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 font-black text-sm"
                      >
                        <FileText size={18} /> View Letter
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="font-black text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#E31E24]" />
                    Sure about approval?
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Approving will add this user to the user database and remove the pending request.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalOpen(false);
                      setApprovalItem(null);
                    }}
                    className="flex-1 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmApprove}
                    className="flex-1 py-4 rounded-2xl font-black text-white bg-[#E31E24] hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex justify-center items-center gap-2"
                  >
                    <BadgeCheck size={18} /> Approve
                  </button>
                </div>
              </div>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>

      { }
      <AnimatePresence>
        {assignBusOpen && approvalItem?.role === "driver" && (
          <Overlay
            onClose={() => {
              setAssignBusOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white rounded-[2.2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <HeaderModal
                title="Assign Bus to Driver"
                subtitle="Driver approval requires a bus assignment."
                onClose={() => setAssignBusOpen(false)}
              />

              <div className="p-6 space-y-4">
                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                  <div className="font-black text-gray-900">{approvalItem.name}</div>
                  <div className="text-sm text-gray-600">{approvalItem.email}</div>
                  <div className="text-sm text-gray-700 mt-2">
                    License:{" "}
                    <span className="font-black">{approvalItem.licenseNumber || "—"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                    Select Bus
                  </label>
                  <select
                    value={assignBusId}
                    onChange={(e) => setAssignBusId(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-white font-black"
                  >
                    <option value="">-- Select a Bus --</option>
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.plateNumber})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    This assignment is saved in the user database.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignBusOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!assignBusId) return toast.error("Please select a bus for this driver.");
                      finalizeApprove({ assignedBusId: assignBusId });
                    }}
                    className="flex-1 py-4 rounded-2xl font-black text-white bg-[#E31E24] hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex justify-center items-center gap-2"
                  >
                    <Bus size={18} /> Approve & Assign
                  </button>
                </div>
              </div>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}
