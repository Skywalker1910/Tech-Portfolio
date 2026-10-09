"""Optional local browser smoke check; requires Playwright and Microsoft Edge."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "game-qa"
OUTPUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 1000})
    page.on("pageerror", lambda error: print("PAGE ERROR:", error))
    page.on("console", lambda message: print("CONSOLE:", message.text) if message.type == "error" else None)
    page.on("requestfailed", lambda request: print("REQUEST FAILED:", request.url, request.failure))
    page.goto("http://localhost:3000/games/alien-invasion", wait_until="networkidle")
    page.get_by_role("button", name="Play game", exact=True).click()
    frame = page.frame_locator('iframe[title="Alien Invasion Python game"]')
    frame.locator("canvas#canvas").click(force=True)
    try:
        page.get_by_role("button", name="Start round", exact=True).wait_for(timeout=60_000)
        page.get_by_role("button", name="Start round", exact=True).click(timeout=60_000)
        if page.get_by_role("button",name="Skip briefing",exact=True).count():
            page.get_by_role("button",name="Skip briefing",exact=True).click()
        page.get_by_role("status").filter(has_text="In flight").wait_for(timeout=10_000)
        frame.locator("canvas#canvas").press("ArrowLeft")
        frame.locator("canvas#canvas").press("Space")
        page.get_by_role("button", name="Pause", exact=True).click()
        page.get_by_role("button", name="Resume", exact=True).wait_for(timeout=5_000)
        page.get_by_role("button", name="Resume", exact=True).click()
        page.get_by_role("status").filter(has_text="In flight").wait_for(timeout=5_000)
        page.get_by_role("button", name="Fire", exact=True).hover()
        page.mouse.down()
        page.wait_for_timeout(500)
        page.mouse.up()
        assert page.get_by_role("status").filter(has_text="In flight").count() == 1
        page.screenshot(path=str(OUTPUT / "playing.png"), full_page=True)
        for width,height in [(1440,900),(1366,768),(375,812),(812,375)]:
            page.set_viewport_size({"width":width,"height":height})
            page.wait_for_timeout(500)
            window=page.get_by_role("dialog",name="Alien Invasion",exact=True).bounding_box()
            game=page.locator('iframe[title="Alien Invasion Python game"]').bounding_box()
            assert window["x"]>=11 and window["y"]>=11,window
            assert window["x"]+window["width"]<=width-11,window
            assert window["y"]+window["height"]<=height-11,window
            assert abs(game["width"]/game["height"]-1.5)<.01,game
            assert game["y"]>=window["y"] and game["y"]+game["height"]<=window["y"]+window["height"],game
            assert page.get_by_role("button",name="Fire",exact=True).is_visible()
            page.screenshot(path=str(OUTPUT / f"expanded-{width}.png"))
            print("PASS: fitted game viewport",width,height,game)
        page.get_by_role("button", name="Close game", exact=True).click()
        assert not page.get_by_role("dialog",name="Alien Invasion",exact=True).is_visible()
        assert page.evaluate("document.body.style.overflow")!="hidden"
        assert page.locator("iframe").count() == 0
        page.set_viewport_size({"width": 375, "height": 812})
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        page.get_by_role("button", name="Play game", exact=True).screenshot(path=str(ROOT / "artifacts" / "game-qa" / "mobile-play-button.png"))
        page.screenshot(path=str(ROOT / "artifacts" / "game-qa" / "mobile.png"), full_page=True)
        page.goto("http://localhost:3000/",wait_until="networkidle")
        assert page.get_by_role("link",name="Play Alien Invasion",exact=True).count()==3
        assert page.get_by_role("link",name="Football arcade — coming soon",exact=True).count()==1
        page.get_by_role("link",name="Football arcade — coming soon",exact=True).click()
        page.get_by_role("heading",name="Football arcade",exact=True).wait_for()
        page.goto("http://localhost:3000/",wait_until="networkidle")
        page.set_viewport_size({"width":1440,"height":1000})
        page.locator('section[aria-label="Portfolio arcade"]').first.scroll_into_view_if_needed()
        page.screenshot(path=str(OUTPUT / "landing.png"))
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        print("PASS: Python loaded, start, keyboard, pause/resume, touch fire, close/unload, mobile layout")
    finally:
        output = ROOT / "artifacts" / "game-qa"
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(output / "player.png"), full_page=True)
        print("PLAYER STATUS:", page.get_by_role("status").all_text_contents())
        if page.locator("iframe").count():
            print("GAME TEXT:", frame.locator("body").inner_text()[:2000])
        browser.close()
