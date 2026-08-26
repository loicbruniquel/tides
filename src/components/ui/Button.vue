<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { Primitive } from 'reka-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
      },
      size: {
        default: 'h-10 px-4 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

withDefaults(
  defineProps<{
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    /** Render as something else — e.g. `as="router-link"` for navigation. */
    as?: string | object
    class?: string
  }>(),
  { as: 'button' },
)
</script>

<template>
  <Primitive :as="as" :class="cn(buttonVariants({ variant, size }), $props.class)">
    <slot />
  </Primitive>
</template>
