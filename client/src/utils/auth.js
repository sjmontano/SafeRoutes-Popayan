const USERS = [
  {
    username: 'admin',
    password: 'admin',
    name: 'Administrador',
    avatar: 'https://i.pravatar.cc/150?u=admin',
    role: 'admin',
  },
  {
    username: 'santiago',
    password: 'santiago123',
    name: 'Santiago',
    avatar: 'https://i.pravatar.cc/150?u=santiago',
    role: 'user',
  },
  {
    username: 'sotelo',
    password: 'sotelo123',
    name: 'Sotelo',
    avatar: 'https://i.pravatar.cc/150?u=sotelo',
    role: 'user',
  },
  {
    username: 'luisa',
    password: 'luisa123',
    name: 'Luisa',
    avatar: 'https://i.pravatar.cc/150?u=luisa',
    role: 'user',
  },
];

export function loginUser(username, password) {
  const user = USERS.find((u) => u.username === username && u.password === password);
  if (user) {
    const session = { ...user, password: undefined, loggedAt: Date.now() };
    localStorage.setItem('sr_session', JSON.stringify(session));
    return session;
  }
  return null;
}

export function logoutUser() {
  localStorage.removeItem('sr_session');
}

export function getSession() {
  try {
    const raw = localStorage.getItem('sr_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getSession();
}
