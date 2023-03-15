<script setup lang="ts">
import ArticleCard from '~/components/ArticleCard.vue'

const article = useArticle()
const { cover, title, published_at } = article
const recommendArticles = useRecommendArticle(article, { count: 3 })

const socials = {}

const socialLinks = {}
</script>

<template>
  <main class="block">
    <section>
      <div class="my-[50px] mx-auto w-[1140px] max-w-[min(calc(100vw-30px),100%)]">
        <!-- article -->
        <div class="my-[50px] mx-auto w-[43.75rem] max-w-full">
          <!-- article image -->
          <ArticleHeroPhoto
            v-if="cover?.url"
            :src="cover.url"
            width="700"
            height="394"
            class="mb-4 aspect-[55/31] w-full rounded object-cover"
          />
          <!-- article title -->
          <ArticleTitle class="mb-4 font-serif text-[2.5rem] font-bold leading-[1.3]" :value="title" />
          <!-- article date -->
          <p class="relative my-[1.875rem] min-h-[3.125rem] text-sm opacity-60"></p>
          <!-- article content -->
          <ArticleBody class="mb-6 break-words leading-[1.6rem]" />
          <!-- social links -->
          <ul class="my-6 flex">
            <li
              v-for="(icon, social) in socials"
              :key="social"
              :style="{ 'background-color': icon.backgroundColor }"
              class="mr-2 mb-[0.2rem] flex h-fit w-fit items-center rounded-[0.313rem]"
            >
              <a rel="noopener" target="_blank" :href="socialLinks[social]" class="block p-2">
                <svg viewBox="0 0 24 24" height="1em" width="1em">
                  <path :d="icon.svg" fill="#fff" />
                </svg>
              </a>
            </li>
          </ul>
          <ParenterLink to="/" class="w-fit text-base underline">« Back to Blog</ParenterLink>
        </div>
        <!-- related articles -->
        <div class="my-12 mx-auto max-w-full">
          <h2 class="mb-4">Related Articles</h2>
          <div class="mb-5 mt-[0.313rem] grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
            <ArticleCard v-for="article in recommendArticles" :key="article.id" :article="article">
              <div class="relative px-[0.9rem] pt-[2.7rem] pb-[2.2rem] text-[#333]">
                <h2 class="text-center leading-[1.2]">{{ article.title }}</h2>
                <p class="mb-[0.8rem] text-center text-[0.813rem] font-light leading-8"></p>
              </div>
            </ArticleCard>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped></style>
