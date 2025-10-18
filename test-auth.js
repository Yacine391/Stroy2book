// Script de test rapide pour l'authentification
// Exécutez avec : node test-auth.js

const API_BASE = 'http://localhost:3001';

async function testAuth() {
  console.log('🧪 Test du système d\'authentification\n');

  // Générer un email unique
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'Test123456';
  const testName = 'Test User';

  console.log('📧 Email de test:', testEmail);
  console.log('🔑 Mot de passe:', testPassword);
  console.log('');

  try {
    // Test 1: Inscription
    console.log('1️⃣  Test d\'inscription...');
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName
      })
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Inscription réussie!');
      console.log('   - ID utilisateur:', registerData.user.id);
      console.log('   - Nom:', registerData.user.name);
      console.log('   - Email:', registerData.user.email);
    } else {
      const error = await registerResponse.json();
      console.log('❌ Erreur inscription:', error.error);
      return;
    }

    // Récupérer le cookie de session
    const cookies = registerResponse.headers.get('set-cookie');
    console.log('   - Cookie de session créé:', cookies ? '✅' : '❌');
    console.log('');

    // Test 2: Vérification de la session
    console.log('2️⃣  Test de vérification de session...');
    const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Session valide!');
      console.log('   - Utilisateur:', meData.user.name);
      console.log('   - Plan:', meData.subscription.plan);
      console.log('   - Limite ebooks:', meData.subscription.monthly_ebooks);
    } else {
      console.log('❌ Erreur de session');
    }
    console.log('');

    // Test 3: Déconnexion
    console.log('3️⃣  Test de déconnexion...');
    const logoutResponse = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (logoutResponse.ok) {
      console.log('✅ Déconnexion réussie!');
    } else {
      console.log('❌ Erreur de déconnexion');
    }
    console.log('');

    // Test 4: Reconnexion
    console.log('4️⃣  Test de reconnexion...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Connexion réussie!');
      console.log('   - Utilisateur:', loginData.user.name);
    } else {
      const error = await loginResponse.json();
      console.log('❌ Erreur connexion:', error.error);
    }
    console.log('');

    console.log('🎉 Tous les tests sont terminés!\n');
    console.log('📝 Note: Vérifiez que le serveur Next.js est démarré (npm run dev)');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('\n⚠️  Assurez-vous que le serveur est démarré avec "npm run dev"');
  }
}

// Vérifier que fetch est disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Ce script nécessite Node.js 18 ou supérieur');
  console.log('   Votre version:', process.version);
  process.exit(1);
}

testAuth();
