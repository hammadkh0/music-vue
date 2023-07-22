import { defineStore } from 'pinia';
import { auth, usersCollection } from '../includes/firebase';

export default defineStore('user', {
  state: () => ({
    userLoggedIn: false,
  }),
  actions: {
    async register(values) {
      const userCreds = await auth.createUserWithEmailAndPassword(values.email, values.password);
      /**
       * Wr want to create a document with the id of the newly created user. For this:
       * We need the .doc function to get the refrence for a new document. Then add the data in the document with the set() funciton
       * The usersCollection.add() function will generate a random id for the document which we do not need in this case
       */
      await usersCollection.doc(userCreds.user.uid).set({
        name: values.name,
        email: values.email,
        age: values.age,
        country: values.country,
      });
      /**
       * Update a user profile i.e., user displayName and profile image
       */
      await userCreds.user.updateProfile({
        displayName: values.name,
      });
      this.userLoggedIn = true;
    },
    async login(values) {
      await auth.signInWithEmailAndPassword(values.email, values.password);
      this.userLoggedIn = true;
    },
    async signOut() {
      await auth.signOut();
      // This will clear all user data and revoke the tokens
      this.userLoggedIn = false;
    },
  },
});
