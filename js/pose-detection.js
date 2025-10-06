// MediaPipe Pose Detection Module - CDN Alternative
class PoseDetector {
    constructor() {
        this.pose = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.isDetecting = false;
        this.onResultsCallback = null;
    }

    async initialize(videoElement, canvasElement, onResultsCallback) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.canvasCtx = canvasElement.getContext('2d');
        this.onResultsCallback = onResultsCallback;

        // Aspetta che MediaPipe sia caricato
        await this.loadMediaPipe();

        // Configura MediaPipe Pose
        this.pose = new window.Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.pose.onResults(this.onResults.bind(this));

        // Configura camera
        this.camera = new window.Camera(this.videoElement, {
            onFrame: async () => {
                if (this.isDetecting) {
                    await this.pose.send({image: this.videoElement});
                }
            },
            width: 640,
            height: 480,
            facingMode: "user"
        });
    }

    async loadMediaPipe() {
        // Carica MediaPipe scripts se non già caricati
        if (!window.Pose) {
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    onResults(results) {
        // Pulisci canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Disegna l'immagine video
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.poseLandmarks) {
            // Disegna connessioni semplici
            this.drawConnections(results.poseLandmarks);
            
            // Disegna landmarks
            this.drawLandmarks(results.poseLandmarks);

            // Callback per l'analisi della danza
            if (this.onResultsCallback) {
                this.onResultsCallback(results.poseLandmarks);
            }
        }

        this.canvasCtx.restore();
    }

    drawConnections(landmarks) {
        // Connessioni principali del corpo
        const connections = [
            [11, 12], // Spalle
            [11, 13], [13, 15], // Braccio sinistro
            [12, 14], [14, 16], // Braccio destro
            [11, 23], [12, 24], // Tronco
            [23, 24], // Anche
            [23, 25], [25, 27], // Gamba sinistra
            [24, 26], [26, 28], // Gamba destra
        ];

        this.canvasCtx.strokeStyle = '#00FF00';
        this.canvasCtx.lineWidth = 4;

        connections.forEach(([start, end]) => {
            if (landmarks[start] && landmarks[end]) {
                this.canvasCtx.beginPath();
                this.canvasCtx.moveTo(
                    landmarks[start].x * this.canvasElement.width,
                    landmarks[start].y * this.canvasElement.height
                );
                this.canvasCtx.lineTo(
                    landmarks[end].x * this.canvasElement.width,
                    landmarks[end].y * this.canvasElement.height
                );
                this.canvasCtx.stroke();
            }
        });
    }

    drawLandmarks(landmarks) {
        this.canvasCtx.fillStyle = '#FF0000';
        
        landmarks.forEach(landmark => {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                landmark.x * this.canvasElement.width,
                landmark.y * this.canvasElement.height,
                5, 0, 2 * Math.PI
            );
            this.canvasCtx.fill();
        });
    }

    async start() {
        if (!this.camera) {
            console.error('Camera non inizializzata');
            return;
        }
        
        this.isDetecting = true;
        await this.camera.start();
    }

    stop() {
        this.isDetecting = false;
        if (this.camera) {
            this.camera.stop();
        }
    }
}

// Export per uso in app.js
window.PoseDetector = PoseDetector;
