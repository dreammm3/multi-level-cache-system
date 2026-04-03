class CacheSystem {
    constructor() {
        this.L1_CAPACITY = 3;
        this.L2_CAPACITY = 5;
        
        this.l1Cache = [];  // [{ key, value, timestamp }, ...]
        this.l2Cache = [];  // [{ key, value, frequency }, ...]
        
        this.stats = {
            operations: 0,
            hits: 0,
            misses: 0
        };
        
        this.recentOperations = [];
        this.maxOperations = 20;
        
        this.initEventListeners();
        this.render();
    }
    
    initEventListeners() {
        document.getElementById('putBtn').addEventListener('click', () => this.handlePut());
        document.getElementById('getBtn').addEventListener('click', () => this.handleGet());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('clearOpsBtn').addEventListener('click', () => this.clearOperations());
        
        document.getElementById('keyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handlePut();
        });
        
        document.getElementById('valueInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleGet();
        });
    }
    
    logOperation(action, details, type) {
        const timestamp = new Date().toLocaleTimeString();
        this.recentOperations.unshift({
            action,
            details,
            type,
            timestamp
        });
        
        if (this.recentOperations.length > this.maxOperations) {
            this.recentOperations.pop();
        }
        
        this.renderOperations();
    }
    
    handlePut() {
        const key = parseInt(document.getElementById('keyInput').value);
        const value = parseInt(document.getElementById('valueInput').value);
        
        if (isNaN(key) || isNaN(value)) {
            this.logOperation('PUT', 'Invalid input', 'miss');
            this.showStatus('Please enter valid key and value', 'miss');
            return;
        }
        
        this.put(key, value);
        document.getElementById('keyInput').value = '';
        document.getElementById('valueInput').value = '';
        this.render();
    }
    
    handleGet() {
        const key = parseInt(document.getElementById('keyInput').value);
        
        if (isNaN(key)) {
            this.logOperation('GET', 'Invalid key', 'miss');
            this.showStatus('Please enter valid key', 'miss');
            return;
        }
        
        const result = this.get(key);
        document.getElementById('keyInput').value = '';
        this.render();
    }
    
    put(key, value) {
        this.stats.operations++;
        
        // Check if key already exists in L1
        const l1Index = this.l1Cache.findIndex(item => item.key === key);
        if (l1Index !== -1) {
            this.l1Cache[l1Index].value = value;
            this.l1Cache[l1Index].timestamp = Date.now();
            this.logOperation('PUT', `Updated key ${key} in L1 (value: ${value})`, 'hit-l1');
            this.showStatus(`Updated key ${key} in L1`, 'hit-l1');
            return;
        }
        
        // Check if key exists in L2
        const l2Index = this.l2Cache.findIndex(item => item.key === key);
        if (l2Index !== -1) {
            this.l2Cache[l2Index].value = value;
            this.l2Cache[l2Index].frequency++;
            this.logOperation('PUT', `Updated key ${key} in L2 (value: ${value})`, 'hit-l2');
            this.showStatus(`Updated key ${key} in L2`, 'hit-l2');
            return;
        }
        
        // Key doesn't exist - add new item to L1
        const newItem = { key, value, timestamp: Date.now() };
        this.l1Cache.unshift(newItem);
        
        // Handle L1 eviction
        if (this.l1Cache.length > this.L1_CAPACITY) {
            const evicted = this.l1Cache.pop();
            this.l2Cache.unshift({ ...evicted, frequency: 1, timestamp: undefined });
            
            // Handle L2 eviction
            if (this.l2Cache.length > this.L2_CAPACITY) {
                this.l2Cache.sort((a, b) => a.frequency - b.frequency);
                const evictedFromL2 = this.l2Cache.pop();
                this.l2Cache.sort((a, b) => b.frequency - a.frequency);
                
                this.logOperation('PUT', `Key ${key} added to L1. Key ${evicted.key} moved to L2. Key ${evictedFromL2.key} evicted from L2`, 'move');
            } else {
                this.logOperation('PUT', `Key ${key} added to L1. Key ${evicted.key} evicted to L2`, 'move');
            }
            this.showStatus(`Key ${key} added to L1. Key ${evicted.key} moved to L2`, 'hit-l1');
        } else {
            this.logOperation('PUT', `Key ${key} added to L1 (value: ${value})`, 'hit-l1');
            this.showStatus(`Key ${key} added to L1`, 'hit-l1');
        }
    }
    
    get(key) {
        this.stats.operations++;
        
        // Check L1 (LRU)
        const l1Index = this.l1Cache.findIndex(item => item.key === key);
        if (l1Index !== -1) {
            // Update position (most recent to front)
            const item = this.l1Cache.splice(l1Index, 1)[0];
            item.timestamp = Date.now();
            this.l1Cache.unshift(item);
            
            this.stats.hits++;
            this.logOperation('GET', `Cache Hit (L1) - Key: ${key}, Value: ${item.value}`, 'hit');
            this.showStatus(`Cache Hit (L1) - Value: ${item.value}`, 'hit-l1');
            this.highlightItem(`l1-${key}`);
            return item.value;
        }
        
        // Check L2 (LFU)
        const l2Index = this.l2Cache.findIndex(item => item.key === key);
        if (l2Index !== -1) {
            const item = this.l2Cache.splice(l2Index, 1)[0];
            item.frequency++;
            item.timestamp = Date.now();
            
            // Move to L1
            this.l1Cache.unshift(item);
            
            // Handle L1 eviction
            if (this.l1Cache.length > this.L1_CAPACITY) {
                const evicted = this.l1Cache.pop();
                this.l2Cache.unshift({ 
                    key: evicted.key, 
                    value: evicted.value, 
                    frequency: 1, 
                    timestamp: undefined 
                });
                
                // Handle L2 eviction
                if (this.l2Cache.length > this.L2_CAPACITY) {
                    this.l2Cache.sort((a, b) => a.frequency - b.frequency);
                    const evictedFromL2 = this.l2Cache.pop();
                    this.l2Cache.sort((a, b) => b.frequency - a.frequency);
                    
                    this.logOperation('GET', `Cache Hit (L2) - Key: ${key} promoted to L1. Key ${evicted.key} moved to L2. Key ${evictedFromL2.key} evicted from L2`, 'move');
                } else {
                    this.logOperation('GET', `Cache Hit (L2) - Key: ${key} promoted to L1. Key ${evicted.key} moved to L2`, 'move');
                }
            } else {
                this.logOperation('GET', `Cache Hit (L2) - Key: ${key} promoted to L1 (Freq: ${item.frequency})`, 'hit');
            }
            
            this.stats.hits++;
            this.showStatus(`Cache Hit (L2) - Value: ${item.value}. Moved to L1!`, 'hit-l2');
            this.highlightItem(`l1-${key}`);
            return item.value;
        }
        
        // Cache Miss
        this.stats.misses++;
        this.logOperation('GET', `Cache Miss - Key: ${key} not found`, 'miss');
        this.showStatus(`Cache Miss - Key ${key} not found`, 'miss');
        return -1;
    }
    
    clearAll() {
        if (confirm('Are you sure you want to clear all caches?')) {
            this.l1Cache = [];
            this.l2Cache = [];
            this.stats = { operations: 0, hits: 0, misses: 0 };
            this.logOperation('ACTION', 'All caches cleared', 'move');
            this.showStatus('All caches cleared', 'miss');
            this.render();
        }
    }
    
    clearOperations() {
        this.recentOperations = [];
        this.renderOperations();
    }
    
    removeItem(cache, key) {
        if (cache === 'l1') {
            this.l1Cache = this.l1Cache.filter(item => item.key !== key);
            this.logOperation('REMOVE', `Removed key ${key} from L1`, 'move');
        } else {
            this.l2Cache = this.l2Cache.filter(item => item.key !== key);
            this.logOperation('REMOVE', `Removed key ${key} from L2`, 'move');
        }
        this.render();
    }
    
    highlightItem(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 1000);
        }
    }
    
    showStatus(message, type) {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, 3000);
    }
    
    render() {
        this.renderL1();
        this.renderL2();
        this.updateStats();
    }
    
    renderL1() {
        const l1Container = document.getElementById('l1Items');
        const l1Info = document.getElementById('l1Info');
        const l1Progress = document.getElementById('l1Progress');
        
        const usagePercent = (this.l1Cache.length / this.L1_CAPACITY) * 100;
        l1Progress.style.width = usagePercent + '%';
        l1Info.textContent = `${this.l1Cache.length}/${this.L1_CAPACITY}`;
        
        if (this.l1Cache.length === 0) {
            l1Container.innerHTML = '<div class="empty-cache">Cache is empty</div>';
            return;
        }
        
        l1Container.innerHTML = this.l1Cache.map((item, index) => `
            <div class="cache-item" id="l1-${item.key}">
                <div class="cache-item-content">
                    <span class="cache-item-key">${item.key}</span>
                    <span class="cache-item-separator">:</span>
                    <span class="cache-item-value">${item.value}</span>
                </div>
                <div class="cache-item-meta">
                    <span>${index === 0 ? '🔥 Most Recent' : '#' + (index + 1)}</span>
                    <button class="cache-item-remove" onclick="cacheSystem.removeItem('l1', ${item.key})" title="Remove item">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderL2() {
        const l2Container = document.getElementById('l2Items');
        const l2Info = document.getElementById('l2Info');
        const l2Progress = document.getElementById('l2Progress');
        
        const usagePercent = (this.l2Cache.length / this.L2_CAPACITY) * 100;
        l2Progress.style.width = usagePercent + '%';
        l2Info.textContent = `${this.l2Cache.length}/${this.L2_CAPACITY}`;
        
        if (this.l2Cache.length === 0) {
            l2Container.innerHTML = '<div class="empty-cache">Cache is empty</div>';
            return;
        }
        
        // Sort by frequency (descending) for display
        const sorted = [...this.l2Cache].sort((a, b) => b.frequency - a.frequency);
        
        l2Container.innerHTML = sorted.map((item) => `
            <div class="cache-item" id="l2-${item.key}">
                <div class="cache-item-content">
                    <span class="cache-item-key">${item.key}</span>
                    <span class="cache-item-separator">:</span>
                    <span class="cache-item-value">${item.value}</span>
                </div>
                <div class="cache-item-meta">
                    <span class="frequency-badge">Freq: ${item.frequency}</span>
                    <button class="cache-item-remove" onclick="cacheSystem.removeItem('l2', ${item.key})" title="Remove item">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderOperations() {
        const opsList = document.getElementById('operationsList');
        
        if (this.recentOperations.length === 0) {
            opsList.innerHTML = '<div class="empty-cache" style="min-height: auto; padding: 20px; font-size: 0.9rem;">No operations yet</div>';
            return;
        }
        
        opsList.innerHTML = this.recentOperations.map(op => `
            <div class="operation-item ${op.type}">
                <div class="operation-action">${op.action}</div>
                <div class="operation-details">${op.details}</div>
                <div class="operation-time">${op.timestamp}</div>
            </div>
        `).join('');
    }
    
    updateStats() {
        document.getElementById('operationCount').textContent = this.stats.operations;
        document.getElementById('hitCount').textContent = this.stats.hits;
        document.getElementById('missCount').textContent = this.stats.misses;
        
        const hitRate = this.stats.operations === 0 
            ? 0 
            : Math.round((this.stats.hits / this.stats.operations) * 100);
        document.getElementById('hitRate').textContent = hitRate + '%';
    }
}

// Initialize on page load
let cacheSystem;
document.addEventListener('DOMContentLoaded', () => {
    cacheSystem = new CacheSystem();
});
