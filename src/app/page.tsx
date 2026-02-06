"use client"

import { Apple, Heart } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const W = 450
const H = 300
const PLAYER_W = 56
const PLAYER_H = 18
const APPLE_SIZE = 28
const PLAYER_BOTTOM_OFFSET = 8

const FALL_SPEED = 2.2 // px per frame (~60fps)
const MOVE_SPEED = 4.6 // px per frame
const BLUE_SCORE = 5
const RED_SCORE = 10
const GOLDEN_SCORE = 15
const RED_START_SCORE = 20
const GOLD_START_SCORE = 100
const RED_CHANCE_20_99 = 0.4
const RED_CHANCE_100 = 0.3
const GOLD_CHANCE_100 = 0.1
const HEART_SLOTS = ["slot-1", "slot-2", "slot-3"] as const

type AppleType = "blue" | "red" | "gold"
type AppleState = {
	x: number
	y: number
	type: AppleType
}

export default function Page() {
	const [score, setScore] = useState(0)
	const [misses, setMisses] = useState(0)
	const [gameOver, setGameOver] = useState(false)
	const [started, setStarted] = useState(false)
	const [apple, setApple] = useState<AppleState>({
		x: 0,
		y: -APPLE_SIZE,
		type: "blue",
	})
	const appleY = Math.min(apple.y, H - APPLE_SIZE)
	const [playerX, setPlayerX] = useState((W - PLAYER_W) / 2)
	const [ready, setReady] = useState(false)

	const playerXRef = useRef(playerX)
	const scoreRef = useRef(score)
	const missesRef = useRef(misses)
	const startedRef = useRef(started)
	const gameOverRef = useRef(gameOver)
	const runningRef = useRef(false)
	const rafRef = useRef(0)
	const spawnRef = useRef(0)
	const keys = useRef<{ left: boolean; right: boolean }>({
		left: false,
		right: false,
	})

	const spawnApple = useCallback((currentScore: number): AppleState => {
		spawnRef.current += 1
		let type: AppleType = "blue"
		if (currentScore >= GOLD_START_SCORE) {
			const r = Math.random()
			if (r < GOLD_CHANCE_100) type = "gold"
			else if (r < GOLD_CHANCE_100 + RED_CHANCE_100) type = "red"
		} else if (currentScore >= RED_START_SCORE) {
			if (Math.random() < RED_CHANCE_20_99) type = "red"
		}
		return {
			x: Math.random() * (W - APPLE_SIZE),
			y: 0,
			type,
		}
	}, [])

	useEffect(() => {
		setApple(spawnApple(scoreRef.current))
		setReady(true)
	}, [spawnApple])

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") keys.current.left = true
			if (e.key === "ArrowRight") keys.current.right = true
			if (!startedRef.current && (e.key === " " || e.key === "Enter")) {
				setScore(0)
				setMisses(0)
				scoreRef.current = 0
				missesRef.current = 0
				spawnRef.current = 0
				setApple(spawnApple(0))
				setGameOver(false)
				gameOverRef.current = false
				startedRef.current = true
				setStarted(true)
			}
			if (gameOverRef.current && e.key.toLowerCase() === "r") {
				setScore(0)
				setMisses(0)
				scoreRef.current = 0
				missesRef.current = 0
				spawnRef.current = 0
				setApple(spawnApple(0))
				setGameOver(false)
				gameOverRef.current = false
				startedRef.current = true
				setStarted(true)
			}
		}
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") keys.current.left = false
			if (e.key === "ArrowRight") keys.current.right = false
		}
		window.addEventListener("keydown", onKeyDown)
		window.addEventListener("keyup", onKeyUp)
		return () => {
			window.removeEventListener("keydown", onKeyDown)
			window.removeEventListener("keyup", onKeyUp)
		}
	}, [spawnApple])

	useEffect(() => {
		if (!ready) return
		if (runningRef.current) return
		runningRef.current = true

		const tick = () => {
			if (!started || gameOver) {
				rafRef.current = requestAnimationFrame(tick)
				return
			}
			setPlayerX((x) => {
				let next = x
				if (keys.current.left) next -= MOVE_SPEED
				if (keys.current.right) next += MOVE_SPEED
				next = Math.max(0, Math.min(W - PLAYER_W, next))
				playerXRef.current = next
				return next
			})

			setApple((a) => {
				const nextY = a.y + FALL_SPEED
				const nextX = a.x
				const px = playerXRef.current
				const playerY = H - PLAYER_H - PLAYER_BOTTOM_OFFSET

				const hit =
					nextY + APPLE_SIZE >= playerY &&
					nextY <= playerY + PLAYER_H &&
					nextX + APPLE_SIZE >= px &&
					nextX <= px + PLAYER_W

				if (hit) {
					const points =
						a.type === "gold"
							? GOLDEN_SCORE
							: a.type === "red"
							? RED_SCORE
							: BLUE_SCORE
					const nextScore = scoreRef.current + points
					scoreRef.current = nextScore
					setScore(nextScore)
					return spawnApple(nextScore)
				}

				if (nextY + APPLE_SIZE >= H) {
					const nextMisses = missesRef.current + 1
					missesRef.current = nextMisses
					setMisses(nextMisses)
					if (nextMisses >= 3) {
						setGameOver(true)
						gameOverRef.current = true
						return { ...a, x: nextX, y: H - APPLE_SIZE }
					}
					return spawnApple(scoreRef.current)
				}

				return { ...a, x: nextX, y: nextY }
			})

			rafRef.current = requestAnimationFrame(tick)
		}

		rafRef.current = requestAnimationFrame(tick)
		return () => {
			runningRef.current = false
			cancelAnimationFrame(rafRef.current)
		}
	}, [ready, gameOver, started, spawnApple])

	return (
		<main className="min-h-screen bg-amber-50 text-slate-900 flex items-center justify-center p-6">
			<div className="w-130">
				<div className="mb-3 flex items-center justify-between">
					<h1 className="text-xl font-semibold tracking-tight">りんご拾い</h1>
				</div>

				<div
					className="relative rounded-xl border border-blue-200 bg-linear-to-b from-sky-200 to-sky-50 shadow-inner"
					style={{ width: W, height: H }}
				>
					<div className="absolute left-3 top-3 flex items-center gap-1 text-slate-500">
						{HEART_SLOTS.map((slot, i) => (
							<div key={slot} className="relative">
								<Heart
									className={i < 3 - misses ? "text-rose-500" : "text-rose-300"}
									size={16}
									strokeWidth={2}
									fill="currentColor"
								/>
								{i >= 3 - misses && (
									<span className="pointer-events-none absolute left-1/2 top-1/2 block h-[1.5px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-[-20deg] bg-rose-500/70" />
								)}
							</div>
						))}
					</div>
					<div className="absolute right-3 top-3 text-xs text-slate-700">
						スコア: <span className="font-semibold">{score}</span>
					</div>
					{!started && (
						<div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
							<div className="text-center">
								<div className="text-lg font-semibold">りんご拾い</div>
								<div className="mt-1 text-xs text-slate-600">
									Enter / Space でスタート
								</div>
							</div>
						</div>
					)}
					{gameOver && (
						<div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
							<div className="text-center">
								<div className="text-lg font-semibold">GAME OVER</div>
								<div className="mt-1 text-xs text-slate-600">
									R でリスタート
								</div>
								<div className="mt-2 text-sm text-slate-700">
									スコア: <span className="font-semibold">{score}</span>
								</div>
							</div>
						</div>
					)}
					{ready && (
						<div
							className="absolute"
							style={{
								left: apple.x,
								top: appleY,
								width: APPLE_SIZE,
								height: APPLE_SIZE,
							}}
						>
							<Apple
								className={
									apple.type === "gold"
										? "text-amber-400"
										: apple.type === "red"
										? "text-red-500"
										: "text-emerald-500"
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

				{(gameOver || !started) && (
					<div className="mt-3 text-xs text-slate-600">← / → で左右移動</div>
				)}
			</div>
		</main>
	)
}
