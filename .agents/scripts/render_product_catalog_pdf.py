from pathlib import Path
import fitz
pdf = Path('attached_assets/New_National_Advertising_Exact_Product_Catalog_Replit_Prompt_1790335713677.pdf')
out = Path('.agents/outputs/product-catalog-pdf')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(pdf)
print('pages', doc.page_count)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    path = out / f'page-{i+1:02d}.png'
    pix.save(path)
    print(path)
