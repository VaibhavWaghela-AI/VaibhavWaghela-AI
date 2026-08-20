import urllib.request
import re

url = "https://github.com/ValbHaVui-code"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    
    # Check if the README section exists in the HTML
    if 'class="markdown-body"' in html or 'README.md' in html:
        print("README IS PRESENT IN THE HTML!")
    else:
        print("README IS DEFINITELY NOT PRESENT IN THE HTML.")
        
    print("Username in HTML title:", re.search(r'<title>(.*?)</title>', html).group(1))

except Exception as e:
    print("Failed:", e)
