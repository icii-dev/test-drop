import { HomePage } from '../pages';
import { route } from './configs';

const publicRoutes = [{ path: route.home, element: HomePage }];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
