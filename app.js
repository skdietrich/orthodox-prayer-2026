(() => {
  "use strict";

  const START = "2026-05-21";
  const END = "2026-12-31";
  const DB_NAME = "orthodox-prayer-2026";
  const DB_VERSION = 1;

  const $ = (id) => document.getElementById(id);
  const els = {
    dateInput: $("dateInput"),
    prevDay: $("prevDay"),
    nextDay: $("nextDay"),
    todayBtn: $("todayBtn"),
    todayTitle: $("todayTitle"),
    seasonLabel: $("seasonLabel"),
    themeLabel: $("themeLabel"),
    fastLabel: $("fastLabel"),
    streakLabel: $("streakLabel"),
    apiStatus: $("apiStatus"),
    localFeast: $("localFeast"),
    seasonNote: $("seasonNote"),
    calendarOutput: $("calendarOutput"),
    readingsOutput: $("readingsOutput"),
    hymnTitle: $("hymnTitle"),
    troparionText: $("troparionText"),
    fatherTitle: $("fatherTitle"),
    fatherText: $("fatherText"),
    fatherSource: $("fatherSource"),
    morningDone: $("morningDone"),
    eveningDone: $("eveningDone"),
    dailyNote: $("dailyNote"),
    clearDayBtn: $("clearDayBtn"),
    morningRule: $("morningRule"),
    eveningRule: $("eveningRule"),
    livingNames: $("livingNames"),
    departedNames: $("departedNames"),
    saveDiptyches: $("saveDiptyches"),
    insertDiptyches: $("insertDiptyches"),
    diptychPreview: $("diptychPreview"),
    calendarMode: $("calendarMode"),
    fontMode: $("fontMode"),
    fontSize: $("fontSize"),
    parchmentMode: $("parchmentMode"),
    lowLightMode: $("lowLightMode"),
    refreshReadings: $("refreshReadings"),
    syncAllBtn: $("syncAllBtn"),
    clearCacheBtn: $("clearCacheBtn"),
    syncProgress: $("syncProgress"),
    syncMessage: $("syncMessage"),
    cacheCount: $("cacheCount"),
    exportDataBtn: $("exportDataBtn"),
    importDataInput: $("importDataInput"),
    installHintBtn: $("installHintBtn"),
    installHelp: $("installHelp")
  };

  const defaultSettings = {
    calendarMode: "julian",
    fontMode: "serif",
    fontSize: 19,
    parchmentMode: false,
    lowLightMode: false
  };

  const state = {
    settings: loadJSON("odp-settings", defaultSettings),
    tracker: loadJSON("odp-tracker", {}),
    diptyches: loadJSON("odp-diptyches", { living: "", departed: "" }),
    db: null,
    syncAbort: false
  };

  const prayers = {
    opening: [
      ["Opening Blessing", [
        "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
        "Glory to Thee, our God, glory to Thee."
      ]],
      ["O Heavenly King", [
        "O Heavenly King, the Comforter, the Spirit of Truth, Who art everywhere and fillest all things, Treasury of blessings and Giver of life, come and abide in us, cleanse us from every impurity, and save our souls, O Good One."
      ]],
      ["Trisagion Prayers", [
        "Holy God, Holy Mighty, Holy Immortal, have mercy on us. Three times.",
        "Glory to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.",
        "O Most Holy Trinity, have mercy on us. O Lord, cleanse us from our sins. O Master, pardon our transgressions. O Holy One, visit and heal our infirmities, for Thy name's sake.",
        "Lord, have mercy. Three times.",
        "Glory to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.",
        "Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done on earth, as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil."
      ]]
    ],
    psalm50: ["Psalm 50", [
      "Have mercy on me, O God, according to Thy great mercy; and according to the multitude of Thy compassions blot out my transgression.",
      "Wash me thoroughly from mine iniquity, and cleanse me from my sin. For I know mine iniquity, and my sin is ever before me.",
      "Against Thee only have I sinned, and done evil before Thee, that Thou mightest be justified in Thy words, and prevail when Thou art judged.",
      "For behold, I was conceived in iniquities, and in sins did my mother bear me. For behold, Thou hast loved truth; the hidden and secret things of Thy wisdom hast Thou made manifest unto me.",
      "Thou shalt sprinkle me with hyssop, and I shall be made clean; Thou shalt wash me, and I shall be made whiter than snow.",
      "Thou shalt make me to hear joy and gladness; the bones that be humbled, they shall rejoice.",
      "Turn Thy face away from my sins, and blot out all mine iniquities.",
      "Create in me a clean heart, O God, and renew a right spirit within me.",
      "Cast me not away from Thy presence, and take not Thy Holy Spirit from me.",
      "Restore unto me the joy of Thy salvation, and with Thy governing Spirit establish me.",
      "I shall teach transgressors Thy ways, and the ungodly shall turn back unto Thee.",
      "Deliver me from blood-guiltiness, O God, Thou God of my salvation; my tongue shall rejoice in Thy righteousness.",
      "O Lord, Thou shalt open my lips, and my mouth shall declare Thy praise.",
      "For if Thou hadst desired sacrifice, I had given it; with whole-burnt offerings Thou shalt not be pleased.",
      "A sacrifice unto God is a broken spirit; a heart that is broken and humbled God will not despise.",
      "Do good, O Lord, in Thy good pleasure unto Sion, and let the walls of Jerusalem be builded.",
      "Then shalt Thou be pleased with a sacrifice of righteousness, with oblation and whole-burnt offerings. Then shall they offer bullocks upon Thine altar."
    ]],
    creed: ["The Nicene Creed", [
      "I believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible.",
      "And in one Lord Jesus Christ, the Son of God, the Only-begotten, begotten of the Father before all ages. Light of Light, true God of true God, begotten, not made, of one essence with the Father, by Whom all things were made.",
      "Who for us men and for our salvation came down from heaven, and was incarnate of the Holy Spirit and the Virgin Mary, and became man.",
      "And He was crucified for us under Pontius Pilate, and suffered, and was buried.",
      "And the third day He rose again, according to the Scriptures, and ascended into heaven, and sitteth at the right hand of the Father.",
      "And He shall come again with glory to judge the living and the dead, Whose kingdom shall have no end.",
      "And in the Holy Spirit, the Lord, the Giver of life, Who proceedeth from the Father, Who with the Father and the Son together is worshipped and glorified, Who spake by the prophets.",
      "In one holy, catholic, and apostolic Church. I acknowledge one baptism for the remission of sins. I look for the resurrection of the dead, and the life of the world to come. Amen."
    ]],
    morningCore: [
      ["Morning Prayer", [
        "Having risen from sleep, I thank Thee, O Holy Trinity, because through Thy great goodness and longsuffering Thou hast not been angry with me, slothful and sinful as I am, neither hast Thou destroyed me in mine iniquities, but hast shown Thy customary love for mankind.",
        "Raise me up to glorify Thy power. Enlighten the eyes of my mind, open my mouth to meditate on Thy words, understand Thy commandments, do Thy will, sing to Thee in confession of heart, and hymn Thine all-holy name, of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen."
      ]],
      ["Prayer of St. Macarius the Great", [
        "O God, cleanse me a sinner, for I have never done anything good in Thy sight. Deliver me from the evil one, and let Thy will be in me, that I may open my unworthy mouth without condemnation and praise Thy holy name, of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen."
      ]],
      ["Intercessions", [
        "Remember, O Lord Jesus Christ our God, Thy mercies and compassions which have been from everlasting. Save and help Thy servants, and grant them peace, health, salvation, visitation, pardon, and remission of sins.",
        "Remember, O Lord, the souls of Thy servants who have departed this life in the hope of resurrection and life eternal. Grant them rest where the light of Thy countenance shines."
      ]]
    ],
    eveningCore: [
      ["Evening Thanksgiving", [
        "O Eternal God and King of all creation, Who hast granted me to reach this hour, forgive the sins that I have committed this day in deed, word, and thought.",
        "Cleanse, O Lord, my humble soul from every stain of flesh and spirit. Grant me to pass the sleep of this night in peace, that rising from my lowly bed I may please Thy most holy name all the days of my life, and overcome the enemies that war against me, both fleshly and bodiless."
      ]],
      ["Prayer of St. Antiochus", [
        "O Almighty Word of the Father, Jesus Christ, Who art Thyself perfect, for the sake of Thy great mercy never depart from me, but ever abide in me, Thy servant.",
        "O Jesus, Good Shepherd of Thy sheep, deliver me not to the rebellion of the serpent, and leave me not to the will of Satan, for the seed of corruption is in me.",
        "Do Thou, O Lord God worshipful, Holy King Jesus Christ, as I sleep, guard me by the unwaning light, Thy Holy Spirit, by Whom Thou didst sanctify Thy disciples.",
        "O Lord, grant me, Thy unworthy servant, Thy salvation upon my bed. Enlighten my mind with the light of understanding of Thy holy Gospel; my soul with the love of Thy Cross; my heart with the purity of Thy word; my body with Thy passionless Passion.",
        "Keep my thought in Thy humility, and raise me at the proper time to glorify Thee. For most glorified art Thou, together with Thy Father, Who is without beginning, and the Most Holy Spirit, unto ages of ages. Amen."
      ]],
      ["Into Thy Hands", [
        "Into Thy hands, O Lord Jesus Christ my God, I commend my spirit. Bless me, have mercy on me, and grant me life eternal. Amen."
      ]]
    ]
  };

  const hymnTexts = {
    ascension: {
      title: "Troparion of the Ascension",
      text: "Thou hast ascended in glory, O Christ our God, granting joy to Thy disciples by the promise of the Holy Spirit. Through the blessing they were assured that Thou art the Son of God, the Redeemer of the world."
    },
    pentecost: {
      title: "Troparion of Pentecost",
      text: "Blessed art Thou, O Christ our God, Who hast revealed the fishermen as most wise by sending down upon them the Holy Spirit; through them Thou didst draw the world into Thy net. O Lover of Man, glory to Thee."
    },
    apostles: {
      title: "Troparion of the Holy Apostles",
      text: "Holy Apostles, intercede with our merciful God, that He may grant to our souls forgiveness of offenses."
    },
    transfiguration: {
      title: "Troparion of the Transfiguration",
      text: "Thou wast transfigured on the mountain, O Christ God, revealing Thy glory to Thy disciples as far as they could bear it. Let Thine everlasting light shine upon us sinners, through the prayers of the Theotokos. O Giver of Light, glory to Thee."
    },
    dormition: {
      title: "Troparion of the Dormition",
      text: "In giving birth thou didst preserve thy virginity; in thy dormition thou didst not forsake the world, O Theotokos. Thou wast translated to life, O Mother of Life, and by thy prayers thou dost deliver our souls from death."
    },
    cross: {
      title: "Troparion of the Cross",
      text: "O Lord, save Thy people, and bless Thine inheritance. Grant victories to the Orthodox Christians over their adversaries, and by virtue of Thy Cross preserve Thy habitation."
    },
    nativity: {
      title: "Troparion of the Nativity",
      text: "Thy Nativity, O Christ our God, has shown to the world the light of wisdom. For by it those who worshipped the stars were taught by a star to worship Thee, the Sun of Righteousness, and to know Thee, the Dayspring from on high. O Lord, glory to Thee."
    },
    theotokos: {
      title: "Theotokion",
      text: "Through the prayers of the Theotokos, O Savior, save us. Most holy Theotokos, intercede for us and cover us beneath thy protection."
    },
    ordinary: {
      title: "Daily Hymn",
      text: "Lord Jesus Christ, Son of God, have mercy on me, a sinner. Establish this day in peace, repentance, and remembrance of Thy holy name."
    }
  };

  const fatherCycle = [
    {
      name: "St. Basil the Great",
      text: "Paraphrased reflection: fasting is not merely a rule about food. It is a school for mercy, restraint, clear speech, and freedom from the passions.",
      source: "Source pointer: Homilies on Fasting. This app gives paraphrased reflections, not verbatim patristic quotations."
    },
    {
      name: "St. John Chrysostom",
      text: "Paraphrased reflection: prayer becomes living when the heart stands before God attentively, not when the lips simply finish a formula.",
      source: "Source pointer: Homilies on Prayer and Repentance. Paraphrase, not direct quotation."
    },
    {
      name: "St. Athanasius the Great",
      text: "Paraphrased reflection: Christ heals human nature from within. The devotional rule is not escape from the world, but communion with the Physician of souls.",
      source: "Source pointer: On the Incarnation. Paraphrase, not direct quotation."
    },
    {
      name: "St. Gregory the Theologian",
      text: "Paraphrased reflection: theology begins in purification. Speak of God carefully, pray honestly, and let reverence come before explanation.",
      source: "Source pointer: Theological Orations. Paraphrase, not direct quotation."
    },
    {
      name: "St. Isaac the Syrian",
      text: "Paraphrased reflection: a merciful heart prays not only for friends, but for all creation, bearing the pain of the world before God.",
      source: "Source pointer: Ascetical Homilies. Paraphrase, not direct quotation."
    },
    {
      name: "St. Maximus the Confessor",
      text: "Paraphrased reflection: the passions divide the soul. Love gathers the scattered person back into wholeness before God and neighbor.",
      source: "Source pointer: Four Hundred Texts on Love. Paraphrase, not direct quotation."
    },
    {
      name: "St. Ephrem the Syrian",
      text: "Paraphrased reflection: repentance is not despair. It is the return of the heart to the light, with tears that become hope.",
      source: "Source pointer: Hymns and prayers of repentance. Paraphrase, not direct quotation."
    }
  ];

  const fixedFeasts = {
    gregorian: {
      "2026-08-06": { name: "Transfiguration of our Lord", theme: "gold", hymn: "transfiguration", fast: "Fish, wine, and oil are traditionally allowed." },
      "2026-08-15": { name: "Dormition of the Most Holy Theotokos", theme: "marian", hymn: "dormition", fast: "Feast day." },
      "2026-09-08": { name: "Nativity of the Most Holy Theotokos", theme: "marian", hymn: "theotokos", fast: "Feast day." },
      "2026-09-14": { name: "Elevation of the Precious and Life-Giving Cross", theme: "cross", hymn: "cross", fast: "Strict fast traditionally observed." },
      "2026-11-21": { name: "Entrance of the Theotokos into the Temple", theme: "marian", hymn: "theotokos", fast: "Fish, wine, and oil are traditionally allowed." },
      "2026-12-25": { name: "Nativity of our Lord Jesus Christ", theme: "nativity", hymn: "nativity", fast: "Feast day." }
    },
    julian: {
      "2026-08-19": { name: "Transfiguration of our Lord, Old Calendar civil date", theme: "gold", hymn: "transfiguration", fast: "Fish, wine, and oil are traditionally allowed." },
      "2026-08-28": { name: "Dormition of the Most Holy Theotokos, Old Calendar civil date", theme: "marian", hymn: "dormition", fast: "Feast day." },
      "2026-09-21": { name: "Nativity of the Most Holy Theotokos, Old Calendar civil date", theme: "marian", hymn: "theotokos", fast: "Feast day." },
      "2026-09-27": { name: "Elevation of the Precious and Life-Giving Cross, Old Calendar civil date", theme: "cross", hymn: "cross", fast: "Strict fast traditionally observed." },
      "2026-12-04": { name: "Entrance of the Theotokos into the Temple, Old Calendar civil date", theme: "marian", hymn: "theotokos", fast: "Fish, wine, and oil are traditionally allowed." }
    }
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : structuredClone(fallback);
    } catch (_) {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function parseDate(dateString) {
    const [y, m, d] = dateString.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }

  function formatDate(dateString, opts = {}) {
    const date = parseDate(dateString);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric", ...opts }).format(date);
  }

  function addDays(dateString, days) {
    const date = parseDate(dateString);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function between(dateString, start, end) {
    return dateString >= start && dateString <= end;
  }

  function clampDate(dateString) {
    if (dateString < START) return START;
    if (dateString > END) return END;
    return dateString;
  }

  function daysBetween(a, b) {
    return Math.round((parseDate(b) - parseDate(a)) / 86400000);
  }

  function getLocalLiturgical(dateString) {
    const mode = state.settings.calendarMode;
    const fixed = fixedFeasts[mode][dateString];
    const weekday = parseDate(dateString).getUTCDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let info = {
      season: "After Pentecost",
      theme: "monastic",
      themeLabel: "Monastic charcoal",
      feast: "Daily Orthodox rule",
      fast: "Consult parish practice",
      note: `${dayNames[weekday]} in the 2026 devotional cycle.`,
      hymn: "ordinary"
    };

    if (between(dateString, "2026-05-21", "2026-05-30")) {
      info = {
        season: dateString === "2026-05-21" ? "Ascension" : "Afterfeast of Ascension",
        theme: "ascension",
        themeLabel: "Brilliant gold",
        feast: dateString === "2026-05-21" ? "The Ascension of our Lord" : "Post-Ascension season",
        fast: "No fast in the festal period.",
        note: "Paschal cycle: Ascension falls forty days after Pascha. The season continues toward Pentecost.",
        hymn: "ascension"
      };
    }

    if (between(dateString, "2026-05-31", "2026-06-07")) {
      info = {
        season: dateString === "2026-05-31" ? "Pentecost" : "Afterfeast of Pentecost",
        theme: "pentecost",
        themeLabel: "Pentecost green",
        feast: dateString === "2026-05-31" ? "Holy Pentecost" : "Pentecostarion afterfeast",
        fast: "Fast-free week through June 7.",
        note: "The green theme marks the descent of the Holy Spirit and the life of the Church.",
        hymn: "pentecost"
      };
    }

    if (between(dateString, "2026-06-08", "2026-06-28")) {
      info = {
        season: "Apostles' Fast",
        theme: "fast",
        themeLabel: "Ascetic violet",
        feast: "Apostles' Fast",
        fast: "Apostles' Fast, local fasting discipline varies.",
        note: "The Apostles' Fast begins on the Monday after All Saints and runs to the eve of Saints Peter and Paul.",
        hymn: "apostles"
      };
    }

    if (dateString === "2026-06-29") {
      info = {
        season: "Apostles Peter and Paul",
        theme: "gold",
        themeLabel: "Apostolic gold",
        feast: "Holy, glorious, and all-laudable Apostles Peter and Paul",
        fast: "Feast day.",
        note: "The Apostles' Fast has concluded.",
        hymn: "apostles"
      };
    }

    const dormitionFast = mode === "gregorian" ? ["2026-08-01", "2026-08-14"] : ["2026-08-14", "2026-08-27"];
    if (between(dateString, dormitionFast[0], dormitionFast[1])) {
      info = {
        season: "Dormition Fast",
        theme: "marian",
        themeLabel: "Marian blue",
        feast: "Dormition Fast",
        fast: "Dormition Fast, local fasting discipline varies.",
        note: "A focused fast in honor of the Most Holy Theotokos.",
        hymn: "theotokos"
      };
    }

    const nativityFast = mode === "gregorian" ? ["2026-11-15", "2026-12-24"] : ["2026-11-28", "2026-12-31"];
    if (between(dateString, nativityFast[0], nativityFast[1])) {
      info = {
        season: "Nativity Fast",
        theme: "fast",
        themeLabel: "Advent violet",
        feast: "Nativity Fast",
        fast: "Nativity Fast, local fasting discipline varies.",
        note: mode === "julian" ? "Old Calendar Nativity Fast begins on November 28 civil date and continues into January 2027." : "New/Revised Julian Nativity Fast runs from November 15 through December 24.",
        hymn: "nativity"
      };
    }

    if (fixed) {
      info = {
        season: fixed.name,
        theme: fixed.theme,
        themeLabel: themeName(fixed.theme),
        feast: fixed.name,
        fast: fixed.fast,
        note: "Fixed-feast calendar mode is controlled in Settings.",
        hymn: fixed.hymn
      };
    }

    if (!fixed && (weekday === 3 || weekday === 5) && info.theme === "monastic") {
      info.fast = "Wednesday or Friday fast, local practice may vary.";
      info.hymn = "cross";
      info.theme = "cross";
      info.themeLabel = "Cross red";
    }

    if (!fixed && weekday === 0 && info.hymn === "ordinary") {
      info.feast = "Lord's Day, Resurrectional cycle";
      info.theme = "gold";
      info.themeLabel = "Resurrection gold";
    }

    return info;
  }

  function themeName(theme) {
    return {
      ascension: "Brilliant gold",
      nativity: "Brilliant gold",
      gold: "Liturgical gold",
      pentecost: "Pentecost green",
      green: "Green",
      marian: "Marian blue",
      cross: "Cross red",
      red: "Red",
      fast: "Ascetic violet",
      violet: "Violet",
      monastic: "Monastic charcoal"
    }[theme] || "Monastic charcoal";
  }

  function apiUrl(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return `https://orthocal.info/api/${state.settings.calendarMode}/${year}/${month}/${day}/`;
  }

  function cacheKey(dateString) {
    return `${state.settings.calendarMode}:${dateString}`;
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("calendar")) db.createObjectStore("calendar");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    if (!state.db) return null;
    return new Promise((resolve) => {
      const tx = state.db.transaction("calendar", "readonly");
      const req = tx.objectStore("calendar").get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async function idbSet(key, value) {
    if (!state.db) return;
    return new Promise((resolve) => {
      const tx = state.db.transaction("calendar", "readwrite");
      tx.objectStore("calendar").put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async function idbClear() {
    if (!state.db) return;
    return new Promise((resolve) => {
      const tx = state.db.transaction("calendar", "readwrite");
      tx.objectStore("calendar").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async function idbCount() {
    if (!state.db) return 0;
    return new Promise((resolve) => {
      const tx = state.db.transaction("calendar", "readonly");
      const req = tx.objectStore("calendar").count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  }

  async function fetchCalendar(dateString, { force = false } = {}) {
    const key = cacheKey(dateString);
    if (!force) {
      const cached = await idbGet(key);
      if (cached) return { data: cached.data, source: "Cached" };
    }

    try {
      const response = await fetch(apiUrl(dateString), { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      await idbSet(key, { data, savedAt: new Date().toISOString() });
      return { data, source: "Orthocal API" };
    } catch (error) {
      const cached = await idbGet(key);
      if (cached) return { data: cached.data, source: "Cached" };
      return { data: null, source: "Local engine", error: error.message };
    }
  }

  function extractCalendarData(day) {
    if (!day) return null;
    const title = day.summary_title || day.title || day.name || "Orthodox calendar data";
    const fast = [day.fast_level_desc, day.fast_exception_desc].filter(Boolean).join("; ") || day.fast || day.fast_desc || "Fasting guidance not returned.";
    const readingsRaw = Array.isArray(day.readings) ? day.readings : [];
    const readings = readingsRaw.map((r) => {
      if (typeof r === "string") return { display: r, type: "Reading" };
      return {
        display: r.display || r.reading || r.name || r.citation || [r.book, r.chapter, r.verses].filter(Boolean).join(" ") || "Reading",
        type: r.description || r.source || r.type || "Reading",
        url: r.url || r.link || ""
      };
    }).filter(r => r.display);

    const feastFields = [];
    ["feasts", "commemorations", "saints", "titles"].forEach((field) => {
      const value = day[field];
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "string") feastFields.push(item);
          else if (item && typeof item === "object") feastFields.push(item.title || item.name || item.summary || item.description || "");
        });
      }
    });

    if (day.summary) feastFields.push(day.summary);
    if (day.summary_title && !feastFields.includes(day.summary_title)) feastFields.unshift(day.summary_title);

    return {
      title,
      fast,
      readings,
      feasts: [...new Set(feastFields.filter(Boolean))]
    };
  }

  function renderCalendarOutput(data, source, local) {
    els.apiStatus.textContent = source;
    if (!data) {
      els.calendarOutput.innerHTML = `<p>Verified online calendar data is not available right now. The local 2026 season engine is active.</p><ul class="calendar-list"><li>${escapeHTML(local.feast)}</li><li>${escapeHTML(local.fast)}</li></ul>`;
      els.readingsOutput.innerHTML = `<p>Readings will appear here after online lookup or sync. The daily prayer rule remains fully available offline.</p>`;
      return;
    }

    const extracted = extractCalendarData(data);
    els.fastLabel.textContent = extracted.fast || local.fast;

    const feastList = extracted.feasts.length ? extracted.feasts : [extracted.title];
    els.calendarOutput.innerHTML = `<ul class="calendar-list">${feastList.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul><p class="micro-note">Fast: ${escapeHTML(extracted.fast || local.fast)}</p>`;

    if (extracted.readings.length) {
      els.readingsOutput.innerHTML = `<ul>${extracted.readings.map(r => `<li><strong>${escapeHTML(r.type)}:</strong> ${escapeHTML(r.display)}</li>`).join("")}</ul>`;
    } else {
      els.readingsOutput.innerHTML = `<p>No readings were returned by the source for this date.</p>`;
    }
  }

  function renderPrayers() {
    const morningSections = [...prayers.opening, prayers.psalm50, prayers.creed, ...prayers.morningCore];
    const eveningSections = [...prayers.opening, prayers.psalm50, ...prayers.eveningCore, prayers.creed];
    els.morningRule.innerHTML = prayerHTML(morningSections);
    els.eveningRule.innerHTML = prayerHTML(eveningSections);
  }

  function prayerHTML(sections) {
    return sections.map(([title, paragraphs]) => {
      return `<section class="prayer-section"><h3>${escapeHTML(title)}</h3>${paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join("")}</section>`;
    }).join("");
  }

  function renderDiptychesPreview() {
    const living = state.diptyches.living.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const departed = state.diptyches.departed.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const livingText = living.length ? living.join(", ") : "No living names saved.";
    const departedText = departed.length ? departed.join(", ") : "No departed names saved.";
    els.diptychPreview.innerHTML = `<p><strong>Living:</strong> ${escapeHTML(livingText)}</p><p><strong>Departed:</strong> ${escapeHTML(departedText)}</p>`;
  }

  function loadDayState(dateString) {
    const day = state.tracker[dateString] || { morning: false, evening: false, note: "" };
    els.morningDone.checked = Boolean(day.morning);
    els.eveningDone.checked = Boolean(day.evening);
    els.dailyNote.value = day.note || "";
  }

  function saveDayState() {
    const dateString = els.dateInput.value;
    state.tracker[dateString] = {
      morning: els.morningDone.checked,
      evening: els.eveningDone.checked,
      note: els.dailyNote.value
    };
    saveJSON("odp-tracker", state.tracker);
    renderStreak();
  }

  function renderStreak() {
    const current = els.dateInput.value;
    let d = current;
    let count = 0;
    while (d >= START) {
      const entry = state.tracker[d];
      if (entry && entry.morning && entry.evening) {
        count += 1;
        d = addDays(d, -1);
      } else {
        break;
      }
    }
    els.streakLabel.textContent = `${count} ${count === 1 ? "day" : "days"}`;
  }

  function getFather(dateString) {
    const index = Math.abs(daysBetween(START, dateString)) % fatherCycle.length;
    return fatherCycle[index];
  }

  function renderLocal(dateString) {
    const local = getLocalLiturgical(dateString);
    document.body.dataset.theme = local.theme;
    els.todayTitle.textContent = formatDate(dateString);
    els.seasonLabel.textContent = local.season;
    els.themeLabel.textContent = local.themeLabel;
    els.fastLabel.textContent = local.fast;
    els.localFeast.textContent = local.feast;
    els.seasonNote.textContent = local.note;

    const hymn = hymnTexts[local.hymn] || hymnTexts.ordinary;
    els.hymnTitle.textContent = hymn.title;
    els.troparionText.textContent = hymn.text;

    const father = getFather(dateString);
    els.fatherTitle.textContent = father.name;
    els.fatherText.textContent = father.text;
    els.fatherSource.textContent = father.source;

    return local;
  }

  async function renderDay({ force = false } = {}) {
    const dateString = clampDate(els.dateInput.value || START);
    els.dateInput.value = dateString;
    const local = renderLocal(dateString);
    loadDayState(dateString);
    renderStreak();

    els.calendarOutput.textContent = "Loading calendar data.";
    els.readingsOutput.textContent = "Loading readings.";
    const result = await fetchCalendar(dateString, { force });
    renderCalendarOutput(result.data, result.source, local);
    await updateCacheCount();
  }

  function applySettings() {
    els.calendarMode.value = state.settings.calendarMode;
    els.fontMode.value = state.settings.fontMode;
    els.fontSize.value = state.settings.fontSize;
    els.parchmentMode.checked = Boolean(state.settings.parchmentMode);
    els.lowLightMode.checked = Boolean(state.settings.lowLightMode);

    document.body.classList.toggle("font-serif", state.settings.fontMode === "serif");
    document.body.classList.toggle("font-sans", state.settings.fontMode === "sans");
    document.body.classList.toggle("parchment", Boolean(state.settings.parchmentMode));
    document.body.classList.toggle("low-light", Boolean(state.settings.lowLightMode));
    document.documentElement.style.setProperty("--prayer-size", `${state.settings.fontSize}px`);
  }

  function saveSettings() {
    state.settings.calendarMode = els.calendarMode.value;
    state.settings.fontMode = els.fontMode.value;
    state.settings.fontSize = Number(els.fontSize.value);
    state.settings.parchmentMode = els.parchmentMode.checked;
    state.settings.lowLightMode = els.lowLightMode.checked;
    saveJSON("odp-settings", state.settings);
    applySettings();
  }

  async function updateCacheCount() {
    const count = await idbCount();
    els.cacheCount.textContent = `${count} cached`;
  }

  function allDates() {
    const dates = [];
    let d = START;
    while (d <= END) {
      dates.push(d);
      d = addDays(d, 1);
    }
    return dates;
  }

  async function syncAllDates() {
    state.syncAbort = false;
    const dates = allDates();
    els.syncProgress.max = dates.length;
    els.syncProgress.value = 0;
    els.syncMessage.textContent = "Starting sync.";
    els.syncAllBtn.disabled = true;

    let ok = 0;
    let failed = 0;
    for (let i = 0; i < dates.length; i += 1) {
      if (state.syncAbort) break;
      const d = dates[i];
      try {
        const response = await fetch(apiUrl(d), { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        await idbSet(cacheKey(d), { data, savedAt: new Date().toISOString() });
        ok += 1;
      } catch (_) {
        failed += 1;
      }
      els.syncProgress.value = i + 1;
      els.syncMessage.textContent = `Synced ${ok} dates. ${failed ? `${failed} failed.` : ""}`;
      await delay(80);
    }

    els.syncAllBtn.disabled = false;
    await updateCacheCount();
    await renderDay();
    els.syncMessage.textContent = failed ? `Finished with ${failed} failed requests. You can run sync again later.` : "Finished. Calendar data is cached for offline reading.";
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function exportData() {
    const payload = {
      app: "Orthodox Daily Prayer 2026",
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      tracker: state.tracker,
      diptyches: state.diptyches
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orthodox-prayer-data-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function importData(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (payload.settings) state.settings = { ...defaultSettings, ...payload.settings };
      if (payload.tracker && typeof payload.tracker === "object") state.tracker = payload.tracker;
      if (payload.diptyches && typeof payload.diptyches === "object") state.diptyches = { living: payload.diptyches.living || "", departed: payload.diptyches.departed || "" };
      saveJSON("odp-settings", state.settings);
      saveJSON("odp-tracker", state.tracker);
      saveJSON("odp-diptyches", state.diptyches);
      applySettings();
      els.livingNames.value = state.diptyches.living;
      els.departedNames.value = state.diptyches.departed;
      renderDiptychesPreview();
      await renderDay();
      alert("Prayer data imported.");
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setupEvents() {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        $(tab.dataset.panel).classList.add("active");
      });
    });

    els.dateInput.addEventListener("change", () => renderDay());
    els.prevDay.addEventListener("click", () => {
      els.dateInput.value = clampDate(addDays(els.dateInput.value, -1));
      renderDay();
    });
    els.nextDay.addEventListener("click", () => {
      els.dateInput.value = clampDate(addDays(els.dateInput.value, 1));
      renderDay();
    });
    els.todayBtn.addEventListener("click", () => {
      const today = new Date();
      const local = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yyyy = local.getFullYear();
      const mm = String(local.getMonth() + 1).padStart(2, "0");
      const dd = String(local.getDate()).padStart(2, "0");
      els.dateInput.value = clampDate(`${yyyy}-${mm}-${dd}`);
      renderDay();
    });

    [els.morningDone, els.eveningDone].forEach(el => el.addEventListener("change", saveDayState));
    els.dailyNote.addEventListener("input", debounce(saveDayState, 250));
    els.clearDayBtn.addEventListener("click", () => {
      delete state.tracker[els.dateInput.value];
      saveJSON("odp-tracker", state.tracker);
      loadDayState(els.dateInput.value);
      renderStreak();
    });

    document.querySelectorAll(".mark-rule").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.rule === "morning") els.morningDone.checked = true;
        if (btn.dataset.rule === "evening") els.eveningDone.checked = true;
        saveDayState();
      });
    });

    els.livingNames.value = state.diptyches.living;
    els.departedNames.value = state.diptyches.departed;
    els.saveDiptyches.addEventListener("click", () => {
      state.diptyches = { living: els.livingNames.value, departed: els.departedNames.value };
      saveJSON("odp-diptyches", state.diptyches);
      renderDiptychesPreview();
    });
    els.insertDiptyches.addEventListener("click", renderDiptychesPreview);

    [els.calendarMode, els.fontMode, els.fontSize, els.parchmentMode, els.lowLightMode].forEach((el) => {
      el.addEventListener("change", async () => {
        saveSettings();
        await renderDay();
      });
      el.addEventListener("input", () => {
        if (el === els.fontSize) {
          state.settings.fontSize = Number(els.fontSize.value);
          saveJSON("odp-settings", state.settings);
          applySettings();
        }
      });
    });

    els.refreshReadings.addEventListener("click", () => renderDay({ force: true }));
    els.syncAllBtn.addEventListener("click", syncAllDates);
    els.clearCacheBtn.addEventListener("click", async () => {
      await idbClear();
      await updateCacheCount();
      await renderDay({ force: true });
    });

    els.exportDataBtn.addEventListener("click", exportData);
    els.importDataInput.addEventListener("change", (event) => importData(event.target.files[0]));
    els.installHintBtn.addEventListener("click", () => {
      document.querySelector('[data-panel="settingsPanel"]').click();
      els.installHelp.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  async function registerSW() {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      try {
        await navigator.serviceWorker.register("sw.js");
      } catch (_) {
        // The app still works without a service worker.
      }
    }
  }

  async function init() {
    applySettings();
    renderPrayers();
    renderDiptychesPreview();
    setupEvents();
    try { state.db = await openDB(); } catch (_) { state.db = null; }
    await updateCacheCount();
    await renderDay();
    await registerSW();
  }

  init();
})();
