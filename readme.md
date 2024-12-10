Root Level (_layout.tsx):
✅ Must explicitly define:
- Group folders (protected)
- Direct route screens

Nested Levels (layout.tsx):
✅ Must define:
- Individual screens/routes within that folder
❌ Don't need to define:
- Nested folders/directories
- Group folders

Example Structure:
app/
├── _layout.tsx         // Must define (protected)
├── (protected)/
│   ├── _layout.tsx    // Only defines screens, not folders
│   └── organization/  
│       ├── _layout.tsx // Only defines screens (index, create-form, etc)
│       └── team/
│           └── _layout.tsx // Only defines team-related screens

