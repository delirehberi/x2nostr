import { icons } from './icons';

export function showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', durationMs = 4000): void {
  const container = document.getElementById('toast-root');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl glass-card shadow-xl border text-sm font-medium transition-all transform translate-y-2 opacity-0 max-w-md ${
    type === 'success'
      ? 'border-emerald-200 text-emerald-900 bg-emerald-50/95'
      : type === 'error'
      ? 'border-red-200 text-red-900 bg-red-50/95'
      : type === 'warning'
      ? 'border-amber-200 text-amber-900 bg-amber-50/95'
      : 'border-purple-200 text-purple-900 bg-purple-50/95'
  }`;

  const iconSvg =
    type === 'success'
      ? `<span class="text-emerald-600">${icons.checkCircle}</span>`
      : type === 'error'
      ? `<span class="text-red-600">${icons.alertCircle}</span>`
      : type === 'warning'
      ? `<span class="text-amber-600">${icons.alertCircle}</span>`
      : `<span class="text-purple-600">${icons.zap}</span>`;

  toast.innerHTML = `
    <span class="shrink-0 flex items-center">${iconSvg}</span>
    <span class="grow leading-tight">${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, durationMs);
}
