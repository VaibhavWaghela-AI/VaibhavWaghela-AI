import urllib.request, json
try:
    req = urllib.request.Request("https://api.github.com/repos/VaIbHaVui-code/VaIbHaVui-code", headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    print("Default branch:", data.get("default_branch"))
except Exception as e:
    print("VaIbHaVui-code error:", e)

try:
    req = urllib.request.Request("https://api.github.com/repos/ValbHaVui-code/ValbHaVui-code", headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    print("Default branch:", data.get("default_branch"))
except Exception as e:
    print("ValbHaVui-code error:", e)
