<script lang="ts" setup>
const article = useArticle()
const { cover, title, blurb, html: body, paidContent, id, plan } = article
const recommendArticles = useRecommendArticle(article, { count: 10 })
const customColors = useField('articlemeta.color', FieldType.Color, true)
const customFile = useField('articlemeta.file', FieldType.File)
const customNumber = useField('articlemeta.number', FieldType.Number)
const customBoolean = useField('articlemeta.rep', FieldType.Bool)
const customUrl = useField('articlemeta.url', FieldType.URL)

const gptConfig = {
  slots: [
    {
      id: 'banner-ad',
      path: '/6355419/Travel/Europe/France/Paris',
      sizes: [[300, 250]],
    },
  ],
  usePrebid: false,
  useAPS: false,
  customEvents: {
    blueBackground: {
      eventMessagePrefix: 'BlueBackground:',
    },
  },
}
</script>

<template>
  <div class="bg-white h-full">
    <ArticleHeroPhoto
      :src="cover?.url ?? 'https://picsum.photos/800/600'"
      width="500"
      height="500"
      sizes="sm:100vw md:50vw lg:400px"
      :modifiers="{ flip: true, quality: 5, blur: 25 }"
    />
    <ArticleTitle :value="title" />
    <ArticleBlurb :value="blurb || ''" />
    <ArticleBody :id="id" :plan="plan" :value="body" :paid-content="paidContent" />
    <div>
      <div>custom fields:</div>
      <div>colors: {{ customColors }}</div>
      <div>file: {{ customFile }}</div>
      <div>number: {{ customNumber }}</div>
      <div>boolean: {{ customBoolean }}</div>
      <div>url: {{ customUrl }}</div>
    </div>
    <div :style="{ backgroundColor: 'blue' }">test css</div>
    <div class="test-tailwind">test css</div>
    <ul class="flex overflow-x-auto">
      <li v-for="recommendArticle of recommendArticles" :key="recommendArticle.id" class="border">
        <NuxtLink class="underline text-teal-400" :to="recommendArticle.url">
          {{ recommendArticle.id }} / {{ recommendArticle.title }}
        </NuxtLink>
      </li>
    </ul>
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
</template>

<style lang="scss">
.test-tailwind {
  background-color: green;
}
</style>
