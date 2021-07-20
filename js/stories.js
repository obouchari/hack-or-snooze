"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage(storyList.stories);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const favoriteBtn = `<small class="favorite-btn ${
    currentUser ? "" : "hidden"
  }" data-is-fav="${currentUser?.isFavorite(story.storyId)}">${
    currentUser?.isFavorite(story.storyId) ? "Unfavorite" : "Favorite"
  }</small>`;

  const deleteBtn = `<small class="delete-btn ${
    currentUser && currentUser.username === story.username ? "" : "hidden"
  }">Delete</small>`;

  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by <span id="username">${story.username}</span></small>
        <span class="align-right">
          ${deleteBtn}
          ${favoriteBtn}
        </span>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(stories) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Handle add story form submission. */

async function handleAddStory(evt) {
  console.debug("add-story", evt);
  evt.preventDefault();

  const title = $("#story-title").val();
  const url = $("#story-url").val();
  const author = $("#story-author").val();

  // retrieve newly created story data from API and returns Story instance
  const newStory = await storyList.addStory(currentUser, {
    title,
    url,
    author,
  });

  updateUIOnStoryCreated(newStory);

  $addStoryForm.trigger("reset");
}

$addStoryForm.on("submit", handleAddStory);

/******************************************************************************
 * General UI stuff about stories
 */

/** When current user save a story, we want to add it to the UI */
function updateUIOnStoryCreated(story) {
  console.debug("updateUIOnStoryCreated", story);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  hidePageComponents();
  $allStoriesList.show();
}
