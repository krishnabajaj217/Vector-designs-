import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RefreshCw, Sun, Moon, Grid, Download, Code, Sparkles, Check, Copy } from 'lucide-react';
import { BrandKit, AnimationType, AnimationSettings } from '../types';

interface LogoCardProps {
  brandKit: BrandKit;
  animationType: AnimationType;
  settings: AnimationSettings;
}

export function LogoCard({ brandKit, animationType, settings }: LogoCardProps) {
  const [backgroundMode, setBackgroundMode] = useState<'dark' | 'light' | 'grid'>('dark');
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Restart animation when settings, type, or restart trigger changes
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [animationType, settings, isPlaying]);

  const primaryColor = brandKit.hexColors[0] || '#38bdf8';

  // Compile CSS Style dynamic injector
  const compileLogoCSS = (
    type: AnimationType,
    opts: AnimationSettings,
    glowColor: string
  ): string => {
    if (!isPlaying) {
      return `
        #group-emblem, #group-text, #text-company, #text-tagline {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
      `;
    }

    const duration = opts.duration;
    const delay = opts.delay;
    const loopType = opts.loop ? 'infinite' : 'forwards';

    let easeFunc = 'ease-out';
    if (opts.easing === 'easeInOut') easeFunc = 'cubic-bezier(0.4, 0, 0.2, 1)';
    if (opts.easing === 'backOut') easeFunc = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    if (opts.easing === 'anticipate') easeFunc = 'cubic-bezier(0.76, 0, 0.24, 1)';

    switch (type) {
      case 'draw-in':
        return `
          @keyframes draw {
            from {
              stroke-dasharray: 800;
              stroke-dashoffset: 800;
              fill-opacity: 0;
            }
            50% {
              stroke-dashoffset: 0;
              fill-opacity: 0;
            }
            to {
              stroke-dashoffset: 0;
              fill-opacity: 1;
            }
          }
          @keyframes textReveal {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          /* Apply stroke skeleton defaults for draw */
          #group-emblem path, #group-emblem circle, #group-emblem rect, #group-emblem polygon, #group-emblem ellipse {
            stroke-dasharray: 800;
            stroke-dashoffset: 800;
            animation: draw ${duration}s ${easeFunc} ${delay}s ${loopType};
          }
          #group-text {
            animation: textReveal ${duration * 0.6}s ${easeFunc} ${delay + duration * 0.45}s both;
          }
        `;
      case 'float-glow':
        return `
          @keyframes float {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-${4 + (opts.intensity * 0.16)}px);
            }
            100% {
              transform: translateY(0px);
            }
          }
          @keyframes pulseGlow {
            0%, 100% {
              filter: drop-shadow(0 0 3px ${glowColor}50);
            }
            50% {
              filter: drop-shadow(0 0 ${10 + opts.intensity * 0.2}px ${glowColor});
            }
          }
          #group-emblem {
            transform-origin: 250px 200px;
            animation: float ${duration}s ease-in-out ${delay}s infinite, pulseGlow ${duration * 1.2}s ease-in-out infinite;
          }
          #group-text {
            animation: float ${duration}s ease-in-out ${delay + 0.25}s infinite;
          }
        `;
      case 'assemble-stagger':
        return `
          @keyframes scalePop {
            0% {
              opacity: 0;
              transform: scale(0.3) rotate(-12deg);
            }
            70% {
              opacity: 1;
              transform: scale(1.15) rotate(3deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }
          @keyframes compReveal {
            from {
              opacity: 0;
              transform: translateY(22px) scale(0.92);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes tagReveal {
            from {
              opacity: 0;
              transform: scale(0.96);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          #group-emblem {
            transform-origin: 250px 200px;
            animation: scalePop ${duration}s ${easeFunc} ${delay}s both;
          }
          #text-company {
            transform-origin: 250px 410px;
            animation: compReveal ${duration * 0.85}s ${easeFunc} ${delay + duration * 0.35}s both;
          }
          #text-tagline {
            transform-origin: 250px 445px;
            animation: tagReveal ${duration * 0.75}s ${easeFunc} ${delay + duration * 0.65}s both;
          }
        `;
      case 'modern-reveal':
        return `
          @keyframes slideUpEmblem {
            from {
              opacity: 0;
              transform: translateY(15px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes blurReveal {
            from {
              opacity: 0;
              letter-spacing: -3px;
              filter: blur(6px);
            }
            to {
              opacity: 1;
              letter-spacing: normal;
              filter: blur(0);
            }
          }
          #group-emblem {
            transform-origin: 250px 200px;
            animation: slideUpEmblem ${duration}s ${easeFunc} ${delay}s both;
          }
          #group-text {
            transform-origin: 250px 420px;
            animation: blurReveal ${duration * 1.3}s ${easeFunc} ${delay + duration * 0.2}s both;
          }
        `;
      case 'rotator-pulse':
        return `
          @keyframes cyclicSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes sizePulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(${1 + opts.intensity * 0.0016});
            }
          }
          #group-emblem {
            transform-origin: 250px 200px;
            animation: cyclicSpin ${duration * 6.5}s linear infinite, sizePulse ${duration}s ease-in-out infinite;
          }
          #group-text {
            transform-origin: 250px 410px;
            animation: sizePulse ${duration}s ease-in-out ${delay}s infinite;
          }
        `;
      default:
        return '';
    }
  };

  const activeStyles = compileLogoCSS(animationType, settings, primaryColor);

  // Trigger SVG Download
  const handleDownloadSVG = () => {
    let sanitizedSvg = brandKit.logoSvg;
    
    // Check if SVG has standard styling block injected, or define it so it retains native animated rules
    const styleTag = `<style>${activeStyles}</style>`;
    if (sanitizedSvg.includes('</defs>')) {
      sanitizedSvg = sanitizedSvg.replace('</defs>', `${styleTag}</defs>`);
    } else if (sanitizedSvg.includes('<g id=')) {
      const match = sanitizedSvg.slice(0, sanitizedSvg.indexOf('<g id='));
      const rest = sanitizedSvg.slice(sanitizedSvg.indexOf('<g id='));
      sanitizedSvg = `${match}${styleTag}${rest}`;
    }

    const blob = new Blob([sanitizedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${brandKit.companyName.toLowerCase().replace(/\s+/g, '-')}-animated-logo.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  // Generate clean code embed snippet
  const embedCode = `import React from 'react';
import { motion } from 'framer-motion';

export default function BrandLogo() {
  return (
    <div className="relative w-72 h-72 flex items-center justify-center">
      {/* Complete Responsive Vector Logo */}
      <svg 
        viewBox="0 0 500 500" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{\`
          ${activeStyles.replace(/\s+/g, ' ')}
        \`}</style>
        
        {/* Rendered SVG Path Nodes */}
        {/* Insert SVG elements here */}
      </svg>
    </div>
  );
}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top controls and Stage Selector */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-display font-semibold text-zinc-100 text-sm tracking-wide">
            Interactive Presentation Stage
          </h3>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-800/40 p-1 rounded-lg border border-zinc-700/50">
          <button
            onClick={() => setBackgroundMode('dark')}
            className={`p-1.5 rounded-md text-xs transition-colors duration-200 ${
              backgroundMode === 'dark' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Dark Presentation"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBackgroundMode('light')}
            className={`p-1.5 rounded-md text-xs transition-colors duration-200 ${
              backgroundMode === 'light' ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Light Presentation"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setBackgroundMode('grid')}
            className={`p-1.5 rounded-md text-xs transition-colors duration-200 ${
              backgroundMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Transparent Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Vector Stage Container */}
      <div className="relative flex-1 flex items-center justify-center p-8 min-h-[350px]">
        {/* Dynamic Canvas Background wrapper */}
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            backgroundMode === 'dark'
              ? 'bg-zinc-950'
              : backgroundMode === 'light'
              ? 'bg-zinc-50'
              : 'bg-zinc-900/90'
          }`}
          style={
            backgroundMode === 'grid'
              ? {
                  backgroundImage:
                    'radial-gradient(#ffffff0a 1px, transparent 1px), radial-gradient(#ffffff0a 1px, #1c1917 1px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }
              : {}
          }
        />

        {/* Injected style element restarting on key update */}
        <style key={animationKey}>{activeStyles}</style>

        {/* Real-time SVG logo wrapper */}
        <div
          ref={containerRef}
          className="relative max-w-[320px] max-h-[320px] w-full aspect-square z-10 transition-transform duration-300 hover:scale-105"
          dangerouslySetInnerHTML={{ __html: brandKit.logoSvg }}
        />

        {/* Animation feedback banner */}
        <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 shadow-lg select-none">
          <p className="font-mono text-[10px] text-zinc-400">
            ACTIVE PROFILE:{' '}
            <span className="text-sky-400 font-semibold uppercase">
              {animationType.replace('-', ' ')}
            </span>
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/40 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs border border-zinc-700/60 transition-all duration-200 ${
              isPlaying
                ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                : 'bg-sky-500/10 text-sky-400 border-sky-400/30 hover:bg-sky-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Motion</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Motion</span>
              </>
            )}
          </button>

          <button
            onClick={() => setAnimationKey((prev) => prev + 1)}
            disabled={!isPlaying}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-200"
            title="Replay Vector Entry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Code */}
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs border transition-all duration-200 ${
              showEmbed
                ? 'bg-zinc-100 text-zinc-900 border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showEmbed ? 'Hide Embed' : 'Get Code'}</span>
          </button>

          {/* Download Vector */}
          <button
            onClick={handleDownloadSVG}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-medium text-xs rounded-lg transition-all duration-200 shadow-md shadow-sky-500/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>

      {/* Code Embed drawer overlay */}
      {showEmbed && (
        <div className="border-t border-zinc-800 bg-zinc-950/80 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h4 className="font-display font-medium text-zinc-200 text-xs tracking-wider">
                REACT MOTION COMPONENT IMPLEMENTATION
              </h4>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-300 transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <p className="text-zinc-400 text-xs mb-4">
            Copy the following code into your React + framer-motion setups. Simply paste the generated shape nodes:
          </p>
          <div className="relative">
            <pre className="p-4 bg-zinc-900 border border-zinc-850 rounded-lg text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-[180px] leading-relaxed">
              <code>{embedCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
