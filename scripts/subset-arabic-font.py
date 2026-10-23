"""Regenerate after changing Arabic copy. Requires fonttools[woff]."""
import json
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
source = root / 'fonts/noto-sans-arabic-source.woff2'
output = root / 'public/fonts/noto-sans-arabic.woff2'
text = (root / 'src/ar.json').read_text()
# Keep joining marks and punctuation in addition to every character in editable copy.
codepoints = {ord(c) for c in text} | set(range(0x064B, 0x0660)) | {0x0640, 0x200C, 0x200D}
font = TTFont(source)
available = set(font.getBestCmap())
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
worker = subset.Subsetter(options=options)
worker.populate(unicodes=codepoints & available)
worker.subset(font)
font.flavor = 'woff2'
font.save(output)
result = TTFont(output)
assert (codepoints & available) <= set(result.getBestCmap())
print(f'Arabic WOFF2: {source.stat().st_size} -> {output.stat().st_size} bytes; GSUB/GPOS shaping retained.')
