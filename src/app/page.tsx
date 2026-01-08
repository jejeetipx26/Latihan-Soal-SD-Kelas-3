"use client";

import { useState } from "react";
// Import fungsi Server Action
import { loginUser, submitScoreToDB, getAllScores } from "./actions";
import {
  BookOpen, Calculator, FlaskConical, Star, ChevronLeft, Trophy, User, ArrowRight,
  LogOut, Moon, Lock, CheckCircle2, Cloud, Rocket, GraduationCap, LayoutDashboard,
  Pencil, Medal, HelpCircle, Check, BrainCircuit, Atom, Send, Loader2, Target, XCircle, PlayCircle
} from "lucide-react";

// --- TIPE DATA ---
type Role = "GURU" | "SISWA";
type Subject = "MATEMATIKA" | "IPA";
type ViewMode = "MENU_HARI" | "BACA_MATERI" | "KERJAKAN_SOAL";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ScoreData {
  id: string;
  studentName: string;
  subject: string;
  day: number;
  score: number;
}

// --- DATA SOAL MATEMATIKA HARI 1 (15 SOAL) ---
const MATH_DAY1_QUESTIONS = [
  { id: 1, question: "Satu kue dibagi menjadi 2 bagian sama besar. Ani mengambil 1 bagian. Pecahan yang menunjukkan bagian Ani adalah …", options: ["1/3", "1/2", "2/1", "2/2"], answer: "1/2", explanation: "Karena diambil 1 bagian dari total 2 bagian, maka ditulis 1/2." },
  { id: 2, question: "Satu pizza dibagi menjadi 4 bagian sama besar. Budi mengambil 1 bagian. Pecahan yang tepat adalah …", options: ["1/2", "1/3", "1/4", "4/1"], answer: "1/4", explanation: "1 bagian dari 4 potongan pizza ditulis 1/4." },
  { id: 3, question: "Pecahan yang menunjukkan setengah adalah …", options: ["1/3", "1/4", "1/2", "2/1"], answer: "1/2", explanation: "Setengah sama artinya dengan satu per dua (1/2)." },
  { id: 4, question: "Satu roti dibagi menjadi 3 bagian sama besar. Siti mengambil 1 bagian. Pecahan bagian Siti adalah …", options: ["1/2", "1/3", "2/3", "3/1"], answer: "1/3", explanation: "1 bagian dari 3 bagian roti ditulis 1/3." },
  { id: 5, question: "Perhatikan gambar sebuah kue dibagi menjadi 4 bagian sama besar. Jika diambil 1 bagian, maka pecahannya adalah …", options: ["1/4", "1/3", "1/2", "4/1"], answer: "1/4", explanation: "Satu dari empat bagian yang sama besar adalah 1/4." },
  { id: 6, question: "Angka yang berada di atas pada pecahan disebut …", options: ["Pembagi", "Jumlah", "Pembilang", "Penyebut"], answer: "Pembilang", explanation: "Angka atas adalah Pembilang, angka bawah adalah Penyebut." },
  { id: 7, question: "Pada pecahan 1/2, angka 2 disebut …", options: ["Pembilang", "Penyebut", "Hasil", "Sisa"], answer: "Penyebut", explanation: "Angka yang berada di bawah (2) disebut Penyebut." },
  { id: 8, question: "Satu semangka dibagi menjadi 2 bagian sama besar. Diambil 1 bagian. Pecahan yang benar adalah …", options: ["1/3", "2/1", "1/2", "2/2"], answer: "1/2", explanation: "Satu bagian dari dua potong semangka adalah 1/2." },
  { id: 9, question: "Pecahan 1/4 artinya …", options: ["Satu bagian dari dua bagian", "Satu bagian dari tiga bagian", "Satu bagian dari empat bagian", "Empat bagian dari satu bagian"], answer: "Satu bagian dari empat bagian", explanation: "1/4 artinya 1 benda dibagi menjadi 4 bagian sama besar." },
  { id: 10, question: "Satu cokelat dibagi menjadi 3 bagian sama besar. Jika diambil 1 bagian, pecahannya adalah …", options: ["1/2", "1/3", "2/3", "3/1"], answer: "1/3", explanation: "Satu bagian dari tiga bagian cokelat adalah 1/3." },
  { id: 11, question: "Pecahan yang menunjukkan satu per tiga adalah …", options: ["1/2", "1/4", "1/3", "3/1"], answer: "1/3", explanation: "Satu per tiga ditulis dengan angka 1 di atas dan 3 di bawah (1/3)." },
  { id: 12, question: "Jika sebuah benda dibagi menjadi 4 bagian sama besar, maka angka penyebutnya adalah …", options: ["1", "2", "3", "4"], answer: "4", explanation: "Penyebut menunjukkan jumlah seluruh bagian, yaitu 4." },
  { id: 13, question: "Bagian pecahan yang menunjukkan jumlah bagian seluruhnya adalah …", options: ["Pembilang", "Penyebut", "Angka atas", "Hasil"], answer: "Penyebut", explanation: "Jumlah seluruh bagian potongan ditunjukkan oleh angka bawah atau Penyebut." },
  { id: 14, question: "Satu kue dibagi menjadi 2 bagian sama besar. Jika diambil 1 bagian, maka bagian yang diambil adalah …", options: ["Sepertiga", "Seperempat", "Setengah", "Satu"], answer: "Setengah", explanation: "1/2 juga biasa dibaca 'Setengah'." },
  { id: 15, question: "Pecahan yang benar untuk menunjukkan satu bagian dari empat bagian adalah …", options: ["4/1", "1/4", "2/4", "4/4"], answer: "1/4", explanation: "Satu dari empat bagian ditulis 1/4." },
];

export default function Page() {
  const [user, setUser] = useState<UserData | null>(null);

  // State Input
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State Data Real
  const [allScores, setAllScores] = useState<ScoreData[]>([]);

  // State Flow Siswa
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("MENU_HARI");
  const [lastCompletedDay, setLastCompletedDay] = useState(0);

  // --- STATE KHUSUS KUIS (MULTIPLE CHOICE) ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({}); // Simpan jawaban { noSoal: "Jawaban" }
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // --- LOGIC ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = await loginUser(inputName, inputEmail);
      if (userData) {
        setUser({ id: userData.id, name: userData.name, email: userData.email, role: userData.role });
        if (userData.role === "GURU") fetchScores();
      }
    } catch (error) {
      alert("Gagal login. Pastikan database aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveSubject(null);
    setActiveDay(null);
    setViewMode("MENU_HARI");
    setAllScores([]);
    resetQuiz();
  };

  const resetQuiz = () => {
    setQuizScore(null);
    setIsQuizFinished(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  };

  const fetchScores = async () => {
    try {
      const data = await getAllScores();
      setAllScores(data);
    } catch (error) {
      console.error("Gagal ambil data", error);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isQuizFinished) return;
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: answer });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < MATH_DAY1_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    let correctCount = 0;
    MATH_DAY1_QUESTIONS.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        correctCount++;
      }
    });

    // Hitung Nilai (Skala 100)
    const finalScore = Math.round((correctCount / MATH_DAY1_QUESTIONS.length) * 100);
    setQuizScore(finalScore);
    setIsQuizFinished(true);

    // Buka level selanjutnya jika nilai > 60
    if (finalScore >= 60 && activeDay && activeDay > lastCompletedDay) {
      setLastCompletedDay(activeDay);
    }

    // Simpan ke Database
    if (user && activeSubject && activeDay) {
      try {
        await submitScoreToDB(user.id, activeSubject, activeDay, finalScore);
      } catch (error) {
        console.error("Gagal simpan", error);
      }
    }
  };

  // --- BACKGROUND ---
  const AnimatedBackground = () => (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-[10%] text-yellow-200 animate-[bounce_3s_infinite] opacity-60"><Star size={20} fill="currentColor" /></div>
        <div className="absolute top-40 right-[10%] md:right-[20%] text-blue-200 animate-[bounce_4s_infinite_1s] opacity-60"><Star size={14} fill="currentColor" /></div>
        <div className="absolute bottom-20 left-[5%] md:left-[30%] text-pink-200 animate-[bounce_5s_infinite_0.5s] opacity-60"><Star size={24} fill="currentColor" /></div>
        <div className="absolute top-20 right-5 md:right-10 text-yellow-100 animate-[pulse_4s_infinite] opacity-50"><Moon className="w-10 h-10 md:w-16 md:h-16" fill="currentColor" /></div>
        <div className="absolute top-[15%] left-[5%] text-white animate-[pulse_6s_infinite] opacity-20"><Cloud className="w-16 h-16 md:w-20 md:h-20" fill="currentColor" /></div>
        <div className="absolute bottom-[20%] right-[10%] text-white animate-[pulse_7s_infinite] opacity-20"><Cloud className="w-20 h-20 md:w-24 md:h-24" fill="currentColor" /></div>
      </div>
  );

  // --- VIEW 1: LOGIN ---
  if (!user) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FBEFEF] to-[#EADDFF] flex items-center justify-center p-4 md:p-6 font-sans relative">
          <AnimatedBackground />
          <div className="w-full max-w-[90%] md:max-w-md bg-white/80 backdrop-blur-md rounded-[30px] md:rounded-[40px] shadow-2xl p-6 md:p-10 relative z-10 border border-white/50">
            <div className="text-center mb-6 md:mb-8">
              <div className="bg-gradient-to-tr from-[#B7B1F2] to-[#AAC4F5] w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                <Rocket className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Selamat Datang</h1>
              <p className="text-slate-500 text-xs md:text-sm mt-2">Mulai petualangan belajarmu disini</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="text" placeholder="Nama Lengkap" className="w-full bg-white border-2 border-indigo-50 text-slate-700 font-bold rounded-2xl pl-12 pr-6 py-3 md:py-4 focus:border-[#B7B1F2] outline-none transition-all text-sm md:text-base" value={inputName} onChange={(e) => setInputName(e.target.value)} />
              </div>
              <div className="relative">
                <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="email" placeholder="Email Sekolah" className="w-full bg-white border-2 border-indigo-50 text-slate-700 font-bold rounded-2xl pl-12 pr-6 py-3 md:py-4 focus:border-[#B7B1F2] outline-none transition-all text-sm md:text-base" value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} />
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-[#AAC4F5] to-[#B7B1F2] text-white font-bold text-base md:text-lg py-3 md:py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95 flex justify-center items-center gap-2">
                {isLoading ? <><Loader2 className="animate-spin" /> Masuk...</> : <>Masuk Sekarang <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
    );
  }

  // --- VIEW 2: DASHBOARD GURU ---
  if (user.role === "GURU") {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-100 pb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-xl"><LayoutDashboard className="text-indigo-600 w-6 h-6" /></div>
                <div><h1 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard Guru</h1><p className="text-slate-400 text-xs md:text-sm">Selamat bekerja, {user.name}</p></div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={fetchScores} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">Refresh</button>
                <button onClick={handleLogout} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"><LogOut size={16} /> Keluar</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 text-slate-600">
                <tr><th className="p-4 md:p-5 font-bold text-xs md:text-sm uppercase tracking-wider">Siswa</th><th className="p-4 md:p-5 font-bold text-xs md:text-sm uppercase tracking-wider">Mapel</th><th className="p-4 md:p-5 font-bold text-xs md:text-sm uppercase tracking-wider">Hari</th><th className="p-4 md:p-5 font-bold text-xs md:text-sm uppercase tracking-wider text-right">Nilai</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {allScores.length === 0 ? (<tr><td colSpan={4} className="p-8 text-center text-slate-400 font-medium">Belum ada data nilai.</td></tr>) : (
                    allScores.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors text-sm md:text-base">
                          <td className="p-4 md:p-5 font-bold text-slate-700 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">{s.studentName.charAt(0).toUpperCase()}</div>{s.studentName}</td>
                          <td className="p-4 md:p-5"><span className={`px-2 md:px-3 py-1 rounded-lg text-xs font-bold ${s.subject === 'MATEMATIKA' ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-teal-600'}`}>{s.subject}</span></td>
                          <td className="p-4 md:p-5 text-slate-500">Hari ke-{s.day}</td>
                          <td className="p-4 md:p-5 font-black text-green-600 text-right">{s.score}</td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    );
  }

  // --- VIEW 3: DASHBOARD SISWA ---

  // PILIH MAPEL
  if (!activeSubject) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FBEFEF] to-white p-4 md:p-6 relative font-sans overflow-y-auto">
          <AnimatedBackground />
          <div className="relative z-10 max-w-5xl mx-auto pt-6 md:pt-10 pb-10">
            <div className="flex justify-between items-center mb-8 md:mb-10 bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-3xl border border-white shadow-sm">
              <div className="flex items-center gap-3"><div className="bg-gradient-to-br from-indigo-400 to-purple-400 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white shadow-md"><User className="w-5 h-5 md:w-6 md:h-6" /></div><div><h1 className="text-lg md:text-xl font-black text-slate-700 truncate max-w-[150px] md:max-w-none">Halo, {user.name}</h1><p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Medal size={12} className="text-yellow-500" /> Level 3 SD</p></div></div>
              <button onClick={handleLogout} className="bg-white p-2 md:p-3 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm"><LogOut className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>
            <div className="text-center mb-6 md:mb-10 px-4"><h2 className="text-2xl md:text-3xl font-black text-slate-700 mb-2 drop-shadow-sm">Pilih Pelajaran</h2><p className="text-slate-500 text-sm md:text-base">Mau belajar apa hari ini?</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto px-2">
              <button onClick={() => setActiveSubject("MATEMATIKA")} className="group relative h-60 md:h-72 rounded-[30px] md:rounded-[35px] p-6 md:p-8 text-left transition-all hover:-translate-y-2 overflow-hidden bg-gradient-to-br from-[#FFF8E1] to-[#FFE0B2] shadow-[0_10px_40px_-10px_rgba(255,193,7,0.3)] border-4 border-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500"><BrainCircuit className="w-[150px] h-[150px] text-orange-500" /></div>
                <div className="relative z-10 flex flex-col h-full justify-between"><div className="bg-white/90 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-sm text-orange-500"><Calculator className="w-6 h-6 md:w-8 md:h-8" /></div><div><h3 className="text-2xl md:text-3xl font-black text-orange-900 mb-1 md:mb-2">Matematika</h3><div className="flex items-center gap-2 text-orange-800/70 font-bold text-xs md:text-sm bg-white/30 w-fit px-3 py-1 rounded-lg"><Check size={12} /> 14 Level</div></div></div>
              </button>
              <button onClick={() => setActiveSubject("IPA")} className="group relative h-60 md:h-72 rounded-[30px] md:rounded-[35px] p-6 md:p-8 text-left transition-all hover:-translate-y-2 overflow-hidden bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] shadow-[0_10px_40px_-10px_rgba(38,166,154,0.3)] border-4 border-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500"><Atom className="w-[150px] h-[150px] text-teal-600" /></div>
                <div className="relative z-10 flex flex-col h-full justify-between"><div className="bg-white/90 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-sm text-teal-600"><FlaskConical className="w-6 h-6 md:w-8 md:h-8" /></div><div><h3 className="text-2xl md:text-3xl font-black text-teal-900 mb-1 md:mb-2">I P A</h3><div className="flex items-center gap-2 text-teal-800/70 font-bold text-xs md:text-sm bg-white/30 w-fit px-3 py-1 rounded-lg"><Check size={12} /> 14 Level</div></div></div>
              </button>
            </div>
          </div>
        </div>
    );
  }

  // PILIH HARI
  if (!activeDay) {
    const themeGradient = activeSubject === "MATEMATIKA" ? "from-orange-100 to-yellow-50" : "from-teal-100 to-green-50";
    const accentColor = activeSubject === "MATEMATIKA" ? "text-orange-600" : "text-teal-600";
    const IconSubject = activeSubject === "MATEMATIKA" ? Calculator : FlaskConical;

    return (
        <div className={`min-h-screen bg-gradient-to-b ${themeGradient} p-4 md:p-6 relative overflow-y-auto`}>
          <AnimatedBackground />
          <div className="max-w-4xl mx-auto relative z-10 pt-4 pb-10">
            <button onClick={() => setActiveSubject(null)} className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:bg-white/50 px-4 py-2 md:px-5 md:py-3 rounded-full transition-all w-fit backdrop-blur-sm text-sm md:text-base"><ChevronLeft size={18} /> Ganti Pelajaran</button>
            <div className="bg-white/80 backdrop-blur-md rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-xl border border-white">
              <div className="flex items-center gap-4 md:gap-5 mb-8 md:mb-10 border-b border-slate-100 pb-4 md:pb-6">
                <div className={`p-3 md:p-4 rounded-2xl bg-white shadow-md ${accentColor}`}><IconSubject className="w-6 h-6 md:w-8 md:h-8" /></div>
                <div><h1 className="text-xl md:text-2xl font-black text-slate-800">{activeSubject}</h1><p className="text-slate-400 font-medium text-xs md:text-sm flex items-center gap-2"><LayoutDashboard size={14} /> Pilih Level Hari</p></div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 md:gap-4">
                {Array.from({ length: 14 }).map((_, i) => {
                  const day = i + 1;
                  const isLocked = day > lastCompletedDay + 1;
                  const isCompleted = day <= lastCompletedDay;
                  return (
                      <button key={day} disabled={isLocked} onClick={() => { setActiveDay(day); setViewMode("MENU_HARI"); resetQuiz(); }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 border-2 ${isLocked ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed" : "bg-white border-white shadow-lg hover:-translate-y-1 hover:shadow-indigo-100 cursor-pointer active:scale-95"} ${isCompleted ? "border-green-400 bg-green-50/50" : ""}`}>
                        {isLocked ? <Lock size={16} className="mb-1 opacity-50" /> : isCompleted ? <div className="absolute top-1 right-1 md:top-2 md:right-2 text-green-500"><CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="currentColor" /></div> : <div className="absolute top-1 right-1 md:top-2 md:right-2 text-yellow-400"><Star className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" /></div>}
                        <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${isLocked ? "text-slate-300" : "text-slate-400"}`}>Hari</span>
                        <span className={`text-xl md:text-3xl font-black ${isLocked ? "text-slate-300" : "text-slate-700"}`}>{day}</span>
                      </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
    );
  }

  // MENU HARI / MATERI / SOAL
  return (
      <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="w-full max-w-3xl bg-white rounded-[30px] md:rounded-[40px] shadow-2xl border-4 border-white relative z-10 overflow-hidden flex flex-col h-[85vh] md:h-auto md:min-h-[600px]">
          <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 flex justify-between items-center border-b border-slate-100 z-20">
            <button onClick={() => { if (viewMode === "MENU_HARI") setActiveDay(null); else setViewMode("MENU_HARI"); resetQuiz(); }} className="flex items-center gap-1 md:gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors bg-slate-50 px-3 py-2 rounded-xl text-sm md:text-base"><ChevronLeft size={18} /> <span className="hidden sm:inline">Kembali</span></button>
            <div className="flex gap-2"><span className="bg-slate-100 text-slate-600 px-3 py-1 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold flex items-center gap-1 md:gap-2">{activeSubject === "MATEMATIKA" ? <Calculator size={12}/> : <FlaskConical size={12}/>}{activeSubject}</span><span className="bg-indigo-50 text-indigo-600 px-3 py-1 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold flex items-center gap-1 md:gap-2"><LayoutDashboard size={12}/>Hari {activeDay}</span></div>
          </div>

          <div className="flex-1 p-6 md:p-12 overflow-y-auto">
            {viewMode === "MENU_HARI" && (
                <div className="animate-[fadeIn_0.5s_ease-out] text-center h-full flex flex-col justify-center">
                  <div className="mb-6 md:mb-10"><div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-indigo-600"><HelpCircle className="w-8 h-8 md:w-10 md:h-10" /></div><h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Pilih Aktivitas</h2><p className="text-slate-500 text-sm md:text-base">Mau mulai darimana hari ini?</p></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-xl mx-auto w-full">
                    <button onClick={() => setViewMode("BACA_MATERI")} className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-100 hover:border-indigo-400 p-6 md:p-8 rounded-[25px] md:rounded-[30px] text-left transition-all hover:-translate-y-2 hover:shadow-xl active:scale-95"><div className="bg-white w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4 md:mb-6 text-indigo-500 group-hover:scale-110 transition-transform"><BookOpen className="w-6 h-6 md:w-7 md:h-7" /></div><h3 className="text-lg md:text-xl font-bold text-indigo-900 mb-1">Baca Materi</h3><p className="text-indigo-500/70 text-xs md:text-sm font-medium">Pelajari teorinya dulu</p></button>
                    <button onClick={() => setViewMode("KERJAKAN_SOAL")} className="group bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100 hover:border-orange-400 p-6 md:p-8 rounded-[25px] md:rounded-[30px] text-left transition-all hover:-translate-y-2 hover:shadow-xl active:scale-95"><div className="bg-white w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4 md:mb-6 text-orange-500 group-hover:scale-110 transition-transform"><Pencil className="w-6 h-6 md:w-7 md:h-7" /></div><h3 className="text-lg md:text-xl font-bold text-orange-900 mb-1">Latihan Soal</h3><p className="text-orange-500/70 text-xs md:text-sm font-medium">Kerjakan kuis seru</p></button>
                  </div>
                </div>
            )}

            {/* --- BAGIAN MATERI --- */}
            {viewMode === "BACA_MATERI" && (
                <div className="animate-[slideIn_0.3s_ease-out]">
                  <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-[25px] md:rounded-[35px] p-6 md:p-10 mb-6 md:mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5"><BookOpen className="w-[150px] h-[150px]" /></div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 relative z-10"><span className="bg-indigo-600 text-white p-2 rounded-lg"><BookOpen className="w-4 h-4 md:w-5 md:h-5"/></span>{activeSubject === "MATEMATIKA" && activeDay === 1 ? "Pecahan Sederhana" : `Materi Hari ${activeDay}`}</h2>
                    <div className="prose prose-slate text-base md:text-lg text-slate-600 leading-relaxed relative z-10 w-full">
                      {activeSubject === "MATEMATIKA" && activeDay === 1 ? (
                          <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><Target size={18} /> Tujuan Belajar</h3><ul className="list-disc list-inside text-sm md:text-base space-y-1"><li>Mengerti apa itu pecahan</li><li>Mengenal ½, ⅓, dan ¼</li><li>Menentukan pecahan dari benda sehari-hari</li></ul></div>
                            <div><h3 className="font-bold text-indigo-900 text-lg mb-2">Apa itu Pecahan?</h3><p>Pecahan adalah bagian dari suatu benda yang <strong>dibagi sama besar</strong>. Contoh gampangnya: Kue, Pizza, Semangka, atau Roti. </p><p className="mt-2 text-sm italic bg-yellow-50 p-2 rounded border border-yellow-100">"Kalau benda itu dibagi rata, lalu kita ambil sebagian, itulah yang disebut pecahan."</p></div>
                            <div><h3 className="font-bold text-indigo-900 text-lg mb-2">Cara Menulis Pecahan</h3><div className="flex gap-4 font-black text-2xl text-indigo-600 bg-white p-4 rounded-xl border w-fit shadow-sm mx-auto"><span>½</span> <span>⅓</span> <span>¼</span></div><p className="text-sm mt-2 text-center">Angka <strong>Atas</strong> = Bagian yang diambil<br/>Angka <strong>Bawah</strong> = Jumlah semua bagian</p></div>
                            <div className="space-y-4"><h3 className="font-bold text-indigo-900 text-lg">Contoh Supaya Lebih Paham</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-2xl border hover:shadow-md transition-shadow text-center"><div className="h-32 flex items-center justify-center mb-2 overflow-hidden rounded-xl"><img src="https://zuwaily.wordpress.com/wp-content/uploads/2011/12/gambar-1.png" alt="Setengah Kue" className="h-full object-contain" onError={(e) => { e.currentTarget.src = "https://placehold.co/150?text=Gambar+Kue"; }} /></div><p className="font-bold text-indigo-600 text-xl">½</p><p className="text-sm text-slate-500">Dibaca: Setengah</p><p className="text-xs mt-1 text-slate-400">1 kue dibagi 2</p></div>
                              <div className="bg-white p-4 rounded-2xl border hover:shadow-md transition-shadow text-center"><div className="h-32 flex items-center justify-center mb-2 overflow-hidden rounded-xl"><img src="https://www.shutterstock.com/image-vector/one-quarters-pizza-fractions-fraction-260nw-2227515473.jpg" alt="Seperempat Pizza" className="h-full object-contain" onError={(e) => { e.currentTarget.src = "https://placehold.co/150?text=Gambar+Pizza"; }} /></div><p className="font-bold text-indigo-600 text-xl">¼</p><p className="text-sm text-slate-500">Dibaca: Seperempat</p><p className="text-xs mt-1 text-slate-400">1 pizza dibagi 4</p></div>
                              <div className="bg-white p-4 rounded-2xl border hover:shadow-md transition-shadow text-center"><div className="h-32 flex items-center justify-center mb-2 overflow-hidden rounded-xl"><img src="https://i.ytimg.com/vi/-bEoPvwSJAs/maxresdefault.jpg" alt="Sepertiga Roti" className="h-full object-contain" onError={(e) => { e.currentTarget.src = "https://placehold.co/150?text=Gambar+Roti"; }} /></div><p className="font-bold text-indigo-600 text-xl">⅓</p><p className="text-sm text-slate-500">Dibaca: Sepertiga</p><p className="text-xs mt-1 text-slate-400">1 roti dibagi 3</p></div>
                            </div></div>
                          </div>
                      ) : (
                          <div><p>Halo adik-adik! Materi untuk hari ini masih dikunci.</p><p className="mt-4">Silakan selesaikan <strong>Hari 1</strong> dulu ya!</p></div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setViewMode("KERJAKAN_SOAL")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 md:py-5 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex justify-center items-center gap-3 group text-sm md:text-base">Lanjut ke Latihan Soal <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform"/></button>
                </div>
            )}

            {/* --- BAGIAN SOAL (KUIS & REVIEW) --- */}
            {viewMode === "KERJAKAN_SOAL" && (
                <div className="animate-[slideIn_0.3s_ease-out]">

                  {/* === TAMPILAN SOAL (BELUM SELESAI) === */}
                  {!isQuizFinished ? (
                      activeSubject === "MATEMATIKA" && activeDay === 1 ? (
                          <div className="max-w-xl mx-auto">
                            {/* Progress Bar */}
                            <div className="flex items-center gap-2 mb-6">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full"><div className="h-full bg-orange-400 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / MATH_DAY1_QUESTIONS.length) * 100}%` }}></div></div>
                              <span className="text-xs font-bold text-slate-400">{currentQuestionIndex + 1}/{MATH_DAY1_QUESTIONS.length}</span>
                            </div>

                            <div className="bg-white border-2 border-orange-100 rounded-[25px] md:rounded-[35px] p-6 md:p-10 shadow-lg shadow-orange-50 mb-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
                              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs md:text-sm mb-4">Pertanyaan {currentQuestionIndex + 1}</h3>
                              <p className="text-lg md:text-xl font-bold text-slate-800 leading-snug mb-6">{MATH_DAY1_QUESTIONS[currentQuestionIndex].question}</p>

                              <div className="space-y-3">
                                {MATH_DAY1_QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(option)}
                                        className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${userAnswers[currentQuestionIndex] === option ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-100 bg-white hover:border-orange-200 text-slate-600"}`}
                                    >
                                      <span className="inline-block w-6 h-6 rounded-full bg-white border-2 border-current text-center text-xs leading-5 mr-3">{["A","B","C","D"][idx]}</span>
                                      {option}
                                    </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between gap-4">
                              <button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} className="flex-1 bg-slate-100 text-slate-500 font-bold py-3 rounded-xl disabled:opacity-50">Sebelumnya</button>
                              {currentQuestionIndex === MATH_DAY1_QUESTIONS.length - 1 ? (
                                  <button onClick={submitQuiz} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">Selesai & Lihat Nilai</button>
                              ) : (
                                  <button onClick={handleNextQuestion} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">Selanjutnya</button>
                              )}
                            </div>
                          </div>
                      ) : (
                          // SOAL DUMMY UNTUK HARI LAIN
                          <div className="text-center py-10">
                            <p className="text-lg text-slate-600 mb-4">Soal untuk hari ini belum tersedia.</p>
                            <button onClick={() => setViewMode("MENU_HARI")} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">Kembali ke Menu</button>
                          </div>
                      )
                  ) : (
                      // === TAMPILAN HASIL SKOR & PEMBAHASAN ===
                      <div className="animate-[bounceIn_0.5s]">
                        <div className="text-center mb-8">
                          <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-yellow-200 blur-2xl opacity-50 rounded-full animate-pulse"></div>
                            <Trophy className="w-20 h-20 md:w-32 md:h-32 text-yellow-400 relative z-10 drop-shadow-lg" fill="#FDE047" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">{quizScore === 100 ? "Sempurna!" : quizScore && quizScore >= 70 ? "Hebat!" : "Semangat Belajar!"}</h2>
                          <div className="bg-white border-2 border-slate-100 inline-flex flex-col items-center justify-center px-8 py-6 rounded-[30px] shadow-sm relative overflow-hidden w-40">
                            <div className={`absolute top-0 left-0 w-full h-2 ${quizScore && quizScore >= 70 ? "bg-green-400" : "bg-red-400"}`}></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Nilai Akhir</span>
                            <span className={`text-5xl font-black ${quizScore && quizScore >= 70 ? "text-green-600" : "text-red-500"}`}>{quizScore}</span>
                          </div>
                        </div>

                        <div className="bg-indigo-50 rounded-[30px] p-6 md:p-8 mb-8">
                          <h3 className="font-black text-indigo-900 text-xl mb-6 flex items-center gap-2"><BookOpen size={24}/> Pembahasan Soal</h3>
                          <div className="space-y-6">
                            {MATH_DAY1_QUESTIONS.map((q, idx) => {
                              const isCorrect = userAnswers[idx] === q.answer;
                              return (
                                  <div key={q.id} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
                                    <div className="flex gap-3">
                                      <div className="mt-1">
                                        {isCorrect ? <CheckCircle2 className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-bold text-slate-800 mb-2">{idx + 1}. {q.question}</p>
                                        <div className="flex flex-wrap gap-2 text-sm mb-3">
                                          <span className={`px-3 py-1 rounded-lg border ${isCorrect ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>Jawabanmu: {userAnswers[idx] || "-"}</span>
                                          {!isCorrect && <span className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">Kunci: {q.answer}</span>}
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 border border-slate-100">
                                          <strong>Penjelasan:</strong> {q.explanation}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                          <button onClick={resetQuiz} className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-500 font-bold py-3 rounded-xl hover:bg-slate-50">Ulangi</button>
                          <button onClick={() => { setActiveDay(null); setViewMode("MENU_HARI"); resetQuiz(); }} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700">Selesai</button>
                        </div>
                      </div>
                  )}
                </div>
            )}

          </div>
        </div>
      </div>
  );
}