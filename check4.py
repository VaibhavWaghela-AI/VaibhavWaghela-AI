import urllib.request, json
try:
    req = urllib.request.Request("https://api.github.com/repos/vaibhavui-code/vaibhavui-code", headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    print("Full Name:", data.get("full_name"))
    print("Default branch:", data.get("default_branch"))
    print("Visibility:", data.get("visibility"))
except Exception as e:
    print("Error:", e)
