# Roadmap — v11.0 Future Horizons
Prepared: January 11, 2026

This roadmap defines the "v11.0" milestone, focusing on next-generation learning experiences and platform expansion.

---

# Phase 1 — Mobile Native (Capacitor)
## Objective
Wrap the existing React web app into a native mobile app (iOS/Android) using Capacitor, enabling offline access and push notifications.

## Tasks
1.  **Capacitor Setup:** Initialize Capacitor in the project.
2.  **Native Shell:** Configure iOS and Android projects.
3.  **Deep Linking:** Configure universal links for seamless app opening.
4.  **Push Notifications:** Integrate Firebase Cloud Messaging or similar.
5.  **Offline Storage:** Enhance `OfflineMode.jsx` to use native filesystem storage for downloaded content.

---

# Phase 2 — AI Tutors (Conversational Learning)
## Objective
Implement a real-time, context-aware AI tutor that can answer questions based on the specific course material.

## Tasks
1.  **Vector Database:** Set up a vector database (e.g., Pinecone) to index course content.
2.  **RAG Pipeline:** Build a Retrieval-Augmented Generation pipeline to fetch relevant content context.
3.  **Chat Interface:** Create a dedicated AI Chat UI (floating widget or dedicated page).
4.  **Context Awareness:** Ensure the AI knows which lesson/course the student is currently viewing.

---

# Phase 3 — VR/AR (Virtual Beit Midrash)
## Objective
Create an immersive 3D environment for communal study and events.

## Tasks
1.  **3D Environment:** Build a basic 3D room using Three.js / React Three Fiber.
2.  **Avatars:** Implement simple user avatars with movement.
3.  **Voice Chat:** Integrate spatial audio (e.g., Agora or LiveKit).
4.  **Shared Media:** Allow projecting lesson videos onto a virtual screen in the room.

---

# Execution Order
1.  **Mobile Native** (High utility/demand)
2.  **AI Tutors** (High engagement)
3.  **VR/AR** (Experimental/Wow factor)
