import { ReactDOMServer } from 'next/dist/server/route-modules/app-page/vendored/ssr/entrypoints';
import { JSX } from 'react';
import striptags from 'striptags';

export const jsxToHtml = (jsx: JSX.Element): string => ReactDOMServer.renderToString(jsx);

export const jsxToText = (jsx: JSX.Element): string => striptags(jsxToHtml(jsx));
