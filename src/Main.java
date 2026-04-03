import cache.MultiLevelCache;

public class Main {
    public static void main(String[] args) {
        MultiLevelCache cache = new MultiLevelCache(2, 3);

        cache.put(1, 10);
        cache.put(2, 20);

        System.out.println(cache.get(1)); // 10

        cache.put(3, 30); // evicts 2 → goes to L2

        System.out.println(cache.get(2)); // should come from L2

        cache.put(4, 40);

        System.out.println(cache.get(3));
        System.out.println(cache.get(4));
    }
}
