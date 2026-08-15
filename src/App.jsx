import { useState, useEffect } from 'react';
import { MapPin, Activity, User, Phone, ArrowRight, ShieldCheck, Wifi, CheckCircle2, Loader2, Home, Lock, AlertCircle } from 'lucide-react';
import { usePlacesWidget } from 'react-google-autocomplete';

export default function App() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(600);
  
  // Programmatic Location State
  const [location, setLocation] = useState({
    city: 'Brownsville',
    state: 'TX',
    zip: '78522'
  });

  const [formData, setFormData] = useState({
    address: '',
    usage: '',
    fullName: '',
    phone: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    const stateParam = params.get('state');
    const zipParam = params.get('zip');

    if (cityParam || stateParam || zipParam) {
      setLocation({
        city: cityParam || 'Brownsville',
        state: stateParam || 'TX',
        zip: zipParam || '78522'
      });
    }
  }, []);

  useEffect(() => {
    if (isComplete && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [isComplete, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const { ref: googlePlacesRef } = usePlacesWidget({
    apiKey: "AIzaSyAFI7nr1gt8WkTJZ-MX6SE-j-pVfllTm60",
    onPlaceSelected: (place) => {
      if (place?.formatted_address) {
        setFormData(prev => ({ ...prev, address: place.formatted_address }));
      }
    },
    options: {
      types: ["address"],
      componentRestrictions: { country: "us" },
    }
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleFormRouting = (e) => {
    e.preventDefault();
    if (step === 1) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        handleNext();
      }, 2500);
    } else if (step === 3) {
      handleSubmit(e);
    } else {
      handleNext();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const GOOGLE_WEBHOOK_URL = 'YOUR_GOOGLE_SHEETS_URL_HERE';

    try {
      await fetch(GOOGLE_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting data', error);
      alert('There was a network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full filter blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-400/5 rounded-full filter blur-[120px] opacity-70"></div>
      
      {/* PROGRAMMATIC HEADER SECTION */}
      {(!isScanning && !isComplete) && (
        <div className="max-w-2xl text-center mb-8 relative z-10 px-4 space-y-3">
          
          {/* Active Network Coverage Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/30 backdrop-blur-md shadow-sm">
            <Wifi size={14} className="text-yellow-400 animate-pulse" />
            <span className="text-xs font-semibold text-blue-200 tracking-wide">
              Active Network Coverage Zone: <strong className="text-yellow-400">{location.city}, {location.state} ({location.zip})</strong>
            </span>
          </div>

          {/* Dynamic Main Headline (Only City/State is Yellow and Underlined) */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            ZERO DOWN availability in{' '}
            <span className="text-yellow-400 underline decoration-yellow-400/50 underline-offset-4">
              {location.city}, {location.state}
            </span>{' '}
            is limited. Check your Address Now Before It's Too Late:
          </h1>

          {/* Subtitle / Value Prop */}
          <p className="text-blue-200/80 text-sm md:text-base max-w-xl mx-auto font-medium">
            Don't lock into standard sticker prices online. Enter your exact address below to unlock unlisted move-in promotions and check neighborhood speeds.
          </p>
        </div>
      )}

      {/* Glassmorphism Card Container */}
      <div className="max-w-md w-full bg-blue-900/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-blue-400/20 min-h-[420px] flex flex-col justify-center relative z-10 overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500"></div>

        <div className="p-8">
          {(!isScanning && !isComplete) && (
            <div className="text-center mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">Instant Address Verification</p>
            </div>
          )}

          {isComplete ? (
            <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400/10 mb-4 text-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.15)] border border-yellow-400/30">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1">Great News!</h2>
              <p className="text-blue-100 font-medium mb-6 px-4">
                Several high-speed offers are available for your address in {location.city}.
              </p>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertCircle size={16} className="text-red-400 animate-pulse" />
                  <p className="text-red-400 font-bold text-xs uppercase tracking-widest">
                    Priority Hold
                  </p>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter font-mono my-2 drop-shadow-sm">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-[12px] text-red-200/90 font-medium leading-snug">
                  Due to high demand in {location.city}, we can only hold your installation spot and promotional pricing for the next 10 minutes.
                </p>
              </div>

              <a 
                href="tel:18884826192" 
                className="w-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 font-black text-lg py-4 px-6 rounded-2xl transition-all shadow-[0_8px_20px_rgba(250,204,21,0.25)] hover:shadow-[0_10px_25px_rgba(250,204,21,0.4)] hover:-translate-y-1 active:translate-y-0"
              >
                <Phone className="mr-3 animate-bounce text-slate-900" size={24} />
                Call 1 (888) 482-6192
              </a>
              
              <p className="text-[12px] text-blue-200/70 font-medium mt-4">
                <span className="relative flex h-2 w-2 inline-flex mr-2 mb-[1px]">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live agents available. Wait time: &lt; 1 minute.
              </p>
            </div>
          ) : isScanning ? (
            
            <div className="flex flex-col items-center justify-center py-10 space-y-10 animate-in fade-in duration-500">
              <div className="flex items-center justify-center space-x-6 w-full px-4">
                <div className="relative flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-md z-10">
                    <Home size={28} className="text-white" />
                  </div>
                </div>
                <div className="flex space-x-2 flex-grow justify-center">
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(250,204,21,0.8)] [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(250,204,21,0.8)] [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(250,204,21,0.8)]"></div>
                </div>
                <div className="relative flex flex-col items-center">
                  <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center border border-yellow-400/20 shadow-[0_0_25px_rgba(250,204,21,0.25)] z-10">
                    <Wifi size={32} className="text-yellow-400 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center justify-center">
                  Establishing connection
                  <span className="w-6 text-left animate-pulse">...</span>
                </h2>
                <p className="text-sm text-blue-200/70">Pinging local network for:</p>
                <p className="text-sm font-semibold text-yellow-300 bg-yellow-400/10 px-4 py-1.5 rounded-xl mx-auto inline-block border border-yellow-400/20 backdrop-blur-sm">
                  {formData.address || `${location.city}, ${location.state} ${location.zip}`}
                </p>
              </div>
            </div>
            
          ) : (
            
            <form onSubmit={handleFormRouting}>
              
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <label className="block text-sm font-bold text-white">Where do you need service?</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 z-10 transition-colors group-focus-within:text-yellow-500">
                      <MapPin size={20} />
                    </div>
                    <input
                      ref={googlePlacesRef}
                      type="text"
                      required
                      placeholder={`e.g., 123 Main St, ${location.city}, ${location.state}`}
                      className="w-full pl-11 pr-4 py-4 bg-white/95 backdrop-blur-sm border border-transparent rounded-2xl text-slate-900 focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 outline-none transition-all shadow-sm placeholder:text-slate-500 font-medium"
                      defaultValue={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <label className="block text-sm font-bold text-white">What do you primarily use the internet for?</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['Heavy Gaming', '4K Streaming', 'Working from Home', 'Basic Browsing'].map((usageOption) => (
                      <button
                        type="button"
                        key={usageOption}
                        className={`flex items-center p-4 border rounded-2xl transition-all shadow-sm group ${
                          formData.usage === usageOption 
                            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300 font-bold shadow-[0_4px_20px_rgba(250,204,21,0.12)]' 
                            : 'border-white/20 bg-white/5 text-white hover:border-yellow-400/50 hover:bg-white/10'
                        }`}
                        onClick={() => {
                          setFormData({...formData, usage: usageOption});
                          setTimeout(handleNext, 350);
                        }}
                      >
                        <Activity size={20} className={`mr-3 transition-colors ${formData.usage === usageOption ? 'text-yellow-400' : 'text-white/60 group-hover:text-yellow-300'}`} />
                        <span>{usageOption}</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={handleBack} className="text-sm text-blue-200/70 hover:text-yellow-400 mt-4 font-semibold transition-colors flex items-center">
                    ← Back
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <label className="block text-sm font-bold text-white">Where should we send your results?</label>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 transition-colors group-focus-within:text-yellow-500">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Full Name"
                      className="w-full pl-11 pr-4 py-4 bg-white/95 backdrop-blur-sm border border-transparent rounded-2xl text-slate-900 focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 outline-none transition-all shadow-sm placeholder:text-slate-500 font-medium"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 transition-colors group-focus-within:text-yellow-500">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="Phone Number"
                      className="w-full pl-11 pr-4 py-4 bg-white/95 backdrop-blur-sm border border-transparent rounded-2xl text-slate-900 focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 outline-none transition-all shadow-sm placeholder:text-slate-500 font-medium"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <button type="button" onClick={handleBack} className="text-sm text-blue-200/70 hover:text-yellow-400 mt-2 font-semibold transition-colors flex items-center">
                    ← Back
                  </button>
                </div>
              )}

              {step !== 2 && (
                <div className="mt-8 space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center shadow-[0_8px_20px_rgba(250,204,21,0.25)] hover:shadow-[0_10px_25px_rgba(250,204,21,0.4)] disabled:opacity-70 active:scale-[0.98]"
                  >
                    {step === 1 ? (
                      <>Check Coverage <ArrowRight size={18} className="ml-2" /></>
                    ) : (
                      <>
                        {isSubmitting ? (
                          <><Loader2 size={18} className="mr-2 animate-spin" /> Scanning...</>
                        ) : 'Reveal My Options'}
                      </>
                    )}
                  </button>

                  {step === 3 && (
                    <p className="text-[11px] text-blue-200/60 leading-relaxed text-center px-4 font-medium">
                      <Lock size={10} className="inline mr-1 mb-[2px] text-blue-200/60" />
                      By clicking 'Reveal My Options', you authorize Home Tech Dealer Inc. to contact you via SMS and phone regarding your coverage options. Msg & data rates may apply. Your information is secure.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 flex justify-center gap-3">
                {[1, 2, 3].map((dot) => (
                  <div key={dot} className={`h-1.5 rounded-full transition-all duration-500 ${step >= dot ? 'w-10 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'w-4 bg-white/20'}`} />
                ))}
              </div>
              
            </form>
          )}
        </div>
      </div>
    </div>
  );
}