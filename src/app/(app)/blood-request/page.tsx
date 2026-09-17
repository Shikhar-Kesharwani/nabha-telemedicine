'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Droplet,
  AlertCircle,
  PlusCircle,
  Phone,
  Hospital,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { SectionHeader } from '@/components/primitives';
import {
  getBloodRequests,
  createBloodRequest,
  getBloodDonors,
  registerBloodDonor,
  BloodRequest,
  BloodDonor,
} from '@/lib/services/blood-bank';
import { useToast } from '@/hooks/use-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodRequestPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [showDonorModal, setShowDonorModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // New Request Form State
  const [reqPatient, setReqPatient] = useState('');
  const [reqBloodGroup, setReqBloodGroup] = useState('O+');
  const [reqUnits, setReqUnits] = useState(1);
  const [reqHospital, setReqHospital] = useState('Civil Hospital Nabha (Emergency Ward)');
  const [reqUrgency, setReqUrgency] = useState<'CRITICAL' | 'URGENT' | 'MODERATE'>('CRITICAL');
  const [reqContactPerson, setReqContactPerson] = useState('');
  const [reqContactPhone, setReqContactPhone] = useState('');
  const [reqNotes, setReqNotes] = useState('');

  // Donor Form State
  const [donorName, setDonorName] = useState('');
  const [donorBloodGroup, setDonorBloodGroup] = useState('O+');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorLocation, setDonorLocation] = useState('Nabha');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const reqList = await getBloodRequests();
      const donorList = await getBloodDonors(selectedGroupFilter === 'ALL' ? undefined : selectedGroupFilter);
      setRequests(reqList);
      setDonors(donorList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedGroupFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPatient || !reqContactPhone) {
      toast({ variant: 'destructive', title: 'Details Needed', description: 'Patient name and contact phone are required.' });
      return;
    }

    const created = await createBloodRequest({
      patientName: reqPatient,
      bloodGroup: reqBloodGroup,
      unitsNeeded: reqUnits,
      hospital: reqHospital,
      urgency: reqUrgency,
      contactPerson: reqContactPerson || 'Family Attendant',
      contactPhone: reqContactPhone,
      notes: reqNotes,
    });

    if (created) {
      toast({
        title: 'Emergency Blood Request Broadcasted',
        description: `Alert active for ${reqUnits} unit(s) of ${reqBloodGroup} at ${reqHospital}.`,
      });
      setShowRequestModal(false);
      setReqPatient('');
      setReqContactPhone('');
      setReqNotes('');
      loadData();
    }
  };

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorPhone) {
      toast({ variant: 'destructive', title: 'Name & Phone Required', description: 'Please provide your contact details to register.' });
      return;
    }

    const ok = await registerBloodDonor({
      name: donorName,
      bloodGroup: donorBloodGroup,
      phone: donorPhone,
      location: donorLocation,
    });

    if (ok) {
      toast({
        title: 'Thank You for Registering',
        description: `You are now on the voluntary donor directory for ${donorBloodGroup} in Nabha.`,
      });
      setShowDonorModal(false);
      setDonorName('');
      setDonorPhone('');
      loadData();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <SectionHeader
        title="Emergency Blood Request & Donor Network"
        subtitle="Real-time hyper-local blood transfusion coordination for Civil Hospital Nabha and Rajindra Hospital Patiala. Connect with volunteer donors in minutes."
      />

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-900/60 border border-red-500/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-red-500/20 text-red-400">
            <Droplet size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Need Blood Urgently in Nabha?</h3>
            <p className="text-xs text-slate-300">Broadcast immediately to compatible volunteer donors in the tehsil.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-1.5"
          >
            <PlusCircle size={15} /> Request Blood Now
          </button>
          <button
            onClick={() => setShowDonorModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-1.5"
          >
            <Heart size={15} className="text-red-400" /> Join as Donor
          </button>
        </div>
      </div>

      {/* Official Hospital Blood Bank Hotlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hospital className="text-cyan-400" size={20} />
            <div>
              <p className="text-xs font-bold text-white">Civil Hospital Nabha Blood Storage Centre</p>
              <p className="text-[11px] text-slate-400">24/7 Emergency Transfusion Unit (PRBC/FFP)</p>
            </div>
          </div>
          <a
            href="tel:01765222250"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5"
          >
            <Phone size={12} /> 01765-222250
          </a>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hospital className="text-amber-400" size={20} />
            <div>
              <p className="text-xs font-bold text-white">Rajindra Govt. Hospital Blood Bank (Patiala)</p>
              <p className="text-[11px] text-slate-400">Tertiary Apheresis & Platelet Component Lab</p>
            </div>
          </div>
          <a
            href="tel:01752212058"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5"
          >
            <Phone size={12} /> 0175-2212058
          </a>
        </div>
      </div>

      {/* Active Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-400" /> Active Emergency Transfusion Requests ({requests.length})
          </h3>
          <span className="text-xs text-slate-400">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl flex flex-col justify-between space-y-4 border ${
                req.urgency === 'CRITICAL'
                  ? 'border-red-500/40 bg-gradient-to-br from-red-950/30 via-slate-900/80 to-black'
                  : 'border-amber-500/30 bg-slate-900/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      req.urgency === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {req.urgency}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-red-400">{req.bloodGroup}</span>
                    <p className="text-[10px] text-slate-400">{req.unitsNeeded} Unit(s)</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white">{req.patientName}</h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                    <Hospital size={12} className="text-slate-400 shrink-0" /> {req.hospital}
                  </p>
                </div>

                {req.notes && (
                  <p className="text-xs text-slate-400 bg-black/40 p-2.5 rounded-xl border border-white/5">
                    {req.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Contact: {req.contactPerson}</p>
                </div>
                <a
                  href={`tel:${req.contactPhone.replace(/\D/g, '')}`}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-400 transition-all flex items-center gap-1.5"
                >
                  <Phone size={12} /> Call: {req.contactPhone}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Volunteer Donor Registry */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-indigo-400" /> Nabha Tehsil Voluntary Donor Directory
            </h3>
            <p className="text-xs text-slate-400">Filter compatible donors ready for direct contact.</p>
          </div>

          {/* Blood Group Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedGroupFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedGroupFilter === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroupFilter(bg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedGroupFilter === bg
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {donors.map((donor) => (
            <div
              key={donor.id}
              className="p-4 rounded-xl flex flex-col justify-between space-y-3"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">{donor.name}</h5>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {donor.location}
                  </p>
                </div>
                <span className="text-sm font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  {donor.bloodGroup}
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={10} /> Available
                </span>
                <a
                  href={`tel:${donor.phone.replace(/\D/g, '')}`}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Phone size={11} /> {donor.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl space-y-4"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-bright)' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Droplet className="text-red-500" size={18} /> New Emergency Blood Request
                </h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Patient Name & Age:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gurpreet Singh (Age 45)"
                    value={reqPatient}
                    onChange={(e) => setReqPatient(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Blood Group Needed:</label>
                    <select
                      value={reqBloodGroup}
                      onChange={(e) => setReqBloodGroup(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Units Needed:</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={reqUnits}
                      onChange={(e) => setReqUnits(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Hospital / Medical Center in Nabha:</label>
                  <input
                    type="text"
                    required
                    value={reqHospital}
                    onChange={(e) => setReqHospital(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Urgency Tier:</label>
                    <select
                      value={reqUrgency}
                      onChange={(e: any) => setReqUrgency(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                    >
                      <option value="CRITICAL">CRITICAL (Within 2 hrs)</option>
                      <option value="URGENT">URGENT (Today)</option>
                      <option value="MODERATE">MODERATE (Within 24 hrs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Contact Phone:</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98145..."
                      value={reqContactPhone}
                      onChange={(e) => setReqContactPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Clinical Reason / Notes (Optional):</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Surgery scheduled or Dengue low platelet count..."
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/50 border border-white/10 text-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-all shadow-lg"
                  >
                    Broadcast Emergency
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donor Registration Modal */}
      <AnimatePresence>
        {showDonorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl space-y-4"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-bright)' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Heart className="text-red-400" size={18} /> Register as Voluntary Donor
                </h3>
                <button
                  onClick={() => setShowDonorModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleRegisterDonor} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Your Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manpreet Singh"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Blood Group:</label>
                    <select
                      value={donorBloodGroup}
                      onChange={(e) => setDonorBloodGroup(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Phone Number:</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98145..."
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Location / Ward in Nabha:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Model Town / Circular Road"
                    value={donorLocation}
                    onChange={(e) => setDonorLocation(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDonorModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-all shadow-lg"
                  >
                    Save Registration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
