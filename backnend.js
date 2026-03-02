const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Fichier de base de données
const DB_FILE = path.join(__dirname, 'users_database.json');

// Initialiser la base de données
function initDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    }
}

// Lire la base de données
function readDatabase() {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Écrire dans la base de données
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

initDatabase();

// Variable pour stocker la session utilisateur actuelle
let currentSession = null;

// Configuration du CAPTCHA
const CORRECT_CAPTCHA_IDS = ["3"];

// Endpoint pour la racine - rediriger vers page1
app.get('/', (req, res) => {
    res.redirect('/page1.html');
});

// Endpoint pour enregistrer/vérifier l'email (première page)
app.post('/api/check-email', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: "Email requis." });
    }

    console.log(`✓ Email stocké en session : ${email}`);
    currentSession = { email: email };
    
    res.status(200).json({ success: true, message: "Email validé" });
});

// Endpoint pour récupérer l'email de la session actuelle
app.get('/api/session', (req, res) => {
    if (!currentSession || !currentSession.email) {
        return res.status(401).json({ success: false, message: "Aucune session active" });
    }
    
    res.json({ success: true, email: currentSession.email });
});

// Endpoint pour enregistrer l'utilisateur avec son mot de passe (deuxième page)
app.post('/api/register', (req, res) => {
    const { password, captcha } = req.body;
    const email = currentSession ? currentSession.email : null;

    if (!email) {
        return res.status(401).json({ success: false, message: "Session expirée. Veuillez recommencer." });
    }

    console.log(`\n=== ENREGISTREMENT ===`);
    console.log(`Email : ${email}`);
    console.log(`CAPTCHA reçu : ${JSON.stringify(captcha)}`);
    console.log(`CAPTCHA attendu : ${JSON.stringify(CORRECT_CAPTCHA_IDS)}`);

    // Vérifier le CAPTCHA
    const isCaptchaValid = captcha.length === CORRECT_CAPTCHA_IDS.length && 
                          captcha.every(id => CORRECT_CAPTCHA_IDS.includes(id));

    console.log(`Validation CAPTCHA : ${isCaptchaValid}`);

    if (!isCaptchaValid) {
        console.log(`✗ CAPTCHA invalide!`);
        return res.status(400).json({ success: false, message: "Échec de la validation CAPTCHA." });
    }

    // Lire la base de données
    const db = readDatabase();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ success: false, message: "Cet email est déjà enregistré." });
    }

    // Ajouter le nouvel utilisateur
    const newUser = {
        id: Date.now(),
        email: email,
        password: password,
        registeredAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDatabase(db);

    // Effacer la session après inscription
    currentSession = null;

    console.log(`✓ Utilisateur enregistré : ${email}\n`);
    res.status(201).json({ 
        success: true, 
        message: "Inscription réussie !",
        token: "fake-jwt-token-" + Date.now()
    });
});

// Endpoint pour connexion (alternative)
app.post('/api/login', (req, res) => {
    const { email, password, captcha } = req.body;

    console.log(`Tentative de connexion : ${email}`);

    // Vérifier le CAPTCHA
    const isCaptchaValid = captcha.length === CORRECT_CAPTCHA_IDS.length && 
                          captcha.every(id => CORRECT_CAPTCHA_IDS.includes(id));

    if (!isCaptchaValid) {
        return res.status(400).json({ success: false, message: "Échec de la validation CAPTCHA." });
    }

    // Lire la base de données
    const db = readDatabase();

    // Trouver l'utilisateur
    const user = db.users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Vérifier le mot de passe
    if (user.password !== password) {
        return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
    }

    res.status(200).json({ 
        success: true, 
        message: "Connexion réussie !",
        token: "fake-jwt-token-" + Date.now(),
        user: {
            id: user.id,
            email: user.email
        }
    });
});

// Endpoint pour vérifier la connexion (sans CAPTCHA) - pour la page login
app.post('/api/login-verify', (req, res) => {
    const { email, password } = req.body;

    console.log(`Vérification de connexion : ${email}`);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
    }

    // Lire la base de données
    const db = readDatabase();

    // Trouver l'utilisateur
    const user = db.users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Vérifier le mot de passe
    if (user.password !== password) {
        return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
    }

    console.log(`✓ Connexion réussie : ${email}`);
    res.status(200).json({ 
        success: true, 
        message: "Connexion réussie !",
        token: "fake-jwt-token-" + Date.now(),
        user: {
            id: user.id,
            email: user.email
        }
    });
});

// Endpoint pour voir tous les utilisateurs enregistrés (admin)
app.get('/api/users', (req, res) => {
    const db = readDatabase();
    res.json(db.users);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';
    
    for (const name of Object.keys(networkInterfaces)) {
        for (const iface of networkInterfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
    }
    
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  Le serveur Konami est actif            ║`);
    console.log(`╠════════════════════════════════════════╣`);
    console.log(`║  Accès local : http://localhost:${PORT}        ║`);
    console.log(`║  Réseau local: http://${localIP}:${PORT}    ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
});
