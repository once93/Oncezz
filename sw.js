// Once — ayudante mínimo para la app instalada (service worker).
// No guarda la página ni ningún dato: todo se sigue pidiendo a internet, igual que siempre.
// Hace una sola cosa: si no hay conexión al abrir o recargar Once, muestra una pantalla
// «Sin conexión» con un botón para reintentar, en vez de un error del navegador.

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#F2F2F7">
<title>Once — Sin conexión</title>
<style>
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ height:100%; }
  body{ background:#F2F2F7; color:#1C1C1E; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,system-ui,sans-serif;
        display:flex; align-items:center; justify-content:center; padding:24px; -webkit-text-size-adjust:100%; }
  main{ background:#FFFFFF; border-radius:20px; padding:36px 28px; max-width:380px; width:100%; text-align:center;
        box-shadow:0 2px 4px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08); }
  .marca{ font-family:Georgia,'Iowan Old Style','Palatino Linotype',serif; font-size:34px; letter-spacing:-0.02em; }
  h1{ font-family:Georgia,'Iowan Old Style','Palatino Linotype',serif; font-weight:500; font-size:22px; margin:18px 0 8px; }
  p{ font-size:15.5px; line-height:1.55; color:#6E6E73; }
  button{ margin-top:22px; width:100%; border:0; border-radius:14px; padding:14px 18px; font-family:inherit; font-size:16px; font-weight:600;
          background:#007AFF; color:#FFFFFF; cursor:pointer; }
  button:active{ opacity:.85; }
  .estado{ margin-top:12px; font-size:13.5px; min-height:1.4em; }
</style>
</head>
<body>
<main>
  <div class="marca">Once</div>
  <h1>Sin conexión a internet</h1>
  <p>Once necesita internet para mostrar tu boda, tus ofertas y el Mercado. Revisa tu conexión e inténtalo de nuevo.</p>
  <button type="button" id="reintentar">Reintentar</button>
  <p class="estado" id="estado" role="status"></p>
</main>
<script>
  var estado = document.getElementById('estado');
  function recargar(){ estado.textContent = 'Conectando…'; location.reload(); }
  document.getElementById('reintentar').addEventListener('click', recargar);
  window.addEventListener('online', recargar);   // al volver la conexión, entra solo
</script>
</body>
</html>`;

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) { /* no es indispensable */ }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  // Solo se atiende la carga de la página. Fotos, datos, Supabase, PayPal, fuentes: pasan directo, sin tocarse.
  if (event.request.mode !== 'navigate') return;
  event.respondWith((async () => {
    try {
      const adelantada = await event.preloadResponse;
      if (adelantada) return adelantada;
      return await fetch(event.request);
    } catch (_) {
      return new Response(OFFLINE_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
  })());
});
