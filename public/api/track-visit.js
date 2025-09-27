/**
 * Endpoint API pour recevoir les données de tracking du site NetScolaire
 * Ce fichier doit être déployé sur votre serveur Netlify
 */

// Fonction pour gérer les requêtes CORS
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  return headers;
}

// Fonction pour stocker les données de tracking
async function storeTrackingData(data) {
  try {
    // Ici vous pouvez stocker les données dans une base de données
    // Pour l'instant, on les log simplement
    console.log('📊 Données de tracking reçues:', JSON.stringify(data, null, 2));
    
    // Vous pouvez ajouter ici l'intégration avec votre base de données
    // Par exemple, avec Supabase, Firebase, ou une API externe
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors du stockage des données:', error);
    return { success: false, error: error.message };
  }
}

// Fonction principale du handler
exports.handler = async (event) => {
  const headers = handleCORS(event);

  try {
    // Vérifier la méthode HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Méthode non autorisée' })
      };
    }

    // Parser les données JSON
    const trackingData = JSON.parse(event.body);

    // Valider les données requises
    if (!trackingData.visitorId || !trackingData.sessionId || !trackingData.siteId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Données de tracking incomplètes' })
      };
    }

    // Ajouter des métadonnées
    const enrichedData = {
      ...trackingData,
      receivedAt: new Date().toISOString(),
      ipAddress: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
      userAgent: event.headers['user-agent'] || 'unknown'
    };

    // Stocker les données
    const result = await storeTrackingData(enrichedData);

    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Données de tracking enregistrées avec succès',
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: result.error || 'Erreur lors de l\'enregistrement'
        })
      };
    }

  } catch (error) {
    console.error('Erreur dans le handler de tracking:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Erreur interne du serveur',
        details: error.message
      })
    };
  }
};