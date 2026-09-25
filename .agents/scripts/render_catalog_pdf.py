from pathlib import Path

import fitz


pdf_path = Path("attached_assets/New_National_Advertising_COMPLETE_Product_Catalog_Prompt_(3)_1790337224894.pdf")
output_dir = Path(".agents/outputs/catalog-pdf")
output_dir.mkdir(parents=True, exist_ok=True)

document = fitz.open(pdf_path)
for page_number, page in enumerate(document, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pixmap.save(output_dir / f"page-{page_number:02d}.png")

print(f"Rendered {document.page_count} pages to {output_dir}")