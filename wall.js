/* =====================================================================
   MESSAGE WALL
   Saves anonymous messages to a Firebase database (Firestore) and shows
   the APPROVED ones to every visitor.

   HOW IT WORKS
   1. A visitor sends an anonymous message. It is saved with approved = false,
      so nobody can see it yet.
   2. You open the Firebase console, find the message, and change
      approved from false to true.
   3. The message now appears on the wall for everyone.

   TO TURN IT ON: paste your Firebase settings into "firebaseConfig" below.
   Until you do, this file does nothing and the site works as before.
   ===================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. PASTE YOUR FIREBASE SETTINGS HERE
     Firebase console > Project settings > Your apps > Web app > "Config".
     (These values are meant to be public. What protects your data is the
     Firestore rules you set up in the console, not hiding this config.)
     --------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyD2Lin43RQ0M8avetu-iDn7diW15MBC94k",
  authDomain: "portfolio-messages-b140f.firebaseapp.com",
  projectId: "portfolio-messages-b140f",
  storageBucket: "portfolio-messages-b140f.firebasestorage.app",
  messagingSenderId: "523418918381",
  appId: "1:523418918381:web:7ef5a27a184f2d31f25be4"
};
  /* ---------------------------------------------------------------
     2. OTHER SETTINGS
     --------------------------------------------------------------- */
  const SDK_VERSION = '10.12.2';        // Firebase library version loaded from Google's CDN
  const COLLECTION = 'messages';        // name of the list of messages in Firestore
  const MAX_LENGTH = 500;               // longest message allowed (must match your Firestore rules)
  const MAX_SHOWN = 100;                // most messages shown on the wall
  const COOLDOWN_MS = 30 * 1000;        // wait time between messages from the same browser

  // Stop here if the settings are still placeholders
  const isConfigured = Object.values(firebaseConfig).every(
    (value) => value && !String(value).includes('YOUR_')
  );
  const anchor = document.getElementById('anonymous');
  if (!anchor) return;
  if (!isConfigured) {
    console.info('[Message wall] Firebase is not set up yet, so the wall is switched off. Paste your settings into wall.js.');
    return;
  }

  /* ---------------------------------------------------------------
     3. BUILD THE WALL UNDER THE ANONYMOUS MESSAGE PANEL
     --------------------------------------------------------------- */
  const wall = document.createElement('section');
  wall.className = 'wall';
  wall.setAttribute('aria-labelledby', 'wall-title');
  wall.innerHTML =
    '<h3 id="wall-title">Messages from visitors</h3>' +
    '<p class="wall-note">New messages show up here after I approve them.</p>' +
    '<p class="wall-status" id="wall-status" role="status">Loading messages...</p>' +
    '<ul class="wall-list" id="wall-list"></ul>';
  anchor.insertAdjacentElement('afterend', wall);

  const statusEl = wall.querySelector('#wall-status');
  const listEl = wall.querySelector('#wall-list');

  // Add a short note to the "message sent" screen
  const sentText = document.querySelector('#anon-success p');
  if (sentText) {
    const note = document.createElement('p');
    note.className = 'wall-pending';
    note.textContent = 'It will appear on the wall after I approve it.';
    sentText.insertAdjacentElement('afterend', note);
  }

  /* ---------------------------------------------------------------
     4. LOAD FIREBASE, THEN START
     --------------------------------------------------------------- */
  let db = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(script);
    });
  }

  const base = 'https://www.gstatic.com/firebasejs/' + SDK_VERSION + '/';

  loadScript(base + 'firebase-app-compat.js')
    .then(function () { return loadScript(base + 'firebase-firestore-compat.js'); })
    .then(function () {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      // script.js calls this function when the anonymous form is submitted
      window.saveAnonymousMessage = saveMessage;
      return loadMessages();
    })
    .catch(function (error) {
      console.error('[Message wall]', error);
      showStatus('Messages could not be loaded right now.');
    });

  /* ---------------------------------------------------------------
     5. SAVE A NEW MESSAGE (saved as "not approved" so nobody sees it yet)
     --------------------------------------------------------------- */
  function saveMessage(text) {
    let last = 0;
    try { last = Number(localStorage.getItem('anon-last-sent')) || 0; } catch (e) { /* storage blocked */ }
    if (Date.now() - last < COOLDOWN_MS) {
      return Promise.reject(new Error('Please wait a moment before sending another message.'));
    }

    return db.collection(COLLECTION).add({
      text: String(text).slice(0, MAX_LENGTH),
      approved: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      try { localStorage.setItem('anon-last-sent', String(Date.now())); } catch (e) { /* storage blocked */ }
    });
  }

  /* ---------------------------------------------------------------
     6. LOAD AND SHOW THE APPROVED MESSAGES
     --------------------------------------------------------------- */
  function loadMessages() {
    return db.collection(COLLECTION)
      .where('approved', '==', true)
      .limit(MAX_SHOWN)
      .get()
      .then(function (snapshot) {
        const items = snapshot.docs
          .map(function (doc) { return doc.data(); })
          .filter(function (data) { return typeof data.text === 'string'; })
          .map(function (data) {
            return {
              text: data.text,
              time: data.createdAt && data.createdAt.toMillis ? data.createdAt.toMillis() : 0
            };
          })
          // newest first (sorted here so Firebase does not need an extra index)
          .sort(function (a, b) { return b.time - a.time; });

        renderMessages(items);
      });
  }

  function showStatus(message) {
    statusEl.textContent = message;
    statusEl.hidden = false;
  }

  function renderMessages(items) {
    listEl.replaceChildren();

    if (items.length === 0) {
      showStatus('No messages yet. Be the first to leave one!');
      return;
    }
    statusEl.hidden = true;

    items.forEach(function (item) {
      const li = document.createElement('li');
      li.className = 'wall-item';

      // textContent (not innerHTML) so a visitor can never inject code into your page
      const text = document.createElement('p');
      text.className = 'wall-text';
      text.textContent = item.text;
      li.appendChild(text);

      if (item.time) {
        const date = document.createElement('time');
        date.className = 'wall-date';
        date.dateTime = new Date(item.time).toISOString();
        date.textContent = new Date(item.time).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        li.appendChild(date);
      }

      listEl.appendChild(li);
    });
  }
})();
