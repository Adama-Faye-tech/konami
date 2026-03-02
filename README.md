# KONAMI ID - Plateforme d'Authentification

Une plateforme d'inscription et de connexion sécurisée avec authentification par CAPTCHA.

## 🚀 Fonctionnalités

✅ Inscription avec email + mot de passe + CAPTCHA
✅ Connexion sécurisée
✅ Base de données JSON pour les utilisateurs
✅ Sessions serveur
✅ Interface responsive (Mobile + Desktop)
✅ Admin panel pour voir les utilisateurs

## 📋 Prérequis

- Node.js 14+
- npm ou yarn

## 🔧 Installation

```bash
# Cloner le projet
git clone https://github.com/YOUR_USERNAME/konami.git
cd konami

# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

Le serveur sera disponible sur `http://localhost:3000`

## 📱 Pages disponibles

- **Page d'accueil** : `http://localhost:3000/`
- **Inscription** : `http://localhost:3000/page1.html`
- **Connexion** : `http://localhost:3000/login.html`
- **Admin** : `http://localhost:3000/admin.html`

## 🎯 Flux d'utilisation

1. Utilisateur entre son email → clique "Sign in"
2. Utilisateur entre son mot de passe
3. Utilisateur sélectionne le CAPTCHA (image 3)
4. ✅ Inscrit en base de données → Redirection page 1

## 📊 Base de données

Les utilisateurs sont stockés dans `users_database.json`

Structure :
```json
{
  "users": [
    {
      "id": 1234567890,
      "email": "user@example.com",
      "password": "password123",
      "registeredAt": "2026-03-02T17:00:00.000Z"
    }
  ]
}
```

## 🛠️ API Endpoints

- `POST /api/check-email` - Enregistrer un email en session
- `POST /api/register` - Enregistrer un nouvel utilisateur
- `POST /api/login-verify` - Vérifier les identifiants
- `GET /api/session` - Récupérer l'email de la session
- `GET /api/users` - Lister tous les utilisateurs (Admin)

## 📞 Support

Pour toute question ou bug, créez une issue sur GitHub.

---

**Créateur**: Votre Nom  
**Date**: Mars 2026
