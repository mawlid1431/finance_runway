// Page actions Malitos can perform on elements marked data-avatar-target.

function findTarget(target: string) {
  return document.querySelector<HTMLElement>(
    `[data-avatar-target="${CSS.escape(target)}"]`,
  );
}

function isVisible(element: HTMLElement) {
  return element.getClientRects().length > 0;
}

export function scrollToTarget(target: string) {
  const element = findTarget(target);
  if (!element || !isVisible(element)) return `Target ${target} is not on this page.`;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  return "ok";
}

export function highlightTarget(target: string, durationMs = 3000) {
  const element = findTarget(target);
  if (!element || !isVisible(element)) return `Target ${target} is not on this page.`;
  // Styled by [data-avatar-highlighted] in app/globals.css.
  const token = String(Date.now());
  element.dataset.avatarHighlighted = token;
  window.setTimeout(() => {
    if (element.dataset.avatarHighlighted === token) {
      delete element.dataset.avatarHighlighted;
    }
  }, durationMs);
  return "ok";
}

export function clickTarget(target: string) {
  const element = findTarget(target);
  if (!element || !isVisible(element)) return `Target ${target} is not on this page.`;
  if (element.matches(":disabled")) return `Target ${target} is disabled.`;
  element.click();
  return "ok";
}
