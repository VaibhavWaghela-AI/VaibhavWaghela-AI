import re
with open('README.md', 'r', encoding='utf-8') as f:
    text = f.read()
# Replace <img src=".../assets/X" alt="Y" ... /> with ![Y](assets/X)
text = re.sub(r'<img src="[^"]+/assets/([^"]+)" alt="([^"]*)"[^>]*>', r'![\2](assets/\1)', text)
with open('README.md', 'w', encoding='utf-8') as f:
    f.write(text)
