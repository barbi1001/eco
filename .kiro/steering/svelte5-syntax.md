# Svelte 5 Syntax Guidelines

## CRITICAL: Always Use Svelte 5 Syntax

When working with Svelte components in this project, you MUST always use Svelte 5 syntax and runes. Never use deprecated Svelte 4 patterns.

## Required Patterns

### 1. Component Props
**ALWAYS use `$props()` rune:**
```typescript
// ✅ CORRECT - Svelte 5
interface Props {
  name: string;
  onSubmit?: (data: any) => void;
}

let { name, onSubmit }: Props = $props();
```

**NEVER use `export let`:**
```typescript
// ❌ WRONG - Svelte 4 (deprecated)
export let name: string;
export let onSubmit: (data: any) => void;
```

### 2. Reactive State
**ALWAYS use `$state()` rune:**
```typescript
// ✅ CORRECT - Svelte 5
let count = $state(0);
let user = $state({ name: 'John', age: 30 });
```

**NEVER use plain `let` for reactive variables:**
```typescript
// ❌ WRONG - Svelte 4
let count = 0;
```

### 3. Derived Values
**ALWAYS use `$derived()` rune:**
```typescript
// ✅ CORRECT - Svelte 5
let doubled = $derived(count * 2);
let fullName = $derived(`${firstName} ${lastName}`);
```

**NEVER use `$:` reactive statements:**
```typescript
// ❌ WRONG - Svelte 4 (deprecated)
$: doubled = count * 2;
```

### 4. Event Handlers
**ALWAYS use callback props (not event dispatchers):**
```typescript
// ✅ CORRECT - Svelte 5
interface Props {
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
}

let { onClick, onSubmit }: Props = $props();

function handleClick() {
  onClick?.();
}
```

**NEVER use `createEventDispatcher`:**
```typescript
// ❌ WRONG - Svelte 4 (deprecated)
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();
dispatch('click');
```

### 5. Event Binding in Templates
**ALWAYS use lowercase event handlers:**
```svelte
<!-- ✅ CORRECT - Svelte 5 -->
<button onclick={handleClick}>Click</button>
<input oninput={handleInput} />
<form onsubmit={handleSubmit} />
```

**NEVER use `on:` directive:**
```svelte
<!-- ❌ WRONG - Svelte 4 (deprecated) -->
<button on:click={handleClick}>Click</button>
<input on:input={handleInput} />
```

### 6. Effects
**ALWAYS use `$effect()` rune:**
```typescript
// ✅ CORRECT - Svelte 5
$effect(() => {
  console.log('Count changed:', count);
});
```

**NEVER use `$:` for side effects:**
```typescript
// ❌ WRONG - Svelte 4 (deprecated)
$: console.log('Count changed:', count);
```

## Component Naming Convention

When passing callback props, use camelCase with "on" prefix:
- `onClick`
- `onSubmit`
- `onChange`
- `onTemplateSelect`
- `onError`
- `onDismiss`

## Migration Checklist

When converting Svelte 4 components to Svelte 5:

1. ✅ Replace `export let` with `$props()`
2. ✅ Replace reactive `let` with `$state()`
3. ✅ Replace `$:` derived with `$derived()`
4. ✅ Replace `$:` effects with `$effect()`
5. ✅ Replace `createEventDispatcher` with callback props
6. ✅ Replace `on:event` with `onevent` in templates
7. ✅ Add TypeScript interfaces for Props

## Example: Complete Component

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';

  interface Props {
    title: string;
    count?: number;
    onIncrement?: () => void;
    onDecrement?: () => void;
  }

  let { title, count = 0, onIncrement, onDecrement }: Props = $props();

  let internalCount = $state(count);
  let doubled = $derived(internalCount * 2);

  $effect(() => {
    console.log('Count changed:', internalCount);
  });

  function handleIncrement() {
    internalCount++;
    onIncrement?.();
  }

  function handleDecrement() {
    internalCount--;
    onDecrement?.();
  }
</script>

<div class="counter" transition:fade>
  <h2>{title}</h2>
  <p>Count: {internalCount}</p>
  <p>Doubled: {doubled}</p>
  <button onclick={handleIncrement}>+</button>
  <button onclick={handleDecrement}>-</button>
</div>
```

## REMEMBER

- Svelte 5 runes are NOT optional in this project
- Always check for deprecated patterns during code review
- TypeScript interfaces for Props are mandatory
- Callback props replace event dispatchers completely
