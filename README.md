# Multi-Level Cache System (LRU + LFU)

## 🚀 Overview
A two-level cache system:
- L1 Cache → Least Recently Used (LRU)
- L2 Cache → Least Frequently Used (LFU)

## ⚙️ Features
- O(1) lookup using HashMap
- LRU eviction using Doubly Linked List
- LFU eviction using Min Heap
- Multi-level cache (L1 ↔ L2 movement)
- Interactive Web UI visualization

## 🖥️ Demo Features
- PUT / GET operations
- Cache promotion (L2 → L1)
- Eviction handling
- Frequency tracking
- Operation logs
- Hit/Miss statistics

## 🧠 Concepts Used
- Hash Tables
- Doubly Linked List
- Min Heap
- Caching Strategies (LRU, LFU)


## 📂 Project Structure
- `cache/` → LRU, LFU, Multi-level logic
- `ds/` → Data structures
- `model/` → Node class
- `web/` → UI files
