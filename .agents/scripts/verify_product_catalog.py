from collections import OrderedDict
import json, re, subprocess
import fitz

pdf = 'attached_assets/New_National_Advertising_Exact_Product_Catalog_Replit_Prompt_1790335713677.pdf'
text = '\n'.join(page.get_text() for page in fitz.open(pdf))
source = text.split('REPLIT IMPLEMENTATION INSTRUCTIONS', 1)[0]
lines = [line.strip() for line in source.splitlines()]
category_re = re.compile(r'^(\d+)\. (.+)$')
categories = OrderedDict()
current = None
for line in lines:
    match = category_re.match(line)
    if match and 1 <= int(match.group(1)) <= 12:
        current = match.group(2)
        categories[current] = []
    elif current and line.startswith('•'):
        name = line[1:].strip()
        if re.search(r'sign\s*board', name, re.I):
            name = 'Signage'
        categories[current].append(name)
expected = OrderedDict()
for category, names in categories.items():
    for name in names:
        expected.setdefault(name, {'category': category, 'sourceCategories': []})['sourceCategories'].append(category)

raw = subprocess.check_output(['curl', '-fsS', 'http://localhost:80/api/products'])
products = json.loads(raw)
actual = {row['name']: row for row in products}
expected_names = set(expected)
actual_names = set(actual)
missing = sorted(expected_names - actual_names)
unexpected = sorted(actual_names - expected_names)
duplicate_names = len(products) - len(actual)
non_empty_images = [row['name'] for row in products if row.get('imagePath') or row.get('imageUrl')]
wrong_categories = [
    (name, actual[name].get('category'), spec['category'])
    for name, spec in expected.items()
    if name in actual and actual[name].get('category') != spec['category']
]
priority = [row['name'] for row in products[:8]]
print(json.dumps({
    'pdfCategories': len(categories),
    'pdfListedOccurrences': sum(map(len, categories.values())),
    'pdfUniqueNames': len(expected),
    'pdfDuplicateOccurrences': sum(map(len, categories.values())) - len(expected),
    'apiProductCount': len(products),
    'apiUniqueNames': len(actual),
    'duplicateNamesInApi': duplicate_names,
    'missingNames': missing,
    'unexpectedNames': unexpected,
    'wrongPrimaryCategories': wrong_categories,
    'nonEmptyImages': non_empty_images,
    'firstEight': priority,
    'firstEightPriorityMatches': priority[0] == 'Signage' and 'Calendars' in priority,
    'allChecksPass': not (missing or unexpected or wrong_categories or non_empty_images or duplicate_names) and len(products) == len(expected),
}, indent=2, ensure_ascii=False))
