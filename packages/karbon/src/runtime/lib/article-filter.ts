import type { ArticleDesk, ArticleTag, UseArticleReturn } from '../types'

type Article = UseArticleReturn

export type DeskParameters = keyof Omit<ArticleDesk, 'desk'>
export interface DeskConditionOption {
  type?: 'desk'
  key: DeskParameters
  value: string
}

export type TagParameters = keyof ArticleTag
export interface TagConditionOption {
  type: 'tag'
  key: TagParameters
  value: string
}

export interface AuthorConditionOption {
  type: 'author'
  key: 'id'
  value: string
}

export type Condition = DeskConditionOption | TagConditionOption | AuthorConditionOption
export type ConditionInput = string | Condition

export function normalizeCondition(conditionInput?: ConditionInput[]): { identity: string; conditions: Condition[] } {
  const identityList: string[] = []
  const normalizedCondition =
    conditionInput?.map((value): Condition => {
      if (typeof value === 'object') {
        const res = {
          type: 'desk' as const,
          ...value,
        }
        identityList.push(`${res.type}:${res.key}:${res.value}`)
        return res
      }

      const res = {
        type: 'desk' as const,
        key: 'name' as DeskParameters,
        value,
      }
      identityList.push(`${res.type}:${res.key}:${res.value}`)
      return res
    }) || []

  return {
    identity: identityList.join('|'),
    conditions: normalizedCondition,
  }
}

export function evaluateCondition(article: Article, conditions: Condition[] = []): boolean {
  if (conditions.length === 0) {
    return true
  }

  return conditions.some(({ type = 'desk', key, value }) => {
    if (type === 'desk') {
      return article.desk[key] === value || article.desk?.desk?.[key] === value
    } else if (type === 'author') {
      return article.authors.some((author) => author.id === value)
    } else {
      return article.tags.some((tag) => tag[key] === value)
    }
  })
}
