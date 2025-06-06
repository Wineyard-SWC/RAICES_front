export interface Ring<T extends Float32Array | Int16Array | number[]> {
  push: (v: number | number[]) => void;
  drain: () => number[];
  latest: (n?: number) => number[];
}

export function createRing(capacity: number): Ring<Float32Array> {
  const buf = new Float32Array(capacity);
  let idx = 0,
    filled = false;

  const push = (v: number | number[]) => {
    if (Array.isArray(v)) {
      v.forEach(push);
      return;
    }
    buf[idx] = v;
    idx = (idx + 1) % capacity;
    if (!filled && idx === 0) filled = true;
  };

  const drain = () => {
    const len = filled ? capacity : idx;
    if (len === 0) return [];
    const out = new Float32Array(len);
    if (!filled) out.set(buf.subarray(0, len));
    else {
      out.set(buf.subarray(idx));
      out.set(buf.subarray(0, idx), capacity - idx);
    }
    idx = 0;
    filled = false;
    return Array.from(out);
  };

  const latest = (n = capacity) => {
    const len = Math.min(n, filled ? capacity : idx);
    const out = new Array(len);
    for (let i = 0; i < len; i++)
      out[i] = buf[(idx - len + i + capacity) % capacity];
    return out;
  };

  return { push, drain, latest };
}