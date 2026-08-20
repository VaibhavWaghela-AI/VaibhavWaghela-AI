import urllib.request, json
try:
    url = "https://api.github.com/search/repositories?q=Aura--MCP-driven-multi-agent-workspace-daemon"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    if data.get("items"):
        repo = data["items"][0]
        print("Found repo:")
        print("Full name:", repo["full_name"])
        print("Owner:", repo["owner"]["login"])
    else:
        print("No repo found")
except Exception as e:
    print("Error:", e)
