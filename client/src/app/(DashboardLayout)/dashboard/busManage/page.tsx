"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Users, Map, Bus, Plus, Trash2, Edit, X, Save, 
  Upload, CheckCircle, AlertTriangle, Clock, MapPin, Search 
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

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  licenseNumber?: string; 
  permitDoc?: string;     
  photo?: string;
}

interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stoppageCount: number;
  stoppages: string[];
  activeHoursComing: string;
  activeHoursGoing: string;
}

interface BusData {
  id: string;
  name: string;
  plateNumber: string;
  routeId: string;
  routeName: string;
  activeHoursComing: string; 
  activeHoursGoing: string;  
  photo?: string;
}

const initialUsers: User[] = [
  { id: "1", name: "Patikor", email: "patikor@student.bu.edu", role: "student" },
  { id: "2", name: "Sourv", email: "sourv@driver.bu.edu", role: "driver", licenseNumber: "LIC-6969" },
];

const initialRoutes: Route[] = [
  { 
    id: "1", 
    name: "Route 1 (Nothullabad)", 
    startPoint: "Campus", 
    endPoint: "Nothullabad", 
    stoppageCount: 2, 
    stoppages: ["Gate 1", "Rupatoli"], 
    activeHoursComing: "08:00 AM - 10:00 AM", 
    activeHoursGoing: "02:00 PM - 04:00 PM" 
  }
];

const initialBuses: BusData[] = [
  { 
    id: "1", 
    name: "Baikali", 
    plateNumber: "DHK-METRO-KA-1234", 
    routeId: "1",
    routeName: "Route 1 (Nothullabad)",
    activeHoursComing: "08:00 AM - 10:00 AM",
    activeHoursGoing: "02:00 PM - 04:00 PM"
  }
];

export default function BusManagementPage() {

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<"users" | "routes" | "buses">("users");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [buses, setBuses] = useState<BusData[]>(initialBuses);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [userForm, setUserForm] = useState<Partial<User>>({ role: "student" });
  const [routeForm, setRouteForm] = useState<Partial<Route>>({ stoppageCount: 0, stoppages: [] });
  const [busForm, setBusForm] = useState<Partial<BusData>>({});

  useEffect(() => {
    setMounted(true);
    if (isOpen || isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen, isModalOpen]);

  const admin = { name: "Admin 1", role: "Admin" };
  const menuItems = [
    { label: "Dashboard Overview", href: "/dashboard", icon: MdDashboard },
    { label: "Bus Management", href: "/dashboard/busManage", icon: MdDirectionsBus },
    { label: "Driver Management", href: "/dashboard/driverManage", icon: MdPeople },
    { label: "Route Management", href: "/dashboard/routeManage", icon: MdMap },
    { label: "Notice Publish", href: "/dashboard/notice", icon: MdNotifications },
  ];

  const handleOpenModal = (type: "add" | "edit", data?: any) => {
    setModalType(type);
    setSelectedId(data?.id || null);
    
    if (type === "add") {
      
      if (activeTab === "users") setUserForm({ role: "student", name: "", email: "", licenseNumber: "" });
      if (activeTab === "routes") setRouteForm({ name: "", startPoint: "", endPoint: "", stoppageCount: 0, stoppages: [], activeHoursComing: "", activeHoursGoing: "" });
      if (activeTab === "buses") setBusForm({ name: "", plateNumber: "", routeId: "" });
    } else if (type === "edit" && data) {
      if (activeTab === "users") setUserForm({ ...data });
      if (activeTab === "routes") setRouteForm({ ...data });
      if (activeTab === "buses") setBusForm({ ...data });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record permanently?")) {
      if (activeTab === "users") setUsers(users.filter(u => u.id !== id));
      if (activeTab === "routes") setRoutes(routes.filter(r => r.id !== id));
      if (activeTab === "buses") setBuses(buses.filter(b => b.id !== id));
      toast.success("Record deleted successfully from Database.");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "users") {
       if (modalType === "edit" && window.confirm("Are you sure you want to update this user?")) {
          setUsers(users.map(u => u.id === selectedId ? { ...u, ...userForm } as User : u));
          toast.success("User Updated in Database");
       } else if (modalType === "add") {
          setUsers([...users, { id: Date.now().toString(), ...userForm } as User]);
          toast.success("User Added to Database");
       }
    }
    else if (activeTab === "routes") {
       const finalRouteData = {
          ...routeForm,
          
          stoppages: routeForm.stoppages?.slice(0, routeForm.stoppageCount) || []
       } as Route;

       if (modalType === "edit" && window.confirm("Save changes to this route?")) {
         setRoutes(routes.map(r => r.id === selectedId ? { ...r, ...finalRouteData } : r));
         toast.success("Route Updated");
       } else if (modalType === "add") {
         setRoutes([...routes, { id: Date.now().toString(), ...finalRouteData }]);
         toast.success("Route Added");
       }
    }
    else if (activeTab === "buses") {
       if (modalType === "edit" && window.confirm("Update bus details?")) {
         setBuses(buses.map(b => b.id === selectedId ? { ...b, ...busForm } as BusData : b));
         toast.success("Bus Updated");
       } else if (modalType === "add") {
         setBuses([...buses, { id: Date.now().toString(), ...busForm } as BusData]);
         toast.success("Bus Added");
       }
    }
    setIsModalOpen(false);
  };

  const handleStoppageCountChange = (count: number) => {
    const newStoppages = [...(routeForm.stoppages || [])];

    if (count > newStoppages.length) {
       for(let i = newStoppages.length; i < count; i++) newStoppages.push("");
    }
    setRouteForm({ ...routeForm, stoppageCount: count, stoppages: newStoppages });
  };

  const updateStoppageName = (index: number, val: string) => {
     const newStoppages = [...(routeForm.stoppages || [])];
     newStoppages[index] = val;
     setRouteForm({ ...routeForm, stoppages: newStoppages });
  };

  const handleBusRouteChange = (routeId: string) => {
    const selectedRoute = routes.find(r => r.id === routeId);
    if (selectedRoute) {
      setBusForm({ 
        ...busForm, 
        routeId: routeId,
        routeName: selectedRoute.name,
        activeHoursComing: selectedRoute.activeHoursComing, 
        activeHoursGoing: selectedRoute.activeHoursGoing 
      });
    } else {
        setBusForm({ ...busForm, routeId: "" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative font-sans text-gray-800">
      
      {}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#E31E24] text-white rounded-lg shadow-lg">
          <MdMenu size={24} />
        </button>
      )}

      <AnimatePresence>
        {(isOpen || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }}
            className="fixed lg:sticky top-0 left-0 z-50 bg-[#E31E24] text-white flex flex-col shadow-2xl w-full lg:w-72 h-screen overflow-hidden"
          >
            <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-4 left-4 p-2 rounded-md bg-white/20">
              <MdClose size={24} />
            </button>
            <div className="p-6 flex flex-col items-center border-b border-white/10 mt-12 lg:mt-0">
              <h1 className="text-xl font-black mb-6 tracking-tight italic">CAMPUS<span className="text-white/70">CONNECT</span></h1>
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold italic opacity-50">ADMIN</span>
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white text-[#E31E24] rounded-full shadow-md"><MdEdit size={12} /></button>
              </div>
              <h2 className="font-bold text-base uppercase tracking-widest">{admin.name}</h2>
            </div>
            <nav className="flex-1 mt-4 px-4 space-y-1">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${pathname === item.href ? "bg-white text-[#E31E24] shadow-md" : "hover:bg-white/10 text-white/90"}`}>
                  <item.icon size={20} /> <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-6 border-t border-white/10 mb-4 lg:mb-0">
              <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-4 w-full px-18.5 py-3 hover:bg-white/10 rounded-xl font-bold transition-colors">
                <MdLogout size={20} /> <span className="text-sm">Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Management Console</h1>
                <p className="text-gray-500 text-sm font-medium">Manage Users, Routes and Fleet</p>
            </div>
          </div>

          {}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8 flex flex-wrap gap-2">
            {[
              { id: "users", label: "Users Management", icon: Users },
              { id: "routes", label: "Route Management", icon: Map },
              { id: "buses", label: "Bus Management", icon: Bus },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
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

          {}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            
            {}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                 {activeTab === 'users' && <Users size={20} className="text-[#E31E24]" />}
                 {activeTab === 'routes' && <Map size={20} className="text-[#E31E24]" />}
                 {activeTab === 'buses' && <Bus size={20} className="text-[#E31E24]" />}
                 {activeTab} List
               </h3>
               <button onClick={() => handleOpenModal("add")} className="bg-[#E31E24] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg flex items-center gap-2">
                 <Plus size={18} /> Add New
               </button>
            </div>

            {}
            <div className="p-6 overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        {activeTab === "users" && <><th className="pb-4">Name</th><th className="pb-4">Email</th><th className="pb-4">Role</th></>}
                        {activeTab === "routes" && <><th className="pb-4">Route Name</th><th className="pb-4">Route Info</th><th className="pb-4">Active Hours</th></>}
                        {activeTab === "buses" && <><th className="pb-4">Bus Name</th><th className="pb-4">Plate</th><th className="pb-4">Assigned Route</th></>}
                        <th className="pb-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    {activeTab === "users" && users.map(user => (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors group">
                           <td className="py-4 font-bold text-gray-800">{user.name}</td>
                           <td className="py-4 text-gray-600">{user.email}</td>
                           <td className="py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : user.role === 'driver' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{user.role}</span></td>
                           <td className="py-4 text-right flex justify-end gap-2">
                              <button onClick={() => handleOpenModal("edit", user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                              <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                           </td>
                        </tr>
                    ))}

                    {activeTab === "routes" && routes.map(route => (
                        <tr key={route.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                           <td className="py-4 font-bold text-gray-800">{route.name}</td>
                           <td className="py-4 text-gray-600">
                              <div className="flex items-center gap-1 text-xs"><MapPin size={12}/> {route.startPoint} ➝ {route.endPoint}</div>
                              <div className="text-xs text-gray-400 mt-1">{route.stoppageCount} Stoppages</div>
                           </td>
                           <td className="py-4 text-xs text-gray-500">
                              <div>IN: {route.activeHoursComing}</div>
                              <div>OUT: {route.activeHoursGoing}</div>
                           </td>
                           <td className="py-4 text-right flex justify-end gap-2">
                              <button onClick={() => handleOpenModal("edit", route)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                              <button onClick={() => handleDelete(route.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                           </td>
                        </tr>
                    ))}

                    {activeTab === "buses" && buses.map(bus => (
                        <tr key={bus.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                           <td className="py-4 font-bold text-gray-800">{bus.name}</td>
                           <td className="py-4 text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded w-fit">{bus.plateNumber}</td>
                           <td className="py-4 text-gray-600 text-xs">
                              <span className="font-bold text-blue-600">{bus.routeName}</span>
                              <div className="mt-1 opacity-70">Coming: {bus.activeHoursComing}</div>
                           </td>
                           <td className="py-4 text-right flex justify-end gap-2">
                              <button onClick={() => handleOpenModal("edit", bus)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                              <button onClick={() => handleDelete(bus.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                           </td>
                        </tr>
                    ))}
                 </tbody>
               </table>
               
               {}
               {((activeTab === 'users' && users.length === 0) || 
                 (activeTab === 'routes' && routes.length === 0) || 
                 (activeTab === 'buses' && buses.length === 0)) && (
                  <div className="text-center py-20 opacity-50">
                    <p>No records found in database.</p>
                  </div>
               )}
            </div>
          </div>

        </div>
      </main>

      {}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
               initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
               className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
            >
              {}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  {modalType === "add" ? "Add New" : "Update"} {activeTab === "users" ? "User" : activeTab === "routes" ? "Route" : "Bus"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {}
              <form onSubmit={handleSave} className="p-8 space-y-6">
                
                {}
                {activeTab === "users" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full">
                       <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Role</label>
                       <select 
                        value={userForm.role} 
                        onChange={(e) => setUserForm({...userForm, role: e.target.value as UserRole})}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold"
                       >
                         <option value="student">Student</option>
                         <option value="driver">Driver</option>
                         <option value="admin">Admin</option>
                       </select>
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Full Name</label>
                      <input type="text" required value={userForm.name || ""} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Email</label>
                      <input type="email" required value={userForm.email || ""} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white transition-all" />
                    </div>

                    {}
                    {(userForm.role === 'driver' || userForm.role === 'admin') && (
                       <div className="col-span-full space-y-4 border-t border-gray-100 pt-4 mt-2">
                          <div className="bg-yellow-50 p-3 rounded-lg flex gap-2 text-xs text-yellow-700">
                             <AlertTriangle size={16} /> Additional documents required for {userForm.role}s.
                          </div>
                          
                          {userForm.role === 'driver' && (
                             <div>
                                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">License Number</label>
                                <input type="text" required value={userForm.licenseNumber || ""} onChange={(e) => setUserForm({...userForm, licenseNumber: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                             </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                             <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer transition-colors group">
                                <Upload size={24} className="text-gray-400 group-hover:text-red-500 mb-2"/>
                                <span className="text-xs font-bold text-gray-600">Upload Photo</span>
                                <span className="text-[10px] text-gray-400">Via Cloudinary</span>
                                <input type="file" className="hidden" />
                             </div>
                             <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer transition-colors group">
                                <Upload size={24} className="text-gray-400 group-hover:text-red-500 mb-2"/>
                                <span className="text-xs font-bold text-gray-600">Approval / Permit</span>
                                <span className="text-[10px] text-gray-400">PDF or Image</span>
                                <input type="file" className="hidden" />
                             </div>
                          </div>
                       </div>
                    )}
                  </div>
                )}

                {}
                {activeTab === "routes" && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Route Name</label>
                          <input type="text" placeholder="e.g. Route 1" required value={routeForm.name || ""} onChange={(e) => setRouteForm({...routeForm, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-red-500" />
                       </div>
                       <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">No. of Stoppages</label>
                          <input type="number" min="0" value={routeForm.stoppageCount || 0} onChange={(e) => handleStoppageCountChange(parseInt(e.target.value))} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-red-500" />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Start Point</label>
                           <input type="text" required value={routeForm.startPoint || ""} onChange={(e) => setRouteForm({...routeForm, startPoint: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                        </div>
                        <div>
                           <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">End Point</label>
                           <input type="text" required value={routeForm.endPoint || ""} onChange={(e) => setRouteForm({...routeForm, endPoint: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                        </div>
                     </div>
                     
                     {}
                     {(routeForm.stoppageCount || 0) > 0 && (
                        <div className="bg-gray-50 p-4 rounded-xl space-y-2 max-h-40 overflow-y-auto">
                           <span className="text-xs font-bold text-gray-400 block mb-2">Stoppage Names</span>
                           {Array.from({ length: routeForm.stoppageCount || 0 }).map((_, idx) => (
                              <input 
                                key={idx} 
                                type="text" 
                                placeholder={`Stoppage ${idx + 1}`}
                                value={routeForm.stoppages?.[idx] || ""}
                                onChange={(e) => updateStoppageName(idx, e.target.value)}
                                className="w-full p-2 text-sm rounded-lg border border-gray-200 mb-1"
                              />
                           ))}
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                           <label className="text-xs font-bold uppercase text-gray-500 mb-1 block flex items-center gap-1"><Clock size={12}/> Active Hours (Coming)</label>
                           <input type="text" placeholder="e.g. 08:00 AM - 10:00 AM" value={routeForm.activeHoursComing || ""} onChange={(e) => setRouteForm({...routeForm, activeHoursComing: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                        </div>
                        <div>
                           <label className="text-xs font-bold uppercase text-gray-500 mb-1 block flex items-center gap-1"><Clock size={12}/> Active Hours (Going)</label>
                           <input type="text" placeholder="e.g. 02:00 PM - 04:00 PM" value={routeForm.activeHoursGoing || ""} onChange={(e) => setRouteForm({...routeForm, activeHoursGoing: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none" />
                        </div>
                     </div>
                  </div>
                )}

                {}
                {activeTab === "buses" && (
                   <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Bus Name</label>
                          <input type="text" required value={busForm.name || ""} onChange={(e) => setBusForm({...busForm, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-red-500" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Number Plate</label>
                          <input type="text" required value={busForm.plateNumber || ""} onChange={(e) => setBusForm({...busForm, plateNumber: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-red-500 font-mono" />
                        </div>
                      </div>

                      {}
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer transition-colors">
                            <Upload size={24} className="text-gray-400 mb-2"/>
                            <span className="text-xs font-bold text-gray-600">Bus Photo (Optional)</span>
                            <span className="text-[10px] text-gray-400">Via Cloudinary</span>
                            <input type="file" className="hidden" />
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                         <label className="text-xs font-bold uppercase text-blue-600 mb-2 block">Assign Route</label>
                         <select 
                            value={busForm.routeId || ""} 
                            onChange={(e) => handleBusRouteChange(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white font-semibold"
                         >
                            <option value="">-- Select a Route --</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                         </select>

                         {}
                         {busForm.routeId && (
                             <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                   <span className="text-[10px] uppercase text-gray-400 font-bold block">Active Coming</span>
                                   <span className="text-sm font-bold text-gray-700">{busForm.activeHoursComing}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-100">
                                   <span className="text-[10px] uppercase text-gray-400 font-bold block">Active Going</span>
                                   <span className="text-sm font-bold text-gray-700">{busForm.activeHoursGoing}</span>
                                </div>
                             </div>
                         )}
                      </div>
                   </div>
                )}

                {}
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-4 rounded-xl font-bold text-white bg-[#E31E24] hover:bg-red-700 transition-colors shadow-lg flex justify-center items-center gap-2">
                    <Save size={18} /> Save to Database
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}