import urllib.request, json
try:
    req = urllib.request.urlopen("https://api.github.com/repos/ValbHaVui-code/ValbHaVui-code")
    data = json.loads(req.read())
    print("Default branch:", data.get("default_branch"))
except Exception as e:
    print(e)
