// Performance Monitoring & Quality Assurance System
// This system monitors app performance, tracks user interactions, and ensures quality

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            apiResponseTimes: [],
            userInteractions: [],
            errors: [],
            memoryUsage: [],
            networkLatency: []
        };
        
        this.observers = new Map();
        this.isEnabled = true;
        this.reportInterval = 30000; // 30 seconds
        
        this.initialize();
    }

    initialize() {
        if (!this.isEnabled) return;
        
        // Setup performance observers
        this.setupPerformanceObservers();
        
        // Track page load performance
        this.trackPageLoad();
        
        // Monitor user interactions
        this.trackUserInteractions();
        
        // Monitor errors
        this.trackErrors();
        
        // Monitor memory usage
        this.trackMemoryUsage();
        
        // Start periodic reporting
        this.startReporting();
    }

    setupPerformanceObservers() {
        // Navigation timing
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        this.metrics.pageLoadTime = entry.loadEventEnd - entry.fetchStart;
                    }
                });
            });
            observer.observe({ entryTypes: ['navigation'] });
            this.observers.set('navigation', observer);
        }

        // Network requests
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'resource' && entry.name.includes('api')) {
                        this.metrics.apiResponseTimes.push({
                            url: entry.name,
                            duration: entry.duration,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', observer);
        }

        // Long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        this.recordPerformanceIssue('long-task', {
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
            });
            observer.observe({ entryTypes: ['longtask'] });
            this.observers.set('longtask', observer);
        }
    }

    trackPageLoad() {
        window.addEventListener('load', () => {
            // Use Navigation Timing API
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            }
        });
    }

    trackUserInteractions() {
        // Track clicks
        document.addEventListener('click', (e) => {
            this.recordInteraction('click', {
                element: e.target.tagName.toLowerCase(),
                className: e.target.className,
                id: e.target.id,
                timestamp: Date.now()
            });
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.recordInteraction('form-submit', {
                formId: e.target.id,
                timestamp: Date.now()
            });
        });

        // Track navigation
        window.addEventListener('popstate', () => {
            this.recordInteraction('navigation', {
                url: window.location.href,
                timestamp: Date.now()
            });
        });
    }

    trackErrors() {
        // JavaScript errors
        window.addEventListener('error', (e) => {
            this.recordError('javascript', {
                message: e.message,
                filename: e.filename,
                line: e.lineno,
                column: e.colno,
                stack: e.error?.stack,
                timestamp: Date.now()
            });
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.recordError('promise', {
                reason: e.reason,
                timestamp: Date.now()
            });
        });

        // Resource loading errors
        window.addEventListener('error', (e) => {
            if (e.target !== window) {
                this.recordError('resource', {
                    element: e.target.tagName,
                    source: e.target.src || e.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    trackMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage.push({
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });
                
                // Keep only last 100 entries
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage.shift();
                }
            }, 10000); // Every 10 seconds
        }
    }

    recordInteraction(type, data) {
        this.metrics.userInteractions.push({
            type,
            ...data
        });
        
        // Keep only last 200 interactions
        if (this.metrics.userInteractions.length > 200) {
            this.metrics.userInteractions.shift();
        }
    }

    recordError(type, data) {
        this.metrics.errors.push({
            type,
            ...data
        });
        
        // Keep only last 50 errors
        if (this.metrics.errors.length > 50) {
            this.metrics.errors.shift();
        }
    }

    recordPerformanceIssue(type, data) {
        console.warn(`Performance Issue: ${type}`, data);
        this.recordError('performance', { type, ...data });
    }

    // API Response Time Tracking
    trackAPICall(url, startTime) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        this.metrics.apiResponseTimes.push({
            url,
            duration,
            timestamp: endTime
        });
        
        // Keep only last 100 API calls
        if (this.metrics.apiResponseTimes.length > 100) {
            this.metrics.apiResponseTimes.shift();
        }
        
        // Alert on slow API calls
        if (duration > 3000) { // 3 seconds
            this.recordPerformanceIssue('slow-api', { url, duration });
        }
    }

    // Network Latency Tracking
    measureNetworkLatency() {
        const startTime = Date.now();
        
        // Use a small resource to measure latency
        const img = new Image();
        img.onload = () => {
            const latency = Date.now() - startTime;
            this.metrics.networkLatency.push({
                latency,
                timestamp: Date.now()
            });
            
            // Keep only last 50 measurements
            if (this.metrics.networkLatency.length > 50) {
                this.metrics.networkLatency.shift();
            }
        };
        
        img.src = '/favicon.ico?' + Math.random();
    }

    // Quality Score Calculation
    calculateQualityScore() {
        const score = {
            performance: this.calculatePerformanceScore(),
            reliability: this.calculateReliabilityScore(),
            usability: this.calculateUsabilityScore(),
            overall: 0
        };
        
        score.overall = (score.performance + score.reliability + score.usability) / 3;
        return score;
    }

    calculatePerformanceScore() {
        let score = 100;
        
        // Page load time penalty
        if (this.metrics.pageLoadTime > 3000) score -= 20;
        else if (this.metrics.pageLoadTime > 2000) score -= 10;
        
        // API response time penalty
        const avgApiTime = this.metrics.apiResponseTimes.reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiResponseTimes.length;
        if (avgApiTime > 1000) score -= 15;
        else if (avgApiTime > 500) score -= 5;
        
        // Memory usage penalty
        const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        if (latestMemory && latestMemory.used > latestMemory.limit * 0.8) score -= 10;
        
        return Math.max(0, score);
    }

    calculateReliabilityScore() {
        let score = 100;
        
        // Error penalty
        const recentErrors = this.metrics.errors.filter(e => Date.now() - e.timestamp < 300000); // Last 5 minutes
        score -= recentErrors.length * 5;
        
        return Math.max(0, score);
    }

    calculateUsabilityScore() {
        let score = 100;
        
        // Interaction frequency (good indicator of usability)
        const recentInteractions = this.metrics.userInteractions.filter(i => Date.now() - i.timestamp < 300000);
        if (recentInteractions.length === 0) score -= 20; // No interactions is bad
        
        return Math.max(0, score);
    }

    // Reporting
    startReporting() {
        setInterval(() => {
            this.generateReport();
        }, this.reportInterval);
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            qualityScore: this.calculateQualityScore(),
            summary: this.generateSummary()
        };
        
        // Store report
        this.storeReport(report);
        
        // Send to analytics if available
        if (window.gtag) {
            this.sendToAnalytics(report);
        }
        
        return report;
    }

    generateSummary() {
        return {
            totalErrors: this.metrics.errors.length,
            avgPageLoadTime: this.metrics.pageLoadTime,
            avgApiResponseTime: this.metrics.apiResponseTimes.reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiResponseTimes.length,
            totalInteractions: this.metrics.userInteractions.length,
            currentMemoryUsage: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]?.used || 0
        };
    }

    storeReport(report) {
        const reports = JSON.parse(localStorage.getItem('performanceReports') || '[]');
        reports.push(report);
        
        // Keep only last 50 reports
        if (reports.length > 50) {
            reports.shift();
        }
        
        localStorage.setItem('performanceReports', JSON.stringify(reports));
    }

    sendToAnalytics(report) {
        // Send performance metrics to Google Analytics
        gtag('event', 'performance_report', {
            'page_load_time': report.metrics.pageLoadTime,
            'quality_score': report.qualityScore.overall,
            'error_count': report.metrics.errors.length
        });
    }

    // Public API
    getMetrics() {
        return { ...this.metrics };
    }

    getQualityScore() {
        return this.calculateQualityScore();
    }

    getLatestReport() {
        const reports = JSON.parse(localStorage.getItem('performanceReports') || '[]');
        return reports[reports.length - 1] || null;
    }

    getAllReports() {
        return JSON.parse(localStorage.getItem('performanceReports') || '[]');
    }

    // Cleanup
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Initialize performance monitor
if (typeof window !== 'undefined') {
    window.performanceMonitor = new PerformanceMonitor();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
