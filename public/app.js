const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');

const navEndpoints = document.getElementById('nav-endpoints');
const navLogs = document.getElementById('nav-logs');
const viewEndpoints = document.getElementById('view-endpoints');
const viewLogs = document.getElementById('view-logs');
const btnLogout = document.getElementById('btn-logout');

const endpointsList = document.getElementById('endpoints-list');
const addEndpointForm = document.getElementById('add-endpoint-form');
const btnTriggerPing = document.getElementById('btn-trigger-ping');

const logsList = document.getElementById('logs-list');
const btnRefreshLogs = document.getElementById('btn-refresh-logs');

// Check Auth on load
checkAuth();

async function checkAuth() {
  // Try fetching endpoints to see if we're authenticated
  const res = await fetch('/api/endpoints');
  if (res.ok) {
    showDashboard();
    loadEndpoints();
  } else {
    showAuth();
  }
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    showDashboard();
    loadEndpoints();
  } else {
    const data = await res.json();
    authError.textContent = data.error || 'Login failed';
  }
});

// Logout (just clear cookie and reload)
btnLogout.addEventListener('click', () => {
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.reload();
});

// Navigation
navEndpoints.addEventListener('click', () => {
  navEndpoints.classList.add('active');
  navLogs.classList.remove('active');
  viewEndpoints.classList.add('active');
  viewEndpoints.classList.remove('hidden');
  viewLogs.classList.remove('active');
  viewLogs.classList.add('hidden');
  loadEndpoints();
});

navLogs.addEventListener('click', () => {
  navLogs.classList.add('active');
  navEndpoints.classList.remove('active');
  viewLogs.classList.add('active');
  viewLogs.classList.remove('hidden');
  viewEndpoints.classList.remove('active');
  viewEndpoints.classList.add('hidden');
  loadLogs();
});

btnRefreshLogs.addEventListener('click', loadLogs);

// Endpoints Management
async function loadEndpoints() {
  const res = await fetch('/api/endpoints');
  if (!res.ok) return;
  const endpoints = await res.json();
  
  endpointsList.innerHTML = endpoints.map(ep => `
    <tr>
      <td>${ep.url}</td>
      <td>${ep.headers?.Authorization ? '🔑 Bearer set' : 'None'}</td>
      <td>${new Date(ep.createdAt).toLocaleString()}</td>
      <td>
        <button class="secondary" onclick="deleteEndpoint('${ep._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

addEndpointForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('new-url').value;
  const auth = document.getElementById('new-auth').value;

  const headers = {};
  if (auth) headers.Authorization = auth;

  const res = await fetch('/api/endpoints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, headers })
  });

  if (res.ok) {
    document.getElementById('new-url').value = '';
    document.getElementById('new-auth').value = '';
    loadEndpoints();
  } else {
    alert('Failed to add endpoint');
  }
});

window.deleteEndpoint = async (id) => {
  if (!confirm('Are you sure you want to delete this endpoint?')) return;
  const res = await fetch(`/api/endpoints?id=${id}`, { method: 'DELETE' });
  if (res.ok) {
    loadEndpoints();
  }
};

btnTriggerPing.addEventListener('click', async () => {
  btnTriggerPing.textContent = 'Pinging...';
  btnTriggerPing.disabled = true;
  
  const res = await fetch('/api/ping', { method: 'POST' });
  
  btnTriggerPing.textContent = 'Trigger Ping Now';
  btnTriggerPing.disabled = false;

  if (res.ok) {
    alert('Pings executed successfully!');
  } else {
    alert('Pings executed, but some failed. Check logs.');
  }
});

// Logs Management
async function loadLogs() {
  const res = await fetch('/api/logs');
  if (!res.ok) return;
  const logs = await res.json();
  
  logsList.innerHTML = logs.map(log => `
    <tr>
      <td><span class="status-badge ${log.status}">${log.status}</span></td>
      <td>${log.url}</td>
      <td>${log.responseTime || '-'} ms</td>
      <td>${log.statusCode || log.message || '-'}</td>
      <td>${new Date(log.timestamp).toLocaleString()}</td>
    </tr>
  `).join('');
}

// Utils
function showAuth() {
  authScreen.classList.add('active');
  authScreen.classList.remove('hidden');
  dashboardScreen.classList.remove('active');
  dashboardScreen.classList.add('hidden');
}

function showDashboard() {
  authScreen.classList.remove('active');
  authScreen.classList.add('hidden');
  dashboardScreen.classList.add('active');
  dashboardScreen.classList.remove('hidden');
}
