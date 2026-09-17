'use client';

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Download,
  CreditCard,
  QrCode,
  Sparkles,
  ShieldCheck,
  User,
  Video,
  MessageSquare,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { SectionHeader, StatCard, StatusBadge, RatingStars, Modal } from "@/components/primitives";
import { useToast } from "@/hooks/use-toast";
import { getDoctors, type Doctor } from "@/lib/services/doctors";
import { createAppointment, getAppointments, cancelAppointment, type Appointment } from "@/lib/services/appointments";
import { format } from "date-fns";
import { getSession } from "@/lib/session";

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
];

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"browse" | "my-appointments">("browse");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"schedule" | "payment" | "confirmation">("schedule");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txnId, setTxnId] = useState("");
  const { toast } = useToast();
  const [userId, setUserId] = useState<number>(1);

  const loadMyAppointments = async (uid: number) => {
    const appts = await getAppointments(uid);
    setMyAppointments(appts || []);
  };

  useEffect(() => {
    async function fetchData() {
      setLoadingDoctors(true);
      const fetched = await getDoctors();
      setDoctors(fetched);
      setLoadingDoctors(false);
      const session = getSession();
      const currentUid = session?.userId || 1;
      setUserId(currentUid);
      await loadMyAppointments(currentUid);
    }
    fetchData();
  }, []);

  const handleCancel = async (apptId: number) => {
    const ok = await cancelAppointment(apptId, userId);
    if (ok) {
      toast({
        title: "Appointment Cancelled",
        description: "Your consultation slot has been released.",
      });
      await loadMyAppointments(userId);
    } else {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: "Could not cancel appointment. Please try again.",
      });
    }
  };

  const openBooking = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedTime(null);
    setStep("schedule");
  };

  const handleProceedToPayment = () => {
    if (selectedDate && selectedTime) {
      setStep("payment");
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    const generatedTxn = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxnId(generatedTxn);

    if (selectedDoctor && selectedDate && selectedTime && userId) {
      await createAppointment({
        userId: userId,
        type: 'Doctor',
        name: selectedDoctor.name || selectedDoctor.fullName,
        details: `${selectedDoctor.specialty} • ${generatedTxn}`,
        date: selectedDate,
        time: selectedTime,
        avatar: selectedDoctor.avatar,
        dataAiHint: selectedDoctor.dataAiHint,
        doctorId: selectedDoctor.id.toString(),
      });

      await loadMyAppointments(userId);

      toast({
        title: "Payment Confirmed & Booked! 🎉",
        description: `Transaction ${generatedTxn} completed for ${selectedDoctor.name || selectedDoctor.fullName}.`,
      });
      setStep("confirmation");
    }
    setIsProcessing(false);
  };

  const downloadReceipt = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt - ${txnId}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none; } }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 36px; color: #0f172a; background: #fff; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
    .hospital { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
    .sub { font-size: 12px; color: #64748b; margin: 2px 0 0; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 10px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 700; }
    td { padding: 10px 12px; border: 1px solid #e2e8f0; }
    .total-row { font-weight: 800; font-size: 14px; background: #f0fdf4; color: #166534; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #64748b; }
    .print-btn { background: #0284c7; color: #fff; border: none; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Print Receipt / Save as PDF</button>
  </div>
  <div class="header">
    <div>
      <span class="badge">Payment Successful • Official Invoice</span>
      <h1 class="hospital">SEHAT Nabha Telemedicine Services</h1>
      <p class="sub">Teleconsultation Appointment Booking</p>
    </div>
    <div style="text-align: right;">
      <p style="margin: 0; font-weight: 800; font-family: monospace; font-size: 15px; color: #0284c7;">${txnId}</p>
      <p class="sub">Date: ${new Date().toLocaleDateString('en-IN')}</p>
    </div>
  </div>

  <div class="grid">
    <div>
      <strong>CONSULTING DOCTOR</strong><br>
      <span style="font-size: 15px; font-weight: 700; color: #0f172a;">${selectedDoctor.name || selectedDoctor.fullName}</span><br>
      ${selectedDoctor.specialty}<br>
      <span style="color: #64748b;">${(selectedDoctor as any).hospital || "Rajindra Hospital / SDH Civil Hospital"}</span>
    </div>
    <div>
      <strong>APPOINTMENT SCHEDULE</strong><br>
      <span style="font-size: 15px; font-weight: 700; color: #0284c7;">${selectedDate} at ${selectedTime}</span><br>
      Location: HD Video & Audio Teleconsultation Room<br>
      Status: <span style="color: #059669; font-weight: 700;">Confirmed & Paid</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Category</th>
        <th style="text-align: right;">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Specialist Teleconsultation Fee</td>
        <td>Professional Services</td>
        <td style="text-align: right;">₹${selectedDoctor.consultationFee}.00</td>
      </tr>
      <tr>
        <td>Platform & Convenience Fee</td>
        <td>Telemedicine Platform</td>
        <td style="text-align: right; color: #059669; font-weight: 700;">₹0.00 (WAIVED)</td>
      </tr>
      <tr class="total-row">
        <td colspan="2">TOTAL AMOUNT PAID</td>
        <td style="text-align: right;">₹${selectedDoctor.consultationFee}.00</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>This is a computer-generated digital payment invoice. No signature required.</p>
    <p>Ayushman Bharat Mukh Mantri Sehat Bima Yojana (MMSBY) Partner Platform • Helpline: 104 / 108</p>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${txnId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Specialist Appointments & Teleconsultations"
        subtitle="Schedule a consultation with board-certified physicians from Rajindra Hospital & SDH Civil Hospital Nabha."
        action={<StatusBadge variant="cyan"><Sparkles size={13} /> Verified Doctors</StatusBadge>}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "browse"
              ? "bg-[var(--accent-indigo)] text-white shadow-md shadow-indigo-500/20"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
          }`}
        >
          <Sparkles size={14} /> Browse Specialists ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab("my-appointments")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "my-appointments"
              ? "bg-[var(--accent-cyan)] text-slate-900 shadow-md shadow-cyan-500/20"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
          }`}
        >
          <CalendarDays size={14} /> My Appointments ({myAppointments.length})
        </button>
      </div>

      {/* TAB 1: Browse Specialists */}
      {activeTab === "browse" && (
        loadingDoctors ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl shimmer shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-3/4 rounded-lg shimmer" />
                    <div className="h-3 w-1/2 rounded-lg shimmer" />
                    <div className="h-3 w-1/3 rounded-lg shimmer" />
                  </div>
                </div>
                <div className="h-8 w-full rounded-xl shimmer" />
                <div className="h-10 w-full rounded-xl shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div key={doc.id} className={`rounded-2xl border bg-[var(--surface)] p-6 flex flex-col justify-between card-3d-hover space-y-4 ${doc.available ? 'border-[var(--border)]' : 'border-[var(--border)]/40 opacity-75'}`}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-bold text-xl shadow-lg">
                        {(doc.name || doc.fullName).charAt(0)}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[var(--surface)] ${doc.available ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[var(--text-primary)]">{doc.name || doc.fullName}</h3>
                        <StatusBadge variant={doc.available ? 'emerald' : 'amber'}>
                          {doc.available ? 'Available' : 'Offline'}
                        </StatusBadge>
                      </div>
                      <p className="text-xs font-semibold text-[var(--accent-cyan)]">{doc.specialty}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{(doc as any).hospital || "Civil Hospital Nabha Network"}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{doc.experience} yrs experience</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-b border-[var(--border)] py-2.5">
                    <RatingStars rating={doc.rating} reviewCount={doc.reviews} />
                    <span className="text-sm font-extrabold text-[var(--accent-cyan)]">₹{doc.consultationFee}</span>
                  </div>
                </div>

                <button
                  onClick={() => openBooking(doc)}
                  disabled={!doc.available}
                  className={`w-full rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    doc.available
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20 hover:opacity-95'
                      : 'bg-white/5 text-[var(--text-muted)] cursor-not-allowed border border-[var(--border)]'
                  }`}
                >
                  {doc.available ? 'Book Consultation' : 'Currently Offline'}
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 2: My Booked Appointments */}
      {activeTab === "my-appointments" && (
        <div className="space-y-4">
          {myAppointments.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center space-y-4">
              <CalendarDays className="mx-auto h-12 w-12 text-[var(--text-muted)] opacity-50" />
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">No Active Appointments Found</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">You haven&apos;t scheduled any doctor consultations yet.</p>
              </div>
              <button
                onClick={() => setActiveTab("browse")}
                className="rounded-xl bg-[var(--accent-indigo)] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:opacity-95"
              >
                Browse Specialists & Book Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between space-y-4 card-3d-hover"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge variant="emerald">Confirmed</StatusBadge>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">ID #{appt.id}</span>
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-bold text-lg shadow-md">
                        {appt.name ? appt.name.charAt(0) : "D"}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-base text-[var(--text-primary)]">{appt.name}</h4>
                        <p className="text-xs text-[var(--accent-cyan)] font-semibold">{appt.details}</p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 pt-1 font-mono">
                          <Clock size={13} className="text-[var(--accent-indigo)]" /> {appt.date} at {appt.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                    <Link
                      href={`/video-call/${appt.doctorId || 1}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                    >
                      <Video size={14} /> Join Video Room
                    </Link>

                    <Link
                      href={`/doctor-chat/${appt.doctorId || 1}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-white/5"
                    >
                      <MessageSquare size={14} /> Chat
                    </Link>

                    <button
                      onClick={() => handleCancel(appt.id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Cancel Appointment"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <Modal open={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} maxWidth="max-w-xl">
          {step === "schedule" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg text-[var(--text-primary)]">Schedule with {selectedDoctor.name || selectedDoctor.fullName}</h3>
                <p className="text-xs text-[var(--text-muted)]">{selectedDoctor.specialty} • Fee: ₹{selectedDoctor.consultationFee} • {(selectedDoctor as any).hospital || "Nabha Region"}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Available Time Slot</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`rounded-xl py-2 text-xs font-bold transition-colors border ${
                          selectedTime === time
                            ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white shadow-md'
                            : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-white/5'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-muted)] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={!selectedTime}
                  className="rounded-xl bg-[var(--accent-indigo)] px-6 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 disabled:opacity-40"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg text-[var(--text-primary)]">Secure Payment Checkout</h3>
                <p className="text-xs text-[var(--text-muted)]">{selectedDoctor.name || selectedDoctor.fullName} on {selectedDate} at {selectedTime}</p>
              </div>

              <div className="rounded-xl border border-[var(--accent-amber)]/40 bg-[var(--accent-amber)]/10 p-3 text-xs text-[var(--accent-amber)]">
                ℹ️ <strong>Demo Environment:</strong> Payment processing is simulated. Click <strong>Pay & Confirm Booking</strong> to test instant booking confirmation.
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Payment Method</label>
                  <div
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${
                      paymentMethod === "upi" ? "border-[var(--accent-indigo)] bg-[var(--accent-indigo)]/10" : "border-[var(--border)]"
                    }`}
                  >
                    <QrCode className="h-5 w-5 text-[var(--accent-indigo)]" />
                    <div>
                      <p className="font-bold text-xs text-[var(--text-primary)]">UPI Instant QR</p>
                      <p className="text-[10px] text-[var(--text-muted)]">GPay, PhonePe, Paytm</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${
                      paymentMethod === "card" ? "border-[var(--accent-indigo)] bg-[var(--accent-indigo)]/10" : "border-[var(--border)]"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-[var(--accent-indigo)]" />
                    <div>
                      <p className="font-bold text-xs text-[var(--text-primary)]">Credit / Debit Card</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="rounded-xl border border-[var(--border)] bg-black/30 p-3 flex flex-col items-center text-center">
                      <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center">
                        <QrCode className="w-20 h-20 text-black" />
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-2">VPA: <span className="font-bold text-[var(--text-primary)]">sehat.nabha@upi</span></p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-[var(--text-primary)] mb-2">Order Summary</p>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Consultation Fee</span>
                      <span>₹{selectedDoctor.consultationFee}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Convenience Fee</span>
                      <span className="text-[var(--accent-emerald)] font-bold">FREE</span>
                    </div>
                    <div className="border-t border-[var(--border)] pt-2 flex justify-between font-extrabold text-sm">
                      <span>Total Payable</span>
                      <span className="text-[var(--accent-indigo)]">₹{selectedDoctor.consultationFee}.00</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
                  >
                    {isProcessing ? 'Processing...' : `Pay ₹${selectedDoctor.consultationFee} Now`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "confirmation" && (
            <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-emerald)]/20 flex items-center justify-center text-[var(--accent-emerald)]">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Appointment Confirmed!</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Transaction ID: <span className="font-mono font-bold text-[var(--text-primary)]">{txnId}</span></p>
              </div>
              <p className="text-xs text-[var(--text-muted)] max-w-sm">
                Your appointment with <strong>{selectedDoctor.name || selectedDoctor.fullName}</strong> is scheduled for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
              </p>
              <div className="flex gap-3 mt-2">
                <button onClick={downloadReceipt} className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-white/5">
                  <Download size={14} /> Download Receipt
                </button>
                <button onClick={() => setSelectedDoctor(null)} className="rounded-xl bg-[var(--accent-indigo)] px-5 py-2 text-xs font-bold text-white">
                  Done
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
