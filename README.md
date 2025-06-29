#  Summarix - News Reader App

**Summarix** is a modern, intelligent news app built with **React Native** and **Django REST Framework**. It brings together a beautiful mobile experience with server-side NLP-powered article summarization, daily engagement tracking, and a personalized news feed.

##  Features

### Frontend (React Native)

-  **Top Headlines** by category (e.g., Business, Tech, Sports, etc.)
-  **Live Search** for articles
-  **Daily Check-In** with streak tracking
-  **Favorites** screen to save and revisit liked articles
-  **Dark Mode** with one-tap toggle

### Backend (Django)

-  User registration, login, JWT-based auth
-  **Real-time article summarization** using NLP
-  Daily check-in logic with streak memory
-  Commenting & likes per article
-  Fetch and store user's liked (favorited) news

##  NLP 

Summarix uses **Latent Semantic Analysis (LSA)** to generate intelligent news summaries. Here's how it works:

- Articles are parsed and extracted using newspaper3k
- The article body is summarized using sumy, which tokenizes and applies LSA

These are then presented on the client with a smooth and elegant interface.

##  Author

Made with ❤️ by Bala Subramanian S


