import type { JSX } from 'react';
import './pagination.css';

export type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  hrefBuilder?: (page: number) => string;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const Pagination = ({ currentPage, totalItems, pageSize, hrefBuilder }: PaginationProps): JSX.Element => {
  const safePageSize = pageSize > 0 ? pageSize : 1;
  const totalPages = Math.max(1, Math.ceil(Math.max(totalItems, 0) / safePageSize));
  const page = clamp(currentPage, 1, totalPages);

  const startIndex = totalItems === 0 ? 0 : (page - 1) * safePageSize + 1;
  const endIndex = Math.min(page * safePageSize, Math.max(totalItems, 0));

  const disablePrevious = page <= 1;
  const disableNext = page >= totalPages || totalItems === 0;
  const previousHref = !disablePrevious && hrefBuilder ? hrefBuilder(page - 1) : undefined;
  const nextHref = !disableNext && hrefBuilder ? hrefBuilder(page + 1) : undefined;

  return (
    <nav className="pagination" aria-label="Pagination">
      <a
        className={`pagination__link ${disablePrevious ? 'pagination__link--disabled' : ''}`}
        href={previousHref}
        aria-disabled={disablePrevious}
        tabIndex={disablePrevious ? -1 : undefined}
      >
        Previous
      </a>
      <div className="pagination__summary">
        {totalItems === 0 ? 'Showing 0 of 0' : `Showing ${startIndex}-${endIndex} of ${totalItems}`}
      </div>
      <a
        className={`pagination__link ${disableNext ? 'pagination__link--disabled' : ''}`}
        href={nextHref}
        aria-disabled={disableNext}
        tabIndex={disableNext ? -1 : undefined}
      >
        Next
      </a>
    </nav>
  );
};
