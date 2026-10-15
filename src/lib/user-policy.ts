export type AccountRole = 'admin' | 'colaborador';

export function suggestLogin(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9\s._-]/g, '').replace(/\s+/g, '.').slice(0, 32);
}

export function passwordError(password: string, role: AccountRole, login: string) {
  if (password.length < (role === 'admin' ? 10 : 6)) return `A senha deve ter pelo menos ${role === 'admin' ? 10 : 6} caracteres.`;
  if (role === 'admin' && ['123456', '000000', 'senha', login.toLowerCase()].includes(password.toLowerCase())) return 'Escolha uma senha de administrador que não seja trivial nem igual ao login.';
  return null;
}