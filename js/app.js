// Main Application Logic
console.log('Loading app.js...');

class DanceCoachApp {
    constructor() {
        console.log('DanceCoachApp constructor');
        
        // Verifica che le classi siano disponibili
        if (!window.PoseDetector) {
            throw new Error('PoseDetector not available');
        }
        if (!window.DanceAnalyzer) {
            throw new Error('DanceAnalyzer not available');
        }
        
        this.poseDetector = new window.PoseDetector();
        this.danceAnalyzer = new window.DanceAnalyzer();
        this.isRunning = false;
        
        this.initializeElements();
        this.bindEvents();
        
        console.log('DanceCoachApp initialized successfully');
    }

    initializeElements() {
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('output-canvas');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.danceSelect = document.getElementById('dance-select');
        this.scoreDisplay = document.getElementById('score-display');
        this.correctionsList = document.getElementById('corrections-list');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', this.start.bind(this));
        this.stopBtn.addEventListener('click', this.stop.bind(this));
    }

    async start() {
        try {
            console.log('Starting dance coach app...');
            
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            
            // Richiedi permessi camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
                audio: false
            });
            
            this.videoElement.srcObject = stream;
            
            // Aspetta che il video sia pronto
            await new Promise(resolve => {
                this.videoElement.onloadedmetadata = resolve;
            });
            
            // Inizializza pose detector
            await this.poseDetector.initialize(
                this.videoElement,
                this.canvasElement,
                this.onPoseDetected.bind(this)
            );
            
            // Avvia detection
            await this.poseDetector.start();
            this.isRunning = true;
            
            console.log('App avviata con successo!');
            
        } catch (error) {
            console.error('Errore avvio app:', error);
            alert(`Errore: ${error.message}`);
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
        }
    }

    stop() {
        console.log('Stopping app...');
        this.isRunning = false;
        this.poseDetector.stop();
        
        // Ferma stream video
        if (this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        // Pulisci canvas
        const ctx = this.canvasElement.getContext('2d');
        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        console.log('App fermata');
    }

    onPoseDetected(landmarks) {
        if (!this.isRunning) return;
        
        const selectedMove = this.danceSelect.value;
        const analysis = this.danceAnalyzer.analyzePose(landmarks, selectedMove);
        
        if (analysis) {
            this.updateUI(analysis);
        }
    }

    updateUI(analysis) {
        // Aggiorna score
        this.scoreDisplay.textContent = `Score: ${Math.round(analysis.score)}/100`;
        this.scoreDisplay.style.color = this.getScoreColor(analysis.score);
        
        // Aggiorna feedback
        this.correctionsList.innerHTML = '';
        if (analysis.feedback && analysis.feedback.length > 0) {
            analysis.feedback.forEach(feedback => {
                const li = document.createElement('div');
                li.textContent = feedback;
                li.style.margin = '5px 0';
                li.style.padding = '8px';
                li.style.background = 'rgba(255, 255, 255, 0.1)';
                li.style.borderRadius = '5px';
                this.correctionsList.appendChild(li);
            });
        }
    }

    getScoreColor(score) {
        if (score >= 80) return '#4CAF50'; // Verde
        if (score >= 60) return '#FFC107'; // Giallo
        if (score >= 40) return '#FF9800'; // Arancione
        return '#F44336'; // Rosso
    }
}

// Funzione per attendere il caricamento completo
function waitForDependencies() {
    console.log('Waiting for dependencies...');
    console.log('MediaPipe Pose available:', !!window.Pose);
    console.log('MediaPipe Camera available:', !!window.Camera);
    console.log('PoseDetector available:', !!window.PoseDetector);
    console.log('DanceAnalyzer available:', !!window.DanceAnalyzer);
    
    if (window.Pose && window.Camera && window.PoseDetector && window.DanceAnalyzer) {
        console.log('All dependencies ready, starting app...');
        const app = new DanceCoachApp();
        console.log('✅ AI Dance Coach App caricata!');
        return true;
    }
    return false;
}

// Avvia app quando tutto è pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking dependencies...');
    
    // Prova subito
    if (waitForDependencies()) return;
    
    // Se non è pronto, riprova ogni 500ms per max 10 secondi
    let attempts = 0;
    const maxAttempts = 20;
    
    const interval = setInterval(() => {
        attempts++;
        console.log(`Retry ${attempts}/${maxAttempts}...`);
        
        if (waitForDependencies()) {
            clearInterval(interval);
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.error('❌ Failed to load dependencies after 10 seconds');
            alert('Errore: MediaPipe libraries non caricate. Ricarica la pagina.');
        }
    }, 500);
});
