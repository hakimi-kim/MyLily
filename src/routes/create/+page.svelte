<script lang="ts">
  import lilyLogo from "$lib/assets/lily.png";
  import { enhance } from "$app/forms";
  import { page } from '$app/state';

  let { form } = $props();

  let preview = $state<string | null>(null);
  let detectedType = $state<"image" | "video" | null>(null);
  let fileError = $state<string | null>(null);
  let toast = $state<string | null>(null);
  let isSubmitting = $state(false); 
  
  const MAX_VIDEO_DURATION = 60; 

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      preview = null;
      detectedType = null;
      fileError = null;
      return;
    }

    fileError = null;

    if (file.type.startsWith("image/")) {
      detectedType = "image";
      preview = URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
      detectedType = "video";
      const objectUrl = URL.createObjectURL(file);

      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.src = objectUrl;
      
      videoEl.onloadedmetadata = () => {
        // Look here: Removed early revokeObjectURL so the browser can read the preview safely
        if (videoEl.duration > MAX_VIDEO_DURATION) {
          fileError = `Videos must be under ${MAX_VIDEO_DURATION} seconds. (Current: ${Math.round(videoEl.duration)}s)`;
          input.value = ""; 
          preview = null;
          detectedType = null;
        } else {
          preview = objectUrl;
        }
      };
    } else {
      fileError = "Unsupported file type. Please pick an image or video.";
      input.value = "";
      preview = null;
      detectedType = null;
    }
  }
</script>

{#if toast}
  <div class="fixed top-5 left-1/2 -translate-x-1/2 z-500 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-4 duration-200">
    ✿ {toast}
  </div>
{/if}

<div class="min-h-screen bg-neutral-100">
  <div class="grid grid-cols-[1fr_2fr] gap-8 max-w-280 mx-auto items-start px-5 max-[1040px]:grid-cols-[88px_minmax(0,1fr)] max-[640px]:grid-cols-1 max-[640px]:px-0">

    <!-- Left Sidebar -->
    <aside class="sticky top-0 h-screen py-8 flex flex-col max-[640px]:fixed max-[640px]:bottom-0 max-[640px]:left-0 max-[640px]:right-0 max-[640px]:top-auto max-[640px]:h-auto max-[640px]:bg-white max-[640px]:border-t max-[640px]:border-border max-[640px]:z-100 max-[640px]:py-1.5">
      <div class="flex flex-col h-full gap-1 max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-around">
        <div class="flex items-center gap-2 px-3 pb-8">
          <img src={lilyLogo} alt="Lily Garden Logo" class="w-8 h-8" />
          <span class="font-serif text-2xl font-medium text-[#5b3a5b] tracking-wide max-[1040px]:hidden">Stargazerr</span>
        </div>

        <nav class="flex flex-col gap-1 max-[640px]:flex-row max-[640px]:gap-0">
          <a href="/">
            <button class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11.5L12 4l9 7.5" />
                <path d="M5 10v9.5A1.5 1.5 0 0 0 6.5 21H9v-6h6v6h2.5a1.5 1.5 0 0 0 1.5-1.5V10" />
              </svg>
              <span>Home</span>
            </button>
          </a>

          <a href="/journal">
            <button class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Journal</span>
            </button>
          </a>

          <a href="/garden/">
            <button aria-label="Garden" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 19h18" />
                <path d="M12 19v-8" />
                <path d="M12 13c-1.8-.2-3-1.4-3.2-3.2 1.8 0 3.2 1 3.2 3.2z" fill="currentColor" fill-opacity="0.1" />
                <path d="M12 11c1.8-.2 3-1.4 3.2-3.2-1.8 0-3.2 1-3.2 3.2z" fill="currentColor" fill-opacity="0.1" />
                <circle cx="12" cy="6.5" r="1.6" fill="currentColor" fill-opacity="0.12" />
                <path d="M12 4.9v-1" />
                <path d="M13.4 5.7l.8-.8" />
                <path d="M10.6 5.7l-.8-.8" />
                <path d="M6.5 19v-4" />
                <path d="M6.5 15.5c-1.4 0-2.3-.9-2.5-2.2 1.4 0 2.5.8 2.5 2.2z" fill="currentColor" fill-opacity="0.1" />
                <path d="M17.5 19v-3" />
                <path d="M17.5 16c1.4 0 2.3-.9 2.5-2.2-1.4 0-2.5.8-2.5 2.2z" fill="currentColor" fill-opacity="0.1" />
              </svg>
              <span>Garden</span>
            </button>
          </a>

          <a href="/notification">
            <button aria-label="Notifications" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              {#if page.data.hasNotifications}
                <span class="absolute top-2.5 left-6.5 w-2 h-2 bg-amber-400 rounded-full border-2 border-white"></span>
              {/if}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Notifications</span>
            </button>
          </a>

          <a href="/explore">
            <button aria-label="Explore" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span>Explore</span>
            </button>
          </a>
        </nav>

        <div class="mt-auto flex flex-col gap-1 pb-3 max-[640px]:flex-row max-[640px]:mt-0 max-[640px]:gap-0 max-[640px]:pb-0">
          <a href="/create">
            <button aria-label="Create" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left bg-pink-100 text-[#4a3050] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span>Create</span>
            </button>
          </a>

          <a href="/profile">
            <button aria-label="Profile" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
            </button>
          </a>
        </div>
      </div>
    </aside>

    <!-- Center Content Layout -->
    <main class="min-w-0">
      <div class="py-8 max-[640px]:pb-17.5">
        <div class="bg-white rounded-2xl shadow-sm p-8 max-w-md mx-auto">
          <h1 class="font-serif text-2xl text-[#4a3050] mb-1">Plant a post</h1>
          <p class="text-sm text-muted-foreground mb-6">Share a photo or video with your mutuals.</p>

          <form 
            method="POST" 
            enctype="multipart/form-data" 
            use:enhance={() => {
              isSubmitting = true; 
              return async ({ result, update }) => {
                if (result.type === "redirect") {
                  toast = "Post planted successfully!";
                  setTimeout(() => {
                    update();
                  }, 1200); 
                } else {
                  isSubmitting = false;
                  await update();
                }
              };
            }}
            class="flex flex-col gap-4"
          >
            <label class="block">
              <span class="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Media</span>
              <input
                type="file"
                name="file"
                accept="image/*,video/mp4,video/quicktime,video/webm,video/*"
                required
                onchange={handleFileChange}
                class="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-pink-100 file:text-[#4a3050] file:font-semibold file:cursor-pointer"
              />
            </label>

            {#if preview}
              <div class="rounded-xl overflow-hidden bg-neutral-100 aspect-square flex items-center justify-center">
                {#if detectedType === "image"}
                  <img src={preview} alt="Preview" class="w-full h-full object-cover" />
                {:else if detectedType === "video"}
                  <!-- svelte-ignore a11y_media_has_caption -->
                  <video src={preview} controls class="w-full h-full object-cover"></video>
                {/if}
              </div>
            {/if}

            <input type="hidden" name="mediaType" value={detectedType === "video" ? "1" : "0"} />

            <label class="block">
              <span class="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Caption</span>
              <textarea
                name="caption"
                rows="3"
                placeholder="Say something about this moment..."
                class="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-pink-300 text-sm resize-none"
              ></textarea>
            </label>

            {#if fileError}
              <p class="text-sm text-rose-500">{fileError}</p>
            {/if}
            {#if form?.error}
              <p class="text-sm text-rose-500">{form.error}</p>
            {/if}

            <button
              type="submit"
              disabled={isSubmitting || !!fileError}
              class="mt-2 px-5 py-3 rounded-xl bg-[#65a0a0] text-white font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Planting..." : "✿ Post"}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</div>