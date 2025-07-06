class HandGestureApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gestureDetector = new GestureDetector();
        this.hands = null;
        this.camera = null;
        this.showLandmarks = true;
        this.isRunning = false;
        
        // UI elements
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.toggleLandmarksBtn = document.getElementById('toggle-landmarks');
        this.gestureNameEl = document.getElementById('gesture-name');
        this.confidenceFillEl = document.getElementById('confidence-fill');
        this.confidenceTextEl = document.getElementById('confidence-text');
        this.statusEl = document.getElementById('status');
        this.fpsEl = document.getElementById('fps');
        
        // FPS tracking
        this.fpsCounter = 0;
        this.lastFpsUpdate = Date.now();
        
        // Gesture smoothing
        this.lastGesture = 'none';
        this.gestureBuffer = [];
        this.bufferSize = 5;
        
        this.initializeEventListeners();
        this.initializeMediaPipe();
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        this.toggleLandmarksBtn.addEventListener('click', () => this.toggleLandmarks());
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    async initializeMediaPipe() {
        try {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onResults(results));
            
            this.updateStatus('MediaPipe initialized successfully');
        } catch (error) {
            console.error('Error initializing MediaPipe:', error);
            this.updateStatus('Error initializing MediaPipe');
        }
    }

    async startCamera() {
        try {
            this.updateStatus('Requesting camera access...');
            
            // Stop any existing camera first
            if (this.video.srcObject) {
                this.stopCamera();
            }
            
            const constraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            });
            
            // Small delay to ensure video is stable
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.resizeCanvas();
            
            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    if (this.isRunning) {
                        await this.hands.send({ image: this.video });
                    }
                },
                width: 1280,
                height: 720
            });
            
            this.camera.start();
            this.isRunning = true;
            this.updateStatus('Camera started - Show your hand gestures!');
            this.updateButtons();

        } catch (error) {
            console.error('Error accessing camera:', error);
            let errorMessage = 'Error accessing camera. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera permissions and refresh the page.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'Camera is already in use by another application.';
            } else {
                errorMessage += 'Please check your camera settings.';
            }
            
            this.updateStatus(errorMessage);
        }
    }

    stopCamera() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
        
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }
        
        this.isRunning = false;
        this.updateStatus('Camera stopped');
        this.updateButtons();
        this.clearCanvas();
        this.resetGestureDisplay();
    }

    toggleLandmarks() {
        this.showLandmarks = !this.showLandmarks;
        this.toggleLandmarksBtn.textContent = this.showLandmarks ? 'Hide Landmarks' : 'Show Landmarks';
    }

    onResults(results) {
        this.updateFPS();
        this.clearCanvas();
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Process the first detected hand
            const landmarks = results.multiHandLandmarks[0];
            const gestureResult = this.gestureDetector.detectGesture(landmarks);
            
            // Apply gesture smoothing
            const smoothedGesture = this.smoothGesture(gestureResult);
            this.updateGestureDisplay(smoothedGesture);
            
            if (this.showLandmarks) {
                this.drawLandmarks(landmarks);
                this.drawConnections(landmarks);
            }
        } else {
            this.gestureBuffer = [];
            this.resetGestureDisplay();
        }
    }

    smoothGesture(gestureResult) {
        // Add current gesture to buffer
        this.gestureBuffer.push(gestureResult);
        
        // Keep buffer size manageable
        if (this.gestureBuffer.length > this.bufferSize) {
            this.gestureBuffer.shift();
        }
        
        // If buffer is not full, return current gesture
        if (this.gestureBuffer.length < this.bufferSize) {
            return gestureResult;
        }
        
        // Count occurrences of each gesture
        const gestureCounts = {};
        let totalConfidence = 0;
        
        this.gestureBuffer.forEach(result => {
            if (!gestureCounts[result.gesture]) {
                gestureCounts[result.gesture] = { count: 0, confidence: 0 };
            }
            gestureCounts[result.gesture].count++;
            gestureCounts[result.gesture].confidence += result.confidence;
            totalConfidence += result.confidence;
        });
        
        // Find most common gesture
        let mostCommonGesture = 'none';
        let maxCount = 0;
        let avgConfidence = 0;
        
        for (const [gesture, data] of Object.entries(gestureCounts)) {
            if (data.count > maxCount) {
                maxCount = data.count;
                mostCommonGesture = gesture;
                avgConfidence = data.confidence / data.count;
            }
        }
        
        // Only change gesture if it's stable (appears in at least 60% of buffer)
        if (maxCount >= Math.ceil(this.bufferSize * 0.6)) {
            return {
                gesture: mostCommonGesture,
                confidence: avgConfidence,
                allConfidences: gestureResult.allConfidences
            };
        }
        
        // Return last stable gesture if current is not stable
        return {
            gesture: this.lastGesture,
            confidence: avgConfidence,
            allConfidences: gestureResult.allConfidences
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawLandmarks(landmarks) {
        this.ctx.fillStyle = '#00FF00';
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        
        // Draw landmarks
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw landmark numbers for debugging
            if (index % 4 === 0) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(index.toString(), x + 8, y + 4);
                this.ctx.fillStyle = '#00FF00';
            }
        });
    }

    drawConnections(landmarks) {
        const connections = [
            // Thumb
            [0, 1], [1, 2], [2, 3], [3, 4],
            // Index finger
            [0, 5], [5, 6], [6, 7], [7, 8],
            // Middle finger
            [0, 9], [9, 10], [10, 11], [11, 12],
            // Ring finger
            [0, 13], [13, 14], [14, 15], [15, 16],
            // Pinky
            [0, 17], [17, 18], [18, 19], [19, 20],
            // Palm
            [5, 9], [9, 13], [13, 17]
        ];

        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        connections.forEach(([startIdx, endIdx]) => {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];
            
            const startX = start.x * this.canvas.width;
            const startY = start.y * this.canvas.height;
            const endX = end.x * this.canvas.width;
            const endY = end.y * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        });
    }

    updateGestureDisplay(gestureResult) {
        if (gestureResult.gesture !== 'none') {
            this.lastGesture = gestureResult.gesture;
            const gestureInfo = this.gestureDetector.getGestureInfo(gestureResult.gesture);
            this.gestureNameEl.textContent = `${gestureInfo.emoji} ${gestureInfo.name}`;
            
            const confidencePercent = Math.round(gestureResult.confidence * 100);
            this.confidenceFillEl.style.width = `${confidencePercent}%`;
            this.confidenceTextEl.textContent = `${confidencePercent}%`;
            
            // Add visual feedback
            this.gestureNameEl.style.color = '#28a745';
        } else {
            this.resetGestureDisplay();
        }
    }

    resetGestureDisplay() {
        this.gestureNameEl.textContent = 'No gesture detected';
        this.gestureNameEl.style.color = '#ffffff';
        this.confidenceFillEl.style.width = '0%';
        this.confidenceTextEl.textContent = '0%';
    }

    updateFPS() {
        this.fpsCounter++;
        const now = Date.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fpsEl.textContent = `FPS: ${this.fpsCounter}`;
            this.fpsCounter = 0;
            this.lastFpsUpdate = now;
        }
    }

    updateStatus(message) {
        this.statusEl.textContent = message;
    }

    updateButtons() {
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;
        
        if (this.isRunning) {
            this.startBtn.textContent = 'Camera Running';
            this.stopBtn.textContent = 'Stop Camera';
        } else {
            this.startBtn.textContent = 'Start Camera';
            this.stopBtn.textContent = 'Camera Stopped';
        }
    }

    resizeCanvas() {
        const rect = this.video.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new HandGestureApp();
    
    // Add some helpful information
    console.log('Hand Gesture Recognition App initialized');
    console.log('Supported gestures:', Object.keys(app.gestureDetector.gestures));
});

// Handle page visibility change to pause/resume when tab is not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing detection');
    } else {
        console.log('Page visible - resuming detection');
    }
});
