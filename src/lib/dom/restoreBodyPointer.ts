export function restoreBodyPointer(): void {
  const prev = document.body.style.pointerEvents;
  if (prev) {
    document.body.style.removeProperty("pointer-events");
  }
}
