# Putting Morning Move on the Google Play Store

This guide is for the app owner, with no programming needed. Google only lets the account owner
publish, so these steps are done by you in your browser. Everything the store asks for is already
prepared in this repository.

**What's ready for you**

| Store asks for | Where it is |
|---|---|
| App icon 512×512 | `icons/icon-512.png` |
| Feature graphic 1024×500 | `store/feature-graphic-1024x500.png` |
| Phone screenshots (1080×1920) | `store/screenshot-1-home.png` … `screenshot-5-progress-dark.png` |
| App name, short and full description | `store/listing.md` |
| Privacy policy link | https://adithyag22.github.io/Morning-Exercise-/privacy.html |

**Cost and time:** a one-time **US $25** Google Play registration fee. New personal accounts must
also run a **closed test with at least 12 testers for 14 days in a row** before Google allows a
public release. Plan for roughly **3–4 weeks** in total.

---

## Step 1: Create your Google Play developer account (you, once)

1. Go to **https://play.google.com/console/signup** and sign in with your Google account.
2. Choose **"Yourself"** (a personal account).
3. Pay the $25 fee and complete identity verification with a government ID. Google may also ask
   you to confirm that you have an Android phone, through the Play Console app. Verification can
   take a few days.

## Step 2: Turn the website into an Android app file (about 10 minutes)

Morning Move is a web app. Google's recommended way to put a web app on the Play Store is a
"Trusted Web Activity": a small Android app that opens the website full-screen, like a normal
app. The free **PWABuilder** tool (made by Microsoft) builds it for you.

1. Open **https://www.pwabuilder.com** on a computer.
2. Paste the app address `https://adithyag22.github.io/Morning-Exercise-/` and press **Start**.
3. Click **Package for stores** → **Android** → **Generate package** → **Options**, and set:
   - **Package ID:** `io.github.adithyag22.morningmove`. This can never change after
     publishing.
   - **App name:** `Morning Move` · **Launcher name:** `Morning Move`
   - **App version:** `1.0.0` · **Version code:** `1`
   - **Signing key:** *Create new*. Fill in your name and organisation (your own name is fine) and
     choose passwords.
4. Click **Download**. You get a zip file containing:
   - `*.aab`: the app file you upload to Google Play;
   - `signing.keystore` and `signing-key-info.txt`: **your app's signing key and passwords**;
   - `assetlinks.json`: the ownership file for Step 3.

> ⚠️ **Keep `signing.keystore` and `signing-key-info.txt` safe forever.** Back them up to two
> places, for example Google Drive and a USB stick. Without them you can't publish updates to the
> app.

## Step 3: Prove you own the website (removes the browser address bar)

Android only shows the app full-screen if the website confirms it belongs to the app. The
confirmation file must sit at the **top** of your GitHub address:
`https://adithyag22.github.io/.well-known/assetlinks.json`. Your app lives in a sub-folder
(`/Morning-Exercise-/`), so the file needs its own small repository:

1. On GitHub, create a **new public repository** named exactly **`adithyag22.github.io`**.
2. Add two files to it:
   - an empty file named **`.nojekyll`** (without it, GitHub hides folders that start with a dot);
   - **`.well-known/assetlinks.json`**: the file from the PWABuilder zip.
3. In that repository, go to **Settings → Pages** and deploy from the `main` branch, root folder.
4. After uploading the app in Step 5, Google re-signs it with its own key. Open Play Console →
   your app → **Test and release → App integrity → App signing**, and copy the
   **SHA-256 certificate fingerprint**. Add it to `assetlinks.json` next to the existing one:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "io.github.adithyag22.morningmove",
    "sha256_cert_fingerprints": [
      "FINGERPRINT FROM PWABUILDER (already in the file)",
      "FINGERPRINT FROM PLAY CONSOLE APP SIGNING"
    ]
  }
}]
```

If this step is missing or wrong, the app still works but shows a thin browser bar at the top.

## Step 4: Create the app in Play Console

1. Play Console → **Create app**. Name: *Morning Move: 3D Home Workout*, default language English,
   **App**, **Free**. Accept the declarations.
2. **Store listing** (Grow users → Store presence → Main store listing): copy the texts from
   `store/listing.md`, then upload the icon, feature graphic and 2–5 screenshots listed above.
   Category: **Health & Fitness**. Enter a contact email; this is shown publicly on the store.
3. **App content** (Policy and programs → App content). Suggested answers for this app:
   - **Privacy policy:** `https://adithyag22.github.io/Morning-Exercise-/privacy.html`
   - **Ads:** No, the app has no ads.
   - **App access:** All functionality is available without special access (no login).
   - **Content rating:** fill in the questionnaire, category *Reference, News or Educational* /
     *Health*. Answer **No** to violence, gambling and similar questions. Expect an "Everyone" rating.
   - **Target audience:** 18 and over. This keeps the app outside the children's rules.
   - **Data safety:** "Does your app collect or share user data?" → **No**. Height, weight and
     history are stored only on the phone and are never sent anywhere.
   - **Health apps:** choose **Activity and fitness**. It isn't a medical device.
   - **Government / financial / news apps:** No.

## Step 5: Closed test with 12 testers for 14 days (required for new personal accounts)

1. **Test and release → Testing → Closed testing → Create track.** Upload the `.aab` from Step 2.
2. Add testers: create an email list with **at least 12 people** (friends and family with Android
   phones and Google accounts).
3. Send them the **opt-in link** shown on the track. Each tester must accept and install the app.
4. Keep at least 12 testers opted in for **14 days in a row**. Ask them to actually use the app
   during those days.
5. Afterwards, Play Console shows **Apply for production**. Answer the short questions about your
   test, then wait for approval (usually a few days).

## Step 6: Release

**Production → Create new release**, use the same `.aab` (or a newer one with a higher version
code), and roll out. Google reviews it, usually within a few days, and then it's on the Play Store.

---

## Updating the app later

- **Most changes need no new upload.** The Android app shows the live website, so anything pushed
  to the `claude/3d-fitness-exercise-app-2093hi` branch reaches Play Store users automatically,
  just like the website.
- **A new upload is needed** only when the app's name, icon, theme colour or package details
  change. In that case, rebuild in PWABuilder using the **same signing key** (choose *Use mine* and
  upload `signing.keystore`), raise the version code by 1, and upload it as a new release.
