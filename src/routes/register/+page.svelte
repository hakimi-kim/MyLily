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
  let showConfirmPassword = $state(false);
  let isSubmitting = $state(false);
  let password = $state('');
  let confirmPassword = $state('');

  let passwordsMismatch = $derived(
    confirmPassword.length > 0 && password !== confirmPassword
  );

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function toggleConfirmationPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }
</script>

<div
  class="min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat flex items-center justify-center p-4 bg-[#fdf6f9]/60 backdrop-blur-sm"
  style="background-image: url('C:\\Users\\VICTUS\\Coding\\personal\\Lily\\MyLilyFrontend\\src\\lib\\assets\\lillies.jpg');"
>
  <Card.Root class="mx-auto w-full max-w-sm shadow-xl bg-white/95 border border-rose-100/50">
    <Card.Header class="px-4 pb-2">
      <Card.Title class="text-xl font-bold text-[#4a3050]">Register</Card.Title>
      <Card.Description class="text-xs">Create an account to get started</Card.Description>
    </Card.Header>

    <Card.Content class="px-4 pt-1">
      <form
        method="POST"
        action="?/register"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            isSubmitting = false;
            await update({ reset: false });
          };
        }}
      >
        <FieldGroup class="gap-2.5">

          {#if form?.errors?.form}
            <div class="rounded-md bg-red-50 p-3 text-xs text-red-800">
              {form.errors.form}
            </div>
          {/if}

          <Field>
            <FieldLabel for="username">Username</FieldLabel>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Unique username"
              value={form?.username ?? ''}
              class="h-8.5 text-xs px-2.5 {form?.errors?.username ? 'border-rose-500 focus-visible:ring-rose-500' : ''}"
            />
            {#if form?.errors?.username}
              <p class="text-[11px] text-rose-600 font-medium mt-0.5">{form.errors.username}</p>
            {/if}
          </Field>

          <Field>
            <FieldLabel for="display-name">Display Name</FieldLabel>
            <Input
              id="display-name"
              name="displayName"
              type="text"
              placeholder="Your display name"
              value={form?.displayName ?? ''}
              class="h-8.5 text-xs px-2.5"
            />
          </Field>

          <Field>
            <FieldLabel for="password">Password</FieldLabel>
            <div class="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                class="h-8.5 text-xs pl-2.5 pr-8 {form?.errors?.password ? 'border-rose-500 focus-visible:ring-rose-500' : ''}"
                bind:value={password}
              />
              <button
                type="button"
                onclick={togglePasswordVisibility}
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}
                  <EyeOff class="size-3.5" />
                {:else}
                  <Eye class="size-3.5" />
                {/if}
              </button>
            </div>
            {#if form?.errors?.password}
              <p class="text-[11px] text-rose-600 font-medium mt-0.5">{form.errors.password}</p>
            {/if}
          </Field>

          <Field>
            <FieldLabel for="confirm-password">Confirm Password</FieldLabel>
            <div class="relative">
              <Input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                class="h-8.5 text-xs pl-2.5 pr-8 {passwordsMismatch || form?.errors?.confirmPassword ? 'border-rose-500 focus-visible:ring-rose-500' : ''}"
                bind:value={confirmPassword}
              />
              <button
                type="button"
                onclick={toggleConfirmationPasswordVisibility}
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {#if showConfirmPassword}
                  <EyeOff class="size-3.5" />
                {:else}
                  <Eye class="size-3.5" />
                {/if}
              </button>
            </div>
            {#if passwordsMismatch}
              <p class="text-[11px] text-rose-600 font-medium mt-0.5">Passwords do not match.</p>
            {:else if form?.errors?.confirmPassword}
              <p class="text-[11px] text-rose-600 font-medium mt-0.5">{form.errors.confirmPassword}</p>
            {/if}
          </Field>

          <Field class="mt-1">
            <Button type="submit" class="w-full h-8.5" disabled={isSubmitting || passwordsMismatch}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </Field>

          <div class="text-center text-sm text-[#4a3050]">
            Already have an account?
            <a href="/login" class="font-semibold text-[#d4af37] hover:underline">
              Login here
            </a>
          </div>

        </FieldGroup>
      </form>
    </Card.Content>
  </Card.Root>
</div>