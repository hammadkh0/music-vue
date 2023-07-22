<template>
  <header id="header" class="bg-gray-700">
    <nav class="container mx-auto flex justify-start items-center py-5 px-4">
      <!-- App Name -->
      <router-link
        :to="{ name: 'home' }"
        class="text-white font-bold uppercase text-2xl mr-4"
        href="#"
        exact-active-class="no-active"
        >Music
      </router-link>

      <div class="flex flex-grow items-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1">
          <!-- Navigation Links -->
          <li>
            <router-link href="#" class="px-2 text-white" :to="{ name: 'about' }"
              >About</router-link
            >
          </li>
          <li v-if="!userStore.userLoggedIn">
            <a class="px-2 text-white" href="#" @click.prevent="toggleAuthModal"
              >Login / Register
            </a>
          </li>
          <template v-else>
            <li>
              <router-link href="#" class="px-2 text-white" :to="{ name: 'manage' }"
                >Manage</router-link
              >
            </li>
            <li>
              <a class="px-2 text-white" href="#" @click.prevent="signOut">Logout</a>
            </li>
          </template>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapStores } from 'pinia';
import useModalStore from '../stores/modal'; //giving a custom standard name useModalStore because this is a modal store import
import useUserStore from '../stores/user';

export default {
  name: 'AppHeader',
  computed: {
    ...mapStores(useModalStore, useUserStore)
    /**
     * Allows using stores without the composition API (setup()) by generating an object to be spread in the computed field of a component. It accepts a list of store definitions.
     * the mapStores will automatically create an object corresponding to the store name
     *  -> modal store will become modalStore
     *  -> user store will become userStore
     * Now get properties from userStore by this.userStore.userLoggedIn
     */
  },
  methods: {
    toggleAuthModal() {
      //this.modalStore is created by the mapStores function using the custom modalStore passed as argument
      this.modalStore.isOpen = !this.modalStore.isOpen;
      console.log(this.modalStore.isOpen);
    },
    signOut() {
      this.userStore.signOut();
      if (this.$route?.meta?.requiresAuth) this.$router.push({ name: 'home' });
    }
  }
};
</script>
