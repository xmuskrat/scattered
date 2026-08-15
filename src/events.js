export function radarEvent(type, detail) {
  return new CustomEvent(type, { detail, bubbles: true, composed: true });
}
