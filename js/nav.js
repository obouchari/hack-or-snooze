"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage(storyList.stories);
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show add story form when user click on "Add Story" */
function navAddStoryClick(evt) {
  console.debug("navAddStoryClick", evt);
  hidePageComponents();
  $addStoryForm.show();
}

$navAddStory.on("click", navAddStoryClick);

/** Handle show favorite stories */
async function navFavoritesClick(evt) {
  console.debug("loadFavorites", evt);

  hidePageComponents();
  putStoriesOnPage(currentUser.favorites);
}

$navShowFavorites.on("click", navFavoritesClick);
