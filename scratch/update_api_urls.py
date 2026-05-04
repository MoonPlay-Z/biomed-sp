import os
import re

files = [
    "/home/juan/Desktop/cafeteria/frontend/src/app/(dashboard)/admin/dashboard/page.tsx",
    "/home/juan/Desktop/cafeteria/frontend/src/app/login/page.tsx",
    "/home/juan/Desktop/cafeteria/frontend/src/app/(dashboard)/reception/page.tsx",
    "/home/juan/Desktop/cafeteria/frontend/src/app/(dashboard)/tech/repairs/page.tsx",
    "/home/juan/Desktop/cafeteria/frontend/src/app/(dashboard)/admin/inventory/page.tsx"
]

pattern = r"(let|const) apiUrl = process\.env\.NEXT_PUBLIC_API_URL \|\| 'http://localhost:3001/api';(.*?)(?=\s*const res = await fetch)"

replacement = "const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';\n"

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Regex to find the variable declaration and any cleanup logic until the next fetch
        # We look for the start and then skip everything until we see 'const res = await fetch'
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"File not found: {file_path}")
