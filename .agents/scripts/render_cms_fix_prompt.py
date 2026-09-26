from pathlib import Path
import fitz

source = Path('attached_assets/New_National_Advertising_CMS_Fix_Prompt_1790073374710.pdf')
out = Path('.agents/outputs/cms-fix-prompt-pages')
out.mkdir(parents=True, exist_ok=True)

doc = fitz.open(source)
for index, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pix.save(out / f'page-{index + 1:02d}.png')
print(f'rendered {len(doc)} pages to {out}')
print('page size:', doc[0].rect)
