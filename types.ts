.page {
    font-family: 'Arial Black', Arial, sans-serif;
    background: linear-gradient(135deg, #0a0a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #e94560 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    line-height: 1.4;
    position: relative;
    overflow: hidden;
}


/* ── Background ─────────────────────────────────────────── */

.retro-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
}

.y2k-grid {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(circle at 25% 25%, rgba(255, 0, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 255, 255, 0.1) 0%, transparent 50%);
}

.grid-dots {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 0, 0.3) 1px, transparent 0);
    background-size: 40px 40px;
    animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
    0% {
        transform: translate(0, 0);
    }
    100% {
        transform: translate(40px, 40px);
    }
}

.scanner-lines {
    position: absolute;
    width: 100%;
    height: 100%;
}

.scan-line {
    position: absolute;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    animation: scanMove 8s linear infinite;
}

.scan-1 {
    top: 20%;
    animation-delay: 0s;
}

.scan-2 {
    top: 50%;
    animation-delay: -3s;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
}

.scan-3 {
    top: 80%;
    animation-delay: -6s;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 0, 0.8), transparent);
}

@keyframes scanMove {
    0% {
        left: -100%;
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        left: 100%;
        opacity: 0;
    }
}

.floating-orbs {
    position: absolute;
    width: 100%;
    height: 100%;
}

.retro-orb {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    filter: blur(2px);
    animation: orbFloat 15s ease-in-out infinite;
}

.orb-1 {
    top: 10%;
    left: 10%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 0, 255, 0.2), transparent 70%);
    animation-delay: 0s;
}

.orb-2 {
    top: 70%;
    right: 15%;
    background: radial-gradient(circle at 30% 30%, rgba(0, 255, 255, 0.2), transparent 70%);
    animation-delay: -5s;
}

.orb-3 {
    bottom: 20%;
    left: 20%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 0, 0.2), transparent 70%);
    animation-delay: -10s;
}

@keyframes orbFloat {
    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }
    25% {
        transform: translate(50px, -30px) scale(1.1);
    }
    50% {
        transform: translate(-30px, -50px) scale(0.9);
    }
    75% {
        transform: translate(-50px, 30px) scale(1.05);
    }
}


/* ── Card ────────────────────────────────────────────────── */

.login-container {
    width: 100%;
    max-width: 450px;
    position: relative;
    z-index: 1;
}

.future-card {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(20px);
    border: 2px solid transparent;
    background-clip: padding-box;
    border-radius: 24px;
    padding: 48px 40px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(255, 0, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
}

.future-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff);
    background-size: 400% 400%;
    animation: chromeShift 6s ease-in-out infinite;
    border-radius: 24px;
    z-index: -2;
}

.future-card::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: linear-gradient(145deg, rgba(16, 16, 40, 0.95), rgba(32, 32, 64, 0.9));
    border-radius: 22px;
    z-index: -1;
}

@keyframes chromeShift {
    0%,
    100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}


/* ── Header / Logo ───────────────────────────────────────── */

.chrome-header {
    text-align: center;
    margin-bottom: 40px;
}

.retro-logo {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-chrome {
    position: relative;
    width: 64px;
    height: 64px;
    background: linear-gradient(145deg, #e6e6fa, #c0c0ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3);
    animation: logoRotate 8s linear infinite;
}

.chrome-inner {
    position: relative;
    z-index: 2;
    animation: logoRotate 8s linear infinite reverse;
}

.chrome-glow {
    position: absolute;
    inset: -4px;
    background: conic-gradient(from 0deg, #ff00ff, #00ffff, #ffff00, #ff00ff);
    border-radius: 50%;
    animation: logoRotate 4s linear infinite;
    z-index: 0;
    filter: blur(8px);
}

@keyframes logoRotate {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.y2k-title {
    font-size: 2.25rem;
    font-weight: 900;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: flex;
    justify-content: center;
    gap: 8px;
}

.title-chrome {
    background: linear-gradient(45deg, #e6e6fa, #c0c0ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.title-neon {
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: neonPulse 2s ease-in-out infinite alternate;
}

@keyframes neonPulse {
    0% {
        filter: brightness(1);
    }
    100% {
        filter: brightness(1.3);
    }
}

.retro-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
}


/* ── Form Fields ─────────────────────────────────────────── */

.retro-field {
    position: relative;
    margin-bottom: 28px;
}

.field-chrome {
    position: relative;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.field-chrome:focus-within {
    box-shadow: 0 0 12px rgba(100, 160, 255, 0.2);
    border-color: rgba(120, 180, 255, 0.4);
}

.chrome-border {
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff);
    background-size: 400% 400%;
    animation: borderShift 4s ease-in-out infinite;
    border-radius: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.field-chrome:focus-within .chrome-border {
    opacity: 0.2;
}

@keyframes borderShift {
    0%,
    100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

.retro-field input {
    width: 100%;
    background: transparent;
    border: none;
    padding: 18px 16px;
    color: #ffffff;
    font-size: 15px;
    font-weight: 500;
    outline: none;
    position: relative;
    z-index: 2;
    font-family: inherit;
}

.retro-field input::placeholder {
    color: transparent;
}

.retro-field label {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: 3;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.retro-field input:focus+label,
.retro-field input:not(:placeholder-shown)+label {
    top: 10px;
    font-size: 11px;
    color: #a8d4ff;
    transform: translateY(0);
    text-shadow: 0 0 6px rgba(100, 160, 255, 0.4);
}

.field-hologram {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, rgba(150, 100, 255, 0.6), rgba(100, 180, 255, 0.6));
    transition: width 0.3s ease;
    z-index: 2;
}

.field-chrome:focus-within .field-hologram {
    width: 100%;
}


/* Password toggle — adds right padding only on the password field */

.retro-field:has(.retro-toggle) input {
    padding-right: 56px;
}

.retro-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    z-index: 4;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.retro-toggle:hover {
    background: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.toggle-chrome {
    width: 20px;
    height: 20px;
}

.eye-hidden {
    display: none;
}

.retro-toggle.toggle-active .eye-future {
    display: none;
}

.retro-toggle.toggle-active .eye-hidden {
    display: block;
}


/* ── Submit Button ───────────────────────────────────────── */

.retro-button {
    width: 100%;
    background: transparent;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 15px;
    font-weight: 900;
    position: relative;
    margin-bottom: 32px;
    overflow: hidden;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s ease;
}

.button-chrome {
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff);
    background-size: 400% 400%;
    animation: buttonShift 3s ease-in-out infinite;
    border-radius: 12px;
    z-index: 1;
}

@keyframes buttonShift {
    0%,
    100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

.retro-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(255, 0, 255, 0.3);
}

.retro-button:active:not(:disabled) {
    transform: translateY(0);
}

.retro-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.button-text {
    position: relative;
    z-index: 2;
    transition: opacity 0.3s ease;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.button-loader {
    position: absolute;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.retro-button.loading .button-text {
    opacity: 0;
}

.retro-button.loading .button-loader {
    opacity: 1;
}

.y2k-spinner {
    width: 32px;
    height: 32px;
    position: relative;
}

.spinner-ring {
    position: absolute;
    border: 2px solid transparent;
    border-radius: 50%;
    animation: spinRing 2s linear infinite;
}

.spinner-ring.ring-1 {
    width: 32px;
    height: 32px;
    top: 0;
    left: 0;
    border-top-color: #ff00ff;
    animation-delay: 0s;
}

.spinner-ring.ring-2 {
    width: 24px;
    height: 24px;
    top: 4px;
    left: 4px;
    border-top-color: #00ffff;
    animation-delay: -0.3s;
}

.spinner-ring.ring-3 {
    width: 16px;
    height: 16px;
    top: 8px;
    left: 8px;
    border-top-color: #ffff00;
    animation-delay: -0.6s;
}

@keyframes spinRing {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.button-hologram {
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    border-radius: 14px;
    opacity: 0;
    filter: blur(10px);
    transition: opacity 0.3s ease;
    z-index: 0;
}

.retro-button:hover:not(:disabled) .button-hologram {
    opacity: 0.5;
}


/* ── Error States ────────────────────────────────────────── */

.retro-error {
    display: block;
    color: #ff4da6;
    font-size: 12px;
    font-weight: 500;
    margin-top: 6px;
    opacity: 0;
    transform: translateY(-4px);
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(255, 77, 166, 0.5);
}

.retro-error.show {
    opacity: 1;
    transform: translateY(0);
}

.retro-field.error .field-chrome {
    border-color: #ff4da6;
    box-shadow: 0 0 15px rgba(255, 77, 166, 0.3);
}

.retro-field.error label {
    color: #ff4da6;
}


/* ── Signup Link ─────────────────────────────────────────── */

.future-signup {
    text-align: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.signup-text {
    margin-right: 6px;
}

.future-link {
    color: #ff00ff;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.2s ease;
    position: relative;
}

.future-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: linear-gradient(90deg, #ff00ff, #00ffff);
    transition: width 0.3s ease;
}

.future-link:hover::after {
    width: 100%;
}

.future-link:hover {
    color: #00ffff;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}


/* ── Success Screen ──────────────────────────────────────── */

.retro-success {
    text-align: center;
    padding: 40px 20px;
    animation: successFadeIn 0.4s ease forwards;
}

@keyframes successFadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.success-portal {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.portal-rings {
    position: absolute;
    inset: 0;
}

.portal-ring {
    position: absolute;
    border: 2px solid transparent;
    border-radius: 50%;
    animation: portalExpand 1.5s ease-out forwards;
    opacity: 0;
}

.portal-ring.ring-1 {
    width: 60px;
    height: 60px;
    top: 30px;
    left: 30px;
    border-color: #ff00ff;
    animation-delay: 0s;
}

.portal-ring.ring-2 {
    width: 80px;
    height: 80px;
    top: 20px;
    left: 20px;
    border-color: #00ffff;
    animation-delay: 0.2s;
}

.portal-ring.ring-3 {
    width: 100px;
    height: 100px;
    top: 10px;
    left: 10px;
    border-color: #ffff00;
    animation-delay: 0.4s;
}

.portal-ring.ring-4 {
    width: 120px;
    height: 120px;
    top: 0;
    left: 0;
    border-color: #ff00ff;
    animation-delay: 0.6s;
}

@keyframes portalExpand {
    0% {
        opacity: 0;
        transform: scale(0) rotate(0deg);
    }
    50% {
        opacity: 1;
        transform: scale(1.1) rotate(180deg);
    }
    100% {
        opacity: 0.8;
        transform: scale(1) rotate(360deg);
    }
}

.success-core {
    position: relative;
    z-index: 2;
    animation: coreActivate 0.8s ease-out 0.8s forwards;
    opacity: 0;
}

@keyframes coreActivate {
    0% {
        opacity: 0;
        transform: scale(0) rotate(-180deg);
    }
    100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
}

.success-title {
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 2px;
    background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: titleShimmer 2s ease-in-out infinite;
}

@keyframes titleShimmer {
    0%,
    100% {
        filter: brightness(1);
    }
    50% {
        filter: brightness(1.3);
    }
}

.success-desc {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
}