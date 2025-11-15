import Image from 'next/image';
import type { JSX } from 'react';
import './categories.css';

export type CategorySnippetProps = {
  title: string,
  uri: string,
  description?: string,
  image: {
    uri: string,
    alt: string,
    width: number,
    height: number,
    attribution?: Array<string>,
  },
};

export type CategoryProps = {
  title: string,
  uri: string,
  description?: string,
  image: {
    uri: string,
    alt: string,
    width: number,
    height: number,
    attribution?: Array<string>,
  },
};

export type CategoriesProps = {
  title: string,
  categories: Array<CategorySnippetProps>,
};

export const Categories = ({
  title,
  categories,
}: CategoriesProps): JSX.Element => (
  <>
    {categories.length > 0 && <section className="categories">
      <h2 className="categories__title">{title}</h2>
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
