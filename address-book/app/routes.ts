import type { RouteConfig } from '@react-router/dev/routes';
import { index, layout, route } from '@react-router/dev/routes';

export default [
  layout('layouts/Banner.tsx', [
    layout('layouts/sidebar.tsx', [index('routes/home.tsx'), route('library/:libraryPath', 'routes/library.tsx')]),
    route('about', 'routes/about.tsx'),
  ]),
] satisfies RouteConfig;
