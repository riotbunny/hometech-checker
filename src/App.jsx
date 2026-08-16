import { useState, useEffect } from 'react';
import { MapPin, Activity, User, Phone, ArrowRight, ShieldCheck, Wifi, CheckCircle2, Loader2, Home, Lock, AlertCircle, Rocket } from 'lucide-react';
import { usePlacesWidget } from 'react-google-autocomplete';

export default function App() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(600);
  
  // Programmatic Location State (Universal fallback)
  const [location, setLocation] = useState({
    city: 'In Your City',
    state: '',
    zip: ''
  });

  const [formData, setFormData] = useState({
    address: '',
    usage: '',
    fullName: '',
    phone: ''
  });

  // Helper to strip ", USA" or trailing country clutter from Google addresses
  const cleanAddress = (rawAddress) => {
    if (!rawAddress) return '';
    return rawAddress.replace(/,\s*USA$/, '').replace(/,\s*United States$/, '').trim();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    const stateParam = params.get('state');
    const zipParam = params.get('zip');

    if (cityParam || stateParam || zipParam) {
      // Use URL parameters if provided
      setLocation({
        city: cityParam || 'In Your City',
        state: stateParam || '',
        zip: zipParam || ''
      });
    } else {
      // Automatically detect visitor's location via IP if no URL params exist
      fetch('https://ipapi.co/json/')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.city) {
            setLocation({
              city: data.city,
              state: data.region_code || '',
              zip: data.postal || ''
            });
          }
        })
        .catch((err) => {
          console.log('Location auto-detection skipped, using default.');
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
        setFormData(prev => ({ ...prev, address: cleanAddress(place.formatted_address) }));
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
    
    const GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyO1xA04qzQXeCXpR1SY6NVcXSpyeSakInv4yovvavMz3SyRkjXr5w85t3oS_10GnvM/exec';

    // Automatically clean the phone number and prepend +1 for Google Sheets
    const cleanPhone = formData.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

    const payload = {
      ...formData,
      phone: formattedPhone
    };

    try {
      await fetch(GOOGLE_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-4 font-sans relative overflow-hidden">
      
      {/* Live Ambient Neon Green Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full filter blur-[120px] opacity-80 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-400/10 rounded-full filter blur-[140px] opacity-70"></div>
      
      {/* PROGRAMMATIC HEADER SECTION */}
      {(!isScanning && !isComplete) && (
        <div className="max-w-xl text-center mb-4 sm:mb-6 relative z-10 px-2 space-y-2">
          
          {/* Active Blinking Network Coverage Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <Rocket size={14} className="text-emerald-400 animate-bounce" />
            <span className="text-[11px] sm:text-xs font-bold text-emerald-200 tracking-wide uppercase">
              Live Grid: <strong className="text-emerald-400">{location.city}{location.state ? `, ${location.state}` : ''} {location.zip ? `(${location.zip})` : ''}</strong>
            </span>
          </div>

          {/* Dynamic Dopamine-Driven Headlines */}
          {step === 1 ? (
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              Unlock secret <span className="text-emerald-400 underline decoration-emerald-400/50 underline-offset-4">ZERO DOWN</span> internet deals in{' '}
              <span className="text-emerald-400 underline decoration-emerald-400/50 underline-offset-4">
                {location.city}{location.state ? `, ${location.state}` : ''}
              </span>{' '}
              before slots vanish:
            </h1>
          ) : step === 2 ? (
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              Boom! Finding lightning-fast speeds right at{' '}
              <span className="text-emerald-400 underline decoration-emerald-400/50 underline-offset-4">
                {formData.address || `${location.city}${location.state ? `, ${location.state}` : ''}`}
              </span>:
            </h1>
          ) : (
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              Jackpot! Your custom high-speed setup is ready. Where should we send your access pass? 🚀
            </h1>
          )}
        </div>
      )}

      {/* Glassmorphism Card Container */}
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-emerald-500/30 min-h-[380px] flex flex-col justify-center relative z-10 overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>

        <div className="p-6 sm:p-8">
          {(!isScanning && !isComplete) && (
            <div className="text-center mb-4">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Instant Address Verification
              </p>
            </div>
          )}

          {isComplete ? (
            <div className="text-center py-2 animate-in fade-in zoom-in duration-500">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-3 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/40">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1">
                You're In, <span className="text-emerald-400">{formData.fullName || 'Neighbor'}</span>! 🔥
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm font-medium mb-5 px-1 leading-relaxed">
                We locked down unlisted high-speed options near <strong className="text-white underline">{formData.address || location.city}</strong> custom-tuned for <span className="text-emerald-300 font-bold">{formData.usage || 'your household'}</span>.
              </p>
              
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse"></div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertCircle size={15} className="text-emerald-400 animate-pulse" />
                  <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
                    Exclusive Spot Reservation Active
                  </p>
                </div>
                <div className="text-3xl font-black text-emerald-300 tracking-tighter font-mono my-1.5 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-snug">
                  Surging local demand means this spot will auto-release to someone else soon. Claim your zero-down setup right now!
                </p>
              </div>

              <a 
                href="tel:18884826192" 
                className="w-full flex items-center justify-center bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-base py-3.5 px-6 rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:-translate-y-1 active:translate-y-0"
              >
                <Phone className="mr-2 animate-bounce text-slate-950" size={20} />
                Call 1 (888) 482-6192 Now
              </a>
              
              <p className="text-[11px] text-slate-400 font-medium mt-3">
                <span className="relative flex h-2 w-2 inline-flex mr-2 mb-[1px]">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Priority dispatch line active. Wait time: &lt; 30 seconds.
              </p>
            </div>
          ) : isScanning ? (
            
            <div className="flex flex-col items-center justify-center py-8 space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-center space-x-6 w-full px-4">
                <div className="relative flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-md z-10">
                    <Home size={28} className="text-emerald-400" />
                  </div>
                </div>
                <div className="flex space-x-2 flex-grow justify-center">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(16,185,129,0.9)] [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(16,185,129,0.9)] [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
                </div>
                <div className="relative flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.3)] z-10">
                    <Rocket size={30} className="text-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center justify-center">
                  Scanning available speeds
                  <span className="w-6 text-left animate-pulse text-emerald-400">...</span>
                </h2>
                <p className="text-sm text-slate-400">Locking address for:</p>
                <p className="text-sm font-semibold text-emerald-300 bg-emerald-500/10 px-4 py-1.5 rounded-xl mx-auto inline-block border border-emerald-500/30 backdrop-blur-sm">
                  {formData.address || `${location.city}${location.state ? `, ${location.state}` : ''}`}
                </p>
              </div>
            </div>
            
          ) : (
            
            <form onSubmit={handleFormRouting}>
              
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <label className="block text-sm font-bold text-slate-200">Where do you need service?</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400 z-10 transition-colors">
                      <MapPin size={20} />
                    </div>
                    <input
                      ref={googlePlacesRef}
                      type="text"
                      required
                      placeholder={`e.g., 123 Main St, ${location.city}`}
                      className="w-full pl-11 pr-4 py-4 bg-slate-950/80 backdrop-blur-sm border border-emerald-500/20 rounded-2xl text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-500 font-medium text-sm sm:text-base"
                      defaultValue={formData.address}
                      onChange={(e) => setFormData({...formData, address: cleanAddress(e.target.value)})}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                  <label className="block text-sm font-bold text-slate-200">What do you primarily use the internet for?</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {['Heavy Gaming', '4K Streaming', 'Working from Home', 'Basic Browsing'].map((usageOption) => (
                      <button
                        type="button"
                        key={usageOption}
                        className={`flex items-center p-3.5 sm:p-4 border rounded-2xl transition-all shadow-sm group text-sm sm:text-base ${
                          formData.usage === usageOption 
                            ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'border-emerald-500/20 bg-slate-950/40 text-white hover:border-emerald-400/50 hover:bg-slate-950/70'
                        }`}
                        onClick={() => {
                          setFormData({...formData, usage: usageOption});
                          setTimeout(handleNext, 350);
                        }}
                      >
                        <Activity size={18} className={`mr-3 transition-colors ${formData.usage === usageOption ? 'text-emerald-400' : 'text-emerald-400/70 group-hover:text-emerald-300'}`} />
                        <span>{usageOption}</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={handleBack} className="text-sm text-slate-400 hover:text-emerald-400 mt-2 font-semibold transition-colors flex items-center">
                    ← Back
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-500">
                  <label className="block text-sm font-bold text-slate-200">Where should we send your results?</label>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400 transition-colors">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Full Name"
                      className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-slate-950/80 backdrop-blur-sm border border-emerald-500/20 rounded-2xl text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-500 font-medium text-sm sm:text-base"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400 transition-colors">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="numeric"
                      placeholder="Phone Number"
                      className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-slate-950/80 backdrop-blur-sm border border-emerald-500/20 rounded-2xl text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-500 font-medium text-sm sm:text-base"
                      value={formData.phone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setFormData({...formData, phone: numericValue});
                      }}
                    />
                  </div>
                  <button type="button" onClick={handleBack} className="text-sm text-slate-400 hover:text-emerald-400 mt-1 font-semibold transition-colors flex items-center">
                    ← Back
                  </button>
                </div>
              )}

              {step !== 2 && (
                <div className="mt-6 sm:mt-8 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black py-3.5 sm:py-4 px-6 rounded-2xl transition-all flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-70 active:scale-[0.98]"
                  >
                    {step === 1 ? (
                      <>Check Coverage <ArrowRight size={18} className="ml-2" /></>
                    ) : (
                      <>
                        {isSubmitting ? (
                          <><Loader2 size={18} className="mr-2 animate-spin" /> Unlocking...</>
                        ) : 'Reveal My Options'}
                      </>
                    )}
                  </button>

                  {step === 3 && (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed text-center px-2 font-medium">
                      <Lock size={10} className="inline mr-1 mb-[2px] text-slate-400" />
                      By clicking 'Reveal My Options', you authorize Home Tech Dealer Inc. to contact you via SMS and phone regarding your coverage options. Msg & data rates may apply. Your information is secure.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-center gap-2">
                {[1, 2, 3].map((dot) => (
                  <div key={dot} className={`h-1.5 rounded-full transition-all duration-500 ${step >= dot ? 'w-8 sm:w-10 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'w-3 sm:w-4 bg-slate-800'}`} />
                ))}
              </div>
              
            </form>
          )}
        </div>
      </div>
    </div>
  );
}