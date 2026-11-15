"""Planche contact des aperçus : python3 planche.py [colonnes] [largeur]"""
import glob, sys
from PIL import Image
cols = int(sys.argv[1]) if len(sys.argv) > 1 else 8
w = int(sys.argv[2]) if len(sys.argv) > 2 else 270
h = int(w * 1350 / 1080)
fs = sorted(glob.glob('sortie/apercu/page-*.png'))
rows = (len(fs) + cols - 1) // cols
s = Image.new('RGB', (cols * (w + 10), rows * (h + 10)), 'white')
for i, f in enumerate(fs):
    s.paste(Image.open(f).resize((w, h), Image.LANCZOS), ((i % cols) * (w + 10), (i // cols) * (h + 10)))
s.save('sortie/planche.png')
print(s.size)
