from pathlib import Path
import fitz

source = Path("attached_assets/New_National_Advertising_Master_Replit_Prompt_1789893819509.pdf")
output = Path(".agents/outputs/new-national-prompt-pages")
output.mkdir(parents=True, exist_ok=True)

doc = fitz.open(source)
for index, page in enumerate(doc):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pixmap.save(output / f"page-{index + 1:02d}.png")

print(f"rendered {len(doc)} pages to {output}")