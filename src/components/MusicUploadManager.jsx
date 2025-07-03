import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music, Play, Pause, Volume2, VolumeX, Trash2, Download, Plus, X, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

const MusicUploadManager = ({ isVisible, onClose }) => {
  const { announceToScreenReader } = useAccessibility();
  const [musicTracks, setMusicTracks] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const audioRefs = useRef({});

  // Load saved music tracks from localStorage on mount
  useEffect(() => {
    try {
      const savedTracks = localStorage.getItem('adminMusicTracks');
      if (savedTracks) {
        const parsed = JSON.parse(savedTracks);
        setMusicTracks(parsed);
        announceToScreenReader(`Loaded ${parsed.length} music tracks from storage`);
      }
    } catch (error) {
      console.error('Failed to load music tracks:', error);
    }
  }, [announceToScreenReader]);

  // Save tracks to localStorage whenever tracks change
  useEffect(() => {
    try {
      localStorage.setItem('adminMusicTracks', JSON.stringify(musicTracks));
    } catch (error) {
      console.error('Failed to save music tracks:', error);
    }
  }, [musicTracks]);

  const handleFileSelect = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/')) {
        uploadTrack(file);
      } else {
        announceToScreenReader(`${file.name} is not a valid audio file`);
      }
    });
  };

  const uploadTrack = (file) => {
    const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [trackId]: 0 }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const audioUrl = e.target.result;
      
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Add track to collection
          const newTrack = {
            id: trackId,
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            originalName: file.name,
            url: audioUrl,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            duration: null // Will be set when audio loads
          };
          
          setMusicTracks(prev => [...prev, newTrack]);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[trackId];
            return newProgress;
          });
          
          announceToScreenReader(`Successfully uploaded ${file.name}`);
        } else {
          setUploadProgress(prev => ({ ...prev, [trackId]: Math.floor(progress) }));
        }
      }, 100);
    };
    
    reader.onerror = () => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[trackId];
        return newProgress;
      });
      announceToScreenReader(`Failed to upload ${file.name}`);
    };
    
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const playTrack = (trackId) => {
    // Stop currently playing track
    if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying].pause();
      audioRefs.current[currentlyPlaying].currentTime = 0;
    }

    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
      announceToScreenReader('Music stopped');
    } else {
      if (audioRefs.current[trackId]) {
        audioRefs.current[trackId].volume = isMuted ? 0 : volume;
        audioRefs.current[trackId].play();
        setCurrentlyPlaying(trackId);
        
        const track = musicTracks.find(t => t.id === trackId);
        announceToScreenReader(`Now playing: ${track?.name}`);
      }
    }
  };

  const deleteTrack = (trackId) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    }
    
    setMusicTracks(prev => prev.filter(track => track.id !== trackId));
    
    const track = musicTracks.find(t => t.id === trackId);
    announceToScreenReader(`Deleted ${track?.name}`);
  };

  const updateVolume = (newVolume) => {
    setVolume(newVolume);
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = isMuted ? 0 : newVolume;
      }
    });
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = newMuted ? 0 : volume;
      }
    });
    announceToScreenReader(`Audio ${newMuted ? 'muted' : 'unmuted'}`);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearAllTracks = () => {
    if (confirm('Are you sure you want to delete all music tracks? This cannot be undone.')) {
      setMusicTracks([]);
      setCurrentlyPlaying(null);
      announceToScreenReader('All music tracks deleted');
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="music-manager-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-purple-400" />
                <div>
                  <h2 id="music-manager-title" className="text-2xl font-bold text-white">
                    Music Upload Manager
                  </h2>
                  <p className="text-gray-400">
                    Upload and manage background music for escape room experiences
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {musicTracks.length > 0 && (
                  <button
                    onClick={clearAllTracks}
                    className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
                    aria-label="Delete all music tracks"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Close music manager"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6">
              {/* Upload Area */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Upload Music Files</h3>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragOver
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Drop music files here or click to browse
                  </h4>
                  <p className="text-gray-400 mb-4">
                    Supports MP3, WAV, OGG, M4A, FLAC, and other audio formats
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Select Files
                  </button>
                </div>

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(uploadProgress).map(([trackId, progress]) => (
                      <div key={trackId} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                          <span>Uploading...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Global Controls */}
              {musicTracks.length > 0 && (
                <div className="mb-6 bg-slate-700/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Global Audio Controls</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleMute}
                      className="p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                      aria-label={isMuted ? 'Unmute all audio' : 'Mute all audio'}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 max-w-xs">
                      <label htmlFor="master-volume" className="block text-sm text-gray-300 mb-1">
                        Master Volume
                      </label>
                      <input
                        id="master-volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => updateVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                        aria-label="Master volume control"
                      />
                    </div>
                    <span className="text-sm text-gray-400 min-w-[3rem]">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Music Library */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Music Library ({musicTracks.length} tracks)
                  </h3>
                </div>

                {musicTracks.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-300 mb-2">No music uploaded yet</h4>
                    <p className="text-gray-400">
                      Upload your first music track to get started with background audio
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {musicTracks.map((track) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-700/50 rounded-xl p-4 border border-slate-600"
                      >
                        <div className="flex items-center gap-4">
                          {/* Play/Pause Button */}
                          <button
                            onClick={() => playTrack(track.id)}
                            className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              currentlyPlaying === track.id
                                ? 'bg-purple-500 text-white'
                                : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                            }`}
                            aria-label={`${currentlyPlaying === track.id ? 'Pause' : 'Play'} ${track.name}`}
                          >
                            {currentlyPlaying === track.id ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </button>

                          {/* Track Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-white truncate">
                                {track.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                {currentlyPlaying === track.id && (
                                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                                    Playing
                                  </span>
                                )}
                                <button
                                  onClick={() => deleteTrack(track.id)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                  aria-label={`Delete ${track.name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{track.type}</span>
                              <span>•</span>
                              <span>{formatFileSize(track.size)}</span>
                              <span>•</span>
                              <span>{formatDuration(track.duration)}</span>
                              <span>•</span>
                              <span>
                                Uploaded: {new Date(track.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Hidden Audio Element */}
                        <audio
                          ref={(el) => {
                            if (el) audioRefs.current[track.id] = el;
                          }}
                          preload="metadata"
                          onLoadedMetadata={(e) => {
                            const duration = e.target.duration;
                            setMusicTracks(prev =>
                              prev.map(t =>
                                t.id === track.id ? { ...t, duration } : t
                              )
                            );
                          }}
                          onEnded={() => {
                            setCurrentlyPlaying(null);
                            announceToScreenReader(`Finished playing ${track.name}`);
                          }}
                        >
                          <source src={track.url} type={track.type} />
                        </audio>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Usage Guidelines */}
              <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h4 className="font-semibold text-blue-300 mb-3">🎵 Music Guidelines</h4>
                <ul className="text-blue-200 text-sm space-y-2">
                  <li>• <strong>Supported Formats:</strong> MP3, WAV, OGG, M4A, FLAC, and other browser-compatible audio</li>
                  <li>• <strong>Recommended:</strong> Use ambient, non-intrusive background music that enhances the experience</li>
                  <li>• <strong>File Size:</strong> Keep files under 10MB for optimal loading performance</li>
                  <li>• <strong>Copyright:</strong> Ensure you have rights to use all uploaded music</li>
                  <li>• <strong>Volume:</strong> Music will play at moderate levels to not interfere with game audio</li>
                  <li>• <strong>Storage:</strong> Music files are stored locally in your browser</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicUploadManager;