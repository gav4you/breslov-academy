/* eslint-disable react/no-unknown-property */
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Stars, Text, useVideoTexture } from '@react-three/drei';
import { tokens, cx } from '@/components/theme/tokens';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { BookOpen, Loader2, Mic, MicOff, MonitorPlay, Share2, Users, X } from 'lucide-react';

function Book({ position }) {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useFrame((state, delta) => {
    mesh.current.rotation.y += delta * 0.2;
    if (hovered) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh
      position={position}
      ref={mesh}
      scale={active ? 1.2 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[0.6, 0.8, 0.1]} />
      <meshStandardMaterial color={hovered ? '#fbbf24' : '#8b5cf6'} />
    </mesh>
  );
}

function Avatar({ position, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function UserAvatar({ positionRef, color }) {
  const mesh = useRef();

  useFrame(() => {
    if (!mesh.current || !positionRef?.current) return;
    const [x, y, z] = positionRef.current;
    mesh.current.position.set(x, y, z);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function PlayerController({ positionRef, keysRef }) {
  useFrame((_, delta) => {
    if (!positionRef?.current || !keysRef?.current) return;
    const speed = 2.4;
    const pos = positionRef.current;
    const keys = keysRef.current;

    if (keys.has('w') || keys.has('arrowup')) pos[2] -= speed * delta;
    if (keys.has('s') || keys.has('arrowdown')) pos[2] += speed * delta;
    if (keys.has('a') || keys.has('arrowleft')) pos[0] -= speed * delta;
    if (keys.has('d') || keys.has('arrowright')) pos[0] += speed * delta;

    pos[0] = Math.max(-8, Math.min(8, pos[0]));
    pos[2] = Math.max(-8, Math.min(8, pos[2]));
  });

  return null;
}

function StudyTable({ position }) {
  return (
    <group position={position}>
      {/* Table Top */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Legs */}
      <mesh position={[-1.4, 0.25, 0.9]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      <mesh position={[1.4, 0.25, 0.9]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      <mesh position={[-1.4, 0.25, -0.9]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      <mesh position={[1.4, 0.25, -0.9]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      
      {/* Books */}
      <Book position={[0, 0.8, 0]} />
      <Book position={[-0.8, 0.8, 0.5]} />
      <Book position={[0.8, 0.8, -0.5]} />
    </group>
  );
}

function ActiveScreen({ position, mediaUrl }) {
  const texture = useVideoTexture(mediaUrl, {
    loop: true,
    autoplay: true,
    muted: true,
    crossOrigin: 'anonymous',
  });

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <mesh>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function PlaceholderScreen({ position }) {
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <mesh>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Live Shiur
      </Text>
    </group>
  );
}

function Room({ mediaUrl, playerPositionRef, playerKeysRef }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Grid Helper */}
      <gridHelper args={[50, 50, '#334155', '#334155']} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Furniture */}
      <StudyTable position={[0, 0, 0]} />
      <StudyTable position={[-5, 0, 0]} />
      <StudyTable position={[5, 0, 0]} />
      
      {/* Screen */}
      {mediaUrl ? (
        <ActiveScreen position={[0, 3, 8]} mediaUrl={mediaUrl} />
      ) : (
        <PlaceholderScreen position={[0, 3, 8]} />
      )}

      {/* Avatars */}
      <Avatar position={[0, 1, 2]} color="#ef4444" />
      <Avatar position={[-5, 1, 2]} color="#3b82f6" />
      <Avatar position={[5, 1, 2]} color="#10b981" />
      <UserAvatar positionRef={playerPositionRef} color="#f59e0b" />
      <PlayerController positionRef={playerPositionRef} keysRef={playerKeysRef} />
      
      {/* Floating Text */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text 
          position={[0, 5, -5]} 
          fontSize={1} 
          color="#fcd34d"
          anchorX="center" 
          anchorY="middle"
        >
          Virtual Beit Midrash
        </Text>
      </Float>
    </group>
  );
}

export default function VirtualBeitMidrash() {
  const [mediaInput, setMediaInput] = useState('');
  const [sharedMediaUrl, setSharedMediaUrl] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const audioStreamRef = useRef(null);
  const playerPositionRef = useRef([0, 1, 2]);
  const playerKeysRef = useRef(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem('virtual_media_url');
      if (stored) {
        setSharedMediaUrl(stored);
        setMediaInput(stored);
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = String(event.key || '').toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        playerKeysRef.current.add(key);
      }
    };
    const onKeyUp = (event) => {
      const key = String(event.key || '').toLowerCase();
      playerKeysRef.current.delete(key);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleShareMedia = () => {
    const next = mediaInput.trim();
    if (!next) {
      toast.error('Paste a video URL to share.');
      return;
    }
    setSharedMediaUrl(next);
    try {
      localStorage.setItem('virtual_media_url', next);
    } catch {
      // ignore storage issues
    }
  };

  const handleClearMedia = () => {
    setSharedMediaUrl('');
    setMediaInput('');
    try {
      localStorage.removeItem('virtual_media_url');
    } catch {
      // ignore storage issues
    }
  };

  const toggleVoice = async () => {
    if (voiceEnabled) {
      const stream = audioStreamRef.current;
      stream?.getTracks?.().forEach((track) => track.stop());
      audioStreamRef.current = null;
      setVoiceEnabled(false);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      toast.error('Microphone not available.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setVoiceEnabled(true);
    } catch (error) {
      toast.error('Microphone permission denied.');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative bg-slate-950">
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className={cx(tokens.glass.card, "p-4 bg-slate-900/80 text-white w-64")}>
          <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Study Hall
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            Join others in real-time study. Click books to open them.
          </p>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            3 Active Students
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 space-y-3">
        <div className={cx(tokens.glass.card, "p-4 bg-slate-900/80 text-white w-72")}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-slate-400">Shared Media</p>
            {sharedMediaUrl && (
              <button
                type="button"
                className="text-slate-400 hover:text-slate-200"
                onClick={handleClearMedia}
                title="Clear media"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Input
            value={mediaInput}
            onChange={(event) => setMediaInput(event.target.value)}
            placeholder="Paste lesson video URL"
            className="h-9 text-xs bg-slate-800 border-slate-700 text-slate-200"
          />
          <Button
            size="sm"
            className="mt-3 w-full bg-amber-500/90 text-slate-950 hover:bg-amber-500"
            onClick={handleShareMedia}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share to screen
          </Button>
          {sharedMediaUrl && (
            <p className="mt-2 text-[11px] text-slate-400">Now playing shared media.</p>
          )}
        </div>

        <div className={cx(tokens.glass.card, "p-3 bg-slate-900/70 text-slate-200")}>
          <p className="text-[11px] text-slate-400">Move with WASD or arrow keys.</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
        <Button
          className={cx(
            "rounded-full h-12 w-12 p-0",
            voiceEnabled ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" : "bg-slate-800 hover:bg-slate-700"
          )}
          onClick={toggleVoice}
          title={voiceEnabled ? 'Mute microphone' : 'Enable microphone'}
        >
          {voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>
        <Button className="rounded-full h-12 w-12 p-0 bg-slate-800 hover:bg-slate-700" title="Focus shared screen">
          <MonitorPlay className="w-5 h-5" />
        </Button>
        <Button className="rounded-full h-12 w-12 p-0 bg-slate-800 hover:bg-slate-700" title="View participants">
          <Users className="w-5 h-5" />
        </Button>
      </div>

      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <Room
            mediaUrl={sharedMediaUrl}
            playerPositionRef={playerPositionRef}
            playerKeysRef={playerKeysRef}
          />
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.1}
            maxDistance={20}
            minDistance={5}
          />
        </Suspense>
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="text-white text-sm font-medium">Loading 3D Environment...</p>
          </div>
        }>
          {/* Canvas loads here */}
        </Suspense>
      </div>
    </div>
  );
}
