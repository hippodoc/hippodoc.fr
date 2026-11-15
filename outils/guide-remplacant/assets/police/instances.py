"""Fige la police variable de la DA en graisses statiques pour le PDF.

Pourquoi : Chromium (Skia) embarque une police variable en Type 3, une police par graisse et par
page, et le PDF passait 2,4 Mo. Des instances statiques s'embarquent en TrueType, sous-ensemble,
une fois : le PDF s'allège et le texte reste vectoriel et sélectionnable.

    pip install fonttools brotli
    python3 outils/guide-remplacant/assets/police/instances.py
"""
import pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ICI = pathlib.Path(__file__).resolve().parent
SOURCE = ICI.parent / 'da' / 'fonts' / 'google-sans-flex-latin-wght400-800-rond100.woff2'
for w in (430, 600, 660, 720, 760, 800):
    f = TTFont(SOURCE)
    inst = instantiateVariableFont(f, {'wght': w}, updateFontNames=False)
    for rec in inst['name'].names:
        if rec.nameID in (1, 4, 16):
            rec.string = f'Google Sans Flex Guide {w}'
        elif rec.nameID == 6:
            rec.string = f'GoogleSansFlexGuide-{w}'
    inst.flavor = 'woff2'
    inst.save(ICI / f'google-sans-flex-{w}.woff2')
    print(w, (ICI / f'google-sans-flex-{w}.woff2').stat().st_size)
