<template>
  <div class="logo-wrapper">
    <svg viewBox="0 0 100 100" class="logo-svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- Abstract S / Voice Wave -->
      <path 
        d="M 30 70 C 30 70, 35 40, 50 40 C 65 40, 70 70, 70 70" 
        fill="none" 
        stroke="url(#logoGrad)" 
        stroke-width="8" 
        stroke-linecap="round" 
        filter="url(#logoGlow)"
        class="wave top"
      />
      <path 
        d="M 30 30 C 30 30, 35 60, 50 60 C 65 60, 70 30, 70 30" 
        fill="none" 
        stroke="url(#logoGrad)" 
        stroke-width="8" 
        stroke-linecap="round" 
        filter="url(#logoGlow)"
        class="wave bottom"
      />
      
      <!-- Central Intelligence Dot -->
      <circle cx="50" cy="50" r="12" fill="url(#logoGrad)" filter="url(#logoGlow)">
        <animate attributeName="r" values="10;13;10" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
</template>

<style scoped>
.logo-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-svg {
  width: 100%;
  height: 100%;
}

.wave {
  animation: wavePulse 3s infinite ease-in-out;
}

.wave.bottom {
  animation-delay: 1.5s;
}

@keyframes wavePulse {
  0%, 100% { opacity: 0.6; stroke-width: 8; }
  50% { opacity: 1; stroke-width: 10; }
}

/* Mobile Tweak */
@media (max-width: 768px) {
  .logo-wrapper {
    width: 24px;
    height: 24px;
  }
}
</style>
