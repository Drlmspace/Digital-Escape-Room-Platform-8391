import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Music, Plus, X, Upload, Link } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

const MusicController = ({ isAdmin = false }) => {
  const { announceToScreenReader } = useAccessibility();
  const audioRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  
  // State for adding multiple tracks
  const [musicTracks, setMusicTracks] = useState([
    { title: '', url: '' },
    { title: '', url: '' },
    { title: '', url: '' },
    { title: '', url: '' },
    { title: '', url: '' }
  ]);

  const [playlist, setPlaylist] = useState([
    {
      id: 1,
      title: "Cyber Mystery Theme",
      url: "https://www.soundjay.com/misc/sounds/magic_chime_02.mp3",
      category: "theme"
    },
    {
      id: 2,
      title: "Digital Investigation",
      url: "https://www.soundjay.com/misc/sounds/magic_chime_01.mp3",
      category: "ambient"
    },
    {
      id: 3,
      title: "Puzzle Solving Focus",
      url: "https://www.soundjay.com/misc/sounds/bell_tree_02.mp3",
      category: "focus"
    }
  ]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      audioRef.current.src = playlist[currentTrack]?.url || '';
      audioRef.current.load();
    }
  }, [currentTrack, playlist]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        announceToScreenReader('Music paused');
      } else {
        audioRef.current.play().catch(console.error);
        announceToScreenReader(`Playing ${playlist[currentTrack]?.title || 'music'}`);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    announceToScreenReader(isMuted ? 'Music unmuted' : 'Music muted');
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const nextTrack = () => {
    if (playlist.length > 0) {
      const next = (currentTrack + 1) % playlist.length;
      setCurrentTrack(next);
      announceToScreenReader(`Switching to ${playlist[next]?.title || 'next track'}`);
    }
  };

  const previousTrack = () => {
    if (playlist.length > 0) {
      const prev = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
      setCurrentTrack(prev);
      announceToScreenReader(`Switching to ${playlist[prev]?.title || 'previous track'}`);
    }
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    setShowPlaylist(false);
    announceToScreenReader(`Selected ${playlist[index]?.title || 'track'}`);
  };

  const removeTrack = (index) => {
    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);
    
    if (currentTrack >= index && currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
    }
    
    announceToScreenReader('Track removed from playlist');
  };

  const addSingleTrack = (title, url) => {
    if (url.trim() && title.trim()) {
      const newTrack = {
        id: Date.now(),
        title: title.trim(),
        url: url.trim(),
        category: "custom"
      };
      
      setPlaylist(prev => [...prev, newTrack]);
      announceToScreenReader(`Added ${title} to playlist`);
      return true;
    }
    return false;
  };

  const handleTrackChange = (index, field, value) => {
    setMusicTracks(prev => prev.map((track, i) => 
      i === index ? { ...track, [field]: value } : track
    ));
  };

  const addMultipleTracks = () => {
    let addedCount = 0;
    const validTracks = musicTracks.filter(track => 
      track.title.trim() && track.url.trim() && isValidUrl(track.url.trim())
    );

    validTracks.forEach(track => {
      if (addSingleTrack(track.title, track.url)) {
        addedCount++;
      }
    });

    // Reset form
    setMusicTracks([
      { title: '', url: '' },
      { title: '', url: '' },
      { title: '', url: '' },
      { title: '', url: '' },
      { title: '', url: '' }
    ]);

    setShowBulkAdd(false);
    announceToScreenReader(`Added ${addedCount} tracks to playlist`);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return string.startsWith('http://') || string.startsWith('https://');
    } catch (_) {
      return false;
    }
  };

  const clearAllCustomTracks = () => {
    const filteredPlaylist = playlist.filter(track => track.category !== 'custom');
    setPlaylist(filteredPlaylist);
    
    if (currentTrack >= filteredPlaylist.length) {
      setCurrentTrack(0);
    }
    
    announceToScreenReader('All custom tracks removed');
  };

  const getValidTracksCount = () => {
    return musicTracks.filter(track => 
      track.title.trim() && track.url.trim() && isValidUrl(track.url.trim())
    ).length;
  };

  const handleAudioEnd = () => {
    nextTrack();
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        preload="metadata"
      />

      {/* Main Music Controller */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-lg"
      >
        <div className="flex items-center gap-3">
          {/* Music Icon */}
          <Music className="w-5 h-5 text-purple-400" />
          
          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white truncate">
              {playlist[currentTrack]?.title || 'No music'}
            </div>
            <div className="text-xs text-gray-400">
              {playlist.length} tracks
            </div>
          </div>

          {/* Previous Track */}
          <button
            onClick={previousTrack}
            disabled={playlist.length === 0}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={playlist.length === 0}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            disabled={playlist.length === 0}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              aria-label="Volume control"
            />
          </div>

          {/* Playlist Toggle */}
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="Toggle playlist"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Add Music (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => setShowBulkAdd(!showBulkAdd)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="Add multiple music tracks"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Playlist Modal */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-full right-0 mb-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-lg min-w-[300px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Playlist</h3>
              <div className="flex items-center gap-2">
                {isAdmin && playlist.some(track => track.category === 'custom') && (
                  <button
                    onClick={clearAllCustomTracks}
                    className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors rounded"
                    aria-label="Clear all custom tracks"
                  >
                    Clear Custom
                  </button>
                )}
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors rounded"
                  aria-label="Close playlist"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                    currentTrack === index
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => selectTrack(index)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{track.title}</div>
                    <div className="text-xs text-gray-400 capitalize flex items-center gap-2">
                      {track.category}
                      {track.category === 'custom' && (
                        <span className="px-1 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isAdmin && track.category === 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(index);
                      }}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors rounded"
                      aria-label={`Remove ${track.title}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Add Music Modal (Admin Only) */}
      <AnimatePresence>
        {showBulkAdd && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-full right-0 mb-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-lg min-w-[400px] max-w-[500px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Add Up To 5 Music Tracks
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Add multiple music tracks from any public URL
                </p>
              </div>
              <button
                onClick={() => setShowBulkAdd(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors rounded"
                aria-label="Close add music"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {musicTracks.map((track, index) => (
                <div key={index} className="space-y-2 p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-purple-300">Track {index + 1}</span>
                    {track.title && track.url && isValidUrl(track.url) && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">
                        ✓ Ready
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor={`title-${index}`} className="block text-xs text-gray-400 mb-1">
                      Song Title
                    </label>
                    <input
                      id={`title-${index}`}
                      type="text"
                      value={track.title}
                      onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                      placeholder="Enter song name"
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`url-${index}`} className="block text-xs text-gray-400 mb-1">
                      Music URL
                    </label>
                    <input
                      id={`url-${index}`}
                      type="url"
                      value={track.url}
                      onChange={(e) => handleTrackChange(index, 'url', e.target.value)}
                      placeholder="https://example.com/music.mp3"
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                    {track.url && !isValidUrl(track.url) && (
                      <p className="text-xs text-red-400 mt-1">Please enter a valid URL</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="text-xs text-gray-400 bg-slate-600/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="w-4 h-4" />
                  <span className="font-medium">Supported Formats & URLs:</span>
                </div>
                <ul className="space-y-1 text-xs">
                  <li>• MP3, WAV, OGG audio formats</li>
                  <li>• Must be publicly accessible URLs</li>
                  <li>• Examples: SoundCloud, Google Drive (public), your website</li>
                  <li>• Valid tracks: <span className="text-green-300">{getValidTracksCount()}/5</span></li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkAdd(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={addMultipleTracks}
                  disabled={getValidTracksCount() === 0}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  Add {getValidTracksCount()} Tracks
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MusicController;