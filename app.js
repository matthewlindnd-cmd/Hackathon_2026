const routes = [
  { id: '11', name: 'Route 11', type: 'bus' },
  { id: '13', name: 'Route 13', type: 'bus' },
  { id: '14', name: 'Route 14', type: 'bus' },
  { id: '21', name: 'Route 21', type: 'bus' },
  { id: '23', name: 'Route 23', type: 'bus' },
  { id: '443', name: 'Route 443', type: 'bus' },
  { id: '311', name: 'Route 311', type: 'bus' },
  { id: '324', name: 'Route 324', type: 'bus' },
  { id: '325', name: 'Route 325', type: 'bus' },
  { id: '333', name: 'Route 333', type: 'bus' },
  { id: '343', name: 'Route 343', type: 'bus' },
  { id: '396', name: 'Route 396', type: 'bus' },
  { id: '120', name: 'Route 120', type: 'bus' },
  { id: '500X', name: 'Route 500X', type: 'bus' },
  { id: '506', name: 'Route 506', type: 'bus' },
  { id: '100', name: 'Route 100', type: 'bus' },
  { id: '607X', name: 'Route 607X', type: 'bus' },
  { id: '610X', name: 'Route 610X', type: 'bus' },
  { id: '389', name: 'Route 389', type: 'bus' },
  { id: '412', name: 'Route 412', type: 'bus' },
  { id: '423', name: 'Route 423', type: 'bus' },
  { id: '426', name: 'Route 426', type: 'bus' },
  { id: '428', name: 'Route 428', type: 'bus' },
  { id: '431', name: 'Route 431', type: 'bus' },
  { id: '438X', name: 'Route 438X', type: 'bus' },
  { id: '470', name: 'Route 470', type: 'bus' },
  { id: '441', name: 'Route 441', type: 'bus' },
  { id: '437', name: 'Route 437', type: 'bus' },
  { id: '442', name: 'Route 442', type: 'bus' },
  { id: '504', name: 'Route 504', type: 'bus' },
  { id: '546', name: 'Route 546', type: 'bus' },
  { id: '549', name: 'Route 549', type: 'bus' },
  { id: '550', name: 'Route 550', type: 'bus' },
  { id: '600', name: 'Route 600', type: 'bus' },
  { id: '601', name: 'Route 601', type: 'bus' },
  { id: '606', name: 'Route 606', type: 'bus' },
  { id: '339', name: 'Route 339', type: 'bus' },
  { id: '373', name: 'Route 373', type: 'bus' },
  { id: '380', name: 'Route 380', type: 'bus' },
  { id: '374', name: 'Route 374', type: 'bus' },
  { id: '313', name: 'Route 313', type: 'bus' },
  { id: '370', name: 'Route 370', type: 'bus' },
  { id: '350', name: 'Route 350', type: 'bus' },
];

const API_URL = 'http://localhost:3000/api/alerts';

const dom = {
  transportType: document.getElementById('transportType'),
  routeSelect: document.getElementById('routeSelect'),
  checkBtn: document.getElementById('checkBtn'),
  showAllBtn: document.getElementById('showAllBtn'),
  emptyState: document.getElementById('emptyState'),
  resultCard: document.getElementById('resultCard'),
  routeTitle: document.getElementById('routeTitle'),
  statusBadge: document.getElementById('statusBadge'),
  alertCount: document.getElementById('alertCount'),
  recommendation: document.getElementById('recommendation'),
  alertList: document.getElementById('alertList'),
  allAlerts: document.getElementById('allAlerts'),
};

let alerts = [];

async function loadAlerts() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rawData = await response.json();
    alerts = convertApiData(rawData);

    console.log('Converted alerts:', alerts);
    renderAllAlerts(alerts);
  } catch (error) {
    console.error('Failed to load alerts:', error);
    alerts = [];
    renderAllAlerts([]);
  }
}

function convertApiData(data) {
  if (!data.entity) return [];

  return data.entity
    .filter(item => item.alert)
    .flatMap(item => {
      const alert = item.alert;

      const title =
        alert.headerText?.translation?.find(t => t.language === 'en')?.text ||
        alert.headerText?.translation?.[0]?.text ||
        'Service Alert';

      const description =
        alert.descriptionText?.translation?.find(t => t.language === 'en')?.text ||
        alert.descriptionText?.translation?.[0]?.text ||
        'No details available.';

      const severity =
        alert.effect === 'DETOUR' || alert.effect === 'MODIFIED_SERVICE'
          ? 'major'
          : 'minor';

      const mode = 'bus';

      const routeIds = [...new Set(
        (alert.informedEntity || [])
          .map(entity => cleanRouteId(entity.routeId))
          .filter(Boolean)
      )];

      return routeIds.map(routeId => ({
        routeId,
        title,
        severity,
        description,
        mode
      }));
    });
}

function cleanRouteId(routeId) {
  if (!routeId) return '';

  const parts = routeId.split('_');
  let shortId = parts[parts.length - 1];

  shortId = shortId.replace(/-.*$/i, '');
  shortId = shortId.trim().toUpperCase();

  return shortId;
}

function populateRoutes(filterType = 'all') {
  const filtered = filterType === 'all'
    ? routes
    : routes.filter(route => route.type === filterType);

  dom.routeSelect.innerHTML = `
    <option value="">Select a route</option>
    ${filtered.map(route => `<option value="${route.id}">${route.name}</option>`).join('')}
  `;
}

function getSeverityLevel(routeAlerts) {
  if (routeAlerts.some(a => a.severity === 'major')) return 'major';
  if (routeAlerts.some(a => a.severity === 'minor')) return 'minor';
  return 'none';
}

function getStatusCopy(severity) {
  if (severity === 'major') {
    return {
      badgeText: 'Major disruption',
      badgeClass: 'red',
      recommendation: 'Major disruption on this route. Consider leaving earlier or using another service.'
    };
  }

  if (severity === 'minor') {
    return {
      badgeText: 'Some delays reported',
      badgeClass: 'orange',
      recommendation: 'Some disruption reported. Leave a little earlier and expect possible delays.'
    };
  }

  return {
    badgeText: 'Looks normal',
    badgeClass: 'green',
    recommendation: 'No major disruption reported for this route right now.'
  };
}

function alertCard(alert) {
  return `
    <article class="alert-item">
      <div class="alert-top">
        <h4>${alert.title}</h4>
        <span class="badge ${alert.severity === 'major' ? 'red' : alert.severity === 'minor' ? 'orange' : 'green'}">
          ${capitalize(alert.severity)}
        </span>
      </div>
      <div class="alert-meta">${alert.mode.toUpperCase()} • Route ${alert.routeId}</div>
      <p>${alert.description}</p>
    </article>
  `;
}

function checkRoute() {
  const selectedId = String(dom.routeSelect.value).trim().toUpperCase();
  if (!selectedId) return;

  const selectedRoute = routes.find(
    route => String(route.id).trim().toUpperCase() === selectedId
  );

  const matchingAlerts = alerts.filter(
    alert => String(alert.routeId).trim().toUpperCase() === selectedId
  );

  console.log('Selected route:', selectedId);
  console.log('Matching alerts:', matchingAlerts);

  const severity = getSeverityLevel(matchingAlerts);
  const copy = getStatusCopy(severity);

  dom.emptyState.classList.add('hidden');
  dom.resultCard.classList.remove('hidden');
  dom.routeTitle.textContent = selectedRoute ? selectedRoute.name : selectedId;
  dom.alertCount.textContent = matchingAlerts.length;
  dom.recommendation.textContent = copy.recommendation;
  dom.statusBadge.textContent = copy.badgeText;
  dom.statusBadge.className = `badge ${copy.badgeClass}`;

  dom.alertList.innerHTML = matchingAlerts.length
    ? matchingAlerts.map(alertCard).join('')
    : '<p class="no-alerts">No active alerts found for this route.</p>';
}

function renderAllAlerts(alertItems) {
  dom.allAlerts.innerHTML = alertItems.length
    ? alertItems.map(alertCard).join('')
    : '<p class="no-alerts">No alerts available.</p>';
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function init() {
  populateRoutes();
  loadAlerts();

  dom.transportType.addEventListener('change', (event) => {
    populateRoutes(event.target.value);
  });

  dom.checkBtn.addEventListener('click', checkRoute);
  dom.showAllBtn.addEventListener('click', () => {
    document.querySelector('.all-alerts-panel').scrollIntoView({ behavior: 'smooth' });
  });
}

init();