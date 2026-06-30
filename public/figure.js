/*
 * Detaillierte, animierte Uebungs-Figur (SVG + SMIL).
 *
 * Eine sitzende Person mit gebeugten Knien, Kleidung (Hemd/Hose/Schuhe),
 * Hautton an Kopf/Unterarmen/Haenden und ruhigem Gesicht. Je nach Uebung
 * werden Arme, Unterarme, Beine, Rumpf und Kopf bewegt; dazu eine sanfte,
 * durchgehende Atembewegung. Laeuft offline, ohne Videos/externe Dateien.
 *
 * window.buildFigureSVG(moveId) -> SVG-String mit eingebetteter Animation.
 */

(function () {
  // Farben
  const C = {
    skin: '#e6b48c', skinShade: '#d49a6e',
    shirt: '#4f6d97', shirtShade: '#3f587b',
    trouser: '#3b4756', shoe: '#262b33',
    hair: '#4a3b30', chair: '#caa86f', chairShade: '#b08e54',
    face: '#3a2c22',
  };

  // Drehpunkte (Gelenke) in viewBox-Koordinaten.
  const PIVOT = {
    upperArmR: [122, 80], forearmR: [122, 110],
    upperArmL: [78, 80], forearmL: [78, 110],
    thighR: [112, 150], shinR: [122, 178],
    thighL: [88, 150], shinL: [78, 178],
    torso: [100, 82], head: [100, 64],
  };

  // Animations-Rezepte je Uebung:  [teil, winkelA, winkelB, dauerSek, phase]
  const ANIM = {
    atem: [
      ['forearmR', 0, 74, 5, 'a'], ['forearmL', 0, -74, 5, 'a'],
      ['upperArmR', 0, 14, 5, 'a'], ['upperArmL', 0, -14, 5, 'a'],
    ],
    nacken: [['head', -15, 15, 4, 'a']],
    schulterkreisen: [
      ['upperArmR', -12, 14, 3, 'a'], ['upperArmL', 12, -14, 3, 'a'],
      ['forearmR', 0, 14, 3, 'a'], ['forearmL', 0, -14, 3, 'a'],
    ],
    wolkenhaende: [
      ['torso', -10, 10, 4.2, 'a'],
      ['upperArmR', 48, 66, 4.2, 'a'], ['forearmR', 58, 82, 4.2, 'a'],
      ['upperArmL', -48, -66, 4.2, 'b'], ['forearmL', -58, -82, 4.2, 'b'],
    ],
    wildpferd: [
      ['upperArmR', -48, 2, 4, 'a'], ['forearmR', -18, -44, 4, 'a'],
      ['upperArmL', 48, -2, 4, 'b'], ['forearmL', 18, 44, 4, 'b'],
    ],
    knie: [
      ['forearmR', 10, 82, 3.5, 'a'], ['upperArmR', 0, 22, 3.5, 'a'],
      ['forearmL', -10, -82, 3.5, 'b'], ['upperArmL', 0, -22, 3.5, 'b'],
    ],
    affe: [
      ['upperArmR', 10, -26, 3.5, 'a'], ['forearmR', 42, 82, 3.5, 'a'],
      ['upperArmL', -10, 26, 3.5, 'b'], ['forearmL', -42, -82, 3.5, 'b'],
    ],
    spatz: [
      ['upperArmR', 34, 56, 4.5, 'a'], ['forearmR', 80, 38, 4.5, 'a'],
      ['upperArmL', -34, -56, 4.5, 'a'], ['forearmL', -80, -38, 4.5, 'a'],
    ],
    hahn: [
      ['thighR', 0, -32, 4, 'a'], ['shinR', 0, 16, 4, 'a'], ['forearmR', 0, 66, 4, 'a'],
      ['thighL', 0, 32, 4, 'b'], ['shinL', 0, -16, 4, 'b'], ['forearmL', 0, -66, 4, 'b'],
    ],
    tiger: [
      ['torso', -15, 15, 4.5, 'a'],
      ['upperArmR', 16, 40, 4.5, 'a'], ['upperArmL', -16, -40, 4.5, 'a'],
    ],
    fersen: [
      ['shinR', 0, -15, 2.2, 'a'], ['shinL', 0, 15, 2.2, 'b'],
    ],
    ausklang: [
      ['upperArmR', -54, -4, 6, 'a'], ['forearmR', 28, 4, 6, 'a'],
      ['upperArmL', 54, 4, 6, 'a'], ['forearmL', -28, -4, 6, 'a'],
    ],
  };

  function rotTag(part, a, b, dur, phase) {
    const [px, py] = PIVOT[part];
    const v1 = `${a} ${px} ${py}`, v2 = `${b} ${px} ${py}`;
    const vals = phase === 'b' ? `${v2};${v1};${v2}` : `${v1};${v2};${v1}`;
    return `<animateTransform attributeName="transform" attributeType="XML"
      type="rotate" dur="${dur}s" repeatCount="indefinite" additive="sum"
      calcMode="spline" keyTimes="0;0.5;1"
      keySplines="0.4 0 0.6 1;0.4 0 0.6 1" values="${vals}"/>`;
  }

  // Sanfte, durchgehende Atembewegung (kleiner Hub) fuer den Rumpf.
  const breatheTag =
    `<animateTransform attributeName="transform" attributeType="XML"
      type="translate" dur="4.5s" repeatCount="indefinite" additive="sum"
      calcMode="spline" keyTimes="0;0.5;1"
      keySplines="0.4 0 0.6 1;0.4 0 0.6 1" values="0 0;0 -1.6;0 0"/>`;

  function animsFor(moveId) {
    const out = {};
    (ANIM[moveId] || []).forEach(([part, a, b, dur, phase]) => {
      out[part] = (out[part] || '') + rotTag(part, a, b, dur, phase);
    });
    return out;
  }

  window.buildFigureSVG = function (moveId) {
    const A = animsFor(moveId);

    return `
    <svg viewBox="0 0 200 250" class="figure-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#dfe8e3"/><stop offset="1" stop-color="#cdd9d2"/>
        </linearGradient>
      </defs>

      <!-- Boden -->
      <ellipse cx="100" cy="232" rx="78" ry="12" fill="url(#floor)"/>

      <!-- Stuhl (hinter der Figur) -->
      <g fill="${C.chair}">
        <rect x="63" y="150" width="74" height="12" rx="3"/>            <!-- Sitzflaeche -->
        <rect x="66" y="86" width="9" height="66" rx="4"/>              <!-- Rueckenlehne links -->
        <rect x="125" y="86" width="9" height="66" rx="4"/>             <!-- Rueckenlehne rechts -->
        <rect x="66" y="86" width="68" height="9" rx="4"/>              <!-- Lehnen-Querbalken -->
      </g>
      <g fill="${C.chairShade}">
        <rect x="70" y="160" width="9" height="62" rx="4"/>            <!-- vorderes Bein links -->
        <rect x="121" y="160" width="9" height="62" rx="4"/>           <!-- vorderes Bein rechts -->
      </g>

      <!-- Beine (Hosen) -->
      <g stroke="${C.trouser}" stroke-width="16" fill="none" stroke-linecap="round">
        <g>${A.thighL || ''}<line x1="88" y1="150" x2="78" y2="178"/>
          <g>${A.shinL || ''}<line x1="78" y1="178" x2="80" y2="214"/>
            <path d="M70 216 q-6 2 -2 8 h18 q3 -6 -4 -9 z" fill="${C.shoe}" stroke="none"/></g></g>
        <g>${A.thighR || ''}<line x1="112" y1="150" x2="122" y2="178"/>
          <g>${A.shinR || ''}<line x1="122" y1="178" x2="120" y2="214"/>
            <path d="M130 216 q6 2 2 8 h-18 q-3 -6 4 -9 z" fill="${C.shoe}" stroke="none"/></g></g>
      </g>

      <!-- Rumpf-Gruppe: Hemd, Kopf, Arme. Dreht bei Drehuebungen; atmet immer. -->
      <g>${A.torso || ''}${breatheTag}
        <!-- Hemd / Oberkoerper -->
        <path d="M78 80 Q100 72 122 80 L118 152 Q100 158 82 152 Z" fill="${C.shirt}"/>
        <path d="M82 152 Q100 158 118 152 L117 156 Q100 161 83 156 Z" fill="${C.shirtShade}"/>

        <!-- Hals + Kopf -->
        <g>${A.head || ''}
          <rect x="94" y="58" width="12" height="14" rx="5" fill="${C.skin}"/>
          <circle cx="100" cy="46" r="19" fill="${C.skin}"/>
          <path d="M82 44 a18 18 0 0 1 36 0 q-6 -9 -18 -9 t-18 9 z" fill="${C.hair}"/>
          <circle cx="93" cy="46" r="1.8" fill="${C.face}"/>
          <circle cx="107" cy="46" r="1.8" fill="${C.face}"/>
          <path d="M95 53 q5 3 10 0" stroke="${C.face}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        </g>

        <!-- Arme: Oberarm (Hemd) + Unterarm (Haut, hochgekrempelt) + Hand -->
        <g fill="none" stroke-linecap="round">
          <g>${A.upperArmL || ''}
            <line x1="78" y1="80" x2="78" y2="110" stroke="${C.shirt}" stroke-width="13"/>
            <g>${A.forearmL || ''}
              <line x1="78" y1="110" x2="78" y2="138" stroke="${C.skin}" stroke-width="11"/>
              <circle cx="78" cy="142" r="7.5" fill="${C.skin}" stroke="none"/></g></g>
          <g>${A.upperArmR || ''}
            <line x1="122" y1="80" x2="122" y2="110" stroke="${C.shirt}" stroke-width="13"/>
            <g>${A.forearmR || ''}
              <line x1="122" y1="110" x2="122" y2="138" stroke="${C.skin}" stroke-width="11"/>
              <circle cx="122" cy="142" r="7.5" fill="${C.skin}" stroke="none"/></g></g>
        </g>
      </g>
    </svg>`;
  };
})();
