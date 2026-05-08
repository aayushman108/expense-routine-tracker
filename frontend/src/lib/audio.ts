/**
 * Utility to play a simple "ping" sound using Web Audio API.
 * This avoids needing to load an external MP3 file.
 */
export function playNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    const now = audioContext.currentTime;

    const createSoothingNote = (
      freq: number,
      startTime: number,
      duration: number,
      vol: number,
    ) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      // Sine wave for the purest, most soothing tone
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      // Very soft attack (0.1s) and long decay for a "glassy" feel
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // High-pitched but gentle C6 and E6
    // Slower timing and longer durations make it feel more "premium" and less urgent
    createSoothingNote(1046.5, now, 1.5, 0.15); // C6
    createSoothingNote(1318.51, now + 0.12, 1.5, 0.12); // E6
  } catch (err) {
    console.warn("Failed to play notification sound:", err);
  }
}
