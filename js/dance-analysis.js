// Dance Analysis Module
class DanceAnalyzer {
    constructor() {
        this.poseHistory = [];
        this.maxHistoryLength = 30; // ~1 secondo a 30 FPS
        this.currentScore = 0;
        this.referencePatterns = {
            'basic-step': {
                name: 'Passo Base Bachata',
                keyPoints: [23, 24, 25, 26], // Anche e caviglie
                expectedPattern: 'side-to-side'
            },
            'side-step': {
                name: 'Passo Laterale',
                keyPoints: [23, 24, 25, 26],
                expectedPattern: 'lateral-movement'
            }
        };
    }

    analyzePose(landmarks, selectedMove) {
        // Aggiungi pose corrente alla history
        this.poseHistory.push(landmarks);
        
        // Mantieni solo gli ultimi N frame
        if (this.poseHistory.length > this.maxHistoryLength) {
            this.poseHistory.shift();
        }

        // Analizza solo se abbiamo abbastanza dati
        if (this.poseHistory.length < 10) return null;

        // Calcola score basato sul movimento selezionato
        const pattern = this.referencePatterns[selectedMove];
        if (!pattern) return null;

        const analysis = this.analyzeMovement(pattern);
        
        return {
            score: analysis.score,
            feedback: analysis.feedback,
            posture: this.analyzePosture(landmarks),
            rhythm: this.analyzeRhythm()
        };
    }

    analyzeMovement(pattern) {
        const currentPose = this.poseHistory[this.poseHistory.length - 1];
        const previousPose = this.poseHistory;
        
        if (!currentPose || !previousPose) return { score: 0, feedback: [] };

        let score = 0;
        let feedback = [];

        // Analizza movimento delle anche
        const hipMovement = this.calculateHipMovement(currentPose, previousPose);
        
        if (pattern.expectedPattern === 'side-to-side') {
            // Per passo base: movimento laterale delle anche
            if (Math.abs(hipMovement.horizontal) > 0.02) {
                score += 40;
                feedback.push("✅ Buon movimento laterale delle anche");
            } else {
                feedback.push("⚠️ Aumenta il movimento laterale delle anche");
            }
            
            // Stabilità verticale
            if (Math.abs(hipMovement.vertical) < 0.01) {
                score += 30;
                feedback.push("✅ Buona stabilità verticale");
            } else {
                feedback.push("⚠️ Mantieni il busto più stabile");
            }
        }

        // Analizza postura generale
        const posture = this.analyzePosture(currentPose);
        score += posture.score;
        feedback.push(...posture.feedback);

        return { score: Math.min(100, score), feedback };
    }

    calculateHipMovement(current, previous) {
        const currentHip = {
            x: (current.x + current.x) / 2,
            y: (current.y + current.y) / 2
        };
        
        const previousHip = {
            x: (previous.x + previous.x) / 2,
            y: (previous.y + previous.y) / 2
        };

        return {
            horizontal: currentHip.x - previousHip.x,
            vertical: currentHip.y - previousHip.y
        };
    }

    analyzePosture(landmarks) {
        let score = 0;
        let feedback = [];

        // Controlla allineamento spalle
        const leftShoulder = landmarks;
        const rightShoulder = landmarks;
        const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        
        if (shoulderDiff < 0.05) {
            score += 15;
            feedback.push("✅ Spalle ben allineate");
        } else {
            feedback.push("⚠️ Raddrizza le spalle");
        }

        // Controlla posizione del busto
        const nose = landmarks;
        const midHip = {
            x: (landmarks.x + landmarks.x) / 2,
            y: (landmarks.y + landmarks.y) / 2
        };
        
        const bustAlignment = Math.abs(nose.x - midHip.x);
        if (bustAlignment < 0.1) {
            score += 15;
            feedback.push("✅ Busto ben centrato");
        } else {
            feedback.push("⚠️ Mantieni il busto centrato");
        }

        return { score, feedback };
    }

    analyzeRhythm() {
        // Analisi ritmo semplificata basata su velocità movimento
        if (this.poseHistory.length < 10) return { onBeat: false, tempo: 0 };
        
        const movements = [];
        for (let i = 1; i < this.poseHistory.length; i++) {
            const movement = this.calculateMovementSpeed(this.poseHistory[i-1], this.poseHistory[i]);
            movements.push(movement);
        }
        
        const avgMovement = movements.reduce((a, b) => a + b, 0) / movements.length;
        
        return {
            onBeat: avgMovement > 0.01 && avgMovement < 0.05, // Movimento controllato
            tempo: avgMovement * 1000 // Velocità normalizzata
        };
    }

    calculateMovementSpeed(pose1, pose2) {
        let totalMovement = 0;
        const keyJoints = [11, 12, 23, 24]; // Spalle e anche
        
        keyJoints.forEach(joint => {
            const dx = pose2[joint].x - pose1[joint].x;
            const dy = pose2[joint].y - pose1[joint].y;
            totalMovement += Math.sqrt(dx * dx + dy * dy);
        });
        
        return totalMovement / keyJoints.length;
    }
}

// Export per uso in app.js
window.DanceAnalyzer = DanceAnalyzer;
