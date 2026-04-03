package cache;

import model.Node;

public class MultiLevelCache {

    private LRUCache l1Cache; // Level 1: LRU (fast, small)
    private LFUCache l2Cache; // Level 2: LFU (larger, slower)

    public MultiLevelCache(int l1Capacity, int l2Capacity) {
        this.l1Cache = new LRUCache(l1Capacity);
        this.l2Cache = new LFUCache(l2Capacity);
    }

    // Get value from cache
    public int get(int key) {

        // Step 1: Check L1 (LRU)
        int value = l1Cache.get(key);
        if (value != -1) {
            return value;
        }

        // Step 2: Check L2 (LFU)
        value = l2Cache.get(key);
        if (value != -1) {

            // Promote to L1
            Node evictedFromL1 = l1Cache.put(key, value);

            // If L1 evicts something → move it to L2
            if (evictedFromL1 != null) {
                l2Cache.put(evictedFromL1.key, evictedFromL1.value);
            }

            return value;
        }

        // Not found in both
        return -1;
    }

    // Insert value into cache
    public void put(int key, int value) {
        // Insert into L1
        Node evictedFromL1 = l1Cache.put(key, value);

        // If something is evicted from L1 → move to L2
        if (evictedFromL1 != null) {
            l2Cache.put(evictedFromL1.key, evictedFromL1.value);
        }
    }
}