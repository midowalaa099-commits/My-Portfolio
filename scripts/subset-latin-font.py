"""Subset the Latin font to portfolio source content. Preserve shaping and metrics."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
root=Path(__file__).resolve().parents[1]
text=''.join(p.read_text() for p in (root/'src').glob('*') if p.suffix in ['.js','.jsx','.json'])
font=TTFont(root/'public/fonts/dm-sans-latin.woff2');available=set(font.getBestCmap());required=({ord(c) for c in text}|set(range(32,127)))&available
options=subset.Options();options.flavor='woff2';options.layout_features=['*'];options.name_IDs=[0,1,2,3,4,5,6,13,14]
worker=subset.Subsetter(options=options);worker.populate(unicodes=required);worker.subset(font);font.flavor='woff2';dest=root/'public/fonts/dm-sans-content.woff2';font.save(dest)
assert required<=set(TTFont(dest).getBestCmap());print('Subset bytes',dest.stat().st_size)
