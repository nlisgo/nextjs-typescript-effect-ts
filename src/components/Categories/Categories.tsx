import { Array, pipe } from 'effect';
import Image from 'next/image';
import type { JSX } from 'react';
import './categories.css';
import { withBaseUrl } from '@/tools';

export type CategorySnippetProps = {
  id: string,
  name: string,
  uri: string,
  description: string,
  aimsAndScope?: ReadonlyArray<{
    type: 'paragraph',
    text: string,
  }>,
  image?: {
    uri: string,
    alt: string,
    width: number,
    height: number,
    credit?: string,
  },
};

export type CategoryProps = CategorySnippetProps;

export type CategoriesProps = {
  title: string,
  uri?: string,
  categories: ReadonlyArray<CategorySnippetProps>,
};

export const CategoryTags = ({
  categories,
}: { categories: ReadonlyArray<{ id: string, name: string }> }): JSX.Element => (
  <>
    {categories && categories.length > 0 && <ul className="category-tags">
      {
        pipe(
          categories,
          Array.map((category, i) => <li key={i} className="category-tags_item"><a href={withBaseUrl(`/categories/${category.id}`)} className="category-tags_item_link">{category.name}</a></li>),
        )
      }
    </ul>}
  </>
);

export const Categories = ({
  title,
  uri,
  categories,
}: CategoriesProps): JSX.Element => (
  <>
    {categories.length > 0 && <section className="categories">
      <h2 className="categories__title">{uri ? <a href={uri} className="categories__title_link">{title}</a> : title}</h2>
      <ul className="categories__list">
        {categories.map((category, i) => <li key={i} className="categories__list_item">
          <div className="category">
            <a href={category.uri} className="category__image-link">
              {category.image && <Image className="category__image" src={category.image.uri} alt={category.image.alt} width={category.image.width} height={category.image.height} />}
            </a>
            <div className="category__content">
              <h2 className="category__title">
                <a href={category.uri} className="category__title_link">{category.name}</a>
              </h2>
              <p
                className="category__description"
                dangerouslySetInnerHTML={{
                  __html: category.description,
                }}
              />
            </div>
          </div>
        </li>)}
      </ul>
    </section>}
  </>
);
