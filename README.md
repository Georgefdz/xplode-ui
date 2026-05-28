# Xplode UI

A personal React component library built with **TypeScript**, **Tailwind CSS v4**, **CVA**, and **Radix Slot**. Patterns adapted from [shadcn/ui](https://ui.shadcn.com) — semantic tokens, dark mode, `asChild` composition, and icon-aware sizing.

## Installation

```bash
npm install xplode-ui
```

`react` and `react-dom` (v18 or v19) are peer dependencies. Make sure they are installed in your project.

## Usage

Import the component and the prebuilt stylesheet once at your app's entry point:

```tsx
import { Button } from "xplode-ui";
import "xplode-ui/styles.css";

export function App() {
  return (
    <Button variant="default" size="default">
      Click me
    </Button>
  );
}
```

The bundled `xplode-ui/styles.css` is self-contained — **you do not need Tailwind CSS installed** to use the components.

### Dark mode

Tokens flip automatically when any ancestor has the `.dark` class:

```tsx
<body className="dark">
  <Button>Looks great in the dark</Button>
</body>
```


### Composition with `asChild`

Render the styles on a different element (e.g. a Next.js `<Link>` or a plain `<a>`) without nesting:

```tsx
<Button asChild variant="default">
  <a href="/about">About</a>
</Button>
```

### Icons

Drop any SVG inside `<Button>` and it's auto-sized via base classes:

```tsx
import { Mail, ArrowRight } from "lucide-react";

<Button>
  <Mail /> Send email
</Button>

<Button variant="secondary">
  Next <ArrowRight />
</Button>

<Button size="icon" variant="ghost" aria-label="Send">
  <Mail />
</Button>
```

## Components

### Button

| Prop      | Type                                                                              | Default     |
| --------- | --------------------------------------------------------------------------------- | ----------- |
| `variant` | `"default" \| "outline" \| "secondary" \| "ghost" \| "destructive" \| "link"`     | `"default"` |
| `size`    | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"default"` |
| `asChild` | `boolean`                                                                         | `false`     |

All standard `<button>` attributes are forwarded, and a `ref` is forwarded to the underlying element. The component exposes `data-slot="button"`, `data-variant`, and `data-size` for CSS targeting.

`buttonVariants` is also exported so you can apply the same styles to other elements:

```tsx
import { buttonVariants } from "xplode-ui";
<a className={buttonVariants({ variant: "outline", size: "sm" })}>Link</a>
```

## Theming (Tailwind v4 consumers)

If your app already uses Tailwind v4, you can pull in Xplode UI's design tokens and override them in your own `@theme`:

```css
/* your app.css */
@import "tailwindcss";
@import "xplode-ui/theme.css";

/* make Tailwind scan the library's classes */
@source "../node_modules/xplode-ui/dist";

@theme {
  /* override any token, e.g. the primary color */
  --color-primary: oklch(0.55 0.2 150);
  --color-primary-foreground: oklch(0.98 0 0);
}
```

## Development

```bash
npm run storybook   # component playground + docs
npm run test        # run unit/component tests (Vitest + Testing Library)
npm run build       # build the library into dist/
```

## License

[MIT](./LICENSE)
