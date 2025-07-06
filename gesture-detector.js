class GestureDetector {
    constructor() {
        this.gestures = {
            'open_palm': { name: 'Open Palm', emoji: '✋', confidence: 0 },
            'fist': { name: 'Fist', emoji: '✊', confidence: 0 },
            'ok_sign': { name: 'OK Sign', emoji: '👌', confidence: 0 },
            'thumbs_up': { name: 'Thumbs Up', emoji: '👍', confidence: 0 },
            'point_up': { name: 'Point Up', emoji: '☝️', confidence: 0 },
            'peace_sign': { name: 'Peace Sign', emoji: '✌️', confidence: 0 }
        };
    }

    // Calculate distance between two points
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if finger is extended based on landmark positions
    isFingerExtended(landmarks, fingerTip, fingerPip, fingerMcp) {
        const tipY = landmarks[fingerTip].y;
        const pipY = landmarks[fingerPip].y;
        const mcpY = landmarks[fingerMcp].y;
        
        // For most fingers, extended means tip is above pip and pip is above mcp
        return tipY < pipY && pipY < mcpY;
    }

    // Special case for thumb (different orientation)
    isThumbExtended(landmarks) {
        const thumbTip = landmarks[4];
        const thumbPip = landmarks[3];
        const thumbMcp = landmarks[2];
        
        // Thumb extends horizontally, so check x-coordinate
        return Math.abs(thumbTip.x - thumbMcp.x) > Math.abs(thumbPip.x - thumbMcp.x);
    }

    // Detect open palm gesture
    detectOpenPalm(landmarks) {
        const fingers = [
            this.isThumbExtended(landmarks),
            this.isFingerExtended(landmarks, 8, 6, 5),   // Index finger
            this.isFingerExtended(landmarks, 12, 10, 9), // Middle finger
            this.isFingerExtended(landmarks, 16, 14, 13), // Ring finger
            this.isFingerExtended(landmarks, 20, 18, 17)  // Pinky
        ];
        
        const extendedCount = fingers.filter(f => f).length;
        return extendedCount >= 4 ? 0.8 + (extendedCount - 4) * 0.05 : 0;
    }

    // Detect fist gesture
    detectFist(landmarks) {
        const fingers = [
            this.isThumbExtended(landmarks),
            this.isFingerExtended(landmarks, 8, 6, 5),   // Index finger
            this.isFingerExtended(landmarks, 12, 10, 9), // Middle finger
            this.isFingerExtended(landmarks, 16, 14, 13), // Ring finger
            this.isFingerExtended(landmarks, 20, 18, 17)  // Pinky
        ];
        
        const extendedCount = fingers.filter(f => f).length;
        return extendedCount <= 1 ? 0.9 - extendedCount * 0.2 : 0;
    }

    // Detect OK sign (thumb and index finger forming circle)
    detectOkSign(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        // Check if thumb and index finger are close (forming circle)
        const thumbIndexDistance = this.calculateDistance(thumbTip, indexTip);
        const isCircleFormed = thumbIndexDistance < 0.05;
        
        // Check if other fingers are extended
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        if (isCircleFormed && middleExtended && ringExtended && pinkyExtended) {
            return 0.85;
        }
        
        return 0;
    }

    // Detect thumbs up gesture
    detectThumbsUp(landmarks) {
        const thumbExtended = this.isThumbExtended(landmarks);
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        // Thumb up, other fingers down
        if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            // Check if thumb is pointing upward
            const thumbTip = landmarks[4];
            const thumbMcp = landmarks[2];
            const isThumbUp = thumbTip.y < thumbMcp.y;
            
            return isThumbUp ? 0.9 : 0;
        }
        
        return 0;
    }

    // Detect point up gesture (index finger extended, others closed)
    detectPointUp(landmarks) {
        const thumbExtended = this.isThumbExtended(landmarks);
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        // Only index finger extended
        if (indexExtended && !thumbExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return 0.85;
        }
        
        return 0;
    }

    // Detect peace sign (index and middle finger extended)
    detectPeaceSign(landmarks) {
        const thumbExtended = this.isThumbExtended(landmarks);
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        // Index and middle finger extended, others closed
        if (indexExtended && middleExtended && !thumbExtended && !ringExtended && !pinkyExtended) {
            // Check if fingers are separated (forming V shape)
            const indexTip = landmarks[8];
            const middleTip = landmarks[12];
            const fingerDistance = this.calculateDistance(indexTip, middleTip);
            
            return fingerDistance > 0.05 ? 0.9 : 0.7;
        }
        
        return 0;
    }

    // Main detection method
    detectGesture(landmarks) {
        if (!landmarks || landmarks.length < 21) {
            return { gesture: 'none', confidence: 0 };
        }

        // Calculate confidence for each gesture
        const confidences = {
            'open_palm': this.detectOpenPalm(landmarks),
            'fist': this.detectFist(landmarks),
            'ok_sign': this.detectOkSign(landmarks),
            'thumbs_up': this.detectThumbsUp(landmarks),
            'point_up': this.detectPointUp(landmarks),
            'peace_sign': this.detectPeaceSign(landmarks)
        };

        // Find gesture with highest confidence
        let bestGesture = 'none';
        let maxConfidence = 0;

        for (const [gesture, confidence] of Object.entries(confidences)) {
            if (confidence > maxConfidence && confidence > 0.5) {
                maxConfidence = confidence;
                bestGesture = gesture;
            }
        }

        return {
            gesture: bestGesture,
            confidence: maxConfidence,
            allConfidences: confidences
        };
    }

    // Get gesture display information
    getGestureInfo(gestureKey) {
        return this.gestures[gestureKey] || { name: 'Unknown', emoji: '❓', confidence: 0 };
    }
}

// Export for use in other files
window.GestureDetector = GestureDetector;
