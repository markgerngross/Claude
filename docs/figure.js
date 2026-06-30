/*
 * Animierte Uebungs-Figur (reines SVG + SMIL-Animation).
 *
 * Zeichnet eine sitzende Figur und bewegt je nach Uebung die passenden
 * Gelenke (Arme, Unterarme, Beine, Rumpf, Kopf). Laeuft offline, ohne Videos,
 * ohne externe Dateien – die Bewegung wird im Browser berechnet.
 *
 * window.buildFigureSVG(moveId) -> SVG-String mit eingebetteter Animation.
 */

(function () {
  // Drehpunkt (Gelenk) je Koerperteil in viewBox-Koordinaten.
  const PIVOT = {
    upperArmR: [120, 86], forearmR: [120, 116],
    upperArmL: [80, 86], forearmL: [80, 116],
    thighR: [116, 160], shinR: [122, 196],
    thighL: [84, 160], shinL: [78, 196],
    torso: [100, 84], head: [100, 74],
  };

  // Animations-Rezepte je Uebung:
  //   [teil, winkelA, winkelB, dauerSek, phase('a'|'b')]
  // Gegenphasige Teile (links/rechts) erzeugen das Wechselspiel.
  const ANIM = {
    atem: [
      ['forearmR', 0, 72, 5, 'a'], ['forearmL', 0, -72, 5, 'a'],
      ['upperArmR', 0, -10, 5, 'a'], ['upperArmL', 0, 10, 5, 'a'],
    ],
    nacken: [['head', -16, 16, 4, 'a']],
    schulterkreisen: [
      ['upperArmR', -14, 14, 3, 'a'], ['upperArmL', 14, -14, 3, 'a'],
      ['forearmR', 0, 12, 3, 'a'], ['forearmL', 0, -12, 3, 'a'],
    ],
    wolkenhaende: [
      ['torso', -10, 10, 4, 'a'],
      ['upperArmR', 55, 75, 4, 'a'], ['forearmR', 60, 80, 4, 'a'],
      ['upperArmL', -55, -75, 4, 'b'], ['forearmL', -60, -80, 4, 'b'],
    ],
    wildpferd: [
      ['upperArmR', -55, -5, 4, 'a'], ['forearmR', -15, -45, 4, 'a'],
      ['upperArmL', 55, 5, 4, 'b'], ['forearmL', 15, 45, 4, 'b'],
    ],
    knie: [
      ['forearmR', 12, 85, 3.5, 'a'], ['upperArmR', 0, 18, 3.5, 'a'],
      ['forearmL', -12, -85, 3.5, 'b'], ['upperArmL', 0, -18, 3.5, 'b'],
    ],
    affe: [
      ['upperArmR', 12, -28, 3.5, 'a'], ['forearmR', 40, 80, 3.5, 'a'],
      ['upperArmL', -12, 28, 3.5, 'b'], ['forearmL', -40, -80, 3.5, 'b'],
    ],
    spatz: [
      ['upperArmR', 40, 58, 4.5, 'a'], ['forearmR', 80, 38, 4.5, 'a'],
      ['upperArmL', -40, -58, 4.5, 'a'], ['forearmL', -80, -38, 4.5, 'a'],
    ],
    hahn: [
      ['thighR', 0, -34, 4, 'a'], ['shinR', 0, 18, 4, 'a'], ['forearmR', 0, 68, 4, 'a'],
      ['thighL', 0, -34, 4, 'b'], ['shinL', 0, -18, 4, 'b'], ['forearmL', 0, -68, 4, 'b'],
    ],
    tiger: [
      ['torso', -15, 15, 4.5, 'a'],
      ['upperArmR', 18, 42, 4.5, 'a'], ['upperArmL', -18, -42, 4.5, 'a'],
    ],
    fersen: [
      ['shinR', 0, -16, 2.2, 'a'], ['shinL', 0, -16, 2.2, 'b'],
    ],
    ausklang: [
      ['upperArmR', -58, -6, 6, 'a'], ['forearmR', 30, 5, 6, 'a'],
      ['upperArmL', 58, 6, 6, 'a'], ['forearmL', -30, -5, 6, 'a'],
    ],
  };

  function animTag(part, a, b, dur, phase) {
    const [px, py] = PIVOT[part];
    const v1 = `${a} ${px} ${py}`;
    const v2 = `${b} ${px} ${py}`;
    const vals = phase === 'b' ? `${v2};${v1};${v2}` : `${v1};${v2};${v1}`;
    return `<animateTransform attributeName="transform" attributeType="XML"
      type="rotate" dur="${dur}s" repeatCount="indefinite"
      calcMode="spline" keyTimes="0;0.5;1"
      keySplines="0.4 0 0.6 1;0.4 0 0.6 1" values="${vals}"/>`;
  }

  // Sammelt die Animations-Tags je Koerperteil fuer eine Uebung.
  function animsFor(moveId) {
    const out = {};
    (ANIM[moveId] || []).forEach(([part, a, b, dur, phase]) => {
      out[part] = animTag(part, a, b, dur, phase);
    });
    return out;
  }

  window.buildFigureSVG = function (moveId) {
    const A = animsFor(moveId);
    const limb = '#3f7d6b';
    const hand = '#c9a24b';

    return `
    <svg viewBox="0 0 200 250" class="figure-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- Stuhl -->
      <g stroke="#d8cba6" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9">
        <path d="M68 168 V96 M132 168 V96 M68 96 H132"/>
        <path d="M64 168 H136 M74 168 V232 M126 168 V232"/>
      </g>

      <!-- Beine (hinter dem Rumpf) -->
      <g stroke="${limb}" stroke-width="13" fill="none" stroke-linecap="round">
        <g>${A.thighL || ''}<line x1="84" y1="160" x2="78" y2="196"/>
          <g>${A.shinL || ''}<line x1="78" y1="196" x2="76" y2="226"/>
            <ellipse cx="72" cy="228" rx="11" ry="6" fill="${limb}" stroke="none"/></g></g>
        <g>${A.thighR || ''}<line x1="116" y1="160" x2="122" y2="196"/>
          <g>${A.shinR || ''}<line x1="122" y1="196" x2="124" y2="226"/>
            <ellipse cx="128" cy="228" rx="11" ry="6" fill="${limb}" stroke="none"/></g></g>
      </g>

      <!-- Rumpf-Gruppe (dreht sich bei Drehuebungen, Arme + Kopf folgen) -->
      <g>${A.torso || ''}
        <path d="M80 84 Q100 77 120 84 L116 162 Q100 169 84 162 Z" fill="${limb}"/>

        <!-- Kopf -->
        <g>${A.head || ''}
          <line x1="100" y1="80" x2="100" y2="70" stroke="${limb}" stroke-width="11"/>
          <circle cx="100" cy="52" r="20" fill="${limb}"/>
        </g>

        <!-- Arme als Ober-/Unterarm-Gruppen -->
        <g stroke="${limb}" stroke-width="11" fill="none" stroke-linecap="round">
          <g>${A.upperArmL || ''}<line x1="80" y1="86" x2="80" y2="116"/>
            <g>${A.forearmL || ''}<line x1="80" y1="116" x2="80" y2="146"/>
              <circle cx="80" cy="150" r="7" fill="${hand}" stroke="none"/></g></g>
          <g>${A.upperArmR || ''}<line x1="120" y1="86" x2="120" y2="116"/>
            <g>${A.forearmR || ''}<line x1="120" y1="116" x2="120" y2="146"/>
              <circle cx="120" cy="150" r="7" fill="${hand}" stroke="none"/></g></g>
        </g>
      </g>
    </svg>`;
  };
})();
