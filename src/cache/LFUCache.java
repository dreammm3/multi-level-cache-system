package cache;

import java.util.HashMap;
import model.Node;
import ds.MinHeap;

public class LFUCache {

    private int capacity;
    private HashMap<Integer, Node> map;
    private MinHeap heap;

    public LFUCache(int capacity) {
        this.capacity = capacity;
        this.map = new HashMap<>();
        this.heap = new MinHeap();
    }

    public int get(int key) {
        Node node = map.get(key);
        if (node == null) return -1;

        // Update frequency
        heap.remove(node);
        node.frequency++;
        heap.insert(node);

        return node.value;
    }

    public Node put(int key, int value) {
        if (capacity == 0) return null;

        Node node = map.get(key);

        if (node != null) {
            // Update value + frequency
            heap.remove(node);
            node.value = value;
            node.frequency++;
            heap.insert(node);
            return null;
        }

        Node evicted = null;

        if (map.size() == capacity) {
            evicted = heap.extractMin();
            if (evicted != null) {
                map.remove(evicted.key);
            }
        }

        Node newNode = new Node(key, value);
        heap.insert(newNode);
        map.put(key, newNode);

        return evicted;
    }
}

