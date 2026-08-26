import { useState, useEffect } from 'react';
import { MapPin, Activity, User, Phone, ArrowRight, CheckCircle2, Loader2, Home, Lock, AlertCircle, Rocket, X, ShieldCheck, Zap, Bell } from 'lucide-react';
import { usePlacesWidget } from 'react-google-autocomplete';
import GlassCard from './components/ui/GlassCard';
import Button from './components/ui/Button';

export default function App() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBuildingOffer, setIsBuildingOffer] = useState(false);
  const [buildStatusIndex, setBuildStatusIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  
  // Speedometer rolling counter states
  const [displaySpeed, setDisplaySpeed] = useState(0);
  const [speedColor, setSpeedColor] = useState('text-red-400');

  // Dynamic Auth Code for the final page
  const [authCode] = useState(() => 'TX-' + Math.floor(1000 + Math.random() * 9000));

  // Live urgency toast state
  const [showToast, setShowToast] = useState(false);
  const [slotsRemaining, setSlotsRemaining] = useState(3);
  
  const [activeModal, setActiveModal] = useState(null); // 'privacy' or 'terms' or 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(600);
  
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

  const buildSteps = [
    `Verifying regional port availability in ${location.city}...`,
    `Allocating zero-down tier for ${formData.fullName || 'household'}...`,
    `Finalizing priority access pass & locking slot...`
  ];

  const cleanAddress = (rawAddress) => {
    if (!rawAddress) return '';
    return rawAddress.replace(/,\s*USA$/, '').replace(/,\s*United States$/, '');
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Upgraded location hook with mobile ad fallback protection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    const stateParam = params.get('state');
    const zipParam = params.get('zip');

    if (cityParam || stateParam || zipParam) {
      setLocation({
        city: cityParam || 'In Your City',
        state: stateParam || '',
        zip: zipParam || ''
      });
    } else {
      fetch('https://ipapi.co/json/')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.city) {
            setLocation({
              city: data.city,
              state: data.region_code || '',
              zip: data.postal || ''
            });
          } else {
            throw new Error('Primary lookup failed');
          }
        })
        .catch(() => {
          // Fallback provider for mobile ad in-app browsers
          fetch('https://ipwho.is/')
            .then((res) => res.json())
            .then((backupData) => {
              if (backupData && backupData.success && backupData.city) {
                setLocation({
                  city: backupData.city,
                  state: backupData.region_code || '',
                  zip: backupData.postal || ''
                });
              }
            })
            .catch(() => {
              console.log('Location auto-detection skipped, using default.');
            });
        });
    }
  }, []);

  useEffect(() => {
    let toastTimer;
    if (step >= 3 && !isComplete) {
      toastTimer = setTimeout(() => {
        setShowToast(true);
        setSlotsRemaining(2);
        setTimeout(() => setShowToast(false), 6000);
      }, 4000);
    }
    return () => clearTimeout(toastTimer);
  }, [step, isComplete]);

  useEffect(() => {
    if (isComplete && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [isComplete, timeLeft]);

  useEffect(() => {
    let statusInterval;
    if (isBuildingOffer) {
      statusInterval = setInterval(() => {
        setBuildStatusIndex((prev) => {
          if (prev < buildSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 1100);
    }
    return () => clearInterval(statusInterval);
  }, [isBuildingOffer, buildSteps.length]);

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
      if (!formData.address.trim()) {
        setErrorMessage('Please enter your service address to check coverage slots.');
        setActiveModal('error');
        return;
      }
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        handleNext();
      }, 1200);
    } else if (step === 2) {
      if (!formData.usage) {
        setErrorMessage('Please select how you primarily use the internet.');
        setActiveModal('error');
        return;
      }
      setIsDiagnosticRunning(true);
      setDiagnosticProgress(0);
      setDisplaySpeed(0);
      setSpeedColor('text-red-400');

      let currentSpeed = 0;
      const speedInterval = setInterval(() => {
        currentSpeed += 25;
        if (currentSpeed <= 400) {
          setSpeedColor('text-red-400');
        } else if (currentSpeed <= 750) {
          setSpeedColor('text-amber-400');
        } else {
          setSpeedColor('text-emerald-400');
        }

        if (currentSpeed >= 1000) {
          setDisplaySpeed(1000);
          clearInterval(speedInterval);
        } else {
          setDisplaySpeed(currentSpeed);
        }
      }, 20);

      const progressInterval = setInterval(() => {
        setDiagnosticProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsDiagnosticRunning(false);
            setStep(3);
            return 100;
          }
          return prev + 25;
        });
      }, 300);

    } else if (step === 3) {
      if (!formData.fullName.trim()) {
        setErrorMessage("Please enter your first name so we can reserve your spot.");
        setActiveModal('error');
        return;
      }
      handleNext(); 
    } else if (step === 4) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setErrorMessage('Please provide a valid 10-digit phone number to receive your access pass.');
        setActiveModal('error');
        return;
      }
      handleSubmit(e);
    } else {
      handleNext();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsBuildingOffer(true);
    setBuildStatusIndex(0);
    
    const GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwwxKXPwBT_8LaRKqt0BRTUoc76jdWiNv-dM6eOjJGDSv75Z8g-hx9XRoZj1VjCCyU4/exec';
    const P50_WEBHOOK_URL = 'https://leads.p50digital.com/webhooks/leads/ingest';
    
    const cleanPhone = formData.phone.replace(/\D/g, '');
    const p50Phone = cleanPhone.length === 11 && cleanPhone.startsWith('1') ? cleanPhone.slice(1) : cleanPhone;
    const twilioPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

    const urlParams = new URLSearchParams(window.location.search);

    const p50Payload = {
      phone: p50Phone,
      first_name: formData.fullName,
      address: formData.address,
      city: location.city,
      state: location.state,
      zip: location.zip,
      landing_page: window.location.href,
      utm_source: urlParams.get('utm_source') || 'facebook',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_content: urlParams.get('utm_content') || '',
      utm_term: urlParams.get('utm_term') || '',
      fbclid: urlParams.get('fbclid') || '',
      gclid: urlParams.get('gclid') || '',
      ttclid: urlParams.get('ttclid') || '',
      msclkid: urlParams.get('msclkid') || ''
    };

    const internalPayload = {
      ...formData,
      phone: twilioPhone,
      city: location.city,
      state: location.state,
      pageUrl: window.location.href,
      fbclid: urlParams.get('fbclid') || ''
    };

    try {
      await Promise.allSettled([
        fetch(GOOGLE_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(internalPayload)
        }),
        fetch(P50_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-P50-Key': 'p50key_KqExlEEta_HIFD-DPe_IQ_zUjknXYJwu'
          },
          body: JSON.stringify(p50Payload)
        })
      ]);
      
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: 'Prime Coverage Lead',
          currency: 'USD',
          value: 0.00
        });
      }

      setTimeout(() => {
        setIsBuildingOffer(false);
        setIsComplete(true);
      }, 3500);

    } catch (error) {
      console.error('Error submitting data', error);
      setIsBuildingOffer(false);
      setErrorMessage('There was a network error connecting to dispatch. Please try again.');
      setActiveModal('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-[100dvh] sm:min-h-screen bg-slate-950 flex flex-col items-center p-3 sm:p-4 font-sans relative overflow-x-hidden overflow-y-auto sm:overflow-hidden ${
      (isScanning || isBuildingOffer || isDiagnosticRunning || isComplete) 
        ? 'justify-center' 
        : 'justify-start sm:justify-center pt-2 sm:pt-4 pb-48 sm:pb-4'
    }`}>
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/15 rounded-full filter blur-[120px] opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/10 rounded-full filter blur-[140px] opacity-60 pointer-events-none"></div>
      
      {/* LIVE URGENCY TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-50 bg-slate-900/95 border border-amber-500/50 backdrop-blur-xl p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 sm:max-w-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 animate-pulse">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Live Grid Update</p>
            <p className="text-xs text-white font-medium">Someone in <span className="text-emerald-400 font-bold">{location.city}</span> just claimed a spot! <strong className="text-amber-300 font-black">Only {slotsRemaining} remain</strong>.</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      {(!isScanning && !isBuildingOffer && !isDiagnosticRunning && !isComplete) && (
        <div className="max-w-xl text-center mb-1.5 sm:mb-4 relative z-10 px-2 space-y-1 sm:space-y-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 bg-amber-500/10 border border-amber-500/30 py-1 sm:py-1.5 px-3 sm:px-3.5 rounded-xl mx-auto w-fit shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Only {slotsRemaining} Zero-Down Spots Left in {location.city}
            </span>
          </div>

          {step === 1 ? (
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight sm:leading-snug">
                Check your address for the new <span className="text-emerald-400 underline decoration-emerald-400/50 underline-offset-4">$35/mo Gateway network</span> in{' '}
                <span className="text-emerald-400 underline decoration-emerald-400/50 underline-offset-4">
                  {location.city}{location.state ? `, ${location.state}` : ''}
                </span>:
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium px-2">
                Ultra-fast, zero-down home internet. No hard credit checks. No hidden fees.
              </p>
            </div>
          ) : step === 2 ? (
            <h1 className="text-lg sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight sm:leading-snug">
              Almost there! Tell us how you use the web to ensure prime coverage at{' '}
              <span className="text-emerald-400 underline decoration-emerald-400/50 underline-offset-4">
                {formData.address || `${location.city}${location.state ? `, ${location.state}` : ''}`}
              </span>:
            </h1>
          ) : (
            <h1 className="text-lg sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight sm:leading-snug">
              Diagnostic Complete! Where should we send your custom zero-down rates and plan options? ⚡
            </h1>
          )}
        </div>
      )}

      {/* Main GlassCard Container */}
      <GlassCard className="max-w-md w-full min-h-[280px] sm:min-h-[380px] flex flex-col justify-center relative z-10">
        <div className="p-3.5 sm:p-8">
          
          {(!isScanning && !isBuildingOffer && !isDiagnosticRunning && !isComplete && step !== 1) && (
            <div className="text-center mb-2 sm:mb-3">
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Instant Address Verification
              </p>
            </div>
          )}

          {isDiagnosticRunning ? (
            <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-500">
              
              <div className="text-center space-y-1 px-2 mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Verifying Prime Coverage
                </h2>
              </div>

              {/* SPEEDOMETER GAUGE - FIXED SIZE */}
              <div className="relative w-56 h-32 flex items-end justify-center mb-2">
                <svg viewBox="0 0 200 120" className="absolute top-0 left-0 w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={speedColor === 'text-red-400' ? '#f87171' : speedColor === 'text-amber-400' ? '#fbbf24' : '#34d399'}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (diagnosticProgress / 100))}
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                
                {/* Gauge Numbers */}
                <div className="absolute bottom-1.5 flex flex-col items-center">
                  <div className={`text-4xl font-black font-mono tracking-tighter transition-colors duration-200 ${speedColor}`}>
                    {displaySpeed}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mbps</span>
                </div>
              </div>

              <p className="text-[11px] font-mono text-emerald-400 font-bold mt-4">Securing bandwidth for {formData.usage || 'Household'}...</p>
            </div>
          ) : isBuildingOffer ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in duration-500">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-ping"></div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] z-10">
                  <Loader2 size={32} className="animate-spin text-emerald-400" />
                </div>
              </div>

              <div className="text-center space-y-2 px-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Building Offer for <span className="text-emerald-400">{formData.fullName || 'You'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-emerald-300 font-medium bg-emerald-950/50 border border-emerald-500/30 px-4 py-2 rounded-xl">
                  {buildSteps[buildStatusIndex]}
                </p>
              </div>

              <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full transition-all duration-700 rounded-full" style={{ width: `${((buildStatusIndex + 1) / buildSteps.length) * 100}%` }}></div>
              </div>
            </div>
          ) : isComplete ? (
            <div className="text-center py-2 animate-in fade-in duration-500">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-3 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/40">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1">
                Speeds Authorized! 🔥
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm font-medium mb-4 px-1 leading-relaxed">
                Your zero-down installation at <strong className="text-white underline">{formData.address || location.city}</strong> is approved.
              </p>
              
              {/* CURIOSITY PAYOFF CHECKLIST */}
              <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 mb-5 text-left space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Max Speed Authorized:</span>
                  <span className="text-emerald-400 font-bold flex items-center">Up to 1,000 Mbps <CheckCircle2 size={14} className="ml-1"/></span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Upfront Cost:</span>
                  <span className="text-emerald-400 font-bold flex items-center">$0.00 (Zero-Down) <CheckCircle2 size={14} className="ml-1"/></span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2.5 mt-1">
                  <span className="text-slate-300 font-medium">Monthly Rate:</span>
                  <span className="text-amber-400 font-bold flex items-center bg-amber-500/10 px-2 py-0.5 rounded text-xs border border-amber-500/20">Pending Agent Selection <Lock size={12} className="ml-1.5"/></span>
                </div>
              </div>
              
              {/* LIVE TIMER & AUTH CODE */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertCircle size={15} className="text-emerald-400" />
                  <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
                    Live Dispatcher Holding
                  </p>
                </div>
                <div className="text-3xl font-black text-emerald-300 tracking-tighter font-mono my-1.5 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-snug mb-3">
                  Dispatcher is currently holding your zero-down allocation file open. If we don't hear from you before the timer expires, the port goes to the next address.
                </p>

                <div className="bg-slate-950/80 border border-dashed border-emerald-500/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Your Authorization Code</p>
                  <p className="text-2xl font-black text-white font-mono tracking-wider">{authCode}</p>
                </div>
              </div>

              <a 
                href="tel:18884826192" 
                className="w-full flex flex-col items-center justify-center bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black py-4 px-6 rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="flex items-center text-base sm:text-lg">
                  <Phone className="mr-2 text-slate-950 animate-bounce" size={20} />
                  Call Dispatch Now
                </div>
                <span className="text-xs font-extrabold tracking-wide mt-0.5 opacity-90 underline">
                  1 (888) 482-6192
                </span>
              </a>
              <p className="text-[11px] text-slate-400 mt-3 font-medium">
                ⚡ <strong className="text-slate-300">Note:</strong> We just sent a backup text to your phone. You can reply there, OR click the button above to skip the SMS queue and lock in your speeds instantly.
              </p>
            </div>
          ) : isScanning ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-center space-x-6 w-full px-4">
                <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-white/10 shadow-md z-10">
                  <Home size={28} className="text-emerald-400" />
                </div>
                <div className="flex space-x-2 flex-grow justify-center">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></div>
                </div>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.3)] z-10">
                  <Rocket size={30} className="text-emerald-400" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center justify-center">
                  Scanning available speeds...
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
                <div className="space-y-4 animate-in fade-in duration-300">
                  
                  {/* INLINE SVG ROUTER WITH MATCHING BACKGROUND */}
                  <div className="relative flex flex-col justify-center items-center mb-6">
                    <svg viewBox="0 0 100 160" className="w-24 sm:w-28 h-auto drop-shadow-[0_10px_25px_rgba(16,185,129,0.25)]">
                      <defs>
                        <radialGradient id="routerGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="routerBody" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="50%" stopColor="#0f172a" />
                          <stop offset="100%" stopColor="#020617" />
                        </linearGradient>
                      </defs>
                      {/* Ambient Glow */}
                      <circle cx="50" cy="80" r="60" fill="url(#routerGlow)" />
                      {/* Main Router Body */}
                      <rect x="25" y="20" width="50" height="120" rx="15" fill="url(#routerBody)" stroke="#334155" strokeWidth="1" />
                      {/* Top Indent */}
                      <ellipse cx="50" cy="25" rx="20" ry="6" fill="#020617" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5" />
                      {/* Flashing LED Status Line */}
                      <rect x="48" y="45" width="4" height="35" rx="2" fill="#10b981" className="animate-pulse" />
                      {/* Base/Stand */}
                      <ellipse cx="50" cy="135" rx="23" ry="7" fill="#020617" stroke="#334155" strokeWidth="1" />
                    </svg>

                    <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Instant Address Verification
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-2">Enter your service address to claim your 15-Day Free Trial:</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400 z-10">
                        <MapPin size={20} />
                      </div>
                      <input
                        ref={googlePlacesRef}
                        type="text"
                        placeholder={`e.g., 123 Main St, ${location.city}`}
                        className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-slate-800/90 backdrop-blur-md border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] rounded-2xl text-white focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 font-medium text-base"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: cleanAddress(e.target.value)})}
                      />
                    </div>
                    <div className="mt-2 text-center flex items-center justify-center text-[10px] sm:text-[11px] text-slate-400 font-medium">
                      <Lock size={12} className="mr-1 opacity-70" /> 100% Secure. Used only to verify local tower connection.
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6">
                    <Button type="submit" className="w-full">
                      Check My Address <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-300">
                  <label className="block text-sm font-bold text-slate-200">What do you primarily use the internet for?</label>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3.5">
                    {['Heavy Gaming', '4K Streaming', 'Working from Home', 'Basic Browsing'].map((usageOption) => (
                      <button
                        type="button"
                        key={usageOption}
                        className={`flex items-center p-2.5 sm:p-4 border rounded-2xl transition-all shadow-sm group text-sm sm:text-base active:scale-[0.99] ${
                          formData.usage === usageOption 
                            ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'border-white/10 bg-slate-950/40 text-white hover:border-emerald-400/50 hover:bg-slate-950/70'
                        }`}
                        onClick={() => setFormData({...formData, usage: usageOption})}
                      >
                        <Activity size={18} className={`mr-3 transition-colors ${formData.usage === usageOption ? 'text-emerald-400' : 'text-emerald-400/70 group-hover:text-emerald-300'}`} />
                        <span>{usageOption}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-3 sm:mt-6 flex gap-3">
                    <button type="button" onClick={handleBack} className="text-sm text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center px-4 py-3 bg-slate-950/50 border border-white/10 rounded-2xl">
                      ← Back
                    </button>
                    <Button type="submit" className="flex-grow">
                      Ensure Prime Coverage <Zap size={18} className="ml-2 text-slate-950" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3 sm:space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 text-center mb-2 shadow-inner">
                    <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 text-emerald-400 mb-1 border border-emerald-500/40">
                      <Zap size={18} />
                    </div>
                    <p className="text-emerald-400 font-black text-[10px] sm:text-xs uppercase tracking-wider">
                      Diagnostic Complete
                    </p>
                    <p className="text-white font-extrabold text-xs sm:text-sm mt-0.5 sm:mt-1">
                      We found 2 zero-down plans for your address.
                    </p>
                  </div>

                  <label className="block text-sm font-bold text-slate-200 mt-2">What is your first name?</label>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-slate-800/90 backdrop-blur-md border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] rounded-2xl text-white focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 font-medium text-base"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>

                  <div className="mt-4 sm:mt-6 flex gap-3">
                    <button type="button" onClick={handleBack} className="text-sm text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center px-4 py-3 bg-slate-950/50 border border-white/10 rounded-2xl">
                      ← Back
                    </button>
                    <Button type="submit" className="flex-grow">
                      Next <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3 sm:space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 text-center mb-2 shadow-inner">
                    <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 text-emerald-400 mb-1 border border-emerald-500/40">
                      <Zap size={18} />
                    </div>
                    <p className="text-emerald-400 font-black text-[10px] sm:text-xs uppercase tracking-wider">
                      Almost Done
                    </p>
                    <p className="text-white font-extrabold text-xs sm:text-sm mt-0.5 sm:mt-1">
                      Great to meet you, {formData.fullName}.
                    </p>
                  </div>

                  <label className="block text-sm font-bold text-slate-200 mt-2">What mobile number should we text your speed results to?</label>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="(555) 555-5555"
                      className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-slate-950/80 backdrop-blur-sm border border-white/10 rounded-2xl text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-500 font-medium text-base font-mono"
                      value={formData.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setFormData({...formData, phone: formatted});
                      }}
                    />
                  </div>

                  <p className="text-red-400 font-bold text-[10px] sm:text-xs text-center px-2 mt-2">
                    Note: Unclaimed ports in {location.city} are automatically released to the next address in queue after 10 minutes.
                  </p>

                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    <Button type="submit" disabled={isSubmitting} className="w-full animate-pulse">
                      {isSubmitting ? (
                        <><Loader2 size={18} className="mr-2 animate-spin text-slate-950" /> Unlocking...</>
                      ) : 'Lock In Prime Coverage'}
                    </Button>

                    <div className="flex justify-center items-center gap-2 sm:gap-4 py-2">
                      <span className="flex items-center text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wide"><CheckCircle2 size={12} className="mr-1"/> No Hard Credit Check</span>
                      <span className="flex items-center text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wide"><CheckCircle2 size={12} className="mr-1"/> Zero Setup Fees</span>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed text-center px-1 font-medium border-t border-white/10 pt-3">
                      <Lock size={10} className="inline mr-1 mb-[2px] text-slate-400" />
                      By clicking 'Lock In Prime Coverage', you give express written consent for Home Tech Dealer Inc. and P50 Digital LLC to contact you via automated phone calls and text messages regarding your coverage options. Msg & data rates may apply. Consent is not a condition of purchase.
                    </p>

                    <div className="mt-1 pt-1 text-center">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                        Read our{' '}
                        <button type="button" onClick={() => setActiveModal('privacy')} className="text-emerald-400 hover:underline bg-transparent border-none cursor-pointer p-0 font-medium">Privacy Policy</button>
                        {' '}and{' '}
                        <button type="button" onClick={() => setActiveModal('terms')} className="text-emerald-400 hover:underline bg-transparent border-none cursor-pointer p-0 font-medium">Terms of Service</button>.
                      </p>
                    </div>
                  </div>

                  <button type="button" onClick={handleBack} className="text-sm text-slate-400 hover:text-emerald-400 mt-1 font-semibold transition-colors flex items-center active:scale-95">
                    ← Back
                  </button>
                </div>
              )}

              {/* Progress Indicator Dots + Trust Footer */}
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4].map((dot) => (
                    <div key={dot} className={`h-1.5 rounded-full transition-all duration-500 ${step >= dot ? 'w-6 sm:w-8 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'w-2.5 sm:w-3 bg-slate-800'}`} />
                  ))}
                </div>

                {step === 1 ? (
                  <div className="pt-2 sm:pt-3 border-t border-white/10 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 py-1">
                    <span className="flex items-center text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-wide"><CheckCircle2 size={12} className="mr-1 text-emerald-400"/> 15-Day Free Trial</span>
                    <span className="flex items-center text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-wide"><CheckCircle2 size={12} className="mr-1 text-emerald-400"/> Zero Setup Fees</span>
                    <span className="flex items-center text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-wide"><CheckCircle2 size={12} className="mr-1 text-emerald-400"/> Gateway Inc. Authorized</span>
                  </div>
                ) : (
                  <div className="pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>© 2026 Gateway Inc. — Premium Home Connectivity</span>
                  </div>
                )}
              </div>
              
            </form>
          )}
        </div>
      </GlassCard>

      {/* ERROR MODAL POPUP */}
      {activeModal === 'error' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard className="max-w-sm w-full p-6 text-center border-amber-500/40">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/30">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Attention Required</h3>
            <p className="text-slate-300 text-xs sm:text-sm mb-5 font-medium leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-sm cursor-pointer"
            >
              Got It
            </button>
          </GlassCard>
        </div>
      )}

      {/* POLICY MODALS POPUP */}
      {activeModal && activeModal !== 'error' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <GlassCard className="max-w-lg w-full p-6 relative max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors active:scale-95 cursor-pointer"
            >
              <X size={18} />
            </button>

            {activeModal === 'privacy' ? (
              <div className="space-y-4 text-slate-300 text-sm">
                <h3 className="text-xl font-black text-white">Privacy Policy</h3>
                <p>Last updated: August 2026</p>
                <p>Home Tech Dealer Inc. and P50 Digital LLC (dba Home Service Bundles) ("we," "our," or "us") respect your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or submit your contact information.</p>
                <h4 className="font-bold text-white mt-3">1. Information We Collect</h4>
                <p>We collect personal information that you voluntarily provide to us when expressing an interest in obtaining our services, including your full name, phone number, and service address.</p>
                <h4 className="font-bold text-white mt-3">2. How We Use Your Information</h4>
                <p>We use the information we collect to connect you with high-speed internet providers, process promotional eligibility, and communicate via phone or SMS text messaging regarding your service options.</p>
                <h4 className="font-bold text-white mt-3">3. Information Sharing and Fulfillment</h4>
                <p>To provide you with accurate local pricing and to facilitate your service setup, the contact and location information you submit is shared between Home Tech Dealer Inc. and P50 Digital LLC (dba Home Service Bundles) for fulfillment and communication purposes.</p>
                <h4 className="font-bold text-white mt-3">4. SMS & Data Compliance</h4>
                <p>By providing your phone number, you give express written consent to receive recurring automated promotional and service text messages and phone calls from Home Tech Dealer Inc. and P50 Digital LLC (dba Home Service Bundles). You can opt-out at any time by replying **STOP**. Standard message and data rates apply.</p>
              </div>
            ) : (
              <div className="space-y-4 text-slate-300 text-sm">
                <h3 className="text-xl font-black text-white">Terms of Service</h3>
                <p>Last updated: August 2026</p>
                <p>By accessing or using the Home Tech Dealer platform, you agree to be bound by these Terms of Service.</p>
                <h4 className="font-bold text-white mt-3">1. Services</h4>
                <p>Home Tech Dealer provides an online portal allowing users to check promotional internet availability and pricing in their local coverage zones in partnership with P50 Digital LLC (dba Home Service Bundles).</p>
                <h4 className="font-bold text-white mt-3">2. Communications Consent</h4>
                <p>You agree to receive communications via phone calls and automated SMS text messages from Home Tech Dealer Inc. and P50 Digital LLC (dba Home Service Bundles). Consent to receive these communications is not a condition of any purchase. Reply **STOP** to any text message to opt-out immediately.</p>
                <h4 className="font-bold text-white mt-3">3. Limitation of Liability</h4>
                <p>Promotions, speeds, and zero-down offers depend on regional carrier availability and household qualification. We make no absolute guarantees of specific network speeds until confirmed by dispatch.</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}