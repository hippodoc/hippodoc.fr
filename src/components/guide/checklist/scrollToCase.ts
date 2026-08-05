export function scrollToCase(code: string) {
  const el = document.getElementById(`case-${code}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('ring-2', 'ring-hippo-400', 'ring-offset-2');
  setTimeout(() => el.classList.remove('ring-2', 'ring-hippo-400', 'ring-offset-2'), 2500);
}
