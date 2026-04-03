package ds;


import model.Node;


public class DoublyLinkedList {
    private Node head;
    private Node tail;

    public DoublyLinkedList() {
        this.head = new Node(-1, -1);
        this.tail = new Node(-1, -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    public void addToFront(Node node) {
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
        node.prev = this.head;
    }

    public void removeNode(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    public Node removeLast() {
        if (this.tail.prev == this.head) {
            return null;
        }
        Node lastNode = this.tail.prev;
        removeNode(lastNode);
        return lastNode;
    }
}