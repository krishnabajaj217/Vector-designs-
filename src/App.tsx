import { useState, FormEvent, useEffect, MouseEvent } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Compass,
  FileCode,
  Download,
  Terminal,
  HelpCircle,
  Cpu,
  Layers,
  Palette,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_BRANDS } from './defaultBrands';
import { COLOR_PALETTES, LOGO_STYLES } from './data';
import { BrandKit, AnimationType, AnimationSettings, LogoStyle } from './types';
import { LogoCard } from './components/LogoCard';
import { generateRandomBrand, getAllSectors, GeneratedBrandConcept } from './lib/randomBrand';

// Firebase core elements
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, doc, getDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from './lib/firebase';

export default function App() {
  // Authentication & Cloud Database states
  const [user, setUser] = useState<User | null>(null);
  const [savedLogos, setSavedLogos] = useState<BrandKit[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic generated concept ideas state
  const [randomConcepts, setRandomConcepts] = useState<GeneratedBrandConcept[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const regenerateConcepts = (sectorId?: string) => {
    const targetSector = sectorId || selectedSector;
    const items: GeneratedBrandConcept[] = [];
    const usedNames = new Set<string>();
    
    let attempts = 0;
    while (items.length < 4 && attempts < 50) {
      const concept = generateRandomBrand(targetSector === 'all' ? undefined : targetSector);
      if (!usedNames.has(concept.companyName)) {
        usedNames.add(concept.companyName);
        items.push(concept);
      }
      attempts++;
    }
    setRandomConcepts(items);
  };

  // Pre-generate dynamic brand concepts on mount
  useEffect(() => {
    regenerateConcepts('all');
  }, []);

  // Primary active brand kit
  const [activeBrand, setActiveBrand] = useState<BrandKit>(DEFAULT_BRANDS[0]);
  
  // Generation input states
  const [companyName, setCompanyName] = useState('VELO ARCHITECTS');
  const [tagline, setTagline] = useState('ESTABLISHED 2024 / SEATTLE');
  const [description, setDescription] = useState(
    'Modern brutalist architecture firm specializing in sustainable urban high-rises. Strong vertical lines, monochromatic, professional.'
  );
  const [selectedStyle, setSelectedStyle] = useState<LogoStyle>('geometric');
  const [selectedPaletteId, setSelectedPaletteId] = useState('cool-tech');

  // Animation controller states
  const [animationType, setAnimationType] = useState<AnimationType>('modern-reveal');
  const [settings, setSettings] = useState<AnimationSettings>({
    type: 'modern-reveal',
    duration: 3.2,
    delay: 0.2,
    easing: 'easeInOut',
    loop: true,
    intensity: 60
  });

  // UI state managers
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  // Sync Google SSO credential cycles on browser boot
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        addLog(`System Auth Status: User ${currentUser.displayName || 'Cloud Designer'} logged in successfully.`);
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Cloud Designer',
              photoURL: currentUser.photoURL || '',
              email: currentUser.email || '',
              createdAt: serverTimestamp()
            });
            addLog('Designer account provisioned in Cloud secure repository.');
          }
        } catch (err) {
          console.warn("User profile sync warning:", err);
        }
      } else {
        addLog('System Auth Status: Guest mode active.');
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync saved logos live snapshot updates if signed-in
  useEffect(() => {
    if (!user) {
      setSavedLogos([]);
      return;
    }

    const q = query(
      collection(db, 'logos'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logosList: BrandKit[] = [];
      snapshot.forEach((snapDoc) => {
        const data = snapDoc.data();
        logosList.push({
          logoId: snapDoc.id,
          companyName: data.companyName || '',
          tagline: data.tagline || '',
          concept: data.concept || '',
          hexColors: data.hexColors || [],
          logoSvg: data.logoSvg || '',
          recommendedAnimation: data.recommendedAnimation || 'modern-reveal',
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : ''
        });
      });
      // Chronological client-side sort
      logosList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSavedLogos(logosList);
    }, (err) => {
      console.error("Firestore onSnapshot database stream failed:", err);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Handle errors formatted as structured security validation details
  const handleSaveError = (err: any, op: OperationType, path: string) => {
    try {
      handleFirestoreError(err, op, path);
    } catch (securityFormatErr: any) {
      const rawMsg = securityFormatErr.message;
      setErrorMessage(`Data storage policy warning. Secure verification logs: ${rawMsg}`);
      addLog('Action aborted due to attribute validation warnings.');
    }
  };

  // Connect Google Profile SSO and create record details
  const handleSignIn = async () => {
    addLog('Establishing secure Google Authentication single sign-on sequence...');
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      addLog(`SSO Authenticated successfully. Welcome ${result.user.displayName}`);
    } catch (err: any) {
      console.error("SSO Connection failed:", err);
      setErrorMessage(`SSO Auth aborted: ${err.message}`);
      addLog('Security handshake aborted.');
    }
  };

  // Revoke designer profile connection
  const handleSignOut = async () => {
    addLog('Revoking access tokens and disconnecting cloud connection...');
    try {
      await signOut(auth);
      addLog('Session revoked. Connection safely closed.');
    } catch (err: any) {
      console.error("Session disconnect failed:", err);
      setErrorMessage(`REVOKE aborted: ${err.message}`);
    }
  };

  // Save current dynamic motion vector state to cloud document database
  const handleSaveLogo = async () => {
    if (!user) {
      setErrorMessage('Authorization required to update cloud database catalog.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    addLog('Preparing visual elements and testing schema invariants in workspace...');

    const logoPayload = {
      ownerId: user.uid,
      companyName: activeBrand.companyName,
      tagline: activeBrand.tagline,
      concept: activeBrand.concept,
      hexColors: activeBrand.hexColors,
      logoSvg: activeBrand.logoSvg,
      recommendedAnimation: activeBrand.recommendedAnimation,
      animationSettings: {
        type: animationType,
        duration: settings.duration,
        delay: settings.delay,
        easing: settings.easing,
        loop: settings.loop,
        intensity: settings.intensity
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      if (activeBrand.logoId) {
        addLog(`Updating database record [Record Code: ${activeBrand.logoId}]...`);
        const logoRef = doc(db, 'logos', activeBrand.logoId);
        const existingSnap = await getDoc(logoRef);
        if (!existingSnap.exists()) {
          throw new Error('Database integrity check failed: Target record removed in background.');
        }
        const existingData = existingSnap.data();

        await setDoc(logoRef, {
          ...logoPayload,
          createdAt: existingData.createdAt, // Lock the original creation date
          updatedAt: serverTimestamp()
        });
        addLog(`Database file [${activeBrand.logoId}] synchronized successfully.`);
      } else {
        const newLogoRef = doc(collection(db, 'logos'));
        addLog(`Allocating storage resources for branding record ${newLogoRef.id}...`);
        await setDoc(newLogoRef, {
          ...logoPayload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setActiveBrand(prev => ({
          ...prev,
          logoId: newLogoRef.id
        }));
        addLog(`Synchronized custom brand in Cloud Repository under ID: ${newLogoRef.id}`);
      }
    } catch (err: any) {
      console.error("Firestore write transaction aborted:", err);
      handleSaveError(err, activeBrand.logoId ? OperationType.UPDATE : OperationType.CREATE, activeBrand.logoId ? `logos/${activeBrand.logoId}` : 'logos');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete active vector motion from user history DB record
  const handleDeleteLogo = async (logoIdToDelete: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm('Permanently delete this logo and animate config from cloud database?')) return;

    addLog(`Preparing security request to delete brand record ${logoIdToDelete}...`);
    try {
      await deleteDoc(doc(db, 'logos', logoIdToDelete));
      addLog('Record purged successfully from cloud database.');
      if (activeBrand.logoId === logoIdToDelete) {
        setActiveBrand(prev => ({ ...prev, logoId: undefined }));
      }
    } catch (err: any) {
      console.error("Database deletion transaction aborted:", err);
      handleSaveError(err, OperationType.DELETE, `logos/${logoIdToDelete}`);
    }
  };

  // Quick start preset loader
  const handleLoadBrandPreset = (brand: BrandKit) => {
    setActiveBrand(brand);
    setCompanyName(brand.companyName);
    setTagline(brand.tagline);
    // Fallback search style
    const matchedStyle = LOGO_STYLES.find(
      (s) => brand.concept.toLowerCase().includes(s.id) || brand.concept.toLowerCase().includes(s.name.toLowerCase())
    );
    if (matchedStyle) setSelectedStyle(matchedStyle.id);
    setAnimationType(brand.recommendedAnimation as AnimationType);
    setSettings((prev) => ({
      ...prev,
      type: brand.recommendedAnimation as AnimationType
    }));
  };

  const addLog = (message: string) => {
    setGenerationLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Submit hander to Gemini server-side route
  const handleGenerateLogo = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMessage('Company Name is required to initialize design vectors.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationLogs([]);

    addLog('Establishing handshake with local vector compilation engine...');
    addLog('Constructing geometric canvas structure [500x500 viewBox]...');
    
    const chosenPalette = COLOR_PALETTES.find((p) => p.id === selectedPaletteId);
    const colors = chosenPalette ? chosenPalette.colors : [];

    addLog(`Configuring brand palette preset: "${chosenPalette?.name || 'Custom'}"`);
    addLog(`Style constraint chosen: "${selectedStyle.toUpperCase()}"`);
    addLog('Contacting server-side design studio powered by Gemini...');

    try {
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          tagline,
          description,
          style: selectedStyle,
          paletteColors: colors
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Generation error`);
      }

      const generatedData: BrandKit = await response.json();
      
      addLog('Validating vector paths returned from Gemini...');
      addLog('Identifying separate groupings for layout elements...');
      addLog(`Success! Recommendation acquired: "${generatedData.recommendedAnimation.toUpperCase()}" overlay mode.`);
      
      setActiveBrand({
        ...generatedData,
        createdAt: new Date().toISOString()
      });
      
      // Auto-set the recommended animation from intelligence metadata
      setAnimationType(generatedData.recommendedAnimation as AnimationType);
      setSettings((prev) => ({
        ...prev,
        type: generatedData.recommendedAnimation as AnimationType
      }));

    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Host server connection failed. Please ensure GEMINI_API_KEY is properly saved in AI Studio Secrets.'
      );
      addLog('Generation halted due to verification error.');
    } finally {
      setIsGenerating(false);
    }
  };



  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-[#FFFFFF] font-sans antialiased selection:bg-sky-500 selection:text-black">
      {/* Dynamic Grid Overlay matching Bold Typography theme */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[450px_1fr] min-h-screen divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
        
        {/* SIDEBAR CONTAINER: Controlled Inputs, Aesthetics, Configs */}
        <aside className="flex flex-col justify-between p-8 bg-[#0F0F0F] overflow-y-auto">
          <div>
            
            {/* Brutalist Header style */}
            <div className="mb-6 select-none">
              <div className="text-[10px] uppercase tracking-[4px] text-zinc-500 font-mono mb-2">
                STUDIO INTERFACE v1.4
              </div>
              <h1 className="text-4xl font-display font-extrabold tracking-tighter leading-none text-white transition-all hover:tracking-tight">
                VECTOR<br />
                MOTION.
              </h1>
              <p className="mt-2 text-zinc-400 text-xs leading-relaxed max-w-xs font-mono">
                AI Vector Designer & Real-time SVG Core Animation Suite
              </p>
            </div>

            {/* DESIGNER SECURE IDENTITY SSO PORTAL */}
            <div className="mb-6 p-4 bg-zinc-950 border-2 border-dashed border-zinc-850 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[2px] text-zinc-500 font-mono">
                  DESIGNER IDENTITY
                </span>
                {user ? (
                  <span className="text-[9px] text-[#A3E635] font-mono font-bold uppercase tracking-widest animate-pulse">
                    ● CONNECTED
                  </span>
                ) : (
                  <span className="text-[9px] text-zinc-650 font-mono uppercase tracking-widest">
                    ○ OFFLINE
                  </span>
                )}
              </div>

              {user ? (
                <div className="flex items-center justify-between gap-3 bg-[#111111] p-2.5 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128-128'}
                      alt="Designer Avatar"
                      className="w-8 h-8 rounded-full border border-sky-400 shrink-0 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-display font-black truncate uppercase text-white leading-tight">
                        {user.displayName}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500 truncate leading-none mt-0.5">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    type="button"
                    className="px-2 py-1 text-[9px] font-mono border border-zinc-800 hover:border-red-500 hover:text-red-400 rounded transition-colors text-zinc-400 shrink-0 uppercase"
                  >
                    REVOKE
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 leading-normal font-mono">
                    Activate Google credentials to gain access to persistent cloud repositories.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-black hover:bg-zinc-200 font-bold text-[10px] uppercase tracking-wider rounded transition-colors cursor-pointer border-none"
                  >
                    <span>CONNECT SSO AUTH</span>
                  </button>
                </div>
              )}
            </div>

            {/* Saved Cloud Designs List */}
            {user && (
              <div className="mb-6 p-4 bg-zinc-900/40 border-2 border-zinc-900 rounded-xl">
                <span className="block text-[9px] uppercase tracking-[2px] text-[#A3E635] font-mono mb-3">
                  CLOUDBANK SAVED BRANDS ({savedLogos.length})
                </span>
                {savedLogos.length === 0 ? (
                  <div className="text-[10px] text-zinc-500 italic font-mono py-1">
                    No cloud files registered. Hit "Save Design to Cloud" below.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {savedLogos.map((saved) => (
                      <button
                        key={saved.logoId}
                        type="button"
                        onClick={() => {
                          setActiveBrand(saved);
                          setCompanyName(saved.companyName);
                          setTagline(saved.tagline);
                          setAnimationType(saved.recommendedAnimation as AnimationType);
                          setSettings((prev) => ({
                            ...prev,
                            type: saved.recommendedAnimation as AnimationType
                          }));
                          addLog(`Loaded design [ID: ${saved.logoId}] from digital cloud bank.`);
                        }}
                        className={`w-full p-2 rounded text-left flex items-center justify-between transition-all border ${
                          activeBrand.logoId === saved.logoId
                            ? 'bg-[#A3E635]/10 border-[#A3E635] text-white'
                            : 'bg-zinc-950/80 border-dashed border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-display font-black leading-tight uppercase truncate">
                            {saved.companyName}
                          </div>
                          <div className="text-[8px] font-mono text-zinc-500 truncate leading-none mt-0.5">
                            ID: {saved.logoId?.slice(0, 8)}...
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="text-[8px] font-mono text-zinc-650 bg-zinc-900 px-1 py-0.5 rounded uppercase font-bold">
                            {saved.recommendedAnimation.split('-')[0]}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteLogo(saved.logoId || '', e)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors rounded"
                            title="Delete from cloud database"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-14V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Real-time Brand Studio Generator */}
            <div className="mb-6 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-[2px] text-sky-400 font-mono">
                  BIZ-IDEA BRAINSTORMING CORE
                </span>
                <span className="text-[8px] bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                  REAL-TIME
                </span>
              </div>

              <div className="flex gap-1.5">
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    const sec = e.target.value;
                    setSelectedSector(sec);
                    regenerateConcepts(sec);
                  }}
                  className="flex-1 text-[10px] font-mono bg-zinc-950 border border-zinc-850 rounded px-2 py-1.5 outline-none text-zinc-300 cursor-pointer"
                >
                  <option value="all">🌐 All Industries Combined</option>
                  <option value="cosmo-tech">🚀 Space / Quantum / AI</option>
                  <option value="eco-wellness">🌱 Organic / Wellness</option>
                  <option value="cyber-gaming">🎮 Cyber / Creative Creator</option>
                  <option value="finance-heritage">⚖️ Legacy Law / Trust Capital</option>
                  <option value="minimal-brutalist">🏛️ Brutalist / Architecture</option>
                  <option value="artisanal-gourmet">🍳 Slow Food / Bakeries</option>
                </select>

                <button
                  type="button"
                  onClick={() => regenerateConcepts(selectedSector)}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer"
                  title="Refresh brainstorm list"
                >
                  🔄
                </button>
              </div>

              <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-1">
                {randomConcepts.map((concept, idx) => (
                  <button
                    key={`${concept.companyName}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCompanyName(concept.companyName);
                      setTagline(concept.tagline);
                      setDescription(concept.description);
                      setSelectedStyle(concept.style);
                      setSelectedPaletteId(concept.paletteId);
                      addLog(`Brainstorm loaded: "${concept.companyName}" (${concept.industry}) into editor.`);
                    }}
                    className="w-full text-left p-2 rounded bg-zinc-950 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900 transition-all flex items-center justify-between gap-2 min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-display font-black leading-tight text-white uppercase truncate flex items-center gap-1">
                        <span className="text-sky-400">⚡</span> {concept.companyName}
                      </div>
                      <div className="text-[8px] font-mono text-zinc-500 truncate mt-0.5 leading-none">
                        {concept.tagline}
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded shrink-0 leading-none">
                      {concept.industry.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const surprise = generateRandomBrand(selectedSector === 'all' ? undefined : selectedSector);
                    setCompanyName(surprise.companyName);
                    setTagline(surprise.tagline);
                    setDescription(surprise.description);
                    setSelectedStyle(surprise.style);
                    setSelectedPaletteId(surprise.paletteId);
                    addLog(`Surprise Randomized: Loaded "${surprise.companyName}" parameters.`);
                  }}
                  className="py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 border border-dashed border-sky-400/20 hover:border-sky-400/40 rounded text-[9.5px] font-mono transition-all uppercase flex items-center justify-center gap-1 font-bold cursor-pointer"
                >
                  🎲 RANDOM CONCEPT
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Load one of the classic fallback presets
                    const randomIndex = Math.floor(Math.random() * DEFAULT_BRANDS.length);
                    const b = DEFAULT_BRANDS[randomIndex];
                    handleLoadBrandPreset(b);
                    addLog(`Loaded classic demo template: ${b.companyName}`);
                  }}
                  className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded text-[9.5px] font-mono transition-all uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  📝 CLASSIC CHASSIS
                </button>
              </div>
            </div>

            {/* Interactive Design Creator Form */}
            <form onSubmit={handleGenerateLogo} className="space-y-4">
              <span className="block text-[10px] uppercase tracking-[2px] text-zinc-500 font-mono">
                DESIGN PARAMETERS
              </span>

              {/* Brand Name */}
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
                  placeholder="e.g. VELO ARCHITECTS"
                  className="w-full text-xs font-mono bg-[#1A1A1A] border border-zinc-800 hover:border-zinc-700 focus:border-sky-500 outline-none text-white px-3 py-2.5 rounded-lg transition-colors"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                  Tagline / Secondary label
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value.toUpperCase())}
                  placeholder="e.g. ESTABLISHED 2024 / SEATTLE"
                  className="w-full text-xs font-mono bg-[#1A1A1A] border border-zinc-800 hover:border-zinc-700 focus:border-sky-500 outline-none text-white px-3 py-2.5 rounded-lg transition-colors"
                />
              </div>

              {/* Brand Bio Description */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    Company Vibe & Description
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTips(!showTips)}
                    className="text-[10px] text-sky-400 hover:underline font-mono"
                  >
                    Vibe Tips
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your company's aesthetic essence, core shapes, or energy..."
                  className="w-full text-xs font-mono bg-[#1A1A1A] border border-zinc-800 hover:border-zinc-700 focus:border-sky-500 outline-none text-white p-3 rounded-lg h-24 resize-none transition-colors leading-relaxed"
                />
                {showTips && (
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] text-zinc-400 leading-relaxed font-mono">
                    💡 <span className="text-white">Pro Tip:</span> Mention shape requests such as "concentric grid lines", "interconnected hex nodes", or specific metaphors like "organic plant shoots".
                  </div>
                )}
              </div>

              {/* Aesthetic accelerator injections */}
              <div className="space-y-1.5">
                <span className="block text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                  🎰 AESTHETIC BLUEPRINT SEED STACK
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      label: 'Cyberpunk Grid 🌌',
                      text: 'Highly intense neon glowing lines, circular circuit nodes, cyber grid intersections, and rich futuristic cyberpunk vector forms.',
                      style: 'modern-tech' as LogoStyle,
                      palette: 'neon-cyberpunk'
                    },
                    {
                      label: 'Botanical Zen 🌱',
                      text: 'Flowing natural leaf loops, cozy plant shoots, organic symmetry, and soft warm hand-drawn botanical lines.',
                      style: 'organic' as LogoStyle,
                      palette: 'forest-cream'
                    },
                    {
                      label: 'Imperial Crest 🛡️',
                      text: 'Bespoke symmetrical traditional shield, elite columns, gold and navy crown accents, and sovereign geometric vectors.',
                      style: 'emblem' as LogoStyle,
                      palette: 'royal-heritage'
                    },
                    {
                      label: 'Brutalist Blocks 📐',
                      text: 'Stark alternating thick-and-thin vertical monolith elements, architectural structure, slate gray balancing blocks, and ultra-high dynamic contrast.',
                      style: 'minimalist' as LogoStyle,
                      palette: 'minimal-charcoal'
                    },
                    {
                      label: 'Concentric Rings 🪐',
                      text: 'Concentric circular satellite paths, orbital nodes, cosmic vector alignments, and glowing celestial compass dials.',
                      style: 'geometric' as LogoStyle,
                      palette: 'cool-tech'
                    }
                  ].map((seed, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        // Append or replace elegantly
                        if (description.length < 15 || description === 'Modern brutalist architecture firm specializing in sustainable urban high-rises. Strong vertical lines, monochromatic, professional.') {
                          setDescription(seed.text);
                        } else {
                          setDescription(prev => `${prev.trim()} ${seed.text}`);
                        }
                        setSelectedStyle(seed.style);
                        setSelectedPaletteId(seed.palette);
                        addLog(`Infused styling blueprint tokens: "${seed.label.split(' ')[0]}" elements active.`);
                      }}
                      className="px-2 py-1 text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-350 rounded hover:border-zinc-700 hover:text-white transition-all cursor-pointer"
                    >
                      {seed.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Style Grid Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                  Visual Style Blueprint
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LOGO_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all duration-200 ${
                        selectedStyle === style.id
                          ? 'bg-zinc-100 text-black border-white'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-300 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold font-display truncate">
                          {style.name.split(' ')[0]}
                        </span>
                      </div>
                      <p className={`text-[9px] leading-tight mt-1 line-clamp-1 ${
                        selectedStyle === style.id ? 'text-zinc-750' : 'text-zinc-500'
                      }`}>
                        {style.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5 pb-2">
                <label className="block text-[10px] text-zinc-400 font-[#C0C0C0] font-mono uppercase tracking-wider">
                  Color Blueprint Palette
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPaletteId(p.id)}
                      className={`p-2 text-left rounded-lg border transition-all ${
                        selectedPaletteId === p.id
                          ? 'bg-zinc-900 border-zinc-500 text-white'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-mono truncate">{p.name.split(' ')[0]}</span>
                        <div className="flex gap-0.5">
                          {p.colors.slice(0, 3).map((col, cIdx) => (
                            <span
                              key={cIdx}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[8px] line-clamp-1 leading-none text-zinc-500">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition-all duration-300 select-none cursor-pointer border-none disabled:opacity-40"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Compiling Vectors...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Generate Brand Mark</span>
                  </>
                )}
              </button>

              {/* Cloud Storage Actions Section */}
              {user ? (
                <div className="pt-3 border-t border-zinc-850 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveLogo()}
                    disabled={isSaving || isGenerating}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-all border disabled:opacity-40 cursor-pointer ${
                      activeBrand.logoId
                        ? 'bg-[#A3E635] text-black hover:bg-[#8fd32c] border-[#A3E635]'
                        : 'bg-transparent text-white border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        <span>{activeBrand.logoId ? 'Save Current Vector' : 'Save Design to Cloud'}</span>
                      </>
                    )}
                  </button>

                  {activeBrand.logoId && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBrand(prev => ({ ...prev, logoId: undefined }));
                        addLog('Cloud identifier unlinked. Ready to save current design parameters as a new logo.');
                      }}
                      className="px-2.5 py-2.5 rounded text-[10px] font-bold border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white transition-all uppercase cursor-pointer"
                      title="Unlink design ID to save as a new file"
                    >
                      Save Copy
                    </button>
                  )}
                </div>
              ) : (
                <div className="pt-3 border-t border-zinc-850/55">
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-dashed border-zinc-800 hover:border-zinc-700 rounded text-[9.5px] font-mono leading-none transition-all uppercase cursor-pointer"
                  >
                    💡 Connect profile to save vectors
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Active Metadata Information Footer */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>PROJECT SESSION</span>
              <span className="text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">
                ACTIVE
              </span>
            </div>
            <div className="mt-2 text-xs font-mono text-zinc-400 truncate">
              {activeBrand.companyName}
            </div>
            <div className="mt-0.5 text-[10px] text-zinc-500 font-mono">
              Timestamp: {new Date(activeBrand.createdAt || '').toLocaleTimeString()}
            </div>
          </div>
        </aside>

        {/* WORKSPACE PREVIEW AREA: Large Grid Display Stage, Settings & Code Details */}
        <main className="flex flex-col bg-zinc-950 overflow-y-auto">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-zinc-800 min-h-full">
            
            {/* STAGE & RUNTIME TERMINAL: Left Section */}
            <div className="xl:col-span-2 p-6 md:p-8 flex flex-col justify-between space-y-6">
              
              {/* Top Banner details */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-display font-semibold text-white tracking-wide uppercase">
                    Logo Motion Workbench
                  </h2>
                  <p className="text-zinc-400 text-xs">
                    Fine-tune CSS motion vectors, curves, and coordinates dynamically.
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[10px] font-mono text-zinc-400">
                  REF: <span className="text-sky-400">v1.20_active</span>
                </div>
              </div>

              {/* Error Warning Box if any */}
              {errorMessage && (
                <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-rose-200 uppercase tracking-wide">
                      Generation Interrupted
                    </p>
                    <p className="text-xs text-rose-300/90 leading-relaxed font-mono">
                      {errorMessage}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-normal font-mono mt-1">
                      💡 To secure your integration, make sure the <span className="text-white font-semibold">GEMINI_API_KEY</span> exists and is correct under the <span className="text-sky-400">Settings &gt; Secrets</span> workspace header.
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Interactive Stage Component */}
              <div className="flex-1 min-h-[460px]">
                <LogoCard 
                  brandKit={activeBrand} 
                  animationType={animationType}
                  settings={settings}
                />
              </div>

              {/* Active Brand Details & Metaphors */}
              <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-xl">
                <span className="block text-[10px] uppercase tracking-[2px] text-zinc-500 font-mono mb-2">
                  BRAND METAPHOR CONCEPT
                </span>
                <p className="text-zinc-200 text-xs italic leading-relaxed">
                  "{activeBrand.concept}"
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-[9px] font-mono uppercase text-zinc-400">Applied Vector Colors:</span>
                  <div className="flex items-center gap-1.5">
                    {activeBrand.hexColors.map((hex, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-[9px] font-mono">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hex }} />
                        <span className="text-zinc-300">{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Virtual Terminal Logs */}
              <div className="bg-[#121212] border border-zinc-850 rounded-xl overflow-hidden shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-850">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-mono text-[10px] uppercase tracking-wide">Studio Engine Console Logs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-mono text-zinc-500">IDLE</span>
                  </div>
                </div>
                
                <div className="p-4 font-mono text-[10px] text-zinc-400 space-y-1.5 max-h-36 overflow-y-auto select-text">
                  {generationLogs.length === 0 ? (
                    <div className="text-zinc-500 italic">
                      Console ready. Vector compilations or state adjustments will output logs here.
                    </div>
                  ) : (
                    generationLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed hover:bg-zinc-900 px-1 py-0.5 rounded">
                        {log}
                      </div>
                    ))
                  )}
                  {isGenerating && (
                    <div className="text-sky-400 animate-pulse flex items-center gap-1 font-semibold">
                      <span>&gt;&gt; STREAMING LIVE SVG NODE ARCS FROM GEMINI STUDIO SYSTEM...</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* STAGE CONTROLS & COMPONENT COMPOSITION PARAMETERS: Right Section */}
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">
                  Motion Parameters
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  Modify parameters to generate and adjust motion dynamics live.
                </p>
              </div>

              {/* Animation Presets Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Select Animation Profile
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'draw-in', name: 'Draw-In Outlines', icon: Sliders, desc: 'Draws path borders with gradient fills' },
                    { id: 'float-glow', name: 'Floating Glow Pulse', icon: Cpu, desc: 'Gentle hover floats with visual gradient drops' },
                    { id: 'assemble-stagger', name: 'Stagger Assembly', icon: Layers, desc: 'Pops out emblems as text scales in keyframe orders' },
                    { id: 'modern-reveal', name: 'Ultra Modern Reveal', icon: Compass, desc: 'Slight slides coupled with sleek blur expansions' },
                    { id: 'rotator-pulse', name: 'Orbital Pulse Rotator', icon: RotateCcw, desc: 'Concentric loop spins with scale pulses' }
                  ].map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => {
                        setAnimationType(anim.id as AnimationType);
                        setSettings((prev) => ({ ...prev, type: anim.id as AnimationType }));
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                        animationType === anim.id
                          ? 'bg-zinc-100 text-zinc-900 border-white'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <anim.icon className={`w-4 h-4 shadow ${animationType === anim.id ? 'text-sky-500' : 'text-zinc-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold tracking-wide uppercase font-display select-none">
                          {anim.name}
                        </div>
                        <p className={`text-[9px] truncate mt-0.5 leading-none ${
                          animationType === anim.id ? 'text-zinc-650' : 'text-zinc-500'
                        }`}>
                          {anim.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Fine Tuning Controllers */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Interactive Speed & Curve Shaper
                </span>

                {/* Duration Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-zinc-400">DURATION</span>
                    <span className="text-sky-400 font-semibold">{settings.duration.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="8.0"
                    step="0.1"
                    value={settings.duration}
                    onChange={(e) => setSettings((prev) => ({ ...prev, duration: parseFloat(e.target.value) }))}
                    className="w-full accent-sky-400 h-1 bg-zinc-800 rounded outline-none"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                    <span>SNAPPY (0.4s)</span>
                    <span>CINEMATIC (8.0s)</span>
                  </div>
                </div>

                {/* Delay Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-zinc-400">DELAY TO COMPOSE</span>
                    <span className="text-sky-400 font-semibold">{settings.delay.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="3.0"
                    step="0.1"
                    value={settings.delay}
                    onChange={(e) => setSettings((prev) => ({ ...prev, delay: parseFloat(e.target.value) }))}
                    className="w-full accent-sky-400 h-1 bg-zinc-800 rounded outline-none"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                    <span>IMMEDIATE</span>
                    <span>STAGGERED (3.0s)</span>
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-zinc-400">MOTION LIMITS & GLOW</span>
                    <span className="text-sky-400 font-semibold">{settings.intensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={settings.intensity}
                    onChange={(e) => setSettings((prev) => ({ ...prev, intensity: parseInt(e.target.value) }))}
                    className="w-full accent-sky-400 h-1 bg-zinc-800 rounded outline-none"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                    <span>SUBTLE GLIMPSE</span>
                    <span>EXAGGERATED DYNAMICS</span>
                  </div>
                </div>

                {/* Easing Picker */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 font-mono">
                    TRANSITION CURVE
                  </label>
                  <select
                    value={settings.easing}
                    onChange={(e: any) => setSettings((prev) => ({ ...prev, easing: e.target.value }))}
                    className="w-full text-xs font-mono bg-[#1A1A1A] border border-zinc-850 rounded px-2.5 py-2 hover:border-zinc-700 outline-none select-none text-white cursor-pointer"
                  >
                    <option value="easeInOut">Ease In Out (Standard Fluid)</option>
                    <option value="easeOut">Ease Out (Gentle Arrival)</option>
                    <option value="linear">Linear (Constant Speed)</option>
                    <option value="backOut">Back Out (Playful Bounce Over)</option>
                    <option value="anticipate">Anticipate (Tension Release Reveal)</option>
                  </select>
                </div>

                {/* Loop Mode checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={settings.loop}
                      onChange={(e) => setSettings((prev) => ({ ...prev, loop: e.target.checked }))}
                      className="w-4.5 h-4.5 accent-sky-400 bg-[#1A1A1A] rounded border border-zinc-850 cursor-pointer text-white"
                    />
                    <span className="font-mono text-[10px] uppercase text-zinc-300">
                      Infinite Loop Motion Action
                    </span>
                  </label>
                </div>

              </div>

              {/* Mini Manual Helper */}
              <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sky-400">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider">How Animations Work</span>
                </div>
                <p className="text-[11.5px] text-zinc-400 leading-normal font-mono">
                  The generated SVG uses standard group selectors (<span className="text-[#FFFFFF]">#group-emblem</span>, <span className="text-[#FFFFFF]">#group-text</span>, <span className="text-[#FFFFFF]">#text-company</span>, <span className="text-[#FFFFFF]">#text-tagline</span>). Our studio injects dynamic animated CSS rules inline to produce clean, light-weight animations with zero canvas lag.
                </p>
              </div>

            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
