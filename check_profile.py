import urllib.request
import re

url = "https://github.com/VaIbHaVui-code"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    
    # Check if the README section exists in the HTML
    if 'class="markdown-body"' in html or 'README.md' in html:
        print("README IS PRESENT IN THE HTML!")
        
        # Extract the README content snippet
        match = re.search(r'<article class="markdown-body[^>]*>(.*?)</article>', html, re.DOTALL)
        if match:
            print("Found article tag length:", len(match.group(1)))
        else:
            print("Could not extract article content")
    else:
        print("README IS DEFINITELY NOT PRESENT IN THE HTML.")
        
    print("Username in HTML title:", re.search(r'<title>(.*?)</title>', html).group(1))

except Exception as e:
    print("Failed:", e)
