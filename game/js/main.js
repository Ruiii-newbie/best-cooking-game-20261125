// Sizzle & Serve — boot, frame loop and input wiring.
// A screenshot query (?shot=start|play|serve) renders one fixed scene and
// stops: the shot is a real frame of the game's own render code, frozen.

(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  function canvasPos(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
    return { x: x, y: y };
  }

  canvas.addEventListener('mousemove', function (ev) {
    Game.mouse = canvasPos(ev);
  });

  canvas.addEventListener('click', function (ev) {
    const p = canvasPos(ev);
    handleClick(p.x, p.y);
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === ' ' || ev.key === 'Enter') ev.preventDefault();
    handleKey(ev.key);
  });

  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    demoState(shot);
    render(ctx);
    return;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    update(dt);
    render(ctx);
    requestAnimationFrame(frame);
  }
  render(ctx);
  requestAnimationFrame(frame);
})();
