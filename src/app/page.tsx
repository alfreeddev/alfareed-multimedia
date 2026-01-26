'use client';
import { useState, useRef, useEffect } from 'react';

// Define explicit types to fix "Unexpected any" error
type UserRole = 'admin' | 'worker' | 'customer' | null;

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loginInput, setLoginInput] = useState('');
  // New state for live database records
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  // New state for personal greeting data
  const [userData, setUserData] = useState<{ full_name: string; designation?: string; id?: number } | null>(null);

  const printingRef = useRef<HTMLDivElement>(null);
  const marketingRef = useRef<HTMLDivElement>(null);
  const [projectBriefs, setProjectBriefs] = useState([]);
  const [payroll, setPayroll] = useState([]);

  // SESSION PERSISTENCE: Check for saved user session on page load
  useEffect(() => {
    const savedSession = localStorage.getItem('alfareed_session');
    if (savedSession) {
      const data = JSON.parse(savedSession);
      setUserRole(data.role);
      setUserData(data);
    }
  }, []);

  // Effect to fetch live data from Domain.pk MySQL server
  useEffect(() => {
    if (userRole === 'admin') {
      // Existing attendance fetch
      fetch('/api/attendance/list')
        .then(res => res.json())
        .then(data => setAttendanceLogs(data));
      fetch('/api/admin/payroll')
        .then(res => res.json())
        .then(data => setPayroll(data));  
        
      // NEW: Project briefs fetch
      fetch('/api/projects/list')
        .then(res => res.json())
        .then(data => setProjectBriefs(data));
    }
  }, [userRole]);

  // LOGIC: Optimized Wheel scroll for Service Catalogue (Catalogue Scroll Lock)
  useEffect(() => {
    const slider = printingRef.current;
    if (!slider) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault(); // LOCK vertical page scroll
        slider.scrollLeft += e.deltaY * 2.5; 
      }
    };

    slider.addEventListener('wheel', handleWheel, { passive: false });
    return () => slider.removeEventListener('wheel', handleWheel);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: loginInput, 
          password: (e.target as any).password.value // Accessing the password input
        }),
      });

      const data = await response.json();

      if (data.success) {
        const userPayload = {
          id: data.user.id,
          full_name: data.user.full_name,
          designation: data.user.designation,
          role: data.user.role
        };

        setUserRole(data.user.role);
        setUserData(userPayload);
        
        // SAVE SESSION: Store user data in browser storage
        localStorage.setItem('alfareed_session', JSON.stringify(userPayload));
        
        setIsLoginOpen(false);
      } else {
        alert(data.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      alert("Could not connect to the Domain.pk server.");
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserData(null);
    // CLEAR SESSION: Remove user data from browser storage
    localStorage.removeItem('alfareed_session');
  };

  const services = [
    { id: '01', title: 'Industrial Printing', desc: 'High-speed offset and digital production for large scale requirements.', icon: '🖨️' },
    { id: '02', title: 'Composing & Typing', desc: 'Professional document composing, copy typing, and data entry services.', icon: '⌨️' },
    { id: '03', title: 'Binding & Finishing', desc: 'Spiral, thermal, and hard binding with precision cutting.', icon: '📚' },
    { id: '04', title: 'Lamination & Coating', desc: 'Vivid gloss and matte coatings to protect your essential documentation.', icon: '✨' },
    { id: '05', title: 'Web Development', desc: 'Custom enterprise-grade web solutions and portal management.', icon: '🌐' },
    { id: '06', title: 'Marketing & Ads', desc: 'Strategic advertising campaigns and high-impact branding materials.', icon: '🚀' },
    { id: '07', title: 'Stationery Supplies', desc: 'Premium quality corporate and academic stationery items.', icon: '🖋️' },
  ];

  // DASHBOARD VIEW
  if (userRole) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8 text-[#1a1a1a]">
        <nav className="flex justify-between items-center mb-8 md:mb-12 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col">
            <div className="font-black text-xl tracking-tighter uppercase">
              AL FAREED <span className="text-[#FF6600]">PORTAL</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Welcome back, <span className="text-[#1a1a1a]">{userData?.full_name || 'User'}</span>
              {userData?.designation && ` • ${userData.designation}`}
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-slate-100 px-6 py-2 rounded-full font-bold text-xs uppercase hover:bg-red-50 hover:text-red-500 transition-all"
          >
            Logout
          </button>
        </nav>

        {/* ADMIN DASHBOARD */}
        {userRole === 'admin' && (
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* STAT CARDS SECTION - 2 Columns on Mobile */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Today</p>
                <p className="text-3xl font-black">
                  {Array.isArray(attendanceLogs) ? attendanceLogs.filter((log: any) => !log.check_out).length : 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Leaves</p>
                <p className="text-3xl font-black text-[#FF6600]">03</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total OT Hours</p>
                <p className="text-3xl font-black text-green-600">
                  {Array.isArray(attendanceLogs) 
                    ? attendanceLogs.reduce((acc, log: any) => acc + parseFloat(log.overtime_hrs || 0), 0).toFixed(1) 
                    : "0.0"}h
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-xl flex items-center justify-center">
                <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">DB Sync Live</span>
              </div>
            </div>

            {/* REGISTER TEAM MEMBER SECTION - Stack on Mobile */}
            <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-[#1a1a1a]">Register Team Member</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Add new accounts to MySQL</p>
                </div>
              </div>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData);
                  
                  try {
                    const res = await fetch('/api/users/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    if (res.ok) {
                      alert("Worker registered successfully!");
                      (e.target as HTMLFormElement).reset();
                    } else {
                      const err = await res.json();
                      alert(err.error || "Registration failed");
                    }
                  } catch (err) {
                    alert("Connection error to Domain.pk server");
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase px-2">Full Identity</label>
                  <input name="full_name" placeholder="Full Name" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-none font-medium focus:ring-2 focus:ring-[#FF6600]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase px-2">Access Username</label>
                  <input name="username" placeholder="Username" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-none font-medium focus:ring-2 focus:ring-[#FF6600]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase px-2">Secure Password</label>
                  <input name="password" type="password" placeholder="Password" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-none font-medium focus:ring-2 focus:ring-[#FF6600]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase px-2">Job Designation</label>
                  <input name="designation" placeholder="e.g. Graphic Designer" className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-none font-medium focus:ring-2 focus:ring-[#FF6600]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase px-2">System Role</label>
                  <select name="role" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-none font-medium appearance-none">
                    <option value="worker">Worker</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-[#FF6600] text-white font-black py-5 rounded-2xl hover:bg-[#1a1a1a] transition-all uppercase text-xs tracking-widest shadow-lg shadow-orange-100">
                    Create Account +
                  </button>
                </div>
              </form>
            </div>

            {/* ADVANCED ATTENDANCE & PAYROLL TRACKER */}
            <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                 <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-[#1a1a1a]">Precision Payroll</h2>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">
            Calculates exact earnings based on seconds logged
          </p>
        </div>
        <div className="flex gap-2">
          {/* Mock Buttons for View Switching */}
          <button className="bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF6600] transition-all">Monthly</button>
          <button className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">Weekly</button>
          <button className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">Daily</button>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-2 md:mx-0">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
              <th className="pb-4 pl-4">Employee</th>
              <th className="pb-4">Structure</th>
              <th className="pb-4">Days Active</th>
              <th className="pb-4">Regular Hrs</th>
              <th className="pb-4 text-[#FF6600]">Sunday/OT</th>
              <th className="pb-4 text-right pr-4">Total Earned</th>
            </tr>
          </thead>
          <tbody className="text-sm font-semibold">
          {Array.isArray(payroll) && payroll.length > 0 ? (
    payroll.map((row: any) => (
      <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
        <td className="py-6 pl-4">
          <p className="font-bold text-[#1a1a1a]">{row.name}</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest">ID: #{row.id.toString().padStart(3, '0')}</p>
        </td>
        <td className="py-6">
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
            row.payType === 'hourly' ? 'bg-blue-50 text-blue-500' : 
            row.payType === 'daily' ? 'bg-purple-50 text-purple-500' : 'bg-slate-100 text-slate-500'
          }`}>
            {row.payType}
          </span>
        </td>
        <td className="py-6 font-medium text-slate-600 pl-4">{row.daysWorked} Days</td>
        <td className="py-6 font-mono text-slate-600">{row.totalHours}h</td>
        <td className="py-6 font-mono text-[#FF6600] font-bold">{parseFloat(row.otHours) > 0 ? `+${row.otHours}h` : '-'}</td>
        <td className="py-6 pr-4 text-right">
          <p className="text-lg font-black text-[#1a1a1a]">Rs. {row.totalPay}</p>
          <button className="text-[9px] text-[#FF6600] font-bold uppercase tracking-widest hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View Breakdown →
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={6} className="py-12 text-center text-slate-300 italic uppercase tracking-widest">
        {payroll ? "Calculating Payroll..." : "No payroll data found"}
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
      
      {/* Footer for Totals */}
      <div className="mt-8 bg-slate-50 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Total Payout (Current Month)</p>
        <p className="text-3xl font-black text-[#1a1a1a]">Rs. 135,650</p>
      </div>
    </div>

            {/* PROJECT BRIEFS SECTION - Horizontal Scroll */}
            <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-[#1a1a1a]">Incoming Project Briefs</h2>
                <span className="bg-orange-100 text-[#FF6600] px-4 py-1 rounded-full text-[10px] font-black uppercase">
                  {Array.isArray(projectBriefs) ? projectBriefs.length : 0} New Leads
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                      <th className="pb-4">Client</th>
                      <th className="pb-4">Service</th>
                      <th className="pb-4">Timeline</th>
                      <th className="pb-4">Description</th>
                      <th className="pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-semibold">
                    {Array.isArray(projectBriefs) && projectBriefs.length > 0 ? (
                      projectBriefs.map((brief: any) => (
                        <tr key={brief.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 font-bold text-[#1a1a1a]">{brief.client_name}</td>
                          <td className="py-6"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] uppercase">{brief.service_type}</span></td>
                          <td className="py-6 text-slate-500">{brief.deadline}</td>
                          <td className="py-6 max-w-xs truncate text-slate-400 font-medium">{brief.description}</td>
                          <td className="py-6 text-right flex gap-4 justify-end items-center">
                            <button 
                              onClick={async () => {
                                if(confirm("Mark this project as completed and remove from list?")) {
                                  const res = await fetch('/api/projects/delete', {
                                    method: 'DELETE',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({ id: brief.id })
                                  });
                                  if(res.ok) {
                                    setProjectBriefs(prev => prev.filter((b: any) => b.id !== brief.id));
                                  }
                                }
                              }}
                              className="text-gray-300 hover:text-green-500 transition-colors font-bold text-[10px] uppercase tracking-widest"
                            >
                              Done ✓
                            </button>
                            <a href={`mailto:?subject=Al Fareed Project: ${brief.service_type}`} className="text-[#FF6600] hover:underline font-bold text-xs uppercase tracking-widest">Contact</a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-12 text-center text-slate-300 italic uppercase tracking-widest">No project briefs submitted yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOTTOM CONTROL GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100">
                <h3 className="text-xl font-black mb-4">Pending Day-Off Requests</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-sm">Ali Raza</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sick Leave • Feb 2nd</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold">Approve</button>
                      <button className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold">Deny</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-slate-100">
                <h3 className="text-xl font-black mb-4">Customer Account Status</h3>
                <p className="text-slate-400 text-sm mb-4">Manage permissions and view project history for all clients.</p>
                <button className="text-[#FF6600] text-xs font-black uppercase tracking-widest hover:underline">View All 42 Clients →</button>
              </div>
            </div>
          </div>
        )}

        {/* WORKER DASHBOARD */}
        {userRole === 'worker' && (
          <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Management</p>
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Live Session</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/attendance', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ employee_id: userData?.id || 1, status: 'On-Time' }),
                        });
                        if (response.ok) alert('Clock-In Recorded!');
                      } catch (err) {
                        alert('Connection Error');
                      }
                    }}
                    className="w-full bg-[#1a1a1a] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#FF6600] transition-all shadow-lg"
                  >
                    Clock In
                  </button>

                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/attendance/checkout', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ employee_id: userData?.id || 1 }),
                        });
                        const data = await res.json();
                        if (res.ok) alert(`Clocked Out! Overtime: ${data.overtime_hrs}h`);
                        else alert(data.error);
                      } catch (err) {
                        alert('Connection Error');
                      }
                    }}
                    className="w-full border-2 border-[#1a1a1a] text-[#1a1a1a] py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                  >
                    Clock Out
                  </button>
                </div>
                
                <p className="text-[10px] text-center text-slate-400 font-bold mt-4 uppercase tracking-widest italic">Database Sync Active</p>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Weekly Statistics</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-[#1a1a1a]">42.5h</p>
                  <p className="text-xs text-green-500 font-bold mb-1">Target: 48h</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-[#FF6600] h-full w-[88%]" />
                </div>
              </div>

              <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100 shadow-sm">
                <p className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest mb-4">Overtime Earned</p>
                <p className="text-3xl font-black text-[#FF6600]">08.0h</p>
                <p className="text-xs text-[#FF6600]/60 font-bold mt-1">Calculated for current month</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-[#1a1a1a] text-white p-10 rounded-[48px] shadow-2xl flex flex-col h-[600px]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">Customer Support</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Project: <span className="text-[#FF6600]">Nestle Billboard</span></p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Precision timing enabled</span>
                  </div>
                </div>

                <div className="flex-1 bg-white/5 rounded-[32px] p-8 mb-6 overflow-y-auto space-y-6 no-scrollbar">
                  <div className="bg-white/10 p-5 rounded-2xl w-fit max-w-[80%] border-l-4 border-[#FF6600]">
                    <p className="text-[10px] font-black text-[#FF6600] mb-1 uppercase tracking-widest">Customer</p>
                    <p className="text-sm font-medium">Hi! Can you please check if the color profile for the billboard is CMYK?</p>
                  </div>
                  <div className="bg-[#FF6600] p-5 rounded-2xl w-fit ml-auto max-w-[80%] shadow-lg shadow-orange-900/20">
                    <p className="text-[10px] font-black text-white/60 mb-1 uppercase tracking-widest">Me (Al Fareed)</p>
                    <p className="text-sm font-medium">Absolutely. Reviewing the files now.</p>
                  </div>
                </div>

                <div className="flex gap-4 bg-white/5 p-2 rounded-3xl border border-white/10">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent p-4 outline-none text-sm font-medium placeholder:text-slate-600" 
                  />
                  <button className="bg-[#FF6600] hover:bg-white hover:text-[#1a1a1a] px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Send</button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-xl font-black mb-6 tracking-tighter text-[#1a1a1a]">Client Assets</h3>
                <div className="space-y-4 flex-1">
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group cursor-pointer hover:border-[#FF6600] transition-all">
                    <p className="font-black text-xs text-[#1a1a1a] uppercase tracking-tighter">Logo_Primary.ai</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shared by Customer • 12MB</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group cursor-pointer hover:border-[#FF6600] transition-all">
                    <p className="font-black text-xs text-[#1a1a1a] uppercase tracking-tighter">Billboard_Final.psd</p>
                    <p className="text-[9px] text-[#FF6600] font-black uppercase tracking-widest mt-1">Awaiting Review</p>
                  </div>
                </div>
                <button className="mt-8 w-full border-2 border-dashed border-slate-200 py-8 rounded-[32px] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:border-[#FF6600] hover:text-[#FF6600] transition-all">
                  Upload Draft +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER DASHBOARD */}
        {userRole === 'customer' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2 text-[#1a1a1a]">Project Workspace</h2>
                <p className="text-slate-500 font-medium">Manage your branding assets and communicate with Al Fareed designers.</p>
              </div>
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-200" />
                <div className="w-12 h-12 rounded-full border-4 border-white bg-[#FF6600] flex items-center justify-center text-white text-xs font-bold">+2</div>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[56px] shadow-xl border border-slate-50 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-orange-100 rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Share Your Assets</h3>
                <p className="text-slate-400 font-medium mb-8 max-w-sm mx-auto">Upload photos, documents, or vector files for your printing job.</p>
                <button className="bg-[#1a1a1a] text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-[#FF6600] transition-all shadow-lg">
                  Select Files to Upload
                </button>
                <p className="mt-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">Max File Size: 500MB • PDF, AI, PSD, JPG</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white p-10 rounded-[56px] shadow-sm border border-slate-100 flex flex-col h-[500px]">
                <h3 className="text-lg font-black mb-6 tracking-tighter uppercase text-slate-300">Message Archive</h3>
                <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 no-scrollbar">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex-shrink-0" />
                    <div className="bg-slate-50 p-5 rounded-3xl rounded-tl-none text-sm font-medium text-slate-700 max-w-[80%]">
                      "Hi! I've assigned Zeeshan to your project. He will handle the large-format printing layout."
                    </div>
                  </div>
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 flex-shrink-0" />
                    <div className="bg-[#FF6600] p-5 rounded-3xl rounded-tr-none text-sm font-medium text-white shadow-lg shadow-orange-100 max-w-[80%]">
                      "Thanks! Just uploaded the high-res logo. Please check the color codes."
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Send a message to your team..." 
                    className="w-full bg-slate-50 p-6 rounded-[32px] outline-none font-medium pr-32 focus:ring-2 focus:ring-[#FF6600]/20" 
                  />
                  <button className="absolute right-3 top-3 bottom-3 bg-[#1a1a1a] text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">Send</button>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[56px] shadow-sm border border-slate-100">
                <h3 className="text-lg font-black mb-6 tracking-tighter uppercase text-slate-300">Active Files</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-[10px] text-[#FF6600]">PDF</div>
                    <div>
                      <p className="text-xs font-black">Invoice_042.pdf</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-black italic mt-1">Pending Sync</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // LANDING PAGE VIEW
  // ==========================================
  return (
    <main className="min-h-screen bg-[#050505] font-sans relative text-white overflow-x-hidden selection:bg-[#FF6600]">
      {/* CRYSTAL BACKGROUND ARCHITECTURE */}
      <div className="fixed top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#FF6600]/10 rounded-full blur-[100px] md:blur-[150px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#333]/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none" />

      <nav className="flex justify-between items-center px-6 md:px-16 py-8 md:py-10 bg-black/40 backdrop-blur-2xl sticky top-0 z-[1000] border-b border-white/5">
        <div className="flex flex-col group cursor-default leading-none">
          <div className="flex items-baseline">
            {/* LOGO: NON-ITALIC LOGO */}
            <span className="text-xl md:text-3xl font-bold tracking-tighter text-white uppercase">AL FAREED</span>
            <div className="ml-1 w-2 h-2 bg-[#FF6600] animate-pulse"></div>
          </div>
          <span className="text-[8px] font-bold tracking-[0.4em] text-gray-500 uppercase mt-1 hidden md:block">Multimedia Solution Provider</span>
        </div>
        <div className="hidden lg:flex gap-12 font-black uppercase tracking-[0.3em] text-gray-400 text-[10px]">
          <a href="#printing" className="hover:text-[#FF6600] transition-colors">Services</a>
          <a href="#contact" className="hover:text-[#FF6600] transition-colors">Contact</a>
        </div>
        <button onClick={() => setIsLoginOpen(true)} className="bg-white text-black px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-[9px] md:text-[10px] tracking-widest hover:bg-[#FF6600] hover:text-white transition-all transform hover:scale-105 active:scale-95 uppercase shadow-xl">Portal Access</button>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-24 grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="space-y-8 md:space-y-10 relative z-10">
          <div className="inline-block bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full"><span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#FF6600]">Karachi Headquartered • Est. 2005</span></div>
          <h1 className="text-5xl md:text-[90px] font-black tracking-tighter leading-[0.9] md:leading-[0.85] text-white">
            Beyond <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-white italic">Paper.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-medium max-w-lg leading-relaxed">
            Industrial printing, document composing, high-end digital advertising, and enterprise web development. We are your complete multimedia engineering partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <button onClick={() => setIsProjectModalOpen(true)} className="bg-[#FF6600] text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_15px_45px_rgba(255,102,0,0.3)]">Launch Project</button>
            <button onClick={() => setIsScopeOpen(true)} className="border border-white/10 backdrop-blur-md px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Explore Scope</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[48px] hover:border-[#FF6600]/40 transition-all group">
            <div className="text-3xl md:text-4xl mb-4 group-hover:scale-110 transition-transform">📄</div>
            <h3 className="font-bold text-lg uppercase italic text-white">Documentation</h3>
            <p className="text-gray-500 text-[10px] leading-relaxed mt-2 uppercase font-bold tracking-widest">Typing / Composing / Binding</p>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[48px] mt-6 md:mt-10 hover:border-[#FF6600]/40 transition-all group">
            <div className="text-3xl md:text-4xl mb-4 group-hover:scale-110 transition-transform">✨</div>
            <h3 className="font-bold text-lg uppercase italic text-white">Finishing</h3>
            <p className="text-gray-500 text-[10px] leading-relaxed mt-2 uppercase font-bold tracking-widest">Lamination / Coating / Stationery</p>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[48px] hover:border-[#FF6600]/40 transition-all group">
            <div className="text-3xl md:text-4xl mb-4 group-hover:scale-110 transition-transform">🌐</div>
            <h3 className="font-bold text-lg uppercase italic text-white">Digital Ops</h3>
            <p className="text-gray-500 text-[10px] leading-relaxed mt-2 uppercase font-bold tracking-widest">Web Dev / SEO / Social Ads</p>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[48px] mt-6 md:mt-10 hover:border-[#FF6600]/40 transition-all group">
            <div className="text-3xl md:text-4xl mb-4 group-hover:scale-110 transition-transform">🏛️</div>
            <h3 className="font-bold text-lg uppercase italic text-white">Marketing</h3>
            <p className="text-gray-500 text-[10px] leading-relaxed mt-2 uppercase font-bold tracking-widest">Billboard / POS / Branding</p>
          </div>
        </div>
      </section>

      {/* SERVICE CATALOGUE - VERTICAL STACK ON MOBILE / HORIZONTAL SLIDER ON DESKTOP */}
      <section id="printing" className="py-24 md:py-32 bg-white/5 backdrop-blur-sm border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 md:mb-20">
            <h4 className="text-[#FF6600] font-black text-[9px] md:text-[10px] uppercase tracking-[0.5em]">Service Catalogue</h4>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase">The Multimedia Engine.</h2>
          </div>
          <div 
            ref={printingRef} 
            className="flex flex-col md:flex-row gap-6 md:gap-6 md:overflow-x-auto pb-0 md:pb-12 no-scrollbar cursor-default md:cursor-grab md:active:cursor-grabbing" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {services.map((s) => (
              <div key={s.id} className="w-full md:w-auto md:min-w-[400px] md:shrink-0 bg-white/5 backdrop-blur-3xl p-8 md:p-12 rounded-[40px] md:rounded-[56px] border border-white/10 hover:border-[#FF6600]/50 transition-all group">
                <div className="text-4xl md:text-5xl mb-8 md:mb-10 group-hover:scale-125 transition-transform duration-500">{s.icon}</div>
                <div className="text-[#FF6600] font-black text-[9px] md:text-[10px] mb-4 opacity-40 tracking-[0.3em] uppercase">{s.id}</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 italic uppercase">{s.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT & HQ SECTION */}
      <section id="contact" className="py-24 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[48px] md:rounded-[56px] p-8 md:p-16 border border-white/10 relative shadow-2xl overflow-hidden group">
  {/* Animated Glow Backlight */}
  <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-[#FF6600]/20 rounded-full blur-[80px] animate-pulse" />
  
  <div className="relative z-10">
    <div className="flex justify-between items-start mb-8 md:mb-10">
      <div>
        <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-tighter">
          Capability <span className="text-[#FF6600]">Pulse.</span>
        </h3>
        <p className="text-gray-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
          Live Studio Metrics
        </p>
      </div>
      <div className="bg-[#FF6600]/10 border border-[#FF6600]/20 px-3 md:px-4 py-1 rounded-full">
        <span className="text-[8px] md:text-[9px] font-black text-[#FF6600] uppercase animate-pulse">Active</span>
      </div>
    </div>

    {/* Interactive Stats Grid */}
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      <div className="bg-white/5 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-white/5 hover:border-[#FF6600]/30 transition-all cursor-default group/stat">
        <p className="text-xl md:text-2xl font-black text-white group-hover/stat:text-[#FF6600] transition-colors">15+</p>
        <p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Specialists</p>
      </div>
      <div className="bg-white/5 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-white/5 hover:border-[#FF6600]/30 transition-all cursor-default group/stat">
        <p className="text-xl md:text-2xl font-black text-white group-hover/stat:text-[#FF6600] transition-colors">4K</p>
        <p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Precision</p>
      </div>
      <div className="bg-white/5 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-white/5 hover:border-[#FF6600]/30 transition-all cursor-default group/stat">
        <p className="text-xl md:text-2xl font-black text-white group-hover/stat:text-[#FF6600] transition-colors">20yr</p>
        <p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Legacy</p>
      </div>
      <div className="bg-white/5 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-white/5 hover:border-[#FF6600]/30 transition-all cursor-default group/stat">
        <p className="text-xl md:text-2xl font-black text-white group-hover/stat:text-[#FF6600] transition-colors">⚡</p>
        <p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Insta-Sync</p>
      </div>
    </div>

    {/* Action Button to trigger the Scope Modal */}
    <button 
      onClick={() => setIsScopeOpen(true)}
      className="w-full mt-8 md:mt-10 bg-white text-black font-black py-5 md:py-6 rounded-[24px] hover:bg-[#FF6600] hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 tracking-[0.3em] uppercase text-[9px] md:text-[10px] shadow-xl"
    >
      Explore 360 Capabilities →
    </button>
  </div>

  {/* Background Pattern */}
  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF6600]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
</div>
          <div className="space-y-8 md:space-y-10">
            <h2 className="text-5xl md:text-[65px] font-black tracking-tighter leading-none italic uppercase text-white">Reach the <br/><span className="text-[#FF6600]">Nerve Center.</span></h2>
            <div className="space-y-4 md:space-y-6">
              <div className="p-6 md:p-8 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 flex items-center gap-6 md:gap-8 group cursor-default">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FF6600] rounded-2xl flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,102,0,0.5)]">📍</div>
                <div><p className="text-xs md:text-sm font-black uppercase tracking-widest text-[#FF6600]">Karachi HQ</p><p className="text-gray-400 font-bold mt-1 text-sm">Shop # 21, Empire Centre, Johar Mor.</p></div>
              </div>
              <div className="p-6 md:p-8 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 flex items-center gap-6 md:gap-8 group cursor-default">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-2xl flex items-center justify-center text-xl">📞</div>
                <div><p className="text-xs md:text-sm font-black uppercase tracking-widest text-white">Direct Line</p><p className="text-gray-400 font-bold mt-1 text-sm">0310-2828228 • info@alfareed.pk</p></div>
              </div>
            </div>
          </div> 
        </div>
      </section>

      {/* PROJECT BRIEF MODAL (Launch Project) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-[60px] p-6 text-center">
          <div className="bg-[#0a0a0a] border border-white/20 w-full max-w-2xl rounded-[40px] md:rounded-[56px] p-8 md:p-16 relative shadow-2xl">
            <button onClick={() => setIsProjectModalOpen(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-white/40 hover:text-white">✕</button>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic mb-8 md:mb-12 uppercase text-white">Project <span className="text-[#FF6600]">Brief.</span></h2>
            <p className="text-gray-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] mb-8 md:mb-12 italic tracking-[0.2em]">Data Transmission to Agent</p>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const payload = { client_name: formData.get('client_name'), service_type: formData.get('service_type'), deadline: formData.get('deadline'), description: formData.get('description') };
              const res = await fetch('/api/projects/submit', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
              if(res.ok) { alert("Brief Submitted Successfully!"); setIsProjectModalOpen(false); }
            }}>
              <input name="client_name" type="text" placeholder="Entity Name" required className="md:col-span-2 p-5 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-white outline-none font-bold focus:border-[#FF6600] transition-all" />
              <select name="service_type" required className="p-5 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-white outline-none font-bold">
                <option className="bg-[#0a0a0a]" value="Printing">Printing & Copy</option>
                <option className="bg-[#0a0a0a]" value="Web Development">Web Development</option>
                <option className="bg-[#0a0a0a]" value="Marketing">Marketing/Ads</option>
              </select>
              <input name="deadline" type="text" placeholder="Timeline" className="p-5 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-white outline-none font-bold" />
              <textarea name="description" placeholder="Requirements..." required className="md:col-span-2 p-5 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-white outline-none h-32 font-bold"></textarea>
              <button className="md:col-span-2 bg-[#FF6600] text-white font-black py-5 md:py-6 rounded-3xl uppercase tracking-widest text-xs">Transmit Brief</button>
            </form>
          </div>
        </div>
      )}

      {/* EXPLORE SCOPE MODAL */}
      {isScopeOpen && (
        <div className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-[100px] flex items-center justify-center p-6 md:p-8 text-center">
           <div className="max-w-4xl w-full">
             <button onClick={() => setIsScopeOpen(false)} className="mb-8 md:mb-10 text-white/40 hover:text-[#FF6600] font-black uppercase tracking-[0.4em] text-xs">← Close Capabilities</button>
             <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-8 md:mb-12 uppercase text-white">Al Fareed <span className="text-[#FF6600]">360°.</span></h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
               <div className="p-8 md:p-10 bg-white/5 border border-white/10 rounded-[40px]">
                 <h4 className="text-[#FF6600] font-bold text-xs uppercase mb-4 tracking-widest text-white">Hard Ops</h4>
                 <p className="text-gray-400 text-sm leading-relaxed text-white">High-volume photocopying, thermal coating, spiral & hard binding, corporate stationery sourcing.</p>
               </div>
               <div className="p-8 md:p-10 bg-white/5 border border-white/10 rounded-[40px]">
                 <h4 className="text-[#FF6600] font-bold text-xs uppercase mb-4 tracking-widest text-white">Soft Ops</h4>
                 <p className="text-gray-400 text-sm leading-relaxed text-white">Multilingual copy typing, architectural composing, professional documentation and design layouts.</p>
               </div>
               <div className="p-8 md:p-10 bg-white/5 border border-white/10 rounded-[40px]">
                 <h4 className="text-[#FF6600] font-bold text-xs uppercase mb-4 tracking-widest text-white">Digital Ops</h4>
                 <p className="text-gray-400 text-sm leading-relaxed text-white">Custom Next.js web development, targeted SEO, social media marketing, and billboard branding.</p>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-[50px] p-6 text-center">
          <div className="bg-[#0a0a0a] border border-white/20 w-full max-md:max-w-full max-w-md rounded-[40px] md:rounded-[56px] p-10 md:p-16 relative shadow-2xl overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF6600] to-transparent" />
             <button onClick={() => setIsLoginOpen(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-white/40 hover:text-white">✕</button>
             <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic mb-2 uppercase text-white">SYSTEM <span className="text-[#FF6600]">ACCESS.</span></h2>
             <p className="text-gray-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] mb-8 md:mb-12 italic text-white/60 uppercase">Identity verification required</p>
             <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
               <input type="text" placeholder="Identity" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} className="w-full p-5 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl outline-none font-bold text-white focus:border-[#FF6600] transition-all" />
               <input type="password" name="password" placeholder="Pass-Key" className="w-full p-5 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl outline-none font-bold text-white focus:border-[#FF6600] transition-all" />
               <button className="w-full bg-white text-black font-black py-5 md:py-6 rounded-2xl md:rounded-3xl hover:bg-[#FF6600] hover:text-white transition-all tracking-[0.3em] uppercase text-[10px]">Execute Login</button>
             </form>
          </div>
        </div>
      )}

      {/* WHATSAPP BOT */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-100 group flex flex-col items-end">
        <a href="https://wa.me/923325327333" target="_blank" rel="noreferrer" className="relative w-20 h-20 md:w-24 md:h-24 transform hover:scale-110 active:scale-95 transition-all duration-300">
          <div className="absolute inset-0 bg-[#FF6600] rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="relative">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-2xl">
              <rect x="20" y="25" width="60" height="45" rx="22" fill="#1a1a1a" />
              <rect x="28" y="33" width="44" height="20" rx="10" fill="#000" />
              <path d="M36 43 Q40 38 44 43" stroke="#FF6600" strokeWidth="3" strokeLinecap="round" fill="none" className="animate-pulse" />
              <path d="M56 43 Q60 38 64 43" stroke="#FF6600" strokeWidth="3" strokeLinecap="round" fill="none" className="animate-pulse" />
              <path d="M42 58 Q50 63 58 58" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="70" cy="30" r="5" fill="#22C55E" />
              <path d="M35 72 C35 68 40 65 50 65 C60 65 65 68 65 72 V82 H35 V72Z" fill="#1a1a1a" />
              <rect x="48" y="68" width="4" height="8" rx="1" fill="#FF6600" />
            </svg>
          </div>
        </a>
      </div>

      <footer className="bg-black py-16 md:py-24 text-center border-t border-white/5">
        <p className="font-black text-[9px] md:text-[10px] tracking-[0.4em] text-gray-700 uppercase">
          © 2026 Al Fareed Marketing & Advertisement | Karachi, Pakistan
        </p>
      </footer>
    </main>
  );
}