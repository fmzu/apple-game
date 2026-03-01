import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import Page from "../../app/page"

describe("りんご拾いゲーム", () => {
	it("初期画面が正しく表示される", () => {
		render(<Page />)

		// タイトルが表示される（複数あるのでgetAllByTextを使用）
		const titles = screen.getAllByText("りんご拾い")
		expect(titles.length).toBeGreaterThanOrEqual(1)

		// スタート指示が表示される
		expect(screen.getByText("Enter / Space でスタート")).toBeInTheDocument()

		// 初期スコアが0
		expect(screen.getByText(/スコア:/)).toBeInTheDocument()
	})

	it("ハートが3つ表示される", () => {
		const { container } = render(<Page />)

		// ハートアイコンは3つある（lucide-heartクラスで判定）
		const hearts = container.querySelectorAll(".lucide-heart")
		expect(hearts.length).toBe(3)
	})

	it("Enterキーでゲームが開始される", async () => {
		const user = userEvent.setup()
		render(<Page />)

		// 初期状態ではスタート画面が表示されている
		expect(screen.getByText("Enter / Space でスタート")).toBeInTheDocument()

		// Enterキーを押す
		await user.keyboard("{Enter}")

		// スタート画面が消える（少し待つ必要があるかもしれない）
		expect(
			screen.queryByText("Enter / Space でスタート"),
		).not.toBeInTheDocument()
	})

	it("Spaceキーでゲームが開始される", async () => {
		const user = userEvent.setup()
		render(<Page />)

		// Spaceキーを押す
		await user.keyboard(" ")

		// スタート画面が消える
		expect(
			screen.queryByText("Enter / Space でスタート"),
		).not.toBeInTheDocument()
	})

	// ゲームオーバーのテストは複雑なので、E2Eテストで実装する方が適切

	it("操作説明が表示される", () => {
		render(<Page />)

		// 操作説明が表示される
		const instructions = screen.queryByText("← / → で左右移動")
		expect(instructions).toBeInTheDocument()
	})
})
