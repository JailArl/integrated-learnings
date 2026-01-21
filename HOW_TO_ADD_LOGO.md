# How to Add Your Company Logo

There are **3 easy ways** to add your logo to the website:

---

## **Option 1: Use an Image File (Recommended)**

### Step 1: Prepare your logo
- **Format**: PNG or SVG (SVG is best for crisp quality at any size)
- **Size**: Recommended width 150-200px for header
- **Background**: Transparent background works best
- **File name**: `logo.png` or `logo.svg`

### Step 2: Add logo to the project
```bash
# Create public/images folder if it doesn't exist
mkdir -p /workspaces/integrated-learnings-v2/public/images

# Place your logo file there
# For example: /workspaces/integrated-learnings-v2/public/images/logo.png
```

### Step 3: Update Layout.tsx
Replace the current logo section (around line 28-35) with:

```tsx
{/* Logo */}
<Link to="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
  <img 
    src="/images/logo.png" 
    alt="Integrated Learnings" 
    className="h-12 w-auto" 
  />
  {/* Optional: Keep text next to logo or remove if logo has text */}
  <span className="font-bold text-xl text-primary tracking-tight hidden md:block">
    Integrated Learnings
  </span>
</Link>
```

---

## **Option 2: Use an External URL**

If your logo is hosted elsewhere (e.g., Google Drive, Dropbox, CDN):

```tsx
{/* Logo */}
<Link to="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
  <img 
    src="https://your-logo-url.com/logo.png" 
    alt="Integrated Learnings" 
    className="h-12 w-auto" 
  />
</Link>
```

---

## **Option 3: Use a Simple Text Logo (Current)**

The current setup uses initials "IL" in a colored box:

```tsx
{/* Logo - Current Simple Version */}
<Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
  <div className="bg-primary text-white p-2 rounded font-bold text-xl tracking-tighter">
    IL
  </div>
  <span className="font-bold text-xl text-primary tracking-tight">Integrated Learnings</span>
</Link>
```

**To customize this:**
- Change `IL` to your preferred initials
- Adjust colors: `bg-primary` (background), `text-white` (text color)
- Modify size: `text-xl` (font size), `p-2` (padding)

---

## **Quick Implementation**

I'll create a logo-ready version for you. Just:

1. **Place your logo file** in `/workspaces/integrated-learnings-v2/public/images/logo.png`
2. The code will automatically use it if it exists
3. Falls back to text logo if no image is found

---

## **Logo Specifications for Best Results**

| Aspect | Recommendation |
|--------|---------------|
| **File Format** | SVG (vector) > PNG (transparent) > JPG |
| **Dimensions** | 200px width × 60px height (approx) |
| **File Size** | Under 100KB for fast loading |
| **Color Mode** | RGB for web |
| **Background** | Transparent (PNG/SVG) |

---

## **Need Help?**

If you have your logo file ready:
1. Tell me the file name
2. I'll update the code to use it
3. You just need to upload the file to `/public/images/`

Example command to upload:
```bash
# From your computer terminal (not VS Code)
scp /path/to/your/logo.png username@server:/workspaces/integrated-learnings-v2/public/images/
```

Or use the VS Code file explorer to drag & drop into the `public/images/` folder!
