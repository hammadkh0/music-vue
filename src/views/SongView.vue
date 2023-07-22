<template lang="">
  <!-- Music Header -->
  <section class="w-full mb-8 py-14 text-center text-white relative">
    <div
      class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
      style="background-image: url(/assets/img/song-header.png)"
    ></div>
    <div class="container mx-auto flex items-center">
      <!-- Play/Pause Button -->
      <button
        @click.prevent="newSong(song)"
        type="button"
        class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
      >
        <i class="fas fa-play"></i>
      </button>
      <div class="z-50 text-left ml-8">
        <!-- Song Info -->
        <div class="text-3xl font-bold">{{ song.modified_name }}</div>
        <div>Genre: {{ song.genre }}</div>
      </div>
    </div>
  </section>

  <!-- Form -->
  <section class="container mx-auto mt-6" id="comments">
    <div class="bg-white rounded border border-gray-200 relative flex flex-col">
      <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
        <!-- Comment Count -->
        <span class="card-title">{{
          $tc('song.comment_count', song.comment_count, { count: song.comment_count })
        }}</span>
        <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
      </div>
      <div class="p-6">
        <div
          class="text-white text-center fond-bold p-4 mb-4"
          v-if="comment_show_alert"
          :class="comment_alert_variant"
        >
          {{ comment_alert_message }}
        </div>
        <vee-form :validation-schema="schema" @submit="addComment" v-if="userLoggedIn">
          <vee-field
            name="comment"
            as="textarea"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
            placeholder="Your comment
          here..."
          />
          <ErrorMessage class="text-red-500" name="comment" />
          <button
            type="submit"
            :disabled="comment_in_submission"
            class="py-1.5 px-3 rounded text-white bg-green-600 block"
          >
            Submit
          </button>
        </vee-form>
        <!-- Sort Comments -->
        <select
          v-model="sort"
          class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        >
          <option value="1">Latest</option>
          <option value="2">Oldest</option>
        </select>
      </div>
    </div>
  </section>
  <!-- Comments -->
  <ul class="container mx-auto">
    <li
      class="p-6 bg-gray-50 border border-gray-200"
      v-for="comment in sortedComments"
      :key="comment.docID"
    >
      <!-- Comment Author -->
      <div class="mb-5">
        <div class="font-bold">{{ comment.userName }}</div>
        <div class="flex gap-3">
          <time>{{
            new Date(comment.createdAt).toLocaleDateString('en-us', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }}</time>
          <time>{{ new Date(comment.createdAt).toLocaleTimeString('en-us') }}</time>
        </div>
      </div>

      <p>
        {{ comment.content }}
      </p>
    </li>
  </ul>
</template>
<script>
import { auth, songsCollection, commentsCollection } from '../includes/firebase';
import { mapState, mapActions } from 'pinia';
import useUserStore from '../stores/user';
import usePlayerStore from '../stores/player';

export default {
  name: 'SongView',
  data() {
    return {
      song: {},
      comments: [],
      schema: {
        comment: 'required|min:5',
      },
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_variant: 'bg-blue-500',
      comment_alert_message: 'Please wait! Your comment is being submitted',
      sort: '1',
    };
  },
  computed: {
    ...mapState(useUserStore, ['userLoggedIn']),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        // sort = 1 represents DESCENDING order
        if (this.sort === '1') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // otherwise sort in ascending order
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    },
  },
  async created() {
    const snapshot = await songsCollection.doc(this.$route.params.songID).get();
    if (!snapshot.exists) {
      this.$router.push({ name: 'home' });
      return;
    }

    // getting the sort value from the request query param. If sort doesn't exist, then it will be '1'
    const { sort } = this.$route.query;
    this.sort = sort === '1' || sort === '2' ? sort : '1';

    this.song = snapshot.data();
    this.getComments();
  },
  methods: {
    async addComment(values, { resetForm }) {
      this.comment_in_submission = true;
      this.comment_show_alert = true;
      this.comment_alert_variant = 'bg-blue-500';
      this.comment_alert_message = 'Please wait! Your comment is being submitted';

      //   sending the comment to db
      const comment = {
        content: values.comment,
        createdAt: new Date().toString(),
        songID: this.$route.params.songID,
        userID: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
      };

      try {
        await commentsCollection.add(comment);
        this.song.comment_count += 1;
        await songsCollection.doc(this.$route.params.songID).update({
          comment_count: this.song.comment_count,
        });
        //updating alert box
        this.comment_in_submission = false;
        this.comment_alert_variant = 'bg-green-500';
        this.comment_alert_message = 'Success';

        // clearing out the form and updating comments list
        resetForm();
        this.getComments();
        // clearing out the alert after 2 seconds
        setTimeout(() => {
          this.comment_show_alert = false;
        }, 2000);
      } catch (error) {
        this.comment_in_submission = false;
        this.comment_alert_variant = 'bg-red-500';
        this.comment_alert_message = 'Something went wrong! Please try again';
      }
    },
    async getComments() {
      const snapshots = await commentsCollection
        .where('songID', '==', this.$route.params.songID)
        .get();

      // resetting the comments array to avoid duplicate comments
      this.comments = [];

      snapshots.forEach((document) => {
        this.comments.push({
          docID: document.id,
          ...document.data(),
        });
      });
    },
    ...mapActions(usePlayerStore, ['newSong']),
  },
  watch: {
    sort(newVal) {
      if (newVal === this.$route.query.sort) {
        return;
      }
      this.$router.push({
        query: {
          sort: newVal,
        },
      });
    },
  },
};
</script>
