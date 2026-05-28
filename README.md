# Xplode UI

A personal React component library built with **TypeScript**, **Tailwind CSS v4**, and **CVA** (class-variance-authority).

## Installation

```bash
npm install xplode-ui
```

`react` and `react-dom` (v18 or v19) are peer dependencies, so make sure they are installed in your project.

## Usage

Import the component and the prebuilt stylesheet once at your app's entry point:

```tsx
import { Button } from "xplode-ui";
import "xplode-ui/styles.css";

export function App() {
  return (
    <Button variant="primary" size="md">
      Click me
    </Button>
  );
}
```

The bundled `xplode-ui/styles.css` is self-contained — **you do not need Tailwind CSS installed** to use the components.

## Components

### Button

| Prop      | Type                                            | Default     |
| --------- | ----------------------------------------------- | ----------- |
| `variant` | `"default" \| "secondary" \| "ghost" \| "danger"` | `"default"` |
| `size`    | `"sm" \| "md" \| "lg"`                          | `"md"`      |

All standard `<button>` attributes are forwarded, and a `ref` is forwarded to the underlying element.

## Theming (Tailwind v4 consumers)

If your app already uses Tailwind v4, you can pull in Xplode UI's design tokens and override them in your own `@theme`:

```css
/* your app.css */
@import "tailwindcss";
@import "xplode-ui/theme.css";

/* make Tailwind scan the library's classes */
@source "../node_modules/xplode-ui/dist";

@theme {
  /* override any token, e.g. the brand color */
  --color-brand-600: oklch(0.55 0.2 150);
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
