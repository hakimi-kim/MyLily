<script lang="ts">
  import { enhance } from '$app/forms';
  import { Eye, EyeOff } from 'lucide-svelte';
  import * as Card from "$lib/components/ui/card";
  import { FieldGroup, Field, FieldLabel } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from "$lib/components/ui/button/index.js";

  let { form } = $props();

  let showPassword = $state(false);
  let isSubmitting = $state(false);

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<div 
  class="min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat" 
  style="background-image: url('C:\\Users\\VICTUS\\Coding\\personal\\Lily\\MyLilyFrontend\\src\\lib\\assets\\lillies.jpg');"
>
  <!-- Overlay for readability and contrast -->
  <div class="flex min-h-screen w-full items-center justify-center px-4 bg-[#fdf6f9]/60 backdrop-blur-sm">
    <Card.Root class="mx-auto w-full max-w-sm shadow-xl bg-white/95">
      <Card.Header>
        <Card.Title class="text-2xl">Register</Card.Title>
        <Card.Description>Create an account to get started</Card.Description>
      </Card.Header>
      <Card.Content>
        <form 
          method="POST" 
          action="?/register" 
          use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
              isSubmitting = false;
              // reset: false prevents inputs from being wiped out while updating form errors
              await update({ reset: false });
            };
          }}
        >
          <FieldGroup>
            
            {#if form?.error}
              <div class="rounded-md bg-red-50 p-3 text-sm text-red-800 transition-all duration-200">
                {form.error}
              </div>
            {/if}

            <Field>
              <FieldLabel for="username">Username (Email)</FieldLabel>
              <Input
                id="username"
                name="username"
                type="email"
                placeholder="user@example.com"
                value={form?.username ?? ''}
                required
              />
            </Field>

            <Field>
              <FieldLabel for="display-name">Display Name</FieldLabel>
              <Input
                id="display-name"
                name="displayName"
                type="text"
                placeholder="Enter your display name"
                value={form?.displayName ?? ''}
                required
              />
            </Field>

            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">Password</FieldLabel>
              </div>
              <div class="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  minlength={8}
                  placeholder="At least 8 characters"
                  class="pr-10"
                  required
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
            </Field>

            <Field>
              <Button type="submit" class="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </Field>

            <div class="mt-1 text-center text-sm text-[#4a3050]">
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
</div>