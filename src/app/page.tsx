"use client";

import { useEffect, useRef, useState } from "react";
import { Apple } from "lucide-react";

const W = 450;
const H = 300;
const PLAYER_W = 56;
const PLAYER_H = 18;
const APPLE_SIZE = 28;

const FALL_SPEED = 2.2; // px per frame (~60fps)
const MOVE_SPEED = 4.6; // px per frame
const SCORE_PER_APPLE = 5;
const GOLDEN_START_SCORE = 20;
const GOLDEN_SCORE = 15;

type AppleState = {
  x: number;
  y: number;
};

function randomApple(currentScore: number): AppleState {
  return {
    x: Math.random() * (W - APPLE_SIZE),
    y: 0,
  };
}

export default function Page() {
  const [score, setScore] = useState(0);
  const [apple, setApple] = useState<AppleState>({
    x: 0,
    y: -APPLE_SIZE,
  });
  const appleY = Math.min(apple.y, H - APPLE_SIZE);
  const isGoldenNow = score >= GOLDEN_START_SCORE;
  const [playerX, setPlayerX] = useState((W - PLAYER_W) / 2);
  const [ready, setReady] = useState(false);

  const playerXRef = useRef(playerX);
  const scoreRef = useRef(score);
  const runningRef = useRef(false);
  const rafRef = useRef(0);
  const keys = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });

  useEffect(() => {
    setApple(randomApple(scoreRef.current));
    setReady(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (runningRef.current) return;
    const w = window as unknown as { __appleGameRunning?: boolean };
    if (w.__appleGameRunning) return;
    w.__appleGameRunning = true;
    runningRef.current = true;

    const tick = () => {
      setPlayerX((x) => {
        let next = x;
        if (keys.current.left) next -= MOVE_SPEED;
        if (keys.current.right) next += MOVE_SPEED;
        next = Math.max(0, Math.min(W - PLAYER_W, next));
        playerXRef.current = next;
        return next;
      });

      setApple((a) => {
        const nextY = a.y + FALL_SPEED;
        const nextX = a.x;
        const px = playerXRef.current;
        const playerY = H - PLAYER_H - 8;

        const hit =
          nextY + APPLE_SIZE >= playerY &&
          nextY <= playerY + PLAYER_H &&
          nextX + APPLE_SIZE >= px &&
          nextX <= px + PLAYER_W;

        if (hit) {
          const points =
            scoreRef.current >= GOLDEN_START_SCORE
              ? GOLDEN_SCORE
              : SCORE_PER_APPLE;
          setScore((s) => {
            const next = s + points;
            scoreRef.current = next;
            return next;
          });
          return randomApple(scoreRef.current);
        }

        if (nextY + APPLE_SIZE >= H) {
          return randomApple(scoreRef.current);
        }

        return { x: nextX, y: nextY };
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      w.__appleGameRunning = false;
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  return (
    <main className="min-h-screen bg-amber-50 text-slate-900 flex items-center justify-center p-6">
      <div className="w-[520px]">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">りんご拾い</h1>
          <div className="text-sm">
            スコア: <span className="font-semibold">{score}</span>
          </div>
        </div>

        <div
          className="relative rounded-xl border border-blue-200 bg-gradient-to-b from-sky-200 to-sky-50 shadow-inner"
          style={{ width: W, height: H }}
        >
          {ready && (
            <div
              className="absolute"
              style={{ left: apple.x, top: appleY, width: APPLE_SIZE, height: APPLE_SIZE }}
            >
              <Apple
                className={
                  isGoldenNow
                    ? "text-amber-400"
                    : "text-red-500"
                }
                size={APPLE_SIZE}
                strokeWidth={1}
                fill="currentColor"
              />
            </div>
          )}

          <div
            className="absolute bottom-2 rounded-lg bg-amber-700"
            style={{ left: playerX, width: PLAYER_W, height: PLAYER_H }}
          >
            <div className="h-full w-full rounded-lg border border-amber-800 bg-amber-600" />
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-600">← / → で左右移動</div>
        <div className="mt-1 text-[11px] text-slate-500">
          赤: {SCORE_PER_APPLE}点 / 金: {GOLDEN_SCORE}点（{GOLDEN_START_SCORE}点以上で出現）
        </div>
      </div>
    </main>
  );
}
