import { createRouter, createWebHistory } from 'vue-router';
import useUserStore from '../stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/manage-music',
      name: 'manage',
      // alias: '/manage', /*Allow component to re-render without redirecting */
      component: () => import('../views/ManageView.vue'),
      beforeEnter: (to, from, next) => {
        console.log('manage guard');
        next();
      },
      meta: {
        requiresAuth: true,
      },
    },
    // This redirects user from the old path to the new path
    {
      path: '/manage',
      redirect: { name: 'manage' },
    },
    {
      path: '/song/:songID',
      name: 'song',
      component: () => import('../views/SongView.vue'),
    },
    {
      path: '/:catchAll(.*)*',
      redirect: { name: 'home' },
    },
  ],
  linkExactActiveClass: 'text-yellow-500',
});

/**
 * Before each is available after the instance of the router is created.
 * It will allow to run the function before every request.
 * These guards run before any of the lifecycle functions do.
 * Untill we call the next() function, component isn't created
 */
router.beforeEach((to, from, next) => {
  console.log(to.meta);
  if (!to.meta.requiresAuth) {
    next();
    return;
  }
  const store = useUserStore();
  if (store.userLoggedIn) {
    next();
  } else {
    next({ name: 'home' });
  }
});

export default router;
