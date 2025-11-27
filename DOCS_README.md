# Documentation for AI Agents

This project has structured documentation to help AI agents understand the codebase efficiently.

## 📖 Documentation Files

### 1. **QUICK_START.md** ⚡ (Start Here - ~750 tokens)
**Use this for most tasks.** Condensed guide with:
- Critical rules (colors, typography, layout)
- Design tokens (copy-paste ready)
- Screen template
- Routing basics
- User roles overview
- Common patterns
- Pre-submit checklist

**When to use**: New screens, bug fixes, feature additions

---

### 2. **AGENT_INSTRUCTIONS.md** 📚 (Detailed Reference - ~4,000 tokens)
**Use when you need comprehensive details.** Complete guide with:
- Mandatory design rules with examples
- Full project structure
- Routing architecture (custom, not react-router)
- User roles & views (3 roles explained)
- State management patterns
- Screen structure & component patterns
- Design system & styling (complete token reference)
- Common errors to avoid
- Navigation patterns
- Data flow patterns
- Testing checklist

**When to use**: Complex features, architectural questions, troubleshooting

---

### 3. **src/guidelines/Guidelines.md** 🎨 (Material Design 3)
**Use for design decisions.** Material Design 3 principles:
- Color & theming
- Typography
- Shape, elevation, surfaces
- Motion & transitions
- Navigation choices
- Core components
- Accessibility
- App-specific patterns

**When to use**: Design questions, component selection, accessibility

---

## 🎯 Recommended Usage

### For Quick Tasks (New Screen, Bug Fix)
```
1. Read QUICK_START.md
2. Use the screen template
3. Check the pre-submit checklist
```

### For Complex Features
```
1. Skim QUICK_START.md for rules
2. Read relevant sections of AGENT_INSTRUCTIONS.md
3. Reference Guidelines.md for design decisions
```

### For Troubleshooting
```
1. Check "Common Errors to Avoid" in AGENT_INSTRUCTIONS.md
2. Verify against QUICK_START.md checklist
3. Check Guidelines.md for M3 patterns
```

---

## 💡 How to Reference in Chat

### Simple mention (recommended)
```
"Follow QUICK_START.md"
"Check the design tokens in QUICK_START.md"
"Use the screen template from QUICK_START.md"
```

### For specific sections
```
"Follow the routing guide in AGENT_INSTRUCTIONS.md section 2"
"Use the user roles patterns from AGENT_INSTRUCTIONS.md section 3"
```

### For design questions
```
"Follow M3 guidelines in src/guidelines/Guidelines.md"
```

---

## 📊 Token Efficiency

| File | Words | Est. Tokens | Use Case |
|------|-------|-------------|----------|
| QUICK_START.md | ~558 | ~750 | Most tasks (90%) |
| AGENT_INSTRUCTIONS.md | ~2,852 | ~4,000 | Complex features (10%) |
| Guidelines.md | ~1,200 | ~1,600 | Design decisions |

**Tip**: Start with QUICK_START.md to save tokens. Only load full docs when needed.

---

## 🚀 Quick Reference

**Critical Rules:**
- ✅ Use semantic tokens: `bg-surface`, `text-on-surface`
- ✅ Use M3 typography: `title-large`, `body-medium`
- ✅ No `<ResponsiveLayout>` in screens
- ✅ Use `setCurrentScreen()` for routing
- ✅ 48px minimum touch targets

**Files to Know:**
- `src/App.tsx` - Routing
- `src/hooks/useAppState.ts` - State + Screen type
- `src/index.css` - Design tokens (lines 5297-5370)
- `src/data/mockData.ts` - Mock data
