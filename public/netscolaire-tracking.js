/**
 * Script de tracking pour le site NetScolaire
 * À intégrer dans votre site web pour comptabiliser les visites
 */

(function() {
  'use strict';

  // Configuration
  const TRACKING_ENDPOINT = 'https://votre-appamine.netlify.app/api/track-visit';
  const SITE_ID = 'netscolaire';
  const STORAGE_KEY = 'netscolaire_visitor_id';
  const SESSION_KEY = 'netscolaire_session_id';

  // Générer un ID unique pour le visiteur
  function generateVisitorId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Générer un ID de session
  function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Obtenir ou créer un ID de visiteur
  function getVisitorId() {
    let visitorId = localStorage.getItem(STORAGE_KEY);
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem(STORAGE_KEY, visitorId);
    }
    return visitorId;
  }

  // Obtenir ou créer un ID de session
  function getSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  // Collecter les informations du visiteur
  function collectVisitorData() {
    return {
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      siteId: SITE_ID,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: screen.width + 'x' + screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      pageTitle: document.title,
      // Informations de performance
      loadTime: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : null,
      // Informations de géolocalisation (si disponible)
      country: null, // À remplir si vous avez accès à l'IP
      city: null
    };
  }

  // Envoyer les données de tracking
  function sendTrackingData(data) {
    // Essayer d'envoyer via fetch si disponible
    if (typeof fetch !== 'undefined') {
      fetch(TRACKING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).catch(error => {
        console.warn('Erreur lors de l\'envoi des données de tracking:', error);
        // Fallback: stocker localement
        storeLocally(data);
      });
    } else {
      // Fallback pour les navigateurs plus anciens
      storeLocally(data);
    }
  }

  // Stocker les données localement en cas d'échec d'envoi
  function storeLocally(data) {
    try {
      const storedData = JSON.parse(localStorage.getItem('netscolaire_pending_data') || '[]');
      storedData.push(data);
      // Garder seulement les 100 dernières entrées
      if (storedData.length > 100) {
        storedData.splice(0, storedData.length - 100);
      }
      localStorage.setItem('netscolaire_pending_data', JSON.stringify(storedData));
    } catch (error) {
      console.warn('Impossible de stocker les données localement:', error);
    }
  }

  // Tracker une visite de page
  function trackPageView() {
    const data = collectVisitorData();
    data.eventType = 'page_view';
    sendTrackingData(data);
  }

  // Tracker un clic sur un élément
  function trackClick(element, eventName) {
    const data = collectVisitorData();
    data.eventType = 'click';
    data.eventName = eventName;
    data.elementId = element.id;
    data.elementClass = element.className;
    data.elementText = element.textContent ? element.textContent.substring(0, 100) : '';
    sendTrackingData(data);
  }

  // Tracker le temps passé sur la page
  function trackTimeOnPage() {
    const startTime = Date.now();
    
    // Tracker quand l'utilisateur quitte la page
    window.addEventListener('beforeunload', function() {
      const timeSpent = Math.round((Date.now() - startTime) / 1000); // en secondes
      if (timeSpent > 5) { // Seulement si plus de 5 secondes
        const data = collectVisitorData();
        data.eventType = 'time_on_page';
        data.timeSpent = timeSpent;
        sendTrackingData(data);
      }
    });

    // Tracker le scroll
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Tracker à 25%, 50%, 75%, 100%
          const data = collectVisitorData();
          data.eventType = 'scroll';
          data.scrollPercent = maxScroll;
          sendTrackingData(data);
        }
      }
    });
  }

  // Initialiser le tracking
  function initTracking() {
    // Tracker la visite initiale
    trackPageView();
    
    // Tracker le temps passé sur la page
    trackTimeOnPage();
    
    // Tracker les clics sur les liens importants
    document.addEventListener('click', function(event) {
      const target = event.target;
      
      // Tracker les clics sur les liens
      if (target.tagName === 'A') {
        trackClick(target, 'link_click');
      }
      
      // Tracker les clics sur les boutons
      if (target.tagName === 'BUTTON' || target.classList.contains('btn')) {
        trackClick(target, 'button_click');
      }
      
      // Tracker les clics sur les images
      if (target.tagName === 'IMG') {
        trackClick(target, 'image_click');
      }
    });

    // Tracker les changements de page (pour les SPA)
    let currentUrl = window.location.href;
    setInterval(function() {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        trackPageView();
      }
    }, 1000);
  }

  // Fonction pour envoyer les données en attente
  function sendPendingData() {
    try {
      const pendingData = JSON.parse(localStorage.getItem('netscolaire_pending_data') || '[]');
      if (pendingData.length > 0) {
        pendingData.forEach(data => {
          sendTrackingData(data);
        });
        localStorage.removeItem('netscolaire_pending_data');
      }
    } catch (error) {
      console.warn('Erreur lors de l\'envoi des données en attente:', error);
    }
  }

  // Fonction publique pour tracker des événements personnalisés
  window.trackNetScolaireEvent = function(eventName, eventData) {
    const data = collectVisitorData();
    data.eventType = 'custom_event';
    data.eventName = eventName;
    data.eventData = eventData;
    sendTrackingData(data);
  };

  // Fonction publique pour obtenir les statistiques du visiteur
  window.getNetScolaireStats = function() {
    return {
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      visitCount: parseInt(localStorage.getItem('netscolaire_visit_count') || '0'),
      firstVisit: localStorage.getItem('netscolaire_first_visit') || new Date().toISOString(),
      lastVisit: localStorage.getItem('netscolaire_last_visit') || new Date().toISOString()
    };
  };

  // Initialiser le compteur de visites
  function initVisitCounter() {
    const visitCount = parseInt(localStorage.getItem('netscolaire_visit_count') || '0') + 1;
    localStorage.setItem('netscolaire_visit_count', visitCount.toString());
    localStorage.setItem('netscolaire_last_visit', new Date().toISOString());
    
    if (!localStorage.getItem('netscolaire_first_visit')) {
      localStorage.setItem('netscolaire_first_visit', new Date().toISOString());
    }
  }

  // Démarrer le tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initVisitCounter();
      initTracking();
      sendPendingData();
    });
  } else {
    initVisitCounter();
    initTracking();
    sendPendingData();
  }

  // Envoyer les données en attente périodiquement
  setInterval(sendPendingData, 30000); // Toutes les 30 secondes

  console.log('📊 NetScolaire Tracking initialisé');
})();