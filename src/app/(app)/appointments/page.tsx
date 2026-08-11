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
} from "lucide-react";
import { SectionHeader, StatCard, StatusBadge, RatingStars, Modal } from "@/components/primitives";
import { useToast } from "@/hooks/use-toast";
import { getDoctors, type Doctor } from "@/lib/services/doctors";
import { createAppointment } from "@/lib/services/appointments";
import { format } from "date-fns";

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

function getSession() {
  if (typeof window === 'undefined') return null;
  const patientSession = localStorage.getItem('sehat-session-patient');
  if (patientSession) return { type: 'patient', ...JSON.parse(patientSession) };
  return null;
}

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"schedule" | "payment" | "confirmation">("schedule");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txnId, setTxnId] = useState("");
  const { toast } = useToast();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const fetched = await getDoctors();
      setDoctors(fetched);
      const session = getSession();
      if (session?.type === 'patient') {
        setUserId(session.userId || 1);
      }
    }
    fetchData();
  }, []);

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
    const content = `================================================
          NABHA TELEMEDICINE (SEHAT)
             PAYMENT RECEIPT & INVOICE
================================================
Transaction ID: ${txnId}
Date: ${new Date().toLocaleDateString()}
Status: PAID (SUCCESSFUL)

DOCTOR DETAILS:
- Doctor: ${selectedDoctor.name || selectedDoctor.fullName}
- Specialty: ${selectedDoctor.specialty}
- Consultation Fee: ₹${selectedDoctor.consultationFee}.00

APPOINTMENT SCHEDULE:
- Date: ${selectedDate}
- Time: ${selectedTime}
- Location: Teleconsultation Video/Voice Room

SUMMARY:
- Consultation Fee: ₹${selectedDoctor.consultationFee}.00
- Convenience Fee:  ₹0.00 (WAIVED)
- Total Paid:       ₹${selectedDoctor.consultationFee}.00
================================================
Thank you for choosing Nabha Telemedicine Services.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sehat_Receipt_${txnId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Book Specialist Consultation"
        subtitle="Connect with board-certified physicians for instant WebRTC video or voice consultations."
        action={<StatusBadge variant="cyan"><Sparkles size={13} /> Verified Specialists</StatusBadge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div key={doc.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between card-3d-hover space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-bold text-xl shadow-lg">
                  {(doc.name || doc.fullName).charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">{doc.name || doc.fullName}</h3>
                  <p className="text-xs font-semibold text-[var(--accent-cyan)]">{doc.specialty}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{doc.experience} years experience</p>
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
                  : 'bg-white/5 text-[var(--text-muted)] cursor-not-allowed'
              }`}
            >
              {doc.available ? 'Book Consultation' : 'Currently Offline'}
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <Modal open={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} maxWidth="max-w-xl">
          {step === "schedule" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg text-[var(--text-primary)]">Schedule with {selectedDoctor.name || selectedDoctor.fullName}</h3>
                <p className="text-xs text-[var(--text-muted)]">{selectedDoctor.specialty} • Fee: ₹{selectedDoctor.consultationFee}</p>
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

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <button onClick={() => setSelectedDoctor(null)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-white/5">
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={!selectedTime}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 disabled:opacity-40"
                >
                  Proceed to Pay ₹{selectedDoctor.consultationFee}
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
