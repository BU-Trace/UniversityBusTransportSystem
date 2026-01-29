"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Search,
  Upload,
  FileText,
  Bell,
  ExternalLink,
  Loader2,
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

/**
 * FILE PATH (put this file here):
 * client/src/app/(DashboardLayout)/dashboard/notice/page.tsx
 *
 * Admin + SuperAdmin:
 * - Create notice (text OR pdf)
 * - Publish notice (immediately visible for all users)
 * - Delete notice (remove from notice board)
 *
 * Also calls backend "notify all devices" endpoint after publish.
 *
 * IMPORTANT:
 * You MUST align API paths below with your backend.
 * If your backend already uses different endpoints, just change API.* urls.
 */

type UserRole = "student" | "driver" | "admin" | "superadmin";

type NoticeType = "text" | "pdf";

type INotice = {
  id: string;
  title: string;
  type: NoticeType;
  body?: string; // for text notice
  fileUrl?: string; // for pdf notice
  createdAt?: string;
  publishedAt?: string;
  isPublished?: boolean;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

/**
 * 🔧 CHANGE THESE to match your backend routes
 * Suggested minimal backend endpoints:
 * - GET    /notice/get-all-notices
 * - POST   /notice/create-notice
 * - PUT    /notice/publish-notice/:id     (optional if create already publishes)
 * - DELETE /notice/delete-notice/:id
 * - POST   /notice/notify-all/:id         (send push/websocket/whatever you use)
 */
const API = {
  getAll: `${BASE_URL}/notice/get-all-notices`,
  create: `${BASE_URL}/notice/create-notice`,
  publish: (id: string) => `${BASE_URL}/notice/publish-notice/${id}`,
  delete: (id: string) => `${BASE_URL}/notice/delete-notice/${id}`,
  notifyAll: (id: string) => `${BASE_URL}/notice/notify-all/${id}`,
};

// Cloudinary (optional) for PDF upload
const CLOUD_NAME = "dpiofecgs";
const UPLOAD_PRESET = "butrace";

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Something went wrong";
}

async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json as T;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Cloudinary returns useful error object
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }
  return data.secure_url as string;
}

function safeOpen(url?: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function formatDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
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

export default function NoticeManagementPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const accessToken = (session as any)?.accessToken as string | undefined;
  const myRole = ((session as any)?.user?.role || (session as any)?.role) as
    | UserRole
    | undefined;

  const [mounted, setMounted] = useState(false);

  // sidebar
  const [isOpen, setIsOpen] = useState(false);

  // data
  const [notices, setNotices] = useState<INotice[]>([]);
  const [loading, setLoading] = useState(false);

  // search
  const [query, setQuery] = useState("");

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // form
  const [noticeType, setNoticeType] = useState<NoticeType>("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const lock = isOpen || isModalOpen;
    document.body.style.overflow = lock ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isModalOpen]);

  // Guard
  useEffect(() => {
    if (!mounted) return;
    if (!session) return;

    if (myRole !== "admin" && myRole !== "superadmin") {
      toast.error("Not authorized");
      router.replace("/");
    }
  }, [mounted, session, myRole, router]);

  const admin = {
    name: "Admin",
    role: myRole === "superadmin" ? "Super Admin" : "Admin",
  };

  const menuItems = [
    { label: "Dashboard Overview", href: "/dashboard", icon: MdDashboard },
    { label: "Bus Management", href: "/dashboard/busManage", icon: MdDirectionsBus },
    { label: "User Management", href: "/dashboard/userManage", icon: MdPeople },
    { label: "Route Management", href: "/dashboard/routeManage", icon: MdMap },
    { label: "Notice Publish", href: "/dashboard/notice", icon: MdNotifications },
  ];

  const normalizeNotice = (n: any): INotice => ({
    id: n?._id || n?.id,
    title: n?.title || "",
    type: n?.type || (n?.fileUrl ? "pdf" : "text"),
    body: n?.body || n?.text || "",
    fileUrl: n?.fileUrl || n?.pdfUrl || n?.attachmentUrl || "",
    createdAt: n?.createdAt,
    publishedAt: n?.publishedAt,
    isPublished: n?.isPublished ?? n?.published ?? true,
  });

  const loadNotices = async () => {
    setLoading(true);
    try {
      const json = await apiFetch<any>(API.getAll, {}, accessToken);
      const list = (json?.data || []).map(normalizeNotice);
      setNotices(list);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (myRole !== "admin" && myRole !== "superadmin") return;
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, myRole]);

  const filteredNotices = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notices;
    return notices.filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        (n.body || "").toLowerCase().includes(q)
      );
    });
  }, [notices, query]);

  const openAdd = () => {
    setModalType("add");
    setSelectedId(null);
    setNoticeType("text");
    setTitle("");
    setBody("");
    setFileUrl("");
    setIsModalOpen(true);
  };

  const openEdit = (n: INotice) => {
    setModalType("edit");
    setSelectedId(n.id);
    setNoticeType(n.type);
    setTitle(n.title || "");
    setBody(n.body || "");
    setFileUrl(n.fileUrl || "");
    setIsModalOpen(true);
  };

  const pickFile = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // You asked for pdf or text. This upload field is for pdf.
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please upload a PDF file.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      toast.message("Uploading PDF...");
      const url = await uploadToCloudinary(file);
      setFileUrl(url);
      toast.success("PDF uploaded.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (noticeType === "text") {
      if (!body.trim()) return "Notice text is required";
    } else {
      if (!fileUrl.trim()) return "PDF is required";
    }
    return null;
  };

  /**
   * Create notice + publish + notify all
   * If your backend auto-publishes on create, the "publish" call may be unnecessary.
   */
  const saveNotice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) return toast.error("Wait for upload to finish.");
    const msg = validate();
    if (msg) return toast.error(msg);

    const payload = {
      title: title.trim(),
      type: noticeType,
      body: noticeType === "text" ? body.trim() : undefined,
      fileUrl: noticeType === "pdf" ? fileUrl.trim() : undefined,
    };

    try {
      toast.message(modalType === "edit" ? "Updating notice..." : "Publishing notice...");

      let saved: INotice;

      if (modalType === "edit" && selectedId) {
        // If you don't have update endpoint, you can remove edit feature.
        // This uses publish endpoint as update OR you can create a dedicated update route.
        const json = await apiFetch<any>(
          API.publish(selectedId),
          { method: "PUT", body: JSON.stringify(payload) },
          accessToken
        );
        saved = normalizeNotice(json?.data);
        setNotices((prev) => prev.map((x) => (x.id === selectedId ? saved : x)));
      } else {
        const json = await apiFetch<any>(
          API.create,
          { method: "POST", body: JSON.stringify(payload) },
          accessToken
        );
        saved = normalizeNotice(json?.data);
        setNotices((prev) => [saved, ...prev]);
      }

      // Notify all devices/users (push/websocket/etc.)
      // If you already do this inside create/publish, you can delete this call.
      try {
        await apiFetch<any>(API.notifyAll(saved.id), { method: "POST" }, accessToken);
      } catch (notifyErr) {
        // Don't block notice creation if notification fails, but show warning
        toast.error(`Notice saved, but notification failed: ${getErrorMessage(notifyErr)}`);
      }

      toast.success("Notice published and notified to users.");
      setIsModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const deleteNotice = async (id: string) => {
    if (!window.confirm("Delete this notice from notice board?")) return;
    try {
      toast.message("Deleting...");
      await apiFetch<any>(API.delete(id), { method: "DELETE" }, accessToken);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notice deleted.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative font-sans text-gray-800">
      {/* mobile menu btn */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#E31E24] text-white rounded-xl shadow-lg"
        >
          <MdMenu size={24} />
        </button>
      )}

      {/* sidebar */}
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
                  <span className="text-sm font-bold italic opacity-70">
                    {admin.role?.toUpperCase()}
                  </span>
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

      {/* main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full max-w-7xl mx-auto">
          {/* header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                Notice Publish
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Publish text or PDF notices. Users will get notified and it will appear in notice board.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title / text..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>

              <button
                onClick={openAdd}
                className="bg-[#E31E24] text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} /> New Notice
              </button>

              <button
                onClick={loadNotices}
                className="bg-white border border-gray-200 px-5 py-3 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <Bell size={18} className="text-[#E31E24]" /> Refresh
              </button>
            </div>
          </div>

          {/* list */}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden min-h-[520px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <MdNotifications className="text-[#E31E24]" /> Notices
              </h3>
              <div className="text-xs font-black text-gray-400">
                Total:{" "}
                <span className="text-gray-700">
                  {loading ? "..." : filteredNotices.length}
                </span>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              {loading ? (
                <div className="text-center py-20 text-gray-500 font-bold flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Loading notices...
                </div>
              ) : filteredNotices.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <Bell className="text-[#E31E24]" />
                  </div>
                  <h4 className="mt-4 font-black text-gray-900">No notices found</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Publish a notice to notify all users.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-4">Title</th>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Preview</th>
                      <th className="pb-4">Created</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredNotices.map((n) => (
                      <tr
                        key={n.id}
                        className="border-b border-gray-50 hover:bg-red-50/30 transition-colors"
                      >
                        <td className="py-4">
                          <div className="font-black text-gray-900">{n.title}</div>
                          {n.type === "text" && n.body ? (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-[520px]">
                              {n.body}
                            </div>
                          ) : null}
                        </td>

                        <td className="py-4">
                          <span
                            className={`text-[11px] px-2 py-1 rounded-full border font-black uppercase ${
                              n.type === "pdf"
                                ? "bg-blue-50 border-blue-100 text-blue-700"
                                : "bg-gray-100 border-gray-200 text-gray-700"
                            }`}
                          >
                            {n.type}
                          </span>
                        </td>

                        <td className="py-4 text-xs text-gray-600">
                          {n.type === "pdf" ? (
                            n.fileUrl ? (
                              <button
                                type="button"
                                onClick={() => safeOpen(n.fileUrl)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-black text-xs"
                              >
                                <FileText size={16} /> Open PDF <ExternalLink size={14} />
                              </button>
                            ) : (
                              "—"
                            )
                          ) : (
                            <span className="font-black text-gray-500">Text</span>
                          )}
                        </td>

                        <td className="py-4 text-xs text-gray-600">{formatDate(n.createdAt)}</td>

                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(n)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteNotice(n.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Delete"
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

      {/* modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.96, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white rounded-[2.2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <HeaderModal
                title={modalType === "add" ? "New Notice" : "Update Notice"}
                subtitle="Publish text or PDF. It will show in notice board and notify users."
                onClose={() => setIsModalOpen(false)}
              />

              <form onSubmit={saveNotice} className="p-8 space-y-6">
                {/* type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                      Notice Type
                    </label>
                    <select
                      value={noticeType}
                      onChange={(e) => {
                        const t = e.target.value as NoticeType;
                        setNoticeType(t);
                        // clear other field when switching types
                        if (t === "text") setFileUrl("");
                        if (t === "pdf") setBody("");
                      }}
                      className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white font-black"
                    >
                      <option value="text">Text</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Notice title..."
                      className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* content */}
                {noticeType === "text" ? (
                  <div>
                    <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                      Notice Text
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write the notice text..."
                      rows={8}
                      className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white resize-none"
                    />
                    <div className="text-[11px] text-gray-500 mt-2 font-medium">
                      This text will appear in notice popup and notice board.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div className="text-xs font-black uppercase text-gray-700 flex items-center gap-2">
                        <FileText size={16} className="text-[#E31E24]" /> PDF Upload
                      </div>
                      <button
                        type="button"
                        onClick={pickFile}
                        disabled={uploading}
                        className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                          uploading
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-[#E31E24] text-white hover:bg-red-700 shadow-lg shadow-red-200"
                        }`}
                      >
                        <Upload size={16} /> {uploading ? "Uploading..." : "Upload PDF"}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={onFileChange}
                      />
                    </div>

                    <div className="p-4">
                      {fileUrl ? (
                        <button
                          type="button"
                          onClick={() => safeOpen(fileUrl)}
                          className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                        >
                          <div className="text-sm font-black text-gray-900">PDF Ready</div>
                          <div className="text-xs text-gray-500 break-all">{fileUrl}</div>
                        </button>
                      ) : (
                        <div className="text-sm text-gray-500 font-medium">
                          Upload a PDF to publish as notice.
                        </div>
                      )}
                      <div className="text-[11px] text-gray-500 mt-2 font-medium">
                        This PDF link will be visible in notice popup and notice board.
                      </div>
                    </div>
                  </div>
                )}

                {/* actions */}
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
                    disabled={uploading}
                    className={`flex-1 py-4 rounded-2xl font-black text-white transition-colors shadow-lg flex justify-center items-center gap-2 ${
                      uploading ? "bg-gray-300 cursor-not-allowed" : "bg-[#E31E24] hover:bg-red-700"
                    }`}
                  >
                    <Save size={18} />
                    {modalType === "add" ? "Publish Notice" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}
