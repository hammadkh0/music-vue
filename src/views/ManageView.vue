<template>
  <!-- Main Content -->
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <app-upload ref="upload" :addSong="addSong" />
      </div>

      <div class="col-span-2">
        <div class="bg-white rounded border border-gray-200 relative flex flex-col">
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">My Songs</span>
            <i class="fa fa-compact-disc float-right text-green-400 text-2xl"></i>
          </div>
          <div class="p-6">
            <!-- Composition Items -->
            <composition-item
              v-for="(song, idx) in songs"
              :key="song.docID"
              :song="song"
              :index="idx"
              :updateSong="updateSong"
              :removeSong="removeSong"
              :updateUnsavedFlag="updateUnsavedFlag"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// import useUseStore from '../stores/user';
import AppUpload from '../components/AppUpload.vue';
import CompositionItem from '../components/CompositionItem.vue';

import { auth, songsCollection } from '../includes/firebase';
export default {
  name: 'ManageView',
  components: {
    AppUpload,
    CompositionItem,
  },
  data() {
    return {
      songs: [],
      unsavedFlag: false,
    };
  },
  async created() {
    const snapshot = await songsCollection.where('uid', '==', auth.currentUser.uid).get();
    snapshot.forEach(this.addSong);
  },
  methods: {
    updateSong(idx, values) {
      this.songs[idx].modified_name = values.modified_name;
      this.songs[idx].genre = values.genre;
    },
    removeSong(idx) {
      this.songs.splice(idx, 1);
    },
    addSong(document) {
      const song = {
        ...document.data(),
        docID: document.id,
      };
      this.songs.push(song);
    },
    updateUnsavedFlag(value) {
      this.unsavedFlag = value;
    },
  },
  /**
   * Replacing the component specific guard with the global guard because it is more scalable
   */
  // beforeRouteEnter: (to, from, next) => {
  //   const store = useUseStore();
  //   if (store.userLoggedIn) {
  //     next();
  //   } else {
  //     next({ name: 'home' });
  //   }
  // }

  beforeRouteLeave(to, from, next) {
    /**
     * This will be called when the route is about to be changed. The $refs will contain the refs that are passed to the child components.
     * You can get the properties from the child through this ref.
     * Each child component will have their unique refs that will prevent overlapping of data.
     */
    // this.$refs.upload.cancelUpload();
    // next();

    if (!this.unsavedFlag) {
      next();
    } else {
      // confirm is a boolean function provided by the broweser.
      const leave = confirm('You have unsaved changes. Are you sure you want to leave?');
      // if leave === false, next will not work and will not redirect to another route
      next(leave);
    }
  },
};
</script>
