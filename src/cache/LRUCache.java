package cache;

import java.util.HashMap;
import model.Node;
import ds.DoublyLinkedList;


public class LRUCache {
    private int capacity;
    private HashMap<Integer, Node> map;
    private DoublyLinkedList list;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new HashMap<>();
        this.list = new DoublyLinkedList();
    }

    public int get(int key) {
        if (!map.containsKey(key)) {
            return -1;
        }
        Node node = map.get(key);
        list.removeNode(node);
        list.addToFront(node);
        return node.value;
    }

    public Node put(int key, int value) {
        Node evicted = null;
        
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.value = value;
            list.removeNode(node);
            list.addToFront(node);
        } else {
            if (map.size() == capacity) {
                Node lastNode = list.removeLast();
                if (lastNode != null) {
                    map.remove(lastNode.key);
                    evicted = lastNode;
                }
            }
            Node newNode = new Node(key, value);
            list.addToFront(newNode);
            map.put(key, newNode);
        }
        
        return evicted;
    }
}
