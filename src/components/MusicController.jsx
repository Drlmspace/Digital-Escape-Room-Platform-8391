import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

const MusicController = ({ isAdmin = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Music className="w-5 h-5 text-purple-400" />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white">Background Music</div>
            <div className="text-xs text-gray-400">Production Mode</div>
          </div>
          <button
            onClick={togglePlay}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            aria-label="Volume control"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default MusicController;