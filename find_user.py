import urllib.request, json
try:
    url = "https://api.github.com/search/users?q=Vaibhav+Waghela"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    print("Found users:")
    for user in data.get("items", []):
        print(user["login"])
except Exception as e:
    print("Error:", e)
