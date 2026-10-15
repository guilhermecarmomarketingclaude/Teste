import raw from "./timeline.json";

export type Word = [string, number, number];
export type VoCue = { id: string; file: string; start: number; dur: number; text: string };

export const TL = raw as unknown as {
  fps: number;
  duration: number;
  vo: VoCue[];
  words: Record<string, Word[]>;
  scenes: Record<string, [number, number]>;
  music: {
    file: string;
    bpm: number;
    beat: number;
    bar: number;
    segments: [number, number, number][];
    stop: number;
    drops: number[];
    gapBar: [number, number];
    miniBreak: [number, number];
  };
};

export const vo = (id: string) => {
  const cue = TL.vo.find((v) => v.id === id);
  if (!cue) throw new Error(`Unknown VO ${id}`);
  return cue;
};

// Absolute (ad-time) word timings for a narration line.
export const wordsAt = (id: string) => {
  const cue = vo(id);
  return TL.words[id].map(([w, a, b]) => ({ w, a: cue.start + a, b: cue.start + b }));
};

// Absolute time of the n-th occurrence of a word (prefix match, punctuation ignored) in a line.
export const wordTime = (id: string, word: string, nth = 0) => {
  const norm = (s: string) => s.toLowerCase().replace(/[.,:;!?…]/g, "");
  const list = wordsAt(id).filter((x) => norm(x.w) === norm(word));
  if (!list[nth]) throw new Error(`Word ${word} not in ${id}`);
  return list[nth];
};

export const scene = (k: string) => TL.scenes[k];
