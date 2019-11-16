import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';


console.log("*****");
console.log(process.env.REACT_APP_API_KEY,'logginh key')
console.log(process.env.REACT_APP_AUTH_DOMAIN,'logginh key')
console.log(process.env.REACT_APP_DATABASE_URL,'logginh key')
console.log(process.env.REACT_APP_PROJECT_ID,'logginh key')
console.log(process.env.REACT_APP_STORAGE_BUCKET,'logginh key')
console.log(process.env.REACT_APP_MESSAGING_SENDER_ID,'logginh key')
console.log(process.env.REACT_APP_APP_ID,'logginh key')

/* const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId:process.env.REACT_APP_APP_ID,
}; */
const config = {
  apiKey: "AIzaSyAR25l1f9EgLxgCfPaI7pZzyUSa5d-00so",
  authDomain: "omix-207f4.firebaseapp.com",
  databaseURL: "https://omix-207f4.firebaseio.com",
  projectId: "omix-207f4",
  storageBucket: "omix-207f4.appspot.com",
  messagingSenderId:"419120328473",
  appId:"1:419120328473:web:74a45730efe00a30",
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    /* Helper */

    this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.database();

    /* Social Sign In Method Provider */

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
    this.twitterProvider = new app.auth.TwitterAuthProvider();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>{
    console.log("signin with email and password called");
    return this.auth.signInWithEmailAndPassword(email, password);}

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignInWithFacebook = () =>
    this.auth.signInWithPopup(this.facebookProvider);

  doSignInWithTwitter = () =>
    this.auth.signInWithPopup(this.twitterProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
    });

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      console.log('jkk',authUser)
      
      if (authUser) {
        
      //  this.user(authUser.uid)
        //  .once('value')
          //.then(snapshot => {
           
          //  const dbUser = snapshot.val();

            // default empty roles
          //  if (!dbUser.roles) {
            //  dbUser.roles = {};
            //}
           // console.log(dbUser)
            console.log(authUser)

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
             // ...dbUser,
            };
           
            next(authUser);
         // });
      } else {
        console.log('in fallback')
        fallback();
      }
    });

  // *** User API ***

  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');

  // *** Message API ***

  message = uid => this.db.ref(`messages/${uid}`);

  messages = () => this.db.ref('messages');
}

export default Firebase;
