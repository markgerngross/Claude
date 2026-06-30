/*
 * Inhalt der Stuhl-Tai-Chi-App: Uebungs-Bibliothek, 28-Tage-Programm,
 * Trainingspartner. Reines Datenmodul, keine Logik.
 *
 * Hinweis: Bewegung im Sitzen ist sanft und gelenkschonend. Die App ersetzt
 * keine aerztliche Beratung. Bei Beschwerden bitte vorher Ruecksprache halten.
 */

// MET-Wert fuer sanftes Stuhl-Tai-Chi ~ 2.5–3.0. Wir rechnen konservativ.
window.TAICHI_MET = 2.8;

// --- Uebungs-Bibliothek -----------------------------------------------------
// type: 'warmup' | 'core' | 'cooldown'
window.MOVES = {
  atem: {
    name: 'Tai-Chi-Atmung',
    origin: 'Eroeffnung / Wu Ji',
    type: 'warmup',
    focus: 'Ruhe, Haltung, Atem',
    howto: [
      'Aufrecht sitzen, Fuesse hueftbreit flach am Boden, Haende auf den Oberschenkeln.',
      'Beim Einatmen die Haende langsam vor dem Bauch nach oben heben, bis Brusthoehe.',
      'Beim Ausatmen die Haende sanft wieder senken. Schultern locker.',
    ],
    breathing: 'Tief in den Bauch ein – langsam aus. 4 Sekunden ein, 6 aus.',
    benefit: 'Bringt Kreislauf und Atem in Gang, senkt den Puls.',
  },
  nacken: {
    name: 'Nacken loesen',
    origin: 'Aufwaermen',
    type: 'warmup',
    focus: 'Halswirbelsaeule',
    howto: [
      'Kinn langsam zur Brust senken, dann sanft wieder heben.',
      'Kopf langsam nach links drehen, zurueck zur Mitte, nach rechts.',
      'Keine ruckartigen Bewegungen, dem Atem folgen.',
    ],
    breathing: 'Ausatmen beim Senken/Drehen, einatmen zur Mitte.',
    benefit: 'Loest Verspannungen im oberen Ruecken und Nacken.',
  },
  schulterkreisen: {
    name: 'Schulterkreisen',
    origin: 'Aufwaermen',
    type: 'warmup',
    focus: 'Schultern',
    howto: [
      'Beide Schultern langsam nach hinten kreisen.',
      'Den Kreis gross und rund machen, Brust dabei oeffnen.',
      'Nach der Haelfte die Richtung wechseln.',
    ],
    breathing: 'Einatmen beim Heben, ausatmen beim Senken.',
    benefit: 'Mobilisiert die Schultergelenke, oeffnet den Brustkorb.',
  },
  wolkenhaende: {
    name: 'Wolkenhaende',
    origin: 'Cloud Hands (Yun Shou)',
    type: 'core',
    focus: 'Rumpf, Koordination',
    howto: [
      'Eine Hand auf Brusthoehe, die andere auf Bauchhoehe, Handflaechen zum Koerper.',
      'Den Oberkoerper langsam zur Seite drehen und dabei die Haende wie zwei Wolken kreisen lassen.',
      'Weich zur anderen Seite wechseln – ohne Pause, ein steter Fluss.',
    ],
    breathing: 'Atem fliesst ruhig mit der Drehung, nicht anhalten.',
    benefit: 'Trainiert die Rumpfmuskulatur und die Drehbeweglichkeit.',
  },
  wildpferd: {
    name: 'Maehne des Wildpferds teilen',
    origin: 'Parting the Wild Horse’s Mane',
    type: 'core',
    focus: 'Arme, Brust, Koordination',
    howto: [
      'Haende vor dem Bauch, als haltest du einen Ball.',
      'Eine Hand oeffnet nach schraeg oben/aussen, die andere sinkt nach unten.',
      'Zur Mitte zurueck, Ball wechseln, zur anderen Seite oeffnen.',
    ],
    breathing: 'Einatmen beim Oeffnen, ausatmen beim Zurueckfuehren.',
    benefit: 'Kraeftigt Schultern und Brust, schult Gleichgewicht im Sitzen.',
  },
  knie: {
    name: 'Knie streichen, Stossen',
    origin: 'Brush Knee and Push',
    type: 'core',
    focus: 'Arme, Stabilitaet',
    howto: [
      'Eine Hand streicht ueber dem Oberschenkel nach vorne ab.',
      'Die andere Hand stoesst langsam nach vorne, Handflaeche voraus.',
      'Zurueckziehen und Seite wechseln.',
    ],
    breathing: 'Ausatmen beim Stossen, einatmen beim Zurueckziehen.',
    benefit: 'Staerkt Arme und Schulterguertel, foerdert Konzentration.',
  },
  affe: {
    name: 'Affen abwehren',
    origin: 'Repulse Monkey',
    type: 'core',
    focus: 'Arme, Ruecken',
    howto: [
      'Eine Hand zieht offen nach hinten/unten zurueck.',
      'Die andere Hand schiebt sanft nach vorne auf Schulterhoehe.',
      'Im Wechsel weich vor und zurueck, wie ein ruhiges Pendeln.',
    ],
    breathing: 'Atem ruhig mitschwingen lassen.',
    benefit: 'Mobilisiert den oberen Ruecken, loest Verspannungen.',
  },
  spatz: {
    name: 'Schwanz des Spatzen fassen',
    origin: 'Grasp the Sparrow’s Tail',
    type: 'core',
    focus: 'Ganzkoerper-Fluss',
    howto: [
      'Beide Haende fuehren nach vorne (Abwehren), dann zuruecknehmen (Zurueckrollen).',
      'Nach vorne druecken (Pressen), dann sanft schieben (Stossen).',
      'Vier ruhige Phasen, die ineinander fliessen.',
    ],
    breathing: 'Ein beim Sammeln, aus beim Ausstossen.',
    benefit: 'Verbindet Arme, Rumpf und Atem zu einem Fluss.',
  },
  hahn: {
    name: 'Goldener Hahn (im Sitzen)',
    origin: 'Golden Rooster Stands on One Leg',
    type: 'core',
    focus: 'Hueften, Gleichgewicht',
    howto: [
      'Ein Knie langsam anheben, Hand der gleichen Seite hebt locker mit.',
      'Kurz halten, ruhig atmen, dann sanft absetzen.',
      'Seite wechseln. Festhalten am Stuhl ist erlaubt.',
    ],
    breathing: 'Einatmen beim Heben, ausatmen beim Absetzen.',
    benefit: 'Aktiviert Hueftbeuger und Beine, schult die Balance.',
  },
  tiger: {
    name: 'Tiger zum Berg tragen',
    origin: 'Carry Tiger to Mountain',
    type: 'core',
    focus: 'Rumpfdrehung',
    howto: [
      'Haende sammeln sich seitlich, als hieltest du etwas Schweres.',
      'Oberkoerper langsam zur Seite drehen und die Haende mitfuehren.',
      'Zur Mitte zurueck, andere Seite.',
    ],
    breathing: 'Ausatmen in die Drehung, einatmen zur Mitte.',
    benefit: 'Kraeftige Rumpfdrehung, gut fuer die seitliche Bauchmuskulatur.',
  },
  fersen: {
    name: 'Fersen-Zehen-Wippen',
    origin: 'Aktivierung',
    type: 'core',
    focus: 'Unterschenkel, Kreislauf',
    howto: [
      'Beide Fersen anheben, auf die Zehenballen kommen.',
      'Wieder absetzen und die Zehen anheben.',
      'Ruhiger, gleichmaessiger Wechsel.',
    ],
    breathing: 'Gleichmaessig weiteratmen.',
    benefit: 'Bringt die Wadenpumpe in Gang, foerdert die Durchblutung.',
  },
  ausklang: {
    name: 'Energie sammeln (Abschluss)',
    origin: 'Closing Form',
    type: 'cooldown',
    focus: 'Beruhigung',
    howto: [
      'Beide Haende beim Einatmen weit zur Seite und nach oben fuehren.',
      'Beim Ausatmen vor dem Koerper langsam nach unten sinken lassen.',
      'Zum Schluss Haende ruhig auf den Bauch legen und nachspueren.',
    ],
    breathing: 'Drei tiefe, lange Atemzuege zum Abschluss.',
    benefit: 'Beruhigt das Nervensystem, schliesst die Einheit ruhig ab.',
  },
};

// --- 28-Tage-Programm -------------------------------------------------------
// Vier Wochen, ansteigend in Dauer und Vielfalt.
// Jeder Tag: { woche, titel, fokus, intro, blocks:[{move, seconds}] }

const WEEKS = [
  {
    nr: 1,
    name: 'Woche 1 · Grundlagen',
    fokus: 'Atem, Haltung, sanfter Einstieg',
    pool: ['wolkenhaende', 'wildpferd', 'fersen'],
    coreSecs: 90,
    coreCount: 4,
  },
  {
    nr: 2,
    name: 'Woche 2 · Aufbau',
    fokus: 'Mehr Bewegung, erste laengere Fluesse',
    pool: ['wolkenhaende', 'wildpferd', 'knie', 'affe', 'fersen'],
    coreSecs: 100,
    coreCount: 5,
  },
  {
    nr: 3,
    name: 'Woche 3 · Fluss',
    fokus: 'Bewegungen verbinden, Ausdauer',
    pool: ['wolkenhaende', 'wildpferd', 'knie', 'affe', 'spatz', 'hahn', 'tiger'],
    coreSecs: 110,
    coreCount: 6,
  },
  {
    nr: 4,
    name: 'Woche 4 · Meisterung',
    fokus: 'Volle Sequenzen, ruhige Kraft',
    pool: ['spatz', 'wolkenhaende', 'tiger', 'hahn', 'wildpferd', 'knie', 'affe'],
    coreSecs: 120,
    coreCount: 7,
  },
];

const TAGES_INTROS = [
  'Heute geht es nur darum, anzufangen. Ruhig und freundlich zu dir.',
  'Jede Wiederholung zaehlt. Bleib weich in den Schultern.',
  'Der Atem fuehrt die Bewegung – nicht die Bewegung den Atem.',
  'Halbe Strecke ist auch ein Fortschritt. Heute sammelst du Routine.',
  'Spuere, wie der Koerper warm wird. Das ist deine Verbrennung bei der Arbeit.',
  'Langsam ist das neue schnell. Qualitaet vor Tempo.',
  'Ein voller Wochenabschluss – sei stolz auf die Serie.',
];

function buildDay(dayNumber) {
  const week = WEEKS[Math.floor((dayNumber - 1) / 7)];
  const dayInWeek = (dayNumber - 1) % 7; // 0..6

  const blocks = [];
  // Aufwaermen (waechst leicht ueber die Wochen)
  const warmSecs = 40 + week.nr * 5;
  blocks.push({ move: 'atem', seconds: 50 });
  blocks.push({ move: 'nacken', seconds: warmSecs });
  blocks.push({ move: 'schulterkreisen', seconds: warmSecs });

  // Kern-Uebungen: rotierende Auswahl aus dem Wochen-Pool, damit jeder Tag
  // etwas anders ist, aber innerhalb der Woche vertraut bleibt.
  const pool = week.pool;
  for (let i = 0; i < week.coreCount; i++) {
    const move = pool[(dayInWeek + i) % pool.length];
    blocks.push({ move, seconds: week.coreSecs });
  }

  // Ausklang
  blocks.push({ move: 'ausklang', seconds: 60 });

  const totalSec = blocks.reduce((s, b) => s + b.seconds, 0);

  return {
    nummer: dayNumber,
    woche: week.nr,
    wochenName: week.name,
    titel: `Tag ${dayNumber} · ${week.fokus}`,
    intro: TAGES_INTROS[dayInWeek],
    blocks,
    minuten: Math.round(totalSec / 60),
    totalSec,
  };
}

window.PROGRAM = Array.from({ length: 28 }, (_, i) => buildDay(i + 1));

// --- Trainingspartner -------------------------------------------------------
// Virtuelle Begleiter fuer den ganzen Monat. Geben taeglich Zuspruch.
window.PARTNERS = [
  {
    id: 'wei',
    name: 'Meister Wei',
    emoji: '\u{1F9D8}',
    stil: 'Ruhig, geduldig, weise',
    begruessung: 'Schoen, dass du da bist. Wir gehen diesen Monat gemeinsam.',
  },
  {
    id: 'lina',
    name: 'Trainerin Lina',
    emoji: '\u{1F3F8}',
    stil: 'Motivierend, herzlich, direkt',
    begruessung: 'Auf geht’s! 28 Tage, du und ich. Ich lass dich nicht haengen.',
  },
  {
    id: 'kumpel',
    name: 'Kumpel Toni',
    emoji: '\u{1F4AA}',
    stil: 'Locker, augenzwinkernd, anspornend',
    begruessung: 'Servus! Stuhl ausgerichtet? Dann legen wir los, Schritt fuer Schritt.',
  },
];

// Tagesspruch des Partners, abhaengig vom Fortschritt.
window.partnerMessage = function (partnerId, ctx) {
  // ctx: { tag, streak, done, totalDone }
  const lines = {
    vor: [
      `Tag ${ctx.tag} wartet. Nimm dir die paar Minuten – ich bin dabei.`,
      `Deine Serie steht bei ${ctx.streak}. Heute machen wir sie laenger.`,
      'Stuhl bereit, Schultern locker. Wir fangen ganz ruhig an.',
      `Schon ${ctx.totalDone} von 28 Einheiten geschafft. Weiter so, Schritt fuer Schritt.`,
    ],
    nach: [
      `Stark! Tag ${ctx.tag} ist im Kasten. Serie: ${ctx.streak}.`,
      'Sauber durchgezogen. Dein Koerper dankt es dir – morgen sehen wir uns wieder.',
      `Das waren wieder ein paar Kalorien und vor allem: Routine. ${ctx.totalDone}/28.`,
      'Geschafft. Trink ein Glas Wasser und sei stolz auf dich.',
    ],
  };
  const bucket = ctx.done ? lines.nach : lines.vor;
  // Stabil pro Tag (kein Zufall), damit es sich nicht bei jedem Render aendert.
  return bucket[ctx.tag % bucket.length];
};
