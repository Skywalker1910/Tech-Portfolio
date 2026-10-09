"""Fixture-only in-game public-score bridge test. No OpenAI or DynamoDB writes."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
version=json.loads((ROOT/"data/arcade/game.json").read_text())["version"]
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width":1280,"height":1000})
    errors=[]
    page.on("pageerror", lambda error:errors.append(str(error)))
    entry={"id":"fixture", "name":"***********", "country":"in", "score":1200,
           "level":2, "masked":True, "verification":"unverified", "createdAt":"2026-10-09T00:00:00Z"}
    writes=[]
    attempts=[]
    mode={"fail":False,"registrationFail":False,"hang":False}
    pending_routes=[]
    def board(route):
        if route.request.method=="POST":
            data=route.request.post_data_json
            assert data["country"]=="in" and data["publish"] is True
            attempts.append(data)
            if mode["hang"]:
                pending_routes.append(route)
            elif mode["fail"]:
                route.fulfill(status=503,content_type="application/json",body='{"error":"Fixture storage unavailable"}')
            elif len(data["name"])>20:
                route.fulfill(status=400,content_type="application/json",body='{"error":"Gaming names must be 1–20 characters."}')
            else:
                writes.append(data)
                route.fulfill(status=201,content_type="application/json",body=json.dumps({"entry":entry}))
        else:
            route.fulfill(content_type="application/json",body=json.dumps({"configured":True,"entries":[entry] if writes else []}))
    page.route("**/api/arcade/leaderboard",board)
    def register(route):
        if mode["registrationFail"]:
            route.fulfill(status=503,content_type="application/json",body='{"error":"Fixture registration unavailable"}')
        else:
            route.fulfill(content_type="application/json",body='{"ticket":"fixture-only-ticket"}')
    page.route("**/api/arcade/runs",register)
    page.goto("http://localhost:3000/games/alien-invasion",wait_until="networkidle")
    page.get_by_role("button",name="Play game",exact=True).click()
    page.get_by_role("button",name="Start round",exact=True).click(timeout=60_000)
    page.get_by_role("button",name="Skip briefing",exact=True).click(timeout=10_000)
    page.get_by_role("status").filter(has_text="In flight").wait_for(timeout=10_000)
    game_frame=next(value for value in page.frames if "/games/alien-invasion/index.html" in value.url)
    game_frame.evaluate("""() => {
      window.fixtureAcks=[];
      addEventListener('message',e=>{if(e.data?.type==='score_publication')window.fixtureAcks.push(e.data);});
    }""")
    # End the live Python run early, without altering the source or bundle.
    # All form input, bridge messages and acknowledgements remain real.
    def python(code):
        game_frame.evaluate("code=>Module.PyRun_SimpleString(code)",code)
    python("import gc\nfrom invasion.app import App\nfixture_app = next(obj for obj in gc.get_objects() if isinstance(obj, App))\nfixture_app.game.score = 0\nfixture_app.game._end_run()")
    page.get_by_role("status").filter(has_text="Game over").wait_for()
    game_frame.locator("#canvas").click(position={"x":5,"y":5})
    page.keyboard.type("NovaPilot",delay=60)
    page.keyboard.press("Tab")
    page.keyboard.type("India",delay=60)
    page.keyboard.press("Enter")
    mode["fail"]=True
    page.keyboard.press("Enter")
    page.get_by_role("status").filter(has_text="Fixture storage unavailable").wait_for()
    assert len(attempts)==1 and not writes
    assert attempts[0]["score"]==0 and attempts[0]["name"]=="NovaPilot"
    native_run_id=attempts[0]["gameRunId"]
    mode["fail"]=False
    page.keyboard.press("Enter")  # Python status screen's Retry button
    page.get_by_role("status").filter(has_text="Score saved.").wait_for()
    assert len(attempts)==2 and len(writes)==1
    assert attempts[1]["gameRunId"]==native_run_id
    python("import json, platform\nplatform.window.fixtureNative = json.dumps({'status': fixture_app.publication.status, 'name': fixture_app.publication.public_name, 'country': fixture_app.publication.public_country})")
    assert json.loads(game_frame.evaluate("fixtureNative"))=={"status":"saved","name":"***********","country":"in"}
    page.screenshot(path=str(ROOT/"artifacts"/"game-qa"/"native-public-fixture.png"))
    attempts.clear()
    writes.clear()
    def emit(events):
        game_frame.evaluate("""events => {
          for(const event of events) parent.postMessage({source:'alien-invasion',...event},location.origin);
        }""",events)
    def round_events(run_id):
        return [{"type":"run_started","run_id":run_id,"seed":123,"version":version},
                {"type":"game_over","run_id":run_id,"seed":123,"version":version,"score":1200,"level":2,"wave":1,"kills":10,"ticks":1800,"duration":30}]
    submit={"type":"score_submit","run_id":"123-2","name":"test_handle","country":"in","publish":True}
    emit(round_events("123-2"))
    emit([{**submit,"type":"score_saved","publish":False}])
    page.get_by_role("status").filter(has_text="Saved on this device only").wait_for()
    assert not attempts
    page.evaluate("data=>window.postMessage({source:'alien-invasion',...data},location.origin)",submit)
    page.wait_for_timeout(100)
    assert not attempts
    emit([submit,submit])
    page.get_by_role("status").filter(has_text="Score saved.").wait_for(timeout=10_000)
    assert len(writes)==1 and len(attempts)==1
    emit([submit])
    page.wait_for_timeout(200)
    assert len(attempts)==1
    assert game_frame.evaluate("fixtureAcks.some(v=>v.status==='saved' && v.masked && v.name==='***********')")
    emit(round_events("123-3"))
    retry={**submit,"run_id":"123-3"}
    mode["fail"]=True
    emit([retry])
    page.get_by_role("status").filter(has_text="Fixture storage unavailable").wait_for()
    assert len(writes)==1
    mode["fail"]=False
    emit([retry])
    page.get_by_role("status").filter(has_text="Score saved.").wait_for()
    assert len(writes)==2 and len(attempts)==3
    assert game_frame.evaluate("fixtureAcks.some(v=>v.run_id==='123-3' && v.status==='error' && v.retryable)")
    mode["registrationFail"]=True
    emit(round_events("123-4"))
    emit([{**submit,"run_id":"123-4"}])
    page.get_by_role("status").filter(has_text="Fixture registration unavailable").wait_for()
    assert len(attempts)==3
    assert game_frame.evaluate("fixtureAcks.some(v=>v.run_id==='123-4' && v.status==='error' && v.retryable===false)")
    mode["registrationFail"]=False
    emit(round_events("123-5"))
    mode["hang"]=True
    with page.expect_request("**/api/arcade/leaderboard"):
        emit([{**submit,"run_id":"123-5"}])
    page.wait_for_timeout(300)
    assert len(attempts)==4
    page.get_by_role("status").filter(has_text="The site took too long").wait_for(timeout=35_000)
    assert game_frame.evaluate("fixtureAcks.some(v=>v.run_id==='123-5' && v.status==='error' && v.retryable)")
    for route in pending_routes:
        route.abort()
    mode["hang"]=False
    emit([{**submit,"run_id":"123-5"}])
    page.get_by_role("status").filter(has_text="Score saved.").wait_for()
    assert len(attempts)==5 and len(writes)==3
    # A response from a previous round must not reach the current Python form.
    mode["hang"]=True
    emit(round_events("123-6"))
    with page.expect_request("**/api/arcade/leaderboard"):
        emit([{**submit,"run_id":"123-6"}])
    page.wait_for_timeout(200)
    old_ack_count=game_frame.evaluate("fixtureAcks.filter(v=>v.run_id==='123-6').length")
    emit(round_events("123-7"))
    page.wait_for_timeout(100)
    pending_routes[-1].fulfill(status=201,content_type="application/json",body=json.dumps({"entry":entry}))
    page.wait_for_timeout(300)
    assert game_frame.evaluate("fixtureAcks.filter(v=>v.run_id==='123-6').length")==old_ack_count
    page.get_by_role("button",name="Close game",exact=True).click()
    page.get_by_role("img",name="India",exact=True).wait_for()
    page.get_by_text("***********",exact=True).wait_for()
    assert page.get_by_role("textbox",name="Gaming name").count()==0
    assert page.get_by_role("button",name="Publish score").count()==0
    assert not errors, errors
    page.screenshot(path=str(ROOT/"artifacts"/"game-qa"/"public-fixture.png"),full_page=True)
    print("PASS: native Python zero-score form and Retry, masked name/flag, explicit public intent, spoof/duplicate guards, storage failure and timeout recovery, stale-response guard, refreshed flags, no second form")
    browser.close()
