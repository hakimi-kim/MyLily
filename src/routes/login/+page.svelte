<script lang="ts">
  import { enhance } from '$app/forms';
  import { Eye, EyeOff } from 'lucide-svelte';
  import * as Card from "$lib/components/ui/card";
  import { FieldGroup, Field, FieldLabel } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from "$lib/components/ui/button/index.js";
	import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let showPassword = $state(false);
  let isSubmitting = $state(false);

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<div class="min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat">
  <div class="flex min-h-screen w-full items-center justify-center px-4 bg-[#fdf6f9]/60 backdrop-blur-sm">
    <Card.Root class="mx-auto w-full max-w-sm shadow-xl bg-white/95">
      <Card.Header>
        <Card.Title class="text-xl font-bold text-[#4a3050]">Login</Card.Title>
        <Card.Description class="text-xs">Enter your username below to login to your account</Card.Description>
      </Card.Header>

      <Card.Content>
        <form
          method="POST"
          action="?/login"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
              isSubmitting = false;
              await update();
            };
          }}
        >
          <FieldGroup>

            {#if form?.errors?.form}
              <div class="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {form.errors.form}
              </div>
            {/if}

            <Field>
              <FieldLabel for="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={form?.username ?? ''}
                class={form?.errors?.username ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
              />
              {#if form?.errors?.username}
                <p class="text-[11px] text-rose-600 font-medium mt-0.5">{form.errors.username}</p>
              {/if}
            </Field>

            <Field>
              <FieldLabel for="password">Password</FieldLabel>
              <div class="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  class="pr-10 {form?.errors?.password ? 'border-rose-500 focus-visible:ring-rose-500' : ''}"
                />
                <button
                  type="button"
                  onclick={togglePasswordVisibility}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {#if showPassword}
                    <EyeOff class="size-4" />
                  {:else}
                    <Eye class="size-4" />
                  {/if}
                </button>
              </div>
              {#if form?.errors?.password}
                <p class="text-[11px] text-rose-600 font-medium mt-0.5">{form.errors.password}</p>
              {/if}
            </Field>

            <Field>
              <Button type="submit" class="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </Field>

            <div class="mt-4 text-center text-sm text-[#4a3050]">
              Don't have an account?
              <a href="/register" class="font-semibold text-[#d4af37] hover:underline">
                Register here
              </a>
            </div>

          </FieldGroup>
        </form>
      </Card.Content>
    </Card.Root>
  </div>
</div>