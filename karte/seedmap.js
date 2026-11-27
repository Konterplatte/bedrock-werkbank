/* Bedrock-Werkbank, Seed-Karte: Rechenkern im Hintergrund (Web Worker).
 * Lädt seedmap.wasm (Biome: cubiomes, MIT; Bauwerke: eigene Umsetzung der Bedrock-Platzierung) und beantwortet
 * Anfragen der Oberfläche. Alles wird auf dem Gerät berechnet, ohne Internet. Die App startet bis zu zwei davon.
 *
 * Nachrichten: { id, cmd, a } -> { id, ok, r } bzw. { id, ok: false, err }
 *   init   { seed: "<Zahl als Text>", ver: <Index der Bedrock-Version>, pal: Uint32Array(256) Biomfarben, relief: true/false }
 *   tile   { x0, z0, n, s }            -> { px: ArrayBuffer (RGBA n*n), ids: ArrayBuffer (Uint8 n*n), h: ArrayBuffer (Int16 n*n, Höhe in Blöcken) }
 *   marks  { cx0, cz0, cx1, cz1, t: [Typen] } -> [t, x, z, extra, …]
 *   near   { t, x, z, n, max }          -> [{ x, z, e, d }]
 *   biome  { b: [IDs], x, z, y, max }   -> { x, z, b, d } oder null
 *   at     { x, z, y }                  -> Biom-ID
 */
'use strict';
var E = null, MEM = null, loading = null, PAL = null, RELIEF = true;

// Kleinste WASI-Umgebung: der Rechenkern schreibt höchstens Fehlermeldungen, Dateien gibt es keine.
var WASI = {
  fd_write: function (fd, iovs, n, nw) {
    var dv = new DataView(MEM.buffer), sum = 0;
    for (var i = 0; i < n; i++) sum += dv.getUint32(iovs + 8 * i + 4, true);
    dv.setUint32(nw, sum, true);
    return 0;
  },
  fd_close: function () { return 0; },
  fd_seek: function () { return 70; },
  fd_fdstat_get: function () { return 8; },
  fd_prestat_get: function () { return 8; },
  fd_prestat_dir_name: function () { return 8; },
  proc_exit: function (c) { throw new Error('Rechenkern beendet (' + c + ')'); }
};

function load() {
  if (!loading) {
    loading = fetch(new URL('seedmap.wasm', self.location.href).href)
      .then(function (r) { if (!r.ok) throw new Error('seedmap.wasm nicht ladbar (' + r.status + ')'); return r.arrayBuffer(); })
      .then(function (buf) { return WebAssembly.instantiate(buf, { wasi_snapshot_preview1: WASI }); })
      .then(function (res) { E = res.instance.exports; MEM = E.memory; E._initialize(); });
    loading.catch(function () { loading = null; });
  }
  return loading;
}

// Regionsgröße je Bauwerkstyp in Chunks (wie im Rechenkern), bestimmt den ersten Suchradius
var SPACING = [34, 80, 80, 32, 24, 34, 34, 32, 32, 32, 32, 24, 20, 4, 40, 30, 25, 20];
// Wasserbiome: dort keine Hangschattierung, sondern dunkler mit der Tiefe
var WATER = { 0: 1, 7: 1, 10: 1, 11: 1, 24: 1, 44: 1, 45: 1, 46: 1, 47: 1, 48: 1, 49: 1, 50: 1 };

function out(n) { return new Int32Array(MEM.buffer, E.sm_out(), n).slice(); }

function structs(t, cx0, cz0, cx1, cz1, max) {
  var n = E.sm_structs(t, cx0, cz0, cx1, cz1, max);
  return n > 0 ? out(n * 3) : new Int32Array(0);
}

function near(t, x, z, n, max) {
  var r = Math.max(256, SPACING[t] * 24);
  for (;;) {
    var a = structs(t, Math.floor((x - r) / 16), Math.floor((z - r) / 16), Math.floor((x + r) / 16), Math.floor((z + r) / 16), 200000), list = [];
    for (var i = 0; i < a.length; i += 3) {
      var d = Math.sqrt((a[i] - x) * (a[i] - x) + (a[i + 1] - z) * (a[i + 1] - z));
      if (d <= r) list.push({ x: a[i], z: a[i + 1], e: a[i + 2], d: Math.round(d) });
    }
    // Im Kreis mit Radius r ist nichts übersehen: alles Nähere liegt im abgesuchten Quadrat
    if (list.length >= n || r >= max) { list.sort(function (p, q) { return p.d - q.d; }); return list.slice(0, n); }
    r = Math.min(max, r * 2);
  }
}

function biome(ids, x, z, y, max) {
  // Erst fein und nah, dann gröber und weiter: kleine Biome werden nah gefunden, große auch weit weg
  var steps = [[16, Math.min(max, 1200)], [32, Math.min(max, 4000)], [96, max]], best = null;
  for (var s = 0; s < steps.length && !best; s++) {
    for (var k = 0; k < ids.length; k++) {
      if (E.sm_find_biome(ids[k], x, z, y, steps[s][0], steps[s][1])) {
        var o = out(3), d = Math.sqrt((o[0] - x) * (o[0] - x) + (o[1] - z) * (o[1] - z));
        if (!best || d < best.d) best = { x: o[0], z: o[1], b: ids[k], d: Math.round(d) };
      }
    }
  }
  return best;
}

// Licht von Nordwesten: Hänge nach Nordwesten heller, nach Südosten dunkler; Wasser dunkler mit der Tiefe
function shade(col, b, h, gx, gz) {
  var f;
  if (WATER[b]) f = Math.max(0.6, Math.min(1.08, 1.06 - Math.max(0, 61 - h) * 0.011));
  else f = 1 + Math.max(-0.36, Math.min(0.3, (gx + gz) * 1.5)) + Math.max(-0.05, Math.min(0.09, (h - 72) * 0.0011));
  var r = Math.min(255, (col & 255) * f), g = Math.min(255, ((col >>> 8) & 255) * f), bl = Math.min(255, ((col >>> 16) & 255) * f);
  return (0xff000000 | (bl << 16) | (g << 8) | r) >>> 0;
}

function tile(x0, z0, n, s) {
  var p = E.sm_tileh(x0, z0, n, s, 319);
  if (!p) throw new Error('Kein Speicher für die Karte');
  var hs = s < 4 ? 4 : s, m = n * s / hs + 3, f = hs / s;
  var all = new Int32Array(MEM.buffer, p, n * n + m * m), H = all.subarray(n * n);
  // Neigung je Knoten aus beiden Nachbarn (glatter als nur der nächste Knoten)
  var GX = new Float32Array(m * m), GZ = new Float32Array(m * m), i, j;
  for (j = 1; j < m - 1; j++) for (i = 1; i < m - 1; i++) {
    GX[j * m + i] = (H[j * m + i + 1] - H[j * m + i - 1]) / (2 * hs);
    GZ[j * m + i] = (H[(j + 1) * m + i] - H[(j - 1) * m + i]) / (2 * hs);
  }
  var px = new Uint32Array(n * n), id8 = new Uint8Array(n * n), h16 = new Int16Array(n * n);
  for (j = 0; j < n; j++) {
    var gj = (j + 0.5) / f - 0.5 + 1, j0 = Math.floor(gj), fz = gj - j0;
    if (f === 1) { j0 = j + 1; fz = 0; }
    for (i = 0; i < n; i++) {
      var k = j * n + i, b = all[k] & 255, gi = (i + 0.5) / f - 0.5 + 1, i0 = Math.floor(gi), fx = gi - i0;
      if (f === 1) { i0 = i + 1; fx = 0; }
      var q0 = j0 * m + i0, q1 = q0 + 1, q2 = q0 + m, q3 = q2 + 1;
      var w0 = (1 - fx) * (1 - fz), w1 = fx * (1 - fz), w2 = (1 - fx) * fz, w3 = fx * fz;
      var h = H[q0] * w0 + H[q1] * w1 + H[q2] * w2 + H[q3] * w3;
      id8[k] = b; h16[k] = Math.round(h);
      var col = PAL ? PAL[b] : 0xff808080;
      if (RELIEF) col = shade(col, b, h, GX[q0] * w0 + GX[q1] * w1 + GX[q2] * w2 + GX[q3] * w3, GZ[q0] * w0 + GZ[q1] * w1 + GZ[q2] * w2 + GZ[q3] * w3);
      px[k] = col;
    }
  }
  return { px: px.buffer, ids: id8.buffer, h: h16.buffer };
}

function marks(a) {
  var res = [];
  a.t.forEach(function (t) {
    var s = structs(t, a.cx0, a.cz0, a.cx1, a.cz1, 100000);
    for (var i = 0; i < s.length; i += 3) res.push(t, s[i], s[i + 1], s[i + 2]);
  });
  return res;
}

function init(a) {
  var u = BigInt.asUintN(64, BigInt(a.seed));
  var lo = Number(u & BigInt(0xffffffff)), hi = Number(u >> BigInt(32));
  if (a.pal) PAL = new Uint32Array(a.pal);
  RELIEF = a.relief !== false;
  var mc = E.sm_ver_mc(a.ver | 0);
  return { mc: E.sm_init(lo, hi, mc, 319), vers: E.sm_ver_count() };
}

self.onmessage = function (ev) {
  var m = ev.data || {};
  load().then(function () {
    var a = m.a || {}, r, tr = [];
    switch (m.cmd) {
      case 'init': r = init(a); break;
      case 'tile': r = tile(a.x0 | 0, a.z0 | 0, a.n | 0, a.s | 0); tr = [r.px, r.ids, r.h]; break;
      case 'marks': r = marks(a); break;
      case 'near': r = near(a.t | 0, a.x | 0, a.z | 0, a.n | 0 || 1, a.max | 0 || 10000); break;
      case 'biome': r = biome(a.b, a.x | 0, a.z | 0, a.y | 0, a.max | 0 || 8000); break;
      case 'at': r = E.sm_biome(a.x | 0, a.y | 0, a.z | 0); break;
      case 'ping': r = true; break;
      default: throw new Error('Unbekannter Befehl ' + m.cmd);
    }
    self.postMessage({ id: m.id, ok: true, r: r }, tr);
  }).catch(function (e) {
    self.postMessage({ id: m.id, ok: false, err: String(e && e.message || e) });
  });
};
