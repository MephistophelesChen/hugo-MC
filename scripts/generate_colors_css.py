import json
from pathlib import Path

# Load colors JSON and write CSS variables

json_path = Path('traditional-colors.json')
css_path = Path('static/css/includes/colors-generated.css')

with json_path.open('r', encoding='utf-8') as f:
    data = json.load(f)

with css_path.open('w', encoding='utf-8') as f:
    f.write('/* this file is auto-generated from traditional-colors.json */\n')
    f.write(':root {\n')
    for item in data:
        hexval = item.get('hex', '')
        # prepare both pinyin and Chinese name as variable identifiers
        def sanitize(s):
            return ''.join(c for c in s if c.isalnum() or c=='-')

        pinyin = item.get('pinyin', '')
        chinese = item.get('name', '')
        if pinyin:
            varname = sanitize(pinyin)
            f.write(f'  --color-{varname}: {hexval};\n')
        if chinese:
            varname2 = sanitize(chinese)
            if varname2 and varname2 != varname:
                f.write(f'  --color-{varname2}: {hexval};\n')
    f.write('}\n')

print(f'generated {css_path}')
