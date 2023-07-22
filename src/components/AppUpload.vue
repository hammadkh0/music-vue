<template>
  <div class="bg-white rounded border border-gray-200 relative flex flex-col">
    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
      <span class="card-title">Upload</span>
      <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
    </div>
    <div class="p-6">
      <!-- Upload Dropbox -->
      <div
        class="w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid"
        :class="{ 'bg-green-400 border-green-400 border-solid': is_dragover }"
        @drag.prevent.stop=""
        @dragstart.prevent.stop=""
        @dragend.prevent.stop="is_dragover = false"
        @dragover.prevent.stop="is_dragover = true"
        @dragenter.prevent.stop="is_dragover = true"
        @dragleave.prevent.stop="is_dragover = false"
        @drop.prevent.stop="uploadFile($event)"
      >
        <h5>Drop your files here</h5>
      </div>
      <input type="file" name="" id="" multiple @change="uploadFile($event)" />
      <hr class="my-6" />
      <!-- Progess Bars -->
      <div class="mb-4" v-for="upload in uploads" :key="upload.name">
        <!-- File Name -->
        <div class="font-bold text-sm" :class="upload.text_class">
          <i :class="upload.icon"></i> {{ upload.name }}
        </div>
        <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
          <!-- Inner Progress Bar -->
          <div
            class="transition-all progress-bar"
            :class="upload.variant"
            :style="{
              width: upload.current_progress + '%',
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storage, auth, songsCollection } from '../includes/firebase';
export default {
  name: 'AppUpload',
  data() {
    return {
      is_dragover: false,
      uploads: [],
    };
  },
  props: {
    addSong: {
      type: Function,
      required: true,
    },
  },
  methods: {
    uploadFile($event) {
      this.is_dragover = false;
      const files = $event.dataTransfer ? [...$event.dataTransfer.files] : [...$event.target.files];
      files.forEach((file) => {
        if (!file.type === 'audio/mpeg') return;
        const storageRef = storage.ref(); //music-app-5da5b.appspot.com
        // this will create a path relative to the parent ref. for example: music-app.../songs/example.mp3
        const songRef = storageRef.child(`songs/${file.name}`);
        const task = songRef.put(file);

        // uploadIndex is the last index of array because (push returns length of array - 1)
        const uploadIndex =
          this.uploads.push({
            task,
            current_progress: 0,
            name: file.name,
            variant: 'bg-blue-400',
            icon: 'fa fa-spinner fa-spin',
            text_class: '',
          }) - 1;
        task.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.uploads[uploadIndex].current_progress = progress;
            //   we are using arrow function so the 'this' keyword will be bound to the uploadFile funciton
          },
          //   below are the two optional functions to handle ERROR and SUCCESS states
          (error) => {
            const item = this.uploads[uploadIndex];
            item.variant = 'bg-red-400';
            item.icon = 'fa fa-times';
            item.text_class = 'text-red-400';
            console.log(error);
          },
          async () => {
            const song = {
              uid: auth.currentUser.uid,
              display_name: auth.currentUser.displayName,
              original_name: task.snapshot.ref.name,
              modified_name: task.snapshot.ref.name,
              genre: '',
              comment_count: 0,
            };
            song.url = await task.snapshot.ref.getDownloadURL();
            // adding the song to the firestore db
            const songRef = await songsCollection.add(song);
            /**
             * song ref contains different properties than the snapshot. We need snapshot because it contains the data() function that we need to get the song data.
             * So we are using .get() to get the snapshot from the refrence and passing it to the fn.
             */
            const songSnapshot = await songRef.get();
            // adding the song to the frontend
            this.addSong(songSnapshot);

            // update styling on success
            const item = this.uploads[uploadIndex];
            item.variant = 'bg-green-400';
            item.icon = 'fa fa-check';
            item.text_class = 'text-green-400';
          },
        );
      });
      console.log(files);
    },
    /**
     * METHOD 1: Cancel the uploads using refs from parent component.
     * => This will be invoked when the route changes to another route. The route guard for when the existing route is about to be leaved will be called with this function through refs.
     * => Route guards are present in the parent 'manage' component because it is defined in the routes. That is why we are using the refs to access this child function in parent
     */
    cancelUpload() {
      // this.uploads.forEach((upload) => {
      //   upload.task.cancel();
      // });
    },
  },
  /**
   * METHOD 2: Cancel the uploads by using the lifecycle methods.
   * => This will be invoked when the component is about to be umounted. The existing uploads will be canceled
   */
  beforeUnmount() {
    this.uploads.forEach((upload) => {
      upload.task.cancel();
    });
  },
};
</script>
