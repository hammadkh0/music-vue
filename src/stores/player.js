import { Howl } from 'howler';
import { defineStore } from 'pinia';
import { formatTime } from '../includes/helper';

export default defineStore('player', {
  state: () => ({
    current_song: {},
    sound: {},
    seek: '00:00',
    duration: '00:00',
    playerProgress: '0%',
  }),
  actions: {
    async newSong(song) {
      if (this.sound instanceof Howl) {
        // unload will pause the audio and remove instance of the sound from memory
        this.sound.unload();
      }
      this.current_song = song;

      this.sound = new Howl({
        src: [song.url],
        html5: true,
      });
      this.sound.play();
      /**
       * Howler will emit an event play when the audio is being played. We can listen to this
       */
      this.sound.on('play', () => {
        /**
         * The requestAnimationFrame is a window function in JS that tells the browser that you wish to perform animations and that browser must call a specific function to update that animation.
         * This takes callback to invoke before the window repaint
         * You should call this method whenever you're ready to update your animation onscreen.
         * This will request that your animation function be called before the browser performs the next repaint.
         * The number of callbacks is usually 60 times per second, but will generally match the display refresh rate in most web browsers
         */
        requestAnimationFrame(this.progress);
      });
    },
    async toggleAudio() {
      // Playing is not called meaning if block will only check if this playing fuction exists. if it exists we are certain that the sound is now a Howl object and we can play/pause it.
      if (!this.sound.playing) {
        return;
      }
      // Here the fuction is invoked. This will return boolean value
      this.sound.playing() ? this.sound.pause() : this.sound.play();
    },
    progress() {
      /**
       * update the seek and duration values on every repaint. Recursively call the requestAnimationFrame if song is still playing
       */
      this.seek = formatTime(this.sound.seek());
      this.duration = formatTime(this.sound.duration());

      this.playerProgress = `${(this.sound.seek() / this.sound.duration()) * 100}%`;
      if (this.sound.playing()) {
        requestAnimationFrame(this.progress);
      }
    },
    updateSeek(event) {
      if (!this.sound.playing) {
        return;
      }
      /**
       * ClientX is not completely reliable because it gives the coordinate from the document and not the element which emitted the event.
       * Document=2000px, Timeline=1000px, click in the middle: clientX = 1000px (not 500px).
       *
       * x is the distance to the left of the element from the document.
       * subtract clientX from the x to get the exact coordinate of mouse click (our event)
       */
      const { x, width } = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - x;
      // calculate the amount we want to seek ahead by dividing total width by the click position
      const percentage = clickX / width;
      // to get the seconds out of the total seconds of song
      const seconds = this.sound.duration() * percentage;
      // seek will take the number of seconds as args and move the audio that many seconds ahead.
      this.sound.seek(seconds);
      // seek event is called when audio has moved position as in the above line. on this event we will update the progress bar
      this.sound.once('seek', this.progress);
    },
  },
  getters: {
    playing: (state) => {
      if (state.sound.playing) {
        return state.sound.playing();
      }
      return false;
    },
  },
});
