"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents();
  $allStoriesList.show();
  $navAddStory.show();
  $navShowFavorites.show();

  toggleUserActionBtns();

  updateNavOnLogin();
}

function toggleUserActionBtns() {
  const stories = $allStoriesList.find("li");

  for (const story of stories) {
    const $story = $(story);
    const favoriteBtn = $story.find(".favorite-btn");
    const storyId = $story.attr("id");
    if (currentUser.isFavorite(storyId)) {
      favoriteBtn.text("Unfavorite");
      favoriteBtn.attr("data-is-fav", true);
    } else {
      favoriteBtn.text("Favorite");
      favoriteBtn.attr("data-is-fav", false);
    }

    // Only show the delete btn if the user is the poster of the story
    const deleteBtn = $story.find(".delete-btn");
    if (currentUser.username === $story.find("#username").text()) {
      deleteBtn.show();
    }

    // Only show fav/unfav buttons if user is logged in
    if (currentUser) {
      favoriteBtn.removeClass("hidden");
    } else {
      favoriteBtn.addClass("hidden");
    }
  }
}

// Handle favorite/unfavorite button click
async function handleFavoriteBtnClick(evt) {
  console.debug("handleFavoriteBtnClick", evt);

  const $btn = $(this);

  try {
    const storyId = $btn.parents("li").attr("id");
    if ($btn.text() === "Favorite") {
      await currentUser.saveFavorite(storyId);
      $btn.attr("data-is-fav", true);
      $btn.text("Unfavorite");
    } else {
      await currentUser.removeFavorite(storyId);
      $btn.attr("data-is-fav", false);
      $btn.text("Favorite");
    }
  } catch (err) {
    console.error(err);
  }
}

$allStoriesList.on("click", ".favorite-btn", handleFavoriteBtnClick);

// Handle delete button click
async function handleDeleteBtnClick(evt) {
  console.debug("handleDeleteBtnClick", evt);

  const $btn = $(this);
  const story = $btn.parents("li");
  const storyId = story.attr("id");

  try {
    await storyList.removeStory(currentUser, storyId);
    story.remove();
  } catch (err) {
    console.error(err);
  }
}

$allStoriesList.on("click", ".delete-btn", handleDeleteBtnClick);
