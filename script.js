// Select necessary elements
const background = document.querySelector(".background");
const logo = document.getElementById("logo");
const audio = document.getElementById("background-music");
let audioContext, analyzer, dataArray;
let isPlaying = false;

// Toggle music playback and visualizer
function toggleMusic() {
  if (!audioContext) {
    setupAudioVisualizer();
  }

  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
    animateGlow();
  }
  isPlaying = !isPlaying;
}

// Set up audio analyzer
function setupAudioVisualizer() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaElementSource(audio);
  analyzer = audioContext.createAnalyser();
  source.connect(analyzer);
  analyzer.connect(audioContext.destination);

  analyzer.fftSize = 256; // Controls the sensitivity
  const bufferLength = analyzer.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

// Animate logo based on audio frequency
function animateGlow() {
  if (!isPlaying) return; // Stop animation when music is paused

  requestAnimationFrame(animateGlow);

  analyzer.getByteFrequencyData(dataArray);
  const maxAmplitude = Math.max(...dataArray); // Get the strongest beat

  // Scale the glow and size based on the beat
  const glowStrength = Math.min(maxAmplitude / 5, 50); // Cap the max glow size
  const scaleFactor = 1 + maxAmplitude / 300;

  logo.style.boxShadow = `0 0 ${glowStrength}px ${glowStrength / 2}px rgba(0, 132, 255, 0.8)`;
  logo.style.transform = `scale(${scaleFactor})`;
}

// Create stars dynamically
function createStars(numStars) {
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.classList.add("stars");

    // Randomize position and animation
    const randomLeft = Math.random() * 100; // 0% to 100% width
    const randomDuration = Math.random() * 3 + 5; // 5s to 8s
    const randomDelay = Math.random() * 5; // 0s to 5s delay

    // Apply styles
    star.style.left = `${randomLeft}%`;
    star.style.animationDuration = `${randomDuration}s`;
    star.style.animationDelay = `${randomDelay}s`;

    // Add to background
    background.appendChild(star);
  }
}

// Generate stars
createStars(100);
