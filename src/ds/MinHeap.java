
package ds;

import java.util.ArrayList;
import model.Node;

public class MinHeap {

    private ArrayList<Node> heap;

    public MinHeap() {
        heap = new ArrayList<>();
    }

    // Insert node into heap
    public void insert(Node node) {
        heap.add(node);
        heapifyUp(heap.size() - 1);
    }

    // Remove and return node with minimum frequency
    public Node extractMin() {
        if (heap.isEmpty()) return null;

        Node min = heap.get(0);
        Node last = heap.remove(heap.size() - 1);

        if (!heap.isEmpty()) {
            heap.set(0, last);
            heapifyDown(0);
        }

        return min;
    }

    // Remove a specific node (needed when frequency updates)
    public void remove(Node node) {
        int index = heap.indexOf(node);
        if (index == -1) return;

        Node last = heap.remove(heap.size() - 1);

        if (index < heap.size()) {
            heap.set(index, last);
            heapifyUp(index);
            heapifyDown(index);
        }
    }

    // Heapify up
    private void heapifyUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;

            if (heap.get(parent).frequency <= heap.get(index).frequency) break;

            swap(parent, index);
            index = parent;
        }
    }

    // Heapify down
    private void heapifyDown(int index) {
        int size = heap.size();

        while (true) {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int smallest = index;

            if (left < size && heap.get(left).frequency < heap.get(smallest).frequency) {
                smallest = left;
            }

            if (right < size && heap.get(right).frequency < heap.get(smallest).frequency) {
                smallest = right;
            }

            if (smallest == index) break;

            swap(index, smallest);
            index = smallest;
        }
    }

    // Swap helper
    private void swap(int i, int j) {
        Node temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);
    }
}