import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as HangulRomanization from "hangul-romanization";
import {
  BookOpen,
  FlipHorizontal2,
  Volume2,
  Play,
  Pause,
  Info,
  Settings,
  X,
} from "lucide-react";

const Button = ({ className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-2xl shadow-sm border bg-white hover:bg-gray-50 active:scale-[0.99] transition ${className}`}
    {...props}
  />
);
const Card = ({ className = "", ...props }) => (
  <div
    className={`rounded-2xl shadow-sm border bg-white ${className}`}
    {...props}
  />
);
const Input = ({ className = "", ...props }) => (
  <input
    className={`px-3 py-2 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${className}`}
    {...props}
  />
);
const Select = ({ className = "", ...props }) => (
  <select
    className={`px-3 py-2 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${className}`}
    {...props}
  />
);

const useSettings = () => {
  const [showRom, setShowRom] = useState(
    () => localStorage.getItem("showRom") !== "0"
  );
  const [ttsRate, setTtsRate] = useState(() =>
    Number(localStorage.getItem("ttsRate") || 0.95)
  );
  useEffect(() => {
    localStorage.setItem("showRom", showRom ? "1" : "0");
  }, [showRom]);
  useEffect(() => {
    localStorage.setItem("ttsRate", String(ttsRate));
  }, [ttsRate]);
  return { showRom, setShowRom, ttsRate, setTtsRate };
};

function speakKorean(text, rate = 0.95) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = rate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

function FlashCard({ item, flipped, onFlip, onSpeak, showRom }) {
  const rom =
    item.romanization ||
    (HangulRomanization?.convert
      ? HangulRomanization.convert(item.hangul)
      : "");
  const meaningLine = [item.meaning_id, item.meaning_en]
    .filter(Boolean)
    .join(" / ");
  const exKo = item.example_ko?.trim()?.length
    ? item.example_ko
    : `예: ${item.hangul}`;
  const exId = item.example_id?.trim()?.length
    ? item.example_id
    : "Contoh: (otomatis)";
  const exEn = item.example_en?.trim()?.length
    ? item.example_en
    : "Example: (auto)";
  return (
    <motion.div layout className="w-full h-64 sm:h-72 md:h-80 lg:h-96">
      <Card className="w-full h-full p-5 flex items-center justify-center bg-gradient-to-br from-white to-indigo-50">
        <div className="w-full h-full relative">
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              aria-label="Pronounce"
              onClick={onSpeak}
              className="!px-3 !py-2"
            >
              <Volume2 size={18} />
            </Button>
            <Button aria-label="Flip" onClick={onFlip} className="!px-3 !py-2">
              <FlipHorizontal2 size={18} />
            </Button>
          </div>
          <AnimatePresence mode="wait">
            {!flipped ? (
              <motion.div
                key="front"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full grid place-content-center text-center"
              >
                <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900">
                    {item.hangul || "예: 한국어"}
                  </div>
                  {showRom && (
                    <div className="mt-2 text-base sm:text-lg text-gray-600">
                      {item.hangul ? rom : "han-gug-eo"}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full grid place-content-center text-center"
              >
                <div className="space-y-2">
                  <div className="text-xl sm:text-2xl font-medium text-gray-900">
                    {meaningLine || "Bahasa Korea / Korean language"}
                  </div>
                  <div className="text-gray-700">
                    <div className="text-base">
                      {exKo || "예: 한국어 좋아요."}
                    </div>
                    <div className="text-sm text-gray-500">
                      {exId || "Contoh: (otomatis)"}
                      {item.example_en ? ` / ${exEn}` : ""}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

function QuizMC({ item, pool, onResult, showRom }) {
  const rom =
    item.romanization ||
    (HangulRomanization?.convert
      ? HangulRomanization.convert(item.hangul)
      : "");
  const options = useMemo(() => {
    const opts = new Set([
      item.meaning_id || item.meaning_en || "Bahasa Korea",
    ]);
    while (opts.size < 4 && pool.length) {
      const r = pool[Math.floor(Math.random() * pool.length)];
      const m = r.meaning_id || r.meaning_en;
      if (m && m !== (item.meaning_id || item.meaning_en)) opts.add(m);
      if (opts.size > 10) break;
    }
    return Array.from(opts)
      .slice(0, 4)
      .sort(() => Math.random() - 0.5);
  }, [item, pool]);
  return (
    <Card className="p-4">
      <div className="font-medium text-gray-900 mb-2">
        Pilih arti yang benar untuk:
      </div>
      <div className="text-2xl font-semibold mb-4">
        {item.hangul || "한국어"}{" "}
        {showRom && (
          <span className="text-gray-500 text-base">
            ({item.hangul ? rom : "han-gug-eo"})
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((o) => (
          <Button
            key={o}
            onClick={() => onResult(o === (item.meaning_id || item.meaning_en))}
          >
            {o}
          </Button>
        ))}
      </div>
    </Card>
  );
}

function QuizFill({ item, onResult, showRom }) {
  const rom =
    item.romanization ||
    (HangulRomanization?.convert
      ? HangulRomanization.convert(item.hangul)
      : "");
  const [val, setVal] = useState("");
  const corrects = [
    item.meaning_id?.toLowerCase(),
    item.meaning_en?.toLowerCase(),
  ].filter(Boolean);
  const check = () => onResult(corrects.includes(val.trim().toLowerCase()));
  return (
    <Card className="p-4">
      <div className="font-medium text-gray-900 mb-2">
        Isikan arti (ID/EN) untuk:
      </div>
      <div className="text-2xl font-semibold mb-4">
        {item.hangul || "한국어"}{" "}
        {showRom && (
          <span className="text-gray-500 text-base">
            ({item.hangul ? rom : "han-gug-eo"})
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Tulis arti dalam Bahasa Indonesia atau Inggris"
          className="flex-1"
        />
        <Button
          onClick={check}
          className="!bg-indigo-600 text-white border-indigo-600 hover:!bg-indigo-700"
        >
          Cek
        </Button>
      </div>
    </Card>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm grid place-items-center p-4">
      <Card className="relative w-full max-w-2xl p-5">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-xl hover:bg-gray-50"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 mb-3">
          <Info className="text-indigo-600" />
          <div className="font-semibold">{title}</div>
        </div>
        <div className="prose prose-sm max-w-none">{children}</div>
      </Card>
    </div>
  );
}

export default function AppPatched({ data = [] }) {
  const [level, setLevel] = useState("beginner");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState("cards");
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [items, setItems] = useState(data);

  const settings = useSettings();
  const list = useMemo(
    () => items.filter((x) => x.level === level),
    [items, level]
  );
  const cur = list[index] || list[0] || {};

  function speakNow() {
    if (cur?.hangul) {
      try {
        const u = new SpeechSynthesisUtterance(cur.hangul);
        u.lang = "ko-KR";
        u.rate = settings.ttsRate;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {}
    }
  }

  React.useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [level]);

  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      speakNow();
      setIndex((i) => (i + 1) % Math.max(1, list.length));
    }, 2500);
    return () => clearInterval(t);
  }, [playing, cur?.hangul, list.length, settings.ttsRate]);

  const fileRef = React.useRef(null);
  const onFile = async (f) => {
    const text = await f.text();
    const rows = text.split(/\r?\n/);
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        setItems(json);
        return;
      }
    } catch {}
    const header = rows.shift().split(",");
    const idx = {
      id: header.indexOf("id"),
      level: header.indexOf("level"),
      hangul: header.indexOf("hangul"),
      romanization: header.indexOf("romanization"),
      meaning_id: header.indexOf("meaning_id"),
      meaning_en: header.indexOf("meaning_en"),
      example_ko: header.indexOf("example_ko"),
      example_id: header.indexOf("example_id"),
      example_en: header.indexOf("example_en"),
    };
    const dataRows = rows
      .filter((r) => r.trim().length)
      .map((r) => {
        const cols = r.split(",");
        return {
          id: cols[idx.id] || String(Math.random()),
          level: (cols[idx.level] || "beginner").toLowerCase(),
          hangul: cols[idx.hangul] || "",
          romanization: cols[idx.romanization] || "",
          meaning_id: cols[idx.meaning_id] || "",
          meaning_en: cols[idx.meaning_en] || "",
          example_ko: cols[idx.example_ko] || "",
          example_id: cols[idx.example_id] || "",
          example_en: cols[idx.example_en] || "",
        };
      })
      .filter((x) => x.hangul);
    setItems(dataRows);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <BookOpen className="text-indigo-600" />
          <div className="font-semibold">Korean Flashcards</div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-2xl shadow-sm border bg-white hover:bg-gray-50"
              onClick={() => setShowAbout(true)}
            >
              <span className="inline-flex items-center gap-2">
                <Info size={16} />
                About
              </span>
            </button>
            <button
              className="px-4 py-2 rounded-2xl shadow-sm border bg-white hover:bg-gray-50"
              onClick={() => setShowSettings(true)}
            >
              <span className="inline-flex items-center gap-2">
                <Settings size={16} />
                Settings
              </span>

              <button
                className="px-4 py-2 rounded-2xl shadow-sm border bg-white hover:bg-gray-50"
                onClick={() => fileRef.current?.click()}
              >
                Import CSV/JSON
              </button>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Level</div>
              <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Mode</div>
              <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="cards">Flash Cards</option>
                <option value="quiz-mc">Quiz: Multiple Choice</option>
                <option value="quiz-fill">Quiz: Fill in the Blank</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 rounded-2xl shadow-sm border bg-white hover:bg-gray-50"
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? (
                  <span className="flex w-fit items-center gap-2">
                    <Pause size={16} /> Stop Auto
                  </span>
                ) : (
                  <span className="flex w-fit items-center gap-2">
                    <Play size={16} /> Auto Play
                  </span>
                )}
              </button>
              <button
                className="px-4 py-2 rounded-2xl shadow-sm border bg-white hover:bg-gray-50"
                onClick={speakNow}
              >
                <span className="inline-flex items-center gap-2">
                  <Volume2 size={16} />
                  Pronounce
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json"
                hidden
                onChange={(e) =>
                  e.target.files?.[0] && onFile(e.target.files[0])
                }
              />
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Cards in level: {list.length || 0}</div>
            </div>
          </div>
        </Card>

        {cur.hangul &&
          (mode === "cards" ? (
            <FlashCard
              item={cur}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
              onSpeak={speakNow}
              showRom={settings.showRom}
            />
          ) : mode === "quiz-mc" ? (
            <QuizMC
              item={cur}
              pool={list}
              onResult={() =>
                setIndex((i) => (i + 1) % Math.max(1, list.length))
              }
              showRom={settings.showRom}
            />
          ) : (
            <QuizFill
              item={cur}
              onResult={() =>
                setIndex((i) => (i + 1) % Math.max(1, list.length))
              }
              showRom={settings.showRom}
            />
          ))}
      </main>

      <Modal
        open={showAbout}
        onClose={() => setShowAbout(false)}
        title="About & Licenses"
      >
        <p>
          Kosakata Intermediate/Advanced bisa diambil dari daftar frekuensi
          Wiktionary (CC BY-SA). Atribusi wajib.
        </p>
        <ul className="list-disc ml-6">
          <li>Wiktionary Frequency lists/Korean & Korean 5800 (CC BY-SA)</li>
          <li>Romanisasi: hangul-romanization (MIT) / kroman (MIT)</li>
        </ul>
      </Modal>

      <Modal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showRom}
              onChange={(e) => settings.setShowRom(e.target.checked)}
            />{" "}
            Tampilkan romanisasi
          </label>
          <div>
            <div className="text-sm text-gray-600 mb-1">
              Kecepatan TTS: {settings.ttsRate.toFixed(2)}
            </div>
            <input
              type="range"
              min="0.7"
              max="1.1"
              step="0.05"
              value={settings.ttsRate}
              onChange={(e) => settings.setTtsRate(Number(e.target.value))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
