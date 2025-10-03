// Keyboard sound utility using Web Audio API
let audioContext = null;

// Initialize audio context (lazy initialization)
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Play keyboard typing sound
export const playKeySound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create oscillator for the click sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Configure sound - short click
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.01);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    // Play
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  } catch (error) {
    // Silently fail if audio context isn't available
    console.warn('Audio playback failed:', error);
  }
};

// Play a slightly different sound for output (typewriter effect)
export const playTypewriterSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create oscillator
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Configure sound - mechanical typewriter click
    oscillator.frequency.setValueAtTime(600 + Math.random() * 200, now);
    oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.008);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    
    // Play
    oscillator.start(now);
    oscillator.stop(now + 0.03);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
};

// Enable audio context on user interaction (required by browsers)
export const enableAudio = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (error) {
    console.warn('Could not enable audio:', error);
  }
}; 