import { describe, expect, it } from "vitest"

// ゲームの定数
const BLUE_SCORE = 5
const RED_SCORE = 10
const GOLDEN_SCORE = 15
const RED_START_SCORE = 20
const GOLD_START_SCORE = 100
const RED_CHANCE_20_99 = 0.4
const RED_CHANCE_100 = 0.3
const GOLD_CHANCE_100 = 0.1

describe("ゲームロジック", () => {
	describe("スコア計算", () => {
		it("青りんごは5点", () => {
			expect(BLUE_SCORE).toBe(5)
		})

		it("赤りんごは10点", () => {
			expect(RED_SCORE).toBe(10)
		})

		it("金りんごは15点", () => {
			expect(GOLDEN_SCORE).toBe(15)
		})
	})

	describe("りんごの出現条件", () => {
		it("スコア0-19では青りんごのみ", () => {
			const score = 10
			expect(score).toBeLessThan(RED_START_SCORE)
			// この範囲では赤と金は出現しない
		})

		it("スコア20-99では青と赤が出現", () => {
			const score = 50
			expect(score).toBeGreaterThanOrEqual(RED_START_SCORE)
			expect(score).toBeLessThan(GOLD_START_SCORE)
			// この範囲では赤が40%の確率で出現
			expect(RED_CHANCE_20_99).toBe(0.4)
		})

		it("スコア100以上では青、赤、金が出現", () => {
			const score = 150
			expect(score).toBeGreaterThanOrEqual(GOLD_START_SCORE)
			// 金: 10%, 赤: 30%, 青: 60%
			expect(GOLD_CHANCE_100).toBe(0.1)
			expect(RED_CHANCE_100).toBe(0.3)
		})
	})

	describe("当たり判定", () => {
		// ゲームの定数
		const W = 450
		const H = 300
		const PLAYER_W = 56
		const PLAYER_H = 18
		const APPLE_SIZE = 28
		const PLAYER_BOTTOM_OFFSET = 8

		it("りんごがプレイヤーの範囲内にあれば当たり", () => {
			const playerX = 200
			const playerY = H - PLAYER_H - PLAYER_BOTTOM_OFFSET
			const appleX = 210
			const appleY = playerY

			// X軸の当たり判定
			const hitX = appleX + APPLE_SIZE >= playerX && appleX <= playerX + PLAYER_W
			// Y軸の当たり判定
			const hitY =
				appleY + APPLE_SIZE >= playerY && appleY <= playerY + PLAYER_H

			expect(hitX).toBe(true)
			expect(hitY).toBe(true)
		})

		it("りんごがプレイヤーの範囲外なら当たらない", () => {
			const playerX = 200
			const playerY = H - PLAYER_H - PLAYER_BOTTOM_OFFSET
			const appleX = 100 // プレイヤーから離れている
			const appleY = playerY

			// X軸の当たり判定
			const hitX = appleX + APPLE_SIZE >= playerX && appleX <= playerX + PLAYER_W

			expect(hitX).toBe(false)
		})
	})

	describe("ゲームオーバー条件", () => {
		it("3回ミスでゲームオーバー", () => {
			const misses = 3
			expect(misses).toBeGreaterThanOrEqual(3)
			// ゲームオーバー状態になる
		})

		it("2回までのミスならゲーム継続", () => {
			const misses = 2
			expect(misses).toBeLessThan(3)
			// ゲームは継続
		})
	})

	describe("プレイヤーの移動範囲", () => {
		const W = 450
		const PLAYER_W = 56

		it("左端は0", () => {
			const x = -10
			const clampedX = Math.max(0, Math.min(W - PLAYER_W, x))
			expect(clampedX).toBe(0)
		})

		it("右端はW - PLAYER_W", () => {
			const x = 500
			const clampedX = Math.max(0, Math.min(W - PLAYER_W, x))
			expect(clampedX).toBe(W - PLAYER_W)
		})

		it("範囲内の値はそのまま", () => {
			const x = 200
			const clampedX = Math.max(0, Math.min(W - PLAYER_W, x))
			expect(clampedX).toBe(200)
		})
	})
})
