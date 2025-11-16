import Image from 'next/image';
import type { JSX } from 'react';
import './categories.css';

export type CategorySnippetProps = {
  id: string,
  title: string,
  uri: string,
  description?: string,
  image: {
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
  categories: Array<CategorySnippetProps>,
};

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
              <Image className="category__image" src={category.image.uri} alt={category.image.alt} width={category.image.width} height={category.image.height} />
            </a>
            <div className="category__content">
              <h2 className="category__title">
                <a href={category.uri} className="category__title_link">{category.title}</a>
              </h2>
              {category.description && (
                <p
                  className="category__description"
                  dangerouslySetInnerHTML={{
                    __html: category.description,
                  }}
                />
              )}
            </div>
          </div>
        </li>)}
      </ul>
    </section>}
  </>
);
