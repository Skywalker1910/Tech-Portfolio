"""Optional local browser smoke check; requires Playwright and Microsoft Edge."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

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
    def check_canvas():
        game_frame=next(f for f in page.frames if "/games/alien-invasion/index.html" in f.url)
        metrics=game_frame.evaluate("""() => {
          const c=document.querySelector('#canvas'),r=c.getBoundingClientRect();
          return {width:r.width,height:r.height,bufferWidth:c.width,bufferHeight:c.height,viewportWidth:innerWidth,viewportHeight:innerHeight};
        }""")
        assert (metrics["bufferWidth"],metrics["bufferHeight"])==(960,640),metrics
        assert abs(metrics["width"]/metrics["height"]-1.5)<.01,metrics
        assert abs(metrics["width"]-metrics["viewportWidth"])<2,metrics
        assert abs(metrics["height"]-metrics["viewportHeight"])<2,metrics
        return metrics
    try:
        expect(page.get_by_role("button",name="Start round",exact=True)).to_be_enabled(timeout=60_000)
        cold=check_canvas()
        page.screenshot(path=str(OUTPUT/"first-launch-fixed.png"))
        page.get_by_role("button",name="Exit game",exact=True).click()
        assert page.locator("iframe").count()==0
        page.get_by_role("button",name="Play game",exact=True).click()
        expect(page.get_by_role("button",name="Start round",exact=True)).to_be_enabled(timeout=60_000)
        assert check_canvas()==cold
        page.screenshot(path=str(OUTPUT/"relaunch-fixed.png"))
        print("PASS: first launch and relaunch canvas dimensions match",cold)
        page.get_by_role("button", name="Start round", exact=True).click(timeout=60_000)
        page.get_by_role("button",name="Skip briefing",exact=True).click(timeout=10_000)
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
            check_canvas()
            assert game["y"]>=window["y"] and game["y"]+game["height"]<=window["y"]+window["height"],game
            assert page.get_by_role("button",name="Fire",exact=True).is_visible()
            page.screenshot(path=str(OUTPUT / f"expanded-{width}.png"))
            print("PASS: fitted game viewport",width,height,game)
        page.evaluate("window.postMessage({source:'alien-invasion',type:'exit_requested'},location.origin)")
        page.wait_for_timeout(100)
        assert page.get_by_role("dialog",name="Alien Invasion",exact=True).is_visible()
        game_frame=next(f for f in page.frames if "/games/alien-invasion/index.html" in f.url)
        game_frame.evaluate("parent.postMessage({source:'alien-invasion',type:'exit_requested'},location.origin)")
        page.get_by_role("dialog",name="Alien Invasion",exact=True).wait_for(state="hidden")
        assert not page.get_by_role("dialog",name="Alien Invasion",exact=True).is_visible()
        assert page.evaluate("document.body.style.overflow")!="hidden"
        assert page.locator("iframe").count() == 0
        # Retry while the dialog is already open must retain its measured size.
        def fail_head_once(route):
            route.fulfill(status=503,body="Fixture loader failure")
        page.route("**/games/alien-invasion/index.html",fail_head_once,times=1)
        page.get_by_role("button",name="Play game",exact=True).click()
        page.get_by_role("button",name="Retry loading",exact=True).click()
        expect(page.get_by_role("button",name="Start round",exact=True)).to_be_enabled(timeout=60_000)
        check_canvas()
        page.get_by_role("button",name="Exit game",exact=True).click()
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
        print("PASS: Python loaded, canvas scaling, start, keyboard, pause/resume, touch fire, footer exit, pinned game exit event, close/unload, mobile layout")
    finally:
        output = ROOT / "artifacts" / "game-qa"
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(output / "player.png"), full_page=True)
        print("PLAYER STATUS:", page.get_by_role("status").all_text_contents())
        if page.locator("iframe").count():
            print("GAME TEXT:", frame.locator("body").inner_text()[:2000])
        browser.close()
