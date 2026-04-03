package model;

public class Node {
    public int key;
    public int value;
    public int frequency;
    public Node prev;
    public Node next;
    
    public Node(int key, int value) {
        this.key = key;
        this.value = value;
        this.frequency = 1;
        this.prev = null;
        this.next = null;
    }
}