import re

def unescape_match(match):
    content = match.group(1)
    try:
        # If it's something like {1f37d}, it's a high plane emoji
        return chr(int(content, 16))
    except:
        return match.group(0)

def unescape_simple(match):
    content = match.group(1)
    try:
        return chr(int(content, 16))
    except:
        return match.group(0)

with open('src/routes/chat.tsx', 'r') as f:
    text = f.read()

# 1. Handle \u{XXXX} or \u{XXXXX}
text = re.sub(r'\\u\{([0-9a-fA-F]+)\}', unescape_match, text)

# 2. Handle \uXXXX
text = re.sub(r'\\u([0-9a-fA-F]{4})', unescape_simple, text)

with open('src/routes/chat.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("UNESCAPED_TO_UTF8")
