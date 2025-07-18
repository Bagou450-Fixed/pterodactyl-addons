import re
import urllib.parse

readme_path = "../README.md"

with open(readme_path, "r", encoding="utf-8") as f:
    content = f.read()

pattern = r'- \[\*\*(.*?)\*\*: `(\d+)/`\]'
matches = re.findall(pattern, content)

for name, num in matches:
    folder_name = f"{name} - {num}"
    encoded = urllib.parse.quote(folder_name)
    link = f"https://github.com/Bagou450-Fixed/pterodactyl-addons/tree/main/addons/{encoded}"
    markdown_link = f'- [**{name}**: `{num}/`]({link})'
    old_line = f'- [**{name}**: `{num}/`]'
    content = content.replace(old_line, markdown_link)

with open(readme_path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ README.md updated with addon links.")
