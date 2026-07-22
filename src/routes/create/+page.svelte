<script lang="ts">
  import lilyLogo from "$lib/assets/lily.png";
  import { enhance } from "$app/forms";
  import { page } from '$app/state';
	import Sidebar from "$lib/components/Sidebar.svelte";

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
  <div class="grid grid-cols-[1fr_2fr] gap-8 max-w-280 mx-auto items-start px-5 sm:px-6 md:px-8 max-[1040px]:grid-cols-[72px_minmax(0,1fr)] max-[640px]:grid-cols-1 max-[640px]:px-4">

    <Sidebar />

    <!-- Center Content Layout -->
    <main class="min-w-0">
      <div class="py-8 max-[640px]:pt-20 max-[640px]:pb-17.5">
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