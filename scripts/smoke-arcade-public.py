"""Fixture-only public-score UI test. No OpenAI or DynamoDB writes."""
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width":1280,"height":1000})
    errors=[]
    page.on("pageerror", lambda error:errors.append(str(error)))
    entry={"id":"fixture", "name":"***********", "country":"in", "score":1200,
           "level":2, "masked":True, "verification":"unverified", "createdAt":"2026-10-09T00:00:00Z"}
    writes=[]
    def board(route):
        if route.request.method=="POST":
            data=route.request.post_data_json
            assert len(data["name"])<=20 and data["country"]=="in" and data["publish"] is True
            writes.append(data)
            route.fulfill(status=201,content_type="application/json",body=json.dumps({"entry":entry}))
        else:
            route.fulfill(content_type="application/json",body=json.dumps({"configured":True,"entries":[entry] if writes else []}))
    page.route("**/api/arcade/leaderboard",board)
    page.route("**/api/arcade/runs",lambda route:route.fulfill(content_type="application/json",body='{"ticket":"fixture-only-ticket"}'))
    page.goto("http://localhost:3000/games/alien-invasion",wait_until="networkidle")
    page.get_by_role("button",name="Play game",exact=True).click()
    page.get_by_role("button",name="Start round",exact=True).click(timeout=60_000)
    if page.get_by_role("button",name="Skip briefing",exact=True).count():
        page.get_by_role("button",name="Skip briefing",exact=True).click()
    page.get_by_role("status").filter(has_text="In flight").wait_for(timeout=10_000)
    frame=page.frame_locator('iframe[title="Alien Invasion Python game"]')
    game_frame=next(value for value in page.frames if "/games/alien-invasion/index.html" in value.url)
    game_frame.evaluate("""() => {
      const origin=location.origin;
      parent.postMessage({source:'alien-invasion',type:'run_started',run_id:'123-2',seed:123,version:'3.2.0'},origin);
      parent.postMessage({source:'alien-invasion',type:'game_over',run_id:'123-2',seed:123,version:'3.2.0',score:1200,level:2,wave:1,kills:10,ticks:1800,duration:30},origin);
    }""")
    page.get_by_role("button",name="View leaderboard",exact=True).click()
    name_input=page.get_by_role("textbox",name=re.compile("^Gaming name"))
    name_input.fill("123456789012345678901")
    assert len(name_input.input_value())==20
    name_input.fill("test_handle")
    page.get_by_label("Country",exact=True).select_option("in")
    page.get_by_label("Publish my reviewed gaming name",exact=False).check()
    page.get_by_role("button",name="Publish score",exact=True).click()
    page.get_by_role("button",name="Published",exact=True).wait_for(timeout=10_000)
    assert len(writes)==1
    page.get_by_role("img",name="India",exact=True).wait_for()
    page.get_by_text("***********",exact=True).wait_for()
    assert not errors, errors
    page.screenshot(path=str(ROOT/"artifacts"/"game-qa"/"public-fixture.png"),full_page=True)
    print("PASS: fixture publication, 20-character cap, masked public name, country flag, and single submit")
    browser.close()
