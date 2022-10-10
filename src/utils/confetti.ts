import confetti from "canvas-confetti";

export const throwParty = (options?: confetti.Options) => {
  confetti({
    startVelocity: 80,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 1 },
    zIndex: 5000000,
    ...options,
  });
  confetti({
    startVelocity: 80,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 1 },
    zIndex: 5000000,
    ...options,
  });
};
