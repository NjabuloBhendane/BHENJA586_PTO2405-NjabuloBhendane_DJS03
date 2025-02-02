import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

// 1. Reusable function to render book preview
function renderBookPreview({ id, title, author, image }) {
  const button = document.createElement("button");
  button.classList.add("preview");
  button.setAttribute("data-preview", id);

  button.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
  return button;
}

// 2. Function to render list of books
function renderBookList(bookList) {
  const fragment = document.createDocumentFragment();
  bookList.forEach((book) => fragment.appendChild(renderBookPreview(book)));
  document.querySelector("[data-list-items]").appendChild(fragment);
}

// 3. Function to render genre options
function renderGenres() {
  const genreHtml = document.createDocumentFragment();
  const firstGenreElement = document.createElement("option");
  firstGenreElement.value = "any";
  firstGenreElement.innerText = "All Genres";
  genreHtml.appendChild(firstGenreElement);

  Object.entries(genres).forEach(([id, name]) => {
    const option = document.createElement("option");
    option.value = id;
    option.innerText = name;
    genreHtml.appendChild(option);
  });

  document.querySelector("[data-search-genres]").appendChild(genreHtml);
}

// 4. Function to render author options
function renderAuthors() {
  const authorsHtml = document.createDocumentFragment();
  const firstAuthorElement = document.createElement("option");
  firstAuthorElement.value = "any";
  firstAuthorElement.innerText = "All Authors";
  authorsHtml.appendChild(firstAuthorElement);

  Object.entries(authors).forEach(([id, name]) => {
    const option = document.createElement("option");
    option.value = id;
    option.innerText = name;
    authorsHtml.appendChild(option);
  });

  document.querySelector("[data-search-authors]").appendChild(authorsHtml);
}

// 5. Rendering the initial book list and dropdowns
renderBookList(matches.slice(0, BOOKS_PER_PAGE));
renderGenres();
renderAuthors();

// 6. Theme selection handling
function handleThemeChange(theme) {
  if (theme === "night") {
    document.documentElement.style.setProperty("--color-dark", "255, 255, 255");
    document.documentElement.style.setProperty("--color-light", "10, 10, 20");
  } else {
    document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
    document.documentElement.style.setProperty(
      "--color-light",
      "255, 255, 255"
    );
  }
}

// Handle dark/light mode based on system preference
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  document.querySelector("[data-settings-theme]").value = "night";
  handleThemeChange("night");
} else {
  document.querySelector("[data-settings-theme]").value = "day";
  handleThemeChange("day");
}

// Event Listeners
document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    handleThemeChange(theme);
    document.querySelector("[data-settings-overlay]").open = false;
  });

// 7. Handle search form submit with filtering
document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const filteredBooks = books.filter((book) => {
      const genreMatch =
        filters.genre === "any" || book.genres.includes(filters.genre);
      const titleMatch =
        filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase());
      const authorMatch =
        filters.author === "any" || book.author === filters.author;
      return genreMatch && titleMatch && authorMatch;
    });

    matches = filteredBooks;
    page = 1;
    document.querySelector("[data-list-items]").innerHTML = "";
    renderBookList(filteredBooks.slice(0, BOOKS_PER_PAGE));
    document.querySelector("[data-list-button]").disabled =
      filteredBooks.length - page * BOOKS_PER_PAGE <= 0;
    document.querySelector("[data-search-overlay]").open = false;
  });

// Handle "Show more" button
document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();
  const nextPageBooks = matches.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  );
  nextPageBooks.forEach((book) =>
    fragment.appendChild(renderBookPreview(book))
  );
  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
  document.querySelector("[data-list-button]").disabled =
    matches.length - page * BOOKS_PER_PAGE <= 0;
});

// 8. Handle book preview click
document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const button = event.target.closest("button[data-preview]");
    if (button) {
      const bookId = button.dataset.preview;
      const activeBook = books.find((book) => book.id === bookId);
      if (activeBook) {
        document.querySelector("[data-list-active]").open = true;
        document.querySelector("[data-list-blur]").src = activeBook.image;
        document.querySelector("[data-list-image]").src = activeBook.image;
        document.querySelector("[data-list-title]").innerText =
          activeBook.title;
        document.querySelector("[data-list-subtitle]").innerText = `${
          authors[activeBook.author]
        } (${new Date(activeBook.published).getFullYear()})`;
        document.querySelector("[data-list-description]").innerText =
          activeBook.description;
      }
    }
  });
